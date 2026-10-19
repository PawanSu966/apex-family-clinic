import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { CLINIC_CONFIG } from '../config/clinic.config';
import { OpdPrescriptionModal } from './OpdPrescriptionSlip';
import { ThermalTokenModal } from './ThermalTokenSlip';
import Icons from './Icons';

/**
 * =========================================================================
 * CLINIC OS: RECEPTION DESK & COMPOUNDER TRIAGE TERMINAL
 * =========================================================================
 * Designed for fast, high-density hospital triage & front-desk queue control.
 * High contrast, compact clinical tables, zero-latency actions, instant print.
 */
export default function CompounderRemote({ onExit, onOpenTv, onOpenDoctor, onOpenRegister, onOpenPharmacy }) {
  const {
    patients, currentPatient, servingToken, doctorStatus, setDoctorStatus,
    callPatient, callNextInLine, completePatient, skipPatient, addWalkInPatient,
    emergencyBumpPatient, check7DayReview, playHospitalChime
  } = useQueue();
  const doctor = CLINIC_CONFIG.doctor;

  const [filterTab, setFilterTab] = useState('active'); // 'active' | 'waiting' | 'emergency' | 'completed' | 'all'
  const [searchTerm, setSearchTerm] = useState('');
  const [showWalkInModal, setShowWalkInModal] = useState(false);

  // Fast Walk-in form state
  const [walkInForm, setWalkInForm] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    symptom: '',
    isEmergency: false,
    isReview: false
  });

  const [printSlipPatient, setPrintSlipPatient] = useState(null);
  const [printThermalPatient, setPrintThermalPatient] = useState(null);

  // 7-Day Free Review Auto-Check
  const reviewEligibility = walkInForm.phone ? check7DayReview(walkInForm.phone) : null;

  // Filter & Search Logic
  const filteredPatients = patients.filter(p => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term ||
      p.name.toLowerCase().includes(term) ||
      p.token.toString() === term ||
      (p.phone && p.phone.includes(term)) ||
      (p.symptom && p.symptom.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    if (filterTab === 'active') return p.status === 'serving' || p.status === 'waiting';
    if (filterTab === 'waiting') return p.status === 'waiting';
    if (filterTab === 'emergency') return p.isEmergency && p.status === 'waiting';
    if (filterTab === 'completed') return p.status === 'completed';
    return true; // 'all'
  });

  const handleAddWalkIn = (e) => {
    e.preventDefault();
    if (!walkInForm.name.trim() || !walkInForm.age) {
      alert('Please enter patient name and age.');
      return;
    }

    const isAutoReview = reviewEligibility?.isEligible || walkInForm.isReview;

    const newPat = addWalkInPatient({
      ...walkInForm,
      isReview: isAutoReview
    });

    // Optionally auto-open thermal print slip
    setPrintThermalPatient(newPat);

    setWalkInForm({ name: '', age: '', gender: 'Male', phone: '', symptom: '', isEmergency: false, isReview: false });
    setShowWalkInModal(false);
  };

  // Queue Statistics
  const totalCount = patients.length;
  const waitingCount = patients.filter(p => p.status === 'waiting').length;
  const completedCount = patients.filter(p => p.status === 'completed').length;
  const emergencyCount = patients.filter(p => p.isEmergency && p.status === 'waiting').length;
  const servingCount = patients.filter(p => p.status === 'serving').length;

  return (
    <div className="w-full max-w-[1440px] mx-auto space-y-4 font-sans text-slate-800">

      {/* ========================================================================= */}
      {/* 1. TOP CLINICAL RECEPTION CONTROL BAR                                     */}
      {/* ========================================================================= */}
      <header className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Terminal Brand & Live Presence */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 flex items-center justify-center font-bold shadow-xs">
            <Icons.Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                RECEPTION & TRIAGE DESK
              </span>
              <span className="text-slate-500 text-xs">&bull;</span>
              <span className="text-slate-400 text-xs font-mono">
                {doctor.morningShift}
              </span>
            </div>
            <h1 className="font-display font-black text-lg sm:text-xl text-white tracking-tight">
              {doctor.clinicName}
            </h1>
          </div>
        </div>

        {/* Center: Doctor Presence Quick-Toggle */}
        <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 font-medium text-[11px] uppercase tracking-wider">
            Dr. Status:
          </span>
          <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setDoctorStatus('in_cabin')}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                doctorStatus === 'in_cabin'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
              In Cabin
            </button>
            <button
              onClick={() => setDoctorStatus('break')}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                doctorStatus === 'break'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-300"></span>
              On Break
            </button>
          </div>
        </div>

        {/* Right: Quick Station Switchers & Primary Action */}
        <div className="flex items-center gap-2 flex-wrap ml-auto">
          <button
            onClick={() => setShowWalkInModal(true)}
            className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 transition-all"
          >
            <Icons.Plus className="w-4 h-4 text-slate-950" />
            <span>Walk-In Registration</span>
          </button>

          {onOpenDoctor && (
            <button
              onClick={onOpenDoctor}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Switch to Doctor Cabin Consultation Terminal"
            >
              <Icons.Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Doctor Cabin</span>
            </button>
          )}

          {onOpenPharmacy && (
            <button
              onClick={onOpenPharmacy}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Open Pharmacy Counter"
            >
              <Icons.Pill className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Pharmacy</span>
            </button>
          )}

          {onOpenRegister && (
            <button
              onClick={onOpenRegister}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Daily Accounts Register"
            >
              <Icons.FileText className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Accounts</span>
            </button>
          )}

          {onOpenTv && (
            <button
              onClick={onOpenTv}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Launch Fullscreen Waiting TV Display"
            >
              <Icons.Tv className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden md:inline">TV Screen</span>
            </button>
          )}

          {onExit && (
            <button
              onClick={onExit}
              className="bg-slate-800/80 hover:bg-rose-950 text-slate-400 hover:text-rose-300 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
              title="Return to Public Patient Portal"
            >
              ✕ Exit Desk
            </button>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. REAL-TIME CONSULTATION CABIN 1 CONTROL CONSOLE                         */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          
          {/* Left: Active Consultation Summary */}
          <div className="lg:col-span-7 flex items-start gap-4">
            {/* Big High-Contrast Token Display */}
            <div className="bg-slate-900 text-white rounded-xl p-3 sm:p-4 text-center min-w-[90px] sm:min-w-[110px] shrink-0 border border-slate-800 shadow-xs">
              <span className="block text-[9px] uppercase font-mono tracking-widest text-emerald-400 font-bold">
                SERVING NOW
              </span>
              <span className="font-display font-black text-3xl sm:text-4xl text-amber-300 tracking-tight block my-0.5">
                #{servingToken < 10 ? `0${servingToken}` : servingToken}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block">
                CABIN 1
              </span>
            </div>

            {/* Current Patient Identity & Triage Notes */}
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-bold text-base sm:text-lg text-slate-900 truncate">
                  {currentPatient ? currentPatient.name : 'No patient currently inside'}
                </h2>
                {currentPatient?.isEmergency && (
                  <span className="bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider animate-pulse flex items-center gap-1">
                    <Icons.AlertTriangle className="w-2.5 h-2.5" /> Emergency
                  </span>
                )}
                {currentPatient?.isReview && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-300">
                    7-Day Free Review (₹0)
                  </span>
                )}
              </div>

              {currentPatient ? (
                <>
                  <p className="text-xs text-slate-600 flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{currentPatient.age}y / {currentPatient.gender}</span>
                    <span>&bull;</span>
                    <span className="font-mono text-slate-600">{currentPatient.phone || 'Walk-In'}</span>
                    <span>&bull;</span>
                    <span className="text-slate-500">Source: {currentPatient.source}</span>
                  </p>
                  
                  {/* Chief complaints & vitals */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs pt-1 border-t border-slate-100 text-slate-600">
                    <div>
                      <span className="text-slate-400 font-semibold text-[10px] uppercase">Complaint: </span>
                      <span className="font-medium text-slate-800 italic">"{currentPatient.symptom}"</span>
                    </div>
                    {currentPatient.vitals && (
                      <div className="flex items-center gap-2 font-mono text-[11px] text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        <span>BP: <b>{currentPatient.vitals.bp || '120/80'}</b></span>
                        <span>Pulse: <b>{currentPatient.vitals.pulse || '74'}</b></span>
                        <span>SpO2: <b>{currentPatient.vitals.spo2 || '99'}%</b></span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-500 pt-1">
                  Doctor is ready. Click "Call Next Patient" to notify the next person in line via Ding-Dong hospital chime and waiting room TV.
                </p>
              )}
            </div>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="lg:col-span-5 flex flex-wrap items-center justify-start lg:justify-end gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            {/* Call Next Patient Primary Action */}
            <button
              onClick={callNextInLine}
              className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold px-4 sm:px-5 py-3 rounded-xl text-xs uppercase tracking-wider shadow-sm flex items-center gap-2 transition-all"
            >
              <Icons.Volume2 className="w-4 h-4 text-emerald-200" />
              <span>Call Next In Line</span>
            </button>

            {/* Mark Done (if patient is in cabin) */}
            {currentPatient && (
              <button
                onClick={() => completePatient(currentPatient.id)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-3 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <Icons.Check className="w-4 h-4 text-emerald-400" />
                <span>Mark Done</span>
              </button>
            )}

            {/* Print Slip Shortcut */}
            {currentPatient && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPrintSlipPatient(currentPatient)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold px-3 py-3 rounded-xl text-xs flex items-center gap-1 transition-all"
                  title="Print Official Doctor's OPD Prescription Slip"
                >
                  <Icons.Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>OPD Slip</span>
                </button>
                <button
                  onClick={() => setPrintThermalPatient(currentPatient)}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold px-3 py-3 rounded-xl text-xs flex items-center gap-1 transition-all"
                  title="Print 58mm Thermal POS Queue Slip"
                >
                  <Icons.Receipt className="w-3.5 h-3.5 text-amber-700" />
                  <span>Thermal</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. TWO-COLUMN ASYMMETRIC WORKSPACE (Queue Grid + Sidebar Utility)         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* ======================================================================= */}
        {/* LEFT COLUMN: MASTER QUEUE ROSTER & TRIAGE ACTIONS (8 cols)              */}
        {/* ======================================================================= */}
        <section className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          
          {/* Queue Filter Bar & Search */}
          <div className="p-3.5 sm:p-4 border-b border-slate-200/80 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
            
            {/* Segmented Filter Tabs */}
            <div className="flex bg-slate-200/80 p-0.5 rounded-xl text-xs font-bold gap-0.5 overflow-x-auto max-w-full">
              <button
                onClick={() => setFilterTab('active')}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  filterTab === 'active'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Active ({waitingCount + servingCount})
              </button>

              <button
                onClick={() => setFilterTab('waiting')}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  filterTab === 'waiting'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Waiting Lobby ({waitingCount})
              </button>

              {emergencyCount > 0 && (
                <button
                  onClick={() => setFilterTab('emergency')}
                  className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap bg-rose-600 text-white shadow-xs animate-pulse`}
                >
                  Emergency ({emergencyCount})
                </button>
              )}

              <button
                onClick={() => setFilterTab('completed')}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  filterTab === 'completed'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Done ({completedCount})
              </button>

              <button
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  filterTab === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({totalCount})
              </button>
            </div>

            {/* Live Search */}
            <div className="relative w-full sm:w-64">
              <span className="absolute left-3 top-2.5 text-slate-400">
                <Icons.Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                placeholder="Search name, token #, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

          </div>

          {/* High-Density Tabular Queue */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 w-14">Token</th>
                  <th className="py-2.5 px-3">Patient Details</th>
                  <th className="py-2.5 px-3 w-32">Wait / Cabin</th>
                  <th className="py-2.5 px-3">Chief Concern & Vitals</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((pat) => {
                    const waitingMins = pat.registeredAt
                      ? Math.max(1, Math.floor((Date.now() - pat.registeredAt) / 60000))
                      : 10;

                    const isServing = pat.status === 'serving';
                    const isWaiting = pat.status === 'waiting';
                    const isCompleted = pat.status === 'completed';
                    const isSkipped = pat.status === 'skipped';

                    return (
                      <tr
                        key={pat.id}
                        className={`transition-colors ${
                          isServing
                            ? 'bg-emerald-50/70 border-l-4 border-l-emerald-600'
                            : pat.isEmergency && isWaiting
                            ? 'bg-rose-50/80 border-l-4 border-l-rose-600'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Token # */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-display font-black text-sm sm:text-base text-slate-900 font-mono">
                              #{pat.token < 10 ? `0${pat.token}` : pat.token}
                            </span>
                            {pat.isEmergency && (
                              <span className="bg-rose-600 text-white text-[8px] font-black px-1 py-0.2 rounded uppercase animate-pulse">
                                EM
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Patient Details + Source Tag */}
                        <td className="py-2.5 px-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900 text-xs">
                                {pat.name}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                                  pat.source === 'Online'
                                    ? 'bg-teal-50 text-teal-700 border-teal-200'
                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}
                              >
                                {pat.source === 'Online' ? 'Online' : 'Walk-In'}
                              </span>
                              {pat.isReview && (
                                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded border border-emerald-300">
                                  7d Free Review
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 font-mono">
                              {pat.age}y &bull; {pat.gender} &bull; {pat.phone || 'Walk-In'}
                            </p>
                          </div>
                        </td>

                        {/* Waiting Time / Lobby Duration / Cabin */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {isWaiting ? (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded inline-flex items-center gap-1 font-mono ${
                                pat.isEmergency
                                  ? 'bg-rose-600 text-white animate-pulse'
                                  : waitingMins > 25
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : waitingMins > 15
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              <Icons.Clock className="w-3 h-3" />
                              {waitingMins}m in lobby
                            </span>
                          ) : isServing ? (
                            <span className="text-emerald-700 font-bold text-[10px] bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                              In Cabin 1
                            </span>
                          ) : isCompleted ? (
                            <span className="text-slate-500 text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded">
                              ✓ Completed
                            </span>
                          ) : (
                            <span className="text-rose-600 text-[10px] font-mono bg-rose-50 px-2 py-0.5 rounded">
                              ✕ Skipped
                            </span>
                          )}
                        </td>

                        {/* Concern / Symptoms + Vitals */}
                        <td className="py-2.5 px-3 max-w-[200px]">
                          <p className="text-xs text-slate-800 truncate" title={pat.symptom}>
                            {pat.symptom || 'General Consultation'}
                          </p>
                          {pat.vitals && (
                            <span className="text-[10px] font-mono text-slate-500 block truncate">
                              BP {pat.vitals.bp || '120/80'} &bull; SpO2 {pat.vitals.spo2 || '99'}%
                            </span>
                          )}
                        </td>

                        {/* Action Buttons Matrix */}
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* Call In Button (if waiting) */}
                            {isWaiting && (
                              <button
                                onClick={() => callPatient(pat.id)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1 active:scale-95"
                                title="Call patient into Cabin 1"
                              >
                                <span>Call In</span>
                                <Icons.ArrowRight className="w-3 h-3" />
                              </button>
                            )}

                            {/* Mark Done (if serving) */}
                            {isServing && (
                              <button
                                onClick={() => completePatient(pat.id)}
                                className="bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                              >
                                <Icons.Check className="w-3 h-3 text-emerald-400" />
                                <span>Done</span>
                              </button>
                            )}

                            {/* Print Official OPD Slip */}
                            <button
                              onClick={() => setPrintSlipPatient(pat)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1"
                              title="Print Official Doctor's OPD Prescription Slip (ओपीडी पर्ची)"
                            >
                              <Icons.Printer className="w-3 h-3 text-slate-600" />
                              <span>Parchi</span>
                            </button>

                            {/* Print 58mm Thermal Ticket */}
                            <button
                              onClick={() => setPrintThermalPatient(pat)}
                              className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1"
                              title="Print 58mm Thermal POS Token Slip"
                            >
                              <Icons.Receipt className="w-3 h-3 text-amber-700" />
                              <span>Slip</span>
                            </button>

                            {/* Emergency Bump Toggle (if waiting & not already emergency) */}
                            {isWaiting && !pat.isEmergency && (
                              <button
                                onClick={() => emergencyBumpPatient(pat.id)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 p-1 rounded-lg text-[11px] font-bold transition-colors flex items-center"
                                title="Promote patient to #1 Priority Triage"
                              >
                                <Icons.AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              </button>
                            )}

                            {/* Skip Button */}
                            {isWaiting && (
                              <button
                                onClick={() => skipPatient(pat.id)}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                                title="Mark patient as skipped/absent"
                              >
                                <Icons.X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400">
                      <div className="space-y-1.5">
                        <Icons.Search className="w-6 h-6 mx-auto text-slate-300" />
                        <p className="text-xs font-semibold text-slate-500">No patient records match your filter.</p>
                        <p className="text-[11px] text-slate-400">Try selecting a different filter tab or clear search query.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Summary */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200/80 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2 font-mono">
            <span>Showing {filteredPatients.length} of {totalCount} total patient records today</span>
            <span>National Medical Commission (NMC) Ambulatory Standards Compliant</span>
          </div>

        </section>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN: TRIAGE VELOCITY & IN-PAGE FAST WALK-IN ENTRY (4 cols)     */}
        {/* ======================================================================= */}
        <aside className="lg:col-span-4 space-y-4">
          
          {/* Quick Metrics Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>OPD Shift Velocity</span>
              <span className="text-emerald-700 font-mono text-[11px] font-bold">LIVE METRICS</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Total OPD</span>
                <span className="font-display font-black text-2xl text-slate-900 mt-0.5 block">{totalCount}</span>
                <span className="text-[10px] text-slate-400 block">Registered</span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/70">
                <span className="text-[10px] text-amber-700 font-bold uppercase block">Waiting Lobby</span>
                <span className="font-display font-black text-2xl text-amber-800 mt-0.5 block">{waitingCount}</span>
                <span className="text-[10px] text-amber-600 block">Est: ~{waitingCount * doctor.avgMinsPerPatient} mins</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/70">
                <span className="text-[10px] text-emerald-700 font-bold uppercase block">Completed</span>
                <span className="font-display font-black text-2xl text-emerald-800 mt-0.5 block">{completedCount}</span>
                <span className="text-[10px] text-emerald-600 block">Consulted</span>
              </div>

              <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/70">
                <span className="text-[10px] text-rose-700 font-bold uppercase block">Emergency</span>
                <span className="font-display font-black text-2xl text-rose-800 mt-0.5 block">{emergencyCount}</span>
                <span className="text-[10px] text-rose-600 block">Priority #1</span>
              </div>
            </div>
          </div>

          {/* In-Page Quick Walk-In Registration Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Quick Walk-In Entry
                </h3>
                <p className="text-[11px] text-slate-500">Fast token & triage parchi generation</p>
              </div>
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                +
              </span>
            </div>

            <form onSubmit={handleAddWalkIn} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Patient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={walkInForm.name}
                  onChange={(e) => setWalkInForm({ ...walkInForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Age *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 42"
                    value={walkInForm.age}
                    onChange={(e) => setWalkInForm({ ...walkInForm, age: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Gender</label>
                  <select
                    value={walkInForm.gender}
                    onChange={(e) => setWalkInForm({ ...walkInForm, gender: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Child">Child</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Mobile (Auto 7d Check)
                </label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={walkInForm.phone}
                  onChange={(e) => setWalkInForm({ ...walkInForm, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* 7-Day Free Follow-up Notification */}
              {reviewEligibility && reviewEligibility.isEligible && (
                <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-2 text-emerald-950 text-[11px] leading-tight space-y-0.5">
                  <div className="font-bold text-emerald-800 flex items-center gap-1">
                    <Icons.CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>7-Day Free Review Match!</span>
                  </div>
                  <p className="text-slate-600">
                    Visited {reviewEligibility.daysAgo === 0 ? 'today' : `${reviewEligibility.daysAgo}d ago`}. Consultation Fee: <b>₹0</b>
                  </p>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Chief Symptom</label>
                <input
                  type="text"
                  placeholder="e.g. Fever, cough, BP follow-up"
                  value={walkInForm.symptom}
                  onChange={(e) => setWalkInForm({ ...walkInForm, symptom: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Triage Flags */}
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 space-y-1.5 text-[11px]">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={walkInForm.isEmergency}
                    onChange={(e) => setWalkInForm({ ...walkInForm, isEmergency: e.target.checked })}
                    className="w-3.5 h-3.5 text-rose-600 rounded"
                  />
                  <span className="font-bold text-rose-700 flex items-center gap-1">
                    <Icons.AlertTriangle className="w-3 h-3 text-rose-600" />
                    Emergency Priority #1
                  </span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={walkInForm.isReview || !!reviewEligibility?.isEligible}
                    onChange={(e) => setWalkInForm({ ...walkInForm, isReview: e.target.checked })}
                    className="w-3.5 h-3.5 text-emerald-600 rounded"
                  />
                  <span className="font-bold text-emerald-800 flex items-center gap-1">
                    <Icons.RefreshCw className="w-3 h-3 text-emerald-600" />
                    7-Day Free Review (₹0)
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <Icons.Receipt className="w-3.5 h-3.5" />
                <span>Issue Token & Print Slip</span>
              </button>
            </form>
          </div>

          {/* Quick Audio & Waiting Display Shortcuts */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-3.5 text-xs space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Audio & TV Peripherals
            </span>
            <div className="flex gap-2">
              <button
                onClick={playHospitalChime}
                className="w-1/2 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                title="Synthesize high/low E5-C5 Ding Dong hospital chime"
              >
                <Icons.Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Test Chime</span>
              </button>
              {onOpenTv && (
                <button
                  onClick={onOpenTv}
                  className="w-1/2 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Icons.Tv className="w-3.5 h-3.5 text-teal-600" />
                  <span>TV Screen</span>
                </button>
              )}
            </div>
          </div>

        </aside>

      </div>

      {/* ========================================================================= */}
      {/* 4. MODALS (Walk-In Dialog, Thermal Ticket, Official OPD Parchi)           */}
      {/* ========================================================================= */}
      
      {/* Full Walk-In Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">
                  Register Walk-In Patient
                </h3>
                <p className="text-xs text-slate-500">Fast front-desk token allocation & triage</p>
              </div>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddWalkIn} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={walkInForm.name}
                  onChange={(e) => setWalkInForm({ ...walkInForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 45"
                    value={walkInForm.age}
                    onChange={(e) => setWalkInForm({ ...walkInForm, age: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={walkInForm.gender}
                    onChange={(e) => setWalkInForm({ ...walkInForm, gender: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Child">Child</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mobile Number (Checks 7-Day Free Review)
                </label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={walkInForm.phone}
                  onChange={(e) => setWalkInForm({ ...walkInForm, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {reviewEligibility && reviewEligibility.isEligible && (
                <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-2.5 text-emerald-950 text-xs">
                  <div className="flex items-center gap-1 font-bold text-emerald-800">
                    <Icons.CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>7-Day Free Review Verified!</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Patient last visited {reviewEligibility.daysAgo === 0 ? 'earlier today' : `${reviewEligibility.daysAgo} days ago`}. Consultation Fee: <b>₹0</b>.
                  </p>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Main Concern / Symptom</label>
                <input
                  type="text"
                  placeholder="e.g. Acute Fever & Chills since 2 days"
                  value={walkInForm.symptom}
                  onChange={(e) => setWalkInForm({ ...walkInForm, symptom: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={walkInForm.isEmergency}
                    onChange={(e) => setWalkInForm({ ...walkInForm, isEmergency: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span className="font-bold text-rose-700 flex items-center gap-1.5">
                    <Icons.AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    Emergency Priority #1 Triage
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={walkInForm.isReview || !!reviewEligibility?.isEligible}
                    onChange={(e) => setWalkInForm({ ...walkInForm, isReview: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                    <Icons.RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                    7-Day Free Review Visit (Fee: ₹0)
                  </span>
                </label>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="w-1/2 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold shadow-sm transition-all"
                >
                  Allocate Token & Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Doctor's OPD Prescription Slip Modal */}
      {printSlipPatient && (
        <OpdPrescriptionModal
          patient={printSlipPatient}
          onClose={() => setPrintSlipPatient(null)}
        />
      )}

      {/* 2-Inch Thermal POS Receipt Modal */}
      {printThermalPatient && (
        <ThermalTokenModal
          patient={printThermalPatient}
          onClose={() => setPrintThermalPatient(null)}
        />
      )}

    </div>
  );
}
