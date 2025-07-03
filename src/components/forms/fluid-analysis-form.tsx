'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CalendarDays, Loader2, FlaskConical } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { saveFluidAnalysis } from '@/app/actions';

const fluidAnalysisSchema = z.object({
  sampleDate: z.date({ required_error: 'Se requiere una fecha de muestra.' }),
  technicianName: z.string().min(2, { message: 'Se requiere el nombre del técnico.' }),
  equipmentId: z.string().min(1, { message: 'Se requiere el ID del equipo.' }),
  fluidType: z.enum(['aceite_motor', 'fluido_hidraulico', 'refrigerante', 'fluido_transmision'], { required_error: 'Por favor seleccione un tipo de fluido.' }),
  sampleId: z.string().min(1, 'Se requiere el ID de la muestra.'),
  viscosityLevel: z.coerce.number().min(0, 'La viscosidad debe ser un valor positivo.'),
  contaminationLevel: z.string().min(1, 'Se requiere el nivel de contaminación.'),
  analysisSummary: z.string().min(10, 'Se requiere un resumen del análisis.'),
  actionRequired: z.enum(['ninguna', 'cambiar_fluido', 'monitorear', 'reparacion_inmediata'], { required_error: 'Por favor seleccione una acción.' }),
});

type FluidAnalysisValues = z.infer<typeof fluidAnalysisSchema>;

export function FluidAnalysisForm() {
  const { toast } = useToast();
  const form = useForm<FluidAnalysisValues>({
    resolver: zodResolver(fluidAnalysisSchema),
    defaultValues: {
      technicianName: '',
      equipmentId: '',
      sampleId: '',
      viscosityLevel: 0,
      contaminationLevel: '',
      analysisSummary: '',
    },
  });

  async function onSubmit(data: FluidAnalysisValues) {
    try {
      const serializableData = {
        ...data,
        sampleDate: data.sampleDate.toISOString(),
      };
      const newReportId = await saveFluidAnalysis(serializableData);
      toast({
        title: '¡Reporte Enviado!',
        description: `Su reporte de análisis de fluidos ha sido enviado con el ID: ${newReportId}.`,
      });
      form.reset();
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error al Enviar',
        description: 'No se pudo enviar el reporte. Por favor, inténtelo de nuevo más tarde.',
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FlaskConical className="w-6 h-6 text-primary" />
          <CardTitle>Reporte de Análisis de Fluidos</CardTitle>
        </div>
        <CardDescription>Registre los resultados del análisis de una muestra de fluido.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FormField
                control={form.control}
                name="technicianName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Técnico</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sampleDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Muestra</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                          >
                            {field.value ? format(field.value, 'PPP', { locale: es }) : <span>Seleccione una fecha</span>}
                            <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                          initialFocus
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="equipmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID del Equipo</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., CAT-D6" {...field} className="font-code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sampleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID de Muestra</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., ACEITE-00123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fluidType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Fluido</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione el tipo de fluido" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="aceite_motor">Aceite de Motor</SelectItem>
                        <SelectItem value="fluido_hidraulico">Fluido Hidráulico</SelectItem>
                        <SelectItem value="refrigerante">Refrigerante</SelectItem>
                        <SelectItem value="fluido_transmision">Fluido de Transmisión</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="viscosityLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nivel de Viscosidad (cSt)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="40" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                <FormField
                control={form.control}
                name="contaminationLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contaminación (Código ISO)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 18/16/13" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="actionRequired"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Acción Requerida</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione la acción requerida" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ninguna">Ninguna</SelectItem>
                        <SelectItem value="monitorear">Monitorear</SelectItem>
                        <SelectItem value="cambiar_fluido">Cambiar Fluido</SelectItem>
                        <SelectItem value="reparacion_inmediata">Reparación Inmediata Necesaria</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="analysisSummary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resumen de Análisis y Recomendaciones</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Resuma los hallazgos del laboratorio y recomiende los próximos pasos..."
                      className="resize-y min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Incluya detalles sobre metales de desgaste, aditivos y condición general del fluido.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full md:w-auto">
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Reporte de Análisis'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
