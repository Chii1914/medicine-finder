import React from 'react';

export const LocationIcon = ({
  color = '#3B82F6',
  secondaryColor = '#2563EB',
  size = 40,
  className = '',
  animated = false,
  onClick,
}) => {
  return (
    <div 
      className={`relative inline-block ${animated ? 'hover:scale-110 transition-transform' : ''} ${className}`}
      style={{ width: size, height: size * 1.35 }}
      onClick={onClick}
    >
      <svg
        width={size}
        height={size * 1.35}
        viewBox="0 0 40 54"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Drop shadow filter */}
        <defs>
          <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.3" floodColor="#000" />
          </filter>
        </defs>
        
        {/* Main pin shape */}
        <path
          d="M20 0C8.95 0 0 8.95 0 20C0 25.5 2.25 30.45 5.95 34.15L20 50L34.05 34.15C37.75 30.45 40 25.5 40 20C40 8.95 31.05 0 20 0Z"
          fill={color}
          filter="url(#dropShadow)"
        />
        
        {/* Bottom rounded part for 3D effect */}
        <ellipse
          cx="20"
          cy="20"
          rx="18"
          ry="18"
          fill={secondaryColor}
        />
      </svg>
    </div>
  );
};
