'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bot, FilePlus2, Loader2, ChevronsRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { SuggestRelevantFormOutput } from '@/ai/flows/suggest-relevant-form';
import { getFormSuggestion } from '@/app/actions';
import { Skeleton } from './ui/skeleton';

const formSchema = z.object({
  location: z.string().min(2, { message: 'La ubicación debe tener al menos 2 caracteres.' }),
  equipmentModel: z.string().min(2, { message: 'El modelo de equipo debe tener al menos 2 caracteres.' }),
});

export function FormSuggestion() {
  const { toast } = useToast();
  const [suggestion, setSuggestion] = useState<SuggestRelevantFormOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: '',
      equipmentModel: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSuggestion(null);
    try {
      const result = await getFormSuggestion(values);
      setSuggestion(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo obtener la sugerencia de formulario. Por favor, inténtelo de nuevo.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" />
          <CardTitle className="font-headline">Sugerencia de Formulario con IA</CardTitle>
        </div>
        <CardDescription>Ingrese los detalles para obtener una recomendación del formulario más relevante.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación del Técnico</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., North Quarry Site" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="equipmentModel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo de Equipo</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., JOHN DEERE-8R" {...field} className="font-code" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Obteniendo Sugerencia...
                </>
              ) : (
                <>
                  Sugerir Formulario <ChevronsRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </Form>
        {isLoading && (
            <div className="mt-6 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-16 w-full" />
            </div>
        )}
        {suggestion && (
          <Card className="mt-6 bg-background">
            <CardHeader>
              <CardTitle className="text-lg font-headline">Sugerido: {suggestion.suggestedForm}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{suggestion.reasoning}</p>
            </CardContent>
            <CardFooter>
              <Button variant="default" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                <FilePlus2 className="mr-2 h-4 w-4" />
                Crear {suggestion.suggestedForm}
              </Button>
            </CardFooter>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
