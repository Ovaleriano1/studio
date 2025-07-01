import { AppSidebar } from '@/components/layout/sidebar';
import { AppHeader } from '@/components/layout/header';
import { SidebarProvider, Sidebar, SidebarInset, SidebarRail } from '@/components/ui/sidebar';
import { TechnicianCalendar, type CalendarEvent } from '@/components/technician-calendar';
import { getReports } from '@/app/actions';

export default async function CalendarPage() {
  const allReports = await getReports();
  
  const calendarEvents: CalendarEvent[] = [];

  allReports.forEach(report => {
    switch (report.formType) {
        case 'Visita Programada':
            if (report.scheduledDate) {
                calendarEvents.push({
                    id: report.id,
                    reportId: report.id,
                    date: report.scheduledDate,
                    title: report.clientName,
                    type: 'Visita Programada',
                    details: {
                        'Propósito': report.visitPurpose,
                        'Ubicación': report.location,
                        'Equipo': report.equipmentId,
                        'Técnico': report.assignedTechnician,
                    }
                });
            }
            break;
        case 'Reporte de Mantenimiento':
            if (report.date) {
                 calendarEvents.push({
                    id: `${report.id}-service`,
                    reportId: report.id,
                    date: report.date,
                    title: `Mantenimiento: ${report.equipmentId}`,
                    type: 'Mantenimiento',
                    details: {
                        'Cliente': report.clientName,
                        'Técnico': report.technicianName,
                    }
                });
            }
            if (report.nextServiceDate) {
                 calendarEvents.push({
                    id: `${report.id}-next-service`,
                    reportId: report.id,
                    date: report.nextServiceDate,
                    title: `Próximo Servicio: ${report.equipmentId}`,
                    type: 'Próximo Servicio',
                    details: {
                        'Cliente': report.clientName,
                        'Técnico': report.technicianName,
                    }
                });
            }
            break;
        case 'Reporte de Inspección':
            if (report.date) {
                calendarEvents.push({
                    id: report.id,
                    reportId: report.id,
                    date: report.date,
                    title: `Inspección: ${report.equipmentId}`,
                    type: 'Inspección',
                    details: {
                        'Ubicación': report.location,
                        'Inspector': report.inspectorName,
                    }
                });
            }
            break;
        case 'Orden de Trabajo':
             if (report.date) {
                calendarEvents.push({
                    id: report.id,
                    reportId: report.id,
                    date: report.date,
                    title: `Orden de Trabajo: ${report.equipmentId}`,
                    type: 'Orden de Trabajo',
                    details: {
                        'Cliente': report.clientName,
                        'Técnico Asignado': report.assignedTechnician,
                        'Prioridad': report.priority,
                    }
                });
            }
            break;
    }
  });

  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <AppHeader title="Calendario de Citas" />
        <main className="p-4 lg:p-6">
          <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
             <TechnicianCalendar events={calendarEvents} allReports={allReports} />
          </div>
        </main>
      </SidebarInset>
      <SidebarRail />
    </SidebarProvider>
  );
}
