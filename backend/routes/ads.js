const r=require('express').Router(),Ad=require('../models/Ad'),{protect,authorize}=require('../middleware/auth');
r.get('/',async(req,res,next)=>{ try{ const f={isActive:true,startDate:{$lte:new Date()},endDate:{$gte:new Date()}}; if(req.query.slot) f.slot=req.query.slot; res.json({success:true,ads:await Ad.find(f)}); }catch(e){next(e);} });
r.post('/:id/click',async(req,res,next)=>{ try{ await Ad.findByIdAndUpdate(req.params.id,{$inc:{clicks:1}}); res.json({success:true}); }catch(e){next(e);} });
r.use(protect,authorize('admin'));
r.post('/',async(req,res,next)=>{ try{ res.status(201).json({success:true,ad:await Ad.create(req.body)}); }catch(e){next(e);} });
r.put('/:id',async(req,res,next)=>{ try{ res.json({success:true,ad:await Ad.findByIdAndUpdate(req.params.id,req.body,{new:true})}); }catch(e){next(e);} });
r.delete('/:id',async(req,res,next)=>{ try{ await Ad.findByIdAndDelete(req.params.id); res.json({success:true}); }catch(e){next(e);} });
module.exports=r;
