'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CalendarDays, Loader2, ClipboardList } from 'lucide-react';
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

const inspectionFormSchema = z.object({
  inspectorName: z.string().min(2, { message: 'El nombre del inspector debe tener al menos 2 caracteres.' }),
  date: z.date({ required_error: 'Se requiere una fecha.' }),
  equipmentId: z.string().min(1, { message: 'Se requiere el ID del equipo.' }),
  location: z.string().min(2, { message: 'La ubicación debe tener al menos 2 caracteres.' }),
  overallCondition: z.enum(['good', 'fair', 'poor'], { required_error: 'Por favor seleccione la condición general.' }),
  fluidLevels: z.enum(['ok', 'low', 'na'], { required_error: 'Por favor seleccione el estado de los niveles de fluido.' }),
  brakeSystem: z.enum(['ok', 'adjustment_needed', 'repair_needed'], { required_error: 'Por favor seleccione el estado del sistema de frenos.' }),
  hydraulicSystem: z.enum(['ok', 'leaking', 'repair_needed'], { required_error: 'Por favor seleccione el estado del sistema hidráulico.' }),
  electricalSystem: z.enum(['ok', 'faulty', 'repair_needed'], { required_error: 'Por favor seleccione el estado del sistema eléctrico.' }),
  tireCondition: z.string().min(2, { message: 'Por favor describa la condición de los neumáticos.'}),
  attachmentsCondition: z.string().optional(),
  notes: z.string().min(10, { message: 'Por favor provea algunas notas (mínimo 10 caracteres).' }).max(500),
  safetyEquipment: z.boolean().default(false).optional(),
  passedInspection: z.boolean().default(false).optional(),
});

type InspectionFormValues = z.infer<typeof inspectionFormSchema>;

export function InspectionForm() {
  const { toast } = useToast();
  const form = useForm<InspectionFormValues>({
    resolver: zodResolver(inspectionFormSchema),
    defaultValues: {
      inspectorName: '',
      equipmentId: '',
      location: '',
      notes: '',
      tireCondition: '',
      attachmentsCondition: '',
      safetyEquipment: false,
      passedInspection: false,
    },
  });

  async function onSubmit(data: InspectionFormValues) {
    console.log(data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: '¡Reporte de Inspección Enviado!',
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
          <ClipboardList className="w-6 h-6 text-primary" />
          <CardTitle>Reporte de Inspección</CardTitle>
        </div>
        <CardDescription>Complete los detalles de la inspección del equipo.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Inspección</FormLabel>
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
                      <Input placeholder="e.g., VOLVO-A40G" {...field} className="font-code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Patio Oeste" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="overallCondition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condición General</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione condición" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="good">Buena</SelectItem>
                        <SelectItem value="fair">Regular</SelectItem>
                        <SelectItem value="poor">Mala</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="fluidLevels"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveles de Fluido</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione estado de fluidos" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ok">OK</SelectItem>
                        <SelectItem value="low">Bajo / Necesita Relleno</SelectItem>
                        <SelectItem value="na">N/A</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brakeSystem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sistema de Frenos</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione estado de frenos" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ok">OK</SelectItem>
                        <SelectItem value="adjustment_needed">Necesita Ajuste</SelectItem>
                        <SelectItem value="repair_needed">Necesita Reparación</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hydraulicSystem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sistema Hidráulico</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione estado hidráulico" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ok">OK</SelectItem>
                        <SelectItem value="leaking">Fugas</SelectItem>
                        <SelectItem value="repair_needed">Necesita Reparación</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="electricalSystem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sistema Eléctrico</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione estado eléctrico" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ok">OK</SelectItem>
                        <SelectItem value="faulty">Componente Defectuoso</SelectItem>
                        <SelectItem value="repair_needed">Necesita Reparación</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tireCondition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condición y Presión de Neumáticos</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Buena, 150 PSI" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="attachmentsCondition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condición de Accesorios (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Cuchara con desgaste menor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas de Inspección</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describa cualquier hallazgo, problema o comentario..."
                      className="resize-y min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Anote cualquier desgaste, daño o acciones de seguimiento requeridas.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="safetyEquipment"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Equipo de Seguridad OK</FormLabel>
                      <FormDescription>El extintor de incendios y el botiquín de primeros auxilios están presentes y en buen estado.</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="passedInspection"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Inspección Aprobada</FormLabel>
                      <FormDescription>Confirme que el equipo ha pasado todos los criterios de inspección.</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full md:w-auto">
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Reporte de Inspección'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
