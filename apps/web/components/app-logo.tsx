import Link from 'next/link';

import { cn } from '@kit/ui/utils';

function LogoImage({
  className,
  width = 105,
}: {
  className?: string;
  width?: number;
}) {
  return (
    <svg
      width={width}
      className={cn(`w-[130px]`, className)}
      viewBox="0 0 400 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* fuelManAIger - Light Mode */}
             <text
         className="dark:hidden"
         x="10"
         y="90"
         fontFamily="Arial, sans-serif"
         fontSize="60"
         fontWeight="bold"
         fill="url(#paint0_linear_2621_2)"
       >
         fuel
       </text>
       <text
         className="dark:hidden"
         x="120"
         y="90"
         fontFamily="Arial, sans-serif"
         fontSize="60"
         fontWeight="bold"
         fill="url(#paint1_linear_2621_2)"
       >
         Man
       </text>
       <text
        className="dark:hidden"
         x="240"
         y="90"
         fontFamily="Arial, sans-serif"
         fontSize="60"
         fontWeight="bold"
        fill="url(#paint0_linear_2621_2)"
       >
         AI
       </text>
       <text
         className="dark:hidden"
         x="300"
         y="90"
         fontFamily="Arial, sans-serif"
         fontSize="60"
         fontWeight="bold"
         fill="url(#paint1_linear_2621_2)"
       >
         ger
       </text>

      {/* fuelManAIger - Dark Mode */}
             <text
         className="hidden dark:block"
         x="10"
         y="90"
         fontFamily="Arial, sans-serif"
         fontSize="60"
         fontWeight="bold"
         fill="url(#paint0_linear_2621_2_dark)"
       >
         fuel
       </text>
       <text
         className="hidden dark:block"
         x="120"
         y="90"
         fontFamily="Arial, sans-serif"
         fontSize="60"
         fontWeight="bold"
         fill="url(#paint1_linear_2621_2)"
       >
         Man
       </text>
       <text
        className="hidden dark:block"
         x="240"
         y="90"
         fontFamily="Arial, sans-serif"
         fontSize="60"
         fontWeight="bold"
        fill="url(#paint0_linear_2621_2_dark)"
       >
         AI
       </text>
       <text
         className="hidden dark:block"
         x="300"
         y="90"
         fontFamily="Arial, sans-serif"
         fontSize="60"
         fontWeight="bold"
        fill="url(#paint1_linear_2621_2)"
       >
         ger
       </text>

      <defs>
        <linearGradient
          id="paint0_linear_2621_2"
          x1="200"
          y1="0"
          x2="200"
          y2="140"
          gradientUnits="userSpaceOnUse"
        >
          <stop />
        </linearGradient>
        <linearGradient
          id="paint0_linear_2621_2_dark"
          x1="200"
          y1="0"
          x2="200"
          y2="140"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={'#fff'} />
        </linearGradient>
        <linearGradient
          id="paint1_linear_2621_2"
          x1="200"
          y1="0"
          x2="200"
          y2="140"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8E79DE" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function AppLogo({
  href,
  label,
  className,
}: {
  href?: string | null;
  className?: string;
  label?: string;
}) {
  if (href === null) {
    return <LogoImage className={className} />;
  }

  return (
    <Link aria-label={label ?? 'Home Page'} href={href ?? '/'} prefetch={true}>
      <LogoImage className={className} />
    </Link>
  );
}
