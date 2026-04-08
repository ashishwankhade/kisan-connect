import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // 1. Debug: Check if the variable exists (keeps it safe, doesn't print password)
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from .env file");
    }

    // 2. Connect using the variable
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;