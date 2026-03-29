const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
const mk = (folder) => new CloudinaryStorage({ cloudinary, params: { folder, allowed_formats: ['jpg','jpeg','png','webp'] } });
const uploadListingImages = multer({ storage: mk('pronakosova/listings'), limits: { fileSize: 5*1024*1024 } }).array('images', 10);
const uploadLogo          = multer({ storage: mk('pronakosova/logos'),    limits: { fileSize: 2*1024*1024 } }).single('logo');
const deleteImage = async (id) => { try { await cloudinary.uploader.destroy(id); } catch(e) { console.error(e); } };
module.exports = { cloudinary, uploadListingImages, uploadLogo, deleteImage };
