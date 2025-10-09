import { create } from "zustand";
import api from "../api";

export type Ticket = {
  id: string;
  title: string;
  description?: string;
  status: "Open" | "InProgress" | "Resolved" | "Closed";
  priority: "Low" | "Medium" | "High";
  createdAt: string;
};

type State = {
  tickets: Ticket[];
  fetchTickets: () => Promise<void>;
  createTicket: (p: Partial<Ticket>) => Promise<void>;
};

export const useTicketsStore = create<State>((set) => ({
  tickets: [],
  fetchTickets: async () => {
    const { data } = await api.get("/tickets");
    set({ tickets: data });
  },
  createTicket: async (p) => {
    await api.post("/tickets", {
      title: p.title,
      description: p.description,
      priority: p.priority ?? "Medium",
      status: p.status ?? "Open",
      assignedToId: null
    });
    const { data } = await api.get("/tickets");
    set({ tickets: data });
  }
}));
