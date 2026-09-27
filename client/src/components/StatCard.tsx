import Card from "./ui/Card";

type Props = {
  title: string;
  value: number;
  accent?: string;
};

const StatCard = ({ title, value, accent = "text-slate-900" }: Props) => (
  <Card className="p-5">
    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
      {title}
    </p>
    <p className={`mt-2 text-3xl font-bold ${accent}`}>{value}</p>
  </Card>
);

export default StatCard;
