import React, { useState } from 'react';
import { CLINIC_CONFIG } from '../config/clinic.config';
import Icons from './Icons';

/**
 * =========================================================================
 * PATHOLOGY & DIAGNOSTIC LAB REQUISITION SLIP (जांच पर्ची)
 * =========================================================================
 * Used by Doctor to recommend blood tests, radiology, or ECG.
 * Printable as an official lab referral slip.
 */
export default function LabRequisitionModal({ patient, initialTests = [], diagnosis = '', onClose }) {
  if (!patient) return null;
  const doctor = CLINIC_CONFIG.doctor;
  const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  // Standard OPD Clinical Lab Test Categories
  const standardTests = [
    { name: 'CBC (Complete Blood Count & Platelets)', cat: 'Hematology' },
    { name: 'Blood Sugar - Fasting (FBS)', cat: 'Biochemistry' },
    { name: 'Blood Sugar - Post Prandial (PPBS)', cat: 'Biochemistry' },
    { name: 'HbA1c (Glycated Hemoglobin)', cat: 'Biochemistry' },
    { name: 'Lipid Profile (Cholesterol & Triglycerides)', cat: 'Biochemistry' },
    { name: 'Liver Function Test (LFT)', cat: 'Biochemistry' },
    { name: 'Kidney Function Test / Serum Creatinine', cat: 'Biochemistry' },
    { name: 'Serum Uric Acid', cat: 'Biochemistry' },
    { name: 'Thyroid Profile (T3, T4, TSH)', cat: 'Endocrine' },
    { name: 'Widal Test (Typhoid Slide)', cat: 'Serology' },
    { name: 'Dengue NS1 Antigen & Antibody', cat: 'Serology' },
    { name: 'Malaria Antigen Card Test', cat: 'Serology' },
    { name: 'Urine Routine & Microscopy (R/M)', cat: 'Urine' },
    { name: 'Chest X-Ray (PA View)', cat: 'Radiology' },
    { name: 'ECG 12-Lead (Electrocardiogram)', cat: 'Cardiology' }
  ];

  const [selectedTests, setSelectedTests] = useState(
    initialTests.length > 0 ? initialTests : ['CBC (Complete Blood Count & Platelets)', 'Blood Sugar - Fasting (FBS)']
  );
  const [customTest, setCustomTest] = useState('');

  const toggleTest = (testName) => {
    if (selectedTests.includes(testName)) {
      setSelectedTests(selectedTests.filter(t => t !== testName));
    } else {
      setSelectedTests([...selectedTests, testName]);
    }
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (!customTest.trim()) return;
    if (!selectedTests.includes(customTest.trim())) {
      setSelectedTests([...selectedTests, customTest.trim()]);
    }
    setCustomTest('');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col">
        {/* Modal Controls Header */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icons.Flask className="w-5 h-5 text-teal-300" />
            <div>
              <h3 className="font-display font-bold text-sm text-white">Lab & Diagnostic Investigation Requisition</h3>
              <p className="text-[11px] text-slate-400">Pathology & Radiology Referral Slip (जांच पर्ची)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-black px-4 py-1.5 rounded-xl text-xs uppercase tracking-wider shadow-md active:scale-95 inline-flex items-center gap-1.5"
            >
              <Icons.Printer className="w-3.5 h-3.5" /> Print Lab Slip
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-sm font-bold px-2 py-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Quick Test Toggles for Doctor */}
        <div className="no-print p-4 bg-slate-50 border-b border-slate-200 text-xs">
          <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-2">Select Recommended Investigations:</p>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
            {standardTests.map(t => {
              const isSelected = selectedTests.includes(t.name);
              return (
                <button
                  key={t.name}
                  onClick={() => toggleTest(t.name)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                    isSelected ? 'bg-teal-600 text-white border-teal-700 font-bold shadow-sm' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '} {t.name}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleAddCustom} className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="Add other custom test (e.g. Serum Ferritin, USG Pelvis)..."
              value={customTest}
              onChange={(e) => setCustomTest(e.target.value)}
              className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
            />
            <button
              type="submit"
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-3 py-1.5 rounded-xl text-xs"
            >
              Add
            </button>
          </form>
        </div>

        {/* Printable Paper Slip */}
        <div className="p-6 bg-slate-200/70 flex justify-center overflow-y-auto max-h-[60vh]">
          <div
            id="printable-lab-slip"
            className="bg-white text-slate-900 p-6 max-w-lg w-full shadow-md border-2 border-slate-900 font-sans text-xs space-y-4"
          >
            {/* Clinic / Doctor Header */}
            <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
              <div>
                <h2 className="font-display font-black text-base text-slate-900">{doctor.name}</h2>
                <p className="text-[11px] font-semibold text-slate-700">{doctor.degree}</p>
                <p className="text-[10px] text-slate-500 font-mono">Reg. No: {doctor.regNo}</p>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded uppercase font-mono">
                  LAB REQUISITION SLIP
                </span>
                <p className="font-display font-black text-xs text-slate-900 mt-1">{doctor.clinicName}</p>
                <p className="text-[10px] text-slate-500">{doctor.helplinePhone}</p>
              </div>
            </div>

            {/* Patient Demographics */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200 text-[11px]">
              <div>
                <p><span className="text-slate-500">Patient:</span> <b>{patient.name}</b></p>
                <p><span className="text-slate-500">Age / Sex:</span> {patient.age}y / {patient.gender}</p>
              </div>
              <div className="text-right">
                <p><span className="text-slate-500">Date:</span> <b>{todayStr}</b></p>
                <p><span className="text-slate-500">OPD Token:</span> <b className="font-mono text-emerald-800">#{patient.token < 10 ? '0' + patient.token : patient.token}</b></p>
              </div>
            </div>

            {/* Provisional Diagnosis */}
            <div className="text-[11px] bg-amber-50/60 p-2 rounded border border-amber-200 text-amber-950">
              <span className="font-bold text-slate-700">Clinical Provisional Diagnosis: </span>
              <span className="font-semibold">{diagnosis || patient.diagnosis || patient.symptom || 'Evaluation & Routine Workup'}</span>
            </div>

            {/* Investigation Checklist */}
            <div>
              <p className="font-bold text-slate-900 uppercase tracking-wider text-[10px] mb-2 border-b pb-1 flex items-center gap-1.5">
                <Icons.Activity className="w-3.5 h-3.5 text-teal-700" />
                <span>Required Diagnostic Investigations (जांचें):</span>
              </p>
              {selectedTests.length === 0 ? (
                <p className="text-slate-400 italic py-2">No tests selected.</p>
              ) : (
                <ul className="space-y-1.5 pl-1">
                  {selectedTests.map((t, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-900 font-medium">
                      <span className="w-4 h-4 rounded border-2 border-slate-900 flex items-center justify-center font-bold text-[10px] bg-slate-100">
                        ✓
                      </span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Instructions & Doctor Signature */}
            <div className="pt-6 border-t border-slate-300 flex justify-between items-end text-[10px] text-slate-600">
              <div className="space-y-0.5">
                <p>&bull; Fasting blood sugar requires 8-10 hours overnight fasting.</p>
                <p>&bull; Bring report to clinic for review consultation.</p>
              </div>
              <div className="text-center font-bold">
                <div className="h-10 border-b border-slate-400 mb-1 w-32 mx-auto"></div>
                <p>{doctor.name}</p>
                <p className="text-[9px] text-slate-400 font-mono">Consulting Physician</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
