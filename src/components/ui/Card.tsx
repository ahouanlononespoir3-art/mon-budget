import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: "small" | "medium" | "large";
}

export function Card({
  children,
  padding = "medium",
  className = "",
  ...props
}: CardProps) {
  const paddingStyles = {
    small: "p-3",
    medium: "p-5",
    large: "p-6",
  };

  return (
    <div
      className={`
        rounded-2xl
        border border-slate-200
        bg-white
        shadow-sm
        ${paddingStyles[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}