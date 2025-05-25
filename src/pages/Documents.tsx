import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Download, FileText, Search } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { PatientService } from '@/api/patientService';

interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  fileUrl: string;
  doctorNotes?: string;
}

const Documents = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState<any>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!patientId) return;
      setLoading(true);
      try {
        const [patientData, diagnosticsData] = await Promise.all([
          PatientService.getPatientById(patientId),
          PatientService.getDiagnostics(patientId),
        ]);
        
        setPatient(patientData);
        
        // Transform diagnostics data into documents format
        const transformedDocuments = diagnosticsData.map((diagnostic: any) => ({
          id: diagnostic.id,
          name: diagnostic.test || 'Diagnostic Report',
          type: 'diagnostic',
          uploadDate: diagnostic.test_date,
          fileUrl: diagnostic.file_path,
          doctorNotes: diagnostic.observations
        }));
        
        setDocuments(transformedDocuments);
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
  }, [patientId]);

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDocument = (fileUrl: string) => {
    if (!fileUrl) {
      toast({
        title: "Error",
        description: "No file available to view",
        variant: "destructive",
      });
      return;
    }
    window.open(`http://localhost:8082/uploads/${fileUrl}`, '_blank');
  };

  const getDocumentTypeInfo = (type: string) => {
    switch (type) {
      case 'consultation':
        return {
          label: 'Consultation',
          className: 'bg-blue-100 text-blue-800'
        };
      case 'diagnostic':
        return {
          label: 'Diagnostic',
          className: 'bg-green-100 text-green-800'
        };
      case 'vaccination':
        return {
          label: 'Vaccination',
          className: 'bg-purple-100 text-purple-800'
        };
      case 'medicalHistory':
        return {
          label: 'Medical History',
          className: 'bg-orange-100 text-orange-800'
        };
      case 'billing':
        return {
          label: 'Billing',
          className: 'bg-gray-100 text-gray-800'
        };
      default:
        return {
          label: 'Other',
          className: 'bg-gray-100 text-gray-800'
        };
    }
  };

  if (loading) {
    return (
      <PageLayout title="Loading...">
        <div className="text-center py-8">
          <p>Loading patient data...</p>
        </div>
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
    <PageLayout title="Document Management" subtitle={`Patient: ${patient.name}`}>
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search documents..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="clinic-card">
        {filteredDocuments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Doctor's Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((document) => {
                const typeInfo = getDocumentTypeInfo(document.type);

                return (
                  <TableRow key={document.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-400 mr-2" />
                        {document.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${typeInfo.className}`}>
                        {typeInfo.label}
                      </span>
                    </TableCell>
                    <TableCell>{document.uploadDate}</TableCell>
                    <TableCell>{document.doctorNotes || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDocument(document.fileUrl)}
                          disabled={!document.fileUrl}
                        >
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-gray-300" />
            <p className="mt-4 text-gray-500">No documents found</p>
            {searchTerm && (
              <p className="mt-2 text-sm text-gray-500">
                Try adjusting your search term
              </p>
            )}
          </div>
        )}
      </Card>
    </PageLayout>
  );
};

export default Documents;