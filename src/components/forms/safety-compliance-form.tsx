'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CalendarDays, Loader2, LifeBuoy } from 'lucide-react';
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

const safetyFormSchema = z.object({
  reportDate: z.date({ required_error: 'A date is required.' }),
  inspectorName: z.string().min(2, { message: 'Inspector name must be at least 2 characters.' }),
  siteLocation: z.string().min(2, { message: 'Site location is required.' }),
  equipmentId: z.string().min(1, { message: 'Equipment ID is required.' }),
  fireExtinguisherCheck: z.boolean().default(false),
  firstAidKitCheck: z.boolean().default(false),
  emergencyStopCheck: z.boolean().default(false),
  ppeComplianceNotes: z.string().min(10, 'Please provide notes on PPE compliance.'),
  overallSafetyRating: z.enum(['excellent', 'good', 'needs_improvement', 'unsafe'], { required_error: 'Please select a safety rating.' }),
});

type SafetyFormValues = z.infer<typeof safetyFormSchema>;

export function SafetyComplianceForm() {
  const { toast } = useToast();
  const form = useForm<SafetyFormValues>({
    resolver: zodResolver(safetyFormSchema),
    defaultValues: {
      inspectorName: '',
      siteLocation: '',
      equipmentId: '',
      ppeComplianceNotes: '',
      fireExtinguisherCheck: false,
      firstAidKitCheck: false,
      emergencyStopCheck: false,
    },
  });

  async function onSubmit(data: SafetyFormValues) {
    console.log(data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: 'Safety Form Submitted!',
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
          <LifeBuoy className="w-6 h-6 text-primary" />
          <CardTitle>Safety Compliance Report</CardTitle>
        </div>
        <CardDescription>Document the safety compliance check for a site or equipment.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="inspectorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inspector Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reportDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Report</FormLabel>
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
                name="siteLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site/Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., North Quarry" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="equipmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipment ID (if applicable)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., VOLVO-A40G" {...field} className="font-code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-medium">Checklist</h3>
                <FormField
                control={form.control}
                name="fireExtinguisherCheck"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FormLabel className="text-base">Fire Extinguisher</FormLabel>
                        <FormDescription>Is the fire extinguisher present, charged, and accessible?</FormDescription>
                    </div>
                    <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="firstAidKitCheck"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FormLabel className="text-base">First-Aid Kit</FormLabel>
                        <FormDescription>Is the first-aid kit stocked and accessible?</FormDescription>
                    </div>
                    <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="emergencyStopCheck"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FormLabel className="text-base">Emergency Stop</FormLabel>
                        <FormDescription>Are emergency stop buttons functional and unobstructed?</FormDescription>
                    </div>
                    <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    </FormItem>
                )}
                />
            </div>

            <FormField
              control={form.control}
              name="ppeComplianceNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PPE Compliance Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Comment on the use of Personal Protective Equipment (helmets, vests, etc.)..."
                      className="resize-y min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
                control={form.control}
                name="overallSafetyRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Safety Rating</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a rating" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="needs_improvement">Needs Improvement</SelectItem>
                        <SelectItem value="unsafe">Unsafe</SelectItem>
                      </SelectContent>
                    </Select>
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
                'Submit Safety Report'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
