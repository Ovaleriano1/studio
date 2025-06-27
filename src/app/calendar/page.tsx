import { AppSidebar } from '@/components/layout/sidebar';
import { AppHeader } from '@/components/layout/header';
import { SidebarProvider, Sidebar, SidebarInset, SidebarRail } from '@/components/ui/sidebar';
import { TechnicianCalendar } from '@/components/technician-calendar';
import { getReports } from '@/app/actions';
import { isValid } from 'date-fns';

export default async function CalendarPage({ searchParams }: { searchParams?: { date?: string } }) {
  const allReports = await getReports();
  const programmedVisits = allReports
    .filter(report => report.formType === 'Visita Programada' && report.scheduledDate)
    .map(report => ({
        ...report,
        // Ensure scheduledDate is a Date object before passing, although it will be serialized
        scheduledDate: new Date(report.scheduledDate)
    }));
  
  let initialDate: Date | undefined;
  if (searchParams?.date) {
    const parsedDate = new Date(searchParams.date);
    if (isValid(parsedDate)) {
      initialDate = parsedDate;
    }
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <AppHeader title="Calendario de Citas" />
        <main className="p-4 lg:p-6">
          <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
             <TechnicianCalendar initialAppointments={programmedVisits} initialDate={initialDate} />
          </div>
        </main>
      </SidebarInset>
      <SidebarRail />
    </SidebarProvider>
  );
}
