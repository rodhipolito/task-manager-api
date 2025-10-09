export default function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-xl shadow-lg">
      {message}
    </div>
  );
}
