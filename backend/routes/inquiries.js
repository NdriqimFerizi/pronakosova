const r=require('express').Router(),c=require('../controllers/inquiryController');
const{protect,optionalAuth}=require('../middleware/auth');
r.post('/',optionalAuth,c.sendInquiry); r.get('/my',protect,c.getMyInquiries); r.put('/:id/read',protect,c.markRead);
module.exports=r;
