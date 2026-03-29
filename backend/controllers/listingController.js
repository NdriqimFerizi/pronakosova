const Listing=require('../models/Listing');
exports.getListings=async(req,res,next)=>{
  try{
    const{city,listingType,propertyType,minPrice,maxPrice,minArea,maxArea,rooms,furnished,parking,builder,postedBy,search,sort,page=1,limit=12,featured}=req.query;
    const f={status:'aktive'};
    if(city) f.city=city; if(listingType) f.listingType=listingType; if(propertyType) f.propertyType=propertyType;
    if(builder) f.builder=builder; if(postedBy) f.postedBy=postedBy; if(featured) f.featured=featured==='true';
    if(parking==='true') f.parking=true; if(furnished) f.furnished=furnished; if(rooms) f.rooms={$gte:parseInt(rooms)};
    if(minPrice||maxPrice){f.price={};if(minPrice)f.price.$gte=+minPrice;if(maxPrice)f.price.$lte=+maxPrice;}
    if(minArea||maxArea){f.area={};if(minArea)f.area.$gte=+minArea;if(maxArea)f.area.$lte=+maxArea;}
    if(search) f.$text={$search:search};
    let s={createdAt:-1};
    if(sort==='oldest') s={createdAt:1}; if(sort==='price-asc') s={price:1}; if(sort==='price-desc') s={price:-1};
    const skip=(+page-1)*+limit, total=await Listing.countDocuments(f);
    const listings=await Listing.find(f).select('-description -amenities -__v').populate('postedBy','name avatar accountType companyName').populate('builder','name logo slug cities').sort(s).skip(skip).limit(+limit);
    res.json({success:true,count:listings.length,total,totalPages:Math.ceil(total/+limit),currentPage:+page,listings});
  }catch(e){next(e);}
};
exports.getListing=async(req,res,next)=>{
  try{
    const q=req.params.id.match(/^[0-9a-fA-F]{24}$/) ? {_id:req.params.id} : {slug:req.params.id};
    const l=await Listing.findOne(q).populate('postedBy','name avatar phone email accountType companyName').populate('builder','name logo slug phone email website cities');
    if(!l||l.status==='hequr') return res.status(404).json({success:false,message:'Prona nuk u gjet.'});
    await Listing.findByIdAndUpdate(l._id,{$inc:{views:1}});
    res.json({success:true,listing:l});
  }catch(e){next(e);}
};
exports.createListing=async(req,res,next)=>{ try{ req.body.postedBy=req.user._id; if(req.files?.length) req.body.images=req.files.map(f=>({url:f.path,publicId:f.filename})); res.status(201).json({success:true,listing:await Listing.create(req.body)}); }catch(e){next(e);} };
exports.updateListing=async(req,res,next)=>{ try{ let l=await Listing.findById(req.params.id); if(!l) return res.status(404).json({success:false,message:'Nuk u gjet.'}); if(l.postedBy.toString()!==req.user._id.toString()&&req.user.role!=='admin') return res.status(403).json({success:false,message:'Nuk keni leje.'}); if(req.files?.length) req.body.images=[...(l.images||[]),...req.files.map(f=>({url:f.path,publicId:f.filename}))]; res.json({success:true,listing:await Listing.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})}); }catch(e){next(e);} };
exports.deleteListing=async(req,res,next)=>{ try{ const l=await Listing.findById(req.params.id); if(!l) return res.status(404).json({success:false,message:'Nuk u gjet.'}); if(l.postedBy.toString()!==req.user._id.toString()&&req.user.role!=='admin') return res.status(403).json({success:false,message:'Nuk keni leje.'}); l.status='hequr'; await l.save(); res.json({success:true,message:'Prona u hoq.'}); }catch(e){next(e);} };
exports.toggleSaveListing=async(req,res,next)=>{ try{ const saved=req.user.savedListings.includes(req.params.id); await req.user.constructor.findByIdAndUpdate(req.user._id,saved?{$pull:{savedListings:req.params.id}}:{$addToSet:{savedListings:req.params.id}}); res.json({success:true,saved:!saved,message:saved?'Prona u hoq.':'Prona u ruajt.'}); }catch(e){next(e);} };
exports.getCityStats=async(req,res,next)=>{ try{ const stats=await Listing.aggregate([{$match:{status:'aktive'}},{$group:{_id:'$city',count:{$sum:1}}},{$sort:{count:-1}}]); res.json({success:true,stats}); }catch(e){next(e);} };
