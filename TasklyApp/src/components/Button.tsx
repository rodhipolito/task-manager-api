export default function Button({
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-xl font-medium transition-colors
        bg-primary text-white hover:bg-primary-light
        disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    />
  );
}
