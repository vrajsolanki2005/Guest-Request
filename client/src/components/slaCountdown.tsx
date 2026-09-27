import { useEffect, useState } from "react";

type Props = {
  deadline: string | null;
  status: string;
  escalatedAt: string | null;
};

const SLACountdown = ({ deadline, status, escalatedAt }: Props) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!deadline) {
    return null;
  }

  if (status === "RESOLVED" || status === "CLOSED") {
    return (
      <span className="text-sm font-medium text-green-600">SLA completed</span>
    );
  }

  const remaining = new Date(deadline).getTime() - now;

  if (remaining <= 0 || escalatedAt) {
    return (
      <span className="rounded-md bg-red-100 px-2 py-1 text-sm font-semibold text-red-700">
        SLA BREACHED
      </span>
    );
  }

  const totalSeconds = Math.floor(remaining / 1000);

  const hours = Math.floor(totalSeconds / 3600);

  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const seconds = totalSeconds % 60;

  return (
    <span
      className={`rounded-md px-2 py-1 text-sm font-medium ${
        remaining <= 5 * 60 * 1000
          ? "bg-red-50 text-red-600"
          : remaining <= 15 * 60 * 1000
            ? "bg-orange-50 text-orange-600"
            : "bg-green-50 text-green-600"
      }`}
    >
      SLA {hours > 0 ? `${hours}h ` : ""}
      {minutes}m {seconds}s
    </span>
  );
};

export default SLACountdown;
