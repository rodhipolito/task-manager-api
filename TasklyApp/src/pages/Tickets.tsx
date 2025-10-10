import { useEffect, useMemo, useState } from "react";
import api from "../api";
import Button from "../components/Button";
import Input from "../components/Input";
import TicketCard from "../components/TicketCard";
import Modal from "../components/Modal";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Cell,
  LabelList, // ⬅️ adicionado
} from "recharts";

// ===== Types =====
type MonthStr =
  | "Jan" | "Feb" | "Mar" | "Apr" | "May" | "Jun"
  | "Jul" | "Aug" | "Sep" | "Oct" | "Nov" | "Dec";

interface UserLite {
  id?: string;
  email?: string;
  role?: string;
}

interface Ticket {
  id: number;
  title: string;
  description: string;
  priority: number; // 0 Low | 1 Medium | 2 High
  status: number;   // 0 Open | 1 In Progress | 2 Resolved
  createdAt?: string;
  createdBy?: UserLite;
}

interface CreateTicketDto {
  Title: string;
  Description: string;
  Priority: number;
  Status: number;
}

interface PriorityDatum {
  name: string;
  count: number;
}

interface UserMonthlyPoint {
  month: MonthStr;
  [key: string]: number | MonthStr;
}

// ===== Consts / Mappings =====
const priorityLabels = ["Low", "Medium", "High"];
const months: MonthStr[] = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const chartColors = ["#60a5fa", "#fbbf24", "#f87171"]; // azul, amarelo, vermelho

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // create
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(0);
  const [loading, setLoading] = useState(false);

  // edit
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState(0);
  const [editStatus, setEditStatus] = useState(0);
  const [editLoading, setEditLoading] = useState(false);

  // filters
  const [filterPriority, setFilterPriority] = useState("All"); // "All" | "0" | "1" | "2"
  const [filterStatus, setFilterStatus] = useState("All");     // "All" | "0" | "1" | "2"

  // ---- Load tickets
  const fetchTickets = async () => {
    try {
      const res = await api.get<Ticket[]>("/Tickets");
      setTickets(res.data);
    } catch (err) {
      console.error("❌ Error loading tickets:", err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // ---- Create ticket
  const createTicket = async () => {
    if (!title.trim() || !description.trim()) {
      alert("Please fill in title and description");
      return;
    }
    setLoading(true);
    try {
      const dto: CreateTicketDto = {
        Title: title.trim(),
        Description: description.trim(),
        Priority: priority, // 0/1/2
        Status: 0,          // Open
      };
        await api.post<Ticket>("/Tickets", dto);
      setModalOpen(false);
      setTitle("");
      setDescription("");
      setPriority(0);
      fetchTickets();
    } catch (err) {
      console.error("❌ Error creating ticket:", err);
      alert("Error creating ticket. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // ---- Delete ticket
  const deleteTicket = async (id: number) => {
    try {
      await api.delete(`/Tickets/${id}`);
      fetchTickets();
    } catch (err) {
      console.error("❌ Error deleting ticket:", err);
    }
  };

  // ---- Edit ticket
  const startEdit = (t: Ticket) => {
    setEditingTicket(t);
    setEditTitle(t.title);
    setEditDescription(t.description);
    setEditPriority(t.priority);
    setEditStatus(t.status);
  };

  const updateTicket = async () => {
    if (!editingTicket) return;
    if (!editTitle.trim() || !editDescription.trim()) {
      alert("Please fill in title and description");
      return;
    }
    setEditLoading(true);
    try {
      const dto = {
        Title: editTitle.trim(),
        Description: editDescription.trim(),
        Priority: editPriority,
        Status: editStatus,
      };
      await api.put(`/Tickets/${editingTicket.id}`, dto);
      setEditingTicket(null);
      setEditTitle("");
      setEditDescription("");
      setEditPriority(0);
      setEditStatus(0);
      fetchTickets();
    } catch (err) {
      console.error("❌ Error updating ticket:", err);
      alert("Error updating ticket. Check console for details.");
    } finally {
      setEditLoading(false);
    }
  };

  // ---- Filters
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchPriority =
        filterPriority === "All" || t.priority === Number(filterPriority);
      const matchStatus =
        filterStatus === "All" || t.status === Number(filterStatus);
      return matchPriority && matchStatus;
    });
  }, [tickets, filterPriority, filterStatus]);

  // ---- Chart 1: by priority
  const priorityData: PriorityDatum[] = useMemo(() => {
    return priorityLabels.map((label, idx) => ({
      name: label,
      count: tickets.filter((t) => t.priority === idx).length,
    }));
  }, [tickets]);

  // ---- Users list (emails)
  const users: string[] = useMemo(() => {
    const s = new Set<string>();
    tickets.forEach((t) => s.add(t.createdBy?.email || "Unknown"));
    return Array.from(s);
  }, [tickets]);

  // ---- Chart 2: monthly accumulation by user
  const userMonthlyData: UserMonthlyPoint[] = useMemo(() => {
    const agg: Record<string, Record<MonthStr, number>> = {};
    users.forEach((u) => (agg[u] = {} as Record<MonthStr, number>));

    tickets.forEach((t) => {
      const user = t.createdBy?.email || "Unknown";
      const d = t.createdAt ? new Date(t.createdAt) : null;
      const m = d ? (months[d.getMonth()] as MonthStr) : (months[new Date().getMonth()] as MonthStr);
      agg[user][m] = (agg[user][m] || 0) + 1;
    });

    return months.map((m) => {
      const row: UserMonthlyPoint = { month: m };
      users.forEach((u) => (row[u] = agg[u][m] || 0));
      return row;
    });
  }, [tickets, users]);

  return (
    <div className="ml-64 p-8 space-y-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">🎫 Tickets Dashboard</h2>
        <Button onClick={() => setModalOpen(true)}>+ Create Ticket</Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap mb-2">
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="border rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 border-gray-300 dark:border-gray-700"
        >
          <option value="All">All Priorities</option>
          <option value="0">Low</option>
          <option value="1">Medium</option>
          <option value="2">High</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 border-gray-300 dark:border-gray-700"
        >
          <option value="All">All Status</option>
          <option value="0">Open</option>
          <option value="1">In Progress</option>
          <option value="2">Resolved</option>
        </select>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* 1) By priority */}
          <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-md">
            <h3 className="text-lg font-semibold mb-4">Tickets by Priority</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count">
                  {priorityData.map((_, idx) => (
                    <Cell key={idx} fill={chartColors[idx]} />
                  ))}

                  {/* ✅ Rótulos no topo das barras sem usar y-4 */}
                  <LabelList dataKey="count" position="top" offset={8} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

        {/* 2) Monthly accumulation by user */}
        <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Tickets per User (Monthly)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={userMonthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              {users.map((user, idx) => (
                <Line
                  key={user}
                  type="monotone"
                  dataKey={user}
                  stroke={["#60a5fa", "#10b981", "#f59e0b", "#f87171", "#a78bfa"][idx % 5]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tickets list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTickets.map((t) => (
          <TicketCard
            key={t.id}
            ticket={t}
            onEdit={() => startEdit(t)}
            onDelete={() => deleteTicket(t.id)}
          />
        ))}
      </div>

      {/* Create modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Ticket">
        <div className="space-y-3">
          <Input placeholder="Title *" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Description *" value={description} onChange={(e) => setDescription(e.target.value)} />
          <select
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 w-full bg-white dark:bg-neutral-800 border-gray-300 dark:border-gray-700"
          >
            <option value={0}>Low</option>
            <option value={1}>Medium</option>
            <option value={2}>High</option>
          </select>
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={createTicket} disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </Button>
            <Button onClick={() => setModalOpen(false)} className="bg-gray-400 hover:bg-gray-500" disabled={loading}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={!!editingTicket} onClose={() => setEditingTicket(null)} title="Edit Ticket">
        <div className="space-y-3">
          <Input placeholder="Title *" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
          <Input placeholder="Description *" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
          <select
            value={editPriority}
            onChange={(e) => setEditPriority(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 w-full bg-white dark:bg-neutral-800 border-gray-300 dark:border-gray-700"
          >
            <option value={0}>Low</option>
            <option value={1}>Medium</option>
            <option value={2}>High</option>
          </select>
          <select
            value={editStatus}
            onChange={(e) => setEditStatus(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 w-full bg-white dark:bg-neutral-800 border-gray-300 dark:border-gray-700"
          >
            <option value={0}>Open</option>
            <option value={1}>In Progress</option>
            <option value={2}>Resolved</option>
          </select>
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={updateTicket} disabled={editLoading}>
              {editLoading ? "Updating..." : "Update"}
            </Button>
            <Button onClick={() => setEditingTicket(null)} className="bg-gray-400 hover:bg-gray-500" disabled={editLoading}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
