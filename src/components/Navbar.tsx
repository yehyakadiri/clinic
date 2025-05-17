
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Home,
  Users,
  Calendar,
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  role: ('doctor' | 'secretary')[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: <Home className="h-5 w-5" />,
    role: ['doctor', 'secretary'],
  },
  {
    title: 'Patients',
    path: '/patients',
    icon: <Users className="h-5 w-5" />,
    role: ['doctor'],
  },
  {
    title: 'Appointments',
    path: '/appointments',
    icon: <Calendar className="h-5 w-5" />,
    role: ['doctor', 'secretary'],
  },
];

const Navbar: React.FC = () => {
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
  };

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => 
    user && item.role.includes(user.role as 'doctor' | 'secretary')
  );

  return (
    <nav className="bg-medical-700 text-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span className="text-xl font-semibold">MediClinic</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded transition-colors ${
                    isActive
                      ? 'bg-medical-600 text-white'
                      : 'text-gray-100 hover:bg-medical-600'
                  }`
                }
              >
                {item.icon}
                <span className="ml-2">{item.title}</span>
              </NavLink>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              <span>{user?.name || ''}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:bg-medical-600">
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex">
            <button
              onClick={toggleMobileMenu}
              className="text-white focus:outline-none"
              aria-label="toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded my-1 ${
                    isActive
                      ? 'bg-medical-600 text-white'
                      : 'text-gray-100 hover:bg-medical-600'
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon}
                <span className="ml-2">{item.title}</span>
              </NavLink>
            ))}
            <div className="border-t border-medical-600 my-4"></div>
            <div className="px-4 py-2 flex items-center">
              <User className="h-4 w-4 mr-2" />
              <span className="text-sm">{user?.name || ''}</span>
            </div>
            <button
              className="flex items-center w-full px-4 py-3 text-gray-100 hover:bg-medical-600 rounded"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
