import type { ReactNode } from "react";

type Variant = "default" | "primary" | "danger" | "ghost";

type Props = {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: Variant;
  disabled?: boolean;
  className?: string;
};

const variants: Record<Variant, string> = {
  default: "bg-slate-900 text-white hover:bg-slate-700",
  primary: "bg-blue-600 text-white hover:bg-blue-500",
  danger: "bg-red-600 text-white hover:bg-red-500",
  ghost: "border border-slate-200 text-slate-700 hover:bg-slate-50",
};

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "default",
  disabled,
  className = "",
}: Props) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
  >
    {children}
  </button>
);

export default Button;
