import { AppSidebar } from '@/components/layout/sidebar';
import { AppHeader } from '@/components/layout/header';
import { SidebarProvider, Sidebar, SidebarInset, SidebarRail } from '@/components/ui/sidebar';
import { TechnicianCalendar } from '@/components/technician-calendar';
import { getReports } from '@/app/actions';

export default async function CalendarPage() {
  const allReports = await getReports();
  const programmedVisits = allReports
    .filter(report => report.formType === 'Visita Programada' && report.scheduledDate)
    .map(report => ({
        id: report.id,
        clientName: report.clientName,
        location: report.location,
        scheduledDate: report.scheduledDate, // Keep as ISO string
        visitPurpose: report.visitPurpose,
        assignedTechnician: report.assignedTechnician,
        equipmentId: report.equipmentId,
    }));

  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <AppHeader title="Calendario de Citas" />
        <main className="p-4 lg:p-6">
          <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
             <TechnicianCalendar appointments={programmedVisits} />
          </div>
        </main>
      </SidebarInset>
      <SidebarRail />
    </SidebarProvider>
  );
}
