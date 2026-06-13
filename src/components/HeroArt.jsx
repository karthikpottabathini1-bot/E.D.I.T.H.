export default function HeroArt() {
  return (
    <svg
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="lensGrad" x1="0.1" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#FBFCFF" />
          <stop offset="40%" stopColor="#CBD5E4" />
          <stop offset="62%" stopColor="#3A4458" />
          <stop offset="100%" stopColor="#0A0C12" />
        </linearGradient>

        <linearGradient id="rimGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFB37A" />
          <stop offset="45%" stopColor="#FFF6EC" />
          <stop offset="55%" stopColor="#EAF3FF" />
          <stop offset="100%" stopColor="#6FB7FF" />
        </linearGradient>

        <linearGradient id="horizonGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6FB7FF" stopOpacity="0" />
          <stop offset="22%" stopColor="#6FB7FF" stopOpacity="0.85" />
          <stop offset="45%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="58%" stopColor="#FFC98C" stopOpacity="1" />
          <stop offset="80%" stopColor="#FF9D5C" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FF9D5C" stopOpacity="0" />
        </linearGradient>

        <filter id="haloBlur" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="36" />
        </filter>
        <filter id="rimBlur" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id="horizonBlur" x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <filter id="horizonBlurSoft" x="-20%" y="-300%" width="140%" height="700%">
          <feGaussianBlur stdDeviation="40" />
        </filter>
      </defs>

      {/* soft halo behind the lens */}
      <ellipse
        cx="1180"
        cy="180"
        rx="340"
        ry="300"
        fill="#EAF1FF"
        opacity="0.16"
        filter="url(#haloBlur)"
      />

      {/* the chrome lens shape, tucked into the top-right corner */}
      <g transform="rotate(8 1180 200)">
        <path
          d="M 880 60
             C 1060 -60 1320 -40 1460 140
             C 1560 270 1500 440 1340 460
             C 1160 480 940 360 880 200
             C 855 140 855 100 880 60 Z"
          fill="url(#lensGrad)"
        />
        <path
          d="M 880 60
             C 1060 -60 1320 -40 1460 140
             C 1560 270 1500 440 1340 460
             C 1160 480 940 360 880 200
             C 855 140 855 100 880 60 Z"
          fill="none"
          stroke="url(#rimGrad)"
          strokeWidth="10"
          opacity="0.65"
          filter="url(#rimBlur)"
        />
        <path
          d="M 880 60
             C 1060 -60 1320 -40 1460 140
             C 1560 270 1500 440 1340 460
             C 1160 480 940 360 880 200
             C 855 140 855 100 880 60 Z"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1.5"
        />
      </g>

      {/* glowing horizon wave */}
      <g className="edith-wave">
        <path
          d="M -50,640 C 150,560 320,720 520,650 C 720,580 880,700 1080,630 C 1260,570 1450,660 1650,610"
          stroke="url(#horizonGrad)"
          strokeWidth="60"
          strokeLinecap="round"
          fill="none"
          opacity="0.35"
          filter="url(#horizonBlurSoft)"
        />
        <path
          d="M -50,640 C 150,560 320,720 520,650 C 720,580 880,700 1080,630 C 1260,570 1450,660 1650,610"
          stroke="url(#horizonGrad)"
          strokeWidth="18"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
          filter="url(#horizonBlur)"
        />
        <path
          d="M -50,640 C 150,560 320,720 520,650 C 720,580 880,700 1080,630 C 1260,570 1450,660 1650,610"
          stroke="url(#horizonGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
}
