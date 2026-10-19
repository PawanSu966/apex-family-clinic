import React, { createContext, useContext, useState, useEffect } from 'react';
import { CLINIC_CONFIG } from '../config/clinic.config';

const QueueContext = createContext();

// Hospital Web Audio API Synthesizer (Ding-Dong Chime)
export function playHospitalChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // High Tone (E5 - 659Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.28, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.6);

    // Low Tone (C5 - 523Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(523.25, ctx.currentTime + 0.2);
    gain2.gain.setValueAtTime(0.32, ctx.currentTime + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.2);
    osc2.stop(ctx.currentTime + 0.9);
  } catch (e) {
    console.warn('Audio chime notice:', e);
  }
}

// Emergency Attention Alert Chime
export function playEmergencyAlertSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1046, ctx.currentTime + 0.15);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
    osc.frequency.setValueAtTime(1046, ctx.currentTime + 0.45);
    gain.gain.setValueAtTime(0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.65);
  } catch (e) {
    console.warn('Emergency audio notice:', e);
  }
}

// Initial clinical records with complete clinical, pharmacy, and follow-up data
const INITIAL_PATIENTS = [
  {
    id: "pat_1",
    token: 1,
    name: "Suresh Gupta",
    age: 52,
    gender: "Male",
    phone: "9876543210",
    symptom: "High BP & Routine Checkup",
    shift: "Morning",
    source: "Walk-In",
    status: "completed",
    time: "10:05 AM",
    registeredAt: Date.now() - 55 * 60 * 1000,
    isEmergency: false,
    isReview: false,
    consultationFee: 600,
    vitals: { bp: "140/90", pulse: "82", temp: "98.4", spo2: "98", weight: "74" },
    diagnosis: "Essential Hypertension (Stage 2)",
    prescription: [
      { name: "Tab. Telmisartan 40mg", dose: "1 - 0 - 0", timing: "Morning After Breakfast", duration: "15 Days", price: 110 },
      { name: "Tab. Amlodipine 5mg", dose: "0 - 0 - 1", timing: "At Bedtime", duration: "15 Days", price: 65 }
    ],
    labTests: ["Lipid Profile", "Serum Creatinine"],
    advice: "Low sodium salt diet, 30 min daily brisk walking.",
    pharmacyStatus: "dispensed",
    pharmacyTotal: 175
  },
  {
    id: "pat_2",
    token: 2,
    name: "Meena Devi",
    age: 38,
    gender: "Female",
    phone: "9811223344",
    symptom: "Viral Fever & Body Ache",
    shift: "Morning",
    source: "Online",
    status: "completed",
    time: "10:18 AM",
    registeredAt: Date.now() - 40 * 60 * 1000,
    isEmergency: false,
    isReview: true, // 7-day free follow-up
    lastVisitDate: "15-Oct-2026",
    consultationFee: 0,
    vitals: { bp: "116/76", pulse: "76", temp: "99.1", spo2: "99", weight: "58" },
    diagnosis: "Post-Viral Weakness & Pharyngitis",
    prescription: [
      { name: "Tab. Dolo 650mg", dose: "1 - 0 - 1", timing: "After Food", duration: "3 Days", price: 35 },
      { name: "Tab. Azithromycin 500mg", dose: "1 - 0 - 0", timing: "After Breakfast", duration: "3 Days", price: 125 },
      { name: "Tab. Pantoprazole 40mg", dose: "1 - 0 - 0", timing: "Empty Stomach", duration: "5 Days", price: 80 }
    ],
    labTests: ["CBC (Hemogram)"],
    advice: "Drink plenty of warm water, soft diet, steam inhalation twice a day.",
    pharmacyStatus: "pending", // Waiting for pharmacy counter to dispense
    pharmacyTotal: 240
  },
  {
    id: "pat_3",
    token: 3,
    name: "Rajesh Kumar",
    age: 45,
    gender: "Male",
    phone: "9988776655",
    symptom: "Severe Joint Pain & Swelling",
    shift: "Morning",
    source: "Walk-In",
    status: "serving",
    time: "10:35 AM",
    registeredAt: Date.now() - 25 * 60 * 1000,
    isEmergency: false,
    isReview: false,
    consultationFee: 600,
    vitals: { bp: "130/84", pulse: "78", temp: "98.6", spo2: "99", weight: "71" },
    diagnosis: "Acute Osteoarthritis Flare / Gout",
    prescription: [
      { name: "Tab. Etoricoxib 90mg", dose: "1 - 0 - 0", timing: "After Food", duration: "5 Days", price: 95 },
      { name: "Tab. Pan-D", dose: "1 - 0 - 0", timing: "Empty Stomach", duration: "5 Days", price: 90 }
    ],
    labTests: ["Serum Uric Acid", "RA Factor"],
    advice: "Avoid high-purine foods (dal, paneer), hot fomentation.",
    pharmacyStatus: "pending",
    pharmacyTotal: 185
  },
  {
    id: "pat_4",
    token: 4,
    name: "Pooja Verma",
    age: 29,
    gender: "Female",
    phone: "9871122334",
    symptom: "Dry Cough & Throat Soreness",
    shift: "Morning",
    source: "Online",
    status: "waiting",
    time: "10:48 AM",
    registeredAt: Date.now() - 15 * 60 * 1000,
    isEmergency: false,
    isReview: false,
    consultationFee: 600,
    vitals: { bp: "118/74", pulse: "72", temp: "98.4", spo2: "100", weight: "54" },
    diagnosis: "",
    prescription: [],
    labTests: [],
    advice: "",
    pharmacyStatus: "not_required",
    pharmacyTotal: 0
  },
  {
    id: "pat_5",
    token: 5,
    name: "Pawan Suthar",
    age: 25,
    gender: "Male",
    phone: "919876543210",
    symptom: "High Fever & Chills",
    shift: "Morning",
    source: "Online",
    status: "waiting",
    time: "10:55 AM",
    registeredAt: Date.now() - 8 * 60 * 1000,
    isEmergency: false,
    isReview: false,
    consultationFee: 600,
    vitals: { bp: "122/80", pulse: "88", temp: "101.2", spo2: "98", weight: "68" },
    diagnosis: "",
    prescription: [],
    labTests: [],
    advice: "",
    pharmacyStatus: "not_required",
    pharmacyTotal: 0
  }
];

// Historical clinic visits directory to auto-verify 7-Day Free Follow-ups
const HISTORICAL_PATIENT_RECORDS = [
  { phone: "9811223344", name: "Meena Devi", lastVisitDate: "15-Oct-2026", daysAgo: 4, previousDiagnosis: "Acute Viral Pyrexia" },
  { phone: "9876543210", name: "Suresh Gupta", lastVisitDate: "14-Oct-2026", daysAgo: 5, previousDiagnosis: "HTN & Dyslipidemia" },
  { phone: "9822334455", name: "Ramesh Sharma", lastVisitDate: "16-Oct-2026", daysAgo: 3, previousDiagnosis: "Seasonal Allergic Rhinitis" }
];

export function QueueProvider({ children }) {
  const [patients, setPatients] = useState(() => {
    const saved = localStorage.getItem('apex_patients_db');
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });

  const [doctorStatus, setDoctorStatus] = useState(() => {
    return localStorage.getItem('apex_doctor_status') || 'in_cabin';
  });

  const [mySession, setMySession] = useState(() => {
    const saved = localStorage.getItem('apex_my_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [auditLogs, setAuditLogs] = useState(() => [
    { id: 1, text: "Token #01 Suresh Gupta consultation completed (Rx sent to Pharmacy)", time: "10:15 AM", type: "success" },
    { id: 2, text: "Token #02 Meena Devi 7-Day Free Follow-up checked in (₹0 Fee)", time: "10:18 AM", type: "info" },
    { id: 3, text: "Token #03 Rajesh Kumar called into Dr. Cabin", time: "10:35 AM", type: "warning" },
    { id: 4, text: "Token #05 Pawan Suthar digital token registered via web", time: "10:55 AM", type: "info" }
  ]);

  // Real-time Cross-Tab Broadcast Channel (Zero-Latency Inter-Process Sync)
  useEffect(() => {
    let channel = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('apex_clinic_realtime_bus');
        channel.onmessage = (event) => {
          const { type, payload } = event.data || {};
          if (type === 'SYNC_PATIENTS') {
            setPatients(payload);
          } else if (type === 'SYNC_DOCTOR_STATUS') {
            setDoctorStatus(payload);
          } else if (type === 'CHIME_CALL') {
            playHospitalChime();
          } else if (type === 'EMERGENCY_ALERT') {
            playEmergencyAlertSound();
          } else if (type === 'NEW_AUDIT_LOG') {
            setAuditLogs(prev => [payload, ...prev.slice(0, 19)]);
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel initialization:', e);
    }

    const handleStorage = (e) => {
      if (e.key === 'apex_patients_db' && e.newValue) {
        setPatients(JSON.parse(e.newValue));
      }
      if (e.key === 'apex_doctor_status' && e.newValue) {
        setDoctorStatus(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const broadcastEvent = (type, payload) => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bus = new BroadcastChannel('apex_clinic_realtime_bus');
        bus.postMessage({ type, payload, timestamp: Date.now() });
        bus.close();
      }
    } catch (e) {
      console.warn('Broadcast failed:', e);
    }
  };

  const addAuditLog = (text, type = "info") => {
    const newLog = {
      id: Date.now(),
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 19)]);
    broadcastEvent('NEW_AUDIT_LOG', newLog);
  };

  const syncPatientsState = (newPatients) => {
    setPatients(newPatients);
    localStorage.setItem('apex_patients_db', JSON.stringify(newPatients));
    broadcastEvent('SYNC_PATIENTS', newPatients);
  };

  const handleSetDoctorStatus = (status) => {
    setDoctorStatus(status);
    localStorage.setItem('apex_doctor_status', status);
    broadcastEvent('SYNC_DOCTOR_STATUS', status);
    addAuditLog(`Doctor marked status: ${status === 'in_cabin' ? 'In Cabin' : status === 'break' ? 'Tea Break' : 'Shift Off'}`, 'info');
  };

  const currentPatient = patients.find(p => p.status === 'serving') || null;
  const servingToken = currentPatient ? currentPatient.token : 3;

  // 1. Call specific patient into Dr Cabin
  const callPatient = (patientId) => {
    playHospitalChime();
    broadcastEvent('CHIME_CALL', { patientId });

    let calledPat = null;
    const updated = patients.map(p => {
      if (p.id === patientId) {
        calledPat = p;
        return { ...p, status: 'serving' };
      }
      if (p.status === 'serving') {
        return { ...p, status: 'completed' };
      }
      return p;
    });

    syncPatientsState(updated);
    if (calledPat) {
      addAuditLog(`Token #${calledPat.token < 10 ? '0' + calledPat.token : calledPat.token} (${calledPat.name}) called inside Dr. Cabin`, 'warning');
    }
  };

  // 2. Complete consultation
  const completePatient = (patientId) => {
    let completedPat = null;
    const updated = patients.map(p => {
      if (p.id === patientId) {
        completedPat = p;
        return { ...p, status: 'completed' };
      }
      return p;
    });
    syncPatientsState(updated);
    if (completedPat) {
      addAuditLog(`Token #${completedPat.token < 10 ? '0' + completedPat.token : completedPat.token} consultation finished`, 'success');
    }
  };

  // 3. Skip patient
  const skipPatient = (patientId) => {
    let skippedPat = null;
    const updated = patients.map(p => {
      if (p.id === patientId) {
        skippedPat = p;
        return { ...p, status: 'skipped' };
      }
      return p;
    });
    syncPatientsState(updated);
    if (skippedPat) {
      addAuditLog(`Token #${skippedPat.token < 10 ? '0' + skippedPat.token : skippedPat.token} marked as skipped`, 'info');
    }
  };

  // 4. Call next waiting patient in line (Emergency patients get absolute priority)
  const callNextInLine = () => {
    // Sort waiting patients: Emergency first, then ascending token
    const waiting = patients.filter(p => p.status === 'waiting');
    if (waiting.length === 0) {
      alert("No more patients currently waiting in queue!");
      return;
    }

    const nextWaiting = waiting.sort((a, b) => {
      if (a.isEmergency && !b.isEmergency) return -1;
      if (!a.isEmergency && b.isEmergency) return 1;
      return a.token - b.token;
    })[0];

    callPatient(nextWaiting.id);
  };

  // 5. Emergency / VIP Priority Bump
  const emergencyBumpPatient = (patientId) => {
    playEmergencyAlertSound();
    broadcastEvent('EMERGENCY_ALERT', { patientId });

    let bumpedPat = null;
    const updated = patients.map(p => {
      if (p.id === patientId) {
        bumpedPat = p;
        return { ...p, isEmergency: true };
      }
      return p;
    });

    syncPatientsState(updated);
    if (bumpedPat) {
      addAuditLog(`EMERGENCY BUMP: Token #${bumpedPat.token < 10 ? '0' + bumpedPat.token : bumpedPat.token} (${bumpedPat.name}) promoted to Priority #1 Triage!`, 'emergency');
    }
  };

  // 6. Check 7-Day Free Follow-up Eligibility
  const check7DayReview = (phone) => {
    if (!phone) return null;
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    // Check in past directory + completed patients today
    const foundPast = HISTORICAL_PATIENT_RECORDS.find(r => r.phone.endsWith(cleanPhone));
    if (foundPast) {
      return {
        isEligible: true,
        patientName: foundPast.name,
        daysAgo: foundPast.daysAgo,
        lastVisitDate: foundPast.lastVisitDate,
        previousDiagnosis: foundPast.previousDiagnosis
      };
    }
    const foundCompleted = patients.find(p => p.status === 'completed' && p.phone && p.phone.endsWith(cleanPhone));
    if (foundCompleted) {
      return {
        isEligible: true,
        patientName: foundCompleted.name,
        daysAgo: 0,
        lastVisitDate: 'Today',
        previousDiagnosis: foundCompleted.diagnosis || foundCompleted.symptom
      };
    }
    return null;
  };

  // 7. Add Walk-In Patient (with 7-day review & emergency flags)
  const addWalkInPatient = ({ name, age, gender, phone, symptom, isEmergency = false, isReview = false, vitals = null }) => {
    const nextToken = patients.reduce((max, p) => Math.max(max, p.token), 0) + 1;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newPatient = {
      id: `pat_${Date.now()}`,
      token: nextToken,
      name: name.trim(),
      age: parseInt(age, 10),
      gender,
      phone: phone || "Walk-In Desk",
      symptom: symptom || "General Consultation",
      shift: "Morning",
      source: "Walk-In",
      status: "waiting",
      time: timeStr,
      registeredAt: Date.now(),
      isEmergency: !!isEmergency,
      isReview: !!isReview,
      consultationFee: isReview ? 0 : 600,
      vitals: vitals || { bp: "120/80", pulse: "74", temp: "98.6", spo2: "99", weight: "65" },
      diagnosis: "",
      prescription: [],
      labTests: [],
      advice: "",
      pharmacyStatus: "not_required",
      pharmacyTotal: 0
    };

    const updated = [...patients, newPatient];
    syncPatientsState(updated);
    addAuditLog(`Token #${nextToken < 10 ? '0' + nextToken : nextToken} (${name}) registered at Walk-in counter ${isReview ? '(7-Day Free Review)' : ''}`, 'info');
    return newPatient;
  };

  // 8. Book Online Token
  const bookOnlineToken = ({ name, age, gender, symptom, shift, phone }) => {
    const nextToken = patients.reduce((max, p) => Math.max(max, p.token), 0) + 1;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newPatient = {
      id: `pat_${Date.now()}`,
      token: nextToken,
      name: name.trim(),
      age: parseInt(age, 10),
      gender,
      phone: phone || "Online Web",
      symptom: symptom || "General Consultation",
      shift,
      source: "Online",
      status: "waiting",
      time: timeStr,
      registeredAt: Date.now(),
      isEmergency: false,
      isReview: false,
      consultationFee: 600,
      vitals: { bp: "120/80", pulse: "72", temp: "98.6", spo2: "99", weight: "66" },
      diagnosis: "",
      prescription: [],
      labTests: [],
      advice: "",
      pharmacyStatus: "not_required",
      pharmacyTotal: 0
    };

    const updated = [...patients, newPatient];
    syncPatientsState(updated);

    setMySession(newPatient);
    localStorage.setItem('apex_my_session', JSON.stringify(newPatient));

    addAuditLog(`Token #${nextToken < 10 ? '0' + nextToken : nextToken} (${name}) booked online via patient website`, 'info');
    return newPatient;
  };

  // 9. Save Consultation (From Doctor Cabin -> Automatically pushes to In-House Pharmacy)
  const updatePatientConsultation = (patientId, { diagnosis, medicines, advice, reviewDays, labTests }) => {
    let updatedPat = null;
    const pricePerMed = 75; // average price estimate per medicine
    const medList = medicines || [];
    const totalPharm = medList.length * pricePerMed;

    const updated = patients.map(p => {
      if (p.id === patientId) {
        updatedPat = {
          ...p,
          diagnosis: diagnosis || p.diagnosis,
          prescription: medList,
          advice: advice || p.advice,
          reviewDays: reviewDays || "3",
          labTests: labTests || [],
          pharmacyStatus: medList.length > 0 ? 'pending' : 'not_required',
          pharmacyTotal: totalPharm
        };
        return updatedPat;
      }
      return p;
    });

    syncPatientsState(updated);
    if (updatedPat) {
      addAuditLog(`Dr. Rx saved for Token #${updatedPat.token} (${updatedPat.name}): ${medList.length} medicines sent to Pharmacy Counter`, 'success');
    }
  };

  // 10. Dispense medicines from Pharmacy Counter
  const dispensePharmacy = (patientId) => {
    let dispensedPat = null;
    const updated = patients.map(p => {
      if (p.id === patientId) {
        dispensedPat = p;
        return { ...p, pharmacyStatus: 'dispensed' };
      }
      return p;
    });
    syncPatientsState(updated);
    if (dispensedPat) {
      addAuditLog(`Pharmacy: Medicines dispensed & invoice generated for Token #${dispensedPat.token} (${dispensedPat.name})`, 'success');
    }
  };

  // 11. Reset Day for morning shift
  const resetDay = () => {
    if (confirm("Reset OPD Queue for a new morning shift?")) {
      setPatients(INITIAL_PATIENTS);
      localStorage.setItem('apex_patients_db', JSON.stringify(INITIAL_PATIENTS));
      broadcastEvent('SYNC_PATIENTS', INITIAL_PATIENTS);
      addAuditLog("OPD Shift reset for a new day", "info");
    }
  };

  return (
    <QueueContext.Provider
      value={{
        patients,
        currentPatient,
        servingToken,
        doctorStatus,
        setDoctorStatus: handleSetDoctorStatus,
        mySession,
        auditLogs,
        callPatient,
        callNextInLine,
        completePatient,
        skipPatient,
        emergencyBumpPatient,
        check7DayReview,
        addWalkInPatient,
        bookOnlineToken,
        updatePatientConsultation,
        dispensePharmacy,
        resetDay
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  return useContext(QueueContext);
}
export default QueueContext;
