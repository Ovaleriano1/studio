
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { getReports, updateReport, deleteReport } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { format, isValid, isAfter, isBefore, isEqual, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { ScrollArea } from './ui/scroll-area';
import { RefreshCw, Edit, Trash2, Download, Filter, X, Calendar as CalendarIcon } from 'lucide-react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useUserProfile } from '@/context/user-profile-context';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { Calendar } from './ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { type DateRange } from 'react-day-picker';

export function ReportsDisplay() {
  const [reports, setReports] = useState<any[]>([]);
  const [filteredReports, setFilteredReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { profile } = useUserProfile();
  const canEdit = profile.role === 'admin' || profile.role === 'superuser' || profile.role === 'supervisor';
  const canDelete = profile.role === 'admin' || profile.role === 'superuser';
  const canFilter = profile.role === 'admin' || profile.role === 'supervisor';

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{
    formType: string;
    status: string;
    technician: string;
    dateRange?: DateRange;
  }>({
    formType: 'all',
    status: 'all',
    technician: 'all',
    dateRange: undefined,
  });

  const fetchReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedReports = await getReports();
      fetchedReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReports(fetchedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar los reportes.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);
  
  const uniqueFormTypes = useMemo(() => ['all', ...Array.from(new Set(reports.map(r => r.formType)))], [reports]);
  const uniqueTechnicians = useMemo(() => {
    const technicians = new Set<string>();
    reports.forEach(report => {
      const tech = report.technicianName || report.assignedTechnician || report.inspectorName || report.submittedBy;
      if (tech) technicians.add(tech);
    });
    return ['all', ...Array.from(technicians)];
  }, [reports]);
  const STATUS_OPTIONS = ['all', 'Pendiente', 'En Progreso', 'Esperando Repuestos', 'Completado', 'Cancelado'];

  useEffect(() => {
    let newFilteredReports = [...reports];

    if (searchQuery) {
        newFilteredReports = newFilteredReports.filter(report =>
            Object.values(report).some(value =>
                String(value).toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }

    if (filters.formType !== 'all') {
        newFilteredReports = newFilteredReports.filter(report => report.formType === filters.formType);
    }

    if (filters.status !== 'all') {
        newFilteredReports = newFilteredReports.filter(report => report.status === filters.status);
    }
    
    if (filters.technician !== 'all') {
        newFilteredReports = newFilteredReports.filter(report => {
            const tech = report.technicianName || report.assignedTechnician || report.inspectorName || report.submittedBy;
            return tech === filters.technician;
        });
    }

    if (filters.dateRange?.from) {
        newFilteredReports = newFilteredReports.filter(report => {
            const reportDate = parseISO(report.createdAt);
            if (!isValid(reportDate)) return false;
            
            const fromDate = new Date(filters.dateRange!.from!);
            const toDate = filters.dateRange!.to ? new Date(filters.dateRange!.to!) : null;

            fromDate.setHours(0, 0, 0, 0);

            if (toDate) {
                toDate.setHours(23, 59, 59, 999);
                return isAfter(reportDate, fromDate) && isBefore(reportDate, toDate);
            }
            const reportDay = new Date(reportDate);
            reportDay.setHours(0,0,0,0);
            return isEqual(reportDay, fromDate);
        });
    }

    setFilteredReports(newFilteredReports);
  }, [searchQuery, filters, reports]);

  const handleFilterChange = (filterName: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      formType: 'all',
      status: 'all',
      technician: 'all',
      dateRange: undefined,
    });
  };

  const handleViewDetails = (report: any) => {
    setSelectedReport(report);
    setEditedData({ ...report });
    setIsDialogOpen(true);
    setIsEditing(false);
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
      toast({
        title: '¡Éxito!',
        description: 'El reporte ha sido actualizado.',
      });
      setIsEditing(false);
      setIsDialogOpen(false);
      fetchReports();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error.';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleConfirmDelete = async () => {
    if (!selectedReport) return;
    setIsDeleting(true);
    try {
      await deleteReport(selectedReport.id);
      toast({
        title: '¡Éxito!',
        description: `El reporte ${selectedReport.id} ha sido eliminado.`,
      });
      setIsDialogOpen(false);
      fetchReports();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error.';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setEditedData((prev: any) => ({ ...prev, [key]: value }));
  };

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
        operatorName: 'Nombre del Operador', termsAccepted: 'Términos Aceptados', initialPhotoDataUri: 'Foto Inicial del Equipo',
        finalPhotoDataUri: 'Foto Final del Equipo', signatureDataUri: 'Firma del Cliente',
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
  
  const handleDownloadPdf = async () => {
    if (!selectedReport) return;
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(selectedReport.formType, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`ID del Reporte: ${selectedReport.id}`, 15, 35);
    const creationDate = format(new Date(selectedReport.createdAt), 'PPP p', { locale: es });
    doc.text(`Fecha de Creación: ${creationDate}`, 15, 42);
    doc.line(15, 48, 195, 48); // separator
    let yPos = 56;
    const leftMargin = 15;
    const valueXPos = 80;
    const pageHeight = doc.internal.pageSize.height;
    const bottomMargin = 15;
    const addField = (label: string, value: any) => {
        const labelWidth = valueXPos - leftMargin - 5;
        const valueWidth = doc.internal.pageSize.width - valueXPos - leftMargin;
        const valueIsImageData = typeof value === 'string' && value.startsWith('data:image');
        let valueLines = [];
        if (!valueIsImageData) { valueLines = doc.splitTextToSize(String(value), valueWidth); }
        const labelLines = doc.splitTextToSize(label, labelWidth);
        const lineHeight = Math.max(labelLines.length, valueIsImageData ? 0 : valueLines.length) * 6;
        const requiredHeight = valueIsImageData ? 50 : lineHeight;
        if (yPos + requiredHeight > pageHeight - bottomMargin) { doc.addPage(); yPos = 20; }
        doc.setFont('helvetica', 'bold');
        doc.text(label, leftMargin, yPos);
        if (valueIsImageData) {
            try {
                doc.addImage(value, 'PNG', valueXPos, yPos - 3, 40, 40);
                yPos += 45;
            } catch (e) {
                doc.setFont('helvetica', 'normal');
                doc.text('[Error al cargar imagen]', valueXPos, yPos);
                yPos += 10;
            }
        } else {
            doc.setFont('helvetica', 'normal');
            doc.text(valueLines, valueXPos, yPos);
            yPos += lineHeight + 4;
        }
    };
    for (const [key, value] of Object.entries(selectedReport)) {
        if (key === 'id' || key === 'formType' || key === 'createdAt' || value === null || value === undefined || value === '') continue;
        const label = (keyTranslations[key] || key) + ':';
        const formattedValue = key.endsWith('DataUri') ? value : renderDetailValue(key, value);
        addField(label, formattedValue);
    }
    doc.save(`reporte-${selectedReport.id}.pdf`);
  };

  const isLocked = ['Completado', 'Cancelado'].includes(selectedReport?.status);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
              <CardTitle>Reportes Enviados</CardTitle>
              <CardDescription>Una lista de todos los formularios que han sido enviados.</CardDescription>
          </div>
           <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={fetchReports} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="sr-only">Actualizar Reportes</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {canFilter && (
            <Accordion type="single" collapsible className="w-full mb-4 border rounded-lg px-4">
              <AccordionItem value="filters" className="border-b-0">
                  <AccordionTrigger>
                      <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          Filtros Avanzados y Búsqueda
                      </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                          <div className="lg:col-span-3 xl:col-span-5">
                              <Label htmlFor="search">Búsqueda Rápida</Label>
                              <Input
                                  id="search"
                                  placeholder="Buscar por ID, cliente, equipo..."
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                              />
                          </div>
                          <div>
                              <Label htmlFor="formType">Tipo de Formulario</Label>
                              <Select value={filters.formType} onValueChange={(value) => handleFilterChange('formType', value)}>
                                  <SelectTrigger id="formType"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                      {uniqueFormTypes.map(type => <SelectItem key={type} value={type}>{type === 'all' ? 'Todos' : type}</SelectItem>)}
                                  </SelectContent>
                              </Select>
                          </div>
                          <div>
                              <Label htmlFor="status">Estado</Label>
                              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                                  <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                      {STATUS_OPTIONS.map(status => <SelectItem key={status} value={status}>{status === 'all' ? 'Todos' : status}</SelectItem>)}
                                  </SelectContent>
                              </Select>
                          </div>
                          <div>
                              <Label htmlFor="technician">Técnico</Label>
                              <Select value={filters.technician} onValueChange={(value) => handleFilterChange('technician', value)}>
                                  <SelectTrigger id="technician"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                      {uniqueTechnicians.map(tech => <SelectItem key={tech} value={tech}>{tech === 'all' ? 'Todos' : tech}</SelectItem>)}
                                  </SelectContent>
                              </Select>
                          </div>
                          <div className="xl:col-span-2">
                            <Label htmlFor="date">Rango de Fechas</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="date"
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {filters.dateRange?.from ? (
                                            filters.dateRange.to ? (
                                                <>
                                                    {format(filters.dateRange.from, "d MMM", { locale: es })} -{' '}
                                                    {format(filters.dateRange.to, "d MMM, y", { locale: es })}
                                                </>
                                            ) : (
                                                format(filters.dateRange.from, "d MMM, y", { locale: es })
                                            )
                                        ) : (
                                            <span>Seleccione un rango</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        selected={filters.dateRange}
                                        onSelect={(range) => handleFilterChange('dateRange', range)}
                                        numberOfMonths={2}
                                        locale={es}
                                    />
                                </PopoverContent>
                            </Popover>
                          </div>
                      </div>
                      <Button variant="ghost" onClick={clearFilters} className="mt-4">
                          <X className="mr-2 h-4 w-4" />
                          Limpiar Filtros
                      </Button>
                  </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" /> <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" /> <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID de Reporte</TableHead>
                  <TableHead>Tipo de Formulario</TableHead>
                  <TableHead className="hidden sm:table-cell">Fecha de Creación</TableHead>
                  <TableHead className="hidden md:table-cell">Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.id}</TableCell>
                      <TableCell>{report.formType}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {format(new Date(report.createdAt), 'PPP p', { locale: es })}
                      </TableCell>
                       <TableCell className="hidden md:table-cell">
                        <Badge>{report.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(report)}>Ver Detalles</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      No se encontraron reportes que coincidan con los filtros.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) { setIsEditing(false); }
          setIsDialogOpen(open);
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
                    if (key === 'id' || key === 'formType' || key === 'createdAt' || value === null || value === undefined || value === '') return null;
                    
                    const displayKey = keyTranslations[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
                    const isImageField = key.endsWith('DataUri');

                    if (isEditing) {
                        const isUneditable = typeof value === 'boolean' || (typeof value === 'string' && isValid(new Date(value)) && value.includes('T')) || isImageField;
                        const isLongText = typeof value === 'string' && value.length > 50 && !isImageField;

                        return (
                            <div key={key} className="grid grid-cols-1 gap-2 py-2 border-b last:border-b-0">
                                <Label htmlFor={key} className="font-semibold">{displayKey}</Label>
                                {isImageField && value ? (
                                    <Image src={value as string} alt={displayKey} width={200} height={150} className="rounded-md border object-contain" />
                                ) : isUneditable ? (
                                    <p className="text-sm text-muted-foreground break-words min-h-[40px] flex items-center">{renderDetailValue(key, value)}</p>
                                ) : isLongText ? (
                                    <Textarea id={key} value={String(value ?? '')} onChange={(e) => handleInputChange(key, e.target.value)} className="min-h-[80px]" />
                                ) : (
                                    <Input id={key} value={String(value ?? '')} onChange={(e) => handleInputChange(key, e.target.value)} />
                                )}
                            </div>
                        )
                    }

                    if (isImageField && value) {
                      return (
                        <div key={key} className="py-2 border-b last:border-b-0">
                          <p className="font-semibold mb-2">{displayKey}</p>
                          <Image src={value as string} alt={displayKey} width={400} height={200} className="rounded-md border object-contain" />
                        </div>
                      );
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
                      <Button variant="outline" onClick={handleDownloadPdf}>
                        <Download className="mr-2 h-4 w-4" /> PDF
                      </Button>
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
    </>
  );
}
