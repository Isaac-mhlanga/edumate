import type { SVGProps } from "react";

export const Icons = {
  logo: ({ className, ...props }: SVGProps<SVGSVGElement>) => (
    <svg
      width="150"
      height="40"
      viewBox="0 0 150 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <g clipPath="url(#clip0_1_2)">
        {/* The blue circle with a brush effect (simplified) */}
        <circle cx="20" cy="20" r="18" stroke="hsl(var(--primary))" strokeWidth="2" fill="none"/>
        <path d="M5 20 A 15 15 0 0 1 35 20 A 15 15 0 0 1 5 20" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" transform="rotate(-15 20 20)" />

        {/* The 'E' inside the circle */}
        <text
          x="13"
          y="28"
          fontFamily="serif"
          fontSize="24"
          fill="hsl(var(--primary))"
          fontWeight="bold"
        >
          E
        </text>

        {/* The text "EDUMATE" */}
        <text
          x="45"
          y="22"
          fontFamily="serif"
          fontSize="16"
          fill="hsl(var(--foreground))"
          fontWeight="bold"
          letterSpacing="1"
        >
          EDUMATE
        </text>

        {/* The text "LEARN SMARTER" */}
        <text
          x="45"
          y="35"
          fontFamily="sans-serif"
          fontSize="7"
          fill="hsl(var(--foreground))"
          fontWeight="normal"
          letterSpacing="1.5"
        >
          LEARN SMARTER
        </text>
      </g>
      <defs>
        <clipPath id="clip0_1_2">
          <rect width="150" height="40" fill="white" />
        </clipPath>
      </defs>
    </svg>
  ),
};
