const mongoose = require('mongoose'), bcrypt = require('bcryptjs');
const S = new mongoose.Schema({
  name:{ type:String, required:true, trim:true }, email:{ type:String, required:true, unique:true, lowercase:true },
  password:{ type:String, minlength:8, select:false }, googleId:{ type:String, unique:true, sparse:true },
  avatar:{ type:String, default:'' }, phone:{ type:String, default:'' }, city:{ type:String, default:'Prishtinë' },
  accountType:{ type:String, enum:['buyer','seller','company'], default:'buyer' },
  companyName:{ type:String, default:'' }, isVerified:{ type:Boolean, default:false },
  isActive:{ type:Boolean, default:true }, role:{ type:String, enum:['user','admin'], default:'user' },
  savedListings:[{ type:mongoose.Schema.Types.ObjectId, ref:'Listing' }],
},{ timestamps:true });
S.pre('save', async function(n){ if(!this.isModified('password')||!this.password) return n(); this.password=await bcrypt.hash(this.password,12); n(); });
S.methods.toJSON = function(){ const o=this.toObject(); delete o.password; delete o.__v; return o; };
module.exports = mongoose.model('User', S);
