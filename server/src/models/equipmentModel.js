import mongoose from 'mongoose';

const equipmentSchema = mongoose.Schema(
  {
    // Link the equipment to the user who listed it
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: { type: String, required: true }, // e.g., "John Deere 5050D"
    category: { type: String, required: true }, // "Tractor" or "Drone"
    
    // Specs
    power: { type: String, required: true }, // "50 HP"
    
    // Enum to restrict and allow specific fuel types
    fuel: { 
      type: String, 
      required: true,
      enum: ['Diesel', 'Petrol', 'Electric', 'Other'] 
    },  
    
    year: { type: String, required: true },  // "2024"
    price: { type: Number, required: true }, // Daily Rental Price
    location: { type: String, required: true }, // e.g., "Nagpur"
    
    // Images
    image: { type: String, required: true }, // Cloudinary URL

    // 🔥 NEW: Added availability status for the booking system
    isAvailable: { type: Boolean, default: true },
    
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  {
    timestamps: true, // Automatically creates 'createdAt' and 'updatedAt'
  }
);

const Equipment = mongoose.model('Equipment', equipmentSchema);

export default Equipment;