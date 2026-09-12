import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function Card({
  title,
  description,
  action,
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <section
      className={[
        "rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm",
        className,
      ].join(" ")}
      {...props}
    >
      {(title || description || action) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title && (
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {title}
              </h2>
            )}

            {description && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>

          {action}
        </div>
      )}

      {children}
    </section>
  );
}