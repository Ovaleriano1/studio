import { AppSidebar } from '@/components/layout/sidebar';
import { AppHeader } from '@/components/layout/header';
import { SidebarProvider, Sidebar, SidebarInset, SidebarRail } from '@/components/ui/sidebar';
import { MaintenanceForm } from '@/components/forms/maintenance-form';

export default function MaintenancePage() {
  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <AppHeader title="Formulario de Mantenimiento" />
        <main className="p-4 lg:p-6">
          <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
            <MaintenanceForm />
          </div>
        </main>
      </SidebarInset>
      <SidebarRail />
    </SidebarProvider>
  );
}
