// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminRequired = false }) => {
  const licenseKey = localStorage.getItem('licenseKey');
  const adminToken = localStorage.getItem('adminToken');
  
  if (adminRequired && !adminToken) {
    return <Navigate to="/admin" replace />;
  }
  
  if (!adminRequired && !licenseKey) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default ProtectedRoute;