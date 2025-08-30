// App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Header from './components/Header';
import RouterComponent from './components/Router';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';


interface User {
  token: string;
  role: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>('');
  const [currentLang, setCurrentLang] = useState<string>('en');
  const { toast } = useToast();

  const handleLogin = (token: string, role: string): void => {
    setIsAuthenticated(true);
    setUserRole(role);
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('userId', 'user-' + Date.now());
  };

  const handleLogout = (): void => {
    setIsAuthenticated(false);
    setUserRole('');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    toast({
      title: "Success",
      description: "Logged out successfully",
    });
  };

  const handleLanguageChange = (lang: string): void => {
    setCurrentLang(lang);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role);
    }
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Header 
          currentLang={currentLang}
          onLanguageChange={handleLanguageChange}
          isLoggedIn={isAuthenticated}
          onLogout={handleLogout}
          userRole={userRole}
        />
        
        <RouterComponent 
          isAuthenticated={isAuthenticated}
          userRole={userRole}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
        
        
        <Toaster />
      </div>
    </BrowserRouter>
  );
}

export default App;