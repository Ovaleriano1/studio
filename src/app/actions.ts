
'use server';

import { revalidatePath } from 'next/cache';

// To prevent the in-memory database from being reset during hot-reloading in development,
// we attach it to the 'global' object. This ensures data persistence across module reloads.
// NOTE: This data will reset every time the server process fully restarts.
declare global {
  // eslint-disable-next-line no-var
  var camosa_reports_db: any[] | undefined;
}

const reports: any[] = global.camosa_reports_db || (global.camosa_reports_db = [
    {
        id: 'PV-001',
        formType: 'Visita Programada',
        clientName: 'Constructora del Sol',
        location: 'Proyecto Amanecer, Lote 5',
        scheduledDate: new Date('2024-07-29T10:00:00Z').toISOString(),
        assignedTechnician: 'Juan Funez',
        equipmentId: 'CAT-320D',
        contactPerson: 'Ing. Maria Rojas',
        contactPhone: '555-1111',
        visitPurpose: 'Inspección de 500 horas para la excavadora.',
        createdAt: new Date('2024-07-28T15:00:00Z').toISOString(),
        status: 'En Progreso',
    },
    {
        id: 'PV-002',
        formType: 'Visita Programada',
        clientName: 'Agregados del Valle',
        location: 'Cantera Central',
        scheduledDate: new Date('2024-07-29T14:00:00Z').toISOString(),
        assignedTechnician: 'Carlos Ruiz',
        equipmentId: 'VOLVO-A40G',
        contactPerson: 'Sr. Roberto Lima',
        contactPhone: '555-2222',
        visitPurpose: 'Diagnóstico de sistema hidráulico.',
        createdAt: new Date('2024-07-28T16:00:00Z').toISOString(),
        status: 'En Progreso',
    },
    {
        id: 'PV-003',
        formType: 'Visita Programada',
        clientName: 'Transportes Rápidos',
        location: 'Patio Principal, San Pedro Sula',
        scheduledDate: new Date('2024-07-31T09:00:00Z').toISOString(),
        assignedTechnician: 'Juan Funez',
        equipmentId: 'MACK-LR-45',
        contactPerson: 'Lic. Ana Flores',
        contactPhone: '555-3333',
        visitPurpose: 'Mantenimiento preventivo programado.',
        createdAt: new Date('2024-07-30T11:00:00Z').toISOString(),
        status: 'Pendiente',
    },
    {
        id: 'PV-004',
        formType: 'Visita Programada',
        clientName: 'Constructora del Sol',
        location: 'Proyecto Amanecer, Lote 8',
        scheduledDate: new Date('2024-08-05T11:00:00Z').toISOString(),
        assignedTechnician: 'Pedro Martín',
        equipmentId: 'JOHN DEERE-8R',
        contactPerson: 'Ing. Maria Rojas',
        contactPhone: '555-1111',
        visitPurpose: 'Revisión de transmisión reportada.',
        createdAt: new Date('2024-08-01T10:00:00Z').toISOString(),
        status: 'Pendiente',
    },
    {
        id: 'GR-001',
        formType: 'Reporte General',
        reportName: 'Incidencia en Taller',
        submittedBy: 'Juan Pérez',
        location: 'Taller Principal',
        details: 'Se reporta una fuga de aceite en la bahía 3.',
        createdAt: new Date('2024-07-28T10:00:00Z').toISOString(),
        status: 'Completado',
    },
    {
        id: 'MR-001',
        formType: 'Reporte de Mantenimiento',
        technicianName: 'Juan Gomez',
        date: new Date('2024-07-27T14:30:00Z').toISOString(),
        equipmentId: 'CAT-D6',
        hoursOnMachine: 5120,
        serviceType: 'programado',
        clientName: 'ACME Corp',
        workPerformed: 'Cambio de aceite y filtros. Inspección de niveles y engrase general.',
        createdAt: new Date('2024-07-27T16:00:00Z').toISOString(),
        workOrderNumber: 'OT-MANT-555',
        fluidCheck: 'ok',
        tirePressure: 'Delanteros: 110 PSI, Traseros: 140 PSI',
        nextServiceDate: new Date('2024-10-27T14:30:00Z').toISOString(),
        partsUsed: '1x Filtro de aceite (P/N: CAT-123), 1x Filtro de aire (P/N: CAT-456)',
        safetyCheckPassed: true,
        status: 'Completado',
    },
    {
        id: 'INSP-001',
        formType: 'Reporte de Inspección',
        inspectorName: 'Ana García',
        date: new Date('2024-07-26T09:00:00Z').toISOString(),
        equipmentId: 'VOLVO-A40G',
        location: 'Cantera Norte',
        overallCondition: 'buena',
        fluidLevels: 'ok',
        brakeSystem: 'ok',
        hydraulicSystem: 'ok',
        electricalSystem: 'ok',
        tireCondition: 'Buena, 150 PSI',
        notes: 'Inspección de rutina completada sin problemas.',
        safetyEquipment: true,
        passedInspection: true,
        createdAt: new Date('2024-07-26T11:00:00Z').toISOString(),
        status: 'Completado',
    },
    {
        id: 'OT-001',
        formType: 'Orden de Trabajo',
        clientName: 'Constructora del Futuro',
        date: new Date('2024-07-25T08:00:00Z').toISOString(),
        equipmentId: 'MACK-LR-45',
        location: 'Proyecto Skyline',
        reportedBy: 'Jefe de Obra',
        issueDescription: 'El motor no arranca. Se necesita diagnóstico.',
        assignedTechnician: 'Carlos Ruiz',
        status: 'Pendiente',
        priority: 'alta',
        createdAt: new Date('2024-07-25T08:30:00Z').toISOString(),
    },
    {
        id: 'REP-001',
        formType: 'Reporte de Reparación',
        technicianName: 'Pedro Martín',
        clientName: 'Minería S.A.',
        date: new Date('2024-07-24T11:00:00Z').toISOString(),
        equipmentId: 'JOHN DEERE-8R',
        laborHours: 5.5,
        symptoms: 'El tractor pierde potencia en pendientes.',
        problemDescription: 'Filtro de combustible obstruido. Se reemplazó el filtro y se purgó el sistema.',
        diagnosticSteps: 'Se revisó la presión de combustible y se encontró baja. Se inspeccionó el filtro.',
        partsUsed: '1x Filtro de combustible (P/N: JD-123)',
        finalStatus: 'reparado',
        repairCompleted: true,
        createdAt: new Date('2024-07-24T17:00:00Z').toISOString(),
        status: 'Esperando Repuestos',
    },
    {
        id: 'WAR-001',
        formType: 'Reclamo de Garantía',
        customerName: 'Transportes Rápidos',
        equipmentId: 'UD-CRONER',
        productModel: 'CRONER-MKE',
        serialNumber: 'UDC12345XYZ',
        purchaseDate: new Date('2023-10-15T00:00:00Z').toISOString(),
        failureDate: new Date('2024-07-22T00:00:00Z').toISOString(),
        hoursAtFailure: 2100,
        dealerName: 'CAMOSA',
        invoiceNumber: 'INV-2023-987',
        partNumberFailed: 'ALT-54321',
        partNumberReplaced: 'ALT-54322',
        claimType: 'ambos',
        claimStatus: 'en_revision',
        claimDescription: 'El alternador dejó de funcionar prematuramente.',
        createdAt: new Date('2024-07-23T14:00:00Z').toISOString(),
        status: 'En Progreso',
    },
    {
        id: 'FLUID-001',
        formType: 'Reporte de Análisis de Fluidos',
        sampleDate: new Date('2024-07-20T10:00:00Z').toISOString(),
        technicianName: 'Lucía Fernández',
        equipmentId: 'CAT-D6',
        fluidType: 'aceite_motor',
        sampleId: 'ACEITE-MOTOR-CATD6-001',
        viscosityLevel: 40,
        contaminationLevel: '19/17/14',
        analysisSummary: 'Niveles de hierro ligeramente elevados. Se recomienda monitorear en el próximo cambio.',
        actionRequired: 'monitorear',
        createdAt: new Date('2024-07-21T15:00:00Z').toISOString(),
        status: 'Completado',
    },
    {
        id: 'PV-005',
        formType: 'Visita Programada',
        clientName: 'Minería S.A.',
        location: 'Mina El Mochito',
        scheduledDate: new Date('2024-08-10T09:00:00Z').toISOString(),
        assignedTechnician: 'Carlos Ruiz',
        equipmentId: 'CAT-777G',
        contactPerson: 'Ing. Luis Soto',
        contactPhone: '555-4444',
        visitPurpose: 'Inspección general de flota.',
        createdAt: new Date('2024-08-02T14:00:00Z').toISOString(),
        status: 'Pendiente',
    },
    {
        id: 'MR-002',
        formType: 'Reporte de Mantenimiento',
        technicianName: 'Carlos Ruiz',
        date: new Date('2024-08-01T11:00:00Z').toISOString(),
        equipmentId: 'VOLVO-A40G',
        hoursOnMachine: 8540,
        serviceType: 'preventivo',
        clientName: 'Agregados del Valle',
        workPerformed: 'Mantenimiento de 1000 horas, cambio de fluidos y filtros de transmisión.',
        createdAt: new Date('2024-08-01T17:00:00Z').toISOString(),
        workOrderNumber: 'OT-MANT-556',
        fluidCheck: 'ok',
        tirePressure: 'Todos los neumáticos a 145 PSI',
        nextServiceDate: new Date('2025-02-01T11:00:00Z').toISOString(),
        partsUsed: 'Kit de filtros (P/N: VOL-789), 20L Aceite Transmisión (P/N: VOL-OIL-TR)',
        safetyCheckPassed: true,
        status: 'Completado',
    },
    {
        id: 'INSP-002',
        formType: 'Reporte de Inspección',
        inspectorName: 'Ana García',
        date: new Date('2024-08-03T10:00:00Z').toISOString(),
        equipmentId: 'MACK-LR-45',
        location: 'Patio Principal, San Pedro Sula',
        overallCondition: 'regular',
        fluidLevels: 'ok',
        brakeSystem: 'necesita_ajuste',
        hydraulicSystem: 'ok',
        electricalSystem: 'ok',
        tireCondition: 'Desgaste regular, 110 PSI',
        notes: 'Requiere ajuste en frenos traseros. Se programará orden de trabajo.',
        safetyEquipment: true,
        passedInspection: false,
        createdAt: new Date('2024-08-03T12:00:00Z').toISOString(),
        status: 'En Progreso',
    },
    {
        id: 'OT-002',
        formType: 'Orden de Trabajo',
        clientName: 'Transportes Rápidos',
        date: new Date('2024-08-03T13:00:00Z').toISOString(),
        equipmentId: 'MACK-LR-45',
        location: 'Taller Principal',
        reportedBy: 'Ana García (Inspector)',
        issueDescription: 'Ajuste de frenos traseros requerido según inspección INSP-002.',
        assignedTechnician: 'Pedro Martín',
        status: 'Pendiente',
        priority: 'media',
        createdAt: new Date('2024-08-03T13:30:00Z').toISOString(),
    },
    {
        id: 'REP-002',
        formType: 'Reporte de Reparación',
        technicianName: 'Juan Funez',
        clientName: 'Constructora del Sol',
        date: new Date('2024-07-30T09:00:00Z').toISOString(),
        equipmentId: 'CAT-320D',
        laborHours: 8,
        symptoms: 'Fuga de aceite hidráulico en el brazo principal.',
        problemDescription: 'Se identificó manguera hidráulica rota. La parte no está en stock.',
        diagnosticSteps: 'Inspección visual del sistema hidráulico bajo presión.',
        partsUsed: '',
        finalStatus: 'esperando_repuestos',
        repairCompleted: false,
        createdAt: new Date('2024-07-30T18:00:00Z').toISOString(),
        status: 'Esperando Repuestos',
    },
    {
        id: 'GR-002',
        formType: 'Reporte General',
        reportName: 'Entrega de Equipo Nuevo',
        submittedBy: 'Kevin Godoy',
        location: 'Oficina Principal',
        details: 'Se completó la entrega del nuevo tractor John Deere 9R al cliente "Agro-Inversiones".',
        createdAt: new Date('2024-08-05T16:00:00Z').toISOString(),
        status: 'Completado',
    },
    {
        id: 'WAR-002',
        formType: 'Reclamo de Garantía',
        customerName: 'Agregados del Valle',
        equipmentId: 'VOLVO-A40G',
        productModel: 'A40G',
        serialNumber: 'VOLVO12345ABC',
        purchaseDate: new Date('2023-01-20T00:00:00Z').toISOString(),
        failureDate: new Date('2024-08-02T00:00:00Z').toISOString(),
        hoursAtFailure: 8550,
        dealerName: 'CAMOSA',
        invoiceNumber: 'INV-2023-111',
        partNumberFailed: 'SENSOR-TEMP-555',
        partNumberReplaced: 'SENSOR-TEMP-556',
        claimType: 'parte',
        claimStatus: 'en_revision',
        claimDescription: 'Sensor de temperatura del motor falló prematuramente.',
        createdAt: new Date('2024-08-04T11:00:00Z').toISOString(),
        status: 'En Progreso',
    },
    {
        id: 'PV-006',
        formType: 'Visita Programada',
        clientName: 'Constructora del Futuro',
        location: 'Proyecto Skyline',
        scheduledDate: new Date('2024-07-29T10:00:00Z').toISOString(),
        assignedTechnician: 'Carlos Ruiz',
        equipmentId: 'MACK-LR-45',
        contactPerson: 'Jefe de Obra',
        contactPhone: '555-8888',
        visitPurpose: 'Diagnóstico de motor que no arranca, ref. OT-001.',
        createdAt: new Date('2024-07-28T09:00:00Z').toISOString(),
        status: 'Completado',
    },
    {
        id: 'FLUID-002',
        formType: 'Reporte de Análisis de Fluidos',
        sampleDate: new Date('2024-07-28T11:00:00Z').toISOString(),
        technicianName: 'Lucía Fernández',
        equipmentId: 'JOHN DEERE-8R',
        fluidType: 'fluido_hidraulico',
        sampleId: 'HID-JD8R-005',
        viscosityLevel: 32,
        contaminationLevel: '16/14/11',
        analysisSummary: 'Todos los niveles dentro de los parámetros normales. Sin contaminación significativa.',
        actionRequired: 'ninguna',
        createdAt: new Date('2024-07-29T16:00:00Z').toISOString(),
        status: 'Completado',
    },
    {
        id: 'RENT-001',
        formType: 'Contrato de Alquiler',
        customerName: 'Obras Civiles S. de R.L.',
        equipmentId: 'EXCAVADORA-CAT-336',
        rentalStartDate: new Date('2024-08-01T00:00:00Z').toISOString(),
        rentalEndDate: new Date('2024-08-31T00:00:00Z').toISOString(),
        dailyRate: 600,
        insuranceProvider: 'Aseguradora Atlántida',
        deliveryAddress: 'Proyecto Costa Verde, Km 15',
        operatorName: 'Carlos Pineda',
        termsAccepted: true,
        createdAt: new Date('2024-07-31T10:00:00Z').toISOString(),
        status: 'En Progreso',
    },
    {
        id: 'SAFE-001',
        formType: 'Reporte de Cumplimiento de Seguridad',
        reportDate: new Date('2024-08-05T00:00:00Z').toISOString(),
        inspectorName: 'Kevin Godoy',
        siteLocation: 'Taller Principal',
        equipmentId: 'TALLER-GENERAL',
        fireExtinguisherCheck: true,
        firstAidKitCheck: true,
        emergencyStopCheck: true,
        ppeComplianceNotes: 'Todo el personal utiliza EPP correctamente. Se reforzó la política de uso de guantes.',
        overallSafetyRating: 'excelente',
        createdAt: new Date('2024-08-05T14:00:00Z').toISOString(),
        status: 'Completado',
    },
    {
        id: 'MR-003',
        formType: 'Reporte de Mantenimiento',
        technicianName: 'Rudy Valerio',
        date: new Date('2024-08-06T00:00:00Z').toISOString(),
        equipmentId: 'UD-CRONER-PK',
        hoursOnMachine: 3500,
        serviceType: 'preventivo',
        clientName: 'Distribuidora del Norte',
        workPerformed: 'Mantenimiento preventivo de 3500 horas. Revisión de frenos y cambio de aceite de motor.',
        workOrderNumber: 'OT-PREV-112',
        fluidCheck: 'ok',
        tirePressure: '115 PSI en todos los neumáticos',
        nextServiceDate: new Date('2024-11-06T00:00:00Z').toISOString(),
        partsUsed: 'Kit de filtros (P/N: UD-FIL-3), 15L Aceite 15W40',
        safetyCheckPassed: true,
        createdAt: new Date('2024-08-06T16:00:00Z').toISOString(),
        status: 'Completado',
    },
    {
        id: 'OT-003',
        formType: 'Orden de Trabajo',
        clientName: 'Minería S.A.',
        date: new Date('2024-08-07T00:00:00Z').toISOString(),
        equipmentId: 'CAT-777G',
        location: 'Mina El Mochito',
        reportedBy: 'Jefe de Flota',
        issueDescription: 'Falla en sistema de enfriamiento. La temperatura del motor sube más de lo normal en operación.',
        assignedTechnician: 'Juan Funez',
        status: 'Pendiente',
        priority: 'urgente',
        createdAt: new Date('2024-08-07T09:00:00Z').toISOString(),
    },
    {
        id: 'REP-003',
        formType: 'Reporte de Reparación',
        technicianName: 'Pedro Martín',
        clientName: 'Transportes Rápidos',
        date: new Date('2024-08-04T00:00:00Z').toISOString(),
        equipmentId: 'MACK-LR-45',
        laborHours: 4,
        symptoms: 'Ajuste de frenos requerido por inspección INSP-002.',
        problemDescription: 'Se ajustaron las zapatas de los frenos traseros. Se realizó prueba de frenado y el vehículo responde correctamente.',
        diagnosticSteps: 'Inspección visual y medición de recorrido del pedal de freno.',
        partsUsed: '',
        finalStatus: 'reparado',
        repairCompleted: true,
        createdAt: new Date('2024-08-04T14:00:00Z').toISOString(),
        status: 'Completado',
    },
    {
        id: 'PV-007',
        formType: 'Visita Programada',
        clientName: 'Obras Civiles S. de R.L.',
        location: 'Proyecto Costa Verde, Lote 2',
        scheduledDate: new Date('2024-08-12T10:00:00Z').toISOString(),
        assignedTechnician: 'Rudy Valerio',
        equipmentId: 'JOHN-DEERE-310SL',
        contactPerson: 'Ing. Sofia Castro',
        contactPhone: '555-9988',
        visitPurpose: 'Capacitación de operación para nuevo personal.',
        createdAt: new Date('2024-08-07T11:00:00Z').toISOString(),
        status: 'Pendiente',
    },
    {
        id: 'GR-003',
        formType: 'Reporte General',
        reportName: 'Auditoría de Inventario',
        submittedBy: 'Oscar Hernandez',
        location: 'Almacén de Repuestos',
        details: 'Se completó la auditoría trimestral de inventario. No se encontraron discrepancias significativas.',
        createdAt: new Date('2024-08-06T18:00:00Z').toISOString(),
        status: 'Completado',
    },
    {
        id: 'INSP-003',
        formType: 'Reporte de Inspección',
        inspectorName: 'Ana García',
        date: new Date('2024-08-08T00:00:00Z').toISOString(),
        equipmentId: 'JOHN-DEERE-9R',
        location: 'Agro-Inversiones, Finca 3',
        overallCondition: 'buena',
        fluidLevels: 'ok',
        brakeSystem: 'ok',
        hydraulicSystem: 'ok',
        electricalSystem: 'ok',
        tireCondition: 'Neumáticos nuevos, 130 PSI',
        notes: 'Inspección pre-entrega. Equipo en óptimas condiciones.',
        safetyEquipment: true,
        passedInspection: true,
        createdAt: new Date('2024-08-08T11:00:00Z').toISOString(),
        status: 'Completado',
    },
    {
        id: 'WAR-003',
        formType: 'Reclamo de Garantía',
        customerName: 'Constructora del Sol',
        equipmentId: 'CAT-320D',
        productModel: '320D',
        serialNumber: 'CAT320D-XYZ987',
        purchaseDate: new Date('2024-01-10T00:00:00Z').toISOString(),
        failureDate: new Date('2024-08-01T00:00:00Z').toISOString(),
        hoursAtFailure: 1500,
        dealerName: 'CAMOSA',
        invoiceNumber: 'INV-2024-050',
        partNumberFailed: 'HYD-PUMP-A1',
        partNumberReplaced: 'HYD-PUMP-A2',
        claimType: 'ambos',
        claimStatus: 'aprobado',
        claimDescription: 'La bomba hidráulica principal presentó una fuga interna prematura. Se reemplazó bajo garantía.',
        createdAt: new Date('2024-08-05T09:00:00Z').toISOString(),
        status: 'Completado',
    }
]);

/**
 * Fetches all reports from the in-memory store.
 * In a real application, this would fetch from a database.
 */
export async function getReports(): Promise<any[]> {
  // Return a copy to prevent direct mutation of the server-side array
  return JSON.parse(JSON.stringify(reports));
}

/**
 * Fetches a single report by its ID from the in-memory store.
 * @param reportId The ID of the report to fetch.
 */
export async function getReportById(reportId: string): Promise<any | null> {
  const report = reports.find(r => r.id === reportId);
  if (!report) return null;
  // Return a copy to prevent direct mutation of the server-side array
  return JSON.parse(JSON.stringify(report));
}


export async function updateReport(updatedReportData: any) {
  try {
    const reportIndex = reports.findIndex(r => r.id === updatedReportData.id);
    if (reportIndex === -1) {
      throw new Error('Reporte no encontrado.');
    }
    // Lock completed or cancelled reports from being edited
    if (['Completado', 'Cancelado'].includes(reports[reportIndex].status)) {
        throw new Error('No se puede modificar un reporte que ya ha sido completado o cancelado.');
    }
    // Update the report in the array
    reports[reportIndex] = { ...updatedReportData };
    console.log('Report updated in in-memory store:', reports[reportIndex]);
    revalidatePath('/reports');
    revalidatePath('/calendar');
    revalidatePath('/status');
    return { success: true, report: reports[reportIndex] };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'No se pudo actualizar el reporte. Por favor, inténtelo de nuevo.';
    console.error('Error updating report in in-memory store:', error);
    throw new Error(errorMessage);
  }
}

export async function deleteReport(reportId: string): Promise<{ success: boolean }> {
  try {
    const reportIndex = reports.findIndex(r => r.id === reportId);
    if (reportIndex === -1) {
      throw new Error('Reporte no encontrado.');
    }
    // Lock completed or cancelled reports from being deleted
    if (['Completado', 'Cancelado'].includes(reports[reportIndex].status)) {
        throw new Error('No se puede eliminar un reporte que ya ha sido completado o cancelado.');
    }
    // Remove the report from the array
    reports.splice(reportIndex, 1);
    console.log(`Report ${reportId} deleted from in-memory store.`);
    revalidatePath('/reports');
    return { success: true };
  } catch (error) {
    console.error('Error deleting report in in-memory store:', error);
    throw new Error('No se pudo eliminar el reporte. Por favor, inténtelo de nuevo.');
  }
}


export async function saveMaintenanceReport(reportData: any): Promise<string> {
  try {
    const newReport = {
      ...reportData,
      id: `MR-${Date.now()}`, // Simple unique ID
      formType: 'Reporte de Mantenimiento',
      createdAt: new Date().toISOString(),
      status: 'Pendiente',
    };
    reports.push(newReport);
    console.log('Maintenance report saved to in-memory store:', newReport);
    revalidatePath('/reports');
    return newReport.id;
  } catch (error) {
    console.error('Error saving maintenance report to in-memory store:', error);
    throw new Error('No se pudo guardar el reporte. Por favor, inténtelo de nuevo.');
  }
}

export async function saveGeneralReport(reportData: any): Promise<string> {
  try {
    const newId = `GR-${Date.now()}`; // Simple unique ID
    const newReport = {
      ...reportData,
      id: newId,
      formType: 'Reporte General',
      createdAt: new Date().toISOString(),
      status: 'Pendiente',
    };
    reports.push(newReport);
    console.log('General report saved to in-memory store:', newReport);
    revalidatePath('/reports');
    return newId;
  } catch (error) {
    console.error('Error saving general report to in-memory store:', error);
    throw new Error('No se pudo guardar el reporte. Por favor, inténtelo de nuevo.');
  }
}

export async function saveInspectionReport(reportData: any): Promise<string> {
    try {
        const newId = `INSP-${Date.now()}`;
        const newReport = {
            ...reportData,
            id: newId,
            formType: 'Reporte de Inspección',
            createdAt: new Date().toISOString(),
            status: 'Pendiente',
        };
        reports.push(newReport);
        console.log('Inspection report saved to in-memory store:', newReport);
        revalidatePath('/reports');
        return newId;
    } catch (error) {
        console.error('Error saving inspection report:', error);
        throw new Error('No se pudo guardar el reporte de inspección. Por favor, inténtelo de nuevo.');
    }
}

export async function saveRepairReport(reportData: any): Promise<string> {
    try {
        const newId = `REP-${Date.now()}`;
        const newReport = {
            ...reportData,
            id: newId,
            formType: 'Reporte de Reparación',
            createdAt: new Date().toISOString(),
            status: 'Pendiente',
        };
        reports.push(newReport);
        console.log('Repair report saved to in-memory store:', newReport);
        revalidatePath('/reports');
        return newId;
    } catch (error) {
        console.error('Error saving repair report:', error);
        throw new Error('No se pudo guardar el reporte de reparación. Por favor, inténtelo de nuevo.');
    }
}

export async function saveWorkOrder(reportData: any): Promise<string> {
    try {
        const newId = `OT-${Date.now()}`;
        const newReport = {
            ...reportData,
            id: newId,
            formType: 'Orden de Trabajo',
            createdAt: new Date().toISOString(),
            status: 'Pendiente',
        };
        reports.push(newReport);
        console.log('Work order saved to in-memory store:', newReport);
        revalidatePath('/reports');
        return newId;
    } catch (error) {
        console.error('Error saving work order:', error);
        throw new Error('No se pudo guardar la orden de trabajo. Por favor, inténtelo de nuevo.');
    }
}

export async function saveProgrammedVisit(reportData: any): Promise<string> {
    try {
        const newId = `PV-${Date.now()}`;
        const newReport = {
            ...reportData,
            id: newId,
            formType: 'Visita Programada',
            createdAt: new Date().toISOString(),
            status: 'Pendiente',
        };
        reports.push(newReport);
        console.log('Programmed visit saved to in-memory store:', newReport);
        revalidatePath('/reports');
        revalidatePath('/calendar');
        return newId;
    } catch (error) {
        console.error('Error saving programmed visit:', error);
        throw new Error('No se pudo guardar la visita programada. Por favor, inténtelo de nuevo.');
    }
}

export async function saveWarrantyClaim(reportData: any): Promise<string> {
    try {
        const newId = `WAR-${Date.now()}`;
        const newReport = {
            ...reportData,
            id: newId,
            formType: 'Reclamo de Garantía',
            createdAt: new Date().toISOString(),
            status: 'Pendiente',
        };
        reports.push(newReport);
        console.log('Warranty claim saved to in-memory store:', newReport);
        revalidatePath('/reports');
        return newId;
    } catch (error) {
        console.error('Error saving warranty claim:', error);
        throw new Error('No se pudo guardar el reclamo de garantía. Por favor, inténtelo de nuevo.');
    }
}

export async function saveSafetyReport(reportData: any): Promise<string> {
    try {
        const newId = `SAFE-${Date.now()}`;
        const newReport = {
            ...reportData,
            id: newId,
            formType: 'Reporte de Cumplimiento de Seguridad',
            createdAt: new Date().toISOString(),
            status: 'Pendiente',
        };
        reports.push(newReport);
        console.log('Safety report saved to in-memory store:', newReport);
        revalidatePath('/reports');
        return newId;
    } catch (error) {
        console.error('Error saving safety report:', error);
        throw new Error('No se pudo guardar el reporte de seguridad. Por favor, inténtelo de nuevo.');
    }
}

export async function saveFluidAnalysis(reportData: any): Promise<string> {
    try {
        const newId = `FLUID-${Date.now()}`;
        const newReport = {
            ...reportData,
            id: newId,
            formType: 'Reporte de Análisis de Fluidos',
            createdAt: new Date().toISOString(),
            status: 'Pendiente',
        };
        reports.push(newReport);
        console.log('Fluid analysis saved to in-memory store:', newReport);
        revalidatePath('/reports');
        return newId;
    } catch (error) {
        console.error('Error saving fluid analysis:', error);
        throw new Error('No se pudo guardar el reporte de análisis de fluidos. Por favor, inténtelo de nuevo.');
    }
}

export async function saveRentalAgreement(reportData: any): Promise<string> {
    try {
        const newId = `RENT-${Date.now()}`;
        const newReport = {
            ...reportData,
            id: newId,
            formType: 'Contrato de Alquiler',
            createdAt: new Date().toISOString(),
            status: 'Pendiente',
        };
        reports.push(newReport);
        console.log('Rental agreement saved to in-memory store:', newReport);
        revalidatePath('/reports');
        return newId;
    } catch (error) {
        console.error('Error saving rental agreement:', error);
        throw new Error('No se pudo guardar el contrato de alquiler. Por favor, inténtelo de nuevo.');
    }
}


// Helper function to simulate email notification
async function sendNotificationEmail(subject: string, body: string) {
  console.log('--- SIMULACIÓN DE ENVÍO DE CORREO ---');
  console.log('Para: ohernandez@camosa.com, kgodoy@camosa.com');
  console.log(`Asunto: ${subject}`);
  console.log(body.trim());
  console.log('------------------------------------');
}

// Helper to get basic report info
function findReportForNotification(reportId: string) {
    const report = reports.find(r => r.id === reportId);
    if (!report) {
      throw new Error(`Reporte con ID "${reportId}" no encontrado.`);
    }
    return report;
}

export async function notifyTimerStart({ reportId, technicianName }: { reportId: string, technicianName: string }) {
  try {
    const report = findReportForNotification(reportId);
    const emailBody = `
      ===============================================
      ** Temporizador INICIADO **
      ===============================================

      El temporizador ha sido iniciado para un reporte.

      **Técnico:** ${technicianName}
      **ID del Reporte:** ${report.id}
      **Tipo de Formulario:** ${report.formType}
      **Cliente:** ${report.clientName || 'No especificado'}
      **Equipo:** ${report.equipmentId}
      **Hora:** ${new Date().toLocaleString('es-HN')}
    `;
    await sendNotificationEmail(`Temporizador INICIADO para Reporte ${report.id}`, emailBody);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'No se pudo notificar el inicio del temporizador.';
    console.error('Error notifying timer start:', error);
    throw new Error(errorMessage);
  }
}

export async function notifyTimerPause({ reportId, technicianName }: { reportId: string, technicianName: string }) {
    try {
        const report = findReportForNotification(reportId);
        const emailBody = `
          ===============================================
          ** Temporizador PAUSADO **
          ===============================================
    
          El temporizador ha sido pausado.
    
          **Técnico:** ${technicianName}
          **ID del Reporte:** ${report.id}
          **Tipo de Formulario:** ${report.formType}
          **Cliente:** ${report.clientName || 'No especificado'}
          **Equipo:** ${report.equipmentId}
          **Hora:** ${new Date().toLocaleString('es-HN')}
        `;
        await sendNotificationEmail(`Temporizador PAUSADO para Reporte ${report.id}`, emailBody);
        return { success: true };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'No se pudo notificar la pausa del temporizador.';
        console.error('Error notifying timer pause:', error);
        throw new Error(errorMessage);
    }
}

export async function notifyTimerResume({ reportId, technicianName }: { reportId: string, technicianName: string }) {
    try {
        const report = findReportForNotification(reportId);
        const emailBody = `
          ===============================================
          ** Temporizador REANUDADO **
          ===============================================
    
          El temporizador ha sido reanudado.
    
          **Técnico:** ${technicianName}
          **ID del Reporte:** ${report.id}
          **Tipo de Formulario:** ${report.formType}
          **Cliente:** ${report.clientName || 'No especificado'}
          **Equipo:** ${report.equipmentId}
          **Hora:** ${new Date().toLocaleString('es-HN')}
        `;
        await sendNotificationEmail(`Temporizador REANUDADO para Reporte ${report.id}`, emailBody);
        return { success: true };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'No se pudo notificar la reanudación del temporizador.';
        console.error('Error notifying timer resume:', error);
        throw new Error(errorMessage);
    }
}


export async function notifyTimerStop({ reportId, elapsedTimeInSeconds }: { reportId: string, elapsedTimeInSeconds: number }) {
  try {
    const report = findReportForNotification(reportId);

    const hours = Math.floor(elapsedTimeInSeconds / 3600);
    const minutes = Math.floor((elapsedTimeInSeconds % 3600) / 60);
    const seconds = Math.floor(elapsedTimeInSeconds % 60);
    const formattedTime = [hours, minutes, seconds]
      .map(v => v.toString().padStart(2, '0'))
      .join(':');

    const emailBody = `
      ===============================================
      ** Temporizador DETENIDO - Reporte de Horas **
      ===============================================

      Se ha registrado un nuevo tiempo de trabajo.

      **Técnico:** ${report.technicianName || report.assignedTechnician || report.inspectorName || report.submittedBy || 'No especificado'}
      **ID del Reporte:** ${report.id}
      **Tipo de Formulario:** ${report.formType}
      **Cliente:** ${report.clientName || 'No especificado'}
      **Equipo:** ${report.equipmentId}

      -----------------------------------------------
      **Tiempo Registrado:** ${formattedTime} (HH:MM:SS)
      -----------------------------------------------
      
      Este es un correo electrónico generado automáticamente.
    `;

    await sendNotificationEmail(`Registro de Tiempo para Reporte ${report.id}`, emailBody);
    
    return { success: true, message: 'El registro de tiempo ha sido notificado.' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'No se pudo registrar el tiempo. Por favor, inténtelo de nuevo.';
    console.error('Error logging work time:', error);
    throw new Error(errorMessage);
  }
}
