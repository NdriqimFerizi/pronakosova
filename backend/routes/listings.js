const r=require('express').Router(),c=require('../controllers/listingController');
const{protect,authorize,optionalAuth}=require('../middleware/auth');
const{uploadListingImages}=require('../config/cloudinary');
r.get('/',c.getListings); r.get('/stats/cities',c.getCityStats); r.get('/:id',optionalAuth,c.getListing);
r.post('/',protect,authorize('seller','company','admin'),uploadListingImages,c.createListing);
r.put('/:id',protect,uploadListingImages,c.updateListing); r.delete('/:id',protect,c.deleteListing);
r.post('/:id/save',protect,c.toggleSaveListing);
module.exports=r;
