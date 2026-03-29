const mongoose = require('mongoose'), slugify = require('slugify');
const S = new mongoose.Schema({
  name:{ type:String, required:true, unique:true, trim:true }, slug:{ type:String, unique:true },
  description:{ type:String, default:'' }, logo:{ url:{ type:String,default:'' }, publicId:{ type:String,default:'' } },
  phone:{ type:String,default:'' }, email:{ type:String,default:'' }, website:{ type:String,default:'' },
  cities:[String], address:{ type:String,default:'' },
  owner:{ type:mongoose.Schema.Types.ObjectId, ref:'User', required:true },
  isVerified:{ type:Boolean,default:false }, isActive:{ type:Boolean,default:true }, featured:{ type:Boolean,default:false }, foundedYear:Number,
},{ timestamps:true, toJSON:{ virtuals:true }, toObject:{ virtuals:true } });
S.index({ name:'text' });
S.pre('save', function(n){ if(!this.isModified('name')) return n(); this.slug=slugify(this.name,{lower:true,strict:true})+'-'+Date.now(); n(); });
S.virtual('listingsCount',{ ref:'Listing', localField:'_id', foreignField:'builder', count:true });
module.exports = mongoose.model('Builder', S);
