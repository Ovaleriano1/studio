'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { getReports } from '@/app/actions';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from './ui/skeleton';
import { ScrollArea } from './ui/scroll-area';

interface ProgrammedVisit {
    id: string;
    clientName: string;
    location: string;
    scheduledDate: Date;
    visitPurpose: string;
    assignedTechnician: string;
}

export function TechnicianCalendar() {
    const [appointments, setAppointments] = useState<ProgrammedVisit[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchAppointments() {
            try {
                const allReports = await getReports();
                const programmedVisits: ProgrammedVisit[] = allReports
                    .filter(report => report.formType === 'Visita Programada' && report.scheduledDate)
                    .map(report => ({
                        ...report,
                        scheduledDate: new Date(report.scheduledDate) 
                    }));
                setAppointments(programmedVisits);
            } catch (error) {
                console.error("Failed to fetch appointments", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchAppointments();
    }, []);

    const appointmentDates = useMemo(() => appointments.map(app => app.scheduledDate), [appointments]);

    const selectedDayAppointments = useMemo(() => {
        return appointments.filter(
            (appointment) => selectedDate && isSameDay(appointment.scheduledDate, selectedDate)
        );
    }, [appointments, selectedDate]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="md:col-span-1 lg:col-span-1 flex justify-center items-start">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="p-3"
                    locale={es}
                    modifiers={{
                        appointment: appointmentDates
                    }}
                    modifiersStyles={{
                        appointment: {
                            border: '2px solid hsl(var(--primary))',
                            borderRadius: '50%',
                        }
                    }}
                    disabled={isLoading}
                />
            </Card>

            <Card className="md:col-span-1 lg:col-span-2">
                <CardHeader>
                    <CardTitle>
                        Citas para {selectedDate ? format(selectedDate, 'PPP', { locale: es }) : 'el día seleccionado'}
                    </CardTitle>
                    <CardDescription>
                        {selectedDayAppointments.length > 0 ? `Usted tiene ${selectedDayAppointments.length} cita(s) programada(s).` : 'No hay citas programadas para este día.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <div className="space-y-4">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    ) : (
                        <ScrollArea className="h-[400px]">
                            <div className="space-y-4 pr-4">
                                {selectedDayAppointments.length > 0 ? (
                                    selectedDayAppointments.map(app => (
                                        <div key={app.id} className="p-4 border rounded-lg shadow-sm bg-background">
                                            <h3 className="font-semibold text-primary">{app.clientName}</h3>
                                            <p className="text-sm text-muted-foreground">{app.location}</p>
                                            <p className="text-sm mt-2">{app.visitPurpose}</p>
                                             <p className="text-xs text-muted-foreground mt-2">Técnico: {app.assignedTechnician}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-center text-muted-foreground py-8">Seleccione un día del calendario para ver las citas.</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
