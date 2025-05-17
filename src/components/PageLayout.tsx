
import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import { Toaster } from '@/components/ui/toaster';
import PatientSubnav from './PatientSubnav';
import { useLocation } from 'react-router-dom';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  rightContent?: ReactNode;
  hideTitle?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  subtitle,
  rightContent,
  hideTitle = false,
}) => {
  const location = useLocation();
  const showPatientSubnav = location.pathname.includes('/patients/') && 
    !location.pathname.endsWith('/patients') &&
    !location.pathname.includes('/add-patient');

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {showPatientSubnav && <PatientSubnav />}
      
      <main className="flex-1 py-6">
        <div className="container mx-auto px-4">
          {!hideTitle && (title || rightContent) && (
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
                {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
              </div>
              {rightContent && <div className="mt-4 md:mt-0">{rightContent}</div>}
            </div>
          )}
          {children}
        </div>
      </main>
      
      <footer className="bg-gray-100 py-4 border-t">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} MediClinic. All rights reserved.
          </p>
        </div>
      </footer>
      
      <Toaster />
    </div>
  );
};

export default PageLayout;
