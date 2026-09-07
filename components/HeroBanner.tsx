'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

export default function HeroBanner() {
  return (
    <div className="relative mb-6 sm:mb-10 rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-[#0b0f2c] to-[#050716] border border-indigo-500/20 shadow-2xl shadow-indigo-950/60 transition-all duration-300">
      {/* Ambient Lighting & Glow Orbs */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 translate-y-12 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/3 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Cyber Grid Texture with Radial Fade */}
      <div
        className="absolute inset-0 opacity-[0.12] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255, 255, 255, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse at 70% 50%, black 20%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 70% 50%, black 20%, transparent 85%)',
        }}
      />

      {/* Content Grid: Left Text + Right 3D Visual */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center p-6 sm:p-10 md:p-12">
        {/* Left Column: Typography & Badge */}
        <div className="lg:col-span-7 flex flex-col items-start justify-center">
          {/* Apple-style Frosted Glass Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.12] backdrop-blur-md border border-white/15 text-white/95 text-[11px] sm:text-xs font-semibold mb-3 sm:mb-4 shadow-inner transition-colors duration-200">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400" />
            </span>
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>ยืม-คืนอุปกรณ์ออนไลน์</span>
          </div>

          {/* Clean & Luxury Headline */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-extrabold text-white tracking-tight leading-[1.25] mb-2.5 sm:mb-3">
            ยืม-คืนอุปกรณ์สำหรับจัดเลี้ยง <br className="hidden sm:inline" />
            <span className="text-white/90">งานบริการกลาง</span>
          </h1>

          {/* Subtitle Description */}
          <p className="text-xs sm:text-sm md:text-base text-slate-300/80 font-normal leading-relaxed max-w-xl">
            สำหรับอาจารย์ นักศึกษา และบุคลากร ยืมอุปกรณ์ล่วงหน้าสะดวก พร้อมติดตามสถานะได้ทันที
          </p>
        </div>

        {/* Right Column: 3D Glassmorphism Graphic Centerpiece */}
        <div className="lg:col-span-5 flex items-center justify-center lg:justify-end relative select-none">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            {/* Ambient Background Aura behind 3D Object */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-violet-500/20 to-cyan-400/20 rounded-full blur-2xl animate-shimmer" />

            {/* Floating 3D Isometric Glass Cube with Orbiting Ring */}
            <div className="relative z-10 w-full h-full flex items-center justify-center animate-float">
              <svg
                viewBox="0 0 240 240"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-[0_20px_35px_rgba(79,70,229,0.35)]"
              >
                <defs>
                  {/* Glass Shading Gradients */}
                  <linearGradient id="glassTop" x1="120" y1="45" x2="120" y2="105" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0.15" />
                  </linearGradient>

                  <linearGradient id="glassLeft" x1="60" y1="75" x2="120" y2="175" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.55" />
                  </linearGradient>

                  <linearGradient id="glassRight" x1="120" y1="105" x2="180" y2="175" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#312e81" stopOpacity="0.6" />
                  </linearGradient>

                  <linearGradient id="glowBorder" x1="60" y1="45" x2="180" y2="175" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#c7d2fe" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0.1" />
                  </linearGradient>

                  <linearGradient id="orbitGradient" x1="40" y1="120" x2="200" y2="120" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#818cf8" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#c084fc" stopOpacity="0.8" />
                  </linearGradient>

                  {/* Specular Edge Highlights */}
                  <linearGradient id="specularGlint" x1="60" y1="75" x2="120" y2="105" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
                  </linearGradient>
                </defs>

                {/* Back Orbit Ring (behind cube) */}
                <path
                  d="M 40 120 C 40 90, 200 90, 200 120"
                  stroke="url(#orbitGradient)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  strokeOpacity="0.5"
                />

                {/* Internal Luminous Energy Core */}
                <circle cx="120" cy="115" r="22" fill="#818cf8" fillOpacity="0.35" filter="blur(10px)" />
                <circle cx="120" cy="115" r="12" fill="#c7d2fe" fillOpacity="0.8" filter="blur(4px)" />

                {/* Left Glass Facet */}
                <polygon
                  points="60,75 120,105 120,175 60,145"
                  fill="url(#glassLeft)"
                  stroke="url(#glowBorder)"
                  strokeWidth="1.2"
                  strokeOpacity="0.7"
                />

                {/* Right Glass Facet */}
                <polygon
                  points="120,105 180,75 180,145 120,175"
                  fill="url(#glassRight)"
                  stroke="url(#glowBorder)"
                  strokeWidth="1.2"
                  strokeOpacity="0.6"
                />

                {/* Top Glass Facet (Glossy Specular) */}
                <polygon
                  points="120,45 180,75 120,105 60,75"
                  fill="url(#glassTop)"
                  stroke="url(#glowBorder)"
                  strokeWidth="1.2"
                  strokeOpacity="0.85"
                />

                {/* Inner Geometric Equipment Divider / Shelf Grid */}
                <line x1="60" y1="110" x2="120" y2="140" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.3" />
                <line x1="120" y1="140" x2="180" y2="110" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.3" />
                <line x1="120" y1="75" x2="120" y2="140" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="3 3" />

                {/* Front Orbit Ring (overlapping front with circulation arrow) */}
                <path
                  d="M 200 120 C 200 155, 40 155, 40 120"
                  stroke="url(#orbitGradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Return Circulation Orbit Nodes */}
                <circle cx="178" cy="138" r="4.5" fill="#38bdf8" />
                <circle cx="178" cy="138" r="8" fill="#38bdf8" fillOpacity="0.35" />
                <circle cx="62" cy="135" r="3.5" fill="#c084fc" />

                {/* Specular Highlight Streak on Top Edge */}
                <line x1="60" y1="75" x2="120" y2="105" stroke="url(#specularGlint)" strokeWidth="2" strokeLinecap="round" />
                <circle cx="120" cy="45" r="2.5" fill="#ffffff" />
                <circle cx="60" cy="75" r="2" fill="#ffffff" fillOpacity="0.8" />
                <circle cx="180" cy="75" r="2" fill="#ffffff" fillOpacity="0.8" />
              </svg>
            </div>

            {/* Decorative Floating Crystal Shards / Floating Badge */}
            <div className="absolute top-4 right-4 animate-float-delayed pointer-events-none">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center">
                <span className="text-sm">📦</span>
              </div>
            </div>

            <div className="absolute bottom-6 left-2 animate-float pointer-events-none">
              <div className="px-2.5 py-1 rounded-lg bg-indigo-950/60 backdrop-blur-md border border-indigo-400/25 shadow-lg flex items-center gap-1 text-[10px] text-indigo-200 font-medium">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>ระบบพร้อมใช้</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
