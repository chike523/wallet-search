import { Wallet, CreditCard } from "lucide-react";
import ThemeToggle from "../common/ThemeToggle";
import { Link } from 'react-router-dom';

const WalletHeader = ({ isDarkMode, onToggleTheme, currencySymbol }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <Wallet className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Wallet Search
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <Link 
          to="/withdraw"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isDarkMode 
              ? 'bg-blue-500 hover:bg-blue-600 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <CreditCard size={18} />
          <span>Withdraw</span>
        </Link>
        <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleTheme} />
      </div>
    </div>
  );
};

export default WalletHeader;