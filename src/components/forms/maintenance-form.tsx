'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CalendarDays, Loader2, Wrench } from 'lucide-react';
import { format } from 'date-fns';

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

const maintenanceFormSchema = z.object({
  technicianName: z.string().min(2, { message: 'Technician name must be at least 2 characters.' }),
  date: z.date({ required_error: 'A date is required.' }),
  equipmentId: z.string().min(1, { message: 'Equipment ID is required.' }),
  hoursOnMachine: z.coerce.number().min(0, { message: 'Hours must be a positive number.' }),
  serviceType: z.enum(['scheduled', 'emergency', 'preventive'], { required_error: 'Please select a service type.' }),
  workPerformed: z.string().min(10, { message: 'Please describe the work performed (min 10 characters).' }).max(500),
  safetyCheckPassed: z.boolean().default(false).optional(),
});

type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

export function MaintenanceForm() {
  const { toast } = useToast();
  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      technicianName: '',
      equipmentId: '',
      hoursOnMachine: 0,
      workPerformed: '',
      safetyCheckPassed: false,
    },
  });

  async function onSubmit(data: MaintenanceFormValues) {
    // Here you would typically send the data to your server
    console.log(data);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: 'Form Submitted!',
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
          <Wrench className="w-6 h-6 text-primary" />
          <CardTitle>Maintenance Visit Report</CardTitle>
        </div>
        <CardDescription>Fill out the details for the maintenance visit.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="technicianName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Technician Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
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
                    <FormLabel>Date of Service</FormLabel>
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
                name="hoursOnMachine"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours on Machine</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="5120" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a service type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="preventive">Preventive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="workPerformed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Performed</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the work performed in detail..."
                      className="resize-y min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>A detailed description of all services and repairs.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="safetyCheckPassed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Final Safety Check Passed</FormLabel>
                    <FormDescription>Confirm that all safety checks were completed and passed.</FormDescription>
                  </div>
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
                'Submit Form'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
