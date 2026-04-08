import mongoose from 'mongoose';

const cropSchema = mongoose.Schema(
  {
    // Link to the farmer who registered it
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // --- Step 1: Crop Details ---
    cropType: { type: String, required: true },
    variety: { type: String },
    season: { type: String, required: true },
    sowingDate: { type: Date, required: true },
    expectedHarvestDate: { type: Date, required: true },
    area: { type: Number, required: true }, // in acres
    soilType: { type: String },
    irrigationType: { type: String },

    // --- Step 2: Location & Proof ---
    village: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    gpsCoordinates: { type: String, required: true },
    cropImage: { type: String, required: true }, // Cloudinary URL
    landDocument: { type: String },              // Optional Cloudinary URL (7/12 doc)

    // --- Step 3: Yield & Sales ---
    expectedYield: { type: Number, required: true }, // in quintals
    sellToGovt: { type: Boolean, default: false },
    sellingQuantity: { type: Number },
    preferredCenter: { type: String },  // Free-text mandi name entered by farmer
    sellingPeriod: { type: String },

    // --- Step 3: Bank Details (for MSP payment transfer) ---
    bankAccountName:   { type: String },
    bankAccountNumber: { type: String },
    bankIFSC:          { type: String },
    bankName:          { type: String },

    // System Status
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Crop', cropSchema);