'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ScrollArea } from './ui/scroll-area';

// The raw data from server actions
interface RawProgrammedVisit {
    id: string;
    clientName: string;
    location: string;
    scheduledDate: string; // ISO String
    visitPurpose: string;
    assignedTechnician: string;
    equipmentId: string;
}

// The processed data with Date objects
interface ProcessedProgrammedVisit extends Omit<RawProgrammedVisit, 'scheduledDate'> {
    scheduledDate: Date;
}

interface TechnicianCalendarProps {
    appointments: RawProgrammedVisit[];
}

export function TechnicianCalendar({ appointments: rawAppointments = [] }: TechnicianCalendarProps) {
    // 1. Process raw appointments to convert date strings to Date objects
    const appointments: ProcessedProgrammedVisit[] = useMemo(() => 
        rawAppointments.map(a => ({...a, scheduledDate: new Date(a.scheduledDate)})), 
        [rawAppointments]
    );

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    // 2. Get a list of dates that have appointments for highlighting
    const appointmentDates = useMemo(() => appointments.map(app => app.scheduledDate), [appointments]);

    // 3. Filter appointments for the currently selected day
    const selectedDayAppointments = useMemo(() => {
        if (!selectedDate) return [];
        return appointments.filter(
            (appointment) => isSameDay(appointment.scheduledDate, selectedDate)
        ).sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());
    }, [appointments, selectedDate]);

    // 4. A more prominent style for highlighting
    const dayWithAppointmentStyle = {
        backgroundColor: 'hsl(var(--accent))',
        color: 'hsl(var(--accent-foreground))',
        borderRadius: '0.25rem',
    };

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
                        appointment: dayWithAppointmentStyle,
                    }}
                />
            </Card>

            <Card className="md:col-span-1 lg:col-span-2">
                <CardHeader>
                    <CardTitle>
                        Citas para {selectedDate ? format(selectedDate, 'PPP', { locale: es }) : 'el día seleccionado'}
                    </CardTitle>
                    <CardDescription>
                        {selectedDayAppointments.length > 0 
                            ? `Usted tiene ${selectedDayAppointments.length} cita(s) programada(s).` 
                            : 'No hay citas programadas para este día.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[400px]">
                        <div className="space-y-4 pr-4">
                            {selectedDayAppointments.length > 0 ? (
                                selectedDayAppointments.map(app => (
                                    <div key={app.id} className="p-4 border rounded-lg shadow-sm bg-card">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-primary">{app.clientName}</h3>
                                                <p className="text-sm text-muted-foreground">{app.location}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-sm">{format(app.scheduledDate, 'p', { locale: es })}</p>
                                                <p className="text-xs text-muted-foreground font-code">{app.equipmentId}</p>
                                            </div>
                                        </div>
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
                </CardContent>
            </Card>
        </div>
    );
}
