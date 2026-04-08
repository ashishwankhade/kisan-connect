import multer from 'multer';
import dotenv from 'dotenv';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// 1. Load the PARENT Cloudinary library (Not v2 directly)
const cloudinary = require('cloudinary');

// 2. Load the Storage Engine
const CloudinaryStorage = require('multer-storage-cloudinary');

dotenv.config();

// 3. Configure Cloudinary
// We call .v2 here manually. This prevents the "uploader undefined" error.
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 4. Create Storage Engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary, // Pass the parent object
  params: {
    folder: 'agrismart-uploads', // The folder name in your Cloudinary dashboard
    
    // 🔥 FIX: Added 'pdf' and set resource_type to 'auto' so documents don't crash it
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'pdf'],
    resource_type: 'auto', 
  },
});

const upload = multer({ storage });

export default upload;