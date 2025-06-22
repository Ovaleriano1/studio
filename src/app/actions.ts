'use server';

import { suggestRelevantForm, type SuggestRelevantFormInput, type SuggestRelevantFormOutput } from '@/ai/flows/suggest-relevant-form';

export async function getFormSuggestion(input: SuggestRelevantFormInput): Promise<SuggestRelevantFormOutput> {
  try {
    const result = await suggestRelevantForm(input);
    return result;
  } catch (error) {
    console.error('Error in getFormSuggestion server action:', error);
    throw new Error('Failed to process the form suggestion.');
  }
}
