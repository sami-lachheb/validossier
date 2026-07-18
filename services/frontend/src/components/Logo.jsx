import React from 'react';

export function Logo({ style }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" className="logo-svg" style={{ height: '38px', width: 'auto', overflow: 'visible', ...style }}>
      <defs>
        <linearGradient id="emerald" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981"/>
          <stop offset="100%" stopColor="#047857"/>
        </linearGradient>
        <style>{`
          .logo-svg {
            cursor: pointer;
          }
          .logo-hexagon {
            transition: all 0.5s ease;
          }
          .logo-svg:hover .logo-hexagon {
            stroke: #10B981;
            filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.5));
          }
          .logo-shield {
            filter: drop-shadow(0 2px 4px rgba(4, 120, 87, 0.3));
            transition: all 0.3s ease;
          }
          .logo-svg:hover .logo-shield {
            filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.6));
            transform: translateY(-1px);
          }
          .logo-node {
            animation: pulse-node 3s infinite ease-in-out;
          }
          .logo-node-1 { transform-origin: 50px 44px; animation-delay: 0s; }
          .logo-node-2 { transform-origin: 43px 55px; animation-delay: 1s; }
          .logo-node-3 { transform-origin: 57px 55px; animation-delay: 2s; }
          @keyframes pulse-node {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.3); opacity: 1; fill: #a7f3d0; }
          }
          .logo-text-main {
            transition: fill 0.3s ease;
          }
          .logo-svg:hover .logo-text-main {
            fill: #ffffff !important;
          }
          body.light-theme .logo-svg:hover .logo-text-main {
            fill: #000000 !important;
          }
        `}</style>
      </defs>
      <polygon points="50,15 80.3,32.5 80.3,67.5 50,85 19.7,67.5 19.7,32.5" className="logo-hexagon" fill="none" stroke="var(--border-color)" strokeWidth="4.5" strokeLinejoin="round"/>
      <path d="M36,35 L64,35 L64,55 C64,68 50,76 50,76 C50,76 36,68 36,55 Z" className="logo-shield" fill="url(#emerald)" style={{ transformOrigin: '50px 55.5px', transition: 'transform 0.3s ease' }}/>
      <circle cx="50" cy="44" r="3.5" className="logo-node logo-node-1" fill="#FFFFFF"/>
      <circle cx="43" cy="55" r="3.5" className="logo-node logo-node-2" fill="#FFFFFF"/>
      <circle cx="57" cy="55" r="3.5" className="logo-node logo-node-3" fill="#FFFFFF"/>
      <path d="M50,44 L43,55 M50,44 L57,55 M43,55 L57,55" stroke="#FFFFFF" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" opacity="0.8"/>
      <text x="105" y="60" fontFamily="var(--font-sans)" fontWeight="800" fontSize="34" className="logo-text-main" fill="var(--text-main)" letterSpacing="-0.5">Vali<tspan fill="#10B981">Dossier</tspan></text>
      <text x="108" y="78" fontFamily="var(--font-sans)" fontWeight="700" fontSize="10" fill="var(--text-muted)" letterSpacing="1.5">TEAM OXALIS</text>
    </svg>
  );
}
