import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function Logo({ className = "", size = 32, showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon: Stylized cross-stitch with thread */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Background circle */}
        <circle cx="50" cy="50" r="48" fill="currentColor" className="text-primary/10" />

        {/* Main cross-stitch X */}
        <path
          d="M25 25 L75 75 M75 25 L25 75"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          className="text-primary"
        />

        {/* Decorative stitches (smaller X's) */}
        <path
          d="M20 50 L30 60 M30 50 L20 60"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className="text-primary/60"
        />
        <path
          d="M70 50 L80 60 M80 50 L70 60"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className="text-primary/60"
        />
        <path
          d="M50 20 L60 30 M60 20 L50 30"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className="text-primary/60"
        />
        <path
          d="M50 70 L60 80 M60 70 L50 80"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className="text-primary/60"
        />

        {/* Thread curve (connecting the stitches) */}
        <path
          d="M30 30 Q40 35 50 40 T70 50"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          className="text-primary/40"
          strokeDasharray="4 4"
        />
      </svg>

      {/* Text */}
      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-xl leading-none text-foreground">
            StitchArena
          </span>
          <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
            Track your progress
          </span>
        </div>
      )}
    </div>
  );
}

// Alternative: Embroidery hoop version
export function LogoHoop({ className = "", size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer hoop */}
      <circle
        cx="50"
        cy="50"
        r="45"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        className="text-primary"
      />
      <circle
        cx="50"
        cy="50"
        r="40"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        className="text-primary/60"
      />

      {/* Inner cross-stitches pattern */}
      <g className="text-primary">
        {/* Center X */}
        <path d="M40 40 L60 60 M60 40 L40 60" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />

        {/* Surrounding small X's */}
        <path d="M30 35 L35 40 M35 35 L30 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        <path d="M65 35 L70 40 M70 35 L65 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        <path d="M30 60 L35 65 M35 60 L30 65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        <path d="M65 60 L70 65 M70 60 L65 65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      </g>

      {/* Hoop screw */}
      <circle cx="50" cy="10" r="3" fill="currentColor" className="text-primary" />
      <rect x="48" y="7" width="4" height="6" fill="currentColor" className="text-primary/60" rx="1" />
    </svg>
  );
}

// Alternative: Needle and thread version
export function LogoNeedle({ className = "", size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Needle */}
      <path
        d="M80 20 L50 50 L40 40 L70 10 Z"
        fill="currentColor"
        className="text-primary"
      />
      <circle cx="75" cy="15" r="3" fill="currentColor" className="text-primary/60" />

      {/* Thread path forming an S */}
      <path
        d="M40 40 Q30 50 35 60 T40 80"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        className="text-primary/80"
      />

      {/* Thread dots */}
      <circle cx="35" cy="60" r="2" fill="currentColor" className="text-primary" />
      <circle cx="38" cy="72" r="2" fill="currentColor" className="text-primary" />
      <circle cx="40" cy="80" r="3" fill="currentColor" className="text-primary" />
    </svg>
  );
}
