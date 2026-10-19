import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { CLINIC_CONFIG } from '../config/clinic.config';
import Icons from './Icons';

/**
 * =========================================================================
 * IN-HOUSE MEDICAL STORE & PHARMACY DESK (दवाई काउंटर मॉड्यूल)
 * =========================================================================
 * Receives live prescriptions from Doctor Cabin, calculates bill, allows
 * pharmacist to mark dispensed, and prints an authentic pharmacy cash memo.
 */
export default function PharmacyDesk({ onExit, onOpenDoctor, onOpenCompounder }) {
  const { patients, dispensePharmacy } = useQueue();
  const doctor = CLINIC_CONFIG.doctor;

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'dispensed' | 'all'
  const [searchTerm, setSearchTerm] = useState('');
  const [printInvoicePatient, setPrintInvoicePatient] = useState(null);

  // Filter patients that have a prescription
  const rxPatients = patients.filter(p => p.prescription && p.prescription.length > 0);

  const filteredPatients = rxPatients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.token.toString() === searchTerm.trim() ||
                          (p.phone && p.phone.includes(searchTerm.trim()));
    if (activeTab === 'pending') return matchesSearch && p.pharmacyStatus === 'pending';
    if (activeTab === 'dispensed') return matchesSearch && p.pharmacyStatus === 'dispensed';
    return matchesSearch;
  });

  const pendingCount = rxPatients.filter(p => p.pharmacyStatus === 'pending').length;
  const dispensedCount = rxPatients.filter(p => p.pharmacyStatus === 'dispensed').length;
  const totalPharmacyRevenue = rxPatients
    .filter(p => p.pharmacyStatus === 'dispensed')
    .reduce((sum, p) => sum + (p.pharmacyTotal || 0), 0);

  const handleDispense = (patientId) => {
    dispensePharmacy(patientId);
  };

  return (
    <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
      {/* Top Header */}
      <div className="no-print bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-black text-2xl border border-amber-500/30">
            <Icons.Pill className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-300">
                In-House Medical Store & Pharmacy Desk (दवाई काउंटर)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-black text-white mt-0.5">
              {doctor.clinicName} &bull; Pharmacy Counter
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenDoctor && (
            <button
              onClick={onOpenDoctor}
              className="bg-slate-800 hover:bg-slate-700 text-teal-300 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Icons.Stethoscope className="w-3.5 h-3.5" /> Doctor Cabin
            </button>
          )}
          {onOpenCompounder && (
            <button
              onClick={onOpenCompounder}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-300 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Icons.User className="w-3.5 h-3.5" /> Reception Desk
            </button>
          )}
          {onExit && (
            <button
              onClick={onExit}
              className="bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1"
            >
              <Icons.X className="w-3.5 h-3.5" /> Exit Desk
            </button>
          )}
        </div>
      </div>

      {/* Pharmacy KPI Dashboard */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Pending to Dispense</p>
            <p className="font-display font-black text-3xl text-slate-900 mt-1">{pendingCount}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Patients waiting for medicines</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">
            <Icons.Clock className="w-6 h-6 text-amber-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Dispensed Today</p>
            <p className="font-display font-black text-3xl text-emerald-600 mt-1">{dispensedCount}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Medicines handed over & billed</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
            <Icons.CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700">Total Pharmacy Collection</p>
            <p className="font-display font-black text-3xl text-teal-800 mt-1">₹{totalPharmacyRevenue}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Net sales from in-house stock</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center text-xl font-bold">
            <Icons.IndianRupee className="w-6 h-6 text-teal-600" />
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold gap-1">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-lg transition-all inline-flex items-center gap-1.5 ${
              activeTab === 'pending' ? 'bg-amber-500 text-slate-950 shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icons.Clock className="w-3.5 h-3.5" /> Pending Dispense ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab('dispensed')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'dispensed' ? 'bg-emerald-600 text-white shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ✓ Dispensed Today ({dispensedCount})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'all' ? 'bg-slate-900 text-white shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Prescriptions ({rxPatients.length})
          </button>
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search patient, token, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Prescription Cards Grid */}
      <div className="no-print space-y-4">
        {filteredPatients.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm text-slate-400">
            <Icons.Pill className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-sm text-slate-600">No prescriptions found in this view</p>
            <p className="text-xs text-slate-400 mt-1">Prescriptions issued by Doctor Cabin will appear here in real-time.</p>
          </div>
        ) : (
          filteredPatients.map(pat => {
            const isPending = pat.pharmacyStatus === 'pending';
            const totalBill = pat.prescription.reduce((s, m) => s + (m.price || 75), 0);

            return (
              <div
                key={pat.id}
                className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all shadow-sm ${
                  isPending ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200'
                }`}
              >
                {/* Patient Top Header */}
                <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-display font-black text-xl">
                      #{pat.token < 10 ? '0' + pat.token : pat.token}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-base text-slate-900">{pat.name}</h3>
                        <span className="text-xs text-slate-500">{pat.age}y / {pat.gender}</span>
                        {pat.isReview && (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                            <Icons.RefreshCw className="w-2.5 h-2.5" /> 7-Day Free Review
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        <b className="text-slate-700">Diagnosis:</b> {pat.diagnosis || 'General OPD'} &bull; Phone: {pat.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${
                      isPending ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                    }`}>
                      {isPending ? 'Awaiting Dispensing' : '✓ Dispensed & Billed'}
                    </span>
                  </div>
                </div>

                {/* Prescribed Medicines Table */}
                <div className="py-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100">
                        <th className="pb-2">#</th>
                        <th className="pb-2">Medicine Name & Formulation</th>
                        <th className="pb-2">Dosage (Frequency)</th>
                        <th className="pb-2">Timing & Instructions</th>
                        <th className="pb-2">Duration</th>
                        <th className="pb-2 text-right">Estimated Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {pat.prescription.map((med, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 text-slate-400 font-bold">{idx + 1}</td>
                          <td className="py-2.5 font-bold text-slate-900">{med.name}</td>
                          <td className="py-2.5 font-mono text-emerald-800 font-bold">{med.dose}</td>
                          <td className="py-2.5 text-slate-600">{med.timing}</td>
                          <td className="py-2.5 font-semibold text-slate-700">{med.duration}</td>
                          <td className="py-2.5 text-right font-mono font-bold text-slate-900">₹{med.price || 75}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Card Footer with Bill & Actions */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-4 rounded-b-3xl">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">Total Medicines: <b className="text-slate-900">{pat.prescription.length} Items</b></span>
                    <span className="text-slate-300">|</span>
                    <span className="text-xs text-slate-700 font-bold">Total Bill: <span className="font-display text-lg text-emerald-700 font-black">₹{totalBill}</span></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPrintInvoicePatient(pat)}
                      className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <Icons.Receipt className="w-3.5 h-3.5 text-slate-600" /> Print Pharmacy Cash Memo
                    </button>
                    {isPending && (
                      <button
                        onClick={() => handleDispense(pat.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95 flex items-center gap-1"
                      >
                        <Icons.Check className="w-3.5 h-3.5" /> Mark Dispensed (दवाई दी गई)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Printable Pharmacy Cash Memo Modal */}
      {printInvoicePatient && (
        <PharmacyInvoiceModal
          patient={printInvoicePatient}
          onClose={() => setPrintInvoicePatient(null)}
        />
      )}
    </div>
  );
}

/**
 * =========================================================================
 * MODAL: AUTHENTIC PHARMACY CASH MEMO / INVOICE PREVIEW & PRINT
 * =========================================================================
 */
export function PharmacyInvoiceModal({ patient, onClose }) {
  if (!patient) return null;
  const doctor = CLINIC_CONFIG.doctor;
  const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const invoiceNo = `PHARM-${patient.token < 10 ? '0' + patient.token : patient.token}-${Date.now().toString().slice(-4)}`;
  const totalBill = patient.prescription.reduce((s, m) => s + (m.price || 75), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col">
        {/* Modal Header */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icons.Receipt className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-display font-bold text-sm text-white">Pharmacy Cash Memo</h3>
              <p className="text-[11px] text-slate-400">Official Retail Drug Invoice & Instructions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-1.5 rounded-xl text-xs uppercase tracking-wider shadow-md active:scale-95 inline-flex items-center gap-1.5"
            >
              <Icons.Printer className="w-3.5 h-3.5" /> Print Cash Memo
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-sm font-bold px-2 py-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Memo Content */}
        <div className="p-6 bg-slate-100 flex justify-center overflow-y-auto max-h-[75vh]">
          <div
            id="printable-pharmacy-slip"
            className="bg-white text-slate-900 p-6 max-w-xl w-full shadow-md border border-slate-300 font-sans text-xs space-y-4"
          >
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-3 text-center">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">RETAIL MEDICAL STORE CASH MEMO</span>
              <h2 className="font-display font-black text-lg text-slate-900 uppercase tracking-tight mt-0.5">
                {doctor.clinicName} &bull; IN-HOUSE PHARMACY
              </h2>
              <p className="text-[11px] text-slate-600">{doctor.address}</p>
              <div className="flex justify-center gap-4 text-[10px] text-slate-500 font-mono mt-1">
                <span>D.L. No: <b>20B/7482, 21B/7483</b></span>
                <span>GSTIN: <b>08AABCV1234F1Z8</b></span>
                <span>Phone: <b>{doctor.helplinePhone}</b></span>
              </div>
            </div>

            {/* Demographics & Meta */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px]">
              <div>
                <p><span className="text-slate-500">Invoice No:</span> <b>{invoiceNo}</b></p>
                <p><span className="text-slate-500">Patient:</span> <b className="text-slate-900">{patient.name}</b> ({patient.age}y / {patient.gender})</p>
                <p><span className="text-slate-500">Phone:</span> {patient.phone || 'N/A'}</p>
              </div>
              <div className="text-right">
                <p><span className="text-slate-500">Date:</span> <b>{todayStr}</b></p>
                <p><span className="text-slate-500">OPD Token:</span> <b className="text-emerald-700 font-mono text-sm">#{patient.token < 10 ? '0' + patient.token : patient.token}</b></p>
                <p><span className="text-slate-500">Prescribing Dr:</span> <b>{doctor.name}</b></p>
              </div>
            </div>

            {/* Medicines Dispensed Table */}
            <div>
              <table className="w-full text-left text-[11px] border border-slate-300">
                <thead className="bg-slate-100 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r border-slate-300">#</th>
                    <th className="p-2 border-r border-slate-300">Particulars (Medicine Name)</th>
                    <th className="p-2 border-r border-slate-300">Dosage</th>
                    <th className="p-2 border-r border-slate-300">Duration</th>
                    <th className="p-2 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {patient.prescription.map((m, i) => (
                    <tr key={i}>
                      <td className="p-2 border-r border-slate-200 text-slate-500">{i + 1}</td>
                      <td className="p-2 border-r border-slate-200 font-bold text-slate-900">
                        {m.name}
                        <span className="block text-[10px] text-slate-500 font-normal">{m.timing}</span>
                      </td>
                      <td className="p-2 border-r border-slate-200 font-mono text-emerald-800 font-bold">{m.dose}</td>
                      <td className="p-2 border-r border-slate-200">{m.duration}</td>
                      <td className="p-2 text-right font-mono font-bold">₹{m.price || 75}.00</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-900">
                  <tr>
                    <td colSpan="4" className="p-2 text-right uppercase tracking-wider text-slate-700">Net Total Amount (All Taxes Incl.):</td>
                    <td className="p-2 text-right font-mono text-sm text-slate-950 font-black">₹{totalBill}.00</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Terms and Signature */}
            <div className="pt-4 border-t border-dashed border-slate-300 flex justify-between items-end text-[10px] text-slate-600">
              <div className="space-y-0.5">
                <p>&bull; Medicines once sold will not be taken back without original bill.</p>
                <p>&bull; Store in a cool & dry place. Keep out of reach of children.</p>
                <p>&bull; Take medicines strictly as directed by the doctor.</p>
              </div>
              <div className="text-center font-bold">
                <div className="h-8 border-b border-slate-400 mb-1 w-28 mx-auto"></div>
                <p>Authorized Pharmacist</p>
                <p className="text-[9px] text-slate-400 font-mono">Apex Medical Counter</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
