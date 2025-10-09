export default function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`border rounded-lg px-3 py-2 w-full bg-white dark:bg-neutral-800 
        border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none`}
    />
  );
}
