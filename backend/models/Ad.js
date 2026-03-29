const mongoose = require('mongoose');
const S = new mongoose.Schema({
  title:String, imageUrl:String, linkUrl:String,
  slot:{ type:String, enum:['hero-top','sidebar-1','sidebar-2','listings-bottom','footer-top'] },
  advertiser:{ name:String, email:String }, startDate:Date, endDate:Date,
  isActive:{ type:Boolean,default:true }, impressions:{ type:Number,default:0 }, clicks:{ type:Number,default:0 },
},{ timestamps:true });
module.exports = mongoose.model('Ad', S);
