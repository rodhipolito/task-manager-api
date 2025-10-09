import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth";
import Input from "../components/Input";
import Button from "../components/Button";

export default function Register(){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Client");
  const nav = useNavigate();
  const { register } = useAuth();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(email, password, role);
    nav("/dashboard");
  };

  return (
    <div className="grid place-items-center h-screen">
      <form onSubmit={submit} className="w-80 space-y-3">
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <Input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <select className="border rounded-xl px-3 py-2 w-full" value={role} onChange={e => setRole(e.target.value)}>
          <option>Client</option>
          <option>Agent</option>
          <option>Admin</option>
        </select>
        <Button type="submit">Create Account</Button>
      </form>
    </div>
  );
}