import { useEffect, useState } from "react";
import api from "../api";
import Card from "../components/Card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  LabelList,
} from "recharts";
import {
  ChartBar,
  Users,
  ClipboardList,
  CheckCircle,
  Loader2,
  RefreshCcw,
} from "lucide-react";

// Types
interface StatusKPIs {
  open: number;
  inProgress: number;
  resolved: number;
  closed?: number;
}
interface PriorityData { priority: string; count: number; }
interface UserData { user: string; count: number; }
interface DashboardKPIs {
  total: number;
  status: StatusKPIs;
  byPriority: PriorityData[];
  byUser?: UserData[];
}

const chartColors: Record<string, string> = {
  High: "#ef4444",
  Medium: "#f59e0b",
  Low: "#3b82f6",
};

export default function Dashboard() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchKpis = async () => {
    try {
      setRefreshing(true);
      const res = await api.get<DashboardKPIs>("/dashboard/kpis");
      setKpis(res.data);
    } catch (err) {
      console.error("❌ Error fetching KPIs:", err);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKpis();
  }, []);

  if (loading) {
    return (
      <div className="ml-64 p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-10 h-10 text-primary" />
      </div>
    );
  }

  const priorities = kpis?.byPriority ?? [];
  const users = (kpis?.byUser ?? []).slice().sort((a, b) => b.count - a.count);

  return (
    <div className="ml-64 p-8 bg-neutral-light dark:bg-neutral-dark min-h-screen space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-bold flex items-center gap-2">
          <ChartBar className="text-primary w-8 h-8" />
          Dashboard
        </h2>

        <button
          onClick={fetchKpis}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-light transition disabled:opacity-60"
          disabled={refreshing}
        >
          <RefreshCcw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <h3 className="text-3xl font-bold">{kpis?.total ?? 0}</h3>
            </div>
            <ClipboardList className="text-primary w-8 h-8" />
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Open</p>
              <h3 className="text-3xl font-bold text-blue-600">
                {kpis?.status.open ?? 0}
              </h3>
            </div>
            <Users className="text-blue-600 w-8 h-8" />
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <h3 className="text-3xl font-bold text-yellow-500">
                {kpis?.status.inProgress ?? 0}
              </h3>
            </div>
            <Loader2 className="text-yellow-500 w-8 h-8" />
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Resolved</p>
              <h3 className="text-3xl font-bold text-green-600">
                {kpis?.status.resolved ?? 0}
              </h3>
            </div>
            <CheckCircle className="text-green-600 w-8 h-8" />
          </div>
        </Card>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Priority Chart */}
        <Card>
          <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Tickets by Priority
          </h3>
          <div className="h-80">
            {priorities.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-500">
                Sem dados de prioridade
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorities}>
                  <XAxis dataKey="priority" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {priorities.map((d) => (
                      <Cell key={d.priority} fill={chartColors[d.priority] || "#8884d8"} />
                    ))}

                    {/* ✅ rótulo numérico acima da barra */}
                    <LabelList dataKey="count" position="top" fill="#111" fontSize={12} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* User Chart */}
        <Card>
          <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Tickets by User
          </h3>
          <div className="h-80">
            {users.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-500">
                Sem dados de usuários
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={users}
                  layout="vertical"
                  margin={{ top: 10, right: 40, left: 60, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis
                    type="category"
                    dataKey="user"
                    width={100}
                    tick={{ fill: "#374151", fontSize: 12 }}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 8, 8, 0]}>
                    <LabelList dataKey="count" position="right" fill="#111" fontSize={12} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
