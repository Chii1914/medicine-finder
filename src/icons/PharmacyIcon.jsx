import { LocationIcon } from './LocationIcon';

export const PharmacyIcon = (props) => {
  const { size = 40, color = '#EC4899' } = props;
  const iconSize = size * 0.5;

  return (
    <div className="relative">
      <LocationIcon {...props} color={color} />
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-3/4"
        style={{ width: iconSize, height: iconSize }}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="5"
            y="5"
            width="14"
            height="14"
            rx="2"
            fill="white"
            stroke="white"
            strokeWidth="2"
          />
          <path
            d="M12 8V16"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M8 12H16"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
};
