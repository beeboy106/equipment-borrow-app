'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Sparkles, Clock, ShieldCheck, CheckCircle2, RotateCcw, Box } from 'lucide-react';

export default function HeroBanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glint, setGlint] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Dynamic 3D tilt angles (-14 to +14 deg)
    const rotateY = ((x - centerX) / centerX) * 14;
    const rotateX = -((y - centerY) / centerY) * 14;

    const glintX = (x / rect.width) * 100;
    const glintY = (y / rect.height) * 100;

    setRotate({ x: rotateX, y: rotateY });
    setGlint({ x: glintX, y: glintY });
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
    setGlint({ x: 50, y: 50 });
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative mb-6 sm:mb-10 rounded-3xl overflow-hidden bg-gradient-to-br from-[#060818] via-[#0c1033] to-[#07091f] border border-indigo-500/25 shadow-[0_25px_60px_-15px_rgba(15,18,50,0.8)] transition-all duration-300"
      style={{ perspective: 1200 }}
    >
      {/* Dynamic Specular Glint Reflection following Mouse */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          opacity: isHovered ? 0.35 : 0.15,
          background: `radial-gradient(circle 500px at ${glint.x}% ${glint.y}%, rgba(129, 140, 248, 0.4), transparent 70%)`,
        }}
      />

      {/* Ambient Atmospheric Light Orbs */}
      <div className="absolute -top-20 -right-20 w-[420px] h-[420px] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 left-1/4 w-[360px] h-[360px] bg-violet-600/15 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/3 -translate-y-1/2 w-[280px] h-[280px] bg-cyan-400/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Modern Perspective Grid Texture */}
      <div
        className="absolute inset-0 opacity-[0.14] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255, 255, 255, 0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.18) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          maskImage: 'radial-gradient(ellipse at 65% 50%, black 25%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 65% 50%, black 25%, transparent 85%)',
        }}
      />

      {/* Content Layout */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center p-6 sm:p-10 md:p-12">
        {/* Left Column: Typography & Badges */}
        <div className="lg:col-span-7 flex flex-col items-start justify-center">
          {/* Apple-style Frosted Glass Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.12] backdrop-blur-md border border-white/15 text-white/95 text-[11px] sm:text-xs font-semibold mb-3 sm:mb-4 shadow-inner transition-colors duration-200">
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
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
              งานบริการกลาง
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm md:text-base text-slate-300/85 font-normal leading-relaxed max-w-xl mb-5 sm:mb-6">
            สำหรับอาจารย์ นักศึกษา และบุคลากร ยืมอุปกรณ์ล่วงหน้าสะดวก พร้อมติดตามสถานะได้ทันที
          </p>

          {/* Responsive Feature Pills (Spline Style) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] backdrop-blur-md border border-white/10 text-white/90 text-xs font-medium hover:bg-white/[0.1] transition">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>ยืมล่วงหน้า 24 ชม.</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] backdrop-blur-md border border-white/10 text-white/90 text-xs font-medium hover:bg-white/[0.1] transition">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>อนุมัติผ่านระบบ</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] backdrop-blur-md border border-white/10 text-white/90 text-xs font-medium hover:bg-white/[0.1] transition">
              <Box className="w-3.5 h-3.5 text-cyan-400" />
              <span>สต็อกคงเหลือ Real-time</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive 3D Spline-Inspired Stage */}
        <div className="lg:col-span-5 flex items-center justify-center relative select-none min-h-[260px] sm:min-h-[300px]">
          {/* 3D Transform Container that tilts with Cursor */}
          <div
            className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center transition-transform duration-200 ease-out"
            style={{
              transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Ambient Backlight Glow underneath the 3D scene */}
            <div
              className="absolute inset-0 bg-gradient-to-tr from-indigo-500/25 via-violet-500/25 to-cyan-400/25 rounded-full blur-2xl animate-shimmer"
              style={{ transform: 'translateZ(-40px)' }}
            />

            {/* Floating 3D Isometric Centerpiece */}
            <div
              className="relative z-10 w-full h-full flex items-center justify-center animate-float"
              style={{ transform: 'translateZ(20px)' }}
            >
              <svg
                viewBox="0 0 260 260"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-[0_25px_45px_rgba(99,102,241,0.4)]"
              >
                <defs>
                  {/* Glass Shading & Materials */}
                  <linearGradient id="mainGlassTop" x1="130" y1="50" x2="130" y2="115" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
                    <stop offset="50%" stopColor="#a5b4fc" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
                  </linearGradient>

                  <linearGradient id="mainGlassLeft" x1="65" y1="85" x2="130" y2="190" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity="0.35" />
                    <stop offset="50%" stopColor="#4f46e5" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.75" />
                  </linearGradient>

                  <linearGradient id="mainGlassRight" x1="130" y1="115" x2="195" y2="190" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#c084fc" stopOpacity="0.4" />
                    <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#312e81" stopOpacity="0.8" />
                  </linearGradient>

                  <linearGradient id="crystalBorder" x1="65" y1="50" x2="195" y2="190" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                    <stop offset="40%" stopColor="#c7d2fe" stopOpacity="0.6" />
                    <stop offset="80%" stopColor="#818cf8" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.7" />
                  </linearGradient>

                  <linearGradient id="orbitCirculation" x1="30" y1="130" x2="230" y2="130" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#818cf8" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#c084fc" stopOpacity="0.9" />
                  </linearGradient>

                  <linearGradient id="specularGlintTop" x1="65" y1="85" x2="130" y2="115" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
                  </linearGradient>
                </defs>

                {/* Orbit Trajectory Ring (Back Arc) */}
                <ellipse
                  cx="130"
                  cy="135"
                  rx="95"
                  ry="36"
                  stroke="url(#orbitCirculation)"
                  strokeWidth="1.5"
                  strokeDasharray="5 5"
                  strokeOpacity="0.4"
                  transform="rotate(-15 130 135)"
                />

                {/* Glowing Energy Core inside the Glass Box */}
                <circle cx="130" cy="125" r="26" fill="#818cf8" fillOpacity="0.45" filter="blur(14px)" />
                <circle cx="130" cy="125" r="14" fill="#38bdf8" fillOpacity="0.7" filter="blur(6px)" />
                <circle cx="130" cy="125" r="5" fill="#ffffff" />

                {/* Left Glass Facet */}
                <polygon
                  points="65,85 130,118 130,195 65,162"
                  fill="url(#mainGlassLeft)"
                  stroke="url(#crystalBorder)"
                  strokeWidth="1.5"
                  strokeOpacity="0.8"
                />

                {/* Right Glass Facet */}
                <polygon
                  points="130,118 195,85 195,162 130,195"
                  fill="url(#mainGlassRight)"
                  stroke="url(#crystalBorder)"
                  strokeWidth="1.5"
                  strokeOpacity="0.7"
                />

                {/* Top Glass Facet (Glossy Reflection) */}
                <polygon
                  points="130,52 195,85 130,118 65,85"
                  fill="url(#mainGlassTop)"
                  stroke="url(#crystalBorder)"
                  strokeWidth="1.5"
                  strokeOpacity="0.9"
                />

                {/* Internal Shelf Grid Lines inside Vault */}
                <line x1="65" y1="124" x2="130" y2="157" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.3" />
                <line x1="130" y1="157" x2="195" y2="124" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.3" />
                <line x1="130" y1="85" x2="130" y2="157" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="3 3" />

                {/* Orbit Trajectory Ring (Front Arc) */}
                <path
                  d="M 40 148 C 65 178, 195 170, 220 120"
                  stroke="url(#orbitCirculation)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Orbiting Satellite Particle Nodes */}
                <circle cx="218" cy="122" r="5" fill="#38bdf8" />
                <circle cx="218" cy="122" r="9" fill="#38bdf8" fillOpacity="0.3" />

                <circle cx="44" cy="150" r="4" fill="#c084fc" />
                <circle cx="44" cy="150" r="7" fill="#c084fc" fillOpacity="0.3" />

                {/* Specular Highlight on Leading Edge */}
                <line x1="65" y1="85" x2="130" y2="118" stroke="url(#specularGlintTop)" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="130" cy="52" r="3" fill="#ffffff" />
                <circle cx="65" cy="85" r="2.5" fill="#ffffff" fillOpacity="0.9" />
                <circle cx="195" cy="85" r="2.5" fill="#ffffff" fillOpacity="0.9" />
              </svg>
            </div>

            {/* Floating 3D Frosted Glass Card 1 (Top Right - Parallax Z: 55px) */}
            <div
              className="absolute -top-1 -right-2 sm:right-0 animate-float-delayed pointer-events-none"
              style={{
                transform: 'translateZ(55px) rotateZ(3deg)',
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="px-3 py-2 rounded-2xl bg-white/[0.12] hover:bg-white/[0.18] backdrop-blur-xl border border-white/25 shadow-[0_15px_30px_rgba(0,0,0,0.35)] flex items-center gap-2 text-white">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/25 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-300 font-medium leading-none">สถานะคลัง</div>
                  <div className="text-xs font-bold text-white leading-tight">พร้อมยืมทันที</div>
                </div>
              </div>
            </div>

            {/* Floating 3D Frosted Glass Card 2 (Bottom Left - Parallax Z: 45px) */}
            <div
              className="absolute -bottom-2 -left-3 sm:left-0 animate-float pointer-events-none"
              style={{
                transform: 'translateZ(45px) rotateZ(-3deg)',
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="px-3 py-2 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-indigo-400/30 shadow-[0_15px_30px_rgba(0,0,0,0.4)] flex items-center gap-2 text-white">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/25 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                  <RotateCcw className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] text-indigo-200 font-medium leading-none">ระบบบริการ</div>
                  <div className="text-xs font-bold text-white leading-tight">ยืม-คืนสะดวกรวดเร็ว</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
