import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Ticket } from "lucide-react";

export default function Sidebar() {
  const { pathname } = useLocation();
  const linkClass = (path: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      pathname === path
        ? "bg-primary text-white shadow-sm"
        : "text-gray-600 hover:bg-gray-100 dark:hover:bg-neutral-800"
    }`;

  return (
    <aside className="w-64 h-screen bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-gray-700 p-4 fixed flex flex-col">
      <h1 className="text-2xl font-bold mb-6 text-primary px-4">Taskly</h1>
      <nav className="space-y-2 flex-1">
        <Link to="/dashboard" className={linkClass("/dashboard")}>
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </Link>
        <Link to="/tickets" className={linkClass("/tickets")}>
          <Ticket className="w-5 h-5" />
          Tickets
        </Link>
      </nav>
    </aside>
  );
}
