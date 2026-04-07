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
    // FIX: Use verificationStatus consistently (not 'status')
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

    // FIX: Use verificationStatus (not 'status') — consistent with getDashboardStats
    // and the Crop model's field naming used throughout the admin layer.
    const crop = await Crop.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: status },
      { new: true }
    ).populate('farmer', 'name phone');

    if (!crop) return res.status(404).json({ message: 'Crop not found' });

    // 📲 Notify FARMER: crop verification result
    //    Template: crop_verified
    //    "Hi {{farmerName}}! Your crop '{{cropType}}' has been {{status}} by the AgriSmart team."
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
// ============================================================
export const getProcurementList = async (req, res) => {
  try {
    const procurementCrops = await Crop.find({ sellToGovt: true })
      .populate('farmer', 'name phone district')
      .sort({ sellingPeriod: 1 });
    res.json(procurementCrops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// @desc    Get all Farmers (non-admin users)
// @route   GET /api/admin/farmers
// FIX: Added pagination to prevent full-collection scans as
// the user base grows. Use ?page=1&limit=20 in the request.
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
    // FIX: Equipment uses 'user' as the owner ref field (different from Land's 'owner').
    // Documented here explicitly so future devs don't get surprised.
    const equipment = await Equipment.find({}).populate('user', 'name phone').sort({ createdAt: -1 });
    res.json({ lands, equipment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// @desc    Marketplace: Delete a Land or Equipment listing
// @route   DELETE /api/admin/marketplace/:type/:id
// FIX: Now also cancels any pending Requests for the deleted
// item so they don't become orphan documents.
// ============================================================
export const deleteMarketplaceItem = async (req, res) => {
  try {
    const { type, id } = req.params;

    if (type === 'land') {
      const land = await Land.findByIdAndDelete(id);
      if (!land) return res.status(404).json({ message: 'Land not found' });

      // Cancel all pending requests for this land
      await Request.updateMany(
        { land: id, status: 'Pending' },
        { status: 'Rejected' }
      );

    } else if (type === 'equipment') {
      const equipment = await Equipment.findByIdAndDelete(id);
      if (!equipment) return res.status(404).json({ message: 'Equipment not found' });

      // Cancel all pending requests for this equipment
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