'use client';

import { Bot } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function FormSuggestion() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" />
          <CardTitle className="font-headline">Sugerencia de Formulario con IA</CardTitle>
        </div>
        <CardDescription>Esta función está temporalmente deshabilitada para estabilizar la aplicación.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center">
        <div className="text-center text-muted-foreground p-8">
            <p>La sugerencia de formularios volverá a estar disponible pronto.</p>
        </div>
      </CardContent>
    </Card>
  );
}
