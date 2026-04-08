import Land from '../models/Land.js';
import sendWhatsAppMessage from '../utils/whatsappNotify.js';

// ============================================================
// @desc    Get all available land listings (Public)
// @route   GET /api/lands
// ============================================================
export const getAllLands = async (req, res) => {
  try {
    const lands = await Land.find({ isAvailable: true }).sort({ createdAt: -1 });
    res.json(lands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// @desc    List a new land (Protected)
// @route   POST /api/lands
// 📲 Notifies: OWNER — their land listing is now live
// ============================================================
export const createLand = async (req, res) => {
  try {
    const {
      title, location, area, price, soilType, waterSource,
      description, lat, lng,
    } = req.body;

    let imageUrl = null;
    if (req.file) {
      imageUrl = req.file.path || req.file.secure_url || req.file.url;
    }

    const land = await Land.create({
      owner: req.user.id,
      title,
      location,
      area,
      price,
      soilType,
      waterSource,
      description,
      image: imageUrl,
      coordinates: {
        lat: lat ? Number(lat) : null,
        lng: lng ? Number(lng) : null,
      },
      imageClass: ['bg-orange-50', 'bg-green-50', 'bg-blue-50', 'bg-amber-50'][
        Math.floor(Math.random() * 4)
      ],
    });

    // 📲 Notify OWNER — land listing is live
    //    Template: land_listed
    //    "Hi {{ownerName}}! Your land '{{title}}' ({{area}} acres) is listed on AgriSmart at ₹{{price}}/season."
    await sendWhatsAppMessage(
      req.user.phone,
      'land_listed',
      [req.user.name, title, area, price]
    );

    res.status(201).json(land);
  } catch (error) {
    console.error('Error creating land:', error);
    res.status(400).json({ message: error.message });
  }
};

// ============================================================
// @desc    Get logged-in user's own land listings (Protected)
// @route   GET /api/lands/user
// ============================================================
export const getMyLands = async (req, res) => {
  try {
    const lands = await Land.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(lands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// @desc    Update a land listing (Protected)
// @route   PUT /api/lands/:id
// ============================================================
export const updateLand = async (req, res) => {
  try {
    const land = await Land.findById(req.params.id);

    if (!land) {
      return res.status(404).json({ message: 'Land not found' });
    }

    if (land.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to edit this land' });
    }

    land.title       = req.body.title       || land.title;
    land.location    = req.body.location    || land.location;
    land.area        = req.body.area        || land.area;
    land.price       = req.body.price       || land.price;
    land.soilType    = req.body.soilType    || land.soilType;
    land.waterSource = req.body.waterSource || land.waterSource;
    land.description = req.body.description || land.description;

    if (req.body.isAvailable !== undefined) {
      land.isAvailable = req.body.isAvailable;
    }

    if (req.file) {
      const newImageUrl = req.file.path || req.file.secure_url || req.file.url;
      if (newImageUrl) {
        land.image = newImageUrl;
      } else {
        console.warn('⚠️ WARNING: File uploaded during update, but URL extraction failed.');
      }
    }

    if (req.body.lat && req.body.lng) {
      land.coordinates = {
        lat: Number(req.body.lat),
        lng: Number(req.body.lng),
      };
    }

    const updatedLand = await land.save();
    res.json(updatedLand);
  } catch (error) {
    console.error('Error updating land:', error);
    res.status(400).json({ message: error.message });
  }
};

// ============================================================
// @desc    Delete a land listing (Protected)
// @route   DELETE /api/lands/:id
// ============================================================
export const deleteLand = async (req, res) => {
  try {
    const land = await Land.findById(req.params.id);

    if (!land) return res.status(404).json({ message: 'Land not found' });

    if (land.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this land' });
    }

    await land.deleteOne();
    res.json({ message: 'Land removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
