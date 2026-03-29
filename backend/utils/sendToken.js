const jwt = require('jsonwebtoken');
module.exports = (user, code, res) => {
  const token = jwt.sign({ id:user._id, role:user.role, accountType:user.accountType }, process.env.JWT_SECRET, { expiresIn:'7d' });
  res.status(code).cookie('token', token, { expires:new Date(Date.now()+7*24*60*60*1000), httpOnly:true, secure:process.env.NODE_ENV==='production', sameSite:process.env.NODE_ENV==='production'?'None':'Lax' }).json({ success:true, token, user });
};
