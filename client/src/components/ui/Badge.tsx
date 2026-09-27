import type { ReactNode } from "react";

type Variant =
  | "blue"
  | "yellow"
  | "indigo"
  | "purple"
  | "green"
  | "slate"
  | "red"
  | "orange";

type Props = {
  children: ReactNode;
  variant?: Variant;
  dot?: boolean;
  className?: string;
};

const variants: Record<Variant, string> = {
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  yellow: "bg-yellow-50 text-yellow-700 ring-yellow-200",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  purple: "bg-purple-50 text-purple-700 ring-purple-200",
  green: "bg-green-50 text-green-700 ring-green-200",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  orange: "bg-orange-50 text-orange-700 ring-orange-200",
};

const dotColors: Record<Variant, string> = {
  blue: "bg-blue-500",
  yellow: "bg-yellow-500",
  indigo: "bg-indigo-500",
  purple: "bg-purple-500",
  green: "bg-green-500",
  slate: "bg-slate-400",
  red: "bg-red-500",
  orange: "bg-orange-500",
};

export default function Badge({
  children,
  variant = "slate",
  dot = false,
  className = "",
}: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${variants[variant]} ${className}`}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
