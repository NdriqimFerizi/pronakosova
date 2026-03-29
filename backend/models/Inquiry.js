const mongoose = require('mongoose');
const S = new mongoose.Schema({
  listing:{ type:mongoose.Schema.Types.ObjectId, ref:'Listing', required:true },
  fromUser:{ type:mongoose.Schema.Types.ObjectId, ref:'User', default:null },
  guestName:{ type:String,default:'' }, guestEmail:{ type:String,default:'' }, guestPhone:{ type:String,default:'' },
  toUser:{ type:mongoose.Schema.Types.ObjectId, ref:'User', required:true },
  message:{ type:String, required:true, maxlength:1000 }, isRead:{ type:Boolean, default:false },
},{ timestamps:true });
module.exports = mongoose.model('Inquiry', S);
