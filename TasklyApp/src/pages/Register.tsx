// src/pages/Register.tsx
import { Link } from "react-router-dom";

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow p-6 text-center">
        <h1 className="text-2xl font-semibold mb-2">Registo desativado</h1>
        <p className="text-gray-600 mb-6">
          O registo de novos utilizadores está temporariamente desativado.
        </p>
        <Link
          to="/login"
          className="inline-block rounded-xl px-4 py-2 border border-gray-300 hover:bg-gray-100"
        >
          Ir para o Login
        </Link>
      </div>
    </div>
  );
}
