'use server';

/**
 * @fileOverview This file defines a Genkit flow for troubleshooting heavy machinery issues.
 *
 * - troubleshootEquipment - An AI agent that provides diagnostic advice.
 * - TroubleshootEquipmentInput - The input type for the troubleshootEquipment function.
 * - TroubleshootEquipmentOutput - The return type for the troubleshootEquipment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const TroubleshootEquipmentInputSchema = z.object({
  equipmentModel: z.string().describe('The model of the equipment experiencing issues.'),
  problemDescription: z.string().describe('A detailed description of the problem or symptoms.'),
});
export type TroubleshootEquipmentInput = z.infer<typeof TroubleshootEquipmentInputSchema>;

const TroubleshootEquipmentOutputSchema = z.object({
  potentialCauses: z.array(z.string()).describe('A list of likely causes for the described problem.'),
  diagnosticSteps: z.array(z.string()).describe('A step-by-step guide to diagnose the issue.'),
  recommendedParts: z.array(z.string()).describe('A list of parts that may need inspection or replacement.'),
});
export type TroubleshootEquipmentOutput = z.infer<typeof TroubleshootEquipmentOutputSchema>;

export async function troubleshootEquipment(input: TroubleshootEquipmentInput): Promise<TroubleshootEquipmentOutput> {
  return troubleshootEquipmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'troubleshootEquipmentPrompt',
  input: {schema: TroubleshootEquipmentInputSchema},
  output: {schema: TroubleshootEquipmentOutputSchema},
  model: 'googleai/gemini-2.0-flash',
  prompt: `You are an expert heavy machinery diagnostician with over 30 years of experience working with brands like MACK, VOLVO, UD, JOHN DEERE, and CATERPILLAR.

A technician needs your help diagnosing an issue. Based on the equipment model and problem description they provide, you must generate a structured troubleshooting guide.

Provide a concise and clear list for each of the following output fields:
1.  **potentialCauses**: List the most likely root causes of the problem.
2.  **diagnosticSteps**: Provide a clear, numbered, step-by-step procedure for the technician to follow to identify the cause.
3.  **recommendedParts**: List the specific parts or components that should be inspected, tested, or are likely to need replacement.

Equipment Model: {{{equipmentModel}}}
Problem Description: {{{problemDescription}}}`,
});

const troubleshootEquipmentFlow = ai.defineFlow(
  {
    name: 'troubleshootEquipmentFlow',
    inputSchema: TroubleshootEquipmentInputSchema,
    outputSchema: TroubleshootEquipmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
