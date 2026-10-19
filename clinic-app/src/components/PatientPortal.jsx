import React, { useState, useRef } from 'react';
import { CLINIC_CONFIG } from '../config/clinic.config';
import { useQueue } from '../context/QueueContext';
import Icons from './Icons';
import { OpdPrescriptionModal } from './OpdPrescriptionSlip';
import { ThermalTokenModal } from './ThermalTokenSlip';

export default function PatientPortal({ onOpenStaff, onOpenTv }) {
  const doctor = CLINIC_CONFIG.doctor;
  const { patients, servingToken, doctorStatus, bookOnlineToken, check7DayReview, playHospitalChime } = useQueue();

  // Navigation active tab
  const [activeNav, setActiveNav] = useState('Home');

  // Appointment Form State
  const [visitType, setVisitType] = useState('clinic'); // 'clinic' | 'home'
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowStr = tomorrowObj.toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedShift, setSelectedShift] = useState('Morning (10:00 AM - 01:30 PM)');
  const [patientName, setPatientName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  const [patientSymptom, setPatientSymptom] = useState('General Consultation');
  const [homeAddress, setHomeAddress] = useState('');

  // Modals
  const [confirmedPatient, setConfirmedPatient] = useState(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [showConditionsModal, setShowConditionsModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showOpdModal, setShowOpdModal] = useState(false);
  const [showThermalModal, setShowThermalModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const appointmentSectionRef = useRef(null);
  const nameInputRef = useRef(null);

  // 7-day review check
  const reviewMatch = mobileNumber ? check7DayReview(mobileNumber) : null;

  // Scroll to booking form
  const scrollToBooking = (prefillType = null, prefillSymptom = null) => {
    if (prefillType) setVisitType(prefillType);
    if (prefillSymptom) setPatientSymptom(prefillSymptom);

    if (appointmentSectionRef.current) {
      appointmentSectionRef.current.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        if (nameInputRef.current) nameInputRef.current.focus();
      }, 400);
    }
  };

  // Handle Booking Submit
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!patientName.trim()) {
      alert('Please enter patient name.');
      return;
    }
    if (!mobileNumber.trim() || mobileNumber.replace(/\D/g, '').length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }

    const isReview = !!reviewMatch?.isEligible;
    const finalSymptom = visitType === 'home'
      ? `Home Visit: ${patientSymptom}${homeAddress ? ` (${homeAddress})` : ''}`
      : patientSymptom;

    const booked = bookOnlineToken({
      name: patientName.trim(),
      age: patientAge ? parseInt(patientAge, 10) : 35,
      gender: patientGender,
      phone: mobileNumber.trim(),
      symptom: finalSymptom,
      shift: selectedShift,
      isReview
    });

    setConfirmedPatient(booked);
    setBookingSuccess(true);
    playHospitalChime();

    // Prepare WhatsApp Confirmation
    const tokenFormatted = booked.token < 10 ? `0${booked.token}` : booked.token;
    const isHome = visitType === 'home';
    const msg = `*APEX FAMILY CLINIC — APPOINTMENT PASS*\n\n` +
      `*Token No:* #${tokenFormatted}\n` +
      `*Patient:* ${patientName} (${patientAge || '35'}y, ${patientGender})\n` +
      `*Type:* ${isHome ? 'Home Visit Consultation' : 'In-Clinic OPD Consultation'}\n` +
      `*Date:* ${selectedDate}\n` +
      `*Time Window:* ${selectedShift}\n` +
      `*Doctor:* ${doctor.name} (${doctor.degree})\n` +
      `*Consultation Fee:* ${isReview ? '₹0 (7-Day Free Follow-up)' : doctor.consultationFee}\n` +
      `${isHome && homeAddress ? `*Visit Address:* ${homeAddress}\n` : ''}` +
      `*Clinic:* ${doctor.address}\n\n` +
      `_Show this pass at reception desk or keep for your live queue turn._`;

    const waUrl = `https://wa.me/${doctor.whatsappNumber}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  // Queue calculation
  const waitingCount = patients.filter(p => p.status === 'waiting').length;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C2923] font-sans selection:bg-[#133026] selection:text-white">

      {/* ========================================================================= */}
      {/* 1. TOP ANNOUNCEMENT / CONTACT BAR (Deep Forest Pine #133026)             */}
      {/* ========================================================================= */}
      <div className="bg-[#133026] text-white text-[11px] sm:text-xs py-2 px-3 sm:px-8 border-b border-[#0C1E18]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-1.5 gap-x-3">
          
          {/* Address with MapPin */}
          <div className="flex items-center gap-1.5 text-white/90">
            <Icons.MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate max-w-[200px] sm:max-w-md lg:max-w-none">
              {doctor.address}, {doctor.city} - 110017
            </span>
          </div>

          {/* Timings with Clock */}
          <div className="hidden md:flex items-center gap-2 text-white/90">
            <Icons.Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              Mon - Sat: 10:00 AM - 1:30 PM | 5:30 PM - 8:30 PM <span className="text-rose-300 font-medium">(Sunday Closed)</span>
            </span>
          </div>

          {/* Phone & Social Icons */}
          <div className="flex items-center gap-3 ml-auto">
            <a
              href={`tel:${doctor.helplinePhone}`}
              className="flex items-center gap-1.5 text-white hover:text-emerald-300 font-medium transition-colors"
            >
              <Icons.Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="whitespace-nowrap">{doctor.helplinePhone}</span>
            </a>

            <div className="hidden sm:flex items-center gap-2 text-white/80 border-l border-white/20 pl-3">
              <a
                href={`https://wa.me/${doctor.whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                title="WhatsApp Direct Inquiry"
                className="hover:text-emerald-400 transition-colors"
              >
                <Icons.WhatsApp className="w-3.5 h-3.5" />
              </a>
              <span className="hover:text-emerald-400 cursor-pointer" title="Clinic Updates">
                <Icons.Instagram className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN NAVIGATION (Crisp White with Editorial Serif Branding)            */}
      {/* ========================================================================= */}
      <nav className="bg-white border-b border-[#EAE5DD] sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-8 py-3 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Logo & Doctor Subtext */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-[#133026] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Icons.Cross className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-serif font-bold text-lg sm:text-2xl text-[#133026] leading-none tracking-tight truncate">
                Apex Family Clinic
              </h1>
              <p className="text-[10px] sm:text-[11px] text-[#58665E] font-medium mt-0.5 tracking-wide truncate">
                {doctor.name} | {doctor.degree}
              </p>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-7 text-xs font-semibold text-[#3D4C44]">
            <button
              onClick={() => { setActiveNav('Home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`pb-1 transition-all relative ${activeNav === 'Home' ? 'text-[#133026] font-bold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#133026]' : 'hover:text-[#133026]'}`}
            >
              Home
            </button>
            <button
              onClick={() => { setActiveNav('About'); setShowDoctorModal(true); }}
              className={`pb-1 transition-all ${activeNav === 'About' ? 'text-[#133026] font-bold' : 'hover:text-[#133026]'}`}
            >
              About
            </button>
            <button
              onClick={() => { setActiveNav('Services'); setShowServicesModal(true); }}
              className={`pb-1 transition-all ${activeNav === 'Services' ? 'text-[#133026] font-bold' : 'hover:text-[#133026]'}`}
            >
              Services
            </button>
            <button
              onClick={() => { setActiveNav('Conditions'); setShowConditionsModal(true); }}
              className={`pb-1 transition-all ${activeNav === 'Conditions' ? 'text-[#133026] font-bold' : 'hover:text-[#133026]'}`}
            >
              Conditions
            </button>
            <button
              onClick={() => { setActiveNav('Patient Guide'); setShowGuideModal(true); }}
              className={`pb-1 transition-all ${activeNav === 'Patient Guide' ? 'text-[#133026] font-bold' : 'hover:text-[#133026]'}`}
            >
              Patient Guide
            </button>
            <button
              onClick={() => {
                setActiveNav('Clinic Info');
                if (appointmentSectionRef.current) appointmentSectionRef.current.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`pb-1 transition-all ${activeNav === 'Clinic Info' ? 'text-[#133026] font-bold' : 'hover:text-[#133026]'}`}
            >
              Clinic Info
            </button>
            <button
              onClick={() => {
                setActiveNav('Contact');
                window.location.href = `tel:${doctor.helplinePhone}`;
              }}
              className={`pb-1 transition-all ${activeNav === 'Contact' ? 'text-[#133026] font-bold' : 'hover:text-[#133026]'}`}
            >
              Contact
            </button>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* TV Screen Button */}
            <button
              onClick={onOpenTv}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#D5CDC2] text-[#4A5850] hover:text-[#133026] hover:bg-[#F5EFE6] text-xs font-semibold transition-all"
              title="Open Waiting Room Wall TV Display"
            >
              <Icons.Tv className="w-3.5 h-3.5 text-emerald-700" />
              <span>Waiting TV</span>
            </button>

            {/* Staff Chamber Login Button */}
            <button
              onClick={onOpenStaff}
              className="p-2 rounded-lg border border-[#D5CDC2] text-[#4A5850] hover:text-[#133026] hover:bg-[#F5EFE6] transition-all"
              title="Staff Chamber Access (PIN 1234)"
            >
              <Icons.Lock className="w-4 h-4 text-[#133026]" />
            </button>

            {/* Book an Appointment Primary CTA */}
            <button
              onClick={() => scrollToBooking()}
              className="bg-[#133026] hover:bg-[#1A3F32] active:scale-95 text-white font-medium text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg shadow-sm flex items-center gap-1.5 transition-all whitespace-nowrap"
            >
              <span className="hidden sm:inline">Book an Appointment</span>
              <span className="sm:hidden font-semibold">Book</span>
              <Icons.ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 3. HERO SECTION (Thoughtful Medical Care for You and Your Family)         */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-6 pb-10 sm:pt-8 sm:pb-12 lg:pt-14 lg:pb-16 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
            
            {/* Left Column: Editorial Headline & Actions */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              
              {/* Pre-Heading */}
              <div className="flex items-center gap-2 text-[10px] sm:text-xs font-semibold tracking-wider text-[#A06A3B] uppercase">
                <span className="w-4 sm:w-5 h-0.5 bg-[#A06A3B]"></span>
                <span className="truncate">FAMILY MEDICINE &bull; PREVENTIVE CARE &bull; LONG-TERM HEALTH</span>
              </div>

              {/* Main Headline (Editorial Serif) */}
              <h1 className="font-serif font-bold text-[1.95rem] sm:text-4xl md:text-5xl lg:text-[3.35rem] leading-[1.18] sm:leading-[1.14] text-[#1C2A24] tracking-tight">
                Thoughtful Medical Care <br className="hidden sm:inline" />
                <span className="italic font-normal font-serif border-b-2 border-[#C88A58]/60 pb-0.5">for You</span> and Your Family
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm md:text-base text-[#57655E] max-w-xl leading-relaxed">
                Comprehensive consultation, diagnosis and ongoing care for common and chronic medical conditions with a focus on long-term health.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <button
                  onClick={() => scrollToBooking()}
                  className="bg-[#133026] hover:bg-[#1A3F32] text-white font-medium text-xs sm:text-sm px-5 py-3 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Icons.Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Book an Appointment</span>
                  <Icons.ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <a
                  href={`tel:${doctor.helplinePhone}`}
                  className="bg-white hover:bg-[#F5EFE7] border border-[#DCD5C9] text-[#1C2A24] font-medium text-xs sm:text-sm px-4 py-2.5 rounded-lg flex items-center justify-center gap-2.5 transition-all shadow-2xs"
                >
                  <Icons.Phone className="w-4 h-4 text-[#133026]" />
                  <div className="text-left leading-tight">
                    <span className="block text-[9px] text-[#6E7D75] uppercase font-semibold">Call Now</span>
                    <span className="font-bold text-xs sm:text-sm text-[#1C2A24]">{doctor.helplinePhone}</span>
                  </div>
                </a>
              </div>

              {/* 4 Feature Badges in a Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-4 border-t border-[#EAE3D6]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#E5EFEA] text-[#133026] flex items-center justify-center shrink-0">
                    <Icons.User className="w-4 h-4 text-[#133026]" />
                  </div>
                  <div>
                    <span className="block font-bold text-xs text-[#1C2A24] leading-tight">Personalised</span>
                    <span className="text-[10px] sm:text-[11px] text-[#6E7D75]">Consultation</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#E5EFEA] text-[#133026] flex items-center justify-center shrink-0">
                    <Icons.Users className="w-4 h-4 text-[#133026]" />
                  </div>
                  <div>
                    <span className="block font-bold text-xs text-[#1C2A24] leading-tight">All Age Groups</span>
                    <span className="text-[10px] sm:text-[11px] text-[#6E7D75]">Children to Elderly</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#E5EFEA] text-[#133026] flex items-center justify-center shrink-0">
                    <Icons.ShieldCheck className="w-4 h-4 text-[#133026]" />
                  </div>
                  <div>
                    <span className="block font-bold text-xs text-[#1C2A24] leading-tight">Preventive</span>
                    <span className="text-[10px] sm:text-[11px] text-[#6E7D75]">Health Focus</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#E5EFEA] text-[#133026] flex items-center justify-center shrink-0">
                    <Icons.Home className="w-4 h-4 text-[#133026]" />
                  </div>
                  <div>
                    <span className="block font-bold text-xs text-[#1C2A24] leading-tight">In-clinic &</span>
                    <span className="text-[10px] sm:text-[11px] text-[#6E7D75]">Home Visit</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Hero Doctor Photo with Clinic Setting & "Your Family Doctor" Script */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-[#E0D8CB] bg-white group">
                <img
                  src="/images/hero_doctor.jpg"
                  alt={`${doctor.name} - ${doctor.degree}`}
                  className="w-full h-auto object-cover block select-none"
                  loading="eager"
                />
                
                {/* Subtle soft gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>

                {/* Real-time Doctor Status Pill Overlay */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-full border border-slate-200/90 shadow-sm flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-semibold text-slate-800 text-[11px]">
                    {doctorStatus === 'in_cabin' ? 'Consulting In Chamber' : 'OPD Shift Active'}
                  </span>
                </div>

                {/* Handwritten Script Accent (Your Family Doctor) */}
                <div className="absolute bottom-3 right-4 font-script text-2xl sm:text-3xl text-slate-800 font-bold drop-shadow-xs rotate-[-3deg] pointer-events-none">
                  Your Family Doctor
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. REAL-TIME OPD QUEUE & TURN TRACKER STRIP                               */}
      {/* ========================================================================= */}
      <section className="bg-white border-y border-[#EAE3D6] py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#133026] uppercase tracking-wider text-[11px]">Live Queue:</span>
              <span className="text-[#3D4C44]">
                Serving Now: <strong className="font-mono text-sm text-[#133026] bg-[#E5EFEA] px-2 py-0.5 rounded font-bold">Token #{servingToken < 10 ? '0' + servingToken : servingToken}</strong>
              </span>
              <span className="text-[#84948B] hidden sm:inline">&bull;</span>
              <span className="text-[#57655E] hidden sm:inline">
                {waitingCount} {waitingCount === 1 ? 'patient' : 'patients'} waiting in chamber
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={() => {
                playHospitalChime();
                alert(`Chamber Status: Doctor is consulting. Current token is #${servingToken < 10 ? '0' + servingToken : servingToken}. Arrive on your scheduled shift.`);
              }}
              className="text-[#133026] hover:text-emerald-700 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Icons.Volume2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Chime Alert</span>
            </button>
            <button
              onClick={() => scrollToBooking()}
              className="bg-[#FAF7F2] hover:bg-[#F3EDE2] text-[#133026] border border-[#D5CDC2] px-3 py-1.5 rounded-md font-bold text-[11px] transition-all"
            >
              Get Next Token
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. "HOW WE CAN HELP" / OUR SERVICES SECTION                               */}
      {/* ========================================================================= */}
      <section className="py-14 sm:py-16 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#A06A3B] uppercase">
                <span className="w-5 h-0.5 bg-[#A06A3B]"></span>
                <span>OUR SERVICES</span>
              </div>
              <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#1C2A24] tracking-tight">
                <span className="border-b-2 border-[#C88A58]/60 pb-0.5">How We</span> Can Help
              </h2>
            </div>

            <div className="max-w-xl text-xs sm:text-sm text-[#57655E] leading-relaxed">
              We provide care for a wide range of medical conditions with a focus on preventive health, early diagnosis and long-term management.
            </div>

            <button
              onClick={() => setShowServicesModal(true)}
              className="text-xs font-bold text-[#133026] hover:text-[#265342] flex items-center gap-1.5 self-start md:self-end whitespace-nowrap transition-colors"
            >
              <span>View All Services</span>
              <Icons.ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4 Interactive Service Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: General Consultation */}
            <div
              onClick={() => scrollToBooking('clinic', 'General Consultation (Fever, Cough, Cold)')}
              className="bg-white hover:bg-[#FCFAF6] border border-[#EAE3D6] hover:border-[#133026]/40 rounded-xl p-5 transition-all shadow-2xs hover:shadow-sm cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#E5EFEA] text-[#133026] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icons.Stethoscope className="w-5 h-5 text-[#133026]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1C2A24] group-hover:text-[#133026] transition-colors">
                    General Consultation
                  </h3>
                  <p className="text-xs text-[#6E7D75] mt-1.5 leading-relaxed">
                    Fever, cough, cold, infections, stomach problems and more.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#F0EAE0] flex items-center justify-between text-xs font-semibold text-[#133026]">
                <span>Book Token</span>
                <span className="w-6 h-6 rounded-full bg-[#FAF7F2] flex items-center justify-center group-hover:bg-[#133026] group-hover:text-white transition-colors">
                  <Icons.ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            {/* Card 2: Chronic Disease Care */}
            <div
              onClick={() => scrollToBooking('clinic', 'Chronic Disease Care (Diabetes, BP, Thyroid)')}
              className="bg-white hover:bg-[#FCFAF6] border border-[#EAE3D6] hover:border-[#133026]/40 rounded-xl p-5 transition-all shadow-2xs hover:shadow-sm cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#E5EFEA] text-[#133026] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icons.Heart className="w-5 h-5 text-[#133026]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1C2A24] group-hover:text-[#133026] transition-colors">
                    Chronic Disease Care
                  </h3>
                  <p className="text-xs text-[#6E7D75] mt-1.5 leading-relaxed">
                    Diabetes, hypertension, thyroid and regular follow-up.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#F0EAE0] flex items-center justify-between text-xs font-semibold text-[#133026]">
                <span>Manage Chronic Care</span>
                <span className="w-6 h-6 rounded-full bg-[#FAF7F2] flex items-center justify-center group-hover:bg-[#133026] group-hover:text-white transition-colors">
                  <Icons.ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            {/* Card 3: Preventive Health Check */}
            <div
              onClick={() => scrollToBooking('clinic', 'Preventive Full Body Health Check')}
              className="bg-white hover:bg-[#FCFAF6] border border-[#EAE3D6] hover:border-[#133026]/40 rounded-xl p-5 transition-all shadow-2xs hover:shadow-sm cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#E5EFEA] text-[#133026] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icons.ShieldCheck className="w-5 h-5 text-[#133026]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1C2A24] group-hover:text-[#133026] transition-colors">
                    Preventive Health Check
                  </h3>
                  <p className="text-xs text-[#6E7D75] mt-1.5 leading-relaxed">
                    Routine check-ups, risk assessment and guidance.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#F0EAE0] flex items-center justify-between text-xs font-semibold text-[#133026]">
                <span>Plan Check-up</span>
                <span className="w-6 h-6 rounded-full bg-[#FAF7F2] flex items-center justify-center group-hover:bg-[#133026] group-hover:text-white transition-colors">
                  <Icons.ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            {/* Card 4: Home Visit (On Request) */}
            <div
              onClick={() => scrollToBooking('home', 'Elderly / Home Consultation Request')}
              className="bg-white hover:bg-[#FCFAF6] border border-[#EAE3D6] hover:border-[#133026]/40 rounded-xl p-5 transition-all shadow-2xs hover:shadow-sm cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#E5EFEA] text-[#133026] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icons.Home className="w-5 h-5 text-[#133026]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1C2A24] group-hover:text-[#133026] transition-colors">
                    Home Visit <span className="text-xs font-normal text-[#6E7D75]">(On Request)</span>
                  </h3>
                  <p className="text-xs text-[#6E7D75] mt-1.5 leading-relaxed">
                    Consultation at home for elderly and physically weak patients.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#F0EAE0] flex items-center justify-between text-xs font-semibold text-[#133026]">
                <span>Request Home Visit</span>
                <span className="w-6 h-6 rounded-full bg-[#FAF7F2] flex items-center justify-center group-hover:bg-[#133026] group-hover:text-white transition-colors">
                  <Icons.ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. CLINIC PRACTICE PILLARS STRIP (Verified Attributes Only)               */}
      {/* ========================================================================= */}
      <section className="bg-white border-y border-[#EAE3D6] py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 text-center sm:text-left">
          
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-full bg-[#FAF7F2] text-[#A06A3B] flex items-center justify-center shrink-0 border border-[#EAE3D6]">
              <Icons.ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="block font-bold text-sm sm:text-base text-[#1C2A24]">NMC Registered</span>
              <span className="text-xs text-[#6E7D75] font-mono">Reg. #{doctor.regNo}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-full bg-[#FAF7F2] text-[#A06A3B] flex items-center justify-center shrink-0 border border-[#EAE3D6]">
              <Icons.CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="block font-bold text-sm sm:text-base text-[#1C2A24]">7-Day Follow-Up</span>
              <span className="text-xs text-[#6E7D75]">Included With Every OPD</span>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-full bg-[#FAF7F2] text-[#A06A3B] flex items-center justify-center shrink-0 border border-[#EAE3D6]">
              <Icons.Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="block font-bold text-sm sm:text-base text-[#1C2A24]">Dual Shift OPD</span>
              <span className="text-xs text-[#6E7D75]">Morning & Evening Shifts</span>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-full bg-[#FAF7F2] text-[#A06A3B] flex items-center justify-center shrink-0 border border-[#EAE3D6]">
              <Icons.Users className="w-5 h-5" />
            </div>
            <div>
              <span className="block font-bold text-sm sm:text-base text-[#1C2A24]">All Age Groups</span>
              <span className="text-xs text-[#6E7D75]">Children to Elderly Care</span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. BOTTOM 3-COLUMN SECTION (About Doctor | Clinic Info | Appointment)    */}
      {/* ========================================================================= */}
      <section ref={appointmentSectionRef} className="py-14 sm:py-16 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* COLUMN 1: About the Doctor (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-[#EAE3D6] shadow-xs space-y-4">
              <h3 className="font-serif font-bold text-xl text-[#1C2A24]">
                About the Doctor
              </h3>

              <div className="flex items-start gap-4">
                <img
                  src="/images/about_doctor.jpg"
                  alt={doctor.name}
                  className="w-20 h-24 object-cover rounded-xl border border-[#EAE3D6] shrink-0"
                />
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-[#1C2A24] leading-tight">
                    {doctor.name}
                  </h4>
                  <p className="text-xs font-semibold text-[#57655E]">
                    {doctor.degree}
                  </p>
                  <p className="text-[11px] text-[#A06A3B] font-medium">
                    {doctor.almaMater} &bull; Reg. #{doctor.regNo}
                  </p>
                </div>
              </div>

              <p className="text-xs text-[#57655E] leading-relaxed">
                {doctor.name} is a General Physician with a focus on preventive care, early diagnosis and long-term management of common and chronic medical conditions. He is committed to providing evidence-based, patient-centered care for individuals and families.
              </p>

              <button
                onClick={() => setShowDoctorModal(true)}
                className="w-full py-2.5 px-4 rounded-lg border border-[#D5CDC2] hover:border-[#133026] text-[#133026] hover:bg-[#FAF7F2] font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <span>Know More About {doctor.name}</span>
                <Icons.ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* COLUMN 2: Clinic Information (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-[#EAE3D6] shadow-xs space-y-4">
              <h3 className="font-serif font-bold text-xl text-[#1C2A24]">
                Clinic Information
              </h3>

              {/* Clinic Storefront Photo */}
              <div className="rounded-xl overflow-hidden border border-[#EAE3D6]">
                <img
                  src="/images/clinic_exterior.jpg"
                  alt="Apex Family Clinic Exterior"
                  className="w-full h-32 object-cover block"
                />
              </div>

              {/* Address details */}
              <div className="flex items-start gap-3 text-xs">
                <div className="w-8 h-8 rounded-full bg-[#E5EFEA] text-[#133026] flex items-center justify-center shrink-0 mt-0.5">
                  <Icons.MapPin className="w-4 h-4 text-[#133026]" />
                </div>
                <div className="space-y-0.5">
                  <span className="font-bold text-[#1C2A24] block">Clinic Address</span>
                  <p className="text-[#57655E] leading-relaxed">
                    {doctor.address}, {doctor.city} - 110017
                  </p>
                  <a
                    href="https://maps.google.com/?q=Malviya+Nagar+New+Delhi"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#133026] hover:underline font-semibold text-[11px] inline-block mt-0.5"
                  >
                    (See on Map)
                  </a>
                </div>
              </div>

              {/* Timings */}
              <div className="flex items-start gap-3 text-xs border-t border-[#F0EAE0] pt-3">
                <div className="w-8 h-8 rounded-full bg-[#E5EFEA] text-[#133026] flex items-center justify-center shrink-0 mt-0.5">
                  <Icons.Clock className="w-4 h-4 text-[#133026]" />
                </div>
                <div className="space-y-0.5 w-full">
                  <span className="font-bold text-[#1C2A24] block">OPD Timings</span>
                  <div className="flex justify-between text-[#57655E]">
                    <span>Mon - Sat:</span>
                    <span className="font-medium text-[#1C2A24]">10:00 AM - 1:30 PM</span>
                  </div>
                  <div className="flex justify-between text-[#57655E]">
                    <span>Mon - Sat:</span>
                    <span className="font-medium text-[#1C2A24]">5:30 PM - 8:30 PM</span>
                  </div>
                  <div className="flex justify-between text-rose-600 font-semibold pt-0.5">
                    <span>Sunday:</span>
                    <span>Closed (Emergency on Call)</span>
                  </div>
                </div>
              </div>

            </div>

            {/* COLUMN 3: Book Your Appointment (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-[#EAE3D6] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-xl text-[#1C2A24]">
                  Book Your Appointment
                </h3>
                <span className="text-[11px] font-bold text-[#A06A3B] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#EAE3D6]">
                  {reviewMatch?.isEligible ? '₹0 Review' : doctor.consultationFee}
                </span>
              </div>

              {/* In-Clinic vs Home Visit Toggle */}
              <div className="grid grid-cols-2 p-1 bg-[#FAF7F2] rounded-xl border border-[#EAE3D6] text-xs font-bold gap-1">
                <button
                  type="button"
                  onClick={() => setVisitType('clinic')}
                  className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    visitType === 'clinic'
                      ? 'bg-[#133026] text-white shadow-xs'
                      : 'text-[#57655E] hover:text-[#133026]'
                  }`}
                >
                  <Icons.Stethoscope className="w-3.5 h-3.5" />
                  <span>In-Clinic Visit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVisitType('home')}
                  className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    visitType === 'home'
                      ? 'bg-[#133026] text-white shadow-xs'
                      : 'text-[#57655E] hover:text-[#133026]'
                  }`}
                >
                  <Icons.Home className="w-3.5 h-3.5" />
                  <span>Home Visit</span>
                </button>
              </div>

              {/* Booking Form */}
              <form onSubmit={handleBookingSubmit} className="space-y-3 text-xs">
                
                {/* Date & Shift Selectors */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#6E7D75] block">Date</label>
                    <div className="relative">
                      <select
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full bg-[#FAF7F2] border border-[#D5CDC2] rounded-lg py-2.5 px-2.5 pr-7 text-xs font-medium text-[#1C2A24] focus:outline-none focus:border-[#133026] appearance-none cursor-pointer"
                      >
                        <option value={todayStr}>Today ({new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })})</option>
                        <option value={tomorrowStr}>Tomorrow</option>
                      </select>
                      <Icons.ChevronDown className="w-3.5 h-3.5 text-[#6E7D75] absolute right-2.5 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#6E7D75] block">Time Window</label>
                    <div className="relative">
                      <select
                        value={selectedShift}
                        onChange={(e) => setSelectedShift(e.target.value)}
                        className="w-full bg-[#FAF7F2] border border-[#D5CDC2] rounded-lg py-2.5 px-2.5 pr-7 text-xs font-medium text-[#1C2A24] focus:outline-none focus:border-[#133026] appearance-none cursor-pointer"
                      >
                        <option value="Morning (10:00 AM - 01:30 PM)">Morning 10AM-1:30PM</option>
                        <option value="Evening (05:30 PM - 08:30 PM)">Evening 5:30PM-8:30PM</option>
                      </select>
                      <Icons.ChevronDown className="w-3.5 h-3.5 text-[#6E7D75] absolute right-2.5 top-3 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Patient Name */}
                <div className="relative">
                  <span className="absolute left-3 top-3 text-[#6E7D75]">
                    <Icons.User className="w-4 h-4" />
                  </span>
                  <input
                    ref={nameInputRef}
                    type="text"
                    required
                    placeholder="Patient Name"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#FAF7F2] border border-[#D5CDC2] rounded-lg text-xs font-medium text-[#1C2A24] focus:outline-none focus:border-[#133026] placeholder-[#8A968F]"
                  />
                </div>

                {/* Mobile Number */}
                <div className="relative">
                  <span className="absolute left-3 top-3 text-[#6E7D75]">
                    <Icons.Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="Mobile Number (10 digits)"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#FAF7F2] border border-[#D5CDC2] rounded-lg text-xs font-medium text-[#1C2A24] focus:outline-none focus:border-[#133026] placeholder-[#8A968F]"
                  />
                </div>

                {/* 7-Day Free Follow-up Notification */}
                {reviewMatch?.isEligible && (
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] flex items-center gap-1.5 font-medium">
                    <Icons.CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-700" />
                    <span>Eligible for 7-Day Free Follow-Up Review (Fee: ₹0)</span>
                  </div>
                )}

                {/* Additional Fields for Home Visit */}
                {visitType === 'home' && (
                  <div className="space-y-2 pt-1 border-t border-[#F0EAE0]">
                    <input
                      type="text"
                      placeholder="Home Address & Landmark"
                      value={homeAddress}
                      onChange={(e) => setHomeAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D5CDC2] rounded-lg text-xs font-medium text-[#1C2A24] focus:outline-none focus:border-[#133026]"
                    />
                    <p className="text-[10px] text-[#A06A3B] leading-tight">
                      * Home visits are confirmed after doctor review based on location in Malviya Nagar & South Delhi.
                    </p>
                  </div>
                )}

                {/* Submit CTA Button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-[#133026] hover:bg-[#1A3F32] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <span>Book Appointment</span>
                  <Icons.ArrowRight className="w-3.5 h-3.5" />
                </button>

                <p className="text-[10px] text-[#6E7D75] text-center pt-0.5">
                  Instant WhatsApp pass &bull; No upfront payment needed &bull; Pay at clinic
                </p>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. INSTITUTIONAL CLINIC FOOTER                                            */}
      {/* ========================================================================= */}
      <footer className="bg-[#133026] text-white/80 py-12 px-4 sm:px-8 border-t border-[#0C1E18]">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-white text-[#133026] flex items-center justify-center font-bold">
                <Icons.Cross className="w-4 h-4 text-[#133026]" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-white">Apex Family Clinic</h4>
                <p className="text-xs text-white/70">{doctor.name} | {doctor.degree} | NMC Reg. #{doctor.regNo}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium">
              <button onClick={() => setShowDoctorModal(true)} className="hover:text-white transition-colors">
                Physician Credentials
              </button>
              <span>&bull;</span>
              <button onClick={() => setShowServicesModal(true)} className="hover:text-white transition-colors">
                Clinical Services
              </button>
              <span>&bull;</span>
              <button onClick={onOpenTv} className="hover:text-white transition-colors">
                Waiting TV
              </button>
              <span>&bull;</span>
              <button onClick={onOpenStaff} className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
                Staff Terminal
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60">
            <p>&copy; {new Date().getFullYear()} {doctor.clinicName}. All rights reserved.</p>
            <p className="text-[11px]">
              Compliant with National Medical Commission (NMC) Practice Guidelines.
            </p>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 9. MODALS: CONFIRMED APPOINTMENT PASS / SLIP                             */}
      {/* ========================================================================= */}
      {bookingSuccess && confirmedPatient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4 animate-in fade-in zoom-in duration-200">
            
            <div className="w-14 h-14 rounded-full bg-[#E5EFEA] text-[#133026] flex items-center justify-center mx-auto">
              <Icons.CheckCircle2 className="w-8 h-8 text-[#133026]" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase font-bold text-[#A06A3B] tracking-wider block">
                APPOINTMENT CONFIRMED
              </span>
              <h3 className="font-serif font-bold text-2xl text-[#1C2A24]">
                OPD Token #{confirmedPatient.token < 10 ? '0' + confirmedPatient.token : confirmedPatient.token}
              </h3>
              <p className="text-xs text-[#57655E]">
                {confirmedPatient.name} &bull; {selectedShift.split('(')[0].trim()} &bull; {selectedDate}
              </p>
            </div>

            {/* Quick Details Box */}
            <div className="bg-[#FAF7F2] border border-[#EAE3D6] rounded-xl p-3 text-xs text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#6E7D75]">Doctor:</span>
                <span className="font-bold text-[#1C2A24]">{doctor.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E7D75]">Consultation Type:</span>
                <span className="font-semibold text-[#1C2A24]">{visitType === 'home' ? 'Home Visit' : 'In-Clinic Consultation'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E7D75]">Estimated Turn:</span>
                <span className="font-bold text-emerald-700">~15-20 Mins within shift</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E7D75]">Fee:</span>
                <span className="font-bold text-[#133026]">{confirmedPatient.consultationFee === 0 ? '₹0 (Free Review)' : doctor.consultationFee}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => setShowThermalModal(true)}
                className="w-full py-2.5 rounded-lg bg-[#133026] hover:bg-[#1A3F32] text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2"
              >
                <Icons.Printer className="w-3.5 h-3.5" />
                <span>Print Token Parchi (पर्ची)</span>
              </button>

              <button
                onClick={() => setShowOpdModal(true)}
                className="w-full py-2.5 rounded-lg bg-white border border-[#D5CDC2] hover:bg-[#FAF7F2] text-[#133026] font-semibold text-xs flex items-center justify-center gap-2"
              >
                <Icons.FileText className="w-3.5 h-3.5" />
                <span>View Doctor OPD Prescription Format</span>
              </button>

              <button
                onClick={() => {
                  setBookingSuccess(false);
                  setPatientName('');
                  setMobileNumber('');
                }}
                className="w-full py-2 text-xs text-[#6E7D75] hover:text-[#1C2A24] font-medium"
              >
                Close & Return to Website
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. MODAL: ABOUT DOCTOR EXTENDED CREDENTIALS                             */}
      {/* ========================================================================= */}
      {showDoctorModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-[#EAE3D6] pb-3">
              <div className="flex items-center gap-3">
                <img
                  src="/images/about_doctor.jpg"
                  alt={doctor.name}
                  className="w-14 h-16 object-cover rounded-lg border border-[#EAE3D6]"
                />
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#1C2A24]">{doctor.name}</h3>
                  <p className="text-xs text-[#57655E] font-medium">{doctor.degree} &bull; {doctor.almaMater}</p>
                  <p className="text-[11px] font-mono text-[#A06A3B]">NMC Reg. No: {doctor.regNo}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDoctorModal(false)}
                className="p-1 rounded-md text-[#6E7D75] hover:text-[#1C2A24]"
              >
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-[#57655E] space-y-3 leading-relaxed">
              <p>
                <strong>Clinical Philosophy:</strong> {doctor.name} believes in proactive family medicine, rational therapeutics, and continuous health tracking. Each patient receives personalized attention with full physical evaluation and detailed explanation of treatment goals.
              </p>
              <div className="bg-[#FAF7F2] p-3 rounded-lg border border-[#EAE3D6] space-y-1">
                <span className="font-bold text-[#1C2A24] block">Focus Areas:</span>
                <p>&bull; Comprehensive Internal Medicine & Outpatient Triage</p>
                <p>&bull; Chronic Diabetes, Hypertension & Dyslipidemia Management</p>
                <p>&bull; Seasonal Acute Fevers, Dengue, Malaria & Respiratory Illnesses</p>
                <p>&bull; Geriatric & Home Visit Care for Senior Citizens</p>
              </div>
              <p className="text-[11px] text-[#6E7D75]">
                Licensed practitioner authorized under the Delhi Medical Council and National Medical Commission (NMC).
              </p>
            </div>

            <button
              onClick={() => {
                setShowDoctorModal(false);
                scrollToBooking();
              }}
              className="w-full py-2.5 bg-[#133026] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm"
            >
              Book Consultation with {doctor.name}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 11. MODAL: VIEW ALL SERVICES                                             */}
      {/* ========================================================================= */}
      {showServicesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-3">
              <h3 className="font-serif font-bold text-xl text-[#1C2A24]">Outpatient Clinical Services</h3>
              <button onClick={() => setShowServicesModal(false)} className="text-[#6E7D75] hover:text-[#1C2A24]">
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#EAE3D6]">
                <h4 className="font-bold text-sm text-[#1C2A24]">1. In-Clinic General Physician Consultation</h4>
                <p className="text-[#57655E] mt-1">Diagnosis and evidence-based treatment for acute fevers, respiratory infections, GI distress, allergies, headaches, and general body weakness.</p>
              </div>

              <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#EAE3D6]">
                <h4 className="font-bold text-sm text-[#1C2A24]">2. Chronic Disease Care (Diabetes, BP, Thyroid)</h4>
                <p className="text-[#57655E] mt-1">Structured metabolic monitoring, titration of medications, lifestyle guidance, and periodic organ screening for long-term health.</p>
              </div>

              <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#EAE3D6]">
                <h4 className="font-bold text-sm text-[#1C2A24]">3. Preventive Health Check & Risk Assessment</h4>
                <p className="text-[#57655E] mt-1">Comprehensive vital triage (BP, SpO2, Blood Sugar, ECG assessment) and advice tailored to your age and family history.</p>
              </div>

              <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#EAE3D6]">
                <h4 className="font-bold text-sm text-[#1C2A24]">4. Home Visit Consultations for Elderly</h4>
                <p className="text-[#57655E] mt-1">Dedicated at-home physician consultation for bedridden patients, post-op recovery cases, and senior citizens across Malviya Nagar & South Delhi.</p>
              </div>

              <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#EAE3D6]">
                <h4 className="font-bold text-sm text-[#1C2A24]">5. 7-Day Follow-Up Review Guarantee</h4>
                <p className="text-[#57655E] mt-1">All initial consultations include a complimentary review within 7 days to assess medicine response and lab investigations.</p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowServicesModal(false);
                scrollToBooking();
              }}
              className="w-full py-2.5 bg-[#133026] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm"
            >
              Book Appointment Now
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 12. MODAL: CONDITIONS TREATED                                            */}
      {/* ========================================================================= */}
      {showConditionsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-3">
              <h3 className="font-serif font-bold text-xl text-[#1C2A24]">Conditions Treated</h3>
              <button onClick={() => setShowConditionsModal(false)} className="text-[#6E7D75] hover:text-[#1C2A24]">
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-[#57655E]">
              <span className="p-2 rounded bg-[#FAF7F2] border border-[#EAE3D6]">&bull; Viral Pyrexia & Dengue</span>
              <span className="p-2 rounded bg-[#FAF7F2] border border-[#EAE3D6]">&bull; Hypertension (High BP)</span>
              <span className="p-2 rounded bg-[#FAF7F2] border border-[#EAE3D6]">&bull; Type 2 Diabetes</span>
              <span className="p-2 rounded bg-[#FAF7F2] border border-[#EAE3D6]">&bull; Bronchitis & Cough</span>
              <span className="p-2 rounded bg-[#FAF7F2] border border-[#EAE3D6]">&bull; Gastritis & Acidity</span>
              <span className="p-2 rounded bg-[#FAF7F2] border border-[#EAE3D6]">&bull; Hypothyroidism</span>
              <span className="p-2 rounded bg-[#FAF7F2] border border-[#EAE3D6]">&bull; Seasonal Allergies</span>
              <span className="p-2 rounded bg-[#FAF7F2] border border-[#EAE3D6]">&bull; Joint Pain & Uric Acid</span>
            </div>

            <button
              onClick={() => {
                setShowConditionsModal(false);
                scrollToBooking();
              }}
              className="w-full py-2.5 bg-[#133026] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm"
            >
              Consult For These Conditions
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 13. MODAL: PATIENT VISIT GUIDE                                            */}
      {/* ========================================================================= */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-3">
              <h3 className="font-serif font-bold text-xl text-[#1C2A24]">Patient Visit Guide</h3>
              <button onClick={() => setShowGuideModal(false)} className="text-[#6E7D75] hover:text-[#1C2A24]">
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-[#57655E] space-y-2.5 leading-relaxed">
              <p><strong>1. Arrival Time:</strong> Please arrive 10 minutes prior to your shift window to have your baseline vitals (BP, SpO2, Temperature) recorded by our staff.</p>
              <p><strong>2. Previous Records:</strong> Bring previous prescriptions, lab investigation reports, and current medication strips.</p>
              <p><strong>3. Token Turn:</strong> Watch the waiting room TV or listen for the chime alert when your token is called.</p>
              <p><strong>4. 7-Day Follow-Up:</strong> If you need a review of tests ordered today, present your token slip within 7 days for a fee-free follow-up.</p>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 bg-[#133026] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Printable Thermal Token Slip Modal */}
      {showThermalModal && confirmedPatient && (
        <ThermalTokenModal
          patient={confirmedPatient}
          onClose={() => setShowThermalModal(false)}
        />
      )}

      {/* Printable Doctor OPD Prescription Modal */}
      {showOpdModal && confirmedPatient && (
        <OpdPrescriptionModal
          patient={confirmedPatient}
          onClose={() => setShowOpdModal(false)}
        />
      )}

    </div>
  );
}
