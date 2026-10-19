import React from 'react';
import { CLINIC_CONFIG } from '../config/clinic.config';
import Icons from './Icons';

/**
 * =========================================================================
 * OPD TOKEN PARCHI (पर्ची) — CLINIC QUEUE SLIP
 * =========================================================================
 * Styled after real Indian clinic token slips / OPD registration receipts.
 * Prints on 58mm/80mm thermal POS paper (or A5 fallback).
 * Given to patient by compounder upon arrival.
 */
export function ThermalTokenSlip({ patient, clinic = CLINIC_CONFIG }) {
  const doctor = clinic.doctor;
  const tokenNum = patient.token < 10 ? `0${patient.token}` : String(patient.token);
  const todayStr =
    patient.date ||
    new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr =
    patient.time ||
    new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const shift = patient.shift || 'Morning OPD';
  const fee = doctor.consultationFee || '₹600';

  return (
    <div
      id="printable-thermal-slip"
      className="bg-white text-black font-sans"
      style={{ width: '76mm', minHeight: '370px', fontSize: '11px', lineHeight: 1.4 }}
    >
      {/* ── CLINIC HEADER ── */}
      <div
        style={{ borderBottom: '2px solid black', paddingBottom: '8px', marginBottom: '6px', textAlign: 'center' }}
      >
        {/* Cross / Plus Symbol */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '2px' }}>
          <div
            style={{
              width: '20px', height: '20px', background: '#065f46', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: '16px', borderRadius: '3px', flexShrink: 0,
            }}
          >
            +
          </div>
          <span style={{ fontWeight: 900, fontSize: '13px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            {doctor.clinicName}
          </span>
        </div>
        <p style={{ fontSize: '9px', color: '#374151', margin: 0, lineHeight: 1.3 }}>
          {doctor.address}, {doctor.city}
        </p>
        <p style={{ fontSize: '9px', color: '#374151', margin: '1px 0 0' }}>
          Ph: {doctor.helplinePhone}
        </p>
      </div>

      {/* ── DOCTOR DETAILS ── */}
      <div
        style={{ borderBottom: '1px dashed #000', paddingBottom: '6px', marginBottom: '6px', textAlign: 'center' }}
      >
        <p style={{ fontWeight: 900, fontSize: '12px', margin: 0 }}>{doctor.name}</p>
        <p style={{ fontSize: '9px', fontWeight: 600, color: '#1f2937', margin: '1px 0 0' }}>
          {doctor.degree}
        </p>
        <p style={{ fontSize: '9px', color: '#374151', margin: '1px 0 0' }}>
          NMC Reg. No.: {doctor.regNo}
        </p>
        <p style={{ fontSize: '9px', color: '#374151', margin: '1px 0 0' }}>
          OPD: {doctor.morningShift} &bull; {doctor.eveningShift}
        </p>
      </div>

      {/* ── BIG TOKEN NUMBER ── */}
      <div
        style={{
          background: '#0f172a', color: 'white',
          padding: '10px 8px', textAlign: 'center',
          borderRadius: '4px', marginBottom: '6px',
        }}
      >
        <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 2px', color: '#34d399', fontWeight: 700 }}>
          OPD TOKEN NUMBER
        </p>
        <p style={{ fontSize: '42px', fontWeight: 900, lineHeight: 1, margin: '0 0 4px', letterSpacing: '-1px', color: '#fbbf24' }}>
          #{tokenNum}
        </p>
        <span
          style={{
            display: 'inline-block', background: patient.source === 'Online' ? '#059669' : '#1d4ed8',
            color: 'white', fontSize: '9px', fontWeight: 700, padding: '1px 8px', borderRadius: '2px',
            letterSpacing: '1px', textTransform: 'uppercase',
          }}
        >
          {patient.source === 'Online' ? 'ONLINE BOOKING' : 'WALK-IN PATIENT'}
        </span>
      </div>

      {/* ── PATIENT DETAILS TABLE ── */}
      <div style={{ borderBottom: '1px dashed #000', paddingBottom: '6px', marginBottom: '6px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
          <tbody>
            <tr>
              <td style={{ color: '#6b7280', paddingBottom: '3px', width: '90px', fontWeight: 600 }}>Patient Name:</td>
              <td style={{ fontWeight: 700, paddingBottom: '3px' }}>{patient.name || 'Walk-In'}</td>
            </tr>
            <tr>
              <td style={{ color: '#6b7280', paddingBottom: '3px', fontWeight: 600 }}>Age / Gender:</td>
              <td style={{ fontWeight: 600, paddingBottom: '3px' }}>{patient.age} Yrs / {patient.gender}</td>
            </tr>
            <tr>
              <td style={{ color: '#6b7280', paddingBottom: '3px', fontWeight: 600 }}>Mobile:</td>
              <td style={{ fontWeight: 600, paddingBottom: '3px' }}>{patient.phone || '—'}</td>
            </tr>
            <tr>
              <td style={{ color: '#6b7280', paddingBottom: '3px', fontWeight: 600 }}>Date:</td>
              <td style={{ fontWeight: 600, paddingBottom: '3px' }}>{todayStr}</td>
            </tr>
            <tr>
              <td style={{ color: '#6b7280', paddingBottom: '3px', fontWeight: 600 }}>Time:</td>
              <td style={{ fontWeight: 600, paddingBottom: '3px' }}>{timeStr}</td>
            </tr>
            <tr>
              <td style={{ color: '#6b7280', paddingBottom: '3px', fontWeight: 600 }}>Shift:</td>
              <td style={{ fontWeight: 600, paddingBottom: '3px' }}>{shift.split('(')[0].trim()}</td>
            </tr>
            <tr>
              <td style={{ color: '#6b7280', fontWeight: 600 }}>Consult. Fee:</td>
              <td style={{ fontWeight: 900, color: '#065f46' }}>{fee} — PAID</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── WAIT TIME ESTIMATE ── */}
      <div
        style={{
          background: '#f0fdf4', border: '1px solid #86efac',
          borderRadius: '4px', padding: '5px 8px', marginBottom: '6px', textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '9px', fontWeight: 700, color: '#166534', margin: 0 }}>
          Estimated Waiting Time: ~15-25 Minutes
        </p>
        <p style={{ fontSize: '8px', color: '#374151', margin: '1px 0 0' }}>
          Token #{tokenNum} | Watch TV Screen for Ding-Dong Chime
        </p>
      </div>

      {/* ── QR CODE (Simulated) ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '6px', borderBottom: '1px dashed #000', marginBottom: '6px' }}>
        {/* SVG QR Code Simulation */}
        <div
          style={{
            width: '72px', height: '72px', padding: '5px',
            border: '2px solid #000', background: 'white',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: '20px', height: '20px', border: '2px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px' }}>
              <div style={{ width: '10px', height: '10px', background: 'black' }}></div>
            </div>
            <div style={{ width: '6px', height: '6px', background: 'black', marginTop: '3px' }}></div>
            <div style={{ width: '20px', height: '20px', border: '2px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px' }}>
              <div style={{ width: '10px', height: '10px', background: 'black' }}></div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3px' }}>
            <div style={{ width: '6px', height: '6px', background: 'black' }}></div>
            <div style={{ width: '10px', height: '10px', background: 'black' }}></div>
            <div style={{ width: '4px', height: '4px', background: 'black' }}></div>
            <div style={{ width: '7px', height: '7px', background: 'black' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ width: '20px', height: '20px', border: '2px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px' }}>
              <div style={{ width: '10px', height: '10px', background: 'black' }}></div>
            </div>
            <div style={{ width: '5px', height: '5px', background: 'black', marginBottom: '2px' }}></div>
            <div style={{ width: '13px', height: '13px', background: 'black' }}></div>
          </div>
        </div>
        <p style={{ fontSize: '8px', fontWeight: 700, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          SCAN — LIVE QUEUE TRACKER
        </p>
        <p style={{ fontSize: '7px', color: '#6b7280', margin: '1px 0 0' }}>
          Wait in car or outside &bull; Real-time alerts
        </p>
      </div>

      {/* ── INSTRUCTIONS ── */}
      <div style={{ fontSize: '8.5px', color: '#374151', marginBottom: '6px', lineHeight: 1.5 }}>
        <p style={{ fontWeight: 700, margin: '0 0 2px', fontSize: '9px' }}>Patient Instructions / निर्देश:</p>
        <p style={{ margin: '0 0 1px' }}>1. Kripya yeh parchi doctor ko dikhayein.</p>
        <p style={{ margin: '0 0 1px' }}>2. TV screen par apna token number dekhein.</p>
        <p style={{ margin: '0 0 1px' }}>3. Mobile number registered — turn aane par SMS milega.</p>
        <p style={{ margin: 0 }}>4. Koi inquiry: Reception desk par sampark karein.</p>
      </div>

      {/* ── FOOTER / CUT LINE ── */}
      <div
        style={{
          borderTop: '1px dashed #000', paddingTop: '5px', textAlign: 'center', fontSize: '8px', color: '#6b7280',
        }}
      >
        <p style={{ margin: 0, fontWeight: 700 }}>{doctor.clinicName}</p>
        <p style={{ margin: '1px 0 0' }}>Token #{tokenNum} &bull; NON-TRANSFERABLE &bull; 1 Visit Only</p>
        <p style={{ margin: '2px 0 0', fontStyle: 'italic', fontSize: '7px' }}>
          Generated by Clinic OS &bull; {todayStr}
        </p>
      </div>
    </div>
  );
}

/**
 * =========================================================================
 * MODAL: THERMAL TOKEN PARCHI PREVIEW + PRINT
 * =========================================================================
 */
export function ThermalTokenModal({ patient, onClose }) {
  if (!patient) return null;

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-700 overflow-hidden my-auto flex flex-col">

        {/* Modal Header */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <Icons.Receipt className="w-4.5 h-4.5 text-emerald-400" />
            </span>
            <div>
              <h3 className="font-bold text-sm text-white">OPD Token Parchi (पर्ची)</h3>
              <p className="text-[11px] text-slate-400">
                Thermal POS Slip &bull; Token #{patient.token < 10 ? `0${patient.token}` : patient.token} &bull; {patient.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Icons.X className="w-4 h-4" />
          </button>
        </div>

        {/* Slip Preview — gray paper background */}
        <div className="p-5 bg-slate-800/70 flex justify-center overflow-y-auto max-h-[72vh]">
          <div className="shadow-xl">
            <ThermalTokenSlip patient={patient} />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="no-print p-4 bg-slate-900 border-t border-slate-800 flex gap-2">
          <button
            onClick={onClose}
            className="w-1/3 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="w-2/3 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <Icons.Printer className="w-3.5 h-3.5" />
            Print Token Parchi
          </button>
        </div>
      </div>
    </div>
  );
}

export default ThermalTokenSlip;
