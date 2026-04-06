// ============================================================
// 📲 AgriSmart — WhatsApp Notification Utility (Twilio)
// Place this file at: utils/whatsappNotify.js
// ============================================================

/**
 * Send a WhatsApp message via Twilio
 * @param {string} toPhone      - Recipient phone number (without country code)
 * @param {string} templateName - Internal template key (see TEMPLATES below)
 * @param {string[]} bodyParams - Array of variable strings
 */

const TEMPLATES = {
  // ── Rental Requests ──────────────────────────────────────────────────────────

  // Sent to OWNER when someone requests their item
  rental_request_received: (p) =>
    `Hi ${p[0]}! You have a new rental request on AgriSmart. ${p[1]} wants to rent your ${p[2]} '${p[3]}' for ${p[4]}. Log in to review and respond.`,

  // Sent to RENTER when owner approves
  rental_request_approved: (p) =>
    `Great news ${p[0]}! 🎉 Your rental request for '${p[1]}' has been Approved ✅ by ${p[2]}. Contact them at ${p[3]} to confirm the details.`,

  // Sent to RENTER when owner rejects
  rental_request_rejected: (p) =>
    `Hi ${p[0]}, unfortunately your rental request for '${p[1]}' was not approved this time. Browse other listings on AgriSmart and try again!`,

  // ── Crops ────────────────────────────────────────────────────────────────────

  // Sent to FARMER on successful crop registration (confirmation)
  crop_registered: (p) =>
    `Hi ${p[0]}! ✅ Your crop '${p[1]}' has been successfully registered on AgriSmart. Our team will review and verify it shortly.`,

  // Sent to FARMER when admin verifies or rejects their crop
  crop_verified: (p) =>
    `Hi ${p[0]}! Your crop registration for '${p[1]}' has been ${p[2]} by the AgriSmart team. Log in to view details.`,

  // ── Equipment ────────────────────────────────────────────────────────────────

  // Sent to OWNER when their equipment listing goes live
  equipment_listed: (p) =>
    `Hi ${p[0]}! 🚜 Your equipment '${p[1]}' has been listed successfully on AgriSmart at ₹${p[2]}/day. Farmers in your area can now find and request it.`,

  // ── Land ─────────────────────────────────────────────────────────────────────

  // Sent to OWNER when their land listing goes live
  land_listed: (p) =>
    `Hi ${p[0]}! 🌾 Your land '${p[1]}' (${p[2]} acres) has been listed on AgriSmart at ₹${p[3]}/season. Farmers can now view and request it.`,
};

// ── Main send function ───────────────────────────────────────────────────────
const sendWhatsAppMessage = async (toPhone, templateName, bodyParams = []) => {
  try {
    if (!toPhone) {
      console.warn(`⚠️  WhatsApp skipped — no phone number for template "${templateName}"`);
      return null;
    }

    const templateFn = TEMPLATES[templateName];
    if (!templateFn) {
      console.warn(`⚠️  Unknown template "${templateName}" — skipping WhatsApp notification`);
      return null;
    }

    const phoneWithCode = toPhone.startsWith('91') ? toPhone : `91${toPhone}`;
    const fromNumber    = process.env.TWILIO_WHATSAPP_FROM;
    const accountSid    = process.env.TWILIO_ACCOUNT_SID;
    const authToken     = process.env.TWILIO_AUTH_TOKEN;

    const messageBody = templateFn(bodyParams);

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const formData = new URLSearchParams({
      From: fromNumber,
      To:   `whatsapp:+${phoneWithCode}`,
      Body: messageBody,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (data.error_code) {
      console.error(`❌ Twilio WhatsApp Error [${templateName}] → ${data.error_code}: ${data.message}`);
    } else {
      console.log(`✅ WhatsApp sent [${templateName}] → whatsapp:+${phoneWithCode} (SID: ${data.sid})`);
    }

    return data;
  } catch (err) {
    // NEVER let notification failure crash the main API request
    console.error(`🔥 WhatsApp network error [${templateName}]:`, err.message);
    return null;
  }
};

export default sendWhatsAppMessage;

// ============================================================
// 🔑 REQUIRED ENV VARIABLES (.env)
// ============================================================
//
// TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
// TWILIO_AUTH_TOKEN=your_auth_token
// TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
//
// ============================================================
// 📋 ALL TEMPLATES REFERENCE
// ============================================================
//
// 1. rental_request_received  → OWNER (someone requests their listing)
//    Params: [ownerName, renterName, itemType, itemName, duration]
//
// 2. rental_request_approved  → RENTER (owner approves)
//    Params: [renterName, itemName, ownerName, ownerPhone]
//
// 3. rental_request_rejected  → RENTER (owner rejects)
//    Params: [renterName, itemName]
//
// 4. crop_registered          → FARMER (crop registered successfully)
//    Params: [farmerName, cropType]
//
// 5. crop_verified            → FARMER (admin verifies/rejects crop)
//    Params: [farmerName, cropType, status]  ← status = 'Verified' | 'Rejected'
//
// 6. equipment_listed         → OWNER (equipment listing created)
//    Params: [ownerName, equipmentName, pricePerDay]
//
// 7. land_listed              → OWNER (land listing created)
//    Params: [ownerName, landTitle, area, pricePerSeason]
// ============================================================
