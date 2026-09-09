import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:scale-[0.98]",
    secondary:
      "bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-400 active:scale-[0.98]",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:scale-[0.98]",
    ghost:
      "bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-400",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}