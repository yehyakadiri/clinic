import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

const appointmentTypes = [
  { id: 'consultation', label: 'Consultation' },
  { id: 'vaccination', label: 'Vaccination' },
  { id: 'followup', label: 'Follow-up' },
  { id: 'checkup', label: 'Regular Check-up' },
  { id: 'emergency', label: 'Emergency' },
];

interface AppointmentFormData {
  patient_name: string;
  date: string;
  time: string;
  type: string;
  reason?: string;
  notes?: string;
}

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAppointment: (appointment: AppointmentFormData) => Promise<void>;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ 
  isOpen, 
  onClose, 
  onAddAppointment 
}) => {
  const [patientName, setPatientName] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleTypeToggle = (typeId: string) => {
    setSelectedTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId) 
        : [...prev, typeId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientName || !date || !time || selectedTypes.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newAppointment: AppointmentFormData = {
        patient_name: patientName,
        date: format(date, 'yyyy-MM-dd'),
        time,
        type: selectedTypes.join(','),
        reason: selectedTypes.map(typeId => {
          const type = appointmentTypes.find(t => t.id === typeId);
          return type ? type.label : '';
        }).join(', ')
      };

      await onAddAppointment(newAppointment);
      
      toast({
        title: "Success",
        description: "Appointment created successfully",
      });
      
      // Reset form
      setPatientName('');
      setDate(undefined);
      setTime('');
      setSelectedTypes([]);
      onClose();
    } catch (error) {
      console.error('Appointment creation failed:', error);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create appointment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Schedule New Appointment
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="patientName">Patient Name *</Label>
            <Input
              id="patientName"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter patient name"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to midnight
  return date < today;
}}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Appointment Type * (Select all that apply)</Label>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
              {appointmentTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={type.id} 
                    checked={selectedTypes.includes(type.id)}
                    onCheckedChange={() => handleTypeToggle(type.id)}
                  />
                  <Label htmlFor={type.id} className="font-normal">
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-medical-600 hover:bg-medical-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentForm;