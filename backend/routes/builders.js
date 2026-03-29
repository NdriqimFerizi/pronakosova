const r=require('express').Router(),c=require('../controllers/builderController');
const{protect,authorize}=require('../middleware/auth'),{uploadLogo}=require('../config/cloudinary');
r.get('/',c.getBuilders); r.get('/:id',c.getBuilder);
r.post('/',protect,authorize('company','admin'),uploadLogo,c.createBuilder);
r.put('/:id',protect,uploadLogo,c.updateBuilder);
module.exports=r;
