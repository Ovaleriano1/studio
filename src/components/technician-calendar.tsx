'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { format, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import type { VariantProps } from 'class-variance-authority';
import { badgeVariants } from './ui/badge';

// A generic event structure for the calendar
export interface CalendarEvent {
    id: string;
    date: string; // ISO String
    title: string;
    type: string;
    details: Record<string, string>;
}

interface ProcessedCalendarEvent extends Omit<CalendarEvent, 'date'> {
    date: Date;
}

interface TechnicianCalendarProps {
    events: CalendarEvent[];
}

export function TechnicianCalendar({ events: rawEvents = [] }: TechnicianCalendarProps) {
    const events: ProcessedCalendarEvent[] = useMemo(() => 
        rawEvents.map(e => ({...e, date: parseISO(e.date)})), 
        [rawEvents]
    );

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    const eventDates = useMemo(() => events.map(event => event.date), [events]);

    const selectedDayEvents = useMemo(() => {
        if (!selectedDate) return [];
        return events.filter(
            (event) => isSameDay(event.date, selectedDate)
        ).sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [events, selectedDate]);

    const dayWithAppointmentStyle = {
        backgroundColor: 'hsl(var(--accent))',
        color: 'hsl(var(--accent-foreground))',
        borderRadius: '0.25rem',
    };
    
    const getEventTypeVariant = (type: string): VariantProps<typeof badgeVariants>["variant"] => {
        switch (type) {
            case 'Visita Programada':
                return 'default';
            case 'Próximo Servicio':
                return 'secondary';
            case 'Inspección':
                return 'outline';
            case 'Mantenimiento':
                return 'outline';
             case 'Orden de Trabajo':
                return 'destructive';
            default:
                return 'secondary';
        }
    }

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
                        hasEvent: eventDates
                    }}
                    modifiersStyles={{
                        hasEvent: dayWithAppointmentStyle,
                    }}
                />
            </Card>

            <Card className="md:col-span-1 lg:col-span-2">
                <CardHeader>
                    <CardTitle>
                        Eventos para {selectedDate ? format(selectedDate, 'PPP', { locale: es }) : 'el día seleccionado'}
                    </CardTitle>
                    <CardDescription>
                        {selectedDayEvents.length > 0 
                            ? `Usted tiene ${selectedDayEvents.length} evento(s) programado(s).` 
                            : 'No hay eventos programados para este día.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[400px]">
                        <div className="space-y-4 pr-4">
                            {selectedDayEvents.length > 0 ? (
                                selectedDayEvents.map(event => (
                                    <div key={event.id} className="p-4 border rounded-lg shadow-sm bg-card">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-primary">{event.title}</h3>
                                            <Badge variant={getEventTypeVariant(event.type)}>{event.type}</Badge>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            {Object.entries(event.details).map(([key, value]) => (
                                                value && (
                                                    <div key={key} className="flex">
                                                        <span className="font-medium w-32 shrink-0">{key}:</span>
                                                        <span className="text-muted-foreground">{value}</span>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                        <p className="text-right font-semibold text-xs mt-2">{format(event.date, 'p', { locale: es })}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-center text-muted-foreground py-8">Seleccione un día del calendario para ver los eventos.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
