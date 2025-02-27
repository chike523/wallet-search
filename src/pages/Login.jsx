import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const Login = () => {
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/validate_license.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ licenseKey }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else if (data.success) {
        // Get list of initialized license keys from localStorage
        const initializedKeys = JSON.parse(localStorage.getItem('initializedLicenseKeys') || '[]');
        
        // Check if this license key has been initialized before
        const isFirstTimeUse = !initializedKeys.includes(licenseKey);
        
        // Store license key
        localStorage.setItem('licenseKey', licenseKey);
        
        if (isFirstTimeUse) {
          // Redirect to initialization page for first-time users
          navigate('/initialize');
        } else {
          // Direct to search for returning users
          navigate('/search');
        }
      }
    } catch (err) {
      setError('Server error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-slate-900`}>
      <div className="max-w-md w-full p-6 bg-slate-800 rounded-lg shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Enter License Key</h2>
        {error && (
          <div className="mb-4 p-3 rounded bg-red-500/20 border border-red-500 text-red-300">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <input
              type="text"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
              placeholder="XXXX-XXXX-XXXX"
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              disabled={isLoading}
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              isLoading 
                ? 'bg-blue-600/50 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
            disabled={isLoading}
          >
            {isLoading ? 'Validating...' : 'Activate'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;