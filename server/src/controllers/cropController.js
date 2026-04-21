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
      // Bank details for MSP payment
      bankAccountName, bankAccountNumber, bankIFSC, bankName,
    } = req.body;

    // 3. Validate bank details are provided when farmer opts to sell to govt
    //    FormData sends booleans as strings, so compare against 'true'
    if (sellToGovt === 'true') {
      if (!bankAccountName || !bankAccountNumber || !bankIFSC || !bankName) {
        return res.status(400).json({
          message: 'Bank account details are required when opting to sell to government at MSP.',
        });
      }
    }

    // 4. Create the crop record
    //    Bank fields are saved unconditionally — they will be null/undefined
    //    when the farmer did not opt for govt. sale, which is correct.
    const crop = await Crop.create({
      farmer: req.user.id,
      cropType, variety, season, sowingDate, expectedHarvestDate, area,
      soilType, irrigationType, village, district, state, gpsCoordinates,
      expectedYield,
      sellToGovt: sellToGovt === 'true',
      sellingQuantity: sellingQuantity || null,
      preferredCenter: preferredCenter || null,
      sellingPeriod:   sellingPeriod   || null,
      cropImage:   cropImageUrl,
      landDocument: landDocUrl,
      // Bank details — stored as null when not provided so
      // the admin panel correctly shows "—" vs "⚠ Missing"
      bankAccountName:   bankAccountName?.trim()   || null,
      bankAccountNumber: bankAccountNumber?.trim() || null,
      bankIFSC:          bankIFSC?.trim()          || null,
      bankName:          bankName?.trim()           || null,
    });

    // 5. Fetch full farmer record to guarantee phone/name are available
    const farmer = await User.findById(req.user.id).select('name phone');

    // 6. 📲 Notify FARMER — crop registered, pending verification
    if (farmer?.phone) {
      await sendWhatsAppMessage(
        farmer.phone,
        'crop_registered',
        [farmer.name, cropType]
      );
    }

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
    const crops = await Crop.find({ farmer: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(crops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// @desc    Get ALL crops (Admin / Government Dashboard)
// @route   GET /api/crops
//
// FIX: Added .lean() so Mongoose returns plain JS objects and
// never omits any schema field — including the four bank fields
// (bankAccountName, bankAccountNumber, bankIFSC, bankName).
// These fields have no select:false in the schema so they are
// always included in the response when present on the document.
// ============================================================
export const getAllCrops = async (req, res) => {
  try {
    const crops = await Crop.find({})
      .populate('farmer', 'name phone district')
      .sort({ createdAt: -1 })
      .lean();
    res.json(crops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// REMOVED: verifyCrop — this responsibility belongs exclusively
// in adminController.js behind admin-only middleware.
// Route: PUT /api/admin/crops/:id/verify
// ============================================================