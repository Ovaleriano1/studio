'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, FilePlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { saveGeneralReport } from '@/app/actions';

const generalReportSchema = z.object({
  reportName: z.string().min(2, { message: 'El nombre del reporte debe tener al menos 2 caracteres.' }),
  submittedBy: z.string().min(2, { message: 'Se requiere el nombre de quien envía.' }),
  location: z.string().min(2, { message: 'La ubicación debe tener al menos 2 caracteres.' }),
  details: z.string().min(10, { message: 'Los detalles deben tener al menos 10 caracteres.' }),
});

type GeneralReportValues = z.infer<typeof generalReportSchema>;

export function GeneralReportForm() {
  const { toast } = useToast();
  const form = useForm<GeneralReportValues>({
    resolver: zodResolver(generalReportSchema),
    defaultValues: {
      reportName: '',
      submittedBy: '',
      location: '',
      details: '',
    },
  });

  /*
  const generatePdf = async (data: GeneralReportValues, reportId: string) => {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Reporte General', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const submissionDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    doc.text(`ID del Reporte: ${reportId}`, 20, 40);
    doc.text(`Fecha de Envío: ${submissionDate}`, 20, 48);

    doc.line(20, 55, 190, 55);

    doc.setFont('helvetica', 'bold');
    doc.text('Nombre del Reporte:', 20, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(data.reportName, 70, 65);

    doc.setFont('helvetica', 'bold');
    doc.text('Enviado Por:', 20, 75);
    doc.setFont('helvetica', 'normal');
    doc.text(data.submittedBy, 70, 75);

    doc.setFont('helvetica', 'bold');
    doc.text('Ubicación:', 20, 85);
    doc.setFont('helvetica', 'normal');
    doc.text(data.location, 70, 85);

    doc.line(20, 95, 190, 95);

    doc.setFont('helvetica', 'bold');
    doc.text('Detalles del Reporte:', 20, 105);
    doc.setFont('helvetica', 'normal');
    const splitDetails = doc.splitTextToSize(data.details, 170);
    doc.text(splitDetails, 20, 113);

    doc.save(`reporte-general-${reportId}.pdf`);
  };
  */

  async function onSubmit(data: GeneralReportValues) {
    try {
      const newReportId = await saveGeneralReport(data);
      toast({
        title: '¡Reporte Enviado!',
        description: `Su reporte general ha sido enviado con el ID: ${newReportId}.`,
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
          <FilePlus className="w-6 h-6 text-primary" />
          <CardTitle>Reporte General</CardTitle>
        </div>
        <CardDescription>Complete los campos para crear un nuevo reporte general.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="reportName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Reporte</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Reporte de Incidencia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="submittedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enviado Por</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Taller Principal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detalles del Reporte</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describa el evento o la información a reportar..."
                      className="resize-y min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Proporcione todos los detalles relevantes.</FormDescription>
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
                'Enviar Reporte'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
