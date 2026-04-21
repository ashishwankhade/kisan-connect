import User from '../models/User.js';
import Crop from '../models/Crop.js';
import Land from '../models/Land.js';
import Equipment from '../models/equipmentModel.js';
import Request from '../models/requestModel.js';
import sendWhatsAppMessage from '../utils/whatsappNotify.js';

// ============================================================
// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// ============================================================
export const getDashboardStats = async (req, res) => {
  try {
    const totalFarmers = await User.countDocuments({ role: { $ne: 'admin' } });
    const totalCrops = await Crop.countDocuments();
    const pendingCrops = await Crop.countDocuments({ verificationStatus: 'Pending' });

    const procurementStats = await Crop.aggregate([
      { $match: { sellToGovt: true } },
      { $group: { _id: null, totalGovtYield: { $sum: '$sellingQuantity' } } },
    ]);
    const totalProcurement =
      procurementStats.length > 0 ? procurementStats[0].totalGovtYield : 0;

    const totalLands = await Land.countDocuments();
    const totalEquipment = await Equipment.countDocuments();
    const availableLands = await Land.countDocuments({ isAvailable: true });

    res.json({
      totalFarmers,
      totalCrops,
      pendingCrops,
      totalProcurement,
      totalLands,
      totalEquipment,
      availableLands,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// @desc    Approve or Reject a Crop Registration
// @route   PUT /api/admin/crops/:id/verify
// 📲 Notifies: FARMER — their crop was verified or rejected
//
// NOTE: This is the SINGLE canonical verifyCrop handler.
// The duplicate in cropController.js has been removed.
// ============================================================
export const verifyCrop = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Verified', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be Verified or Rejected.' });
    }

    const crop = await Crop.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: status },
      { new: true }
    ).populate('farmer', 'name phone');

    if (!crop) return res.status(404).json({ message: 'Crop not found' });

    // 📲 Notify FARMER: crop verification result
    if (crop.farmer?.phone) {
      await sendWhatsAppMessage(
        crop.farmer.phone,
        'crop_verified',
        [crop.farmer.name, crop.cropType, status]
      );
    }

    res.json({ message: `Crop successfully ${status}`, crop });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// @desc    Get all crops marked for Government Procurement
// @route   GET /api/admin/procurement
//
// FIX: Removed the `.select()` string that was conflicting with
// `.populate()`. Mongoose merges field projection with populate
// internally — using both an explicit select() AND populate()
// for the same query can silently drop populated subdoc fields
// in some Mongoose versions. Since NO schema field has
// `select: false`, omitting `.select()` returns all fields
// including the four bank fields, which is what we want.
//
// If you ever need to restrict fields here in future, use a
// lean projection object passed as the third arg to find():
//   Crop.find(filter, { password: 0 })  // exclude only
// rather than chaining .select() after .populate().
// ============================================================
export const getProcurementList = async (req, res) => {
  try {
    const procurementCrops = await Crop.find({ sellToGovt: true })
      .populate('farmer', 'name phone district')
      .sort({ sellingPeriod: 1 })
      .lean(); // lean() returns plain JS objects — faster, and avoids
               // any Mongoose getter that might strip unlisted fields.

    res.json(procurementCrops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// @desc    Get ALL crops (Admin / Government Dashboard)
// @route   GET /api/crops   ← used by CropVerification.jsx
//
// FIX: Added .lean() for consistent field inclusion.
// Bank fields (bankAccountName, bankAccountNumber, bankIFSC,
// bankName) are stored on the Crop document and have no
// `select: false` in the schema, so they are returned as-is.
// The frontend hasBankDetails() helper now checks all four
// fields with .trim() so empty-string values don't falsely
// show the bank panel.
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
// @desc    Get all Farmers (non-admin users)
// @route   GET /api/admin/farmers
// ============================================================
export const getAllFarmers = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const [farmers, total] = await Promise.all([
      User.find({ role: { $ne: 'admin' } })
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments({ role: { $ne: 'admin' } }),
    ]);

    res.json({
      farmers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// @desc    Marketplace: Get all Lands & Equipment
// @route   GET /api/admin/marketplace
// ============================================================
export const getMarketplaceData = async (req, res) => {
  try {
    const lands = await Land.find({}).populate('owner', 'name phone').sort({ createdAt: -1 });
    const equipment = await Equipment.find({}).populate('user', 'name phone').sort({ createdAt: -1 });
    res.json({ lands, equipment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// @desc    Marketplace: Delete a Land or Equipment listing
// @route   DELETE /api/admin/marketplace/:type/:id
// ============================================================
export const deleteMarketplaceItem = async (req, res) => {
  try {
    const { type, id } = req.params;

    if (type === 'land') {
      const land = await Land.findByIdAndDelete(id);
      if (!land) return res.status(404).json({ message: 'Land not found' });

      await Request.updateMany(
        { land: id, status: 'Pending' },
        { status: 'Rejected' }
      );

    } else if (type === 'equipment') {
      const equipment = await Equipment.findByIdAndDelete(id);
      if (!equipment) return res.status(404).json({ message: 'Equipment not found' });

      await Request.updateMany(
        { equipment: id, status: 'Pending' },
        { status: 'Rejected' }
      );

    } else {
      return res.status(400).json({ message: 'Invalid item type. Use land or equipment.' });
    }

    res.json({ message: `${type} listing deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};