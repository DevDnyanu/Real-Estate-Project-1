// Router.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home'
import Login from './Login';
import SignUpPage from './Signup';
import CreateListing from './CreateListing';
import Listings from './Listings';
import EditListing from './EditListing';
import ListingsPage from './ListingsPage';
// import Index from '../pages/Index';


const Router = ({ isAuthenticated, userRole, onLogin, onLogout }) => {
  return (
    <Routes>
      {/* Public Routes */}
      {/* <Route path="/" element={<Index />} /> */}
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
      
      {/* Listings page (public) */}
      <Route path="/properties" element={<Listings />} />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" />} />
      
    </Routes>
  );
};

export default Router;
