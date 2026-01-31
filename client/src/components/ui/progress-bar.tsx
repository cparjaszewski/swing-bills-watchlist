import { motion } from "framer-motion";
import clsx from "clsx";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  colorClass?: string;
}

export function ProgressBar({ value, max = 100, className, colorClass = "bg-primary" }: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={clsx("h-2 w-full bg-secondary rounded-full overflow-hidden", className)}>
      <motion.div
        className={clsx("h-full rounded-full", colorClass)}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}
