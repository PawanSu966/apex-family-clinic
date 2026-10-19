import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { CLINIC_CONFIG } from '../config/clinic.config';
import { OpdPrescriptionModal } from './OpdPrescriptionSlip';
import { ThermalTokenModal } from './ThermalTokenSlip';
import Icons from './Icons';

export default function CompounderRemote({ onExit, onOpenTv, onOpenDoctor, onOpenRegister, onOpenPharmacy }) {
  const {
    patients, currentPatient, servingToken, doctorStatus, setDoctorStatus,
    callPatient, callNextInLine, completePatient, skipPatient, addWalkInPatient,
    emergencyBumpPatient, check7DayReview, resetDay
  } = useQueue();
  const doctor = CLINIC_CONFIG.doctor;

  const [filterTab, setFilterTab] = useState('active'); // 'active' | 'waiting' | 'completed' | 'all'
  const [searchTerm, setSearchTerm] = useState('');
  const [showWalkInModal, setShowWalkInModal] = useState(false);
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

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.token.toString() === searchTerm.trim();
    if (filterTab === 'active') return matchesSearch && (p.status === 'serving' || p.status === 'waiting');
    if (filterTab === 'waiting') return matchesSearch && p.status === 'waiting';
    if (filterTab === 'completed') return matchesSearch && p.status === 'completed';
    return matchesSearch;
  });

  const handleAddWalkIn = (e) => {
    e.preventDefault();
    if (!walkInForm.name || !walkInForm.age) return;

    const isAutoReview = reviewEligibility?.isEligible || walkInForm.isReview;

    addWalkInPatient({
      ...walkInForm,
      isReview: isAutoReview
    });

    setWalkInForm({ name: '', age: '', gender: 'Male', phone: '', symptom: '', isEmergency: false, isReview: false });
    setShowWalkInModal(false);
  };

  const totalCount = patients.length;
  const waitingCount = patients.filter(p => p.status === 'waiting').length;
  const completedCount = patients.filter(p => p.status === 'completed').length;
  const emergencyCount = patients.filter(p => p.isEmergency && p.status === 'waiting').length;

  return (
    <div className="max-w-6xl mx-auto w-full p-4 sm:p-6 space-y-6">
      {/* Top Bar */}
      <div className="no-print bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-teal-300">
              Receptionist & Compounder OPD Terminal
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-black text-white mt-1">
            {doctor.clinicName}
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowWalkInModal(true)}
            className="bg-teal-600 hover:bg-teal-500 text-white px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <Icons.Plus className="w-3.5 h-3.5" /> Walk-in Token
          </button>
          {onOpenDoctor && (
            <button
              onClick={onOpenDoctor}
              className="bg-slate-800 hover:bg-slate-700 text-teal-300 px-3 py-2.5 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5"
            >
              <Icons.Stethoscope className="w-3.5 h-3.5" /> Doctor Cabin
            </button>
          )}
          {onOpenPharmacy && (
            <button
              onClick={onOpenPharmacy}
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 px-3 py-2.5 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5"
            >
              <Icons.Pill className="w-3.5 h-3.5" /> Pharmacy
            </button>
          )}
          {onOpenRegister && (
            <button
              onClick={onOpenRegister}
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 px-3 py-2.5 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5"
            >
              <Icons.FileText className="w-3.5 h-3.5" /> Daily Register
            </button>
          )}
          {onOpenTv && (
            <button
              onClick={onOpenTv}
              className="bg-slate-800 hover:bg-slate-700 text-teal-300 px-3 py-2.5 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5"
            >
              <Icons.Tv className="w-3.5 h-3.5" /> TV Screen
            </button>
          )}
          {onExit && (
            <button
              onClick={onExit}
              className="bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 px-3 py-2.5 rounded-xl text-xs font-semibold border border-slate-700"
            >
              ✕ Exit Desk
            </button>
          )}
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="no-print grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Registered</p>
          <p className="font-display font-black text-3xl text-slate-900 mt-1">{totalCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Waiting in Lobby</p>
            {emergencyCount > 0 && (
              <span className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded animate-pulse">
                {emergencyCount} Emergency
              </span>
            )}
          </div>
          <p className="font-display font-black text-3xl text-amber-600 mt-1">{waitingCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Consultations Done</p>
          <p className="font-display font-black text-3xl text-emerald-600 mt-1">{completedCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700">Doctor Presence</p>
          <div className="flex gap-1.5 mt-2">
            <button
              onClick={() => setDoctorStatus('in_cabin')}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                doctorStatus === 'in_cabin' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              In Cabin
            </button>
            <button
              onClick={() => setDoctorStatus('break')}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                doctorStatus === 'break' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Break
            </button>
          </div>
        </div>
      </div>

      {/* Main Calling Remote Console */}
      <div className="no-print bg-gradient-to-br from-hospital-navy via-slate-900 to-teal-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-teal-300">
              Cabin 1 Consultation Room Status
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-3xl font-display font-black text-emerald-400">
                Token #{servingToken < 10 ? `0${servingToken}` : servingToken}
              </span>
              <span className="text-slate-400 font-medium text-sm">
                &bull; {currentPatient ? currentPatient.name : 'Waiting for next patient'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={callNextInLine}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <Icons.Bell className="w-4 h-4" /> Call Next Patient (Chime)
            </button>
            {currentPatient && (
              <button
                onClick={() => completePatient(currentPatient.id)}
                className="bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 font-bold px-4 py-3.5 rounded-2xl text-xs flex items-center gap-1.5"
              >
                <Icons.Check className="w-3.5 h-3.5 text-emerald-400" /> Mark Done
              </button>
            )}
          </div>
        </div>

        {/* Current Patient Vitals Bar */}
        {currentPatient && (
          <div className="mt-4 pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Symptoms:</span>
              <span className="font-semibold text-white">"{currentPatient.symptom}"</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span>BP: <b>120/80</b></span>
              <span>Pulse: <b>74</b></span>
              <span>Temp: <b>98.6°F</b></span>
              <span>SpO2: <b>99%</b></span>
            </div>
          </div>
        )}
      </div>

      {/* Patient Queue Management Table */}
      <div className="no-print bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Filter Tabs and Search */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold gap-1">
            <button
              onClick={() => setFilterTab('active')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterTab === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active Queue
            </button>
            <button
              onClick={() => setFilterTab('waiting')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterTab === 'waiting' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Waiting Only ({waitingCount})
            </button>
            <button
              onClick={() => setFilterTab('completed')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterTab === 'completed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed ({completedCount})
            </button>
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Records ({totalCount})
            </button>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by name or token..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-600"
            />
          </div>
        </div>

        {/* Patients Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Token</th>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Age / Sex</th>
                <th className="py-3 px-4">Waiting Time</th>
                <th className="py-3 px-4">Concern / Symptoms</th>
                <th className="py-3 px-4">Booking Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((pat) => {
                  const waitingMins = pat.registeredAt
                    ? Math.max(1, Math.floor((Date.now() - pat.registeredAt) / 60000))
                    : 12;

                  return (
                    <tr
                      key={pat.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        pat.status === 'serving'
                          ? 'bg-teal-50/60 font-semibold'
                          : pat.isEmergency && pat.status === 'waiting'
                          ? 'bg-rose-50/70 font-semibold'
                          : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-display font-black text-base text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>#{pat.token < 10 ? `0${pat.token}` : pat.token}</span>
                          {pat.isEmergency && (
                            <span className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider inline-flex items-center gap-0.5">
                              <Icons.AlertTriangle className="w-2.5 h-2.5" /> EM
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-900 font-bold">
                        <div className="flex items-center gap-1.5">
                          <span>{pat.name}</span>
                          {pat.isReview && (
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
                              <Icons.RefreshCw className="w-2.5 h-2.5" /> 7d Review
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {pat.age} yrs / {pat.gender}
                      </td>
                      <td className="py-3.5 px-4">
                        {pat.status === 'waiting' ? (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${
                            waitingMins > 30 ? 'bg-rose-100 text-rose-800 animate-pulse' :
                            waitingMins > 20 ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            <Icons.Clock className="w-3 h-3" /> {waitingMins}m in lobby
                          </span>
                        ) : pat.status === 'serving' ? (
                          <span className="text-emerald-700 font-bold text-[10px] inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Consulting now
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Finished</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                        {pat.symptom}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          pat.source === 'Online' ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {pat.source === 'Online' ? 'Online' : 'Walk-In'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          pat.status === 'serving' ? 'bg-emerald-100 text-emerald-800 animate-pulse' :
                          pat.status === 'waiting' ? (pat.isEmergency ? 'bg-rose-600 text-white animate-pulse' : 'bg-amber-100 text-amber-800') :
                          pat.status === 'completed' ? 'bg-slate-100 text-slate-600' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {pat.status === 'serving' ? '● In Cabin' :
                           pat.status === 'waiting' ? (pat.isEmergency ? 'Emergency Priority' : 'Waiting') :
                           pat.status === 'completed' ? 'Done' : 'Skipped'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => setPrintSlipPatient(pat)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-300 inline-flex items-center gap-1 transition-all"
                          title="Print Doctor's OPD Prescription Slip (ओपीडी पर्ची)"
                        >
                          <Icons.Printer className="w-3.5 h-3.5 text-slate-600" /> Slip
                        </button>
                        <button
                          onClick={() => setPrintThermalPatient(pat)}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-900 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-amber-300 inline-flex items-center gap-1 transition-all"
                          title="Print 2-Inch Thermal POS Receipt with QR Code"
                        >
                          <Icons.Receipt className="w-3.5 h-3.5 text-amber-700" /> Thermal
                        </button>
                        {pat.status === 'waiting' && !pat.isEmergency && (
                          <button
                            onClick={() => emergencyBumpPatient(pat.id)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 px-2 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1"
                            title="Bump to Emergency Priority #1"
                          >
                            <Icons.AlertTriangle className="w-3 h-3 text-rose-600" /> Bump
                          </button>
                        )}
                        {pat.status === 'waiting' && (
                          <button
                            onClick={() => callPatient(pat.id)}
                            className="bg-teal-600 hover:bg-teal-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all"
                          >
                            Call In →
                          </button>
                        )}
                        {pat.status === 'serving' && (
                          <button
                            onClick={() => completePatient(pat.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-sm inline-flex items-center gap-1"
                          >
                            <Icons.Check className="w-3.5 h-3.5" /> Done
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    No patients match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Walk-in Modal with 7-Day Review & Emergency Triage */}
      {showWalkInModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-display font-extrabold text-lg text-slate-900">
                  Add Walk-In Patient
                </h3>
                <p className="text-[11px] text-slate-500">Reception triage & token generation</p>
              </div>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddWalkIn} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Patient Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ankit Sharma"
                  value={walkInForm.name}
                  onChange={(e) => setWalkInForm({ ...walkInForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 32"
                    value={walkInForm.age}
                    onChange={(e) => setWalkInForm({ ...walkInForm, age: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={walkInForm.gender}
                    onChange={(e) => setWalkInForm({ ...walkInForm, gender: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-teal-600"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Child">Child</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Number (Auto-checks 7-Day Free Review)</label>
                <input
                  type="tel"
                  placeholder="e.g. 9811223344"
                  value={walkInForm.phone}
                  onChange={(e) => setWalkInForm({ ...walkInForm, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-teal-600"
                />
              </div>

              {/* 7-Day Free Follow-up Notification */}
              {reviewEligibility && reviewEligibility.isEligible && (
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-emerald-950 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <Icons.RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
                    <span>7-Day Free Follow-up Verified!</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-1">
                    Patient last visited <b>{reviewEligibility.daysAgo === 0 ? 'earlier today' : `${reviewEligibility.daysAgo} days ago`}</b> for <i>"{reviewEligibility.previousDiagnosis}"</i>. Consultation Fee waived: <b>₹0</b>.
                  </p>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Main Concern / Symptom</label>
                <input
                  type="text"
                  placeholder="e.g. Fever & Weakness / Regular Follow-up"
                  value={walkInForm.symptom}
                  onChange={(e) => setWalkInForm({ ...walkInForm, symptom: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-teal-600"
                />
              </div>

              {/* Emergency & Review Flags */}
              <div className="pt-1 space-y-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={walkInForm.isEmergency}
                    onChange={(e) => setWalkInForm({ ...walkInForm, isEmergency: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span className="font-bold text-rose-700 inline-flex items-center gap-1.5">
                    <Icons.AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    Mark as Emergency Patient (Priority #1 Triage)
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={walkInForm.isReview || !!reviewEligibility?.isEligible}
                    onChange={(e) => setWalkInForm({ ...walkInForm, isReview: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="font-bold text-emerald-800 inline-flex items-center gap-1.5">
                    <Icons.RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                    7-Day Free Review Visit (Fee: ₹0)
                  </span>
                </label>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-600/20 active:scale-95 transition-all"
                >
                  Generate Token
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
