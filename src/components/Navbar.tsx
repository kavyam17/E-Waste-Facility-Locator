import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Recycle } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user } = useAuth();

  if (user) return null;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="p-2 bg-green-600 rounded-lg">
                <Recycle className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">EcoCycle</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Login</Link>
            <Link to="/register" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">Register</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
