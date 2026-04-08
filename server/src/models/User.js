import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  district: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['farmer', 'admin'], default: 'farmer' }
}, {
  timestamps: true
});

// 🔥 FIX: Remove 'next' from arguments and calls
// When using 'async', Mongoose waits for the function to finish automatically.
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return; // Just return, do not call next()
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.model('User', userSchema);