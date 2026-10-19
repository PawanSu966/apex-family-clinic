import React from 'react';
import { useQueue } from '../context/QueueContext';
import { CLINIC_CONFIG } from '../config/clinic.config';
import Icons from './Icons';

export default function TvWaitingDisplay({ onExit }) {
  const { patients, currentPatient, servingToken, doctorStatus } = useQueue();
  const doctor = CLINIC_CONFIG.doctor;

  const waitingPatients = patients.filter(p => p.status === 'waiting').sort((a, b) => {
    if (a.isEmergency && !b.isEmergency) return -1;
    if (!a.isEmergency && b.isEmergency) return 1;
    return a.token - b.token;
  });

  const upcomingPatients = waitingPatients.slice(0, 4);
  const emergencyPatient = waitingPatients.find(p => p.isEmergency);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 sm:p-12 flex flex-col justify-between font-sans selection:bg-teal-500">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
            <Icons.Stethoscope className="w-8 h-8 text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white">
              {doctor.clinicName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
              {doctor.name} ({doctor.degree}) &bull; Consultation Cabin 1
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
            doctorStatus === 'in_cabin' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
            doctorStatus === 'delayed' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
            'bg-rose-500/20 text-rose-400 border border-rose-500/30'
          }`}>
            <span className="w-2.5 h-2.5 rounded-full bg-current animate-ping"></span>
            {doctorStatus === 'in_cabin' ? 'Doctor In Cabin' : doctorStatus === 'delayed' ? 'Minor Delay' : 'Shift Break'}
          </span>

          <button
            onClick={onExit}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl transition-all font-semibold"
          >
            ✕ Exit TV Mode
          </button>
        </div>
      </div>

      {/* Emergency Alert Marquee if Emergency Patient is in Queue */}
      {emergencyPatient && (
        <div className="bg-rose-600/90 text-white py-2.5 px-6 rounded-2xl my-3 flex items-center justify-between font-bold text-xs uppercase tracking-wider animate-pulse border border-rose-400">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5">
              <Icons.AlertTriangle className="w-4 h-4 text-white" />
              EMERGENCY PATIENT ALERT:
            </span>
            <span>Token #{emergencyPatient.token} ({emergencyPatient.name}) is next in line for immediate triage!</span>
          </div>
          <span className="bg-white text-rose-700 px-2 py-0.5 rounded text-[10px] font-black">
            PRIORITY #1
          </span>
        </div>
      )}

      {/* Main Visual Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto py-6 items-center">
        {/* Left: Giant Current Serving Card */}
        <div className="lg:col-span-8 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/40 p-8 sm:p-14 rounded-3xl border-2 border-teal-500/40 shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-500"></div>
          
          <p className="text-xs sm:text-sm uppercase font-extrabold tracking-[0.3em] text-teal-400 mb-2">
            Currently Consulting Inside Cabin
          </p>

          <div className="font-display font-black text-8xl sm:text-9xl md:text-[10rem] leading-none text-white tracking-tighter drop-shadow-lg my-3">
            #{servingToken < 10 ? `0${servingToken}` : servingToken}
          </div>

          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-display font-extrabold text-white">
              {currentPatient ? currentPatient.name : "Waiting for Next Patient"}
            </p>
            <p className="text-sm text-slate-400 font-medium mt-1">
              {currentPatient ? `${currentPatient.gender}, ${currentPatient.age} yrs • Reason: ${currentPatient.symptom}` : "Doctor cabin is ready."}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 mt-6 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Please proceed directly to Doctor's Cabin Door
          </div>
        </div>

        {/* Right: Upcoming Patient Queue List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
                Next In Line (Get Ready)
              </p>
              <span className="text-[11px] bg-teal-500/20 text-teal-300 font-mono px-2 py-0.5 rounded">
                {waitingPatients.length} Waiting
              </span>
            </div>

            <div className="space-y-3">
              {upcomingPatients.length > 0 ? (
                upcomingPatients.map((pat, idx) => (
                  <div
                    key={pat.id}
                    className={`p-4 rounded-2xl border flex items-center justify-between ${
                      pat.isEmergency
                        ? 'bg-rose-950/40 border-rose-500/60 ring-2 ring-rose-500/30'
                        : idx === 0 
                        ? 'bg-slate-800/90 border-teal-500/40 shadow-lg' 
                        : 'bg-slate-800/40 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-white">
                          {pat.name}
                        </p>
                        {pat.isEmergency && (
                          <span className="bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                            EMERGENCY
                          </span>
                        )}
                        {pat.isReview && (
                          <span className="bg-emerald-500/30 text-emerald-300 text-[9px] font-bold px-1.5 py-0.2 rounded">
                            7d Review
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[180px]">
                        {pat.symptom} &bull; {pat.age}y
                      </p>
                    </div>
                    <span className={`font-display font-black text-2xl ${
                      pat.isEmergency ? 'text-rose-400' : idx === 0 ? 'text-emerald-400' : 'text-slate-400'
                    }`}>
                      #{pat.token < 10 ? `0${pat.token}` : pat.token}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-500">
                  No patients waiting right now.
                </div>
              )}
            </div>
          </div>

          <div className="bg-teal-950/30 border border-teal-500/20 p-5 rounded-3xl text-xs text-slate-300 text-center">
            <p className="font-semibold text-teal-300">OPD Protocol Notice</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Keep previous lab reports and prescription slips ready before entering.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Ticker */}
      <div className="border-t border-slate-800 pt-4 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2 font-mono">
        <span>Apex Hospital Realtime OPD Suite &bull; BroadcastChannel Active</span>
        <span>Helpline: {doctor.helplinePhone}</span>
      </div>
    </div>
  );
}
