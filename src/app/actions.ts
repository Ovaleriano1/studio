'use server';

import { revalidatePath } from 'next/cache';
import { suggestRelevantForm, type SuggestRelevantFormInput, type SuggestRelevantFormOutput } from '@/ai/flows/suggest-relevant-form';

// In-memory store for reports as a temporary workaround for DB connection issues.
// NOTE: This data will reset every time the server restarts.
let reports: any[] = [
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
    }
];

export async function getFormSuggestion(input: SuggestRelevantFormInput): Promise<SuggestRelevantFormOutput> {
  try {
    const result = await suggestRelevantForm(input);
    return result;
  } catch (error) {
    console.error('Error in getFormSuggestion server action:', error);
    throw new Error('Failed to process the form suggestion.');
  }
}

/**
 * Fetches all reports from the in-memory store.
 * In a real application, this would fetch from a database.
 */
export async function getReports(): Promise<any[]> {
  // Return a copy to prevent direct mutation of the server-side array
  return JSON.parse(JSON.stringify(reports));
}


export async function saveMaintenanceReport(reportData: any) {
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
