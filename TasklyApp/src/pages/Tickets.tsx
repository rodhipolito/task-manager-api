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
} from "recharts";

// ========== Tipos ==========
type Priority = "Low" | "Medium" | "High";
type Status = "Open" | "InProgress" | "Resolved";

interface UserLite {
  id?: string;
  email?: string;
  role?: string;
}

interface Ticket {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
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
  priority: Priority;
  count: number;
}

type MonthStr =
  | "Jan" | "Feb" | "Mar" | "Apr" | "May" | "Jun"
  | "Jul" | "Aug" | "Sep" | "Oct" | "Nov" | "Dec";

interface UserMonthlyPoint {
  month: MonthStr;
  [key: string]: number | MonthStr;
}

// ========== Mapeamentos ==========
const priorityMap: Record<Priority, number> = { Low: 0, Medium: 1, High: 2 };
const statusMap: Record<Status, number> = { Open: 0, InProgress: 1, Resolved: 2 };
const months: MonthStr[] = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const chartColors: Record<Priority, string> = {
  Low: "#60a5fa",
  Medium: "#fbbf24",
  High: "#f87171",
};

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("Low");
  const [filterPriority, setFilterPriority] = useState<"All" | Priority>("All");
  const [filterStatus, setFilterStatus] = useState<"All" | Status>("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // edição
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState<Priority>("Low");
  const [editStatus, setEditStatus] = useState<Status>("Open");
  const [editLoading, setEditLoading] = useState(false);

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
        Priority: priorityMap[priority],
        Status: statusMap["Open"],
      };
      await api.post<Ticket>("/Tickets", dto);
      setModalOpen(false);
      setTitle("");
      setDescription("");
      setPriority("Low");
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
  const startEdit = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setEditTitle(ticket.title);
    setEditDescription(ticket.description);
    setEditPriority(ticket.priority);
    setEditStatus(ticket.status);
  };

  const updateTicket = async () => {
    if (!editingTicket) return;
    if (!editTitle.trim() || !editDescription.trim()) {
      alert("Please fill in title and description");
      return;
    }
    setEditLoading(true);
    try {
      const ticketData = {
        Title: editTitle.trim(),
        Description: editDescription.trim(),
        Priority: priorityMap[editPriority],
        Status: statusMap[editStatus]
      };
      await api.put(`/Tickets/${editingTicket.id}`, ticketData);
      setEditingTicket(null);
      setEditTitle("");
      setEditDescription("");
      setEditPriority("Low");
      setEditStatus("Open");
      fetchTickets();
    } catch (err) {
      console.error("❌ Error updating ticket:", err);
      alert("Error updating ticket. Check console for details.");
    } finally {
      setEditLoading(false);
    }
  };

  // ---- Filters
  const filteredTickets = useMemo(
    () =>
      tickets.filter(
        (t) =>
          (filterPriority === "All" || t.priority === filterPriority) &&
          (filterStatus === "All" || t.status === filterStatus)
      ),
    [tickets, filterPriority, filterStatus]
  );

  // ---- Chart 1: by priority
  const priorityData: PriorityDatum[] = useMemo(() => {
    const counts: Record<Priority, number> = { Low: 0, Medium: 0, High: 0 };
    tickets.forEach((t) => (counts[t.priority] += 1));
    return (Object.keys(counts) as Priority[]).map((p) => ({ priority: p, count: counts[p] }));
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
      users.forEach((u) => {
        row[u] = agg[u][m] || 0;
      });
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
          onChange={(e) => setFilterPriority(e.target.value as "All" | Priority)}
          className="border rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 border-gray-300 dark:border-gray-700"
        >
          <option value="All">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as "All" | Status)}
          className="border rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 border-gray-300 dark:border-gray-700"
        >
          <option value="All">All Status</option>
          <option value="Open">Open</option>
          <option value="InProgress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      {/* Charts (apenas 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* 1) By priority */}
        <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Tickets by Priority</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="priority" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count">
                {priorityData.map((d, idx) => (
                  <Cell key={`cell-p-${idx}`} fill={chartColors[d.priority]} />
                ))}
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

      {/* Creation modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Ticket">
        <div className="space-y-3">
          <Input placeholder="Title *" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Description *" value={description} onChange={(e) => setDescription(e.target.value)} />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="border rounded-lg px-3 py-2 w-full bg-white dark:bg-neutral-800 border-gray-300 dark:border-gray-700"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
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
          <Input
            placeholder="Title *"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <Input
            placeholder="Description *"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />
          <select
            value={editPriority}
            onChange={(e) => setEditPriority(e.target.value as Priority)}
            className="border rounded-lg px-3 py-2 w-full bg-white dark:bg-neutral-800 border-gray-300 dark:border-gray-700"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <select
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value as Status)}
            className="border rounded-lg px-3 py-2 w-full bg-white dark:bg-neutral-800 border-gray-300 dark:border-gray-700"
          >
            <option value="Open">Open</option>
            <option value="InProgress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={updateTicket} disabled={editLoading}>
              {editLoading ? "Updating..." : "Update"}
            </Button>
            <Button
              onClick={() => setEditingTicket(null)}
              className="bg-gray-400 hover:bg-gray-500"
              disabled={editLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
