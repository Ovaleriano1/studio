import { AppSidebar } from '@/components/layout/sidebar';
import { AppHeader } from '@/components/layout/header';
import { SidebarProvider, Sidebar, SidebarInset, SidebarRail } from '@/components/ui/sidebar';
import { Dashboard } from '@/components/dashboard';
import { getReports } from '@/app/actions';

export default async function Home() {
  const allReports = await getReports();
  const recentReports = allReports
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <AppHeader title="Dashboard" />
        <main className="p-4 lg:p-6">
          <Dashboard reports={recentReports} />
        </main>
      </SidebarInset>
      <SidebarRail />
    </SidebarProvider>
  );
}
