
import { AppSidebar } from '@/components/layout/sidebar';
import { AppHeader } from '@/components/layout/header';
import { SidebarProvider, Sidebar, SidebarInset, SidebarRail } from '@/components/ui/sidebar';
import { StatusDashboard } from '@/components/status-dashboard';

export default function StatusPage() {
  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <AppHeader title="Gestión de Estados" />
        <main className="p-4 lg:p-6">
          <StatusDashboard />
        </main>
      </SidebarInset>
      <SidebarRail />
    </SidebarProvider>
  );
}
