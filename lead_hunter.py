#!/usr/bin/env python3
"""
Salon Lead Hunter & Automated Pitch Generator
Runs locally on your Mac without any API keys or paid tools.
"""

import sys
import json
import urllib.parse

def generate_pitch(salon_name, city, phone, demo_url="https://elixir-luxe-salon.vercel.app"):
    clean_phone = "".join(filter(str.isdigit, phone))
    if not clean_phone.startswith("91") and len(clean_phone) == 10:
        clean_phone = "91" + clean_phone

    message = f"""Namaste Team {salon_name} ✨

Humne aapka salon dekha ({city})—aapka work and client reviews bohot impressive hain!

Aapke salon ke luxury clients ke liye humne ek exclusive *Luxury Web Presence & 1-Click WhatsApp Booking Engine* design kiya hai:

🔗 *Live Demo:* {demo_url}

*Key Features for your Salon:*
• Complete Treatment Menu with Prices & Curated Categories
• Direct WhatsApp Appointment Booking (Zero missed calls/bookings)
• Ultra-Luxury Dark Gold Aesthetic on Mobile

Agar aapko ye concept pasand aaye, toh hum ise *₹2,999* me aapke salon ke name, photos, prices aur WhatsApp number ke sath 24 ghante me live deliver kar denge.

— *Aura Luxe Studios (Digital Partner)*"""

    encoded_msg = urllib.parse.quote(message)
    whatsapp_url = f"https://wa.me/{clean_phone}?text={encoded_msg}"
    return whatsapp_url, message

def main():
    print("=" * 60)
    print("💎 SALON LEAD RADAR & ZERO-HESITATION PITCH GENERATOR 💎")
    print("=" * 60)

    demo_url = input("Enter your Demo URL [Default: https://elixir-luxe-salon.vercel.app]: ").strip()
    if not demo_url:
        demo_url = "https://elixir-luxe-salon.vercel.app"

    print("\n[+] Enter Salon Details (Found on Google Maps without website):")
    salon_name = input("Salon Name (e.g. Royal Crown Salon): ").strip()
    city = input("City / Area (e.g. Malviya Nagar, Jaipur): ").strip()
    phone = input("WhatsApp / Phone Number (10 digits): ").strip()

    if not salon_name or not phone:
        print("[-] Salon name and phone are required!")
        sys.exit(1)

    wa_link, raw_msg = generate_pitch(salon_name, city, phone, demo_url)

    print("\n" + "-" * 60)
    print("🚀 1-CLICK WHATSAPP OUTREACH LINK GENERATED:")
    print("-" * 60)
    print(wa_link)
    print("-" * 60)
    print("\n👉 Tip: Simply copy-paste the link above into your browser or click it.")
    print("It will automatically open WhatsApp with the personalized pitch ready to send!")
    print("You don't need to type a single word or talk to anyone on call.\n")

if __name__ == "__main__":
    main()
