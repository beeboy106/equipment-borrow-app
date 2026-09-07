'use client';

import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HeroBanner() {
  const scrollToCatalog = () => {
    const el = document.getElementById('equipment-catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative mb-8 sm:mb-12 rounded-3xl overflow-hidden bg-[#faf8f5] border border-[#eee9df] shadow-sm transition-all duration-300">
      {/* Background Organic Line Doodles (Left & Right) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-70">
        {/* Left Doodle Curves */}
        <svg
          className="absolute -top-12 -left-12 w-[340px] sm:w-[480px] h-[340px] sm:h-[480px] text-slate-300/60"
          viewBox="0 0 300 300"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M 20 50 C 90 20, 160 110, 100 170 C 40 230, 200 240, 240 160 C 280 80, 180 20, 90 50" />
          <path d="M 50 180 C 120 150, 180 230, 130 280" strokeDasharray="4 4" />
        </svg>

        {/* Right Doodle Curves */}
        <svg
          className="absolute -bottom-16 -right-12 w-[340px] sm:w-[480px] h-[340px] sm:h-[480px] text-slate-300/60"
          viewBox="0 0 300 300"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M 280 250 C 210 280, 140 190, 200 130 C 260 70, 100 60, 60 140 C 20 220, 120 280, 210 250" />
          <path d="M 250 120 C 180 150, 120 70, 170 20" strokeDasharray="4 4" />
        </svg>
      </div>

      {/* Hero Header Section */}
      <div className="relative z-10 pt-8 sm:pt-14 px-4 sm:px-8 flex flex-col items-center text-center">
        {/* Top Tag */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#eff4ff] text-[#2563eb] text-[11px] sm:text-xs font-semibold mb-3 sm:mb-4 border border-[#dbeafe] shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ยืม-คืนอุปกรณ์ออนไลน์ งานบริการกลาง</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight sm:leading-tight mb-3 sm:mb-4 max-w-3xl">
          ยืม-คืนอุปกรณ์สำหรับจัดเลี้ยง{' '}
          <span className="relative inline-block whitespace-nowrap">
            <span>งานบริการกลาง</span>
            {/* Hand-drawn Underline Dribbble Manta style */}
            <svg
              className="absolute -bottom-2 sm:-bottom-3 left-0 w-full h-3 sm:h-4 text-[#2563eb]"
              viewBox="0 0 200 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <path
                d="M 3 9 C 50 3, 150 2, 197 7 C 140 12, 60 12, 12 11"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-base text-slate-600 font-normal leading-relaxed max-w-xl mb-6 sm:mb-8">
          สำหรับอาจารย์ นักศึกษา และบุคลากร ยืมอุปกรณ์ล่วงหน้าสะดวก พร้อมติดตามสถานะได้ทันที
        </p>

        {/* Call to Actions (Manta Button Style) */}
        <div className="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-10">
          <button
            onClick={scrollToCatalog}
            className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 transition-all duration-200"
          >
            เลือกดูอุปกรณ์
          </button>
          <Link
            href="/my-requests"
            className="inline-flex items-center gap-1.5 text-slate-800 hover:text-[#2563eb] font-bold text-xs sm:text-sm transition group"
          >
            <span className="underline underline-offset-4 decoration-slate-300 group-hover:decoration-blue-500">ติดตามคำขอของฉัน</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#2563eb]" />
          </Link>
        </div>
      </div>

      {/* Illustrative Collaborative Workspace Stage (Faithful Manta Vector Recreation) */}
      <div className="relative z-10 max-w-3xl mx-auto px-2 sm:px-6 pb-6 sm:pb-10 flex flex-col items-center select-none">
        <svg
          viewBox="0 0 760 480"
          className="w-full h-auto max-w-[680px] drop-shadow-sm"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Soft shadows */}
            <filter id="soft-shadow" x="-10%" y="-10%" width="125%" height="125%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.08" floodColor="#0f172a" />
            </filter>
            {/* Bottom Pedestal Gradient */}
            <linearGradient id="pedestal-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.2" />
              <stop offset="30%" stopColor="#93c5fd" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            {/* Left Frame Gradient */}
            <linearGradient id="left-frame-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e0e7ff" />
              <stop offset="100%" stopColor="#c7d2fe" />
            </linearGradient>
            {/* Right Frame Gradient */}
            <linearGradient id="right-frame-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
          </defs>

          {/* 1. BACKGROUND FLOATING SHAPES */}
          {/* Subtle hollow circle left */}
          <circle cx="170" cy="180" r="5" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
          <circle cx="172" cy="425" r="4.5" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
          {/* Subtle solid blue dot right */}
          <circle cx="590" cy="380" r="4" fill="#3b82f6" />
          <circle cx="495" cy="90" r="4.5" fill="#2563eb" />

          {/* 2. TOP CENTER CLOCK */}
          <g id="clock" transform="translate(325, 45)">
            <circle cx="30" cy="30" r="28" fill="#fef08a" stroke="#facc15" strokeWidth="2.5" />
            {/* Clock hands showing 3:00 */}
            <line x1="30" y1="30" x2="30" y2="15" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="30" y1="30" x2="43" y2="30" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="30" cy="30" r="2.5" fill="#78350f" />
          </g>

          {/* 3. LEFT PANEL: Person at Desk on Laptop (Booking Online) */}
          <g id="left-panel">
            {/* Lavender Frame Box */}
            <rect
              x="160"
              y="110"
              width="180"
              height="180"
              rx="12"
              fill="url(#left-frame-grad)"
              filter="url(#soft-shadow)"
            />

            {/* Man Illustration */}
            <g id="man-character">
              {/* Hair */}
              <path
                d="M 230 155 Q 230 135 250 135 Q 268 135 272 150 C 274 158 270 162 265 163 Z"
                fill="#1e293b"
              />
              {/* Face & Neck */}
              <path d="M 238 152 Q 238 178 252 178 Q 266 178 266 152 Z" fill="#fcd34d" />
              {/* Smile & Features */}
              <ellipse cx="258" cy="158" rx="1.5" ry="2" fill="#1e293b" />
              <path d="M 252 165 Q 256 170 262 166" stroke="#b45309" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              {/* Blue Shirt Body */}
              <path
                d="M 220 220 L 232 182 Q 252 186 272 182 L 285 220 Z"
                fill="#2563eb"
              />
              {/* Shirt Collar */}
              <polygon points="244,182 252,194 260,182" fill="#1d4ed8" />
              {/* Arms typing */}
              <path
                d="M 225 210 Q 245 218 265 212"
                stroke="#fcd34d"
                strokeWidth="10"
                strokeLinecap="round"
                fill="none"
              />
            </g>

            {/* Navy Laptop */}
            <g id="laptop" transform="translate(185, 205)">
              {/* Laptop Screen */}
              <polygon points="10,0 60,0 55,42 5,42" fill="#1e293b" />
              <polygon points="12,3 58,3 54,39 8,39" fill="#38bdf8" opacity="0.9" />
              {/* Laptop Base */}
              <path d="M 0 42 L 70 42 L 65 47 L -2 47 Z" fill="#475569" />
            </g>
          </g>

          {/* 4. LEFT FOREGROUND: Analytics Graph Card & Mail Envelope */}
          <g id="chart-card" transform="translate(145, 275)" filter="url(#soft-shadow)">
            {/* Card Base */}
            <rect x="0" y="0" width="130" height="90" rx="8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
            {/* Header placeholder bars */}
            <rect x="10" y="10" width="35" height="4" rx="2" fill="#94a3b8" />
            <rect x="10" y="17" width="22" height="3" rx="1.5" fill="#cbd5e1" />
            {/* Graph Axis */}
            <line x1="12" y1="75" x2="118" y2="75" stroke="#e2e8f0" strokeWidth="1.5" />
            {/* Trend Line (Upward) */}
            <polyline
              points="15,68 40,38 65,58 95,28 115,48"
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Graph Dots */}
            <circle cx="15" cy="68" r="3" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="40" cy="38" r="3" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="65" cy="58" r="3" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="95" cy="28" r="3" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="115" cy="48" r="3" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
          </g>

          {/* Floating Purple Mail Envelope (Instant Alerts) */}
          <g id="mail-envelope" transform="translate(225, 345)" filter="url(#soft-shadow)">
            <rect x="0" y="0" width="60" height="40" rx="4" fill="#6366f1" />
            <polygon points="0,0 30,22 60,0" fill="#818cf8" />
            <polygon points="0,40 25,18 0,18" fill="#4f46e5" opacity="0.6" />
            <polygon points="60,40 35,18 60,18" fill="#4f46e5" opacity="0.6" />
          </g>

          {/* 5. RIGHT PANEL: Person Relaxing on Mobile Checking Status */}
          <g id="right-panel">
            {/* Window Frame Box */}
            <rect
              x="450"
              y="120"
              width="180"
              height="170"
              rx="12"
              fill="url(#right-frame-grad)"
              filter="url(#soft-shadow)"
            />
            {/* Window panes */}
            <line x1="450" y1="175" x2="505" y2="175" stroke="#d97706" strokeWidth="2.5" />
            <line x1="505" y1="120" x2="505" y2="200" stroke="#d97706" strokeWidth="2.5" />

            {/* Woman on bed/couch with phone */}
            <g id="woman-relaxing">
              {/* Body in Warm Yellow Sweater */}
              <path
                d="M 470 240 Q 515 200 580 230 L 610 260 L 460 260 Z"
                fill="#f59e0b"
              />
              {/* Hair */}
              <path
                d="M 525 155 Q 545 130 575 145 C 595 155 595 190 575 195 Q 555 198 540 185 Z"
                fill="#0f172a"
              />
              {/* Face */}
              <path d="M 545 160 Q 562 165 565 178 Q 555 190 545 180 Z" fill="#fed7aa" />
              {/* Arm reaching for phone */}
              <path
                d="M 545 225 Q 575 240 595 210"
                stroke="#fed7aa"
                strokeWidth="9"
                strokeLinecap="round"
                fill="none"
              />
              {/* Smartphone */}
              <polygon points="590,195 605,190 615,225 600,230" fill="#3b82f6" />
              <polygon points="592,197 603,193 612,223 601,227" fill="#ffffff" />

              {/* Green Approved Checkmark Speech Bubble */}
              <g transform="translate(595, 160)">
                <circle cx="12" cy="12" r="13" fill="#ffffff" filter="url(#soft-shadow)" />
                <circle cx="12" cy="12" r="10" fill="#10b981" />
                <path d="M 8 12 L 11 15 L 16 9" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>
            </g>
          </g>

          {/* 6. RIGHT FOREGROUND: Calendar Widget with Memo */}
          <g id="calendar-card" transform="translate(505, 290)" filter="url(#soft-shadow)">
            {/* Calendar Main Sheet */}
            <rect x="0" y="0" width="70" height="75" rx="6" fill="#fef08a" stroke="#fde047" strokeWidth="1.5" />
            {/* Header with binding rings */}
            <rect x="0" y="0" width="70" height="18" rx="6" fill="#f59e0b" />
            <circle cx="18" cy="8" r="2.5" fill="#ffffff" />
            <circle cx="35" cy="8" r="2.5" fill="#ffffff" />
            <circle cx="52" cy="8" r="2.5" fill="#ffffff" />
            {/* Calendar Date Blocks */}
            <rect x="8" y="26" width="10" height="8" rx="2" fill="#ca8a04" opacity="0.7" />
            <rect x="23" y="26" width="10" height="8" rx="2" fill="#ca8a04" opacity="0.7" />
            <rect x="38" y="26" width="10" height="8" rx="2" fill="#ca8a04" opacity="0.7" />
            <rect x="53" y="26" width="10" height="8" rx="2" fill="#ca8a04" opacity="0.7" />
            <rect x="8" y="40" width="10" height="8" rx="2" fill="#ca8a04" opacity="0.7" />
            <rect x="23" y="40" width="10" height="8" rx="2" fill="#10b981" />
            <rect x="38" y="40" width="10" height="8" rx="2" fill="#ca8a04" opacity="0.7" />
            <rect x="53" y="40" width="10" height="8" rx="2" fill="#ca8a04" opacity="0.7" />
            {/* Hanging Yellow Note */}
            <path d="M 40 68 L 65 68 L 65 92 L 40 92 Z" fill="#fef9c3" stroke="#fde047" strokeWidth="1" />
            <line x1="45" y1="75" x2="60" y2="75" stroke="#ca8a04" strokeWidth="1.5" />
            <line x1="45" y1="82" x2="57" y2="82" stroke="#ca8a04" strokeWidth="1.5" />
          </g>

          {/* 7. CENTER HERO: Main Coordinator (Service Lead in Blue Blazer) */}
          <g id="main-coordinator" filter="url(#soft-shadow)">
            {/* Hair Back */}
            <path
              d="M 345 180 Q 330 250 370 270 Q 430 270 415 180 Z"
              fill="#1e293b"
            />

            {/* Neck */}
            <rect x="375" y="195" width="16" height="20" rx="2" fill="#fcd34d" />

            {/* Head / Face */}
            <path
              d="M 362 145 Q 355 185 383 185 Q 411 185 404 145 Q 383 135 362 145 Z"
              fill="#fed7aa"
            />
            {/* Hair Front Bangs */}
            <path
              d="M 358 150 Q 380 130 408 145 Q 405 160 398 155 Q 385 145 368 155 Z"
              fill="#1e293b"
            />

            {/* Facial Features */}
            {/* Eyebrows & Eyes */}
            <path d="M 368 152 Q 373 150 378 152" stroke="#0f172a" strokeWidth="1.5" fill="none" />
            <path d="M 388 152 Q 393 150 398 152" stroke="#0f172a" strokeWidth="1.5" fill="none" />
            <circle cx="373" cy="157" r="1.8" fill="#0f172a" />
            <circle cx="393" cy="157" r="1.8" fill="#0f172a" />
            {/* Soft Blushes */}
            <circle cx="367" cy="164" r="3" fill="#f43f5e" opacity="0.3" />
            <circle cx="399" cy="164" r="3" fill="#f43f5e" opacity="0.3" />
            {/* Smile */}
            <path d="M 377 167 Q 383 174 389 167" stroke="#b45309" strokeWidth="1.5" fill="none" strokeLinecap="round" />

            {/* Light Cyan Blouse Inner */}
            <polygon points="372,210 383,235 394,210" fill="#93c5fd" />

            {/* Tailored Royal Blue Blazer Jacket */}
            {/* Left Jacket Body */}
            <path
              d="M 370 210 L 330 360 L 375 360 L 383 235 Z"
              fill="#2563eb"
            />
            {/* Right Jacket Body */}
            <path
              d="M 396 210 L 436 360 L 391 360 L 383 235 Z"
              fill="#1d4ed8"
            />
            {/* Blazer Lapels */}
            <polygon points="368,210 383,260 376,260 360,218" fill="#1e40af" />
            <polygon points="398,210 383,260 390,260 406,218" fill="#1e40af" />

            {/* Dark Trousers / Skirt Bottom */}
            <rect x="340" y="360" width="86" height="70" fill="#0f172a" />

            {/* RIGHT ARM & COFFEE CUP */}
            {/* Arm holding coffee cup */}
            <path
              d="M 345 225 Q 320 280 338 315"
              stroke="#2563eb"
              strokeWidth="20"
              strokeLinecap="round"
              fill="none"
            />
            {/* Hand */}
            <circle cx="338" cy="315" r="7" fill="#fed7aa" />
            {/* Coffee Cup */}
            <g id="coffee-cup" transform="translate(325, 290)">
              {/* Steam waves */}
              <path d="M 12 -4 Q 8 -10 12 -16" stroke="#94a3b8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M 17 -2 Q 21 -8 17 -14" stroke="#94a3b8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              {/* Cup lid */}
              <rect x="2" y="0" width="24" height="4" rx="2" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
              {/* Cup body */}
              <polygon points="4,4 24,4 21,28 7,28" fill="#f97316" />
              {/* Cup sleeve */}
              <polygon points="5,10 23,10 21,20 7,20" fill="#fef08a" />
            </g>

            {/* LEFT ARM & MODERN PURPLE TABLET */}
            {/* Arm reaching across holding tablet */}
            <path
              d="M 420 225 Q 445 295 405 325"
              stroke="#1d4ed8"
              strokeWidth="20"
              strokeLinecap="round"
              fill="none"
            />
            {/* Hand fingers over tablet */}
            <circle cx="475" cy="315" r="6" fill="#fed7aa" />

            {/* Purple / Violet Tablet */}
            <g id="tablet" transform="translate(400, 280) rotate(-6)">
              {/* White Pages peek behind */}
              <rect x="2" y="-10" width="75" height="60" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
              <line x1="12" y1="-2" x2="60" y2="-2" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="12" y1="4" x2="45" y2="4" stroke="#cbd5e1" strokeWidth="1.5" />
              {/* Purple Tablet Screen */}
              <rect x="0" y="0" width="85" height="70" rx="8" fill="#7c3aed" stroke="#6d28d9" strokeWidth="1.5" />
              {/* Camera dot & sensor */}
              <circle cx="42" cy="6" r="2" fill="#4c1d95" />
              <circle cx="43" cy="35" r="7" fill="#8b5cf6" />
            </g>
          </g>

          {/* 8. BOTTOM RIGHT: Potted Flower Plant (Decorative Manta Accent) */}
          <g id="potted-plant" transform="translate(500, 370)">
            {/* 5-Petal Flower */}
            <g transform="translate(25, -15)">
              <circle cx="0" cy="-7" r="5" fill="#f472b6" />
              <circle cx="-7" cy="0" r="5" fill="#f472b6" />
              <circle cx="7" cy="0" r="5" fill="#f472b6" />
              <circle cx="-4" cy="7" r="5" fill="#f472b6" />
              <circle cx="4" cy="7" r="5" fill="#f472b6" />
              <circle cx="0" cy="0" r="4.5" fill="#facc15" />
            </g>
            {/* Green Stem */}
            <path d="M 25 -8 L 25 25" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
            {/* Green Leaves */}
            <path d="M 25 10 Q 10 5 12 18 Q 22 15 25 12" fill="#22c55e" />
            <path d="M 25 6 Q 40 2 38 15 Q 28 12 25 8" fill="#22c55e" />
            {/* Terracotta Plant Pot */}
            <polygon points="12,25 38,25 34,48 16,48" fill="#9a3412" />
            <rect x="10" y="23" width="30" height="5" rx="2" fill="#b45309" />
          </g>

          {/* 9. BOTTOM BASE PEDESTAL LINE */}
          <g id="base-pedestal">
            {/* Soft shadow below stand */}
            <ellipse cx="380" cy="438" rx="240" ry="6" fill="#0f172a" opacity="0.06" />
            {/* Modern Slim Gradient Pedestal */}
            <rect x="180" y="432" width="400" height="5" rx="2.5" fill="url(#pedestal-grad)" />
          </g>
        </svg>
      </div>
    </div>
  );
}

