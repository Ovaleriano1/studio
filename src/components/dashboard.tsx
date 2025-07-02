'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FormSuggestion } from './form-suggestion';
import { WorkTimer } from './work-timer';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function Dashboard({ reports }: { reports: any[] }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completado':
        return <Badge className="bg-green-600 text-primary-foreground hover:bg-green-600/90">Completado</Badge>;
      case 'En Progreso':
        return <Badge className="bg-blue-600 text-primary-foreground hover:bg-blue-600/90">En Progreso</Badge>;
      case 'Pendiente':
        return <Badge className="bg-orange-500 text-primary-foreground hover:bg-orange-500/90">Pendiente</Badge>;
      case 'Esperando Repuestos':
        return <Badge className="bg-yellow-500 text-secondary-foreground hover:bg-yellow-500/90">Esperando Repuestos</Badge>;
      case 'Cancelado':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="grid auto-rows-max items-start gap-4 lg:gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <FormSuggestion />
      </div>
      
      <div className="lg:col-span-1">
         <WorkTimer />
      </div>
      
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Formularios Recientes</CardTitle>
            <CardDescription>Un resumen de sus formularios enviados recientemente.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID de Formulario</TableHead>
                  <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                  <TableHead>Equipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="hidden sm:table-cell">Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.id}</TableCell>
                    <TableCell className="hidden sm:table-cell">{report.formType}</TableCell>
                    <TableCell className="font-code">{report.equipmentId}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {format(new Date(report.createdAt), 'PPP', { locale: es })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
