'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FormSuggestion } from './form-suggestion';

const recentForms = [
  { id: 'FRM-001', type: 'Visita de Mantenimiento', equipment: 'MACK-LR-45', status: 'Completado', date: '2024-05-20' },
  { id: 'FRM-002', type: 'Reporte de Inspección', equipment: 'CAT-D6', status: 'Completado', date: '2024-05-18' },
  { id: 'FRM-003', type: 'Visita de Reparación', equipment: 'JOHN DEERE-8R', status: 'En Progreso', date: '2024-05-22' },
  { id: 'FRM-004', type: 'Orden de Trabajo', equipment: 'VOLVO-A40G', status: 'Pendiente', date: '2024-05-23' },
  { id: 'FRM-005', type: 'Visita de Mantenimiento', equipment: 'UD-CRONER', status: 'Completado', date: '2024-05-15' },
];

export function Dashboard() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completado':
        return <Badge variant="default" className="bg-accent text-accent-foreground hover:bg-accent/90">Completado</Badge>;
      case 'En Progreso':
        return <Badge variant="secondary">En Progreso</Badge>;
      case 'Pendiente':
        return <Badge variant="outline">Pendiente</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="grid auto-rows-max items-start gap-4 lg:gap-8 md:grid-cols-2 lg:grid-cols-3">
      <div className="grid auto-rows-max items-start gap-4 lg:gap-8 lg:col-span-2">
        <FormSuggestion />
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
                {recentForms.map((form) => (
                  <TableRow key={form.id}>
                    <TableCell className="font-medium">{form.id}</TableCell>
                    <TableCell className="hidden sm:table-cell">{form.type}</TableCell>
                    <TableCell className="font-code">{form.equipment}</TableCell>
                    <TableCell>{getStatusBadge(form.status)}</TableCell>
                    <TableCell className="hidden sm:table-cell">{form.date}</TableCell>
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
