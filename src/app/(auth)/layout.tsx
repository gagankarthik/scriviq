export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 py-12 bg-[var(--surface-base)]"
      style={{
        backgroundImage: "radial-gradient(circle, var(--surface-subtle) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      {/* Ambient glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none opacity-20 dark:opacity-20"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, #0072E5 0%, transparent 65%)",
          filter: "blur(80px)",
        }}
      />
      <div className="relative w-full max-w-sm">{children}</div>
    </div>
  );
}
