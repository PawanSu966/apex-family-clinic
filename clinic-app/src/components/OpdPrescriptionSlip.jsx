import React, { useState } from 'react';
import { CLINIC_CONFIG } from '../config/clinic.config';
import Icons from './Icons';

/**
 * =========================================================================
 * OFFICIAL DOCTOR'S OPD PRESCRIPTION SLIP / PARCHI (ओपीडी पर्ची)
 * =========================================================================
 * Indian Medical Council (NMC / MCI) standard layout.
 * Used by Compounders at reception desk and by patients for consultation.
 */
export function OpdPrescriptionSlip({ patient, clinic = CLINIC_CONFIG, rxMode = 'standard' }) {
  const doctor = clinic.doctor;
  const tokenNum = patient.token < 10 ? `0${patient.token}` : patient.token;
  const todayStr = patient.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  const vitals = patient.vitals || {
    bp: '120/80',
    pulse: '74',
    temp: '98.6',
    spo2: '99',
    weight: '68'
  };

  return (
    <div
      id="printable-opd-parchi"
      className="bg-white text-slate-900 border-2 border-slate-900 rounded-lg p-6 max-w-4xl mx-auto shadow-sm font-sans"
      style={{ minHeight: '880px' }}
    >
      {/* 1. CLINIC & DOCTOR OFFICIAL LETTERHEAD */}
      <div className="border-b-2 border-slate-900 pb-4 mb-3">
        <div className="flex justify-between items-start">
          {/* Clinic Brand & Address */}
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center font-black text-xl shadow-sm">
                +
              </span>
              <div>
                <h1 className="font-display font-black text-xl tracking-tight text-slate-900 uppercase">
                  {doctor.clinicName}
                </h1>
                <p className="text-[11px] font-bold text-emerald-800 tracking-wide">
                  अपेक्स मल्टीस्पेशलिटी हेल्थकेयर एवं ओपीडी परामर्श केंद्र &bull; ISO 9001:2015 Certified
                </p>
              </div>
            </div>
            <p className="text-[11px] text-slate-700 mt-1.5 leading-snug font-medium">
              {doctor.address}, {doctor.city}<br />
              <span className="font-bold text-slate-900">Desk Helpline:</span> {doctor.helplinePhone} &bull; <span className="font-bold text-slate-900">Emergency:</span> 1800-890-2026
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              OPD Timings: Morning {doctor.morningShift} | Evening {doctor.eveningShift}
            </p>
          </div>

          {/* Doctor Credentials & NMC Registration */}
          <div className="text-right border-l-2 border-slate-200 pl-4 min-w-[240px]">
            <h2 className="font-display font-extrabold text-lg text-slate-900">
              {doctor.name}
            </h2>
            <p className="text-xs font-bold text-slate-800">
              {doctor.degree} &bull; {doctor.almaMater}
            </p>
            <p className="text-[11px] text-slate-700 font-semibold">
              Senior Consultant Physician
            </p>
            <div className="mt-1 inline-block bg-slate-100 text-slate-900 font-mono font-bold text-[10px] px-2.5 py-0.5 rounded border border-slate-300">
              {doctor.regNo}
            </div>
            <p className="text-[9px] text-slate-500 mt-0.5">
              Authorized Clinical Practitioner &bull; {doctor.experience}
            </p>
          </div>
        </div>
      </div>

      {/* 2. PATIENT REGISTRATION & DEMOGRAPHIC RECORD */}
      <div className="border border-slate-800 rounded bg-slate-50/50 p-3 mb-3 text-xs">
        <div className="grid grid-cols-12 gap-2 items-center">
          {/* High-Contrast Token Badge */}
          <div className="col-span-3 sm:col-span-2 bg-slate-900 text-white rounded p-2 text-center">
            <span className="block text-[9px] uppercase font-mono tracking-widest text-emerald-400 font-bold">
              OPD TOKEN
            </span>
            <span className="font-display font-black text-2xl tracking-tight text-amber-300">
              #{tokenNum}
            </span>
          </div>

          {/* Patient Core Details */}
          <div className="col-span-9 sm:col-span-6 grid grid-cols-2 gap-x-3 gap-y-1 pl-2">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Patient Full Name</span>
              <span className="font-bold text-slate-900 text-sm">{patient.name || 'Walk-In Patient'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Age / Gender</span>
              <span className="font-semibold text-slate-800">{patient.age} Yrs &bull; {patient.gender}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Mobile / Phone</span>
              <span className="font-semibold text-slate-800">{patient.phone || '+91 98765 43210'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">OPD Reg. No.</span>
              <span className="font-mono font-bold text-slate-800">OPD-2026-1019-{tokenNum}</span>
            </div>
          </div>

          {/* Date, Shift & Payment Status */}
          <div className="col-span-12 sm:col-span-4 border-t sm:border-t-0 sm:border-l border-slate-300 sm:pl-3 pt-2 sm:pt-0 space-y-1">
            <div className="flex justify-between">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Date & Time:</span>
              <span className="font-semibold text-slate-800">{todayStr} &bull; {timeStr}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Shift:</span>
              <span className="font-semibold text-slate-800">{patient.shift ? patient.shift.split('(')[0].trim() : 'Morning OPD'}</span>
            </div>
            <div className="flex justify-between items-center pt-0.5">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Fee Status:</span>
              <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded border border-emerald-300">
                {doctor.consultationFee} PAID (Desk Receipt)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. COMPOUNDER PRE-CHECK VITALS STRIP */}
      <div className="border border-slate-300 rounded mb-3 bg-white p-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] bg-slate-100 px-2 py-1 rounded border border-slate-200">
            Compounder Triage Vitals (जाँच)
          </span>
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-800">
            <div>
              <span className="text-slate-500 font-bold text-[10px]">BP: </span>
              <span className="font-mono font-bold text-slate-900">{vitals.bp || '120/80'} mmHg</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold text-[10px]">Pulse: </span>
              <span className="font-mono font-bold text-slate-900">{vitals.pulse || '74'} bpm</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold text-[10px]">Temp: </span>
              <span className="font-mono font-bold text-slate-900">{vitals.temp || '98.6'} °F</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold text-[10px]">SpO2: </span>
              <span className="font-mono font-bold text-slate-900">{vitals.spo2 || '99'} %</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold text-[10px]">Weight: </span>
              <span className="font-mono font-bold text-slate-900">{vitals.weight || '68'} kg</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold text-[10px]">RBS: </span>
              <span className="font-mono font-bold text-slate-900">____ mg/dL</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CHIEF COMPLAINTS (C/O) & CLINICAL FINDINGS */}
      <div className="border-b border-slate-300 pb-2 mb-3 text-xs">
        <div className="flex items-start gap-2">
          <span className="font-bold uppercase text-[10px] text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 whitespace-nowrap">
            Chief Complaints (C/O):
          </span>
          <span className="font-semibold text-slate-900 flex-1">
            {patient.symptom || 'Fever, sore throat, severe body aches since 3 days'}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1.5 text-slate-500">
          <span className="font-bold uppercase text-[10px] text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 whitespace-nowrap">
            Provisional Diagnosis (Dx):
          </span>
          <span className="border-b border-dotted border-slate-400 flex-1 h-5 text-slate-800 font-serif italic text-xs">
            {rxMode === 'standard' ? 'Acute Upper Respiratory Tract Infection (URTI) with seasonal pyrexia' : ''}
          </span>
        </div>
      </div>

      {/* 5. MAIN CLINICAL PRESCRIPTION PAD (℞ / Rx) */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="font-serif font-black text-2xl text-emerald-800">
              ℞
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-600">
              PRESCRIPTION MEDICATIONS (उपचार / दवाईयाँ)
            </span>
          </div>
          <span className="text-[10px] text-slate-400 italic">
            {rxMode === 'standard' ? 'Printed Clinical Regimen' : 'Ruled for Doctor Handwriting'}
          </span>
        </div>

        {/* Ruled Prescription Medicine Table */}
        <div className="border border-slate-800 rounded overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-700 border-b border-slate-800">
              <tr>
                <th className="py-1.5 px-2.5 w-10 text-center border-r border-slate-300">#</th>
                <th className="py-1.5 px-3 border-r border-slate-300">Medicine Name & Formulation</th>
                <th className="py-1.5 px-2.5 w-24 text-center border-r border-slate-300">Dosage</th>
                <th className="py-1.5 px-3 border-r border-slate-300">Timing & Instructions</th>
                <th className="py-1.5 px-2.5 w-20 text-center">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 font-sans">
              {rxMode === 'standard' ? (
                <React.Fragment>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-2 text-center font-bold text-slate-700 border-r border-slate-300">1</td>
                    <td className="py-2.5 px-3 border-r border-slate-300">
                      <span className="font-bold text-slate-900">Tab. Paracetamol (Dolo) 650mg</span>
                      <span className="block text-[10px] text-slate-500">Antipyretic / Analgesic</span>
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-900 border-r border-slate-300">
                      1 - 0 - 1
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 border-r border-slate-300 text-[11px]">
                      After Food (खाने के बाद, सुबह-शाम)
                    </td>
                    <td className="py-2.5 px-2 text-center font-semibold text-slate-800">3 Days</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-2 text-center font-bold text-slate-700 border-r border-slate-300">2</td>
                    <td className="py-2.5 px-3 border-r border-slate-300">
                      <span className="font-bold text-slate-900">Tab. Azithromycin 500mg</span>
                      <span className="block text-[10px] text-slate-500">Antibiotic - Broad Spectrum</span>
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-900 border-r border-slate-300">
                      1 - 0 - 0
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 border-r border-slate-300 text-[11px]">
                      Once daily after breakfast (नाश्ते के बाद)
                    </td>
                    <td className="py-2.5 px-2 text-center font-semibold text-slate-800">3 Days</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-2 text-center font-bold text-slate-700 border-r border-slate-300">3</td>
                    <td className="py-2.5 px-3 border-r border-slate-300">
                      <span className="font-bold text-slate-900">Tab. Pantoprazole 40mg</span>
                      <span className="block text-[10px] text-slate-500">Antacid / PPI</span>
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-900 border-r border-slate-300">
                      1 - 0 - 0
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 border-r border-slate-300 text-[11px]">
                      Early Morning Empty Stomach (सुबह भूखे पेट)
                    </td>
                    <td className="py-2.5 px-2 text-center font-semibold text-slate-800">5 Days</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-2 text-center font-bold text-slate-700 border-r border-slate-300">4</td>
                    <td className="py-2.5 px-3 border-r border-slate-300">
                      <span className="font-bold text-slate-900">Syp. Ascoril-D Cough Syrup</span>
                      <span className="block text-[10px] text-slate-500">Bronchodilator / Expectorant</span>
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-900 border-r border-slate-300">
                      10ml - 10ml - 10ml
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 border-r border-slate-300 text-[11px]">
                      Three times daily after meals with warm water
                    </td>
                    <td className="py-2.5 px-2 text-center font-semibold text-slate-800">5 Days</td>
                  </tr>
                  {/* 2 Blank ruled lines for doctor's additional handwriting */}
                  <tr className="bg-slate-50/50">
                    <td className="py-3 px-2 text-center font-bold text-slate-400 border-r border-slate-300">5</td>
                    <td className="py-3 px-3 border-r border-slate-300">
                      <div className="border-b border-dotted border-slate-400 h-4"></div>
                    </td>
                    <td className="py-3 px-2 text-center border-r border-slate-300">
                      <div className="border-b border-dotted border-slate-400 h-4"></div>
                    </td>
                    <td className="py-3 px-3 border-r border-slate-300">
                      <div className="border-b border-dotted border-slate-400 h-4"></div>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <div className="border-b border-dotted border-slate-400 h-4"></div>
                    </td>
                  </tr>
                </React.Fragment>
              ) : (
                /* Blank ruled lines for physical pen writing */
                [1, 2, 3, 4, 5, 6].map((num) => (
                  <tr key={num} className="bg-white">
                    <td className="py-3.5 px-2 text-center font-bold text-slate-400 border-r border-slate-300">{num}</td>
                    <td className="py-3.5 px-3 border-r border-slate-300">
                      <div className="border-b border-dotted border-slate-300 h-4"></div>
                    </td>
                    <td className="py-3.5 px-2 text-center border-r border-slate-300">
                      <div className="border-b border-dotted border-slate-400 h-4"></div>
                    </td>
                    <td className="py-3.5 px-3 border-r border-slate-300">
                      <div className="border-b border-dotted border-slate-400 h-4"></div>
                    </td>
                    <td className="py-3.5 px-2 text-center">
                      <div className="border-b border-dotted border-slate-400 h-4"></div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. INVESTIGATIONS ADVISED / LAB TESTS CHECKLIST */}
      <div className="border border-slate-300 rounded p-2.5 mb-3 bg-slate-50/40 text-xs">
        <span className="font-bold text-[10px] uppercase tracking-wider text-slate-700 block mb-1.5">
          INVESTIGATIONS ADVISED (जाँच परामर्श):
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-800">
          <label className="flex items-center gap-1.5">
            <input type="checkbox" defaultChecked={rxMode === 'standard'} className="rounded border-slate-400 text-emerald-600" />
            <span>CBC (Hemogram)</span>
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" defaultChecked={rxMode === 'standard'} className="rounded border-slate-400 text-emerald-600" />
            <span>Widal / Typhoid Test</span>
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" className="rounded border-slate-400 text-emerald-600" />
            <span>Blood Sugar (F / PP)</span>
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" className="rounded border-slate-400 text-emerald-600" />
            <span>Urine Routine & Micro</span>
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" className="rounded border-slate-400 text-emerald-600" />
            <span>LFT & KFT Panel</span>
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" className="rounded border-slate-400 text-emerald-600" />
            <span>Chest X-Ray (PA)</span>
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" className="rounded border-slate-400 text-emerald-600" />
            <span>ECG 12-Lead</span>
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" className="rounded border-slate-400 text-emerald-600" />
            <span>Dengue NS1 Antigen</span>
          </label>
        </div>
      </div>

      {/* 7. GENERAL ADVICE & DIETARY RESTRICTIONS */}
      <div className="border border-slate-200 rounded p-2 mb-3 text-[11px] text-slate-700 bg-white">
        <span className="font-bold text-[10px] uppercase tracking-wider text-slate-800">
          GENERAL ADVICE & DIETARY GUIDELINES (सामान्य सलाह एवं परहेज):
        </span>
        <ul className="list-disc list-inside mt-0.5 space-y-0.5">
          <li>Drink 3-4 liters of boiled/warm water daily. Avoid cold beverages and sour/oily food.</li>
          <li>Take light, nutritious meals (Khichdi, Dalia, Moong Dal soup, fresh fruits). Bed rest for 2 days.</li>
          <li>Complete the full 3-day course of prescribed antibiotics. Do not discontinue mid-way.</li>
        </ul>
      </div>

      {/* 8. FOOTER: REVIEW DATE, DISCLAIMER & DOCTOR'S SIGNATURE */}
      <div className="border-t-2 border-slate-900 pt-3 flex justify-between items-end">
        {/* Review & Legal Disclaimer */}
        <div className="space-y-1.5 max-w-md">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <span>पुनः परामर्श (Review After):</span>
            <span className="bg-slate-100 border border-slate-300 px-3 py-0.5 rounded font-mono font-bold">
              3 DAYS (or SOS in emergency)
            </span>
          </div>
          <p className="text-[9px] text-slate-500 leading-tight">
            * This prescription slip is valid for 7 days from the date of issue. Please present this slip during your next review.<br />
            * For outpatient guidance only. Not valid for court or medico-legal claims without official hospital stamp.
          </p>
          {/* Simulated Barcode */}
          <div className="flex items-center gap-2 pt-0.5">
            <div className="h-4 flex gap-0.5 items-end">
              {[12,20,15,10,20,14,18,10,20,12,16,18,10,20,14].map((h, i) => (
                <div key={i} className="bg-slate-900 w-0.5" style={{ height: `${h}px` }}></div>
              ))}
            </div>
            <span className="font-mono text-[9px] text-slate-600">OPD-APEX-2026-{tokenNum}</span>
          </div>
        </div>

        {/* Doctor Signature & NMC Stamp Box */}
        <div className="text-right min-w-[220px]">
          <div className="h-10 flex items-end justify-end pb-1">
            <span className="font-serif italic font-bold text-teal-900 text-sm opacity-85">
              {doctor.name}
            </span>
          </div>
          <div className="border-t border-slate-800 pt-1">
            <p className="font-bold text-xs text-slate-900 uppercase">{doctor.name}</p>
            <p className="text-[10px] text-slate-600 font-semibold">{doctor.degree}</p>
            <p className="text-[9px] font-mono text-slate-500 font-bold">Reg. No: {doctor.regNo}</p>
            <p className="text-[9px] text-emerald-800 font-bold">Authorized Signatory & Stamp</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * =========================================================================
 * INTERACTIVE OPD PRESCRIPTION MODAL
 * =========================================================================
 */
export function OpdPrescriptionModal({ patient, onClose }) {
  if (!patient) return null;
  const [rxMode, setRxMode] = useState('standard'); // 'standard' | 'blank_ruled'

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-100 rounded-3xl max-w-5xl w-full max-h-[96vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden my-auto">
        {/* Modal Screen-Only Header */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-lg">
              <Icons.Printer className="w-5 h-5 text-teal-400" />
            </span>
            <div>
              <h3 className="font-display font-bold text-base text-white">
                Official Doctor's OPD Prescription Slip (ओपीडी पर्ची)
              </h3>
              <p className="text-xs text-slate-400">
                Indian Medical Council (NMC) Standard Format &bull; Token #{patient.token < 10 ? `0${patient.token}` : patient.token} &bull; {patient.name}
              </p>
            </div>
          </div>

          {/* Mode Switch & Action Buttons */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-800 p-1 rounded-xl flex text-xs">
              <button
                onClick={() => setRxMode('standard')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  rxMode === 'standard' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-400'
                }`}
              >
                Standard Rx Regimen
              </button>
              <button
                onClick={() => setRxMode('blank_ruled')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  rxMode === 'blank_ruled' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-400'
                }`}
              >
                Blank Ruled (Doctor's Pen)
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Icons.Printer className="w-3.5 h-3.5" /> Print Parchi Now
            </button>
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-semibold"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Modal Body - Paper Container */}
        <div className="p-3 sm:p-6 overflow-y-auto bg-slate-200/80 flex justify-center">
          <div className="bg-white shadow-xl rounded-lg p-2 max-w-4xl w-full">
            <OpdPrescriptionSlip patient={patient} rxMode={rxMode} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default OpdPrescriptionSlip;
