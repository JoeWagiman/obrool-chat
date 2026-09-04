interface LogoProps {
  size?: number;
  className?: string;
}

export function ObroolMark({ size = 26, className = "" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Obrool"
    >
      <path
        d="M 38.616 11.018 A 22 22 0 1 0 52.175 23.228"
        stroke="#0A0A0B"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="46.721" cy="15.651" r="5.35" fill="#2563EB" />
    </svg>
  );
}

export function ObroolLogo({ size = 32, className = "" }: LogoProps) {
  const textSize = size >= 32 ? "text-xl sm:text-2xl font-bold tracking-tight" : "font-[650] tracking-[-0.02em] text-base";
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <ObroolMark size={size} />
      <span className={`${textSize} text-zinc-950 select-none`}>
        Obrool
      </span>
    </div>
  );
}
