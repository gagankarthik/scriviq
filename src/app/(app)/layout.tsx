import { redirect } from "next/navigation";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { getSession } from "@/lib/auth/session";
import { dbListAlerts } from "@/lib/aws/contracts";

async function getPendingCount(workspace: string): Promise<number> {
  try {
    const alerts = await dbListAlerts(workspace, { status: "pending" });
    return alerts.length;
  } catch {
    return 0;
  }
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const pendingAlertCount = await getPendingCount(session.workspace);

  const user = {
    name:  session.name,
    email: session.email,
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-[var(--surface-base)]">
        <Sidebar user={user} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopNav user={user} pendingAlertCount={pendingAlertCount} />
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-auto mx-auto px-4 sm:px-6 py-4 sm:py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
