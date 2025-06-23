'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CalendarDays, Loader2, ShieldCheck } from 'lucide-react';
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
import { saveWarrantyClaim } from '@/app/actions';

const warrantyFormSchema = z.object({
  customerName: z.string().min(2, { message: 'Se requiere el nombre del cliente.' }),
  equipmentId: z.string().min(1, { message: 'Se requiere el ID del equipo.' }),
  productModel: z.string().min(2, { message: 'Se requiere el modelo del producto.' }),
  serialNumber: z.string().min(2, { message: 'Se requiere el número de serie.' }),
  purchaseDate: z.date({ required_error: 'Se requiere la fecha de compra.' }),
  failureDate: z.date({ required_error: 'Se requiere la fecha de la falla.' }),
  hoursAtFailure: z.coerce.number().min(0, 'Las horas deben ser un número positivo.'),
  dealerName: z.string().min(2, 'Se requiere el nombre del distribuidor.'),
  invoiceNumber: z.string().min(1, { message: 'Se requiere el número de factura.' }),
  partNumberFailed: z.string().min(1, 'Se requiere el número de parte que falló.'),
  partNumberReplaced: z.string().min(1, 'Se requiere el número de parte de reemplazo.'),
  claimType: z.enum(['part', 'labor', 'both'], { required_error: 'Por favor seleccione un tipo de reclamo.' }),
  claimStatus: z.enum(['submitted', 'under-review', 'approved', 'denied'], { required_error: 'Por favor seleccione un estado de reclamo.' }),
  claimDescription: z.string().min(10, { message: 'Por favor describa el reclamo (mínimo 10 caracteres).' }).max(500),
  technicianNotes: z.string().optional(),
});

type WarrantyFormValues = z.infer<typeof warrantyFormSchema>;

export function WarrantyForm() {
  const { toast } = useToast();
  const form = useForm<WarrantyFormValues>({
    resolver: zodResolver(warrantyFormSchema),
    defaultValues: {
      customerName: '',
      equipmentId: '',
      productModel: '',
      serialNumber: '',
      hoursAtFailure: 0,
      dealerName: '',
      invoiceNumber: '',
      partNumberFailed: '',
      partNumberReplaced: '',
      claimStatus: 'submitted',
      claimDescription: '',
      technicianNotes: '',
    },
  });

  async function onSubmit(data: WarrantyFormValues) {
    try {
      const serializableData = {
        ...data,
        purchaseDate: data.purchaseDate.toISOString(),
        failureDate: data.failureDate.toISOString(),
      };
      const newReportId = await saveWarrantyClaim(serializableData);
      toast({
        title: '¡Reclamo de Garantía Enviado!',
        description: `El reclamo ha sido enviado con el ID: ${newReportId}.`,
      });
      form.reset();
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error al Enviar',
        description: 'No se pudo enviar el reclamo. Por favor, inténtelo de nuevo más tarde.',
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <CardTitle>Reclamo de Garantía</CardTitle>
        </div>
        <CardDescription>Presente un nuevo reclamo de garantía para un producto o equipo.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Cliente</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" {...field} />
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
                    <FormLabel>ID de Equipo / Producto</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., CAT-D6" {...field} className="font-code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="productModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo del Producto</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., D6T" {...field} className="font-code"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="serialNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Serie</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 12345ABC" {...field} className="font-code"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="purchaseDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Compra</FormLabel>
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
                name="failureDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Falla</FormLabel>
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
                name="hoursAtFailure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horas en Falla</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1250" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dealerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Distribuidor</FormLabel>
                    <FormControl>
                      <Input placeholder="Maquinaria Confiable Co." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Factura Original</FormLabel>
                    <FormControl>
                      <Input placeholder="INV-2024-00123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="partNumberFailed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Parte Fallada</FormLabel>
                    <FormControl>
                      <Input placeholder="P/N: 123-ABC" {...field} className="font-code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="partNumberReplaced"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Parte Reemplazada</FormLabel>
                    <FormControl>
                      <Input placeholder="P/N: 123-ABD" {...field} className="font-code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="claimType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Reclamo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="part">Solo Parte</SelectItem>
                        <SelectItem value="labor">Solo Mano de Obra</SelectItem>
                        <SelectItem value="both">Parte y Mano de Obra</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="claimStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado del Reclamo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="submitted">Enviado</SelectItem>
                        <SelectItem value="under-review">En Revisión</SelectItem>
                        <SelectItem value="approved">Aprobado</SelectItem>
                        <SelectItem value="denied">Rechazado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="claimDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción del Reclamo</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describa el motivo del reclamo de garantía en detalle..."
                      className="resize-y min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                   <FormDescription>Por favor, sea lo más específico posible.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="technicianNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas del Técnico (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Agregue cualquier nota relevante del técnico..."
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
                  Enviando...
                </>
              ) : (
                'Enviar Reclamo de Garantía'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
