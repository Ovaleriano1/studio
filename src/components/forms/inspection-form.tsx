'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CalendarDays, Loader2, ClipboardList, Camera, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

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
import { saveInspectionReport } from '@/app/actions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

const inspectionFormSchema = z.object({
  inspectorName: z.string().min(2, { message: 'El nombre del inspector debe tener al menos 2 caracteres.' }),
  date: z.date({ required_error: 'Se requiere una fecha.' }),
  equipmentId: z.string().min(1, { message: 'Se requiere el ID del equipo.' }),
  location: z.string().min(2, { message: 'La ubicación debe tener al menos 2 caracteres.' }),
  initialPhotoDataUri: z.string().optional(),
  finalPhotoDataUri: z.string().optional(),
  overallCondition: z.enum(['buena', 'regular', 'mala'], { required_error: 'Por favor seleccione la condición general.' }),
  fluidLevels: z.enum(['ok', 'bajo', 'na'], { required_error: 'Por favor seleccione el estado de los niveles de fluido.' }),
  brakeSystem: z.enum(['ok', 'necesita_ajuste', 'necesita_reparacion'], { required_error: 'Por favor seleccione el estado del sistema de frenos.' }),
  hydraulicSystem: z.enum(['ok', 'fugas', 'necesita_reparacion'], { required_error: 'Por favor seleccione el estado del sistema hidráulico.' }),
  electricalSystem: z.enum(['ok', 'defectuoso', 'necesita_reparacion'], { required_error: 'Por favor seleccione el estado del sistema eléctrico.' }),
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

  const [cameraState, setCameraState] = useState<{ isOpen: boolean; targetField: 'initial' | 'final' | null }>({
    isOpen: false,
    targetField: null,
  });
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    if (videoRef.current && canvasRef.current && cameraState.targetField) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
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

  async function onSubmit(data: InspectionFormValues) {
    try {
      const serializableData = {
        ...data,
        date: data.date.toISOString(),
      };
      const newReportId = await saveInspectionReport(serializableData);
      toast({
        title: '¡Reporte de Inspección Enviado!',
        description: `Su reporte ha sido enviado con el ID: ${newReportId}.`,
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

  return (
    <>
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

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
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
                            <SelectItem value="buena">Buena</SelectItem>
                            <SelectItem value="regular">Regular</SelectItem>
                            <SelectItem value="mala">Mala</SelectItem>
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
                            <SelectItem value="bajo">Bajo / Necesita Relleno</SelectItem>
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
                            <SelectItem value="necesita_ajuste">Necesita Ajuste</SelectItem>
                            <SelectItem value="necesita_reparacion">Necesita Reparación</SelectItem>
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
                            <SelectItem value="fugas">Fugas</SelectItem>
                            <SelectItem value="necesita_reparacion">Necesita Reparación</SelectItem>
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
                            <SelectItem value="defectuoso">Componente Defectuoso</SelectItem>
                            <SelectItem value="necesita_reparacion">Necesita Reparación</SelectItem>
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
            
            <div className="space-y-2">
                <FormLabel>Evidencia Fotográfica Final</FormLabel>
                <PhotoCaptureCard
                    label="Agregar Foto Final"
                    fieldValue={finalPhotoDataUri}
                    onButtonClick={() => openCamera('final')}
                    onClear={() => form.setValue('finalPhotoDataUri', undefined)}
                />
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 pt-4">
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

    <Dialog open={cameraState.isOpen} onOpenChange={(open) => setCameraState({ ...cameraState, isOpen: open })}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Tomar Foto</DialogTitle>
            </DialogHeader>
            <div className="relative">
                <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted playsInline />
                <canvas ref={canvasRef} className="hidden" />
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
