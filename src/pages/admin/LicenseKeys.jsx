import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/admin/DashboardLayout';
import { Plus, Trash2, Power, PowerOff, Search, Edit, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { API_BASE_URL } from '../../config';

const SUPPORTED_COINS = [
 { symbol: 'BTC', name: 'Bitcoin' },
 { symbol: 'ETH', name: 'Ethereum' },
 { symbol: 'USDT', name: 'Tether' },
 { symbol: 'BNB', name: 'Binance Coin' },
 { symbol: 'SOL', name: 'Solana' },
 { symbol: 'XRP', name: 'Ripple' },
 { symbol: 'ADA', name: 'Cardano' },
 { symbol: 'DOGE', name: 'Dogecoin' },
];



const LicenseKeys = () => {
 const [licenses, setLicenses] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState('');
 const [success, setSuccess] = useState('');
 const [searchTerm, setSearchTerm] = useState('');
 const [isEditModalOpen, setIsEditModalOpen] = useState(false);
 const [selectedLicense, setSelectedLicense] = useState(null);
 const [editConfig, setEditConfig] = useState({
   searchDuration: 300000,
   currencySymbol: '$',
   wallets: []
 });
 const [coinPrices, setCoinPrices] = useState({});
 const [withdrawalStatuses, setWithdrawalStatuses] = useState({});

 useEffect(() => {
   const fetchWithdrawalStatuses = async () => {
     const response = await fetch(`${API_BASE_URL}/admin/get_withdrawal_statuses.php`, {
       headers: {
         'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
       }
     });
     const data = await response.json();
     if (data.success) {
       const statusMap = {};
       data.statuses.forEach(status => {
         const key = `${status.wallet_id}_${status.coin_symbol}`;
         statusMap[key] = status.status;
       });
       setWithdrawalStatuses(statusMap);
     }
   };
   fetchWithdrawalStatuses();
 }, []);

 useEffect(() => {
   const fetchPrices = async () => {
     const symbols = SUPPORTED_COINS.map(c => c.symbol).join(',');
     try {
       const response = await fetch(
         `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbols}&tsyms=USD`
       );
       const prices = await response.json();
       setCoinPrices(prices);
     } catch (error) {
       console.error('Error fetching prices:', error);
     }
   };

   fetchPrices();
   const interval = setInterval(fetchPrices, 30000);
   return () => clearInterval(interval);
 }, []);

 const fetchLicenses = async () => {
   try {
     const response = await fetch(`${API_BASE_URL}/admin/licenses.php`, {
       headers: {
         'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
       }
     });
     const data = await response.json();
     setLicenses(data);
   } catch (err) {
     setError('Failed to fetch licenses');
   } finally {
     setIsLoading(false);
   }
 };

 useEffect(() => {
   fetchLicenses();
   const interval = setInterval(fetchLicenses, 5000);
   return () => clearInterval(interval);
 }, []);

 useEffect(() => {
   if (success || error) {
     const timer = setTimeout(() => {
       setSuccess('');
       setError('');
     }, 3000);
     return () => clearTimeout(timer);
   }
 }, [success, error]);

 const handleEditClick = async (license) => {
   setSelectedLicense(license);
   try {
     const response = await fetch(`${API_BASE_URL}/admin/get_license_config.php?id=${license.id}`, {
       headers: {
         'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
       }
     });
     const data = await response.json();
     
     if (data.success) {
       const wallets = data.config.wallets || [];
       
       const mappedWallets = wallets.map(wallet => {
         return {
           id: wallet.id,
           seedPhrase: wallet.seedPhrase || wallet.seed_phrase || '',
           coins: Array.isArray(wallet.coins) ? wallet.coins.map(coin => ({
             symbol: coin.symbol || coin.coin_symbol || 'BTC',
             amount: coin.amount || coin.coin_amount || ''
           })) : [{ symbol: 'BTC', amount: wallet.amount || '' }]
         };
       });
 
       const config = {
         searchDuration: data.config.searchDuration || data.config.search_duration || 300000,
         currencySymbol: data.config.currencySymbol || data.config.currency_symbol || '$',
         wallets: mappedWallets
       };
 
       setEditConfig(config);
     }
     setIsEditModalOpen(true);
   } catch (err) {
     console.error('Error fetching license config:', err);
     setError('Failed to fetch license configuration');
   }
 };

 const handleAddWallet = () => {
   setEditConfig(prev => ({
     ...prev,
     wallets: [...prev.wallets, {
       amount: '',
       seedPhrase: '',
       coins: [{ symbol: 'BTC', amount: '' }]
     }]
   }));
 };

 const handleRemoveWallet = (index) => {
   setEditConfig(prev => ({
     ...prev,
     wallets: prev.wallets.filter((_, i) => i !== index)
   }));
 };

 const handleWalletChange = (index, field, value) => {
   setEditConfig(prev => ({
     ...prev,
     wallets: prev.wallets.map((wallet, i) => 
       i === index ? { ...wallet, [field]: value } : wallet
     )
   }));
 };

 const handleAddCoin = (walletIndex) => {
   setEditConfig(prev => ({
     ...prev,
     wallets: prev.wallets.map((wallet, idx) => {
       if (idx === walletIndex) {
         return {
           ...wallet,
           coins: [...(wallet.coins || []), { symbol: 'BTC', amount: '' }]
         };
       }
       return wallet;
     })
   }));
 };

 const handleRemoveCoin = (walletIndex, coinIndex) => {
   setEditConfig(prev => ({
     ...prev,
     wallets: prev.wallets.map((wallet, idx) => {
       if (idx === walletIndex) {
         return {
           ...wallet,
           coins: wallet.coins.filter((_, i) => i !== coinIndex)
         };
       }
       return wallet;
     })
   }));
 };

 const handleCoinChange = (walletIndex, coinIndex, field, value) => {
  setEditConfig(prev => ({
    ...prev,
    wallets: prev.wallets.map((wallet, idx) => {
      if (idx === walletIndex) {
        return {
          ...wallet,
          coins: wallet.coins.map((coin, cIdx) => {
            if (cIdx === coinIndex) {
              if (field === 'amount') {
                return { ...coin, amount: value };
              }
              if (field === 'symbol') {
                return { symbol: value, amount: '' }; // Reset amount on symbol change
              }
              return { ...coin, [field]: value };
            }
            return coin;
          })
        };
      }
      return wallet;
    })
  }));
};

 const handleSaveConfig = async () => {
   try {
     const validatedWallets = editConfig.wallets.map(wallet => {
       if (!wallet.seedPhrase) {
         throw new Error('All wallets must have a seed phrase');
       }
       if (!wallet.coins || wallet.coins.length === 0) {
         throw new Error('All wallets must have at least one coin');
       }
       
       wallet.coins.forEach(coin => {
         if (!coin.amount || isNaN(parseFloat(coin.amount))) {
           throw new Error('All coins must have valid amounts');
         }
       });

       return {
         ...wallet,
         coins: wallet.coins.map(coin => ({
           symbol: coin.symbol,
           amount: parseFloat(coin.amount)
         }))
       };
     });

     const response = await fetch(`${API_BASE_URL}/admin/save_license_config.php`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
       },
       body: JSON.stringify({
         licenseId: selectedLicense.id,
         config: {
           ...editConfig,
           wallets: validatedWallets
         }
       })
     });

     const data = await response.json();
     if (data.success) {
       setSuccess('Configuration saved successfully');
       setIsEditModalOpen(false);
       fetchLicenses();
     } else {
       setError(data.error || 'Failed to save configuration');
     }
   } catch (err) {
     console.error('Error saving config:', err);
     setError(err.message || 'Failed to save configuration');
   }
 };

 const generateKey = async () => {
   try {
     const response = await fetch(`${API_BASE_URL}/admin/generate_key.php`, {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
       }
     });
     const data = await response.json();
     if (data.success) {
       const license = data.license;
       setSuccess('License key generated successfully');
       handleEditClick(license);
       fetchLicenses();
     } else {
       setError(data.error);
     }
   } catch (err) {
     setError('Failed to generate key');
   }
 };

 const toggleKeyStatus = async (id, currentStatus) => {
   try {
     const response = await fetch(`${API_BASE_URL}/admin/toggle_key.php`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
       },
       body: JSON.stringify({ id })
     });
     const data = await response.json();
     if (data.success) {
       setSuccess(`License key ${data.is_active ? 'activated' : 'deactivated'} successfully`);
       fetchLicenses();
     } else {
       setError(data.error);
     }
   } catch (err) {
     setError('Failed to update key status');
   }
 };

 const deleteKey = async (id) => {
   if (!window.confirm('Are you sure you want to delete this license key?')) return;
   
   try {
     const response = await fetch(`${API_BASE_URL}/admin/delete_key.php`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
       },
       body: JSON.stringify({ id })
     });
     const data = await response.json();
     if (data.success) {
       setSuccess('License key deleted successfully');
       fetchLicenses();
     } else {
       setError(data.error);
     }
   } catch (err) {
     setError('Failed to delete key');
   }
 };

 const filteredLicenses = licenses.filter(license => 
   license.license_key.toLowerCase().includes(searchTerm.toLowerCase())
 );

 if (isLoading) {
   return <DashboardLayout>Loading...</DashboardLayout>;
 }

 return (
   <DashboardLayout>
     <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
       <div>
         <h1 className="text-2xl font-bold">License Keys</h1>
         <p className="text-gray-500">Manage your license keys</p>
       </div>
       <div className="flex gap-4">
         <div className="relative">
           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
           <input
             type="text"
             placeholder="Search keys..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64"
           />
         </div>
         <button
           onClick={generateKey}
           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
         >
           <Plus size={20} />
           <span className="hidden sm:inline">Generate Key</span>
         </button>
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
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
               <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
               <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uses</th>
               <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-gray-200">
             {filteredLicenses.map(license => (
               <tr key={license.id} className="hover:bg-gray-50">
                 <td className="px-6 py-4 font-mono text-sm">{license.license_key}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      license.is_active === '1'
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {license.is_active === '1' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 text-sm text-gray-500">
                    {new Date(license.created_at).toLocaleDateString()}
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 text-sm text-gray-500">
                    {license.uses_count}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleEditClick(license)}
                      className="p-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => toggleKeyStatus(license.id, license.is_active)}
                      className={`p-1.5 rounded-lg ${
                        license.is_active === '1'
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                      title={license.is_active === '1' ? 'Deactivate' : 'Activate'}
                    >
                      {license.is_active === '1' ? <PowerOff size={16} /> : <Power size={16} />}
                    </button>
                    <button
                      onClick={() => deleteKey(license.id)}
                      className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl h-[90vh] my-4 flex flex-col">
          <div className="flex justify-between items-center pb-4 border-b">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Edit License Configuration</DialogTitle>
            </DialogHeader>
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto py-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Search Duration</label>
                <div className="relative">
                  <input
                    type="number"
                    value={editConfig.searchDuration / 60000}
                    onChange={(e) => setEditConfig(prev => ({
                      ...prev,
                      searchDuration: e.target.value * 60000
                    }))}
                    className="w-full border rounded-lg p-2.5"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">minutes</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Currency Symbol</label>
                <input
                  type="text"
                  value={editConfig.currencySymbol}
                  onChange={(e) => setEditConfig(prev => ({
                    ...prev,
                    currencySymbol: e.target.value
                  }))}
                  className="w-full border rounded-lg p-2.5"
                  placeholder="e.g. $, €, £"
                />
              </div>
            </div>

            {/* Wallets Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Wallet Configurations</h3>
                <button
                  onClick={handleAddWallet}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Wallet
                </button>
              </div>

              <div className="space-y-6">
                {editConfig.wallets.map((wallet, index) => {
                  const hasWithdrawnCoins = wallet.coins?.some(coin => 
                    withdrawalStatuses[`${wallet.id}_${coin.symbol}`] === 'approved'
                  );
                  
                  return (
                    <div key={index} className="bg-gray-50 rounded-xl p-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-lg">Wallet #{index + 1}</h4>
                        {!hasWithdrawnCoins && (
                          <button
                            onClick={() => handleRemoveWallet(index)}
                            className="text-red-600 hover:text-red-700 flex items-center gap-1"
                          >
                            <Trash2 size={16} />
                            Remove
                          </button>
                        )}
                      </div>

                      {/* Coins */}
                      <div className="space-y-4">
                        <label className="block text-sm font-medium">Coins</label>
                        <div className="space-y-3">
                          {wallet.coins?.map((coin, coinIndex) => {
                            const isWithdrawn = withdrawalStatuses[`${wallet.id}_${coin.symbol}`] === 'approved';
                            return (
                              <div key={coinIndex} className={`flex gap-4 items-center bg-white p-3 rounded-lg shadow-sm ${
                                isWithdrawn ? 'opacity-50' : ''
                              }`}>
                                <select
                                  value={coin.symbol}
                                  onChange={(e) => handleCoinChange(index, coinIndex, 'symbol', e.target.value)}
                                  className="w-40 border rounded-lg p-2.5"
                                  disabled={isWithdrawn}
                                >
                                  {SUPPORTED_COINS.map(c => (
                                    <option key={c.symbol} value={c.symbol}>{c.name}</option>
                                  ))}
                                </select>
                                <div className="flex-1">
  <div className="relative">
    <input
      type="text"
      value={coin.amount}
      onChange={(e) => handleCoinChange(index, coinIndex, 'amount', e.target.value)}
      placeholder={`${coin.symbol} Amount`}
      className="w-full border rounded-lg p-2.5"
      disabled={isWithdrawn}
    />
  </div>
  {isWithdrawn ? (
    <span className="text-sm text-red-500">Withdrawn</span>
  ) : (
    <div className="text-sm text-gray-500 mt-1">
      ≈ ${(coin.amount * (coinPrices[coin.symbol]?.USD || 0)).toFixed(2)} USD
    </div>
  )}
</div>
                                {!isWithdrawn && (
                                  <button
                                    onClick={() => handleRemoveCoin(index, coinIndex)}
                                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                          {!hasWithdrawnCoins && (
                            <button
                              onClick={() => handleAddCoin(index)}
                              className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                            >
                              <Plus size={14} />
                              Add Another Coin
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Seed Phrase */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Seed Phrase</label>
                        <textarea
                          value={wallet.seedPhrase}
                          onChange={(e) => handleWalletChange(index, 'seedPhrase', e.target.value)}
                          className="w-full border rounded-lg p-2.5"
                          rows={3}
                          placeholder="Enter wallet seed phrase"
                          disabled={hasWithdrawnCoins}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveConfig}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Save Configuration
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default LicenseKeys;