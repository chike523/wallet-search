import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/admin/DashboardLayout';
import { Check, X, Search } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const Withdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cryptoPrices, setCryptoPrices] = useState({});

  // Add crypto prices fetch
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch(
          'https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,USDT,BNB,SOL,XRP,ADA,DOGE&tsyms=USD'
        );
        const prices = await response.json();
        setCryptoPrices(prices);
      } catch (error) {
        console.error('Error fetching crypto prices:', error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/withdrawals.php`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setWithdrawals(data.withdrawals);
      }
    } catch (error) {
      setError('Failed to fetch withdrawals');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
    const interval = setInterval(fetchWithdrawals, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/update_withdrawal.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          id,
          status: newStatus
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(`Withdrawal ${newStatus} successfully`);
        fetchWithdrawals();
      } else {
        setError(data.error || 'Failed to update withdrawal status');
      }
    } catch (error) {
      setError('Failed to update withdrawal status');
    }
  };

  const filteredWithdrawals = withdrawals.filter(withdrawal =>
    withdrawal.withdrawal_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    withdrawal.coin_symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    withdrawal.license_key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <DashboardLayout>Loading...</DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Withdrawal Requests</h1>
          <p className="text-gray-500">Manage withdrawal requests</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-600">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">License</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">USD Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Withdrawal Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredWithdrawals.map(withdrawal => {
                const usdValue = (parseFloat(withdrawal.amount) * (cryptoPrices[withdrawal.coin_symbol]?.USD || 0)).toFixed(2);
                return (
                  <tr key={withdrawal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      {new Date(withdrawal.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">
                      {withdrawal.license_key}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <img 
                          src={`/assets/coins/${withdrawal.coin_symbol.toLowerCase()}.png`}
                          alt={withdrawal.coin_symbol}
                          className="w-5 h-5"
                        />
                        <span className="font-medium">{withdrawal.coin_symbol}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono">
                      {parseFloat(withdrawal.amount).toFixed(3)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      ${usdValue}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono break-all">
                      {withdrawal.withdrawal_address}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        withdrawal.status === 'approved' ? 'bg-green-100 text-green-800' :
                        withdrawal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {withdrawal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {withdrawal.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(withdrawal.id, 'approved')}
                            className="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200"
                            title="Approve"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleStatusChange(withdrawal.id, 'rejected')}
                            className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                            title="Reject"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Withdrawals;