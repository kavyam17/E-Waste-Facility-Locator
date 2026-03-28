import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Recycle, LayoutDashboard, MapPin, Upload, History, Trophy, ShoppingBag, Info, LogOut, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = user.role === 'admin' 
    ? [
        { name: 'Admin Dashboard', path: '/admin', icon: ShieldCheck },
      ]
    : [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Locator', path: '/locator', icon: MapPin },
        { name: 'Upload', path: '/upload', icon: Upload },
        { name: 'History', path: '/history', icon: History },
        { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
        { name: 'Store', path: '/store', icon: ShoppingBag },
        { name: 'Awareness', path: '/awareness', icon: Info },
      ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 z-50 flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <Link to="/" className="flex items-center space-x-3">
          <div className="p-2 bg-green-600 rounded-xl shadow-lg shadow-green-100">
            <Recycle className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">EcoCycle</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="px-3 mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Menu</p>
        </div>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
              location.pathname === item.path
                ? "bg-green-600 text-white shadow-lg shadow-green-100"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <item.icon className={cn("h-5 w-5", location.pathname === item.path ? "text-white" : "text-gray-400")} />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="bg-gray-50 p-4 rounded-2xl mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase">Profile</p>
            <span className={cn(
              "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
              user.role === 'admin' ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"
            )}>
              {user.role}
            </span>
          </div>
          <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
          <div className="flex items-center space-x-1 text-yellow-600 font-bold text-xs mt-1">
            <ShoppingBag className="h-3 w-3" />
            <span>{user.credits} Credits</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
