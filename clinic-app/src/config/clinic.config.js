/**
 * ====================================================================
 * CLINIC MASTER CONFIGURATION (Single Source of Truth)
 * ====================================================================
 * Kisi bhi doctor ke liye website set karni ho, bas is 1 file ko edit karein!
 * Koi component ya code chhoone ki zaroorat nahi hai.
 */

export const CLINIC_CONFIG = {
  // ------------------------------------------------------------------
  // 1. DOCTOR & CLINIC DETAILS (Doctor ki sari information)
  // ------------------------------------------------------------------
  doctor: {
    name: "Dr. Pawan Suthar",
    degree: "MD (Medicine)",
    almaMater: "Ex-AIIMS New Delhi",
    experience: "18+ Yrs Gentle Care",
    regNo: "NMC-DEL-48291",
    photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=900&q=80",
    
    clinicName: "Apex Family Healthcare Clinic",
    address: "42, Doctor's Enclave, Near Metro Pillar 118, Malviya Nagar",
    city: "New Delhi",
    
    // WhatsApp direct token confirm karne ke liye (country code ke sath bina +)
    whatsappNumber: "917425077378", 
    helplinePhone: "+91 74250 77378",
    
    consultationFee: "₹600",
    feeValidity: "Valid for 7 Days",
    morningShift: "10:00 AM – 1:30 PM",
    eveningShift: "5:30 PM – 8:30 PM",
    sundayStatus: "Sunday: Closed (Emergency on call)",
    
    // Queue settings
    initialToken: 5,
    avgMinsPerPatient: 15,
  },

  // ------------------------------------------------------------------
  // 2. FEATURE TOGGLES (Doctor ko kya chahiye, kya nahi)
  // ------------------------------------------------------------------
  // True = Feature chalu rahega
  // False = Feature poori tarah chupchap gayab ho jayega (layout nahi tootega)
  features: {
    showLiveQueue: true,          // Live token tracker dabba (Patient view)
    showTokenBooking: true,       // WhatsApp Digital token booking form
    showDigitalTicketPass: true,  // Interactive Boarding Pass ticket preview
    showDoctorPromises: true,     // Dr. Verma ke 4 Patient Promises section
    showEmergencyAlert: true,     // Top red emergency alert notice
    showDoctorCredentials: true,  // Medical council reg no, degrees badge
    showClinicTimings: true,      // Morning/evening shifts aur address section
  },

  // ------------------------------------------------------------------
  // 3. STAFF / COMPOUNDER SECURITY
  // ------------------------------------------------------------------
  staff: {
    pin: "1234", // Compounder Desk kholne ka 4-digit secret PIN code
  },

  // ------------------------------------------------------------------
  // 4. DEMO MODE TOGGLE
  // ------------------------------------------------------------------
  // true = Top par "Switch Mode" bar dikhega (testing/portfolio demo ke liye)
  // false = Real Production mode! Top bar gayab, patient ko sirf clean site dikhegi
  demoMode: false,
};
