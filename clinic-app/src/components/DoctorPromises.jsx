import React from 'react';
import Icons from './Icons';

export default function DoctorPromises() {
  const clinicalFocusAreas = [
    {
      title: "Diabetes & Metabolic Health",
      sub: "Type-2 Diabetes & Glycemic Management",
      desc: "Structured glycemic monitoring, HbA1c surveillance, dietary titration, and screening for diabetic neuropathy and renal risk."
    },
    {
      title: "Hypertension & Cardiac Screening",
      sub: "Cardiovascular Health & Blood Pressure Control",
      desc: "Primary and secondary hypertension management, ambulatory blood pressure review, dyslipidemia therapy, and 12-lead ECG review."
    },
    {
      title: "Acute Febrile & Infectious Diseases",
      sub: "Viral Fevers, Typhoid, Dengue & Infections",
      desc: "Systematic differential evaluation for acute pyrexia, seasonal infectious syndromes, vector-borne illnesses, and rational antimicrobial therapy."
    },
    {
      title: "Respiratory & Seasonal Allergies",
      sub: "Bronchitis, Asthma & Allergic Rhinitis",
      desc: "Evaluation of persistent cough, seasonal allergic rhinitis, upper respiratory infections, and on-site emergency nebulization care."
    },
    {
      title: "Gastrointestinal & Acid Peptic Care",
      sub: "GERD, Gastritis & Liver Parameters",
      desc: "Management of chronic acid reflux, dyspepsia, fatty liver disease grade monitoring, and irritable bowel presentations."
    },
    {
      title: "Geriatric & Preventive Health Workups",
      sub: "Senior Citizen Wellness & Polypharmacy Review",
      desc: "Multi-morbidity assessments for elderly patients, drug interaction elimination, joint pain relief, and annual executive health checks."
    }
  ];

  return (
    <section className="py-12 px-4 sm:px-8 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-slate-200/80 mb-8">
        <div>
          <span className="text-[11px] font-mono uppercase font-bold tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            Clinical Focus & Ambulatory Care
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 mt-2">
            Clinical Specialities & Practice Standards
          </h2>
        </div>
        <p className="text-xs text-slate-500 max-w-md">
          Practicing evidence-based therapeutics under standard Indian Council of Medical Research (ICMR) clinical protocols.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {clinicalFocusAreas.map((area, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-400 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold text-slate-400">0{i + 1}</span>
                <Icons.Activity className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <h3 className="font-display font-bold text-base text-slate-900">{area.title}</h3>
              <p className="text-xs text-emerald-700 font-medium mt-0.5">{area.sub}</p>
              <p className="text-xs text-slate-600 leading-relaxed mt-2.5 font-normal">
                {area.desc}
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
              <Icons.ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Standard Clinical Protocol</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
