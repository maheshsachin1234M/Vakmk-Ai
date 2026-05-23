/**
 * VAKMK AI Logo — futuristic brain + neural document mark.
 * Pure SVG, scalable, dark-mode native, no external assets.
 */
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
  withWordmark?: boolean;
}

export function Logo({ size = 36, className, withWordmark = false }: LogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_0_18px_rgba(124,58,237,0.45)]"
        aria-label="VAKMK AI"
      >
        <defs>
          <linearGradient id="vakmk-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#7C3AED" />
            <stop offset="0.55" stopColor="#D946EF" />
            <stop offset="1" stopColor="#06B6D4" />
          </linearGradient>
          <radialGradient id="vakmk-glow" cx="24" cy="24" r="22" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#7C3AED" stopOpacity="0.45" />
            <stop offset="1" stopColor="#7C3AED" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Soft halo */}
        <circle cx="24" cy="24" r="22" fill="url(#vakmk-glow)" />

        {/* Outer hexagonal frame — engineering aesthetic */}
        <path
          d="M24 3 L41.5 12.5 L41.5 35.5 L24 45 L6.5 35.5 L6.5 12.5 Z"
          stroke="url(#vakmk-grad)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.85"
        />

        {/* Document/page layers */}
        <rect
          x="13.5"
          y="14"
          width="14"
          height="18"
          rx="2"
          stroke="url(#vakmk-grad)"
          strokeWidth="1.4"
          fill="rgba(124,58,237,0.08)"
        />
        <line x1="16" y1="19" x2="25" y2="19" stroke="url(#vakmk-grad)" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="16" y1="22.5" x2="23" y2="22.5" stroke="url(#vakmk-grad)" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
        <line x1="16" y1="26" x2="24" y2="26" stroke="url(#vakmk-grad)" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />

        {/* Neural connection lines */}
        <path
          d="M28 16 Q35 18 36 24 Q35 30 30 31"
          stroke="url(#vakmk-grad)"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M28 21 Q33 22 34 24 Q33 26 30 27"
          stroke="url(#vakmk-grad)"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          opacity="0.7"
        />

        {/* Neural nodes */}
        <circle cx="36" cy="24" r="2.2" fill="url(#vakmk-grad)" />
        <circle cx="36" cy="24" r="1" fill="#fff" />
        <circle cx="34" cy="24" r="1.4" fill="url(#vakmk-grad)" opacity="0.8" />
        <circle cx="28" cy="16" r="1.2" fill="#D946EF" />
        <circle cx="28" cy="32" r="1.2" fill="#06B6D4" />

        {/* Brain spark inside doc */}
        <circle cx="20.5" cy="29" r="1.1" fill="url(#vakmk-grad)" />
      </svg>

      {withWordmark && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-base font-semibold tracking-tight text-foreground">
            VAKMK <span className="text-gradient">AI</span>
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">
            Engineering Intelligence
          </span>
        </div>
      )}
    </div>
  );
}
