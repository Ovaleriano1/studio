'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FormSuggestion } from './form-suggestion';

const recentForms = [
  { id: 'FRM-001', type: 'Maintenance Visit', equipment: 'MACK-LR-45', status: 'Completed', date: '2024-05-20' },
  { id: 'FRM-002', type: 'Inspection Report', equipment: 'CAT-D6', status: 'Completed', date: '2024-05-18' },
  { id: 'FRM-003', type: 'Repair Visit', equipment: 'JOHN DEERE-8R', status: 'In Progress', date: '2024-05-22' },
  { id: 'FRM-004', type: 'Work Order', equipment: 'VOLVO-A40G', status: 'Pending', date: '2024-05-23' },
  { id: 'FRM-005', type: 'Maintenance Visit', equipment: 'UD-CRONER', status: 'Completed', date: '2024-05-15' },
];

export function Dashboard() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="default" className="bg-accent text-accent-foreground hover:bg-accent/90">Completed</Badge>;
      case 'In Progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'Pending':
        return <Badge variant="outline">Pending</Badge>;
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
            <CardTitle>Recent Forms</CardTitle>
            <CardDescription>An overview of your recently submitted forms.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Form ID</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
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
