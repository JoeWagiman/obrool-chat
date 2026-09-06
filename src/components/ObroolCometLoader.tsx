import React, { useId } from "react";

interface ObroolCometLoaderProps {
  size?: number;
  color?: string;
  tailColor?: string;
  className?: string;
}

/**
 * Obrool Comet Loader
 * Ikon khas logo Obrool dengan ekor komet melengkung (tidak full melingkar),
 * memudar di ujung belakang dan memiliki kepala komet bulat khas Obrool.
 */
export const ObroolCometLoader: React.FC<ObroolCometLoaderProps> = ({
  size = 22,
  color = "#2563EB",
  tailColor = "#0A0A0B",
  className = "",
}) => {
  const rawId = useId();
  const gradId = `obrool-comet-grad-${rawId.replace(/:/g, "")}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animate-spin ${className}`}
      style={{ animationDuration: "0.9s" }}
      role="status"
      aria-label="Sedang memproses..."
    >
      <defs>
        {/* Gradient pudar untuk efek ekor komet yang melaju */}
        <linearGradient
          id={gradId}
          x1="10.33"
          y1="28.18"
          x2="38.62"
          y2="11.02"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={tailColor} stopOpacity="0" />
          <stop offset="35%" stopColor={tailColor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={tailColor} stopOpacity="0.95" />
        </linearGradient>
      </defs>

      {/* Ekor Komet Obrool (Bukan full circle 300°, melainkan busur komet ~100° melengkung halus) */}
      <path
        d="M 10.33 28.18 A 22.000 22.000 0 0 1 38.616 11.018"
        stroke={`url(#${gradId})`}
        strokeWidth="7.5"
        strokeLinecap="round"
      />

      {/* Kepala Komet (Lingkaran bola khas Obrool) */}
      <circle cx="46.721" cy="15.651" r="5.350" fill={color} />
    </svg>
  );
};
