'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting the most relevant form to a technician based on their location and the equipment model they are working on.
 *
 * - suggestRelevantForm - A function that suggests the most relevant form.
 * - SuggestRelevantFormInput - The input type for the suggestRelevantForm function.
 * - SuggestRelevantFormOutput - The return type for the suggestRelevantForm function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelevantFormInputSchema = z.object({
  location: z.string().describe('The current location of the technician.'),
  equipmentModel: z.string().describe('The model of the equipment the technician is working on.'),
});

export type SuggestRelevantFormInput = z.infer<typeof SuggestRelevantFormInputSchema>;

const SuggestRelevantFormOutputSchema = z.object({
  suggestedForm: z.string().describe('The name of the most relevant form to fill out.'),
  reasoning: z.string().describe('The reasoning behind the form suggestion.'),
});

export type SuggestRelevantFormOutput = z.infer<typeof SuggestRelevantFormOutputSchema>;

export async function suggestRelevantForm(input: SuggestRelevantFormInput): Promise<SuggestRelevantFormOutput> {
  return suggestRelevantFormFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelevantFormPrompt',
  input: {schema: SuggestRelevantFormInputSchema},
  output: {schema: SuggestRelevantFormOutputSchema},
  prompt: `You are an AI assistant that suggests the most relevant form for a technician to fill out based on their location and the equipment model they are working on. You must always suggest only one form and the reasoning behind the suggestion.

Location: {{{location}}}
Equipment Model: {{{equipmentModel}}}

Consider these form types:
- Maintenance Visit (MACK/VOLVO/UD)
- Repair Visit (JOHN DEERE tractors)
- Inspection Report
- Work Order`,
});

const suggestRelevantFormFlow = ai.defineFlow(
  {
    name: 'suggestRelevantFormFlow',
    inputSchema: SuggestRelevantFormInputSchema,
    outputSchema: SuggestRelevantFormOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
