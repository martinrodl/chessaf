import "./globals.css";
export const metadata = { title: "Chess Affiliate" };
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <body className="prose max-w-none">{children}</body>
    </html>
  );
}
