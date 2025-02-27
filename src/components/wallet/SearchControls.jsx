// src/components/wallet/SearchControls.jsx
const SearchControls = ({ isSearching, onStart, onStop }) => {
    return (
      <div className="flex gap-4">
        <button
          onClick={onStart}
          disabled={isSearching}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors duration-300 ${
            isSearching
              ? 'bg-slate-600 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          Start
        </button>
        <button
          onClick={onStop}
          disabled={!isSearching}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors duration-300 ${
            !isSearching
              ? 'bg-slate-600 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          Stop
        </button>
      </div>
    );
  };
  
  export default SearchControls;