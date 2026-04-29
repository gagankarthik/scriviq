import { SidebarProvider } from "@/components/layout/SidebarContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { getPendingAlerts } from "@/lib/mock-data";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pendingAlertCount = getPendingAlerts().length;

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-[#0A0F1E]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopNav pendingAlertCount={pendingAlertCount} />
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
