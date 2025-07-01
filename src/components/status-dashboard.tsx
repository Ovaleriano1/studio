
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getReports, updateReport } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/context/user-profile-context';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from './ui/skeleton';
import { RefreshCw, Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const STATUS_OPTIONS = ['Pendiente', 'En Progreso', 'Esperando Repuestos', 'Completado', 'Cancelado'];

const getStatusBadgeClassName = (status: string): string => {
    switch (status) {
        case 'Completado':
            // Green for completed
            return badgeVariants({ variant: 'default' });
        case 'En Progreso':
            // Orange for in progress
            return "border-transparent bg-chart-5 text-accent-foreground hover:opacity-90";
        case 'Pendiente':
            // Yellow for pending
            return "border-transparent bg-accent text-accent-foreground hover:bg-accent/90";
        case 'Esperando Repuestos':
            // A different orange/red for awaiting parts
            return "border-transparent bg-chart-1 text-primary-foreground hover:opacity-90";
        case 'Cancelado':
            // Red for cancelled
            return badgeVariants({ variant: 'destructive' });
        default:
            return badgeVariants({ variant: 'secondary' });
    }
};

export function StatusDashboard() {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { toast } = useToast();
  const { profile } = useUserProfile();

  const canManageStatus = profile.role === 'admin' || profile.role === 'superuser' || profile.role === 'supervisor';

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedReports = await getReports();
      fetchedReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReports(fetchedReports);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los reportes.' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleStatusChange = async (report: any, newStatus: string) => {
    if (report.status === newStatus) return;
    setIsUpdating(report.id);
    const updatedReport = { ...report, status: newStatus };
    try {
      await updateReport(updatedReport);
      toast({ title: 'Éxito', description: `Estado del reporte ${report.id} actualizado a "${newStatus}".` });
      fetchReports(); 
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error.';
      toast({ variant: 'destructive', title: 'Error al actualizar', description: errorMessage });
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gestión de Estados de Reportes</CardTitle>
          <CardDescription>Actualice el estado de los formularios enviados.</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={fetchReports} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="sr-only">Actualizar Estados</span>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
            <TooltipProvider>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                        <TableHead className="hidden md:table-cell">Fecha Creación</TableHead>
                        <TableHead>Estado</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {reports.map((report) => (
                        <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.id}</TableCell>
                        <TableCell className="hidden sm:table-cell">{report.formType}</TableCell>
                        <TableCell className="hidden md:table-cell">
                            {format(new Date(report.createdAt), 'PPP', { locale: es })}
                        </TableCell>
                        <TableCell>
                            {canManageStatus ? (
                            report.status === 'Completado' ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-2 cursor-help">
                                            <Badge className={getStatusBadgeClassName(report.status)}>{report.status}</Badge>
                                            <Lock className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Este reporte está bloqueado y no se puede modificar.</p>
                                    </TooltipContent>
                                </Tooltip>
                            ) : (
                                <Select
                                value={report.status}
                                onValueChange={(newStatus) => handleStatusChange(report, newStatus)}
                                disabled={isUpdating === report.id}
                                >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Seleccionar estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        <Badge className={getStatusBadgeClassName(status)}>{status}</Badge>
                                    </SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                            )
                            ) : (
                            <Badge className={getStatusBadgeClassName(report.status)}>{report.status}</Badge>
                            )}
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
}
