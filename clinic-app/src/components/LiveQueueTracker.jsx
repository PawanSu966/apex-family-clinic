import React from 'react';
import { useQueue } from '../context/QueueContext';
import { CLINIC_CONFIG } from '../config/clinic.config';
import Icons from './Icons';

export default function LiveQueueTracker() {
  const { patients, currentPatient, servingToken, mySession, doctorStatus } = useQueue();
  const doctor = CLINIC_CONFIG.doctor;

  // Tracked patient: either the session patient, or Pawan Suthar (Token 5) by default
  const trackedPatient = mySession || patients.find(p => p.token === 5) || null;

  const userToken = trackedPatient ? trackedPatient.token : 5;
  const tokensAhead = userToken ? userToken - servingToken : 2;
  const estimatedWait = tokensAhead > 0 ? tokensAhead * doctor.avgMinsPerPatient : 0;
  const isMyTurnNow = trackedPatient && trackedPatient.status === 'serving';

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-900/5 border border-slate-200/90 relative overflow-hidden">
      {/* Top Status Header */}
      <div className="flex flex-wrap items-center justify-between pb-5 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
            <Icons.Activity className="w-4 h-4 text-emerald-400" />
          </span>
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900">
              Live Chamber Queue Monitor
            </h3>
            <p className="text-[11px] text-slate-500">Real-time turn tracking for {doctor.clinicName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${
            doctorStatus === 'in_cabin'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : doctorStatus === 'delayed'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {doctorStatus === 'in_cabin' ? 'Dr. Pawan Suthar Consulting Now' : doctorStatus === 'delayed' ? 'Slight Delay (~10m)' : 'Shift Interval'}
          </span>
        </div>
      </div>

      {/* Main Grid: Currently Inside (Left) & Your Turn Barometer (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-6 items-center">
        
        {/* Currently Inside Chamber 1 */}
        <div className="md:col-span-5 bg-slate-900 text-white p-6 rounded-2xl text-center shadow-md border border-slate-800 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-emerald-400 block">
              NOW CONSULTING IN CHAMBER 1
            </span>
            <div className="font-display font-black text-6xl text-white my-2 tracking-tight">
              #{servingToken < 10 ? `0${servingToken}` : servingToken}
            </div>
            <p className="font-bold text-sm text-slate-200">
              {currentPatient ? currentPatient.name : "Consultation In Progress"}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {currentPatient ? `${currentPatient.gender}, ${currentPatient.age}y &bull; ${currentPatient.symptom}` : "Chamber open"}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-center gap-2">
            <Icons.Clock className="w-3 h-3 text-emerald-400" />
            <span>Avg. Consult: {doctor.avgMinsPerPatient} mins/patient</span>
          </div>
        </div>

        {/* Your Turn Status Barometer */}
        <div className="md:col-span-7 bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">YOUR REGISTERED PASS</span>
              <p className="font-display font-black text-base text-slate-900">
                {trackedPatient ? trackedPatient.name : "Pawan Suthar"}
              </p>
              <p className="text-[11px] text-slate-500">
                {trackedPatient ? `${trackedPatient.age}y / ${trackedPatient.gender}` : "25y / Male"} &bull; {trackedPatient?.source || 'Online'} Priority
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">YOUR TOKEN</span>
              <span className="font-display font-black text-3xl text-slate-900 font-mono">
                #{userToken < 10 ? `0${userToken}` : userToken}
              </span>
            </div>
          </div>

          {/* Turn Metrics */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 text-xs">
            <div className="bg-white p-3 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Queue Position</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                {tokensAhead > 0 ? `${tokensAhead} Patients Ahead` : isMyTurnNow ? "Now Inside Chamber" : "Next In Line"}
              </span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Estimated Wait</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                {tokensAhead > 0 ? `~${estimatedWait} Minutes` : isMyTurnNow ? "0 Mins" : "Immediate"}
              </span>
            </div>
          </div>

          {/* Clinical Queue Advisory Notice */}
          <div className={`p-3.5 rounded-xl text-xs leading-relaxed border flex items-start gap-2.5 ${
            isMyTurnNow
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md font-bold'
              : tokensAhead <= 2
              ? 'bg-amber-50 text-amber-950 border-amber-200'
              : 'bg-white text-slate-700 border-slate-200'
          }`}>
            <Icons.ShieldCheck className={`w-4 h-4 shrink-0 mt-0.5 ${isMyTurnNow ? 'text-white' : 'text-slate-500'}`} />
            <div>
              {isMyTurnNow && "Your token number is currently called inside Chamber 1. Please enter immediately."}
              {!isMyTurnNow && tokensAhead <= 2 && tokensAhead > 0 && "You are next in line. Please report to the clinic reception lobby with previous records."}
              {!isMyTurnNow && tokensAhead > 2 && `Estimated consult window: ~${estimatedWait} mins. You may plan your arrival 10 minutes prior to your turn.`}
            </div>
          </div>
        </div>

      </div>

      {/* Footer Instructions */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
        <span>Token valid for {doctor.morningShift} shift today.</span>
        <span>Helpline Desk: <strong className="text-slate-800">{doctor.helplinePhone}</strong></span>
      </div>
    </div>
  );
}
