'use server';

import { revalidatePath } from 'next/cache';

// In-memory store for reports as a temporary workaround for DB connection issues.
// NOTE: This data will reset every time the server restarts.
let reports: any[] = [
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
    },
    {
        id: 'GR-001',
        formType: 'Reporte General',
        reportName: 'Incidencia en Taller',
        submittedBy: 'Juan Pérez',
        location: 'Taller Principal',
        details: 'Se reporta una fuga de aceite en la bahía 3.',
        createdAt: new Date('2024-07-28T10:00:00Z').toISOString(),
    },
    {
        id: 'MR-001',
        formType: 'Reporte de Mantenimiento',
        technicianName: 'Juan Gomez',
        date: new Date('2024-07-27T14:30:00Z').toISOString(),
        equipmentId: 'CAT-D6',
        hoursOnMachine: 5120,
        serviceType: 'scheduled',
        clientName: 'ACME Corp',
        workPerformed: 'Cambio de aceite y filtros.',
        createdAt: new Date('2024-07-27T16:00:00Z').toISOString(),
    },
    {
        id: 'INSP-001',
        formType: 'Reporte de Inspección',
        inspectorName: 'Ana García',
        date: new Date('2024-07-26T09:00:00Z').toISOString(),
        equipmentId: 'VOLVO-A40G',
        location: 'Cantera Norte',
        overallCondition: 'good',
        fluidLevels: 'ok',
        brakeSystem: 'ok',
        hydraulicSystem: 'ok',
        electricalSystem: 'ok',
        tireCondition: 'Buena, 150 PSI',
        notes: 'Inspección de rutina completada sin problemas.',
        safetyEquipment: true,
        passedInspection: true,
        createdAt: new Date('2024-07-26T11:00:00Z').toISOString(),
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
        status: 'pending',
        priority: 'high',
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
        finalStatus: 'repaired',
        repairCompleted: true,
        createdAt: new Date('2024-07-24T17:00:00Z').toISOString(),
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
        claimType: 'both',
        claimStatus: 'under-review',
        claimDescription: 'El alternador dejó de funcionar prematuramente.',
        createdAt: new Date('2024-07-23T14:00:00Z').toISOString(),
    },
    {
        id: 'FLUID-001',
        formType: 'Reporte de Análisis de Fluidos',
        sampleDate: new Date('2024-07-20T10:00:00Z').toISOString(),
        technicianName: 'Lucía Fernández',
        equipmentId: 'CAT-D6',
        fluidType: 'engine_oil',
        sampleId: 'ACEITE-MOTOR-CATD6-001',
        viscosityLevel: 40,
        contaminationLevel: '19/17/14',
        analysisSummary: 'Niveles de hierro ligeramente elevados. Se recomienda monitorear en el próximo cambio.',
        actionRequired: 'monitor',
        createdAt: new Date('2024-07-21T15:00:00Z').toISOString(),
    }
];

/**
 * Fetches all reports from the in-memory store.
 * In a real application, this would fetch from a database.
 */
export async function getReports(): Promise<any[]> {
  // Return a copy to prevent direct mutation of the server-side array
  return JSON.parse(JSON.stringify(reports));
}

export async function updateReport(updatedReportData: any) {
  try {
    const reportIndex = reports.findIndex(r => r.id === updatedReportData.id);
    if (reportIndex === -1) {
      throw new Error('Reporte no encontrado.');
    }
    // Update the report in the array
    reports[reportIndex] = { ...updatedReportData };
    console.log('Report updated in in-memory store:', reports[reportIndex]);
    revalidatePath('/reports');
    revalidatePath('/calendar');
    return { success: true, report: reports[reportIndex] };
  } catch (error) {
    console.error('Error updating report in in-memory store:', error);
    throw new Error('No se pudo actualizar el reporte. Por favor, inténtelo de nuevo.');
  }
}

export async function deleteReport(reportId: string): Promise<{ success: boolean }> {
  try {
    const reportIndex = reports.findIndex(r => r.id === reportId);
    if (reportIndex === -1) {
      throw new Error('Reporte no encontrado.');
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
      id: `MR-${String(Date.now()).slice(-6)}`, // Simple unique ID
      formType: 'Reporte de Mantenimiento',
      createdAt: new Date().toISOString(),
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
    const newId = `GR-${String(Date.now()).slice(-6)}`; // Simple unique ID
    const newReport = {
      ...reportData,
      id: newId,
      formType: 'Reporte General',
      createdAt: new Date().toISOString(),
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
        const newId = `INSP-${String(Date.now()).slice(-6)}`;
        const newReport = {
            ...reportData,
            id: newId,
            formType: 'Reporte de Inspección',
            createdAt: new Date().toISOString(),
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
        const newId = `REP-${String(Date.now()).slice(-6)}`;
        const newReport = {
            ...reportData,
            id: newId,
            formType: 'Reporte de Reparación',
            createdAt: new Date().toISOString(),
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
        const newId = `OT-${String(Date.now()).slice(-6)}`;
        const newReport = {
            ...reportData,
            id: newId,
            formType: 'Orden de Trabajo',
            createdAt: new Date().toISOString(),
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
        const newId = `PV-${String(Date.now()).slice(-6)}`;
        const newReport = {
            ...reportData,
            id: newId,
            formType: 'Visita Programada',
            createdAt: new Date().toISOString(),
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
        const newId = `WAR-${String(Date.now()).slice(-6)}`;
        const newReport = {
            ...reportData,
            id: newId,
            formType: 'Reclamo de Garantía',
            createdAt: new Date().toISOString(),
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
        const newId = `SAFE-${String(Date.now()).slice(-6)}`;
        const newReport = {
            ...reportData,
            id: newId,
            formType: 'Reporte de Cumplimiento de Seguridad',
            createdAt: new Date().toISOString(),
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
        const newId = `FLUID-${String(Date.now()).slice(-6)}`;
        const newReport = {
            ...reportData,
            id: newId,
            formType: 'Reporte de Análisis de Fluidos',
            createdAt: new Date().toISOString(),
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
        const newId = `RENT-${String(Date.now()).slice(-6)}`;
        const newReport = {
            ...reportData,
            id: newId,
            formType: 'Contrato de Alquiler',
            createdAt: new Date().toISOString(),
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
