import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import Input from "../components/Input";
import Button from "../components/Button";

// Define os tipos
interface Comment {
  id: number;
  content: string;
  createdAt?: string;
  createdBy?: string;
}

interface Ticket {
  id: number;
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  status: "Open" | "InProgress" | "Resolved";
  createdAt?: string;
  updatedAt?: string;
  comments?: Comment[];
}

export default function TicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    api.get<Ticket>(`/tickets/${id}`).then(r => setTicket(r.data));
  }, [id]);

  const addComment = async () => {
    if (!comment.trim()) return;
    
    await api.post(`/tickets/${id}/comments`, { content: comment });
    const { data } = await api.get<Ticket>(`/tickets/${id}`);
    setTicket(data);
    setComment("");
  }

  if (!ticket) return <div className="p-6">Loading...</div>;

  return (
    <div className="ml-64 p-6 space-y-4">
      <h2 className="text-2xl font-bold">{ticket.title}</h2>
      <p>{ticket.description}</p>
      <div className="opacity-80 text-sm">{ticket.status} · {ticket.priority}</div>

      <div className="space-y-2">
        <h3 className="font-semibold">Comments</h3>
        <ul className="space-y-1">
          {ticket.comments?.map((c) => (
            <li key={c.id} className="border rounded px-2 py-1 text-sm">{c.content}</li>
          ))}
        </ul>
        <div className="flex gap-2">
          <Input 
            placeholder="New comment" 
            value={comment} 
            onChange={e => setComment(e.target.value)} 
          />
          <Button onClick={addComment}>Send</Button>
        </div>
      </div>
    </div>
  );
}