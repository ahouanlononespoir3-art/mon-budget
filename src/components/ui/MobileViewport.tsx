import type { ReactNode } from "react";

interface MobileViewportProps {
  children: ReactNode;
  className?: string;
}

export function MobileViewport({
  children,
  className = "",
}: MobileViewportProps) {
  return (
    <div
      className={[
        "mx-auto w-full max-w-7xl",
        "px-3 sm:px-4 md:px-6 lg:px-8",
        "pb-[calc(5rem+env(safe-area-inset-bottom))]",
        "sm:pb-8",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
