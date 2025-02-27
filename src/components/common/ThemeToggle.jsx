// src/components/common/ThemeToggle.jsx
import { Moon, Sun } from "lucide-react";

const ThemeToggle = ({ isDarkMode, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`p-2 rounded-lg transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-slate-700 hover:bg-slate-600 text-yellow-400' 
          : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
      }`}
    >
      {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

export default ThemeToggle;