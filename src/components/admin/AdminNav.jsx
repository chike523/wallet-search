import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Key, Settings, CreditCard } from 'lucide-react';

const AdminNav = () => {
  const navItems = [
    { to: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/admin/licenses', icon: <Key size={20} />, label: 'License Keys' },
    { to: '/admin/withdrawals', icon: <CreditCard size={20} />, label: 'Withdrawals' },
    { to: '/admin/settings', icon: <Settings size={20} />, label: 'Settings' }
  ];

  return (
    <nav className="space-y-1">
      {navItems.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `
            flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
            ${isActive 
              ? 'bg-blue-50 text-blue-700' 
              : 'text-gray-600 hover:bg-gray-50'
            }
          `}
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default AdminNav;