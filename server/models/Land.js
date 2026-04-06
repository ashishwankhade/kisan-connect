import mongoose from 'mongoose';

const landSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  area: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  soilType: { type: String, required: true, trim: true },
  waterSource: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  
  // Cloudinary image URL
  image: { type: String }, 
  
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },

  // Used by the booking system to hide rented land
  isAvailable: { type: Boolean, default: true },
  
  // Fallback color for UI if image fails/is missing
  imageClass: { type: String, default: "bg-green-50" } 
}, {
  timestamps: true
});

export default mongoose.model('Land', landSchema);