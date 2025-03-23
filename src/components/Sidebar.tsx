import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Bell, Users, LogOut } from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  return (
    <div className="h-screen w-64 bg-gray-900 text-white p-4 fixed left-0 top-0">
      <div className="flex items-center gap-2 mb-8">
        <Home className="w-8 h-8" />
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>
      
      <nav className="space-y-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-2 p-3 rounded-lg transition-colors ${
              isActive ? 'bg-gray-800' : 'hover:bg-gray-800'
            }`
          }
        >
          <Home size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink
          to="/alerts"
          className={({ isActive }) =>
            `flex items-center gap-2 p-3 rounded-lg transition-colors ${
              isActive ? 'bg-gray-800' : 'hover:bg-gray-800'
            }`
          }
        >
          <Bell size={20} />
          <span>Alerts</span>
        </NavLink>
        
        <NavLink
          to="/users"
          className={({ isActive }) =>
            `flex items-center gap-2 p-3 rounded-lg transition-colors ${
              isActive ? 'bg-gray-800' : 'hover:bg-gray-800'
            }`
          }
        >
          <Users size={20} />
          <span>Users</span>
        </NavLink>
      </nav>
      
      <button
        onClick={onLogout}
        className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-800 transition-colors mt-auto absolute bottom-4 w-[calc(100%-2rem)]"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </div>
  );
};