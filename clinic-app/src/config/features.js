/**
 * ====================================================================
 * 🎛️ FEATURE TOGGLES (Logic Control Center)
 * ====================================================================
 * Yahan se aap bina kisi coding ke kisi bhi logic ko:
 * - ADD karne ke liye: true likhein
 * - REMOVE karne ke liye: false likhein
 */

export const FEATURES = {
  // 1. LIVE QUEUE & COMPOUNDER
  enableCompounderRemote: true,    // Compounder ka 1-button Next Remote (ON/OFF)
  enableLiveQueueTracker: true,    // Patient ka Live Waiting Status (ON/OFF)

  // 2. PATIENT BOOKING & PASS
  enableDigitalBoardingPass: true, // Interactive Boarding Pass Ticket (ON/OFF)
  enableWhatsAppBooking: true,     // Direct WhatsApp Token Confirmation (ON/OFF)

  // 3. CLINIC TRUST & INFO
  enableDoctorPromises: true,      // "Dr. Verma ke 4 Patient Promises" section (ON/OFF)
  enableEmergencyWarning: true,    // Severe Emergency Red Banner (ON/OFF)
  enableDoctorCredentials: true,   // MCI/NMC Reg No, AIIMS degree badges (ON/OFF)
  enableClinicTimings: true,       // Morning/Evening Shifts & Address (ON/OFF)
  enableFaqSection: true,          // Frequently Asked Questions (ON/OFF)
};
