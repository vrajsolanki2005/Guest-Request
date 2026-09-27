import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Timer } from "lucide-react";

type Props = {
  deadline: string | null;
  status: string;
  escalatedAt: string | null;
  size?: "sm" | "md";
};

const iconSize = { sm: "h-3.5 w-3.5", md: "h-4 w-4" } as const;
const padding = { sm: "px-2 py-1 text-xs gap-1.5", md: "px-3 py-1.5 text-sm gap-2" } as const;

export default function SLACountdown({ deadline, status, escalatedAt, size = "sm" }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!deadline) return null;

  const base = `inline-flex items-center rounded-full font-medium ring-1 ring-inset ${padding[size]}`;

  if (status === "RESOLVED" || status === "CLOSED") {
    return (
      <span className={`${base} bg-green-50 text-green-700 ring-green-200`}>
        <CheckCircle2 className={iconSize[size]} />
        SLA met
      </span>
    );
  }

  const remaining = new Date(deadline).getTime() - now;

  if (remaining <= 0 || escalatedAt) {
    return (
      <span className={`${base} bg-red-50 font-semibold text-red-700 ring-red-200`}>
        <AlertTriangle className={iconSize[size]} />
        SLA breached
      </span>
    );
  }

  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const tone =
    remaining <= 5 * 60 * 1000
      ? "bg-red-50 text-red-700 ring-red-200"
      : remaining <= 15 * 60 * 1000
        ? "bg-orange-50 text-orange-700 ring-orange-200"
        : "bg-green-50 text-green-700 ring-green-200";

  return (
    <span className={`${base} ${tone}`} title="Time remaining to meet SLA">
      <Timer className={iconSize[size]} />
      {hours > 0 ? `${hours}h ` : ""}
      {minutes}m {String(seconds).padStart(2, "0")}s
    </span>
  );
}