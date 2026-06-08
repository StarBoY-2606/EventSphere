import React from "react";

interface EventSphereLogoProps {
  className?: string; // Optional custom className for sizing
  animated?: boolean; // Enable extra spin/animations
}

export function EventSphereLogo({ className = "w-8 h-8", animated = true }: EventSphereLogoProps) {
  return (
    <div className={`relative ${className} flex items-center justify-center shrink-0 group select-none`} id="eventsphere-branded-logo">
      {/* Outer atmospheric glowing aura backdrop */}
      <div className="absolute inset-0 bg-[#4edea3]/20 rounded-full blur-[6px] group-hover:scale-130 transition-all duration-700" />
      
      {/* Dynamic 3D Sphere SVG Design */}
      <svg
        viewBox="0 0 100 100"
        className={`w-full h-full relative z-10 drop-shadow-[0_0_12px_rgba(78,222,163,0.35)] ${
          animated ? "animate-pulse" : ""
        }`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Depth Radial Gradient with high saturation center and dark edges */}
          <radialGradient id="sphereCoreGrad" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#c3ffeb" />
            <stop offset="30%" stopColor="#4edea3" />
            <stop offset="70%" stopColor="#0ea569" />
            <stop offset="100%" stopColor="#052015" />
          </radialGradient>

          {/* Smooth linear gradient for the active glowing orbital ring */}
          <linearGradient id="orbitalRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#4edea3" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#052015" stopOpacity="0.0" />
          </linearGradient>

          {/* Atmosphere highlight layer split */}
          <linearGradient id="atmosphereGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* 1. Underlying atmospheric halo ring */}
        <circle cx="50" cy="50" r="47" stroke="#4edea3" strokeWidth="1" strokeOpacity="0.15" />

        {/* 2. Main 3D Sphere Core */}
        <circle cx="50" cy="50" r="38" fill="url(#sphereCoreGrad)" />

        {/* 3. Internal Hologram Grid Lines (3D spherical wireframe lines) */}
        {/* Horizontal Latitudes */}
        <ellipse cx="50" cy="50" rx="38" ry="12" stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.22" strokeDasharray="3 3" />
        <ellipse cx="50" cy="50" rx="38" ry="24" stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.22" strokeDasharray="4 3" />
        
        {/* Vertical Longitudes */}
        <ellipse cx="50" cy="50" rx="12" ry="38" stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.22" strokeDasharray="3 3" />
        <ellipse cx="50" cy="50" rx="24" ry="38" stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.22" strokeDasharray="4 3" />
        
        {/* Prime Axes */}
        <line x1="12" y1="50" x2="88" y2="50" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.3" />
        <line x1="50" y1="12" x2="50" y2="88" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.3" />

        {/* 4. Upper highlight "crecent shield" to simulate glassmorphic sheen */}
        <path
          d="M14 42 C 22 20, 78 20, 86 42 C 70 28, 30 28, 14 42 Z"
          fill="url(#atmosphereGlow)"
        />

        {/* 5. Outer Orbital Ring crossing behind/around the sphere */}
        <ellipse
          cx="50"
          cy="50"
          rx="47"
          ry="14"
          transform="rotate(-28 50 50)"
          stroke="url(#orbitalRingGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* 6. Orbital node marker (satellite intersection bullet) */}
        <circle cx="21" cy="65" r="3" fill="#ffffff" className="animate-ping" style={{ transformOrigin: "50px 50px" }} />
        <circle cx="21" cy="65" r="2" fill="#ffffff" />

        {/* 7. Shiny glint reflex focus point */}
        <circle cx="36" cy="36" r="3.5" fill="#ffffff" fillOpacity="0.85" />
        <circle cx="34" cy="34" r="1.5" fill="#ffffff" fillOpacity="0.95" />
      </svg>
    </div>
  );
}
