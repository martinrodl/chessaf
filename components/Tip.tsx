export default function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 rounded-md border p-3 bg-gray-50">{children}</div>
  );
}
