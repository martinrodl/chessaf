export default function CTA({
  href,
  children,
}: {
  href: string;
  children: string;
}) {
  return (
    <a
      href={href}
      className="inline-flex rounded-md px-4 py-2 bg-emerald-600 text-white hover:opacity-90"
    >
      {children}
    </a>
  );
}
