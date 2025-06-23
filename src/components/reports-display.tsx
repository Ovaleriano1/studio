'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { getReports } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, DialogClose } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { RefreshCw } from 'lucide-react';

export function ReportsDisplay() {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedReports = await getReports();
      // sort by date descending
      fetchedReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReports(fetchedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar los reportes.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const renderDetails = (report: any) => {
    return Object.entries(report).map(([key, value]) => {
      if (key === 'id' || key === 'formType') return null;
      
      let displayValue = String(value);
      
      if (typeof value === 'string') {
        const potentialDate = new Date(value);
        if (isValid(potentialDate) && value.includes('T') && value.includes('Z')) {
           displayValue = format(potentialDate, 'PPP p', { locale: es });
        }
      } else if (typeof value === 'boolean') {
        displayValue = value ? 'Sí' : 'No';
      }

      // Prettify camelCase keys
      const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());

      return (
        <div key={key} className="grid grid-cols-3 gap-2 py-2 border-b last:border-b-0">
          <p className="font-semibold capitalize col-span-1">{displayKey}</p>
          <p className="col-span-2 text-muted-foreground break-words">{displayValue}</p>
        </div>
      );
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Reportes Enviados</CardTitle>
            <CardDescription>Una lista de todos los formularios que han sido enviados. Los datos son temporales.</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={fetchReports} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="sr-only">Actualizar Reportes</span>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID de Reporte</TableHead>
                <TableHead>Tipo de Formulario</TableHead>
                <TableHead className="hidden sm:table-cell">Fecha de Creación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length > 0 ? (
                reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.id}</TableCell>
                    <TableCell>{report.formType}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {format(new Date(report.createdAt), 'PPP p', { locale: es })}
                    </TableCell>
                    <TableCell>
                       <Dialog>
                        <DialogTrigger asChild>
                           <Button variant="outline" size="sm">Ver Detalles</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                           <DialogHeader>
                            <DialogTitle>Detalles del Reporte: {report.id}</DialogTitle>
                            <DialogDescription>
                              Formulario: {report.formType} - Creado el: {format(new Date(report.createdAt), 'PPP p', { locale: es })}
                            </DialogDescription>
                          </DialogHeader>
                          <ScrollArea className="max-h-[60vh] pr-4">
                            <div className="grid gap-1 py-4">
                              {renderDetails(report)}
                            </div>
                          </ScrollArea>
                           <DialogFooter>
                             <DialogClose asChild>
                                <Button type="button" variant="secondary">
                                  Cerrar
                                </Button>
                              </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No hay reportes para mostrar. Envíe un formulario para verlo aquí.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
