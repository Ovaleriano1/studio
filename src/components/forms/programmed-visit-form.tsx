'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CalendarDays, Loader2, CalendarCheck } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { saveProgrammedVisit } from '@/app/actions';

const programmedVisitSchema = z.object({
  clientName: z.string().min(2, { message: 'El nombre del cliente debe tener al menos 2 caracteres.' }),
  location: z.string().min(2, { message: 'La ubicación debe tener al menos 2 caracteres.' }),
  scheduledDate: z.date({ required_error: 'Se requiere una fecha programada.' }),
  assignedTechnician: z.string().min(2, { message: 'Se requiere el nombre del técnico.' }),
  equipmentId: z.string().min(1, { message: 'Se requiere el ID del equipo.' }),
  contactPerson: z.string().min(2, { message: 'Se requiere la persona de contacto.' }),
  contactPhone: z.string().min(8, { message: 'Se requiere un número de teléfono válido.' }),
  visitPurpose: z.string().min(10, { message: 'Por favor describa el propósito de la visita (mínimo 10 caracteres).' }),
});

type ProgrammedVisitValues = z.infer<typeof programmedVisitSchema>;

export function ProgrammedVisitForm() {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<ProgrammedVisitValues>({
    resolver: zodResolver(programmedVisitSchema),
    defaultValues: {
      clientName: '',
      location: '',
      visitPurpose: '',
      assignedTechnician: '',
      equipmentId: '',
      contactPerson: '',
      contactPhone: '',
    },
  });

  async function onSubmit(data: ProgrammedVisitValues) {
    try {
      const serializableData = {
        ...data,
        scheduledDate: data.scheduledDate.toISOString(),
      };
      const newReportId = await saveProgrammedVisit(serializableData);
      toast({
        title: '¡Visita Programada!',
        description: `La visita ha sido programada con el ID: ${newReportId}.`,
      });
      form.reset();
      router.push('/calendar');
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error al Programar',
        description: 'No se pudo programar la visita. Por favor, inténtelo de nuevo más tarde.',
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-6 h-6 text-primary" />
          <CardTitle>Visita Programada</CardTitle>
        </div>
        <CardDescription>Programe una nueva visita para un cliente.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Cliente</FormLabel>
                    <FormControl>
                      <Input placeholder="ACME Corporation" {...field} />
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
                    <FormLabel>Ubicación / Sitio</FormLabel>
                    <FormControl>
                      <Input placeholder="Instalación Principal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha Programada</FormLabel>
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
               <FormField
                control={form.control}
                name="assignedTechnician"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Técnico Asignado</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Smith" {...field} />
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
                    <FormLabel>ID del Equipo</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. MACK-GR-12" {...field} className="font-code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Persona de Contacto en Sitio</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Bob Builder" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono de Contacto en Sitio</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="visitPurpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Propósito de la Visita</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Mantenimiento preventivo trimestral, Seguimiento de reparación reciente..."
                      className="resize-y min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full md:w-auto">
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Programando...
                </>
              ) : (
                'Programar Visita'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
