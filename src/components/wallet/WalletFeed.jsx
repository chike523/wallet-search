import { useRef, memo, useMemo } from "react";

// Memoize the WalletEntry component
const WalletEntry = memo(({ wallet, isDarkMode, cryptoPrices, currencySymbol }) => {
  // Memoize the coins array to fix the ESLint warning
  const coins = useMemo(() => {
    return wallet.coins || [{ amount: wallet.balance, symbol: 'BTC' }];
  }, [wallet.coins, wallet.balance]);
  
  const hasBalance = useMemo(() => {
    return coins.some(coin => parseFloat(coin.amount) > 0);
  }, [coins]);

  // Memoize coin calculations
  const coinElements = useMemo(() => {
    return coins.map((coin, index) => (
      <span key={`${coin.symbol}-${index}`}>
        {index > 0 && <span className="mx-1">•</span>}
        <span>
          <img 
            src={`/assets/coins/${coin.symbol.toLowerCase()}.png`}
            alt={`${coin.symbol} logo`}
            className="w-4 h-4 mr-2 inline-block"
          />
          {parseFloat(coin.amount).toFixed(8)} {coin.symbol}
          <span className="ml-1 opacity-75">
            ({currencySymbol}{(parseFloat(coin.amount) * (cryptoPrices[coin.symbol]?.USD || 0)).toFixed(2)})
          </span>
        </span>
      </span>
    ));
  }, [coins, cryptoPrices, currencySymbol]);

  return (
    <div className={`mb-2 p-3 rounded-lg min-h-[3rem] flex items-center ${
      hasBalance ? isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
      : isDarkMode ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-100 text-slate-600'
    }`}>
      <div className="flex items-center w-full">
        <div className="flex items-center">
          <div className="whitespace-nowrap">
            {coinElements}
          </div>
        </div>
        <span className="mx-2 opacity-75">|</span>
        <span className="text-sm opacity-75 truncate">wallet check: {wallet.phrase}...</span>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function
  return (
    prevProps.wallet.timestamp === nextProps.wallet.timestamp &&
    prevProps.isDarkMode === nextProps.isDarkMode &&
    prevProps.currencySymbol === nextProps.currencySymbol &&
    JSON.stringify(prevProps.cryptoPrices) === JSON.stringify(nextProps.cryptoPrices)
  );
});

// Memoize the main list
const WalletFeed = memo(({ wallets, isDarkMode, cryptoPrices, currencySymbol }) => {
  const feedRef = useRef(null);

  // Memoize the wallet list
  const walletList = useMemo(() => {
    return wallets.map((wallet, index) => (
      <WalletEntry 
        key={`${wallet.timestamp}-${index}`}
        wallet={wallet}
        isDarkMode={isDarkMode}
        cryptoPrices={cryptoPrices}
        currencySymbol={currencySymbol}
      />
    ));
  }, [wallets, isDarkMode, cryptoPrices, currencySymbol]);

  return (
    <div
      ref={feedRef}
      className={`h-[20rem] overflow-y-auto rounded-lg p-4 transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
      } border`}
    >
      {walletList}
    </div>
  );
});

// Add display names for debugging
WalletEntry.displayName = 'WalletEntry';
WalletFeed.displayName = 'WalletFeed';

export default WalletFeed;