import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { CLINIC_CONFIG } from '../config/clinic.config';
import { OpdPrescriptionModal } from './OpdPrescriptionSlip';
import { ThermalTokenModal } from './ThermalTokenSlip';
import Icons from './Icons';

export default function TokenBooking() {
  const { bookOnlineToken, check7DayReview } = useQueue();
  const doctor = CLINIC_CONFIG.doctor;

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowStr = tomorrowObj.toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedShift, setSelectedShift] = useState('Morning (10:00 AM - 01:30 PM)');
  const [visitType, setVisitType] = useState('fresh'); // 'fresh' | 'review'

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    symptom: ''
  });

  const [confirmedPatient, setConfirmedPatient] = useState(null);
  const [showOpdModal, setShowOpdModal] = useState(false);
  const [showThermalModal, setShowThermalModal] = useState(false);

  // Check 7-day review auto-match
  const reviewMatch = formData.phone ? check7DayReview(formData.phone) : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.age) return;

    const isReview = visitType === 'review' || !!reviewMatch?.isEligible;

    const booked = bookOnlineToken({
      name: formData.name,
      age: formData.age,
      gender: formData.gender,
      phone: formData.phone,
      symptom: formData.symptom || 'General Consultation',
      shift: selectedShift,
      isReview
    });

    setConfirmedPatient(booked);

    // Direct WhatsApp message formatting
    const tokenFormatted = booked.token < 10 ? `0${booked.token}` : booked.token;
    const message = `*CLINICAL APPOINTMENT & OPD BOARDING PASS*\n\n` +
                    `*Chamber:* ${doctor.clinicName}\n` +
                    `*Physician:* ${doctor.name} (${doctor.degree})\n` +
                    `*Reg. No:* ${doctor.regNo}\n` +
                    `*Allocated Token:* #${tokenFormatted}\n` +
                    `*Patient:* ${formData.name} (${formData.age}y, ${formData.gender})\n` +
                    `*Date:* ${selectedDate}\n` +
                    `*Consultation Shift:* ${selectedShift}\n` +
                    `*Category:* ${isReview ? '7-Day Free Follow-Up Review (₹0)' : `Fresh Consultation (${doctor.consultationFee})`}\n` +
                    `*Chamber Address:* ${doctor.address}\n\n` +
                    `_Please arrive 10 minutes prior to shift window. Present token #${tokenFormatted} at reception desk._`;

    const url = `https://wa.me/${doctor.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const activeTokenNum = confirmedPatient ? confirmedPatient.token : 6;
  const isConfirmed = !!confirmedPatient;

  const displayPatient = confirmedPatient || {
    token: activeTokenNum,
    name: formData.name.trim() || 'Ramesh Chandra Sharma',
    age: formData.age || '42',
    gender: formData.gender || 'Male',
    phone: formData.phone || '+91 98765 43210',
    symptom: formData.symptom || 'Fever, cough & generalized weakness since 2 days',
    date: selectedDate,
    shift: selectedShift,
    isReview: visitType === 'review' || !!reviewMatch?.isEligible
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-200/90 overflow-hidden">
      
      {/* Top Engine Title Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-emerald-400 block">
            OUTPATIENT DEPARTMENT &bull; CHAMBER APPOINTMENT
          </span>
          <h2 className="text-xl sm:text-2xl font-display font-black text-white mt-1">
            Book Confirmed OPD Token Pass
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time digital queuing with instant WhatsApp pass & SMS-free live turn tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            Consultation: <strong className="text-emerald-400">{visitType === 'review' ? '₹0 (Free Review)' : doctor.consultationFee}</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        
        {/* Left Form: Booking Controls */}
        <div className="lg:col-span-7 p-6 sm:p-8 space-y-5">
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* 1. Date Selector Tabs */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Select Consultation Date:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDate(todayStr)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedDate === todayStr
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <span className="text-[10px] uppercase font-mono block opacity-70">Today</span>
                  <span className="font-bold text-xs mt-0.5 block">Today's OPD</span>
                  <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">Active Now</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDate(tomorrowStr)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedDate === tomorrowStr
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <span className="text-[10px] uppercase font-mono block opacity-70">Tomorrow</span>
                  <span className="font-bold text-xs mt-0.5 block">Tomorrow</span>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Advance Pass</span>
                </button>

                <div className="col-span-2 sm:col-span-1">
                  <input
                    type="date"
                    min={todayStr}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full h-full min-h-[58px] bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-800 font-bold focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* 2. Shift Slot Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                2. Select Consultation Shift:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedShift.includes('Morning')
                    ? 'border-slate-900 bg-slate-50 text-slate-900 ring-1 ring-slate-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="shift"
                      checked={selectedShift.includes('Morning')}
                      onChange={() => setSelectedShift('Morning (10:00 AM - 01:30 PM)')}
                      className="text-slate-900"
                    />
                    <div>
                      <span className="font-bold text-xs block">Morning Shift</span>
                      <span className="text-[10px] text-slate-500 font-mono">10:00 AM &ndash; 01:30 PM</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                    Fast Filling
                  </span>
                </label>

                <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedShift.includes('Evening')
                    ? 'border-slate-900 bg-slate-50 text-slate-900 ring-1 ring-slate-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="shift"
                      checked={selectedShift.includes('Evening')}
                      onChange={() => setSelectedShift('Evening (05:30 PM - 08:30 PM)')}
                      className="text-slate-900"
                    />
                    <div>
                      <span className="font-bold text-xs block">Evening Shift</span>
                      <span className="text-[10px] text-slate-500 font-mono">05:30 PM &ndash; 08:30 PM</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    Open
                  </span>
                </label>
              </div>
            </div>

            {/* 3. Visit Type (Fresh vs 7-Day Free Review) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                3. Consultation Category:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVisitType('fresh')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                    visitType === 'fresh' && !reviewMatch?.isEligible
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Fresh Consultation ({doctor.consultationFee})
                </button>
                <button
                  type="button"
                  onClick={() => setVisitType('review')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                    visitType === 'review' || !!reviewMatch?.isEligible
                      ? 'bg-emerald-700 text-white border-emerald-800'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  7-Day Follow-Up (₹0 Free)
                </button>
              </div>
            </div>

            {/* 4. Patient Particulars */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Patient Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Age</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 42"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-slate-900"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Child">Child</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">WhatsApp (+91)</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              {/* 7-Day Auto Alert Banner if Phone Matches */}
              {reviewMatch && reviewMatch.isEligible && (
                <div className="bg-emerald-50 border border-emerald-300 p-2.5 rounded-xl text-[11px] text-emerald-900 flex items-center gap-2">
                  <Icons.CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Previous consultation verified ({reviewMatch.daysAgo} days ago for "{reviewMatch.previousDiagnosis}"). <strong>Consultation Fee is ₹0</strong>.
                  </span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Health Complaints / Symptoms
                </label>
                <input
                  type="text"
                  placeholder="e.g. High fever, cough, joint pain, BP review"
                  value={formData.symptom}
                  onChange={(e) => setFormData({ ...formData, symptom: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Icons.ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Confirm & Generate Digital Token Pass</span>
            </button>
          </form>

        </div>

        {/* Right Preview: High-End Hospital Digital OPD Boarding Pass */}
        <div className="lg:col-span-5 p-6 sm:p-8 bg-slate-50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-slate-500">
                OFFICIAL OPD BOARDING PASS
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                NMC Verified Chamber
              </span>
            </div>

            {/* The Ticket Pass Paper Container */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-md space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-slate-900"></div>

              {/* Pass Header */}
              <div className="flex justify-between items-start pb-3 border-b border-slate-200">
                <div>
                  <h4 className="font-display font-black text-sm text-slate-900 uppercase">
                    {doctor.clinicName}
                  </h4>
                  <p className="text-[11px] text-slate-600 font-medium">{doctor.name} &bull; {doctor.degree}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Reg: {doctor.regNo}</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase">TOKEN NO.</span>
                  <span className="font-display font-black text-3xl text-slate-900 font-mono">
                    #{activeTokenNum < 10 ? '0' + activeTokenNum : activeTokenNum}
                  </span>
                </div>
              </div>

              {/* Patient Meta */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px]">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-mono block">Patient Name</span>
                  <span className="font-bold text-slate-900 truncate block">{displayPatient.name}</span>
                  <span className="text-[10px] text-slate-500">{displayPatient.age}y / {displayPatient.gender}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-400 uppercase font-mono block">Consultation Shift</span>
                  <span className="font-bold text-slate-900 block">{displayPatient.shift.split('(')[0]}</span>
                  <span className="text-[10px] text-slate-500">{displayPatient.date}</span>
                </div>
              </div>

              {/* Concern */}
              <div className="text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[9px] text-slate-400 uppercase font-mono block">Clinical Presentation / Symptoms</span>
                <span className="font-semibold text-slate-800 italic block mt-0.5">"{displayPatient.symptom}"</span>
              </div>

              {/* Realistic Barcode Raster Simulation */}
              <div className="pt-2 flex flex-col items-center justify-center">
                <div className="flex items-center gap-[2px] h-8 w-full max-w-[240px] justify-center bg-slate-100 p-1 rounded">
                  {[3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3, 2, 3, 8, 4, 6, 2, 6, 4, 3, 3, 8, 3, 2, 7, 9].map((w, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900 h-full"
                      style={{ width: `${(w % 3) + 1.2}px` }}
                    ></div>
                  ))}
                </div>
                <span className="text-[9px] font-mono text-slate-400 mt-1 tracking-widest uppercase">
                  OPD-{activeTokenNum < 10 ? '0' + activeTokenNum : activeTokenNum}-{displayPatient.date.replace(/-/g, '')}
                </span>
              </div>
            </div>

            {/* Reporting Instructions */}
            <div className="mt-4 p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <p className="font-bold text-slate-800">Arrival Guidelines:</p>
              <p>&bull; Arrive 10 minutes prior to scheduled shift window.</p>
              <p>&bull; Present token #{activeTokenNum} at reception to complete vitals.</p>
              <p>&bull; 7-Day Free Follow-up review valid with this pass.</p>
            </div>
          </div>

          {/* Print Triggers */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-mono text-slate-500">
              Fee: <strong className="text-slate-900">{displayPatient.isReview ? '₹0 (Review)' : `${doctor.consultationFee} at desk`}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowThermalModal(true)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold px-3 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5"
                title="Print 3-inch POS Thermal Slip"
              >
                <Icons.Printer className="w-3.5 h-3.5" />
                <span>Thermal Slip</span>
              </button>
              <button
                type="button"
                onClick={() => setShowOpdModal(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5"
              >
                <Icons.FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>View OPD Parchi</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Official OPD Prescription Slip Modal */}
      {showOpdModal && (
        <OpdPrescriptionModal
          patient={displayPatient}
          onClose={() => setShowOpdModal(false)}
        />
      )}

      {/* 2-Inch / 3-Inch Thermal POS Slip Modal */}
      {showThermalModal && (
        <ThermalTokenModal
          patient={displayPatient}
          onClose={() => setShowThermalModal(false)}
        />
      )}
    </div>
  );
}
