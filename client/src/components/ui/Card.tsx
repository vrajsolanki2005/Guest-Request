import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

const Card = ({ children, className = "" }: Props) => (
  <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
    {children}
  </div>
);

export default Card;
