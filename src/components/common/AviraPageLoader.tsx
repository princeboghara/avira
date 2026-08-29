"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AviraPageLoader() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(25);

  useEffect(() => {
    // Reset and trigger smooth fast animation on initial mount and route changes
    setIsVisible(true);
    setIsFadingOut(false);
    setProgress(30);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 35;
      });
    }, 40);

    // Fast completion in ~360ms
    const completeTimer = setTimeout(() => {
      setProgress(100);
      setIsFadingOut(true);

      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 280); // Smooth fade-out duration

      return () => clearTimeout(hideTimer);
    }, 360);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(completeTimer);
    };
  }, [pathname]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#fbfaf8]/95 backdrop-blur-md select-none transition-all duration-300 ease-out ${
        isFadingOut
          ? "opacity-0 pointer-events-none scale-105"
          : "opacity-100 scale-100"
      }`}
    >
      {/* Soft Ambient Spotlight Glow */}
      <div className="absolute w-96 h-96 bg-gradient-to-tr from-emerald-200/35 via-amber-100/25 to-white/70 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Main 3D Animated Logo Stage */}
      <div className="relative flex flex-col items-center justify-center z-10 font-[Arial,sans-serif]">
        
        {/* Outer Rotating 3D Aura Energy Ring */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
          
          {/* Outer Spin Ring 1 */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#1b3b32]/25 animate-[spin_5s_linear_infinite]" />
          
          {/* Inner Spin Ring 2 (Reversed) */}
          <div className="absolute inset-2 sm:inset-3 rounded-full border-2 border-[#10b981]/40 animate-[spin_3.5s_linear_infinite_reverse]" />
          
          {/* Golden Pulse Orbit */}
          <div className="absolute inset-4 sm:inset-5 rounded-full border border-amber-400/40 animate-ping opacity-25" />

          {/* 3D Glass Disc Backdrop */}
          <div className="relative w-24 h-24 sm:w-30 sm:h-30 rounded-full bg-white/95 backdrop-blur-md shadow-[0_12px_30px_rgba(27,59,50,0.15),inset_0_2px_4px_rgba(255,255,255,1)] border border-white flex items-center justify-center p-3">
            
            {/* The Avira Logo with Smooth Breathing Zoom */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/avira-logo.png"
              alt="Avira Life Care"
              className="h-14 sm:h-18 w-auto object-contain drop-shadow-md animate-[pulse_1.2s_ease-in-out_infinite]"
            />
          </div>

          {/* Orbiting Golden Energy Particle */}
          <div className="absolute inset-0 animate-[spin_2s_linear_infinite]">
            <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b] border-2 border-white -top-1 left-1/2 -translate-x-1/2" />
          </div>

          {/* Orbiting Emerald Energy Particle */}
          <div className="absolute inset-0 animate-[spin_2.5s_linear_infinite_reverse]">
            <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981] border-2 border-white -bottom-1 left-1/2 -translate-x-1/2" />
          </div>
        </div>

        {/* Brand Text (Clean without Ayurvedic subtitle) */}
        <div className="text-center mt-4 space-y-0.5">
          <h2 className="text-base sm:text-lg font-bold tracking-wider text-[#1b3b32] uppercase">
            AVIRA LIFE CARE
          </h2>
        </div>

        {/* Slim Progress Bar */}
        <div className="w-40 sm:w-48 h-1.5 bg-stone-200/80 rounded-full overflow-hidden mt-3.5 relative border border-stone-200">
          <div
            className="h-full bg-gradient-to-r from-[#1b3b32] via-[#059669] to-[#34d399] rounded-full transition-all duration-150 ease-out shadow-[0_0_8px_rgba(5,150,105,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Simplified Loading Text */}
        <span className="text-[11px] font-bold text-stone-500 mt-2 tracking-wider">
          Loading... {progress}%
        </span>

      </div>
    </div>
  );
}
