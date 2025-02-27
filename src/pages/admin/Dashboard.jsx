// src/pages/admin/Dashboard.jsx
import React from 'react';
import DashboardLayout from '../../components/admin/DashboardLayout';
import { Users, Key, Activity, ArrowUp } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, change }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
        {change && (
          <p className="flex items-center text-sm text-green-600 mt-1">
            <ArrowUp size={16} className="mr-1" />
            {change}% from last month
          </p>
        )}
      </div>
      <div className="p-3 bg-blue-50 rounded-lg">
        <Icon size={24} className="text-blue-600" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome to your admin dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value="1,234"
          icon={Users}
          change={12}
        />
        <StatCard
          title="Active Licenses"
          value="856"
          icon={Key}
          change={8}
        />
        <StatCard
          title="Today's Activity"
          value="156"
          icon={Activity}
          change={24}
        />
      </div>

      {/* Recent Activity Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Add activity list here */}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;