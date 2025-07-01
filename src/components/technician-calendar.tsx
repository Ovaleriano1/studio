
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { format, isSameDay, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { ScrollArea } from './ui/scroll-area';
import { Badge, badgeVariants } from './ui/badge';
import type { VariantProps } from 'class-variance-authority';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, DialogClose } from './ui/dialog';
import { ProgrammedVisitForm } from '@/components/forms/programmed-visit-form';
import { PlusCircle, RefreshCw, Edit, Trash2, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/context/user-profile-context';
import { useToast } from '@/hooks/use-toast';
import { updateReport, deleteReport } from '@/app/actions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

// A generic event structure for the calendar
export interface CalendarEvent {
    id: string; // Unique key for the event
    reportId: string; // The ID of the source report
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
    allReports: any[];
}

const keyTranslations: { [key: string]: string } = {
    reportName: 'Nombre del Reporte', submittedBy: 'Enviado Por', location: 'Ubicación', details: 'Detalles',
    createdAt: 'Fecha de Creación', technicianName: 'Nombre del Técnico', date: 'Fecha', equipmentId: 'ID del Equipo',
    clientName: 'Nombre del Cliente', workPerformed: 'Trabajo Realizado', notes: 'Notas', status: 'Estado',
    workOrderNumber: 'Número de Orden de Trabajo', partsUsed: 'Repuestos Utilizados', hoursOnMachine: 'Horas en Máquina',
    serviceType: 'Tipo de Servicio', fluidCheck: 'Revisión de Fluidos', tirePressure: 'Presión de Neumáticos',
    nextServiceDate: 'Fecha Próximo Servicio', safetyCheckPassed: 'Verificación de Seguridad Aprobada', inspectorName: 'Nombre del Inspector',
    overallCondition: 'Condición General', fluidLevels: 'Niveles de Fluido', brakeSystem: 'Sistema de Frenos',
    hydraulicSystem: 'Sistema Hidráulico', electricalSystem: 'Sistema Eléctrico', tireCondition: 'Condición de Neumáticos',
    attachmentsCondition: 'Condición de Accesorios', safetyEquipment: 'Equipo de Seguridad OK', passedInspection: 'Inspección Aprobada',
    laborHours: 'Horas de Trabajo', symptoms: 'Síntomas Reportados', problemDescription: 'Descripción del Problema / Trabajo',
    diagnosticSteps: 'Pasos de Diagnóstico', testingNotes: 'Notas de Pruebas', finalStatus: 'Estado Final',
    repairCompleted: 'Reparación Completada', followUpRequired: 'Requiere Seguimiento', reportedBy: 'Reportado Por',
    issueDescription: 'Descripción del Problema', assignedTechnician: 'Técnico Asignado', priority: 'Prioridad',
    estimatedHours: 'Horas Estimadas', requiredParts: 'Repuestos Requeridos', scheduledDate: 'Fecha Programada',
    contactPerson: 'Persona de Contacto', contactPhone: 'Teléfono de Contacto', visitPurpose: 'Propósito de la Visita',
    customerName: 'Nombre del Cliente', productModel: 'Modelo del Producto', serialNumber: 'Número de Serie',
    purchaseDate: 'Fecha de Compra', failureDate: 'Fecha de Falla', hoursAtFailure: 'Horas en Falla',
    dealerName: 'Nombre del Distribuidor', invoiceNumber: 'Número de Factura', partNumberFailed: 'Nº de Parte Fallada',
    partNumberReplaced: 'Nº de Parte Reemplazada', claimType: 'Tipo de Reclamo', claimStatus: 'Estado del Reclamo',
    claimDescription: 'Descripción del Reclamo', technicianNotes: 'Notas del Técnico', reportDate: 'Fecha del Reporte',
    siteLocation: 'Ubicación del Sitio', fireExtinguisherCheck: 'Revisión Extintor', firstAidKitCheck: 'Revisión Botiquín',
    emergencyStopCheck: 'Revisión Parada de Emergencia', ppeComplianceNotes: 'Notas de EPP', overallSafetyRating: 'Calificación de Seguridad',
    sampleDate: 'Fecha de Muestra', fluidType: 'Tipo de Fluido', sampleId: 'ID de Muestra',
    viscosityLevel: 'Nivel de Viscosidad', contaminationLevel: 'Nivel de Contaminación', analysisSummary: 'Resumen de Análisis',
    actionRequired: 'Acción Requerida', rentalStartDate: 'Inicio de Alquiler', rentalEndDate: 'Fin de Alquiler',
    dailyRate: 'Tarifa Diaria ($)', insuranceProvider: 'Proveedor de Seguros', deliveryAddress: 'Dirección de Entrega',
    operatorName: 'Nombre del Operador', termsAccepted: 'Términos Aceptados'
};

export function TechnicianCalendar({ events: rawEvents = [], allReports = [] }: TechnicianCalendarProps) {
    const router = useRouter();
    const { toast } = useToast();
    const { profile } = useUserProfile();

    const canEdit = profile.role === 'admin' || profile.role === 'superuser' || profile.role === 'supervisor';
    const canDelete = profile.role === 'admin' || profile.role === 'superuser';
    
    const events: ProcessedCalendarEvent[] = useMemo(() => 
        rawEvents.map(e => ({...e, date: parseISO(e.date)})), 
        [rawEvents]
    );

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    
    // State for the details/edit dialog
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<any | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState<any | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

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
            case 'Visita Programada': return 'default';
            case 'Próximo Servicio': return 'secondary';
            case 'Inspección': return 'outline';
            case 'Mantenimiento': return 'outline';
            case 'Orden de Trabajo': return 'destructive';
            default: return 'secondary';
        }
    }

    const handleSuccess = () => {
        setIsAddDialogOpen(false);
        router.refresh();
    };
    
    // --- Handlers for Details/Edit/Delete Dialog ---
    const handleViewDetails = (reportId: string) => {
        const report = allReports.find(r => r.id === reportId);
        if (report) {
            setSelectedReport(report);
            setEditedData({ ...report });
            setIsDetailDialogOpen(true);
            setIsEditing(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        if (selectedReport) {
            setEditedData({ ...selectedReport });
        }
    };

    const handleSave = async () => {
        if (!editedData) return;
        setIsSaving(true);
        try {
            await updateReport(editedData);
            toast({ title: '¡Éxito!', description: 'El reporte ha sido actualizado.' });
            setIsEditing(false);
            setIsDetailDialogOpen(false);
            router.refresh();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error.';
            toast({ variant: 'destructive', title: 'Error', description: errorMessage });
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedReport) return;
        setIsDeleting(true);
        try {
            await deleteReport(selectedReport.id);
            toast({ title: '¡Éxito!', description: `El reporte ${selectedReport.id} ha sido eliminado.` });
            setIsDetailDialogOpen(false);
            router.refresh();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error.';
            toast({ variant: 'destructive', title: 'Error', description: errorMessage });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleInputChange = (key: string, value: string) => {
        setEditedData((prev: any) => ({ ...prev, [key]: value }));
    };

    const renderDetailValue = (key: string, value: any) => {
        if (typeof value === 'string') {
            const potentialDate = new Date(value);
            if (isValid(potentialDate) && value.includes('T') && value.includes('Z')) {
               return format(potentialDate, 'PPP p', { locale: es });
            }
        }
        if (typeof value === 'boolean') {
            return value ? 'Sí' : 'No';
        }
        return String(value);
    }
    
    const isLocked = ['Completado', 'Cancelado'].includes(selectedReport?.status);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="md:col-span-1 lg:col-span-1 flex justify-center items-start">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="p-3"
                    locale={es}
                    modifiers={{ hasEvent: eventDates }}
                    modifiersStyles={{ hasEvent: dayWithAppointmentStyle }}
                />
            </Card>

            <Card className="md:col-span-1 lg:col-span-2">
                <CardHeader className="flex flex-row justify-between items-center">
                    <div>
                        <CardTitle>
                            Eventos para {selectedDate ? format(selectedDate, 'PPP', { locale: es }) : 'el día seleccionado'}
                        </CardTitle>
                        <CardDescription>
                            {selectedDayEvents.length > 0 
                                ? `Usted tiene ${selectedDayEvents.length} evento(s) programado(s).` 
                                : 'No hay eventos programados para este día.'}
                        </CardDescription>
                    </div>
                     <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                           <Button>
                               <PlusCircle className="mr-2 h-4 w-4" />
                               Programar Visita
                           </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[800px]">
                            <DialogHeader>
                               <DialogTitle>Programar Nueva Visita</DialogTitle>
                               <DialogDescription>
                                   Complete el formulario para agregar un nuevo evento al calendario. La fecha seleccionada será utilizada.
                               </DialogDescription>
                            </DialogHeader>
                            <ProgrammedVisitForm defaultDate={selectedDate} onSuccess={handleSuccess} />
                        </DialogContent>
                    </Dialog>
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
                                        <div className="flex justify-between items-center mt-2">
                                            <p className="text-right font-semibold text-xs">{format(event.date, 'p', { locale: es })}</p>
                                            <Button variant="outline" size="sm" onClick={() => handleViewDetails(event.reportId)}>Ver Detalles</Button>
                                        </div>
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

            <Dialog open={isDetailDialogOpen} onOpenChange={(open) => {
              if (!open) { setIsEditing(false); }
              setIsDetailDialogOpen(open);
            }}>
                <DialogContent className="sm:max-w-[600px]">
                   {selectedReport && (
                    <>
                      <DialogHeader>
                        <DialogTitle>Detalles del Reporte: {selectedReport.id}</DialogTitle>
                        <DialogDescription>
                          Formulario: {selectedReport.formType} - Creado el: {format(new Date(selectedReport.createdAt), 'PPP p', { locale: es })}
                        </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="max-h-[60vh] pr-4">
                        <div className="grid gap-4 py-4">
                          {Object.entries(editedData || {}).map(([key, value]) => {
                            if (key === 'id' || key === 'formType' || key === 'createdAt') return null;
                            
                            const displayKey = keyTranslations[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
                            
                            if (isEditing) {
                                const isUneditable = typeof value === 'boolean' || (typeof value === 'string' && isValid(new Date(value)) && value.includes('T'));
                                const isLongText = typeof value === 'string' && value.length > 50;

                                return (
                                    <div key={key} className="grid grid-cols-1 gap-2 py-2 border-b last:border-b-0">
                                        <Label htmlFor={key} className="font-semibold">{displayKey}</Label>
                                        {isUneditable ? (
                                            <p className="text-sm text-muted-foreground break-words min-h-[40px] flex items-center">{renderDetailValue(key, value)}</p>
                                        ) : isLongText ? (
                                            <Textarea
                                                id={key}
                                                value={String(value ?? '')}
                                                onChange={(e) => handleInputChange(key, e.target.value)}
                                                className="min-h-[80px]"
                                            />
                                        ) : (
                                            <Input
                                                id={key}
                                                value={String(value ?? '')}
                                                onChange={(e) => handleInputChange(key, e.target.value)}
                                            />
                                        )}
                                    </div>
                                )
                            }

                            return (
                              <div key={key} className="grid grid-cols-2 gap-4 py-2 border-b last:border-b-0">
                                <p className="font-semibold">{displayKey}</p>
                                <p className="text-muted-foreground break-words justify-self-end text-right">{renderDetailValue(key, value)}</p>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                      <DialogFooter>
                        {isEditing ? (
                          <div className="flex w-full justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={handleCancelEdit}>Cancelar</Button>
                            <Button type="button" onClick={handleSave} disabled={isSaving}>
                              {isSaving && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                              Guardar Cambios
                            </Button>
                          </div>
                        ) : (
                          <div className="flex w-full justify-between items-center">
                            <div className="flex items-center gap-2">
                              {canEdit && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                        <span tabIndex={isLocked ? 0 : -1} className={isLocked ? 'cursor-not-allowed' : ''}>
                                            <Button type="button" variant="outline" onClick={() => setIsEditing(true)} disabled={isLocked} className="w-full">
                                                <Edit className="mr-2 h-4 w-4" /> Editar
                                            </Button>
                                        </span>
                                        </TooltipTrigger>
                                        {isLocked && <TooltipContent><p>Los reportes completados o cancelados no se pueden editar.</p></TooltipContent>}
                                    </Tooltip>
                                </TooltipProvider>
                              )}
                              {canDelete && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                        <span tabIndex={isLocked ? 0 : -1} className={isLocked ? 'cursor-not-allowed' : ''}>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" disabled={isLocked}>
                                                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader><AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer. Esto eliminará permanentemente el reporte.</AlertDialogDescription></AlertDialogHeader>
                                                    <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting}>{isDeleting ? (<><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Eliminando...</>) : 'Continuar'}</AlertDialogAction></AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </span>
                                        </TooltipTrigger>
                                        {isLocked && <TooltipContent><p>Los reportes completados o cancelados no se pueden eliminar.</p></TooltipContent>}
                                    </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                            <DialogClose asChild><Button type="button" variant="secondary">Cerrar</Button></DialogClose>
                          </div>
                        )}
                      </DialogFooter>
                    </>
                  )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
