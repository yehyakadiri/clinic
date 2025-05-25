import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
const API_URL = 'http://localhost:8082'; // Your backend URL

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PatientService } from '@/api/patientService';
import { FileSearch, Plus, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScreeningTest {
  id: string;
  type: string;
  performed: 'Yes' | 'No';
  result: 'Normal' | 'Abnormal';
  performed_date: string;
  notes?: string;
}

interface Diagnostic {
  id: string;
  test: string;
  observations?: string;
  result: 'Normal' | 'Abnormal' | 'Pending';
  test_date: string;
  file_path?: string;
}

const Diagnostics = () => {
  const { patientId } = useParams();
  const { toast } = useToast();
  const [patient, setPatient] = useState<any>(null);
  const [screeningTests, setScreeningTests] = useState<ScreeningTest[]>([]);
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state for screening tests
  const [screeningForm, setScreeningForm] = useState({
    type: '',
    performed: 'Yes' as 'Yes' | 'No',
    result: 'Normal' as 'Normal' | 'Abnormal',
    notes: '',
    performedDate: null as Date | null,
  });

  // Form state for diagnostics
  const [diagnosticForm, setDiagnosticForm] = useState({
    test: '',
    observations: '',
    file: null as File | null,
    result: 'Normal' as 'Normal' | 'Abnormal' | 'Pending',
    date: null as Date | null,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!patientId) return;
      
      try {
        const [patientData, screeningData, diagnosticData] = await Promise.all([
          PatientService.getPatientById(patientId),
          PatientService.getScreeningTests(patientId),
          PatientService.getDiagnostics(patientId)
        ]);
        
        setPatient(patientData);
        setScreeningTests(screeningData);
        setDiagnostics(diagnosticData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch patient data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId, toast]);

  const handleScreeningChange = (name: string, value: string | Date | null) => {
    setScreeningForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDiagnosticChange = (name: string, value: string | File | null | 'Normal' | 'Abnormal' | 'Pending' | Date) => {
    setDiagnosticForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleDiagnosticChange('file', e.target.files[0]);
    }
  };

  const handleScreeningSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientId || !screeningForm.performedDate) return;
    
    try {
      if (!screeningForm.type) {
        toast({
          title: "Error",
          description: "Please select a screening type.",
          variant: "destructive",
        });
        return;
      }

      const testData = {
        type: screeningForm.type,
        performed: screeningForm.performed,
        result: screeningForm.result,
        performedDate: format(screeningForm.performedDate, 'yyyy-MM-dd'),
        notes: screeningForm.notes || null
      };

      const newTest = await PatientService.addScreeningTest(patientId, testData);
      setScreeningTests(prev => [newTest, ...prev]);

      toast({
        title: "Success",
        description: "Screening test recorded successfully",
      });

      // Reset form
      setScreeningForm({
        type: '',
        performed: 'Yes',
        result: 'Normal',
        notes: '',
        performedDate: null,
      });
    } catch (error) {
      console.error('Error saving screening test:', error);
      toast({
        title: "Error",
        description: "Failed to save screening test",
        variant: "destructive",
      });
    }
  };

  const handleDiagnosticSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientId || !diagnosticForm.date) return;
    
    try {
      if (!diagnosticForm.test) {
        toast({
          title: "Error",
          description: "Please select a test type.",
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData();
      formData.append('test', diagnosticForm.test);
      formData.append('observations', diagnosticForm.observations || '');
      formData.append('result', diagnosticForm.result);
      formData.append('testDate', format(diagnosticForm.date, 'yyyy-MM-dd'));
      if (diagnosticForm.file) {
        formData.append('file', diagnosticForm.file);
      }

      const newDiagnostic = await PatientService.uploadDiagnostic(patientId, formData);
      setDiagnostics(prev => [newDiagnostic, ...prev]);

      toast({
        title: "Success",
        description: "Diagnostic uploaded successfully",
      });

      // Reset form
      setDiagnosticForm({
        test: '',
        observations: '',
        file: null,
        result: 'Normal',
        date: null,
      });
    } catch (error) {
      console.error('Error uploading diagnostic:', error);
      toast({
        title: "Error",
        description: "Failed to upload diagnostic",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <PageLayout title="Loading...">
        <div className="text-center py-8">Loading patient data...</div>
      </PageLayout>
    );
  }

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
    <PageLayout title="Screening & Diagnostics" subtitle={`Patient: ${patient.full_name}`}>
      
      <div className="mb-8">
        <Tabs defaultValue="screening">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="screening">Screening Tests</TabsTrigger>
            <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          </TabsList>
          
          {/* Screening Tests Tab */}
          <TabsContent value="screening" className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Screening Tests Table */}
              <Card className="clinic-card md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <FileSearch className="h-5 w-5 text-medical-600 mr-2" />
                    Screening Tests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {screeningTests.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Screening Type</TableHead>
                          <TableHead>Performed</TableHead>
                          <TableHead>Result</TableHead>
                          <TableHead>Performed Date</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {screeningTests.map((test) => (
                          <TableRow key={test.id}>
                            <TableCell className="font-medium">{test.type}</TableCell>
                            <TableCell>{test.performed}</TableCell>
                            <TableCell>
                              <span 
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  test.result === 'Normal' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-orange-100 text-orange-800'
                                }`}
                              >
                                {test.result}
                              </span>
                            </TableCell>
                            <TableCell>
                              {test.performed_date 
                                ? format(new Date(test.performed_date), 'MMM dd, yyyy')
                                : 'N/A'}
                            </TableCell>
                            <TableCell>{test.notes || 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      No screening tests recorded
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* New Screening Form */}
              <Card className="clinic-card">
                <CardHeader>
                  <CardTitle className="text-lg">New Screening Test</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleScreeningSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="screeningType">
                        Screening Type <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={screeningForm.type}
                        onValueChange={(value) => handleScreeningChange('type', value)}
                      >
                        <SelectTrigger id="screeningType">
                          <SelectValue placeholder="Select screening type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Neonatal">Neonatal</SelectItem>
                          <SelectItem value="Hearing">Hearing</SelectItem>
                          <SelectItem value="Vision">Vision</SelectItem>
                          <SelectItem value="Dental Referral">Dental Referral</SelectItem>
                          <SelectItem value="Cholesterol Test">Cholesterol Test</SelectItem>
                          <SelectItem value="Iron Levels">Iron Levels</SelectItem>
                          <SelectItem value="Hip X-ray">Hip X-ray</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="performed">
                        Performed <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={screeningForm.performed}
                        onValueChange={(value) => handleScreeningChange('performed', value as 'Yes' | 'No')}
                      >
                        <SelectTrigger id="performed">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="result">
                        Result <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={screeningForm.result}
                        onValueChange={(value) => handleScreeningChange('result', value as 'Normal' | 'Abnormal')}
                      >
                        <SelectTrigger id="result">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Normal">Normal</SelectItem>
                          <SelectItem value="Abnormal">Abnormal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="performedDate">
                        Performed Date <span className="text-red-500">*</span>
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="performedDate"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !screeningForm.performedDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {screeningForm.performedDate ? (
                              format(screeningForm.performedDate, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={screeningForm.performedDate || undefined}
                            onSelect={(date) => handleScreeningChange('performedDate', date)}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={screeningForm.notes}
                        onChange={(e) => handleScreeningChange('notes', e.target.value)}
                        placeholder="Additional observations or details"
                      />
                    </div>

                    <Button type="submit" className="w-full bg-medical-600 hover:bg-medical-700">
                      Save
                    </Button>
                   </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Diagnostics Tab */}
          <TabsContent value="diagnostics" className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Diagnostics Table */}
              <Card className="clinic-card md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <FileSearch className="h-5 w-5 text-medical-600 mr-2" />
                    Diagnostic Tests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {diagnostics.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Test</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Results</TableHead>
                          <TableHead>Observations</TableHead>
                          <TableHead>Attachment</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {diagnostics.map((diagnostic) => (
                          <TableRow key={diagnostic.id}>
                            <TableCell className="font-medium">{diagnostic.test}</TableCell>
                            <TableCell>
                              {diagnostic.test_date 
                                ? format(new Date(diagnostic.test_date), 'MMM dd, yyyy')
                                : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <span 
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  diagnostic.result === 'Normal' 
                                    ? 'bg-green-100 text-green-800' 
                                    : diagnostic.result === 'Abnormal'
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {diagnostic.result}
                              </span>
                            </TableCell>
                            <TableCell>{diagnostic.observations || 'N/A'}</TableCell>
                            <TableCell>
                              {diagnostic.file_path ? (
                                <a href={`${API_URL}/uploads/${diagnostic.file_path.split('/').pop()}`} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" size="sm" className="h-8">
                                    <FileSearch className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                </a>
                              ) : (
                                'None'
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      No diagnostic tests recorded
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* New Diagnostic Form */}
              <Card className="clinic-card">
                <CardHeader>
                  <CardTitle className="text-lg">Upload New Diagnostic</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleDiagnosticSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="testType">
                        Test Type <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={diagnosticForm.test}
                        onValueChange={(value) => handleDiagnosticChange('test', value)}
                      >
                        <SelectTrigger id="testType">
                          <SelectValue placeholder="Select test type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Radiology">Radiology</SelectItem>
                          <SelectItem value="Hip X-ray">Hip X-ray</SelectItem>
                          <SelectItem value="Blood Test">Blood Test</SelectItem>
                          <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                          <SelectItem value="MRI">MRI</SelectItem>
                          <SelectItem value="CT Scan">CT Scan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="testDate">
                        Test Date <span className="text-red-500">*</span>
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="testDate"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !diagnosticForm.date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {diagnosticForm.date ? (
                              format(diagnosticForm.date, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={diagnosticForm.date || undefined}
                            onSelect={(date) => handleDiagnosticChange('date', date)}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="result">
                        Diagnostic Result <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={diagnosticForm.result}
                        onValueChange={(value) => handleDiagnosticChange('result', value as 'Normal' | 'Abnormal' | 'Pending')}
                      >
                        <SelectTrigger id="result">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Normal">Normal</SelectItem>
                          <SelectItem value="Abnormal">Abnormal</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="observations">Observations</Label>
                      <Textarea
                        id="observations"
                        value={diagnosticForm.observations}
                        onChange={(e) => handleDiagnosticChange('observations', e.target.value)}
                        placeholder="Clinical observations or findings"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="file">Upload File</Label>
                      <div className="mt-1 flex items-center">
                        <Input
                          id="file"
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                        <label
                          htmlFor="file"
                          className="flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {diagnosticForm.file ? diagnosticForm.file.name : "Select File"}
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Supports: PDF, JPG, PNG
                      </p>
                    </div>

                    <Button type="submit" className="w-full bg-medical-600 hover:bg-medical-700">
                      Upload
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default Diagnostics;
