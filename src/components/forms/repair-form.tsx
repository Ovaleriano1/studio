'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CalendarDays, Loader2, Hammer, PenTool, Eraser, Camera, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { saveRepairReport } from '@/app/actions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

const repairFormSchema = z.object({
  technicianName: z.string().min(2, { message: 'El nombre del técnico debe tener al menos 2 caracteres.' }),
  clientName: z.string().min(2, { message: 'Se requiere el nombre del cliente.' }),
  workOrderNumber: z.string().optional(),
  date: z.date({ required_error: 'Se requiere una fecha.' }),
  equipmentId: z.string().min(1, { message: 'Se requiere el ID del equipo.' }),
  laborHours: z.coerce.number().min(0, { message: 'Las horas deben ser un número positivo.' }),
  initialPhotoDataUri: z.string().optional(),
  symptoms: z.string().min(10, { message: 'Por favor describa los síntomas (mínimo 10 caracteres).' }),
  problemDescription: z.string().min(10, { message: 'Por favor describa el problema (mínimo 10 caracteres).' }).max(500),
  diagnosticSteps: z.string().min(10, { message: 'Por favor describa los pasos de diagnóstico (mínimo 10 caracteres).' }),
  partsUsed: z.string().optional(),
  testingNotes: z.string().optional(),
  finalPhotoDataUri: z.string().optional(),
  finalStatus: z.enum(['reparado', 'necesita_seguimiento', 'esperando_repuestos']),
  repairCompleted: z.boolean().default(false),
  followUpRequired: z.boolean().default(false),
  signatureDataUri: z.string().optional(),
});

type RepairFormValues = z.infer<typeof repairFormSchema>;

export function RepairForm() {
  const { toast } = useToast();
  const form = useForm<RepairFormValues>({
    resolver: zodResolver(repairFormSchema),
    defaultValues: {
      technicianName: '',
      clientName: '',
      workOrderNumber: '',
      equipmentId: '',
      symptoms: '',
      problemDescription: '',
      diagnosticSteps: '',
      partsUsed: '',
      laborHours: 0,
      testingNotes: '',
      repairCompleted: false,
      followUpRequired: false,
    },
  });

  // State and Refs for Camera
  const [cameraState, setCameraState] = useState<{ isOpen: boolean; targetField: 'initial' | 'final' | null }>({
    isOpen: false,
    targetField: null,
  });
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const photoCanvasRef = useRef<HTMLCanvasElement>(null);

  // State and Refs for Signature Pad
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      form.setValue('signatureDataUri', undefined);
    }
  };

  // Effect for Signature Pad
  useEffect(() => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    const getCoords = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (e instanceof MouseEvent) {
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
      }
      if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
      }
      return { x: 0, y: 0 };
    };

    const startDrawing = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      isDrawingRef.current = true;
      const { x, y } = getCoords(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawingRef.current) return;
      e.preventDefault();
      const { x, y } = getCoords(e);
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const stopDrawing = () => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      ctx.closePath();
      const dataUrl = canvas.toDataURL('image/png');
      form.setValue('signatureDataUri', dataUrl);
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);

      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [form]);

  // Effect for Camera
  useEffect(() => {
    if (cameraState.isOpen) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Acceso a la cámara denegado',
            description: 'Por favor, habilite los permisos de la cámara en su navegador.',
          });
        }
      };
      getCameraPermission();
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [cameraState.isOpen, toast]);

  const openCamera = (targetField: 'initial' | 'final') => {
    setCameraState({ isOpen: true, targetField });
  };

  const handleTakePhoto = () => {
    if (videoRef.current && photoCanvasRef.current && cameraState.targetField) {
      const video = videoRef.current;
      const canvas = photoCanvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      const dataUri = canvas.toDataURL('image/jpeg');
      
      const fieldName = cameraState.targetField === 'initial' ? 'initialPhotoDataUri' : 'finalPhotoDataUri';
      form.setValue(fieldName, dataUri);
      
      setCameraState({ isOpen: false, targetField: null });
    }
  };
  
  const initialPhotoDataUri = form.watch('initialPhotoDataUri');
  const finalPhotoDataUri = form.watch('finalPhotoDataUri');

  const PhotoCaptureCard = ({
    label,
    fieldValue,
    onButtonClick,
    onClear,
  }: {
    label: string;
    fieldValue: string | undefined;
    onButtonClick: () => void;
    onClear: () => void;
  }) => (
    <Card>
      <CardContent className="p-4">
        {fieldValue ? (
          <div className="relative w-full max-w-xs mx-auto">
            <Image src={fieldValue} alt={label} width={400} height={300} className="rounded-md" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7"
              onClick={onClear}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-center p-6 border-2 border-dashed rounded-md">
            <p className="text-sm text-muted-foreground">No se ha añadido ninguna foto.</p>
            <Button type="button" onClick={onButtonClick}>
              <Camera className="mr-2 h-4 w-4" />
              {label}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  async function onSubmit(data: RepairFormValues) {
    try {
      const serializableData = {
        ...data,
        date: data.date.toISOString(),
      };
      const newReportId = await saveRepairReport(serializableData);
      toast({
        title: '¡Formulario de Reparación Enviado!',
        description: `Su reporte de reparación ha sido enviado con el ID: ${newReportId}.`
      });
      form.reset();
      clearSignature();
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
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Hammer className="w-6 h-6 text-primary" />
          <CardTitle>Visita de Reparación</CardTitle>
        </div>
        <CardDescription>Documente los detalles de una visita de reparación.</CardDescription>
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
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Cliente</FormLabel>
                    <FormControl>
                      <Input placeholder="ACME Inc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="workOrderNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nº de Orden de Trabajo (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="OT-12345" {...field} />
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
                    <FormLabel>Fecha de Reparación</FormLabel>
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
                      <Input placeholder="e.g., JOHN DEERE-8R" {...field} className="font-code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="laborHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horas de Trabajo</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="4.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
                <FormLabel>Evidencia Fotográfica Inicial</FormLabel>
                <PhotoCaptureCard
                    label="Agregar Foto Inicial"
                    fieldValue={initialPhotoDataUri}
                    onButtonClick={() => openCamera('initial')}
                    onClear={() => form.setValue('initialPhotoDataUri', undefined)}
                />
            </div>
            
            <FormField
              control={form.control}
              name="symptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Síntomas Reportados</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describa los síntomas iniciales reportados por el cliente u operador..."
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
              name="diagnosticSteps"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pasos de Diagnóstico Realizados</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Liste los procedimientos de diagnóstico realizados..."
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
              name="problemDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trabajo Realizado / Resolución del Problema</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describa el trabajo realizado para solucionar el problema..."
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
              name="partsUsed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repuestos Utilizados</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Liste todos los repuestos utilizados, incluyendo números de parte y cantidades..."
                      className="resize-y min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                   <FormDescription>Ej: 1x Filtro (P/N: 123-456), 2x Perno (P/N: 789-012)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="testingNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas de Pruebas Post-Reparación (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describa los resultados de cualquier prueba después de la reparación..."
                      className="resize-y min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
                <FormLabel>Evidencia Fotográfica Final</FormLabel>
                <PhotoCaptureCard
                    label="Agregar Foto Final"
                    fieldValue={finalPhotoDataUri}
                    onButtonClick={() => openCamera('final')}
                    onClear={() => form.setValue('finalPhotoDataUri', undefined)}
                />
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <FormLabel>Firma del Cliente</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={clearSignature}>
                  <Eraser className="mr-2 h-4 w-4" />
                  Limpiar
                </Button>
              </div>
              <div className="rounded-md border bg-background">
                <canvas
                  ref={signatureCanvasRef}
                  width={500}
                  height={200}
                  className="w-full h-auto touch-none rounded-md"
                />
              </div>
              <FormDescription>El cliente o supervisor debe firmar en el recuadro de arriba.</FormDescription>
            </div>
            <div className="grid md:grid-cols-3 gap-8 pt-4">
              <FormField
                control={form.control}
                name="repairCompleted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Reparación Completada</FormLabel>
                      <FormDescription>El trabajo principal de reparación ha finalizado.</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="followUpRequired"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Requiere Seguimiento</FormLabel>
                      <FormDescription>Se necesita una acción adicional o una visita de regreso.</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="finalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado Final</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione el estado final" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="reparado">Reparado y Operacional</SelectItem>
                        <SelectItem value="necesita_seguimiento">Necesita Seguimiento</SelectItem>
                        <SelectItem value="esperando_repuestos">Esperando Repuestos</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
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
                'Enviar Formulario de Reparación'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>

    <Dialog open={cameraState.isOpen} onOpenChange={(open) => setCameraState({ ...cameraState, isOpen: open })}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Tomar Foto</DialogTitle>
            </DialogHeader>
            <div className="relative">
                <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted playsInline />
                <canvas ref={photoCanvasRef} className="hidden" />
                {hasCameraPermission === false && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertTitle>Acceso a la cámara requerido</AlertTitle>
                        <AlertDescription>
                            Por favor permita el acceso a la cámara para usar esta función.
                        </AlertDescription>
                    </Alert>
                )}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setCameraState({ isOpen: false, targetField: null })}>Cancelar</Button>
                <Button onClick={handleTakePhoto} disabled={!hasCameraPermission}>Tomar Foto</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
