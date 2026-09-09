interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  height?: "small" | "medium" | "large";
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  height = "medium",
  className = "",
}: ProgressBarProps) {
  const safeMax = max > 0 ? max : 100;

  const percentage = Math.min(
    Math.max((value / safeMax) * 100, 0),
    100
  );

  const heightStyles = {
    small: "h-1.5",
    medium: "h-2.5",
    large: "h-4",
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">
            Progression
          </span>

          <span className="font-semibold text-slate-900">
            {Math.round(percentage)}%
          </span>
        </div>
      )}

      <div
        className={`w-full overflow-hidden rounded-full bg-slate-200 ${heightStyles[height]}`}
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}