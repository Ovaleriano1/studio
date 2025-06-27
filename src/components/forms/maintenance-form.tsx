
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CalendarDays, Loader2, Wrench } from 'lucide-react';
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
import { saveMaintenanceReport } from '@/app/actions';

const maintenanceFormSchema = z.object({
  technicianName: z.string().min(2, { message: 'El nombre del técnico debe tener al menos 2 caracteres.' }),
  date: z.date({ required_error: 'Se requiere una fecha.' }),
  equipmentId: z.string().min(1, { message: 'Se requiere el ID del equipo.' }),
  hoursOnMachine: z.coerce.number().min(0, { message: 'Las horas deben ser un número positivo.' }),
  serviceType: z.enum(['scheduled', 'emergency', 'preventive'], { required_error: 'Por favor seleccione un tipo de servicio.' }),
  workOrderNumber: z.string().optional(),
  clientName: z.string().min(2, { message: "El nombre del cliente es requerido." }),
  fluidCheck: z.enum(['ok', 'refill', 'na'], { required_error: 'Por favor seleccione el estado de los fluidos.' }),
  tirePressure: z.string().min(2, "Por favor ingrese la presión de neumáticos."),
  nextServiceDate: z.date().optional(),
  workPerformed: z.string().min(10, { message: 'Por favor describa el trabajo realizado (mínimo 10 caracteres).' }).max(500),
  partsUsed: z.string().max(500).optional(),
  safetyCheckPassed: z.boolean().default(false).optional(),
});

type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

export function MaintenanceForm() {
  const { toast } = useToast();
  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      technicianName: '',
      equipmentId: '',
      hoursOnMachine: 0,
      workPerformed: '',
      safetyCheckPassed: false,
      workOrderNumber: '',
      clientName: '',
      partsUsed: '',
      tirePressure: '',
    },
  });

  /*
  const generatePdf = async (data: MaintenanceFormValues, reportId: string) => {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    const serviceTypeMap: { [key: string]: string } = {
        scheduled: 'Programado',
        emergency: 'Emergencia',
        preventive: 'Preventivo',
    };
    const fluidCheckMap: { [key: string]: string } = {
        ok: 'OK',
        refill: 'Requiere Relleno',
        na: 'No Aplica',
    };

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Reporte de Visita de Mantenimiento', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`ID del Reporte: ${reportId}`, 20, 40);
    doc.text(`Fecha de Envío: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, 48);

    doc.line(20, 55, 190, 55);

    let y = 65;

    const addField = (label: string, value: string | number | null | undefined) => {
      if (value !== undefined && value !== null && value !== '') {
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}:`, 20, y);
        doc.setFont('helvetica', 'normal');
        
        const text = String(value);
        const splitText = doc.splitTextToSize(text, 120);
        doc.text(splitText, 75, y);
        y += (splitText.length * 5) + 5; 
      }
    };
    
    addField('Nombre del Técnico', data.technicianName);
    addField('Nombre del Cliente', data.clientName);
    addField('Fecha de Servicio', format(data.date, 'PPP', { locale: es }));
    addField('ID del Equipo', data.equipmentId);
    addField('Horas en la Máquina', data.hoursOnMachine);
    addField('Tipo de Servicio', serviceTypeMap[data.serviceType]);
    if(data.workOrderNumber) addField('Nº de Orden de Trabajo', data.workOrderNumber);
    addField('Revisión de Fluidos', fluidCheckMap[data.fluidCheck]);
    addField('Presión de Neumáticos', data.tirePressure);
    if(data.nextServiceDate) addField('Fecha Próximo Servicio', format(data.nextServiceDate, 'PPP', { locale: es }));
    addField('Verificación de Seguridad Aprobada', data.safetyCheckPassed ? 'Sí' : 'No');
    
    y += 5;
    doc.line(20, y - 3, 190, y - 3);

    addField('Trabajo Realizado', data.workPerformed);
    if (data.partsUsed) {
      addField('Repuestos Utilizados', data.partsUsed);
    } else {
      addField('Repuestos Utilizados', 'Ninguno');
    }

    doc.save(`reporte-mantenimiento-${reportId}.pdf`);
  };
  */

  async function onSubmit(data: MaintenanceFormValues) {
    try {
      const serializableData = {
        ...data,
        date: data.date.toISOString(),
        ...(data.nextServiceDate && { nextServiceDate: data.nextServiceDate.toISOString() }),
      };

      const newReportId = await saveMaintenanceReport(serializableData);
      toast({
        title: '¡Reporte Enviado!',
        description: `Su reporte de mantenimiento ha sido enviado con el ID: ${newReportId}.`,
      });
      
      // await generatePdf(data, newReportId);

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
          <Wrench className="w-6 h-6 text-primary" />
          <CardTitle>Reporte de Visita de Mantenimiento</CardTitle>
        </div>
        <CardDescription>Complete los detalles de la visita de mantenimiento.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
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
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Servicio</FormLabel>
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
                          disabled={(date) => date < new Date('1900-01-01')}
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
                name="hoursOnMachine"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horas en la Máquina</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="5120" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Servicio</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un tipo de servicio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="scheduled">Programado</SelectItem>
                        <SelectItem value="emergency">Emergencia</SelectItem>
                        <SelectItem value="preventive">Preventivo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="workOrderNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Orden de Trabajo (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="OT-12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Cliente</FormLabel>
                    <FormControl>
                      <Input placeholder="ACME Corp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fluidCheck"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Revisión de Fluidos</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione una opción" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ok">OK</SelectItem>
                        <SelectItem value="refill">Requiere Relleno</SelectItem>
                        <SelectItem value="na">No Aplica</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tirePressure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Presión de Neumáticos</FormLabel>
                    <FormControl>
                      <Input placeholder="Delanteros: 120 PSI, Traseros: 150 PSI" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="nextServiceDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha del Próximo Servicio (Opcional)</FormLabel>
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
                          disabled={(date) => date < new Date()}
                          initialFocus
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="workPerformed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trabajo Realizado</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describa el trabajo realizado en detalle..."
                      className="resize-y min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Una descripción detallada de todos los servicios y reparaciones.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="partsUsed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repuestos Utilizados (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Liste los repuestos, ej: 1x Filtro (P/N: 123-456)..."
                      className="resize-y min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Incluya número de parte y cantidad si es posible.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="safetyCheckPassed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Verificación de Seguridad Final Aprobada</FormLabel>
                    <FormDescription>Confirme que todas las verificaciones de seguridad se completaron y aprobaron.</FormDescription>
                  </div>
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
                'Enviar Formulario'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
