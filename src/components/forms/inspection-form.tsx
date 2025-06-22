'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CalendarDays, Loader2, ClipboardList } from 'lucide-react';
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

const inspectionFormSchema = z.object({
  inspectorName: z.string().min(2, { message: 'Inspector name must be at least 2 characters.' }),
  date: z.date({ required_error: 'A date is required.' }),
  equipmentId: z.string().min(1, { message: 'Equipment ID is required.' }),
  location: z.string().min(2, { message: 'Location must be at least 2 characters.' }),
  overallCondition: z.enum(['good', 'fair', 'poor'], { required_error: 'Please select the overall condition.' }),
  fluidLevels: z.enum(['ok', 'low', 'na'], { required_error: 'Please select fluid levels status.' }),
  brakeSystem: z.enum(['ok', 'adjustment_needed', 'repair_needed'], { required_error: 'Please select brake system status.' }),
  hydraulicSystem: z.enum(['ok', 'leaking', 'repair_needed'], { required_error: 'Please select hydraulic system status.' }),
  electricalSystem: z.enum(['ok', 'faulty', 'repair_needed'], { required_error: 'Please select electrical system status.' }),
  tireCondition: z.string().min(2, { message: 'Please describe tire condition.'}),
  attachmentsCondition: z.string().optional(),
  notes: z.string().min(10, { message: 'Please provide some notes (min 10 characters).' }).max(500),
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

  async function onSubmit(data: InspectionFormValues) {
    console.log(data);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: 'Inspection Form Submitted!',
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
          <ClipboardList className="w-6 h-6 text-primary" />
          <CardTitle>Inspection Report</CardTitle>
        </div>
        <CardDescription>Fill out the details for the equipment inspection.</CardDescription>
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
                    <FormLabel>Inspector Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" {...field} />
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
                    <FormLabel>Date of Inspection</FormLabel>
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
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., West Yard" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="overallCondition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Condition</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
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
                    <FormLabel>Fluid Levels</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fluid status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ok">OK</SelectItem>
                        <SelectItem value="low">Low / Needs Refill</SelectItem>
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
                    <FormLabel>Brake System</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select brake status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ok">OK</SelectItem>
                        <SelectItem value="adjustment_needed">Needs Adjustment</SelectItem>
                        <SelectItem value="repair_needed">Needs Repair</SelectItem>
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
                    <FormLabel>Hydraulic System</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select hydraulic status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ok">OK</SelectItem>
                        <SelectItem value="leaking">Leaking</SelectItem>
                        <SelectItem value="repair_needed">Needs Repair</SelectItem>
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
                    <FormLabel>Electrical System</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select electrical status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ok">OK</SelectItem>
                        <SelectItem value="faulty">Faulty Component</SelectItem>
                        <SelectItem value="repair_needed">Needs Repair</SelectItem>
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
                    <FormLabel>Tire Condition & Pressure</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Good, 150 PSI" {...field} />
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
                    <FormLabel>Attachments Condition (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Bucket has minor wear" {...field} />
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
                  <FormLabel>Inspection Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe any findings, issues, or comments..."
                      className="resize-y min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Note any wear and tear, damage, or required follow-up actions.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="safetyEquipment"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Safety Equipment OK</FormLabel>
                      <FormDescription>Fire extinguisher and first aid kit are present and in good condition.</FormDescription>
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
                      <FormLabel>Passed Inspection</FormLabel>
                      <FormDescription>Confirm that the equipment has passed all inspection criteria.</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full md:w-auto">
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Inspection Report'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
