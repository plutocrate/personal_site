export default function BalatroLogo({ size = 22, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`balatro-svg-logo ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Holographic foil gradient */}
        <linearGradient id="balatro-foil-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fe5f55" />
          <stop offset="35%" stopColor="#ff9f43" />
          <stop offset="70%" stopColor="#00d2d3" />
          <stop offset="100%" stopColor="#54a0ff" />
        </linearGradient>

        {/* Card shadow */}
        <filter id="balatro-card-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Playing Card Body */}
      <rect
        x="5"
        y="2"
        width="22"
        height="28"
        rx="3.5"
        fill="#ffffff"
        stroke="url(#balatro-foil-grad)"
        strokeWidth="1.8"
        filter="url(#balatro-card-shadow)"
      />

      {/* Card Inner Red Border Inset */}
      <rect
        x="6.6"
        y="3.6"
        width="18.8"
        height="24.8"
        rx="2.2"
        fill="#faf7f5"
        stroke="#fe5f55"
        strokeWidth="0.6"
        strokeOpacity="0.6"
      />

      {/* Tiny corner suit pips (diamonds) */}
      <path d="M8.5 6L9.8 7.5L8.5 9L7.2 7.5Z" fill="#fe5f55" />
      <path d="M23.5 23L24.8 24.5L23.5 26L22.2 24.5Z" fill="#fe5f55" />

      {/* Center Balatro Joker Split Diamond / Jester Mask */}
      {/* Left Red Half */}
      <path
        d="M16 8.5L10.5 16L16 23.5V8.5Z"
        fill="#fe5f55"
      />
      {/* Right Cyan Half */}
      <path
        d="M16 8.5L21.5 16L16 23.5V8.5Z"
        fill="#0b84d8"
      />

      {/* Center Jester Smile / Eye accents */}
      <circle cx="13.5" cy="15" r="0.9" fill="#ffffff" />
      <circle cx="18.5" cy="15" r="0.9" fill="#ffffff" />
      <path
        d="M13.5 18C14.5 19.5 17.5 19.5 18.5 18"
        stroke="#ffffff"
        strokeWidth="0.9"
        strokeLinecap="round"
      />

      {/* Jester Hat Bells (Gold) */}
      <circle cx="16" cy="7.8" r="1.2" fill="#ffd32a" stroke="#d48806" strokeWidth="0.4" />
      <circle cx="9.6" cy="16" r="1.1" fill="#ffd32a" stroke="#d48806" strokeWidth="0.4" />
      <circle cx="22.4" cy="16" r="1.1" fill="#ffd32a" stroke="#d48806" strokeWidth="0.4" />
    </svg>
  );
}
