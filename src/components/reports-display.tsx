
'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { getReports, updateReport, deleteReport } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { ScrollArea } from './ui/scroll-area';
import { RefreshCw, Edit, Trash2, AreaChart, Download } from 'lucide-react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useUserProfile } from '@/context/user-profile-context';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export function ReportsDisplay() {
  const [reports, setReports] = useState<any[]>([]);
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
      setIsDialogOpen(false); // Close the main dialog
      fetchReports(); // Refresh the list
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
        reportName: 'Nombre del Reporte',
        submittedBy: 'Enviado Por',
        location: 'Ubicación',
        details: 'Detalles',
        createdAt: 'Fecha de Creación',
        technicianName: 'Nombre del Técnico',
        date: 'Fecha',
        equipmentId: 'ID del Equipo',
        clientName: 'Nombre del Cliente',
        workPerformed: 'Trabajo Realizado',
        notes: 'Notas',
        status: 'Estado',
        workOrderNumber: 'Número de Orden de Trabajo',
        partsUsed: 'Repuestos Utilizados',
        hoursOnMachine: 'Horas en Máquina',
        serviceType: 'Tipo de Servicio',
        fluidCheck: 'Revisión de Fluidos',
        tirePressure: 'Presión de Neumáticos',
        nextServiceDate: 'Fecha Próximo Servicio',
        safetyCheckPassed: 'Verificación de Seguridad Aprobada',
        inspectorName: 'Nombre del Inspector',
        overallCondition: 'Condición General',
        fluidLevels: 'Niveles de Fluido',
        brakeSystem: 'Sistema de Frenos',
        hydraulicSystem: 'Sistema Hidráulico',
        electricalSystem: 'Sistema Eléctrico',
        tireCondition: 'Condición de Neumáticos',
        attachmentsCondition: 'Condición de Accesorios',
        safetyEquipment: 'Equipo de Seguridad OK',
        passedInspection: 'Inspección Aprobada',
        laborHours: 'Horas de Trabajo',
        symptoms: 'Síntomas Reportados',
        problemDescription: 'Descripción del Problema / Trabajo',
        diagnosticSteps: 'Pasos de Diagnóstico',
        testingNotes: 'Notas de Pruebas',
        finalStatus: 'Estado Final',
        repairCompleted: 'Reparación Completada',
        followUpRequired: 'Requiere Seguimiento',
        reportedBy: 'Reportado Por',
        issueDescription: 'Descripción del Problema',
        assignedTechnician: 'Técnico Asignado',
        priority: 'Prioridad',
        estimatedHours: 'Horas Estimadas',
        requiredParts: 'Repuestos Requeridos',
        scheduledDate: 'Fecha Programada',
        contactPerson: 'Persona de Contacto',
        contactPhone: 'Teléfono de Contacto',
        visitPurpose: 'Propósito de la Visita',
        customerName: 'Nombre del Cliente',
        productModel: 'Modelo del Producto',
        serialNumber: 'Número de Serie',
        purchaseDate: 'Fecha de Compra',
        failureDate: 'Fecha de Falla',
        hoursAtFailure: 'Horas en Falla',
        dealerName: 'Nombre del Distribuidor',
        invoiceNumber: 'Número de Factura',
        partNumberFailed: 'Nº de Parte Fallada',
        partNumberReplaced: 'Nº de Parte Reemplazada',
        claimType: 'Tipo de Reclamo',
        claimStatus: 'Estado del Reclamo',
        claimDescription: 'Descripción del Reclamo',
        technicianNotes: 'Notas del Técnico',
        reportDate: 'Fecha del Reporte',
        siteLocation: 'Ubicación del Sitio',
        fireExtinguisherCheck: 'Revisión Extintor',
        firstAidKitCheck: 'Revisión Botiquín',
        emergencyStopCheck: 'Revisión Parada de Emergencia',
        ppeComplianceNotes: 'Notas de EPP',
        overallSafetyRating: 'Calificación de Seguridad',
        sampleDate: 'Fecha de Muestra',
        fluidType: 'Tipo de Fluido',
        sampleId: 'ID de Muestra',
        viscosityLevel: 'Nivel de Viscosidad',
        contaminationLevel: 'Nivel de Contaminación',
        analysisSummary: 'Resumen de Análisis',
        actionRequired: 'Acción Requerida',
        rentalStartDate: 'Inicio de Alquiler',
        rentalEndDate: 'Fin de Alquiler',
        dailyRate: 'Tarifa Diaria ($)',
        insuranceProvider: 'Proveedor de Seguros',
        deliveryAddress: 'Dirección de Entrega',
        operatorName: 'Nombre del Operador',
        termsAccepted: 'Términos Aceptados'
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
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    // Header
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

    const addField = (label: string, value: string) => {
        const labelWidth = valueXPos - leftMargin - 5;
        const valueWidth = doc.internal.pageSize.width - valueXPos - leftMargin;

        const labelLines = doc.splitTextToSize(label, labelWidth);
        const valueLines = doc.splitTextToSize(value, valueWidth);
        const lineHeight = Math.max(labelLines.length, valueLines.length) * 6;

        if (yPos + lineHeight > pageHeight - bottomMargin) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.text(label, leftMargin, yPos);

        doc.setFont('helvetica', 'normal');
        doc.text(valueLines, valueXPos, yPos);
        
        yPos += lineHeight + 4;
    };
    
    for (const [key, value] of Object.entries(selectedReport)) {
        if (key === 'id' || key === 'formType' || key === 'createdAt' || value === null || value === undefined || value === '') continue;

        const label = (keyTranslations[key] || key) + ':';
        const formattedValue = renderDetailValue(key, value);
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
              <CardDescription>Una lista de todos los formularios que han sido enviados. Los datos son temporales.</CardDescription>
          </div>
           <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={fetchReports} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="sr-only">Actualizar Reportes</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID de Reporte</TableHead>
                  <TableHead>Tipo de Formulario</TableHead>
                  <TableHead className="hidden sm:table-cell">Fecha de Creación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length > 0 ? (
                  reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.id}</TableCell>
                      <TableCell>{report.formType}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {format(new Date(report.createdAt), 'PPP p', { locale: es })}
                      </TableCell>
                      <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(report)}>Ver Detalles</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No hay reportes para mostrar. Envíe un formulario para verlo aquí.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) {
              setIsEditing(false);
          }
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
                                    <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditing(true)}
                                    disabled={isLocked}
                                    className="w-full"
                                    >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                    </Button>
                                </span>
                                </TooltipTrigger>
                                {isLocked && (
                                <TooltipContent>
                                    <p>Los reportes completados o cancelados no se pueden editar.</p>
                                </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                      )}
                      <Button variant="outline" onClick={handleDownloadPdf}>
                        <Download className="mr-2 h-4 w-4" />
                        PDF
                      </Button>
                      {canDelete && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                <span tabIndex={isLocked ? 0 : -1} className={isLocked ? 'cursor-not-allowed' : ''}>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" disabled={isLocked}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Eliminar
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta acción no se puede deshacer. Esto eliminará permanentemente el reporte de los datos temporales.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting}>
                                                {isDeleting ? (
                                                    <>
                                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                        Eliminando...
                                                    </>
                                                ) : 'Continuar'}
                                            </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </span>
                                </TooltipTrigger>
                                {isLocked && (
                                <TooltipContent>
                                    <p>Los reportes completados o cancelados no se pueden eliminar.</p>
                                </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">Cerrar</Button>
                    </DialogClose>
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
