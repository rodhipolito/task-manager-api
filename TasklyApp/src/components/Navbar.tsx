import { useAuth } from "../useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex justify-between items-center px-6 py-3 border-b bg-white dark:bg-neutral-900 border-gray-200 dark:border-gray-700">
      <h1 className="text-2xl font-bold text-primary">Taskly</h1>
      <div className="flex items-center gap-3">
        {user ? (
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {user.email} <span className="opacity-70">({user.role})</span>
          </span>
        ) : (
          <span className="text-sm text-gray-400 italic">Loading...</span>
        )}
        <button
          onClick={logout}
          className="bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 px-3 py-1 rounded-lg"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
