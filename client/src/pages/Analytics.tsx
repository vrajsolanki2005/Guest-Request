
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import api from "../api/axios";

type AnalyticsData = {
  summary: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    breached: number;
    averageResolutionMinutes: number;
  };
  priorityBreakdown: { name: string; count: number }[];
  categoryBreakdown: { name: string; count: number }[];
  dailyVolume: { date: string; count: number }[];
};

const COLORS = ["#0f766e", "#0ea5e9", "#f59e0b", "#ef4444", "#8b5cf6"];

const Analytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/analytics")
      .then((response) => setData(response.data.data))
      .catch(() => setError("Unable to load analytics."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-slate-500">Loading analytics...</div>;
  }

  if (error || !data) {
    return (
      <div className="m-8 rounded-xl bg-red-50 p-4 text-red-700">
        {error || "No analytics data available."}
      </div>
    );
  }

  const stats = [
    { label: "Total requests", value: data.summary.total, color: "text-slate-900" },
    { label: "Open", value: data.summary.open, color: "text-blue-600" },
    { label: "In progress", value: data.summary.inProgress, color: "text-amber-600" },
    { label: "Resolved", value: data.summary.resolved, color: "text-green-600" },
    { label: "SLA breaches", value: data.summary.breached, color: "text-red-600" },
    {
      label: "Avg. resolution",
      value: `${data.summary.averageResolutionMinutes} min`,
      color: "text-violet-600",
    },
  ];

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of your hotel's guest requests and service performance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className={`mt-2 text-3xl font-bold ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-800">
            Request volume (last 7 days)
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.dailyVolume}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value: string) =>
                    value.slice(5)
                  }
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Requests"
                  stroke="#0f766e"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-800">
            Requests by priority
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.priorityBreakdown}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {data.priorityBreakdown.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="mb-4 font-semibold text-slate-800">
            Requests by category
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.categoryBreakdown}
                margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="count"
                  name="Requests"
                  fill="#0f766e"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Analytics;