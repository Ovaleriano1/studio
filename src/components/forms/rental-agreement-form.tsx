'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CalendarDays, Loader2, FileSignature } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { saveRentalAgreement } from '@/app/actions';

const rentalAgreementSchema = z.object({
  customerName: z.string().min(2, 'Se requiere el nombre del cliente.'),
  equipmentId: z.string().min(1, 'Se requiere el ID del equipo.'),
  rentalStartDate: z.date({ required_error: 'Se requiere la fecha de inicio del alquiler.' }),
  rentalEndDate: z.date({ required_error: 'Se requiere la fecha de fin del alquiler.' }),
  dailyRate: z.coerce.number().min(0, 'La tarifa diaria debe ser un número positivo.'),
  insuranceProvider: z.string().min(2, 'Se requiere el proveedor de seguros.'),
  deliveryAddress: z.string().min(10, 'Se requiere la dirección de entrega.'),
  operatorName: z.string().min(2, 'Se requiere el nombre del operador.'),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'Debe aceptar los términos y condiciones.',
  }),
}).refine(data => data.rentalEndDate > data.rentalStartDate, {
    message: "La fecha de fin debe ser posterior a la fecha de inicio.",
    path: ["rentalEndDate"],
});

type RentalAgreementValues = z.infer<typeof rentalAgreementSchema>;

export function RentalAgreementForm() {
  const { toast } = useToast();
  const form = useForm<RentalAgreementValues>({
    resolver: zodResolver(rentalAgreementSchema),
    defaultValues: {
      customerName: '',
      equipmentId: '',
      dailyRate: 0,
      insuranceProvider: '',
      deliveryAddress: '',
      operatorName: '',
      termsAccepted: false,
    },
  });

  async function onSubmit(data: RentalAgreementValues) {
    try {
      const serializableData = {
        ...data,
        rentalStartDate: data.rentalStartDate.toISOString(),
        rentalEndDate: data.rentalEndDate.toISOString(),
      };
      const newReportId = await saveRentalAgreement(serializableData);
      toast({
        title: '¡Contrato de Alquiler Creado!',
        description: `El contrato ha sido creado con el ID: ${newReportId}.`,
      });
      form.reset();
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error al Crear',
        description: 'No se pudo crear el contrato. Por favor, inténtelo de nuevo más tarde.',
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileSignature className="w-6 h-6 text-primary" />
          <CardTitle>Contrato de Alquiler</CardTitle>
        </div>
        <CardDescription>Cree un nuevo contrato de alquiler para un equipo.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Cliente</FormLabel>
                    <FormControl>
                      <Input placeholder="ACME Construction" {...field} />
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
                      <Input placeholder="e.g., EXCAVADORA-01" {...field} className="font-code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rentalStartDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Inicio de Alquiler</FormLabel>
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
                name="rentalEndDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Fin de Alquiler</FormLabel>
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
                          disabled={(date) => date < (form.getValues("rentalStartDate") || new Date())}
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
                name="dailyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tarifa Diaria ($)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="insuranceProvider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proveedor de Seguros</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Aseguradora S.A." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="operatorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Operador Designado</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Bill Operator" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="deliveryAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección de Entrega</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ingrese la dirección de entrega completa para el equipo..."
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
              name="termsAccepted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Aceptar Términos y Condiciones</FormLabel>
                    <FormDescription>El cliente acepta los términos y condiciones del alquiler.</FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full md:w-auto">
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando Contrato...
                </>
              ) : (
                'Crear Contrato de Alquiler'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
