export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-muted py-10">
      <div className="container max-w-md">{children}</div>
    </main>
  );
}
