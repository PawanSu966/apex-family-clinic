import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { CLINIC_CONFIG } from '../config/clinic.config';
import Icons from './Icons';

/**
 * =========================================================================
 * DAILY OPD REGISTER & ACCOUNTS / BILLING SUMMARY (दैनिक ओपीडी बहीखाता)
 * =========================================================================
 * Essential for clinic shift accounting, total fee collections, and legal OPD records.
 * Supports 1-click CSV/Excel export and official accounting print format.
 */
export default function DailyOpdRegister({ onExit, onOpenTv }) {
  const { patients } = useQueue();
  const doctor = CLINIC_CONFIG.doctor;

  const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const feePerPatient = parseInt(doctor.consultationFee?.replace(/\D/g, '') || '600', 10);

  // Filter state
  const [filterSource, setFilterSource] = useState('all'); // 'all' | 'Walk-In' | 'Online'
  const [searchTerm, setSearchTerm] = useState('');

  // Payment statuses stored locally or derived
  const [payments, setPayments] = useState(() => {
    // Default initial mock payments
    const init = {};
    patients.forEach((p, idx) => {
      init[p.id] = idx % 2 === 0 ? 'Cash' : 'UPI';
    });
    return init;
  });

  const handleTogglePayment = (patientId) => {
    setPayments(prev => ({
      ...prev,
      [patientId]: prev[patientId] === 'Cash' ? 'UPI' : prev[patientId] === 'UPI' ? 'Cash' : 'UPI'
    }));
  };

  const filtered = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.token.toString() === searchTerm.trim();
    if (filterSource === 'all') return matchesSearch;
    return matchesSearch && p.source === filterSource;
  });

  // Financial calculations
  const totalRegistered = patients.length;
  const completedCount = patients.filter(p => p.status === 'completed').length;
  const totalRevenue = totalRegistered * feePerPatient;
  const cashPatients = patients.filter(p => (payments[p.id] || 'Cash') === 'Cash').length;
  const upiPatients = totalRegistered - cashPatients;
  const cashRevenue = cashPatients * feePerPatient;
  const upiRevenue = upiPatients * feePerPatient;

  // Export to CSV / Excel
  const handleExportCsv = () => {
    const headers = ["Token", "Time", "Patient Name", "Age", "Gender", "Phone", "Concern/Symptom", "Booking Type", "Status", "Fee (INR)", "Payment Mode"];
    const rows = patients.map((p, idx) => [
      `#${p.token < 10 ? '0' + p.token : p.token}`,
      p.time || '10:00 AM',
      `"${p.name}"`,
      p.age,
      p.gender,
      p.phone || 'N/A',
      `"${p.symptom || 'General OPD'}"`,
      p.source,
      p.status,
      feePerPatient,
      payments[p.id] || 'Cash'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `OPD_Register_${doctor.clinicName.replace(/\s+/g, '_')}_${todayStr.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
      {/* Top Header */}
      <div className="no-print bg-hospital-navy text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-teal-300">
              Daily OPD Register & Accounts Ledger (दैनिक बहीखाता)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-black text-white mt-0.5">
            {doctor.clinicName} &bull; <span className="text-emerald-400">{todayStr}</span>
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <Icons.Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="bg-slate-800 hover:bg-slate-700 text-teal-300 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 shadow-md"
          >
            <Icons.Printer className="w-3.5 h-3.5" /> Print Daily Register
          </button>
          <button
            onClick={onExit}
            className="bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1"
          >
            <Icons.X className="w-3.5 h-3.5" /> Close
          </button>
        </div>
      </div>

      {/* Financial & Operational KPI Cards */}
      <div className="no-print grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Patients</p>
          <p className="font-display font-black text-3xl text-slate-900 mt-1">{totalRegistered}</p>
          <p className="text-[10px] text-slate-400 mt-1">{completedCount} Completed &bull; {totalRegistered - completedCount} Waiting</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Total Fee Collection</p>
          <p className="font-display font-black text-3xl text-emerald-700 mt-1">₹{totalRevenue.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-400 mt-1">At {doctor.consultationFee || '₹600'} per patient</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Cash In Hand (गल्ला)</p>
          <p className="font-display font-black text-3xl text-amber-600 mt-1">₹{cashRevenue.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-400 mt-1">{cashPatients} Patients Paid Cash</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700">Online / UPI Collection</p>
          <p className="font-display font-black text-3xl text-teal-700 mt-1">₹{upiRevenue.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-400 mt-1">{upiPatients} Patients Paid UPI / QR</p>
        </div>
      </div>

      {/* Main Register Table (Visible on Screen & Prints Official Report) */}
      <div id="printable-daily-register" className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6">
        {/* Printable Letterhead (Shown in Print Mode) */}
        <div className="hidden print:block pb-4 mb-4 border-b-2 border-slate-900">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-black text-xl text-slate-900 uppercase">{doctor.clinicName}</h1>
              <p className="text-xs text-slate-600">{doctor.address}, {doctor.city} &bull; Ph: {doctor.helplinePhone}</p>
              <h2 className="text-sm font-bold text-slate-900 mt-1">DAILY OPD PATIENT REGISTER & FEE COLLECTION LEDGER</h2>
            </div>
            <div className="text-right text-xs">
              <p><b>Date:</b> {todayStr}</p>
              <p><b>Doctor:</b> {doctor.name} ({doctor.regNo})</p>
              <p><b>Total Collection:</b> ₹{totalRevenue.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Screen Controls */}
        <div className="no-print pb-4 mb-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilterSource('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${filterSource === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
            >
              All ({totalRegistered})
            </button>
            <button
              onClick={() => setFilterSource('Walk-In')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${filterSource === 'Walk-In' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
            >
              Walk-Ins Only
            </button>
            <button
              onClick={() => setFilterSource('Online')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${filterSource === 'Online' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
            >
              Online Portal Bookings
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search patient name / token..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600 w-60"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-700 border-b border-slate-300">
              <tr>
                <th className="py-2.5 px-3">Token</th>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-4">Patient Name</th>
                <th className="py-2.5 px-3">Age / Sex</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-4">Concern / Symptoms</th>
                <th className="py-2.5 px-3">Booking</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Fee</th>
                <th className="py-2.5 px-3 text-center">Payment Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {filtered.map((p) => {
                const mode = payments[p.id] || 'Cash';
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-display font-black text-sm text-slate-900">
                      #{p.token < 10 ? `0${p.token}` : p.token}
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                      {p.time || '10:15 AM'}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {p.name}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {p.age}y / {p.gender}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {p.phone || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs truncate">
                      {p.symptom}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.source === 'Online' ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {p.source}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.status === 'serving' ? 'bg-emerald-100 text-emerald-800' :
                        p.status === 'waiting' ? 'bg-amber-100 text-amber-800' :
                        p.status === 'completed' ? 'bg-slate-100 text-slate-600' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      ₹{feePerPatient}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleTogglePayment(p.id)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                          mode === 'Cash'
                            ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                            : 'bg-teal-50 text-teal-800 border-teal-300 hover:bg-teal-100'
                        }`}
                        title="Click to toggle Cash / UPI"
                      >
                        {mode === 'Cash' ? (
                          <span className="inline-flex items-center gap-1">
                            <Icons.IndianRupee className="w-2.5 h-2.5" /> Cash
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <Icons.CreditCard className="w-2.5 h-2.5" /> UPI / QR
                          </span>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Printable Footer Signatures */}
        <div className="hidden print:flex justify-between items-end pt-8 mt-6 border-t-2 border-slate-900 text-xs">
          <div>
            <p className="font-bold text-slate-800">Accounts Verified By (Receptionist / Compounder):</p>
            <div className="h-10"></div>
            <p className="border-t border-slate-400 pt-1 font-mono">Sign & Date</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-800">Doctor / Clinic Owner In-charge:</p>
            <div className="h-10"></div>
            <p className="border-t border-slate-400 pt-1 font-mono">{doctor.name} &bull; Sign & Stamp</p>
          </div>
        </div>
      </div>
    </div>
  );
}
