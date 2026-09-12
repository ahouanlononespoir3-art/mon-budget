import type { ReactNode } from "react";

interface OnboardingStepProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function OnboardingStep({
  title,
  description,
  children,
}: OnboardingStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {title}
        </h2>

        {description && (
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>

      {children}
    </div>
  );
}