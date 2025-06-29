
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getPatientById, getPatientDocuments } from '@/lib/mock-data';
import { Download, FileText, Search } from 'lucide-react';

const Documents = () => {
  const { patientId } = useParams();
  const patient = getPatientById(patientId || '');
  const documents = getPatientDocuments(patientId || '');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter documents based on search term
  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mock function to handle document viewing
  const handleViewDocument = (fileUrl: string) => {
    // In a real app, this would open the document in a new tab or viewer
    window.alert(`Viewing document: ${fileUrl}`);
  };

  // Mock function to handle document download
  const handleDownloadDocument = (fileUrl: string, name: string) => {
    // In a real app, this would trigger the download
    window.alert(`Downloading document: ${name}`);
  };

  // Get document type label and class for styling
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
                        >
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadDocument(document.fileUrl, document.name)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
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
