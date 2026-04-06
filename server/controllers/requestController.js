import Request from '../models/requestModel.js';
import Land from '../models/Land.js';
import Equipment from '../models/equipmentModel.js';
import User from '../models/User.js';
import sendWhatsAppMessage from '../utils/whatsappNotify.js';

// ============================================================
// @desc    Create a new rental request
// @route   POST /api/requests
// 📲 Notifies: OWNER — someone wants to rent their item
// ============================================================
export const createRequest = async (req, res) => {
  try {
    const { itemType, itemId, duration, message } = req.body;
    let ownerId;
    let itemName;

    // 1. Find the item — get owner ID & item name
    if (itemType === 'Land') {
      const land = await Land.findById(itemId);
      if (!land) return res.status(404).json({ message: 'Land not found' });
      ownerId  = land.owner;
      itemName = land.title;
    } else if (itemType === 'Equipment') {
      const equipment = await Equipment.findById(itemId);
      if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
      ownerId  = equipment.user;
      itemName = equipment.name;
    } else {
      return res.status(400).json({ message: 'Invalid item type. Must be Land or Equipment.' });
    }

    // 2. Prevent users from requesting their own items
    if (ownerId.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: 'You cannot request your own listing!' });
    }

    // 3. Create the rental request
    const newRequest = await Request.create({
      requester: req.user.id,
      owner:     ownerId,
      itemType,
      land:      itemType === 'Land'      ? itemId : null,
      equipment: itemType === 'Equipment' ? itemId : null,
      duration,
      message,
    });

    // 4. 📲 Notify OWNER via WhatsApp
    //    Template: rental_request_received
    //    "Hi {{ownerName}}! {{renterName}} wants to rent your {{itemType}} '{{itemName}}' for {{duration}}. Log in to review."
    const owner  = await User.findById(ownerId);
    const renter = req.user; // already populated by protect middleware

    await sendWhatsAppMessage(
      owner.phone,
      'rental_request_received',
      [owner.name, renter.name, itemType.toLowerCase(), itemName, `${duration} days`]
    );

    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Create Request Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// @desc    Get requests sent TO the logged-in owner (incoming)
// @route   GET /api/requests/incoming
// ============================================================
export const getIncomingRequests = async (req, res) => {
  try {
    const requests = await Request.find({ owner: req.user.id })
      .populate('requester', 'name phone email')
      .populate('land',      'title price image')
      .populate('equipment', 'name price image')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// @desc    Get requests sent BY the logged-in renter (outgoing)
// @route   GET /api/requests/outgoing
// ============================================================
export const getOutgoingRequests = async (req, res) => {
  try {
    const requests = await Request.find({ requester: req.user.id })
      .populate('owner',     'name phone')
      .populate('land',      'title price image')
      .populate('equipment', 'name price image')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// @desc    Update request status — Approve or Reject
// @route   PUT /api/requests/:id/status
// 📲 Notifies: RENTER — their request was approved or rejected
// ============================================================
export const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Approved or Rejected' });
    }

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Only the owner of the listing can update status
    if (request.owner.toString() !== req.user.id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    request.status = status;
    const updatedRequest = await request.save();

    // Fetch item name for the notification message
    let itemName = 'the listing';
    if (request.itemType === 'Land' && request.land) {
      const land = await Land.findById(request.land);
      itemName = land?.title || itemName;
    } else if (request.itemType === 'Equipment' && request.equipment) {
      const equipment = await Equipment.findById(request.equipment);
      itemName = equipment?.name || itemName;
    }

    // Fetch both parties for notification
    const owner  = await User.findById(request.owner);
    const renter = await User.findById(request.requester);

    if (status === 'Approved') {
      // Mark item as unavailable — no one else can request it now
      if (request.itemType === 'Land') {
        await Land.findByIdAndUpdate(request.land, { isAvailable: false });
      } else if (request.itemType === 'Equipment') {
        await Equipment.findByIdAndUpdate(request.equipment, { isAvailable: false });
      }

      // 📲 Notify RENTER: approved
      //    Template: rental_request_approved
      //    "Great news {{renterName}}! Your request for '{{itemName}}' was Approved ✅ by {{ownerName}}. Contact them at {{ownerPhone}}."
      await sendWhatsAppMessage(
        renter.phone,
        'rental_request_approved',
        [renter.name, itemName, owner.name, owner.phone]
      );

    } else if (status === 'Rejected') {
      // Re-mark item as available
      if (request.itemType === 'Land') {
        await Land.findByIdAndUpdate(request.land, { isAvailable: true });
      } else if (request.itemType === 'Equipment') {
        await Equipment.findByIdAndUpdate(request.equipment, { isAvailable: true });
      }

      // 📲 Notify RENTER: rejected
      //    Template: rental_request_rejected
      //    "Hi {{renterName}}, your request for '{{itemName}}' was not approved. Browse other listings on AgriSmart!"
      await sendWhatsAppMessage(
        renter.phone,
        'rental_request_rejected',
        [renter.name, itemName]
      );
    }

    res.json(updatedRequest);
  } catch (error) {
    console.error('Update Request Status Error:', error);
    res.status(500).json({ message: error.message });
  }
};
