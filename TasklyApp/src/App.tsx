import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import TicketDetail from "./pages/TicketDetail";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

function Protected({ children }: { children: React.ReactElement }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/dashboard" 
          element={
            <Protected>
              <Shell>
                <Dashboard />
              </Shell>
            </Protected>
          } 
        />
        <Route 
          path="/tickets" 
          element={
            <Protected>
              <Shell>
                <Tickets />
              </Shell>
            </Protected>
          } 
        />
        <Route 
          path="/tickets/:id" 
          element={
            <Protected>
              <Shell>
                <TicketDetail />
              </Shell>
            </Protected>
          } 
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
