import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = '', size = 24 }: LogoProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 120 120" 
      width={size} 
      height={size}
      className={className}
    >
      {/* Three kanban columns */}
      {/* Left column - light gray/blue */}
      <rect x="12" y="20" width="24" height="80" rx="12" ry="12" fill="#B8C5D0"/>
      
      {/* Middle column - medium blue */}
      <rect x="48" y="20" width="24" height="80" rx="12" ry="12" fill="#6B8BB8"/>
      
      {/* Right column - teal/turquoise */}
      <rect x="84" y="20" width="24" height="80" rx="12" ry="12" fill="#2AB3A6"/>
      
      {/* Dragged task card with white border */}
      <rect x="52" y="46" width="28" height="28" rx="8" ry="8" fill="white"/>
      <rect x="56" y="50" width="20" height="20" rx="5" ry="5" fill="#2AB3A6"/>
    </svg>
  );
}
