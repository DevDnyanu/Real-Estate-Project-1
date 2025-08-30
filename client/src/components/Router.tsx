// Router.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import SignUpPage from './Signup';
import CreateListing from './CreateListing';
import Listings from './Listings';
import EditListing from './EditListing';
import ListingsPage from './ListingsPage';
import ListingDetailsPage from './ListingDetailsPage';

// import ForgotPassword from './ForgotPassword';
// import VerifyOTP from './VerifyOtp';
// import ResetPassword from './resetPassword';


interface RouterProps {
  isAuthenticated: boolean;
  userRole: string;
  onLogin: (token: string, role: string) => void;
  onLogout: () => void;
}

const Router: React.FC<RouterProps> = ({ isAuthenticated, userRole, onLogin, onLogout }) => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={<Home currentLang="en" onLogout={onLogout} />}
      />

      <Route 
        path="/login" 
        element={
          !isAuthenticated ? 
            <Login onLogin={onLogin} /> : 
            <Navigate to={userRole === 'seller' ? '/updatelisting' : '/'} />
        } 
      />

      <Route 
        path="/signup" 
        element={
          !isAuthenticated ? 
            <SignUpPage onLogin={onLogin} /> : 
            <Navigate to={userRole === 'seller' ? '/updatelisting' : '/'} />
        } 
      />
      
      {/* <Route 
        path="/forgot-password" 
        element={<ForgotPassword />} 
      />
      
      <Route 
        path="/verify-otp" 
        element={<VerifyOTP />} 
      />
      
      <Route 
        path="/reset-password" 
        element={<ResetPassword />} 
      /> */}
      
      {/* Protected Routes */}
      <Route 
        path="/updatelisting" 
        element={
          isAuthenticated && userRole === 'seller' ? 
            <CreateListing /> : 
            <Navigate to="/login?role=seller" />
        } 
      />
      
      <Route 
        path="/listings" 
        element={
          isAuthenticated ? 
            <ListingsPage /> : 
            <Navigate to="/login" />
        } 
      />
      
      <Route 
        path="/edit/:id" 
        element={
          isAuthenticated ? 
            <EditListing /> : 
            <Navigate to="/login" />
        } 
      />
      <Route path="/listing/:id" element={<ListingDetailsPage />} />
      {/* Listings page (public) */}
      <Route path="/properties" element={<Listings />} />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default Router;