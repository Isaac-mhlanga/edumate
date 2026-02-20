import type { SVGProps } from "react";

export const Icons = {
  logo: ({ className, ...props }: SVGProps<SVGSVGElement>) => (
    <svg
      width="160"
      height="42"
      viewBox="0 0 160 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
        <path d="M29.6 5.25H12.4C8.3 5.25 5.25 8.3 5.25 12.4V29.6C5.25 33.7 8.3 36.75 12.4 36.75H29.6C33.7 36.75 36.75 33.7 36.75 29.6V25.5H17.25V21.75H36.75V16.5H17.25V12.75H36.75V12.4C36.75 8.3 33.7 5.25 29.6 5.25Z" fill="hsl(var(--primary))"/>
        <text x="48" y="23" fontFamily="Montserrat, sans-serif" fontSize="20" fontWeight="600" fill="hsl(var(--foreground))">Edumate</text>
        <text x="48" y="37" fontFamily="Montserrat, sans-serif" fontSize="9" fill="hsl(var(--primary))" letterSpacing="0.05em" fontWeight="700">LEARN SMARTER</text>
    </svg>
  ),
  tiktok: ({ className, ...props }: SVGProps<SVGSVGElement>) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.04-5.36-.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  ),
};
