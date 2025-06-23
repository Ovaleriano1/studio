'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { getReports } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, DialogClose } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { RefreshCw } from 'lucide-react';

export function ReportsDisplay() {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedReports = await getReports();
      // sort by date descending
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

  const renderDetails = (report: any) => {
    const keyTranslations: { [key: string]: string } = {
        // General & Common
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

        // Maintenance
        hoursOnMachine: 'Horas en Máquina',
        serviceType: 'Tipo de Servicio',
        fluidCheck: 'Revisión de Fluidos',
        tirePressure: 'Presión de Neumáticos',
        nextServiceDate: 'Fecha Próximo Servicio',
        safetyCheckPassed: 'Verificación de Seguridad Aprobada',

        // Inspection
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

        // Repair
        laborHours: 'Horas de Trabajo',
        symptoms: 'Síntomas Reportados',
        problemDescription: 'Descripción del Problema / Trabajo',
        diagnosticSteps: 'Pasos de Diagnóstico',
        testingNotes: 'Notas de Pruebas',
        finalStatus: 'Estado Final',
        repairCompleted: 'Reparación Completada',
        followUpRequired: 'Requiere Seguimiento',

        // Work Order
        reportedBy: 'Reportado Por',
        issueDescription: 'Descripción del Problema',
        assignedTechnician: 'Técnico Asignado',
        priority: 'Prioridad',
        estimatedHours: 'Horas Estimadas',
        requiredParts: 'Repuestos Requeridos',

        // Programmed Visit
        scheduledDate: 'Fecha Programada',
        contactPerson: 'Persona de Contacto',
        contactPhone: 'Teléfono de Contacto',
        visitPurpose: 'Propósito de la Visita',

        // Warranty
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

        // Safety
        reportDate: 'Fecha del Reporte',
        siteLocation: 'Ubicación del Sitio',
        fireExtinguisherCheck: 'Revisión Extintor',
        firstAidKitCheck: 'Revisión Botiquín',
        emergencyStopCheck: 'Revisión Parada de Emergencia',
        ppeComplianceNotes: 'Notas de EPP',
        overallSafetyRating: 'Calificación de Seguridad',

        // Fluid Analysis
        sampleDate: 'Fecha de Muestra',
        fluidType: 'Tipo de Fluido',
        sampleId: 'ID de Muestra',
        viscosityLevel: 'Nivel de Viscosidad',
        contaminationLevel: 'Nivel de Contaminación',
        analysisSummary: 'Resumen de Análisis',
        actionRequired: 'Acción Requerida',
        
        // Rental Agreement
        rentalStartDate: 'Inicio de Alquiler',
        rentalEndDate: 'Fin de Alquiler',
        dailyRate: 'Tarifa Diaria ($)',
        insuranceProvider: 'Proveedor de Seguros',
        deliveryAddress: 'Dirección de Entrega',
        operatorName: 'Nombre del Operador',
        termsAccepted: 'Términos Aceptados'
      };

    return Object.entries(report).map(([key, value]) => {
      if (key === 'id' || key === 'formType' || value === '' || value === null) return null;
      
      let displayValue = String(value);
      
      if (typeof value === 'string') {
        const potentialDate = new Date(value);
        if (isValid(potentialDate) && value.includes('T') && value.includes('Z')) {
           displayValue = format(potentialDate, 'PPP p', { locale: es });
        }
      } else if (typeof value === 'boolean') {
        displayValue = value ? 'Sí' : 'No';
      }

      const displayKey = keyTranslations[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());

      return (
        <div key={key} className="grid grid-cols-2 gap-4 py-2 border-b last:border-b-0">
          <p className="font-semibold">{displayKey}</p>
          <p className="text-muted-foreground break-words justify-self-end text-right">{displayValue}</p>
        </div>
      );
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Reportes Enviados</CardTitle>
            <CardDescription>Una lista de todos los formularios que han sido enviados. Los datos son temporales.</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={fetchReports} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="sr-only">Actualizar Reportes</span>
        </Button>
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
                       <Dialog>
                        <DialogTrigger asChild>
                           <Button variant="outline" size="sm">Ver Detalles</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                           <DialogHeader>
                            <DialogTitle>Detalles del Reporte: {report.id}</DialogTitle>
                            <DialogDescription>
                              Formulario: {report.formType} - Creado el: {format(new Date(report.createdAt), 'PPP p', { locale: es })}
                            </DialogDescription>
                          </DialogHeader>
                          <ScrollArea className="max-h-[60vh] pr-4">
                            <div className="grid gap-1 py-4">
                              {renderDetails(report)}
                            </div>
                          </ScrollArea>
                           <DialogFooter>
                             <DialogClose asChild>
                                <Button type="button" variant="secondary">
                                  Cerrar
                                </Button>
                              </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
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
  );
}
