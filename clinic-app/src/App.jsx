import React, { useState, useRef, useEffect } from 'react';
import { CLINIC_CONFIG } from './config/clinic.config';
import { useQueue } from './context/QueueContext';

import DoctorHeader from './components/DoctorHeader';
import LiveQueueTracker from './components/LiveQueueTracker';
import CompounderRemote from './components/CompounderRemote';
import TvWaitingDisplay from './components/TvWaitingDisplay';
import TokenBooking from './components/TokenBooking';
import DoctorPromises from './components/DoctorPromises';
import LocationAndHours from './components/LocationAndHours';
import DoctorCabin from './components/DoctorCabin';
import DailyOpdRegister from './components/DailyOpdRegister';
import PharmacyDesk from './components/PharmacyDesk';
import PatientPortal from './components/PatientPortal';
import Icons from './components/Icons';

export default function App() {
  const doctor = CLINIC_CONFIG.doctor;
  const features = CLINIC_CONFIG.features;
  const { patients, auditLogs, doctorStatus } = useQueue();

  // Views: 'patient' (default for public users) | 'compounder' | 'doctor' | 'pharmacy' | 'daily_register' | 'tv_display'
  const [currentView, setCurrentView] = useState('patient');
  const [isDemoMode, setIsDemoMode] = useState(CLINIC_CONFIG.demoMode);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  const tokenSectionRef = useRef(null);

  // Live ticking clock for workers
  useEffect(() => {
    const updateTime = () => {
      setCurrentTimeStr(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // URL query parameter routing (?desk=true, ?doctor=true, ?pharmacy=true, ?tv=true)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('desk') === 'true' || params.get('view') === 'compounder') {
        setCurrentView('compounder');
      } else if (params.get('doctor') === 'true' || params.get('view') === 'doctor') {
        setCurrentView('doctor');
      } else if (params.get('pharmacy') === 'true' || params.get('view') === 'pharmacy') {
        setCurrentView('pharmacy');
      } else if (params.get('register') === 'true' || params.get('view') === 'daily_register') {
        setCurrentView('daily_register');
      } else if (params.get('tv') === 'true' || params.get('view') === 'tv_display') {
        setCurrentView('tv_display');
      }
      if (params.get('demo') === 'true') {
        setIsDemoMode(true);
      }
    } catch (e) {
      console.warn('URL param parse notice:', e);
    }
  }, []);

  const scrollToToken = () => {
    if (tokenSectionRef.current) {
      tokenSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === CLINIC_CONFIG.staff.pin) {
      setCurrentView('compounder');
      setShowPinModal(false);
      setPinInput('');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  // KPI counts
  const pendingPharmacyCount = patients.filter(p => p.pharmacyStatus === 'pending').length;
  const waitingPatientsCount = patients.filter(p => p.status === 'waiting').length;
  const isWorkerMode = currentView !== 'patient' && currentView !== 'tv_display';

  // 1. FULLSCREEN TV DISPLAY VIEW (For Reception Wall TV)
  if (currentView === 'tv_display') {
    return <TvWaitingDisplay onExit={() => setCurrentView('patient')} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800 font-sans selection:bg-slate-800 selection:text-white">
      
      {/* =============================================================== */}
      {/* ⚡ WORKER OPERATING COMMAND BAR (Always active in Staff Mode)   */}
      {/* =============================================================== */}
      {isWorkerMode ? (
        <header className="no-print bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-50 shadow-xl">
          {/* Main Worker Nav Strip */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center font-bold text-sm border border-slate-700">
                <Icons.Activity className="w-4 h-4" />
              </span>
              <div>
                <span className="font-display font-black text-sm text-white tracking-wide block leading-none">
                  {doctor.clinicName} &bull; CLINICAL OS
                </span>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  CHAMBER BUS ACTIVE &bull; REAL-TIME ZERO LATENCY
                </span>
              </div>
            </div>

            {/* Role Switcher Tabs */}
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 gap-1 font-bold">
              <button
                onClick={() => setCurrentView('compounder')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  currentView === 'compounder' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icons.Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Reception ({waitingPatientsCount})</span>
              </button>

              <button
                onClick={() => setCurrentView('doctor')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  currentView === 'doctor' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icons.Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
                <span>Doctor Cabin</span>
              </button>

              <button
                onClick={() => setCurrentView('pharmacy')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  currentView === 'pharmacy' ? 'bg-amber-500 text-slate-950 shadow-xs font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icons.Pill className="w-3.5 h-3.5" />
                <span>Pharmacy</span>
                {pendingPharmacyCount > 0 && (
                  <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
                    {pendingPharmacyCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setCurrentView('daily_register')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  currentView === 'daily_register' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icons.FileText className="w-3.5 h-3.5 text-slate-300" />
                <span>Accounts</span>
              </button>

              <button
                onClick={() => setCurrentView('tv_display')}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-all flex items-center gap-1.5"
                title="Launch Fullscreen Waiting TV Display"
              >
                <Icons.Tv className="w-3.5 h-3.5" />
                <span>TV Screen</span>
              </button>
            </div>

            {/* Time & Exit */}
            <div className="flex items-center gap-3">
              <span className="font-mono text-slate-400 font-semibold bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px]">
                {currentTimeStr}
              </span>
              <button
                onClick={() => setCurrentView('patient')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl font-bold text-xs border border-slate-700 transition-all flex items-center gap-1.5"
                title="View public patient website"
              >
                <Icons.ArrowRight className="w-3.5 h-3.5 rotate-180" />
                <span>Patient Site</span>
              </button>
            </div>
          </div>

          {/* Realtime Live Audit Activity Stream Ticker */}
          <div className="bg-slate-900/90 border-t border-slate-800/80 px-4 sm:px-6 py-1.5 text-[11px] flex items-center justify-between overflow-hidden gap-3 font-mono">
            <div className="flex items-center gap-2 overflow-hidden truncate">
              <span className="text-emerald-400 font-bold uppercase tracking-wider whitespace-nowrap">Chamber Event Stream:</span>
              <span className="text-slate-300 truncate">
                {auditLogs.length > 0 ? auditLogs[0].text : "Queue system active."}
              </span>
            </div>
            <span className="text-slate-500 text-[10px] whitespace-nowrap hidden sm:inline">
              NMC Standards Aligned &bull; Real-time Audit
            </span>
          </div>
        </header>
      ) : (
        /* DEMO MODE SWITCHER (For testing/verification) */
        isDemoMode && (
          <div className="no-print bg-slate-900 text-white px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between text-xs sticky top-0 z-50 gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-emerald-400 uppercase text-[10px] tracking-wider">Staff Switcher:</span>
              <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                <button
                  onClick={() => setCurrentView('patient')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    currentView === 'patient' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Patient View
                </button>
                <button
                  onClick={() => setCurrentView('compounder')}
                  className="px-3 py-1 rounded-md font-semibold text-slate-400 hover:text-white"
                >
                  Reception Desk
                </button>
                <button
                  onClick={() => setCurrentView('doctor')}
                  className="px-3 py-1 rounded-md font-semibold text-slate-400 hover:text-white"
                >
                  Doctor Cabin
                </button>
                <button
                  onClick={() => setCurrentView('pharmacy')}
                  className="px-3 py-1 rounded-md font-semibold text-slate-400 hover:text-white"
                >
                  Pharmacy Desk
                </button>
                <button
                  onClick={() => setCurrentView('daily_register')}
                  className="px-3 py-1 rounded-md font-semibold text-slate-400 hover:text-white"
                >
                  Accounts
                </button>
                <button
                  onClick={() => setCurrentView('tv_display')}
                  className="px-3 py-1 rounded-md font-semibold text-slate-400 hover:text-white"
                >
                  TV Screen
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsDemoMode(false)}
              className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
            >
              ✕ Hide
            </button>
          </div>
        )
      )}

      {/* =============================================================== */}
      {/* VIEW 1: COMPOUNDER / RECEPTION DESK                             */}
      {/* =============================================================== */}
      {currentView === 'compounder' && (
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
          <CompounderRemote
            onExit={() => setCurrentView('patient')}
            onOpenTv={() => setCurrentView('tv_display')}
            onOpenDoctor={() => setCurrentView('doctor')}
            onOpenPharmacy={() => setCurrentView('pharmacy')}
            onOpenRegister={() => setCurrentView('daily_register')}
          />
        </main>
      )}

      {/* =============================================================== */}
      {/* VIEW 2: DOCTOR CABIN CONSULTATION TERMINAL (EMR Mode)            */}
      {/* =============================================================== */}
      {currentView === 'doctor' && (
        <main className="flex-1 w-full p-4 sm:p-6">
          <DoctorCabin
            onExit={() => setCurrentView('patient')}
            onOpenTv={() => setCurrentView('tv_display')}
            onOpenPharmacy={() => setCurrentView('pharmacy')}
          />
        </main>
      )}

      {/* =============================================================== */}
      {/* VIEW 3: IN-HOUSE MEDICAL STORE & PHARMACY DESK                   */}
      {/* =============================================================== */}
      {currentView === 'pharmacy' && (
        <main className="flex-1 w-full p-4 sm:p-6">
          <PharmacyDesk
            onExit={() => setCurrentView('patient')}
            onOpenDoctor={() => setCurrentView('doctor')}
            onOpenCompounder={() => setCurrentView('compounder')}
          />
        </main>
      )}

      {/* =============================================================== */}
      {/* VIEW 4: DAILY OPD REGISTER & ACCOUNTS SUMMARY                    */}
      {/* =============================================================== */}
      {currentView === 'daily_register' && (
        <main className="flex-1 w-full p-4 sm:p-6">
          <DailyOpdRegister
            onExit={() => setCurrentView('patient')}
            onOpenTv={() => setCurrentView('tv_display')}
          />
        </main>
      )}

      {/* =============================================================== */}
      {/* VIEW 5: PUBLIC PATIENT WEBSITE (Visual Direction from Reference) */}
      {/* =============================================================== */}
      {currentView === 'patient' && (
        <main className="flex-1">
          <PatientPortal
            onOpenStaff={() => setShowPinModal(true)}
            onOpenTv={() => setCurrentView('tv_display')}
          />
        </main>
      )}

      {/* Institutional Clinic Footer for Staff / Worker views */}
      {currentView !== 'patient' && (
        <footer className="no-print py-12 px-6 bg-slate-900 text-slate-400 text-center text-xs mt-auto border-t border-slate-800">
          <div className="max-w-5xl mx-auto space-y-2">
            <p className="font-display font-bold text-white text-base">
              {doctor.clinicName} &bull; {doctor.name}
            </p>
            <p className="text-[11px] text-slate-400">
              {doctor.degree} &bull; NMC License Reg. #{doctor.regNo} &bull; Ambulatory Outpatient Medicine Chamber
            </p>
            <p className="text-[10px] text-slate-500 max-w-xl mx-auto leading-relaxed pt-1">
              Compliant with clinical governance guidelines. All patient clinical notes, triage vitals, and diagnostic referrals are confidential medical records.
            </p>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between max-w-5xl mx-auto text-[11px] text-slate-500 gap-3">
            <span>&copy; {new Date().getFullYear()} {doctor.clinicName}. Authorized Healthcare Chamber.</span>
            
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={() => setIsDemoMode(prev => !prev)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                Staff Switcher Bar
              </button>
              <button
                onClick={() => setCurrentView('tv_display')}
                className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors font-medium"
              >
                <Icons.Tv className="w-3.5 h-3.5" />
                <span>TV OPD Display</span>
              </button>
              <button
                onClick={() => setCurrentView('pharmacy')}
                className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors font-medium"
              >
                <Icons.Pill className="w-3.5 h-3.5" />
                <span>Pharmacy Counter</span>
              </button>
              <button
                onClick={() => setShowPinModal(true)}
                className="text-slate-400 hover:text-emerald-400 flex items-center gap-1.5 transition-colors font-medium"
              >
                <Icons.Lock className="w-3.5 h-3.5" />
                <span>Staff Chamber Login</span>
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* Staff PIN Login Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center text-xl mx-auto mb-4">
              <Icons.Lock className="w-5 h-5 text-slate-800" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900 mb-1">
              Staff Chamber Access
            </h3>
            <p className="text-xs text-slate-500 mb-5 font-light">
              Enter 4-digit staff PIN to unlock reception, doctor, or pharmacy terminal:
            </p>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  maxLength={6}
                  autoFocus
                  placeholder="PIN (Default: 1234)"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  className={`w-full text-center tracking-[0.5em] text-lg font-bold bg-slate-50 border rounded-xl py-3 text-slate-900 focus:outline-none ${
                    pinError ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-slate-900'
                  }`}
                />
                {pinError && (
                  <p className="text-[11px] text-rose-500 mt-1.5 font-medium">
                    Incorrect PIN. Default is {CLINIC_CONFIG.staff.pin}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinModal(false);
                    setPinInput('');
                    setPinError(false);
                  }}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md"
                >
                  Unlock Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
