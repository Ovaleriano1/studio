'use client';

import { useState } from 'react';
import { Bot, Loader2, Send, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { suggestRelevantForm, type SuggestRelevantFormOutput } from '@/ai/flows/suggest-relevant-form';
import Link from 'next/link';

// Mapping from suggested form names to their URL paths
const formPathMap: { [key: string]: string } = {
  'Maintenance Visit': '/forms/maintenance',
  'Repair Visit': '/forms/repair',
  'Inspection Report': '/forms/inspection',
  'Work Order': '/forms/work-order',
  'Visita de Mantenimiento': '/forms/maintenance',
  'Visita de Reparación': '/forms/repair',
  'Reporte de Inspección': '/forms/inspection',
  'Orden de Trabajo': '/forms/work-order',
};

export function FormSuggestion() {
  const [location, setLocation] = useState('');
  const [equipmentModel, setEquipmentModel] = useState('');
  const [suggestion, setSuggestion] = useState<SuggestRelevantFormOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !equipmentModel) {
      setError('Por favor, ingrese la ubicación y el modelo del equipo.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuggestion(null);

    try {
      const result = await suggestRelevantForm({ location, equipmentModel });
      setSuggestion(result);
    } catch (err) {
      console.error(err);
      setError('No se pudo obtener una sugerencia. Por favor, inténtelo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const getFormPath = (formName: string): string | undefined => {
    // Find the key in formPathMap that is included in the formName
    const matchedKey = Object.keys(formPathMap).find(key => formName.toLowerCase().includes(key.toLowerCase()));
    return matchedKey ? formPathMap[matchedKey] : undefined;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" />
          <CardTitle className="font-headline">Sugerencia de Formulario con IA</CardTitle>
        </div>
        <CardDescription>
          Ingrese su ubicación y el modelo del equipo para obtener una sugerencia de formulario de la IA.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            placeholder="Ubicación (ej. Taller Principal, San Pedro Sula)" 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={isLoading}
          />
          <Input 
            placeholder="Modelo de Equipo (ej. MACK-LR-45, JOHN DEERE-8R)"
            value={equipmentModel}
            onChange={(e) => setEquipmentModel(e.target.value)}
            className="font-code"
            disabled={isLoading}
          />
          <Button type="submit" className="w-full" disabled={isLoading || !location || !equipmentModel}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Obteniendo sugerencia...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Sugerir Formulario
              </>
            )}
          </Button>
        </form>

        {error && <p className="text-sm text-destructive mt-4">{error}</p>}
        
        {suggestion && (
          <div className="mt-6 p-4 bg-accent/20 border border-accent/50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
                <Lightbulb className="w-6 h-6 text-accent-foreground" />
                <h3 className="text-lg font-semibold text-accent-foreground">{suggestion.suggestedForm}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{suggestion.reasoning}</p>
            {getFormPath(suggestion.suggestedForm) ? (
              <Button asChild>
                <Link href={getFormPath(suggestion.suggestedForm)!}>
                  Ir al formulario
                </Link>
              </Button>
            ) : (
                 <p className="text-xs text-muted-foreground italic">No se encontró un enlace directo para este formulario.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
