const mongoose = require('mongoose'), slugify = require('slugify');
const S = new mongoose.Schema({
  title:{ type:String, required:true, trim:true }, slug:{ type:String, unique:true },
  description:{ type:String, required:true },
  listingType:{ type:String, required:true, enum:['shitet','me-qira','i-ri'] },
  propertyType:{ type:String, required:true, enum:['apartament','shtepi','vila','zyre','dyqan','garazh','toke','tjeter'] },
  price:{ type:Number, required:true, min:0 }, priceType:{ type:String, enum:['total','per-muaj','per-m2'], default:'total' },
  negotiable:{ type:Boolean, default:false }, city:{ type:String, required:true }, neighborhood:{ type:String, default:'' },
  address:{ type:String, default:'' }, area:Number, rooms:Number, bathrooms:Number, floor:Number, totalFloors:Number, yearBuilt:Number,
  parking:{ type:Boolean, default:false }, furnished:{ type:String, enum:['pa-mobilim','gjysme-mobiluar','plotesisht-mobiluar','nuk-aplikohet'], default:'nuk-aplikohet' },
  amenities:{ elevator:Boolean, balcony:Boolean, garden:Boolean, pool:Boolean, security:Boolean, centralHeating:Boolean, airConditioning:Boolean, internetIncluded:Boolean },
  images:[{ url:String, publicId:String }], coverImageIndex:{ type:Number, default:0 },
  postedBy:{ type:mongoose.Schema.Types.ObjectId, ref:'User', required:true },
  builder:{ type:mongoose.Schema.Types.ObjectId, ref:'Builder', default:null },
  status:{ type:String, enum:['aktive','shitur','hequr','ne-pritje'], default:'aktive' },
  featured:{ type:Boolean, default:false }, views:{ type:Number, default:0 },
  contactPhone:{ type:String, default:'' }, contactEmail:{ type:String, default:'' },
},{ timestamps:true, toJSON:{ virtuals:true }, toObject:{ virtuals:true } });
S.index({ city:1 }); S.index({ listingType:1 }); S.index({ status:1 }); S.index({ title:'text', description:'text' });
S.pre('save', function(n){ if(!this.isModified('title')) return n(); this.slug=slugify(this.title,{lower:true,strict:true})+'-'+Date.now(); n(); });
S.virtual('priceFormatted').get(function(){ const f='€'+Number(this.price).toLocaleString('de-DE'); return this.priceType==='per-muaj'?f+' / muaj':this.priceType==='per-m2'?f+' / m²':f; });
S.virtual('coverImage').get(function(){ return this.images?.[this.coverImageIndex]?.url||this.images?.[0]?.url||null; });
module.exports = mongoose.model('Listing', S);
