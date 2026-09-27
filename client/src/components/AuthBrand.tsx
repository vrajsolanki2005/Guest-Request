import { BellRing } from "lucide-react";

export default function AuthBrand({ subtitle }: { subtitle: string }) {
  return (
    <div className="mb-8 flex flex-col items-center text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
        <BellRing className="h-5 w-5" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        GuestRequest
      </h1>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}