export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl shadow-sm hover:shadow-md p-6 
      bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-700
      transition-all duration-200 ease-in-out">
      {children}
    </div>
  );
}
