import React from 'react';

const WalletStats = ({ walletsChecked, foundBalance, isDarkMode, cryptoPrices, currencySymbol }) => {
  const totalUsdValue = Object.entries(foundBalance).reduce((total, [symbol, amount]) => {
    const price = cryptoPrices[symbol]?.USD || 0;
    return total + (parseFloat(amount) * price);
  }, 0);

  return (
    <div className={`mt-6 gap-4 mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
      <div className="p-4 rounded-lg bg-opacity-10 border border-opacity-20">
        <div className="text-sm opacity-75">
          Wallets checked: <span className="text-sm opacity-75">{walletsChecked.toLocaleString()}</span>
        </div>
        <div className="text-2xl font-bold">
          Found: {currencySymbol}{totalUsdValue.toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default WalletStats;