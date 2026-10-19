import React from 'react';
import { CLINIC_CONFIG } from '../config/clinic.config';
import Icons from './Icons';

export default function LocationAndHours({ onScrollToToken }) {
  const doctor = CLINIC_CONFIG.doctor;

  return (
    <section className="py-12 px-4 sm:px-8 max-w-7xl mx-auto">
      <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left: Timings & Address */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <span className="text-[11px] font-mono uppercase font-bold tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              Chamber Schedule & Accessibility
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Chamber Location & OPD Timings
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg">
              Convenient outpatient consultation facility equipped with ramp access, lift facility, and nearby multi-specialty diagnostics.
            </p>
          </div>

          <div className="space-y-3.5 text-xs text-slate-700">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <Icons.Clock className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
              <div>
                <strong className="text-slate-900 block font-bold">Regular Consultation Timings:</strong>
                <span className="text-slate-600 block mt-0.5">
                  Monday &ndash; Saturday: Morning {doctor.morningShift} &bull; Evening {doctor.eveningShift}
                </span>
                <span className="text-[11px] text-rose-600 font-medium block mt-0.5">
                  {doctor.sundayStatus}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <Icons.MapPin className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
              <div>
                <strong className="text-slate-900 block font-bold">Chamber Address:</strong>
                <span className="text-slate-600 block mt-0.5">
                  {doctor.address}, {doctor.city}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Landmark: Near Metro Pillar 118 &bull; Dedicated patient parking available.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <Icons.Phone className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
              <div>
                <strong className="text-slate-900 block font-bold">Chamber Assistance & Records:</strong>
                <span className="text-slate-600 block mt-0.5">
                  Helpline: <strong className="text-slate-900 font-mono">{doctor.helplinePhone}</strong> (WhatsApp Inquiries)
                </span>
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={onScrollToToken}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-sm transition-all flex items-center gap-2 active:scale-95"
            >
              <Icons.Calendar className="w-4 h-4 text-emerald-400" />
              <span>Book Confirmed OPD Token Pass</span>
            </button>
          </div>
        </div>

        {/* Right: Hospital Protocols & Standards */}
        <div className="lg:col-span-5 bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-4">
          <div>
            <h4 className="font-display font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
              <Icons.ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Clinical Protocols for Patients</span>
            </h4>

            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <Icons.Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Previous Records:</strong> Please bring all previous discharge summaries, investigations (ECG/Blood reports), and current medication strips.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Icons.Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Fasting Blood Tests:</strong> For Fasting Blood Sugar (FBS) or Lipid Profile, arrive with 8-10 hours overnight fasting before 10:30 AM.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Icons.Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>7-Day Follow-Up Policy:</strong> Free report review consultation is valid within 7 calendar days of your initial visit with your token pass.
                </span>
              </li>
            </ul>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Air-conditioned waiting lobby &bull; RO purified water</span>
            <span className="font-bold text-emerald-700">NABH Standards Aligned</span>
          </div>
        </div>

      </div>
    </section>
  );
}
