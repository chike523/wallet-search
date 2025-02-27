// src/pages/admin/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Sending credentials:', { username, password }); // For debugging
      const response = await fetch(`${API_BASE_URL}/admin/login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: username,
          password: password 
        }),
      });

      console.log('Response status:', response.status); // For debugging

      const data = await response.json();
      console.log('Response data:', data); // For debugging

      if (data.error) {
        setError(data.error);
      } else if (data.success) {
        localStorage.setItem('adminToken', data.token);
        navigate('/admin/licenses');
      }
    } catch (err) {
      console.error('Login error:', err); // For debugging
      setError('Server error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full p-6 bg-gray-800 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Admin Login</h2>
        {error && (
          <div className="mb-4 p-3 rounded bg-red-500/20 border border-red-500 text-red-300">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              disabled={isLoading}
              required
            />
          </div>
          <div className="mb-6">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
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
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;