'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CalendarDays, Loader2, FlaskConical } from 'lucide-react';
import { format } from 'date-fns';

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

const fluidAnalysisSchema = z.object({
  sampleDate: z.date({ required_error: 'A sample date is required.' }),
  technicianName: z.string().min(2, { message: 'Technician name is required.' }),
  equipmentId: z.string().min(1, { message: 'Equipment ID is required.' }),
  fluidType: z.enum(['engine_oil', 'hydraulic_fluid', 'coolant', 'transmission_fluid'], { required_error: 'Please select a fluid type.' }),
  sampleId: z.string().min(1, 'Sample ID is required.'),
  viscosityLevel: z.coerce.number().min(0, 'Viscosity must be a positive value.'),
  contaminationLevel: z.string().min(1, 'Contamination level is required.'),
  analysisSummary: z.string().min(10, 'Analysis summary is required.'),
  actionRequired: z.enum(['none', 'change_fluid', 'monitor', 'immediate_repair'], { required_error: 'Please select an action.' }),
});

type FluidAnalysisValues = z.infer<typeof fluidAnalysisSchema>;

export function FluidAnalysisForm() {
  const { toast } = useToast();
  const form = useForm<FluidAnalysisValues>({
    resolver: zodResolver(fluidAnalysisSchema),
    defaultValues: {
      technicianName: '',
      equipmentId: '',
      sampleId: '',
      viscosityLevel: 0,
      contaminationLevel: '',
      analysisSummary: '',
    },
  });

  async function onSubmit(data: FluidAnalysisValues) {
    console.log(data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: 'Fluid Analysis Form Submitted!',
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
    form.reset();
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FlaskConical className="w-6 h-6 text-primary" />
          <CardTitle>Fluid Analysis Report</CardTitle>
        </div>
        <CardDescription>Record the results of a fluid sample analysis.</CardDescription>
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
                    <FormLabel>Technician Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sampleDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Sample</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
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
                    <FormLabel>Equipment ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., CAT-D6" {...field} className="font-code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sampleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sample ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., OIL-00123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fluidType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fluid Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fluid type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="engine_oil">Engine Oil</SelectItem>
                        <SelectItem value="hydraulic_fluid">Hydraulic Fluid</SelectItem>
                        <SelectItem value="coolant">Coolant</SelectItem>
                        <SelectItem value="transmission_fluid">Transmission Fluid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="viscosityLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Viscosity Level (cSt)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="40" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                <FormField
                control={form.control}
                name="contaminationLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contamination (ISO Code)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 18/16/13" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="actionRequired"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Action Required</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select required action" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="monitor">Monitor</SelectItem>
                        <SelectItem value="change_fluid">Change Fluid</SelectItem>
                        <SelectItem value="immediate_repair">Immediate Repair Needed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="analysisSummary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Analysis Summary & Recommendations</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Summarize the lab findings and recommend next steps..."
                      className="resize-y min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Include details on wear metals, additives, and overall fluid condition.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full md:w-auto">
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Analysis Report'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
