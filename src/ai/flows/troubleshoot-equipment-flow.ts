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
  potentialCauses: z.array(z.string()).describe('Una lista de las causas probables del problema descrito.'),
  diagnosticSteps: z.array(z.string()).describe('Una guía paso a paso para diagnosticar el problema.'),
  recommendedParts: z.array(z.string()).describe('Una lista de piezas que pueden necesitar inspección o reemplazo.'),
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
  prompt: `Eres un experto diagnosticador de maquinaria pesada con más de 30 años de experiencia trabajando con marcas como MACK, VOLVO, UD, JOHN DEERE y CATERPILLAR.
TODA TU RESPUESTA DEBE ESTAR EN ESPAÑOL.

Un técnico necesita tu ayuda para diagnosticar un problema. Basado en el modelo del equipo y la descripción del problema que proporcionan, debes generar una guía de solución de problemas estructurada en español.

Proporcione una lista concisa y clara en español para cada uno de los siguientes campos de salida:
1.  **potentialCauses**: Enumere las causas más probables del problema.
2.  **diagnosticSteps**: Proporcione un procedimiento claro, numerado y paso a paso para que el técnico lo siga para identificar la causa.
3.  **recommendedParts**: Enumere las piezas o componentes específicos que deben inspeccionarse, probarse o que probablemente necesiten ser reemplazados.

Modelo de Equipo: {{{equipmentModel}}}
Descripción del Problema: {{{problemDescription}}}`,
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
