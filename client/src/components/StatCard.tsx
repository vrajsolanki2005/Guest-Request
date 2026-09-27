import type { LucideIcon } from "lucide-react";
import Card from "./ui/Card";

type Tone = "slate" | "blue" | "indigo" | "green" | "red";

type Props = {
  title: string;
  value: number | string;
  icon: LucideIcon;
  hint?: string;
  tone?: Tone;
};

const tones: Record<Tone, string> = {
  slate: "bg-slate-100 text-slate-600",
  blue: "bg-blue-50 text-blue-600",
  indigo: "bg-indigo-50 text-indigo-600",
  green: "bg-green-50 text-green-600",
  red: "bg-red-50 text-red-600",
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  hint,
  tone = "slate",
}: Props) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      {hint && <p className="mt-2 text-xs text-slate-400">{hint}</p>}
    </Card>
  );
}
