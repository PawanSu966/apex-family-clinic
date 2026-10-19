import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { CLINIC_CONFIG } from '../config/clinic.config';
import { OpdPrescriptionModal } from './OpdPrescriptionSlip';
import LabRequisitionModal from './LabRequisitionModal';
import Icons from './Icons';

/**
 * =========================================================================
 * DOCTOR'S CABIN CONSULTATION TERMINAL (EMR DESK)
 * =========================================================================
 * Private dashboard for the doctor sitting inside the consultation room.
 * Displays compounder triage vitals, live queue, quick Rx writer, lab referrals,
 * and 1-click call next. Automatically syncs prescriptions to In-House Pharmacy.
 */
export default function DoctorCabin({ onExit, onOpenTv, onOpenPharmacy }) {
  const {
    patients, currentPatient, servingToken, doctorStatus, setDoctorStatus,
    callPatient, callNextInLine, completePatient, skipPatient,
    emergencyBumpPatient, updatePatientConsultation
  } = useQueue();
  const doctor = CLINIC_CONFIG.doctor;

  const [printSlipPatient, setPrintSlipPatient] = useState(null);
  const [showLabModal, setShowLabModal] = useState(false);

  // Active consultation draft state for current patient
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState([
    { name: 'Tab. Paracetamol (Dolo) 650mg', dose: '1 - 0 - 1', timing: 'After Meals', duration: '3 Days', price: 35 },
    { name: 'Tab. Azithromycin 500mg', dose: '1 - 0 - 0', timing: 'After Breakfast', duration: '3 Days', price: 125 },
    { name: 'Tab. Pantoprazole 40mg', dose: '1 - 0 - 0', timing: 'Empty Stomach', duration: '5 Days', price: 80 }
  ]);
  const [customMed, setCustomMed] = useState({ name: '', dose: '1 - 0 - 1', timing: 'After Food', duration: '3 Days', price: 75 });
  const [reviewDays, setReviewDays] = useState('3');
  const [adviceNotes, setAdviceNotes] = useState('Drink plenty of warm water, soft diet, avoid cold items.');
  const [selectedLabTests, setSelectedLabTests] = useState(['CBC (Complete Blood Count & Platelets)']);

  const waitingPatients = patients.filter(p => p.status === 'waiting').sort((a, b) => {
    if (a.isEmergency && !b.isEmergency) return -1;
    if (!a.isEmergency && b.isEmergency) return 1;
    return a.token - b.token;
  });
  const completedPatients = patients.filter(p => p.status === 'completed');

  // Common clinical diagnostic presets for quick 1-click selection
  const commonDiagnoses = [
    'Viral URTI / Pharyngitis',
    'Acute Bronchitis & Cough',
    'Seasonal Pyrexia (Fever)',
    'Hypertension (Stage 1)',
    'Acute Gastritis / GERD',
    'Type 2 Diabetes Follow-up',
    'Migraine / Tension Headache'
  ];

  // Quick medicine presets
  const quickMedPresets = [
    { name: 'Tab. Dolo 650mg', dose: '1 - 0 - 1', timing: 'After Meals', duration: '3 Days', price: 35 },
    { name: 'Tab. Augmentin 625mg', dose: '1 - 0 - 1', timing: 'After Food', duration: '5 Days', price: 195 },
    { name: 'Tab. Pan-40mg', dose: '1 - 0 - 0', timing: 'Empty Stomach', duration: '5 Days', price: 80 },
    { name: 'Syp. Ascoril-D', dose: '10ml - 10ml - 10ml', timing: 'After Food (TDS)', duration: '5 Days', price: 110 },
    { name: 'Tab. Montair-LC', dose: '0 - 0 - 1', timing: 'At Bedtime', duration: '5 Days', price: 95 },
    { name: 'Electral ORS Sachet', dose: '1 Sachet in 1L Water', timing: 'Sip Throughout Day', duration: '2 Days', price: 25 }
  ];

  const commonLabPresets = [
    'CBC (Complete Blood Count & Platelets)',
    'Blood Sugar - Fasting (FBS)',
    'Lipid Profile',
    'Serum Creatinine',
    'Liver Function Test (LFT)',
    'Urine Routine (R/M)',
    'Chest X-Ray (PA View)',
    'ECG 12-Lead'
  ];

  const handleAddPreset = (med) => {
    if (!medicines.some(m => m.name === med.name)) {
      setMedicines([...medicines, med]);
    }
  };

  const handleAddCustomMed = (e) => {
    e.preventDefault();
    if (!customMed.name.trim()) return;
    setMedicines([...medicines, customMed]);
    setCustomMed({ name: '', dose: '1 - 0 - 1', timing: 'After Food', duration: '3 Days', price: 75 });
  };

  const handleRemoveMed = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const toggleLabTest = (testName) => {
    if (selectedLabTests.includes(testName)) {
      setSelectedLabTests(selectedLabTests.filter(t => t !== testName));
    } else {
      setSelectedLabTests([...selectedLabTests, testName]);
    }
  };

  const handleCompleteAndNext = () => {
    if (currentPatient) {
      updatePatientConsultation(currentPatient.id, {
        diagnosis: diagnosis || currentPatient.symptom || 'General Consultation',
        medicines,
        advice: adviceNotes,
        reviewDays,
        labTests: selectedLabTests
      });
      completePatient(currentPatient.id);
    }
    callNextInLine();
  };

  // Vitals of current patient or defaults
  const vitals = currentPatient?.vitals || {
    bp: '120/80',
    pulse: '74',
    temp: '98.6',
    spo2: '99',
    weight: '68'
  };

  return (
    <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
      {/* Doctor Desk Top Bar */}
      <div className="no-print bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-black text-2xl border border-teal-500/30">
            <Icons.Stethoscope className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-teal-300">
                Doctor Consultation Terminal (EMR & Prescription Desk)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-black text-white mt-0.5">
              {doctor.name} &bull; Cabin #1
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Doctor Status Switcher */}
          <div className="bg-slate-800 p-1 rounded-xl flex items-center border border-slate-700 text-xs font-bold">
            <button
              onClick={() => setDoctorStatus('in_cabin')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                doctorStatus === 'in_cabin' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              ● In Cabin
            </button>
            <button
              onClick={() => setDoctorStatus('break')}
              className={`px-3 py-1.5 rounded-lg transition-all inline-flex items-center gap-1.5 ${
                doctorStatus === 'break' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icons.Coffee className="w-3.5 h-3.5" /> Tea Break
            </button>
            <button
              onClick={() => setDoctorStatus('off')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                doctorStatus === 'off' ? 'bg-slate-700 text-slate-300 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Off Duty
            </button>
          </div>

          {onOpenPharmacy && (
            <button
              onClick={onOpenPharmacy}
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Icons.Pill className="w-3.5 h-3.5" /> Pharmacy Desk
            </button>
          )}

          {onOpenTv && (
            <button
              onClick={onOpenTv}
              className="bg-slate-800 hover:bg-slate-700 text-teal-300 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Icons.Tv className="w-3.5 h-3.5" /> TV OPD Screen
            </button>
          )}
          {onExit && (
            <button
              onClick={onExit}
              className="bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1"
            >
              <Icons.X className="w-3.5 h-3.5" /> Exit Cabin
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Active Patient EMR (Left) & Upcoming Queue (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Active Consultation Suite */}
        <div className="lg:col-span-8 space-y-5">
          {currentPatient ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
              {/* Patient Banner */}
              <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-hospital-navy text-white p-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-display font-black text-2xl border border-teal-500/30">
                    #{currentPatient.token < 10 ? `0${currentPatient.token}` : currentPatient.token}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/20 px-2 py-0.5 rounded">
                        INSIDE CABIN NOW
                      </span>
                      {currentPatient.isEmergency && (
                        <span className="text-[10px] font-bold text-rose-300 bg-rose-500/30 px-2 py-0.5 rounded border border-rose-500/40 inline-flex items-center gap-1">
                          <Icons.AlertTriangle className="w-2.5 h-2.5 text-rose-300" /> EMERGENCY TRIAGE
                        </span>
                      )}
                      {currentPatient.isReview && (
                        <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/30 px-2 py-0.5 rounded border border-emerald-500/40 inline-flex items-center gap-1">
                          <Icons.RefreshCw className="w-2.5 h-2.5 text-emerald-300" /> 7-DAY FREE REVIEW
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-display font-black text-white mt-0.5">
                      {currentPatient.name}
                    </h3>
                    <p className="text-xs text-slate-300">
                      {currentPatient.age} Yrs &bull; {currentPatient.gender} &bull; {currentPatient.source} Booking &bull; Phone: {currentPatient.phone || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setShowLabModal(true)}
                    className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                    title="Print Pathology / Radiology Referral Slip"
                  >
                    <Icons.Flask className="w-3.5 h-3.5" /> Lab Slip
                  </button>
                  <button
                    onClick={() => setPrintSlipPatient(currentPatient)}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <Icons.Printer className="w-3.5 h-3.5" /> Print Rx Slip
                  </button>
                  <button
                    onClick={handleCompleteAndNext}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-lg uppercase tracking-wider active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Icons.Check className="w-3.5 h-3.5" /> Done & Call Next
                  </button>
                </div>
              </div>

              {/* Triage Vitals Strip (Recorded by Compounder) */}
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                  Compounder Triage Vitals:
                </span>
                <div className="flex items-center gap-4 flex-wrap font-mono">
                  <div className="bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] mr-1">BP:</span>
                    <b className="text-slate-800">{vitals.bp || '120/80'}</b> <span className="text-[10px] text-slate-400">mmHg</span>
                  </div>
                  <div className="bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] mr-1">PULSE:</span>
                    <b className="text-slate-800">{vitals.pulse || '74'}</b> <span className="text-[10px] text-slate-400">bpm</span>
                  </div>
                  <div className="bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] mr-1">TEMP:</span>
                    <b className="text-slate-800">{vitals.temp || '98.6'}</b> <span className="text-[10px] text-slate-400">°F</span>
                  </div>
                  <div className="bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] mr-1">SPO2:</span>
                    <b className="text-emerald-700">{vitals.spo2 || '99'}</b> <span className="text-[10px] text-slate-400">%</span>
                  </div>
                  <div className="bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] mr-1">WT:</span>
                    <b className="text-slate-800">{vitals.weight || '68'}</b> <span className="text-[10px] text-slate-400">kg</span>
                  </div>
                </div>
              </div>

              {/* Patient Chief Complaints */}
              <div className="p-5 border-b border-slate-100 bg-amber-50/40 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">Chief Complaints Reported:</span>
                  <p className="text-slate-900 font-bold text-sm mt-0.5">
                    "{currentPatient.symptom || 'Routine health checkup / Seasonal malaise'}"
                  </p>
                </div>
                <span className="text-[11px] text-slate-500">
                  Arrived: {currentPatient.time || '10:00 AM'}
                </span>
              </div>

              {/* Consultation Working Area */}
              <div className="p-5 space-y-5">
                {/* 1. Provisional Diagnosis Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Provisional Diagnosis (नैदानिक निष्कर्ष):
                    </label>
                    <span className="text-[10px] text-slate-400">Select preset or type custom</span>
                  </div>
                  
                  {/* Preset Buttons */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {commonDiagnoses.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDiagnosis(d)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-all ${
                          diagnosis === d
                            ? 'bg-teal-700 text-white font-bold shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Enter or refine clinical diagnosis (e.g. Acute Viral Bronchitis with Mild Wheeze)..."
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-teal-600"
                  />
                </div>

                {/* 2. ℞ Prescription Writer */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-black text-xl text-teal-800">℞</span>
                      <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-800">
                        Prescription Table (दवाई सूची) &bull; <span className="text-emerald-700 font-mono">{medicines.length} Medicines</span>
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-400">Pushes directly to In-House Pharmacy Counter</span>
                  </div>

                  {/* Quick Add Presets */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
                    <p className="font-bold text-slate-600 mb-1.5 text-[10px] uppercase tracking-wider">
                      1-Click Fast Add Presets:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {quickMedPresets.map((med) => (
                        <button
                          key={med.name}
                          type="button"
                          onClick={() => handleAddPreset(med)}
                          className="bg-white border border-slate-200 hover:border-teal-500 hover:text-teal-700 text-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shadow-2xs flex items-center gap-1"
                        >
                          <span>+</span> {med.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Medicines List Table */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 text-[10px] uppercase">
                        <tr>
                          <th className="py-2.5 px-3">#</th>
                          <th className="py-2.5 px-3">Medicine Name</th>
                          <th className="py-2.5 px-3">Frequency</th>
                          <th className="py-2.5 px-3">Timing</th>
                          <th className="py-2.5 px-3">Duration</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {medicines.map((med, index) => (
                          <tr key={index} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 text-slate-400 font-mono">{index + 1}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{med.name}</td>
                            <td className="py-2.5 px-3 font-mono text-emerald-800 font-bold">{med.dose}</td>
                            <td className="py-2.5 px-3 text-slate-600">{med.timing}</td>
                            <td className="py-2.5 px-3 font-semibold text-slate-800">{med.duration}</td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => handleRemoveMed(index)}
                                className="text-rose-500 hover:text-rose-700 font-bold text-xs p-1"
                                title="Remove Medicine"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Custom Add Medicine Form */}
                  <form onSubmit={handleAddCustomMed} className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
                    <div className="sm:col-span-5">
                      <input
                        type="text"
                        placeholder="Type medicine name (e.g. Tab. Telma 40mg)..."
                        value={customMed.name}
                        onChange={(e) => setCustomMed({ ...customMed, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-600"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="1-0-1"
                        value={customMed.dose}
                        onChange={(e) => setCustomMed({ ...customMed, dose: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs text-slate-800 text-center font-mono focus:outline-none focus:border-teal-600"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        placeholder="After food"
                        value={customMed.timing}
                        onChange={(e) => setCustomMed({ ...customMed, timing: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-600"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <button
                        type="submit"
                        className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 rounded-xl text-xs transition-all shadow-sm"
                      >
                        + Add Med
                      </button>
                    </div>
                  </form>
                </div>

                {/* 3. Recommended Lab & Diagnostic Investigations */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Recommended Diagnostic Investigations (जांचें):
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowLabModal(true)}
                      className="text-xs text-teal-700 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <Icons.Flask className="w-3.5 h-3.5" /> Open Print Requisition
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {commonLabPresets.map(test => {
                      const isSelected = selectedLabTests.includes(test);
                      return (
                        <button
                          key={test}
                          type="button"
                          onClick={() => toggleLabTest(test)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                            isSelected ? 'bg-teal-700 text-white border-teal-800 font-bold shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '} {test}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Advice & Review Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Doctor's Advice & Guidelines:
                    </label>
                    <input
                      type="text"
                      value={adviceNotes}
                      onChange={(e) => setAdviceNotes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Review / Next Follow-up:
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={reviewDays}
                        onChange={(e) => setReviewDays(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-teal-600"
                      >
                        <option value="3">Review in 3 Days</option>
                        <option value="5">Review in 5 Days</option>
                        <option value="7">Review in 7 Days (Free Follow-up)</option>
                        <option value="15">Review in 15 Days</option>
                        <option value="SOS">Review SOS (As Needed)</option>
                      </select>
                      <button
                        onClick={handleCompleteAndNext}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md uppercase tracking-wider"
                      >
                        Complete Consultation →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Cabin Empty State */
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-lg space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Icons.DoorOpen className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="font-display font-extrabold text-2xl text-slate-900">
                Doctor's Cabin is Currently Empty
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {waitingPatients.length > 0
                  ? `There are ${waitingPatients.length} patients waiting outside in the lobby. Click below to call the next patient inside.`
                  : "No patients are currently waiting in the queue. Shift is clear."}
              </p>
              {waitingPatients.length > 0 && (
                <button
                  onClick={callNextInLine}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black px-8 py-4 rounded-2xl text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/25 active:scale-95 transition-all inline-flex items-center gap-2"
                >
                  <Icons.Bell className="w-4 h-4" /> CALL NEXT PATIENT INSIDE (CHIME)
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Realtime Upcoming Patient Roster (Sidebar) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h4 className="font-display font-bold text-sm text-slate-900">
                  Waiting in Lobby ({waitingPatients.length})
                </h4>
                <p className="text-[10px] text-slate-500">Upcoming patients in queue</p>
              </div>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Active Queue
              </span>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {waitingPatients.length > 0 ? (
                waitingPatients.map((pat) => (
                  <div
                    key={pat.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      pat.isEmergency
                        ? 'border-rose-300 bg-rose-50/70 ring-2 ring-rose-200 animate-pulse'
                        : 'border-slate-200 hover:border-teal-400 bg-slate-50/70 hover:bg-teal-50/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-display font-black text-lg text-slate-900 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-xs">
                        #{pat.token < 10 ? `0${pat.token}` : pat.token}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-xs text-slate-900">{pat.name}</p>
                          {pat.isEmergency && (
                            <span className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded inline-flex items-center gap-0.5">
                              <Icons.AlertTriangle className="w-2.5 h-2.5" /> PRIORITY
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">
                          {pat.age}y &bull; {pat.gender} &bull; {pat.symptom}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {!pat.isEmergency && (
                        <button
                          onClick={() => emergencyBumpPatient(pat.id)}
                          className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-[10px] px-2 py-1.5 rounded-lg transition-all inline-flex items-center"
                          title="Bump to Emergency Priority #1"
                        >
                          <Icons.AlertTriangle className="w-3 h-3 text-rose-600" />
                        </button>
                      )}
                      <button
                        onClick={() => callPatient(pat.id)}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg shadow-xs whitespace-nowrap"
                      >
                        Call In →
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  No more patients waiting outside.
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-teal-300 block">
              Shift Consultation Summary
            </span>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 block">Completed Today</span>
                <span className="font-display font-black text-2xl text-emerald-400">{completedPatients.length}</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 block">Waiting Outside</span>
                <span className="font-display font-black text-2xl text-amber-300">{waitingPatients.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prescription Modal (Print Slip) */}
      {printSlipPatient && (
        <OpdPrescriptionModal
          patient={printSlipPatient}
          onClose={() => setPrintSlipPatient(null)}
        />
      )}

      {/* Lab Requisition Modal */}
      {showLabModal && (
        <LabRequisitionModal
          patient={currentPatient}
          diagnosis={diagnosis}
          initialTests={selectedLabTests}
          onClose={() => setShowLabModal(false)}
        />
      )}
    </div>
  );
}
