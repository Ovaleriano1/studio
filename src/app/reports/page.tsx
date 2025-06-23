import { AppSidebar } from '@/components/layout/sidebar';
import { AppHeader } from '@/components/layout/header';
import { SidebarProvider, Sidebar, SidebarInset, SidebarRail } from '@/components/ui/sidebar';
import { ReportsDisplay } from '@/components/reports-display';

export default function ReportsPage() {
  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <AppHeader title="Reportes" />
        <main className="p-4 lg:p-6">
          <ReportsDisplay />
        </main>
      </SidebarInset>
      <SidebarRail />
    </SidebarProvider>
  );
}
