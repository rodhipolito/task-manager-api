import Badge from "./Badge";
import Button from "./Button";

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
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
  const statusColor =
    ticket.status === "Open"
      ? "blue"
      : ticket.status === "InProgress"
      ? "yellow"
      : ticket.status === "Resolved"
      ? "green"
      : "gray";

  const priorityColor =
    ticket.priority === "High"
      ? "red"
      : ticket.priority === "Medium"
      ? "yellow"
      : "blue";

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 shadow border border-gray-200 dark:border-gray-700 flex flex-col gap-2">
      <h3 className="text-lg font-semibold">{ticket.title}</h3>
      <p className="text-sm text-gray-500">{ticket.description}</p>

      <div className="flex gap-2">
        <Badge text={ticket.status} color={statusColor} />
        <Badge text={ticket.priority} color={priorityColor} />
      </div>

      <div className="flex justify-end gap-2 mt-3">
        <Button className="bg-yellow-500 hover:bg-yellow-600 px-3" onClick={onEdit}>
          Edit
        </Button>
        <Button className="bg-red-500 hover:bg-red-600 px-3" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}
