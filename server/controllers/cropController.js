import Crop from '../models/Crop.js';
import User from '../models/User.js';
import sendWhatsAppMessage from '../utils/whatsappNotify.js';

// ============================================================
// @desc    Register a new crop
// @route   POST /api/crops
// 📲 Notifies: FARMER — crop registered successfully
// ============================================================
export const registerCrop = async (req, res) => {
  try {
    // 1. Ensure the required crop image was uploaded
    if (!req.files || !req.files['cropImage']) {
      return res.status(400).json({ message: 'Crop image is required for verification.' });
    }

    // Safely extract Cloudinary URLs
    const cropImageUrl =
      req.files['cropImage'][0].path || req.files['cropImage'][0].secure_url;

    let landDocUrl = null;
    if (req.files['landDocument']) {
      landDocUrl =
        req.files['landDocument'][0].path || req.files['landDocument'][0].secure_url;
    }

    // 2. Extract text data from request body
    const {
      cropType, variety, season, sowingDate, expectedHarvestDate, area,
      soilType, irrigationType, village, district, state, gpsCoordinates,
      expectedYield, sellToGovt, sellingQuantity, preferredCenter, sellingPeriod,
    } = req.body;

    // 3. Create the crop record
    const crop = await Crop.create({
      farmer: req.user.id,
      cropType, variety, season, sowingDate, expectedHarvestDate, area,
      soilType, irrigationType, village, district, state, gpsCoordinates,
      expectedYield,
      sellToGovt: sellToGovt === 'true',
      sellingQuantity,
      preferredCenter,
      sellingPeriod,
      cropImage: cropImageUrl,
      landDocument: landDocUrl,
    });

    // 4. 📲 Notify FARMER — crop registered, pending verification
    //    Template: crop_registered
    //    "Hi {{farmerName}}! Your crop '{{cropType}}' has been registered. Our team will verify it shortly."
    await sendWhatsAppMessage(
      req.user.phone,
      'crop_registered',
      [req.user.name, cropType]
    );

    res.status(201).json(crop);
  } catch (error) {
    console.error('Crop Registration Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// @desc    Get all crops registered by the logged-in farmer
// @route   GET /api/crops/mycrops
// ============================================================
export const getMyCrops = async (req, res) => {
  try {
    const crops = await Crop.find({ farmer: req.user.id }).sort({ createdAt: -1 });
    res.json(crops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// @desc    Get ALL crops (Admin / Government Dashboard)
// @route   GET /api/crops
// ============================================================
export const getAllCrops = async (req, res) => {
  try {
    const crops = await Crop.find({})
      .populate('farmer', 'name phone district')
      .sort({ createdAt: -1 });
    res.json(crops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// @desc    Admin verifies or rejects a crop registration
// @route   PUT /api/crops/:id/verify
// 📲 Notifies: FARMER — their crop was Verified or Rejected
// ============================================================
export const verifyCrop = async (req, res) => {
  try {
    const { status } = req.body; // Expected: 'Verified' | 'Rejected'

    if (!['Verified', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Verified or Rejected' });
    }

    const crop = await Crop.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    // Update the crop status
    crop.status = status;
    const updatedCrop = await crop.save();

    // Fetch the farmer to get phone + name
    const farmer = await User.findById(crop.farmer);

    // 📲 Notify FARMER — crop verified or rejected by admin
    //    Template: crop_verified
    //    "Hi {{farmerName}}! Your crop '{{cropType}}' has been {{status}} by the AgriSmart team."
    await sendWhatsAppMessage(
      farmer?.phone,
      'crop_verified',
      [farmer?.name, crop.cropType, status]
    );

    res.json(updatedCrop);
  } catch (error) {
    console.error('Crop Verify Error:', error);
    res.status(500).json({ message: error.message });
  }
};
