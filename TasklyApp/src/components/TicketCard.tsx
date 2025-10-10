import Badge from "./Badge";
import Button from "./Button";

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: number;   // 0: Open | 1: In Progress | 2: Resolved
  priority: number; // 0: Low | 1: Medium | 2: High
}

export default function TicketCard({
  ticket,
  onEdit,
  onDelete,
}: {
  ticket: Ticket;
  onEdit: () => void;
  onDelete: () => void;
}) {
  // ===== Labels =====
  const statusLabels: Record<number, string> = {
    0: "Open",
    1: "In Progress",
    2: "Resolved",
  };

  const priorityLabels: Record<number, string> = {
    0: "Low",
    1: "Medium",
    2: "High",
  };

  // ===== Badge Colors =====
  const statusColor =
    ticket.status === 0
      ? "blue"
      : ticket.status === 1
      ? "yellow"
      : ticket.status === 2
      ? "green"
      : "gray";

  const priorityColor =
    ticket.priority === 0
      ? "blue"
      : ticket.priority === 1
      ? "orange"
      : ticket.priority === 2
      ? "red"
      : "gray";

  return (
    <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between gap-3 transition-all hover:shadow-md hover:scale-[1.01]">
      {/* ===== Title & Description ===== */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
          {ticket.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {ticket.description}
        </p>
      </div>

      {/* ===== Badges ===== */}
      <div className="flex flex-wrap gap-2 mt-2">
        <Badge text={statusLabels[ticket.status]} color={statusColor} />
        <Badge text={priorityLabels[ticket.priority]} color={priorityColor} />
      </div>

      {/* ===== Buttons ===== */}
      <div className="flex justify-end gap-2 mt-3">
        <Button
          className="bg-yellow-500 hover:bg-yellow-600 px-4 py-1.5 text-sm font-medium"
          onClick={onEdit}
        >
          Edit
        </Button>
        <Button
          className="bg-red-500 hover:bg-red-600 px-4 py-1.5 text-sm font-medium"
          onClick={onDelete}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
