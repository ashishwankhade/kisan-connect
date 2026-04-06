import Equipment from '../models/equipmentModel.js';
import User from '../models/User.js';
import sendWhatsAppMessage from '../utils/whatsappNotify.js';

// ============================================================
// @desc    Fetch all available equipment (Public)
// @route   GET /api/equipment
// ============================================================
export const getEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find({}).sort({ createdAt: -1 });
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// ============================================================
// @desc    Create new equipment listing (Protected)
// @route   POST /api/equipment
// 📲 Notifies: OWNER — their equipment listing is now live
// ============================================================
export const createEquipment = async (req, res) => {
  try {
    const { name, category, power, fuel, year, price, location } = req.body;

    let imageUrl = null;
    if (req.file) {
      imageUrl = req.file.path || req.file.secure_url;
    }

    if (!imageUrl) {
      return res.status(400).json({ message: 'Please upload a valid image' });
    }

    const equipment = new Equipment({
      user: req.user._id,
      name,
      category,
      power,
      fuel,
      year,
      price,
      location,
      image: imageUrl,
    });

    const createdEquipment = await equipment.save();

    // 📲 Notify OWNER — equipment listing is live
    //    Template: equipment_listed
    //    "Hi {{ownerName}}! Your equipment '{{name}}' has been listed on AgriSmart at ₹{{price}}/day."
    await sendWhatsAppMessage(
      req.user.phone,
      'equipment_listed',
      [req.user.name, name, price]
    );

    res.status(201).json(createdEquipment);
  } catch (error) {
    console.error('Error creating equipment:', error);
    res.status(400).json({ message: error.message });
  }
};

// ============================================================
// @desc    Get logged-in user's equipment listings (Protected)
// @route   GET /api/equipment/user
// ============================================================
export const getMyEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// @desc    Update an equipment listing (Protected)
// @route   PUT /api/equipment/:id
// ============================================================
export const updateEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    if (equipment.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to edit this equipment' });
    }

    equipment.name     = req.body.name     || equipment.name;
    equipment.category = req.body.category || equipment.category;
    equipment.power    = req.body.power    || equipment.power;
    equipment.fuel     = req.body.fuel     || equipment.fuel;
    equipment.year     = req.body.year     || equipment.year;
    equipment.price    = req.body.price    || equipment.price;
    equipment.location = req.body.location || equipment.location;

    if (req.body.isAvailable !== undefined) {
      equipment.isAvailable = req.body.isAvailable;
    }

    if (req.file) {
      const imageUrl = req.file.path || req.file.secure_url;
      if (imageUrl) equipment.image = imageUrl;
    }

    const updatedEquipment = await equipment.save();
    res.json(updatedEquipment);
  } catch (error) {
    console.error('Error updating equipment:', error);
    res.status(400).json({ message: error.message });
  }
};

// ============================================================
// @desc    Delete an equipment listing (Protected)
// @route   DELETE /api/equipment/:id
// ============================================================
export const deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    if (equipment.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this equipment' });
    }

    await equipment.deleteOne();
    res.json({ message: 'Equipment removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
