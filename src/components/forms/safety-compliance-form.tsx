'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CalendarDays, Loader2, LifeBuoy } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const safetyFormSchema = z.object({
  reportDate: z.date({ required_error: 'Se requiere una fecha.' }),
  inspectorName: z.string().min(2, { message: 'Se requiere el nombre del inspector.' }),
  siteLocation: z.string().min(2, { message: 'Se requiere la ubicación del sitio.' }),
  equipmentId: z.string().min(1, { message: 'Se requiere el ID del equipo.' }),
  fireExtinguisherCheck: z.boolean().default(false),
  firstAidKitCheck: z.boolean().default(false),
  emergencyStopCheck: z.boolean().default(false),
  ppeComplianceNotes: z.string().min(10, 'Por favor, proporcione notas sobre el cumplimiento de EPP.'),
  overallSafetyRating: z.enum(['excellent', 'good', 'needs_improvement', 'unsafe'], { required_error: 'Por favor, seleccione una calificación de seguridad.' }),
});

type SafetyFormValues = z.infer<typeof safetyFormSchema>;

export function SafetyComplianceForm() {
  const { toast } = useToast();
  const form = useForm<SafetyFormValues>({
    resolver: zodResolver(safetyFormSchema),
    defaultValues: {
      inspectorName: '',
      siteLocation: '',
      equipmentId: '',
      ppeComplianceNotes: '',
      fireExtinguisherCheck: false,
      firstAidKitCheck: false,
      emergencyStopCheck: false,
    },
  });

  async function onSubmit(data: SafetyFormValues) {
    console.log(data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: '¡Reporte de Seguridad Enviado!',
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
    form.reset();
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <LifeBuoy className="w-6 h-6 text-primary" />
          <CardTitle>Reporte de Cumplimiento de Seguridad</CardTitle>
        </div>
        <CardDescription>Documente la verificación de cumplimiento de seguridad para un sitio o equipo.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="inspectorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Inspector</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reportDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha del Reporte</FormLabel>
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
                name="siteLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sitio/Ubicación</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Cantera Norte" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="equipmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID del Equipo (si aplica)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., VOLVO-A40G" {...field} className="font-code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-medium">Lista de Verificación</h3>
                <FormField
                control={form.control}
                name="fireExtinguisherCheck"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FormLabel className="text-base">Extintor de Incendios</FormLabel>
                        <FormDescription>¿El extintor está presente, cargado y accesible?</FormDescription>
                    </div>
                    <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="firstAidKitCheck"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FormLabel className="text-base">Botiquín de Primeros Auxilios</FormLabel>
                        <FormDescription>¿El botiquín está abastecido y accesible?</FormDescription>
                    </div>
                    <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="emergencyStopCheck"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FormLabel className="text-base">Parada de Emergencia</FormLabel>
                        <FormDescription>¿Los botones de parada de emergencia son funcionales y no están obstruidos?</FormDescription>
                    </div>
                    <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    </FormItem>
                )}
                />
            </div>

            <FormField
              control={form.control}
              name="ppeComplianceNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas de Cumplimiento de EPP</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Comente sobre el uso de Equipo de Protección Personal (cascos, chalecos, etc.)..."
                      className="resize-y min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
                control={form.control}
                name="overallSafetyRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calificación General de Seguridad</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione una calificación" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="excellent">Excelente</SelectItem>
                        <SelectItem value="good">Buena</SelectItem>
                        <SelectItem value="needs_improvement">Necesita Mejora</SelectItem>
                        <SelectItem value="unsafe">Inseguro</SelectItem>
                      </SelectContent>
                    </Select>
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
                'Enviar Reporte de Seguridad'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
