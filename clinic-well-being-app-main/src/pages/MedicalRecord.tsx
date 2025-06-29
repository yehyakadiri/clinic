import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import PageLayout from '@/components/PageLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { PatientService } from '@/api/patientService';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import { ChevronLeft, CalendarIcon, Plus } from 'lucide-react';

// Define form schema
const formSchema = z.object({
  visitDate: z.date({
    required_error: "Visit date is required",
  }),
  visitType: z.enum(["vaccine", "wellChild", "disease"], {
    required_error: "Visit type is required",
  }),
  // Growth measurements
  weight: z.string().min(1, "Weight is required"),
  height: z.string().min(1, "Height is required"),
  headCircumference: z.string().min(1, "Head circumference is required"),
  // Vital signs
  pulse: z.string().min(1, "Pulse is required"),
  temperature: z.string().min(1, "Temperature is required"),
  bloodPressure: z.string().min(1, "Blood pressure is required"),
  respiratoryRate: z.string().min(1, "Respiratory rate is required"),
  // Vaccine visit fields (conditional)
  vaccineName: z.string().optional(),
  childAge: z.string().optional(),
  vaccineNotes: z.string().optional(),
  // Well-child visit fields (conditional)
  wellChildNotes: z.string().optional(),
  // Disease visit fields (conditional)
  symptoms: z.string().optional(),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  prescribedMedications: z.string().optional(),
});

// Type for medical record
type MedicalRecord = z.infer<typeof formSchema> & { id: string };

const MedicalRecord = () => {
  const { patientId } = useParams();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  
  // Fetch patient data
  const { data: patient } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => PatientService.getPatientById(patientId || ''),
    enabled: !!patientId
  });

  // Fetch medical records
  const { data: records = [], refetch } = useQuery({
    queryKey: ['medicalRecords', patientId],
    queryFn: () => PatientService.getMedicalRecords(patientId || ''),
    enabled: !!patientId
  });

  // Add medical record mutation
  const addRecordMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => 
      PatientService.addMedicalRecord(patientId || '', data),
    onSuccess: () => {
      toast({
        title: "Medical record saved successfully",
        description: "The new medical record has been added",
      });
      form.reset();
      setShowForm(false);
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save medical record",
        variant: "destructive"
      });
    }
  });

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      visitType: "wellChild",
      weight: "",
      height: "",
      headCircumference: "",
      pulse: "",
      temperature: "",
      bloodPressure: "",
      respiratoryRate: "",
    },
  });
  
  const visitType = form.watch("visitType");

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    addRecordMutation.mutate(data);
  };

  if (!patient) {
    return (
      <PageLayout title="Patient Not Found">
        <div className="text-center py-8">
          <p>The patient you're looking for doesn't exist or has been removed.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Medical Records" 
      subtitle={`Patient: ${patient.full_name}`}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Link 
            to={`/patients/${patientId}`} 
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Patient Details
          </Link>
          <div className="flex justify-end">
            <Button 
              onClick={() => setShowForm(!showForm)} 
              className="bg-medical-600 hover:bg-medical-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              {showForm ? 'Cancel' : 'Add Medical Record'}
            </Button>
          </div>
        </div>

        {/* Add Medical Record Form */}
        {showForm && (
          <Card className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date of Visit */}
                  <FormField
                    control={form.control}
                    name="visitDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date of Visit *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "MMMM d, yyyy")
                                ) : (
                                  <span>Select date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date()
                              }
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Visit Type */}
                  <FormField
                    control={form.control}
                    name="visitType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type of Visit *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select visit type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="vaccine">Vaccine Visit</SelectItem>
                            <SelectItem value="wellChild">Well-Child Visit</SelectItem>
                            <SelectItem value="disease">Disease Visit</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Growth Measurements Section */}
                <div className="border p-4 rounded-md bg-gray-50">
                  <h3 className="text-lg font-medium mb-4">Growth Measurements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (kg) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="0.00" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height (cm) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1" 
                              placeholder="0.0" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="headCircumference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Head Circumference (cm) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1" 
                              placeholder="0.0" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Vital Signs Section */}
                <div className="border p-4 rounded-md bg-gray-50">
                  <h3 className="text-lg font-medium mb-4">Vital Signs</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="pulse"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pulse (bpm) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="temperature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temperature (°C) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1" 
                              placeholder="37.0" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bloodPressure"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Blood Pressure (mmHg) *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="120/80" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="respiratoryRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Respiratory Rate (breaths/min) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Conditional Sections */}
                {visitType === "vaccine" && (
                  <div className="border p-4 rounded-md bg-gray-50">
                    <h3 className="text-lg font-medium mb-4">Vaccine Visit Details</h3>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="vaccineName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vaccine Name *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter vaccine name" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="childAge"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Child's Age at Vaccination (months) *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="vaccineNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Additional notes about vaccination" 
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
                
                {visitType === "wellChild" && (
                  <div className="border p-4 rounded-md bg-gray-50">
                    <h3 className="text-lg font-medium mb-4">Well-Child Visit Details</h3>
                    <FormField
                      control={form.control}
                      name="wellChildNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Doctor's Notes *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="General observations, feedback, parental guidance" 
                              className="min-h-[150px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                
                {visitType === "disease" && (
                  <div className="border p-4 rounded-md bg-gray-50">
                    <h3 className="text-lg font-medium mb-4">Disease Visit Details</h3>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="symptoms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Symptoms *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe all symptoms" 
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="diagnosis"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Diagnosis</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter diagnosis if available" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="treatment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Treatment</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe recommended treatment" 
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="prescribedMedications"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prescribed Medications</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="List all prescribed medications" 
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end gap-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-medical-600 hover:bg-medical-700"
                    disabled={addRecordMutation.isPending}
                  >
                    {addRecordMutation.isPending ? 'Saving...' : 'Save Record'}
                  </Button>
                </div>
              </form>
            </Form>
          </Card>
        )}

        {/* Medical Records List */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Medical Records</h3>
          
          {records.length === 0 ? (
            <Card className="p-6 text-center text-gray-500">
              No medical records found. Click "Add Medical Record" to create one.
            </Card>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <Card key={record.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">
                        {format(new Date(record.visitDate), "MMMM d, yyyy")}
                      </h4>
                      <p className="text-sm text-gray-500 capitalize">
                        {record.visitType.replace(/([A-Z])/g, ' $1').trim()} Visit
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{record.weight} kg</p>
                      <p className="text-sm text-gray-500">{record.height} cm</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Pulse</p>
                      <p>{record.pulse} bpm</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Temp</p>
                      <p>{record.temperature} °C</p>
                    </div>
                    <div>
                      <p className="text-gray-500">BP</p>
                      <p>{record.bloodPressure}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Resp. Rate</p>
                      <p>{record.respiratoryRate} breaths/min</p>
                    </div>
                  </div>
                  
                  {record.visitType === "vaccine" && record.vaccineName && (
                    <div className="mt-4">
                      <p className="text-gray-500">Vaccine</p>
                      <p>{record.vaccineName}</p>
                    </div>
                  )}
                  
                  {record.visitType === "disease" && record.diagnosis && (
                    <div className="mt-4">
                      <p className="text-gray-500">Diagnosis</p>
                      <p>{record.diagnosis}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default MedicalRecord;