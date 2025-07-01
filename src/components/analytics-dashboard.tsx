
'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface AnalyticsDashboardProps {
  reports: any[];
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
];

export function AnalyticsDashboard({ reports }: AnalyticsDashboardProps) {

  const reportsByType = useMemo(() => {
    const counts = reports.reduce((acc, report) => {
      const type = report.formType || 'Sin Tipo';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([name, total]) => ({ name, total }));
  }, [reports]);
  
  const barChartConfig = useMemo(() => ({
    total: {
      label: 'Total',
    },
    ...reportsByType.reduce((acc, { name }, index) => {
      acc[name] = {
        label: name,
        color: COLORS[index % COLORS.length],
      };
      return acc;
    }, {} as Record<string, { label: string, color: string }>),
  }), [reportsByType]) satisfies ChartConfig;


  const reportsByStatus = useMemo(() => {
    const counts = reports.reduce((acc, report) => {
        const status = report.status || 'Sin Estado';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [reports]);

  const pieChartConfig = useMemo(() => ({
    reports: {
      label: 'Reportes',
    },
    ...reportsByStatus.reduce((acc, { name }, index) => {
      acc[name] = {
        label: name,
        color: COLORS[index % COLORS.length],
      };
      return acc;
    }, {} as Record<string, { label: string, color: string }>),
  }), [reportsByStatus]) satisfies ChartConfig;


  return (
    <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Reportes por Tipo</CardTitle>
          <CardDescription>Cantidad de formularios enviados por cada tipo.</CardDescription>
        </CardHeader>
        <CardContent>
           <ChartContainer config={barChartConfig} className="min-h-[300px] w-full">
             <BarChart accessibilityLayer data={reportsByType} layout="vertical" margin={{ left: 40, right: 20 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" dataKey="total" hide />
                <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.length > 25 ? `${value.substring(0, 25)}...` : value}
                    width={150}
                />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="total" layout="vertical" radius={5}>
                    {reportsByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={barChartConfig[entry.name]?.color || COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
             </BarChart>
           </ChartContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Estado de Reportes</CardTitle>
          <CardDescription>Distribución de todos los reportes según su estado actual.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
            <ChartContainer config={pieChartConfig} className="min-h-[300px] w-full max-w-[400px]">
                <PieChart>
                    <ChartTooltip
                        content={<ChartTooltipContent nameKey="name" hideLabel />}
                    />
                    <Pie
                        data={reportsByStatus}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        paddingAngle={2}
                        labelLine={false}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = innerRadius + (outerRadius - innerRadius) * 1.3;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                            return (
                                <text x={x} y={y} fill="hsl(var(--foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs fill-foreground">
                                    {reportsByStatus[index].name} ({(percent * 100).toFixed(0)}%)
                                </text>
                            );
                        }}
                    >
                        {reportsByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieChartConfig[entry.name]?.color || COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                </PieChart>
            </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
