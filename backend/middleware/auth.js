const jwt = require('jsonwebtoken');
const User = require('../models/User');
exports.protect = async (req, res, next) => {
  let t = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : req.cookies?.token;
  if (!t) return res.status(401).json({ success:false, message:'Hyni së pari.' });
  try { req.user = await User.findById(jwt.verify(t, process.env.JWT_SECRET).id); next(); }
  catch(_) { return res.status(401).json({ success:false, message:'Sesioni ka skaduar.' }); }
};
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role) && !roles.includes(req.user.accountType))
    return res.status(403).json({ success:false, message:'Nuk keni leje.' });
  next();
};
exports.optionalAuth = async (req, res, next) => {
  let t = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : req.cookies?.token;
  if (t) { try { req.user = await User.findById(jwt.verify(t, process.env.JWT_SECRET).id); } catch(_){} }
  next();
};
