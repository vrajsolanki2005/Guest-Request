type Variant =
  | "blue"
  | "yellow"
  | "purple"
  | "green"
  | "slate"
  | "red"
  | "orange";

type Props = {
  children: React.ReactNode;
  variant?: Variant;
};

const variants: Record<Variant, string> = {
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  yellow: "bg-yellow-50 text-yellow-700 ring-yellow-200",
  purple: "bg-purple-50 text-purple-700 ring-purple-200",
  green: "bg-green-50 text-green-700 ring-green-200",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  orange: "bg-orange-50 text-orange-700 ring-orange-200",
};

const Badge = ({ children, variant = "slate" }: Props) => (
  <span
    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${variants[variant]}`}
  >
    {children}
  </span>
);

export default Badge;
