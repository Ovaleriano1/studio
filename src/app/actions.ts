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
    // Data from the client has dates as ISO strings.
    // Convert them to Firestore Timestamps for proper storage.
    const dataToSave = {
      ...reportData,
      date: Timestamp.fromDate(new Date(reportData.date)),
      createdAt: Timestamp.now(),
    };

    // The 'nextServiceDate' is optional, so we only add it if it exists.
    if (reportData.nextServiceDate) {
      dataToSave.nextServiceDate = Timestamp.fromDate(new Date(reportData.nextServiceDate));
    }

    await addDoc(collection(db, 'maintenanceReports'), dataToSave);
  } catch (error) {
    console.error('Error saving maintenance report to Firestore:', error);
    throw new Error('Could not save the report. Please try again.');
  }
}

export async function saveGeneralReport(reportData: any): Promise<string> {
  try {
    const dataToSave = {
      ...reportData,
      createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, 'generalReports'), dataToSave);
    return docRef.id;
  } catch (error) {
    console.error('Error saving general report to Firestore:', error);
    throw new Error('Could not save the report. Please try again.');
  }
}
