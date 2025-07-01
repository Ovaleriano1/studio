import { AppSidebar } from '@/components/layout/sidebar';
import { AppHeader } from '@/components/layout/header';
import { SidebarProvider, Sidebar, SidebarInset, SidebarRail } from '@/components/ui/sidebar';
import { TroubleshootingAssistant } from '@/components/troubleshooting-assistant';

export default function TroubleshootPage() {
  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <AppHeader title="Asistente de Diagnóstico con IA" />
        <main className="p-4 lg:p-6">
          <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
             <TroubleshootingAssistant />
          </div>
        </main>
      </SidebarInset>
      <SidebarRail />
    </SidebarProvider>
  );
}
