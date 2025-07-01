'use client';

import { useState } from 'react';
import { Bot, Loader2, Send, Lightbulb, AlertTriangle, Wrench, Settings, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { troubleshootEquipment, type TroubleshootEquipmentOutput } from '@/ai/flows/troubleshoot-equipment-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function TroubleshootingAssistant() {
  const [equipmentModel, setEquipmentModel] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [result, setResult] = useState<TroubleshootEquipmentOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemDescription || !equipmentModel) {
      setError('Por favor, ingrese el modelo del equipo y la descripción del problema.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await troubleshootEquipment({ equipmentModel, problemDescription });
      setResult(response);
    } catch (err) {
      console.error(err);
      setError('No se pudo obtener una respuesta de la IA. Por favor, inténtelo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const ResultCard = ({ title, icon, data }: { title: string, icon: React.ReactNode, data: string[] }) => (
    <Card>
        <CardHeader>
            <div className="flex items-center gap-3">
                {icon}
                <CardTitle>{title}</CardTitle>
            </div>
        </CardHeader>
        <CardContent>
            {data && data.length > 0 ? (
                <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                    {data.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-muted-foreground">No se encontraron sugerencias.</p>
            )}
        </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
        <Card className="h-full flex flex-col">
        <CardHeader>
            <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            <CardTitle className="font-headline">Asistente de Diagnóstico</CardTitle>
            </div>
            <CardDescription>
            Describa el problema que presenta el equipo para recibir ayuda de la IA.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input 
                    placeholder="Modelo de Equipo (ej. MACK-LR-45, JOHN DEERE-8R)"
                    value={equipmentModel}
                    onChange={(e) => setEquipmentModel(e.target.value)}
                    className="font-code"
                    disabled={isLoading}
                />
                <Textarea 
                    placeholder="Descripción detallada del problema (ej. El motor no arranca, se escuchan chasquidos al intentar encender...)"
                    value={problemDescription}
                    onChange={(e) => setProblemDescription(e.target.value)}
                    disabled={isLoading}
                    rows={4}
                />
            <Button type="submit" className="w-full" disabled={isLoading || !problemDescription || !equipmentModel}>
                {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analizando...
                </>
                ) : (
                <>
                    <Send className="mr-2 h-4 w-4" />
                    Obtener Diagnóstico
                </>
                )}
            </Button>
            </form>
        </CardContent>
        </Card>

        {error && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
        
        {result && (
            <div className="space-y-6">
                <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertTitle>Resultados del Diagnóstico</AlertTitle>
                    <AlertDescription>
                        A continuación se presentan las posibles causas, los pasos de diagnóstico y las piezas recomendadas. Recuerde que esto es una sugerencia y debe ser verificado por un técnico calificado.
                    </AlertDescription>
                </Alert>
                <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
                    <ResultCard title="Causas Posibles" icon={<Wrench className="w-6 h-6 text-destructive" />} data={result.potentialCauses} />
                    <ResultCard title="Pasos de Diagnóstico" icon={<Settings className="w-6 h-6 text-blue-500" />} data={result.diagnosticSteps} />
                    <ResultCard title="Partes Recomendadas" icon={<ClipboardList className="w-6 h-6 text-green-500" />} data={result.recommendedParts} />
                </div>
            </div>
        )}
    </div>
  );
}
