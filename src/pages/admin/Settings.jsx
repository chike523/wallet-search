import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/admin/DashboardLayout';
import { Save } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const Settings = () => {
  const [credentials, setCredentials] = useState({
    currentUsername: '',
    currentPassword: '',
    newUsername: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [paymentDisplay, setPaymentDisplay] = useState({
    wallet_address: '',
    coin_type: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchPaymentSettings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/get_payment_settings.php`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setPaymentDisplay({
            wallet_address: data.wallet_address || '',
            coin_type: data.coin_type || ''
          });
        }
      } catch (err) {
        console.error('Failed to fetch payment settings:', err);
      }
    };

    fetchPaymentSettings();
  }, []);

  const handleCredentialsChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentDisplayChange = (e) => {
    setPaymentDisplay({
      ...paymentDisplay,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentDisplaySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/admin/update_payment_settings.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(paymentDisplay)
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setSuccess('Payment display settings updated successfully');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    }
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (credentials.newPassword !== credentials.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/update_credentials.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          currentUsername: credentials.currentUsername,
          currentPassword: credentials.currentPassword,
          newUsername: credentials.newUsername,
          newPassword: credentials.newPassword
        })
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setSuccess('Credentials updated successfully');
        setCredentials({
          currentUsername: '',
          currentPassword: '',
          newUsername: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      setError('Server error. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>
          
          {error && (
            <div className="mb-4 p-3 rounded bg-red-100 border border-red-400 text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded bg-green-100 border border-green-400 text-green-700">
              {success}
            </div>
          )}
        </div>

        {/* Payment Display Settings */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Payment Display Settings</h2>
          <form onSubmit={handlePaymentDisplaySubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Wallet Address</label>
              <input
                type="text"
                name="wallet_address"
                value={paymentDisplay.wallet_address}
                onChange={handlePaymentDisplayChange}
                className="w-full border rounded-lg p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Coin Type</label>
              <input
                type="text"
                name="coin_type"
                value={paymentDisplay.coin_type}
                onChange={handlePaymentDisplayChange}
                className="w-full border rounded-lg p-2"
                placeholder="e.g., SUI"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save size={20} />
              Update Payment Display
            </button>
          </form>
        </div>

        {/* Credentials Form */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Update Credentials</h2>
          <form onSubmit={handleCredentialsSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Current Username</label>
              <input
                type="text"
                name="currentUsername"
                value={credentials.currentUsername}
                onChange={handleCredentialsChange}
                className="w-full border rounded-lg p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={credentials.currentPassword}
                onChange={handleCredentialsChange}
                className="w-full border rounded-lg p-2"
                required
              />
            </div>

            <div className="border-t pt-4">
              <label className="block text-sm font-medium mb-1">New Username</label>
              <input
                type="text"
                name="newUsername"
                value={credentials.newUsername}
                onChange={handleCredentialsChange}
                className="w-full border rounded-lg p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={credentials.newPassword}
                onChange={handleCredentialsChange}
                className="w-full border rounded-lg p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={credentials.confirmPassword}
                onChange={handleCredentialsChange}
                className="w-full border rounded-lg p-2"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save size={20} />
              Update Credentials
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;