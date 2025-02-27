import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import AdminLogin from './pages/admin/Login';
import LicenseKeys from './pages/admin/LicenseKeys';
import Settings from './pages/admin/Settings';
import WalletFinder from './components/WalletFinder';
import Withdraw from './pages/Withdraw';
import Withdrawals from './pages/admin/Withdrawals';
import ProtectedRoute from './components/ProtectedRoute';
import ChatWidget from './components/ChatWidget';
import InitializationPage from './pages/InitializationPage';
import About from './pages/About';

// Wrapper component to conditionally render ChatWidget
const ChatWidgetWrapper = () => {
  const location = useLocation();
  return location.pathname === '/withdraw' ? <ChatWidget /> : null;
};

function App() {
  return (
    <Router>
      <ChatWidgetWrapper />
      
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route 
          path="/initialize"
          element={
            <ProtectedRoute>
              <InitializationPage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/admin"
          element={<Navigate to="/admin/licenses" replace />}
        />
        <Route 
          path="/admin/licenses"
          element={
            <ProtectedRoute adminRequired>
              <LicenseKeys />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/admin/settings"
          element={
            <ProtectedRoute adminRequired>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/admin/withdrawals" 
          element={
            <ProtectedRoute isAdmin>
              <Withdrawals />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/search"
          element={
            <ProtectedRoute>
              <WalletFinder />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/withdraw" 
          element={
            <ProtectedRoute>
              <Withdraw />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;