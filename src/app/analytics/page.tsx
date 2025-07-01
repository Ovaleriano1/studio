
import { AppSidebar } from '@/components/layout/sidebar';
import { AppHeader } from '@/components/layout/header';
import { SidebarProvider, Sidebar, SidebarInset, SidebarRail } from '@/components/ui/sidebar';
import { AnalyticsDashboard } from '@/components/analytics-dashboard';
import { getReports } from '@/app/actions';

export default async function AnalyticsPage() {
  const reports = await getReports();

  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <AppHeader title="Análisis Gráfico" />
        <main className="p-4 lg:p-6">
          <AnalyticsDashboard reports={reports} />
        </main>
      </SidebarInset>
      <SidebarRail />
    </SidebarProvider>
  );
}
