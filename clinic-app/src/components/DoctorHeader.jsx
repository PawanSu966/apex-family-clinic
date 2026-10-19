import React from 'react';
import { CLINIC_CONFIG } from '../config/clinic.config';
import { useQueue } from '../context/QueueContext';
import Icons from './Icons';

export default function DoctorHeader({ onBookClick }) {
  const { servingToken, doctorStatus } = useQueue();
  const doctor = CLINIC_CONFIG.doctor;

  return (
    <header className="relative bg-white border-b border-slate-200/80">
      {/* Top Clinical Accreditation & Status Bar */}
      <div className="bg-slate-900 text-slate-300 py-2 px-4 sm:px-8 text-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {doctorStatus === 'in_cabin' ? 'Chamber Active • Consulting Now' : 'OPD In Shift'}
            </span>
            <span className="hidden sm:inline text-slate-400 text-[11px]">
              NMC Reg. No: <strong className="text-white font-mono">{doctor.regNo}</strong>
            </span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:inline text-slate-400 text-[11px]">
              Live Consulting: <strong className="text-emerald-400 font-mono">Token #{servingToken < 10 ? '0' + servingToken : servingToken}</strong>
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a
              href={`tel:${doctor.helplinePhone}`}
              className="text-slate-300 hover:text-white flex items-center gap-1.5 font-medium transition-colors"
            >
              <Icons.Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Chamber Desk: {doctor.helplinePhone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Chamber Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left: Physician Authority & Clinical Specialities */}
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold tracking-wide border border-slate-200">
                <Icons.Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>{doctor.clinicName} &bull; Outpatient Medicine Chamber</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
                {doctor.name}
              </h1>

              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="text-sm sm:text-base font-bold text-slate-800">
                  {doctor.degree}
                </span>
                <span className="text-slate-300 font-light">&bull;</span>
                <span className="text-xs sm:text-sm text-slate-600 font-medium">
                  {doctor.almaMater}
                </span>
                <span className="text-slate-300 font-light">&bull;</span>
                <span className="text-xs sm:text-sm text-slate-600">
                  {doctor.experience}
                </span>
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl font-normal">
              Specialized in comprehensive internal medicine, chronic diabetes management, hypertension risk assessment, and seasonal acute febrile illnesses. Every consultation is structured with dedicated physical assessment, rational evidence-based therapeutics, and an included 7-day follow-up review.
            </p>

            {/* Core Clinical Practice Pillars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Consultation</span>
                <span className="font-display font-black text-lg text-slate-900 mt-0.5 block">{doctor.consultationFee}</span>
                <span className="text-[10px] text-emerald-700 font-medium block">7-Day Free Review</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Morning Shift</span>
                <span className="font-display font-bold text-xs text-slate-900 mt-1 block">{doctor.morningShift}</span>
                <span className="text-[10px] text-slate-500 block">Mon &ndash; Sat Active</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Evening Shift</span>
                <span className="font-display font-bold text-xs text-slate-900 mt-1 block">{doctor.eveningShift}</span>
                <span className="text-[10px] text-slate-500 block">Mon &ndash; Sat Active</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Diagnostic Flow</span>
                <span className="font-display font-bold text-xs text-slate-900 mt-1 block">Zero Wait Queue</span>
                <span className="text-[10px] text-slate-500 block">Live Turn Alerts</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onBookClick}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
              >
                <Icons.Calendar className="w-4 h-4 text-emerald-400" />
                <span>Book Confirmed OPD Token ({doctor.consultationFee})</span>
              </button>
              <a
                href={`https://wa.me/${doctor.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs px-5 py-3.5 rounded-xl transition-all flex items-center gap-2 shadow-xs"
              >
                <span>WhatsApp Chamber Inquiry</span>
              </a>
            </div>
          </div>

          {/* Right: Physician Chamber Verification Card */}
          <div className="lg:col-span-4">
            <div className="bg-gradient-to-b from-slate-50 to-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-display font-black text-2xl border border-slate-700 shadow-sm">
                  {doctor.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900">{doctor.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{doctor.degree}</p>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">Verified Medical Practitioner</p>
                </div>
              </div>

              <div className="divide-y divide-slate-100 text-xs text-slate-600">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Medical Council Reg:</span>
                  <span className="font-mono font-bold text-slate-800">{doctor.regNo}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Chamber Location:</span>
                  <span className="font-medium text-slate-800 text-right">{doctor.address.split(',')[0]}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Follow-up Policy:</span>
                  <span className="font-bold text-emerald-700">7-Day Free Review</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">In-Chamber Facilities:</span>
                  <span className="font-medium text-slate-800">ECG, Pharmacy, Lab Sample Desk</span>
                </div>
              </div>

              <div className="p-3 bg-slate-100/70 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
                <Icons.ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>Compliant with Indian National Medical Commission (NMC) professional clinical standards.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
