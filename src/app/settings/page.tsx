import { AppSidebar } from '@/components/layout/sidebar';
import { AppHeader } from '@/components/layout/header';
import { SidebarProvider, Sidebar, SidebarInset, SidebarRail } from '@/components/ui/sidebar';
import { SettingsView } from '@/components/settings-view';

export default function SettingsPage() {
  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <AppHeader title="Configuración" />
        <main className="p-4 lg:p-6">
          <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
            <SettingsView />
          </div>
        </main>
      </SidebarInset>
      <SidebarRail />
    </SidebarProvider>
  );
}
