import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Copy, Loader2, MessagesSquare } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const WithdrawalModal = ({ 
  isOpen, 
  onClose, 
  wallet, 
  coin,
  isDarkMode,
  cryptoPrices,
  currencySymbol
}) => {
  const [withdrawalAddress, setWithdrawalAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentDisplay, setPaymentDisplay] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const fetchPaymentDisplay = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/get_payment_settings.php`);
        const data = await response.json();
        if (data.success) {
          setPaymentDisplay(data);
        }
      } catch (error) {
        console.error('Error fetching payment display:', error);
      }
    };

    if (isOpen) {
      fetchPaymentDisplay();
    }
  }, [isOpen]);

  const handleCopyAddress = async () => {
    if (paymentDisplay?.wallet_address) {
      try {
        await navigator.clipboard.writeText(paymentDisplay.wallet_address);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const handleOpenChat = () => {
    if (window.chaport && window.chaport.q) {
      window.chaport.q('open');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const licenseKey = localStorage.getItem('licenseKey');
      const response = await fetch(`${API_BASE_URL}/submit_withdrawal.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          licenseKey,
          walletId: wallet.id,
          coinSymbol: coin.symbol,
          withdrawalAddress,
          amount: coin.amount
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Withdrawal request submitted successfully!');
        setTimeout(() => {
          onClose(true);
        }, 2000);
      } else {
        setError(data.error || 'Failed to submit withdrawal request');
      }
    } catch (error) {
      setError('Failed to submit withdrawal request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose(false)}>
      <DialogContent className={`sm:max-w-md ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
        <DialogHeader>
          <DialogTitle className={`${isDarkMode ? 'text-white' : 'text-slate-900'} text-xl font-semibold`}>
            Withdraw {coin.symbol}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {paymentDisplay && (
            <div className={`rounded-lg overflow-hidden border ${
              isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="p-4">
                <h3 className={`font-medium text-center mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Payment Required
                </h3>
                <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                  Please contact admin via chat to know the fee amount before proceeding.
                </p>
              </div>

              <div className={`p-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                {/* Amount Display */}
                <div className={`p-4 rounded-lg mb-4 ${
                  isDarkMode ? 'bg-slate-800' : 'bg-white'
                }`}>
                  <div className="flex items-center gap-3">
                    <img
                      src={`/assets/coins/${coin.symbol.toLowerCase()}.png`}
                      alt={coin.symbol}
                      className="w-8 h-8"
                    />
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {parseFloat(coin.amount).toFixed(3)}
                        </span>
                        <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          {coin.symbol}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        ≈ {currencySymbol}{(parseFloat(coin.amount) * (cryptoPrices[coin.symbol]?.USD || 0)).toFixed(2)} USD
                      </div>
                    </div>
                  </div>
                </div>

                {/* Wallet Address */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={paymentDisplay.wallet_address}
                    readOnly
                    className={`flex-1 px-3 py-2 rounded-lg font-mono text-sm ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-slate-300' 
                        : 'bg-white border-gray-200 text-slate-900'
                    } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <button
                    type="button"
                    onClick={handleCopyAddress}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'hover:bg-slate-700 text-slate-300' 
                        : 'hover:bg-gray-100 text-slate-600'
                    }`}
                  >
                    {copySuccess ? (
                      <span className="text-green-500 text-sm">Copied!</span>
                    ) : (
                      <Copy size={18} />
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleOpenChat}
                  className={`w-full mt-4 flex items-center justify-center gap-2 p-3 rounded-lg transition-colors ${
                    isDarkMode
                      ? 'bg-slate-800 hover:bg-slate-700 text-blue-400'
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                  }`}
                >
                  <MessagesSquare size={18} />
                  <span>Contact Admin via Chat</span>
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Your {coin.symbol} Withdrawal Address
            </label>
            <input
              type="text"
              value={withdrawalAddress}
              onChange={(e) => setWithdrawalAddress(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-sm ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-700 text-slate-300' 
                  : 'bg-white border-gray-300 text-slate-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder={`Enter your ${coin.symbol} address`}
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2.5 rounded-lg transition-colors ${
              isDarkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              'Submit Withdrawal Request'
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalModal;