const r=require('express').Router(),c=require('../controllers/authController'),{protect}=require('../middleware/auth');
r.post('/register',c.register); r.post('/login',c.login);
r.get('/google',c.googleAuth); r.get('/google/callback',c.googleCallback);
r.post('/logout',protect,c.logout); r.get('/me',protect,c.getMe); r.put('/me',protect,c.updateProfile); r.put('/change-password',protect,c.changePassword);
module.exports=r;
