const User=require('../models/User'),Listing=require('../models/Listing'),Inquiry=require('../models/Inquiry'),Builder=require('../models/Builder');

exports.getStats=async(req,res,next)=>{ try{
  const[users,listings,inquiries,builders]=await Promise.all([
    User.countDocuments(),
    Listing.countDocuments({status:'aktive'}),
    Inquiry.countDocuments(),
    Builder.countDocuments(),
  ]);
  res.json({success:true,stats:{users,listings,inquiries,builders}});
}catch(e){next(e);}};

exports.getUsers=async(req,res,next)=>{ try{
  const{page=1,limit=20,search}=req.query;
  const f=search?{$or:[{name:{$regex:search,$options:'i'}},{email:{$regex:search,$options:'i'}}]}:{};
  const total=await User.countDocuments(f);
  const users=await User.find(f).sort({createdAt:-1}).skip((+page-1)*+limit).limit(+limit);
  res.json({success:true,total,totalPages:Math.ceil(total/+limit),currentPage:+page,users});
}catch(e){next(e);}};

exports.updateUser=async(req,res,next)=>{ try{
  const{role,accountType,isActive}=req.body;
  const u=await User.findByIdAndUpdate(req.params.id,{...(role&&{role}),...(accountType&&{accountType}),...(isActive!==undefined&&{isActive})},{new:true});
  if(!u) return res.status(404).json({success:false,message:'Përdoruesi nuk u gjet.'});
  res.json({success:true,user:u});
}catch(e){next(e);}};

exports.getListings=async(req,res,next)=>{ try{
  const{page=1,limit=20,status,search}=req.query;
  const f={};
  if(status) f.status=status; else f.status={$ne:'hequr'};
  if(search) f.$text={$search:search};
  const total=await Listing.countDocuments(f);
  const listings=await Listing.find(f).populate('postedBy','name email').sort({createdAt:-1}).skip((+page-1)*+limit).limit(+limit);
  res.json({success:true,total,totalPages:Math.ceil(total/+limit),currentPage:+page,listings});
}catch(e){next(e);}};

exports.updateListing=async(req,res,next)=>{ try{
  const{featured,status}=req.body;
  const l=await Listing.findByIdAndUpdate(req.params.id,{...(featured!==undefined&&{featured}),...(status&&{status})},{new:true});
  if(!l) return res.status(404).json({success:false,message:'Prona nuk u gjet.'});
  res.json({success:true,listing:l});
}catch(e){next(e);}};

exports.deleteListing=async(req,res,next)=>{ try{
  const l=await Listing.findById(req.params.id);
  if(!l) return res.status(404).json({success:false,message:'Prona nuk u gjet.'});
  l.status='hequr'; await l.save();
  res.json({success:true,message:'Prona u fshi.'});
}catch(e){next(e);}};
