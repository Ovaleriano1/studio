'use server';

import { suggestRelevantForm, type SuggestRelevantFormInput, type SuggestRelevantFormOutput } from '@/ai/flows/suggest-relevant-form';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export async function getFormSuggestion(input: SuggestRelevantFormInput): Promise<SuggestRelevantFormOutput> {
  try {
    const result = await suggestRelevantForm(input);
    return result;
  } catch (error) {
    console.error('Error in getFormSuggestion server action:', error);
    throw new Error('Failed to process the form suggestion.');
  }
}

export async function saveMaintenanceReport(reportData: any) {
  try {
    const reportWithTimestamp = {
      ...reportData,
      createdAt: Timestamp.now(),
    };
    await addDoc(collection(db, 'maintenanceReports'), reportWithTimestamp);
  } catch (error) {
    console.error('Error saving maintenance report to Firestore:', error);
    throw new Error('Could not save the report. Please try again.');
  }
}
