// components/Header.tsx
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Globe, User, LogOut } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HeaderProps {
  currentLang: string;
  onLanguageChange: (lang: string) => void;
  isLoggedIn?: boolean;
  onLogout: () => void;
  userRole: string;
}

const translations = {
  en: {
    brand: 'FindEase',
    buy: 'Buy',
    sell: 'Sell',
    home: 'Home',
    login: 'Login',
    signup: 'Sign Up',
    profile: 'My Profile',
    logout: 'Logout'
  },
  hi: {
    brand: 'फाइंडईज',
    buy: 'खरीदें',
    sell: 'बेचें',
    home: 'होम',
    login: 'लॉगिन',
    signup: 'साइन अप',
    profile: 'मेरी प्रोफाइल',
    logout: 'लॉगआउट'
  }
};

const Header = ({ 
  currentLang, 
  onLanguageChange,
  isLoggedIn = false,
  onLogout,
  userRole
}: HeaderProps) => {
  const navigate = useNavigate();
  const t = translations[currentLang];

  const handleSellClick = () => {
    if (isLoggedIn && userRole === 'seller') {
      navigate('/updatelisting');
    } else if (isLoggedIn && userRole !== 'seller') {
      navigate('/signup?role=seller');
    } else {
      navigate('/signup?role=seller');
    }
  };

  return (
    <header className="bg-background border-b border-border shadow-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <Home className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold font-heading text-primary ml-2">{t.brand}</h1>
          </div>

          {/* Centered Navigation */}
          <nav className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2 space-x-8">
            <Button 
              variant="ghost" 
              className="text-foreground hover:text-primary font-bold text-base"
              onClick={() => navigate('/')}
            >
              {t.home}
            </Button>
            <Button 
              variant="ghost" 
              className="text-foreground hover:text-primary font-bold text-base"
              onClick={() => navigate('/')}
            >
              {t.buy}
            </Button>
            <Button 
              variant="ghost" 
              className="text-foreground hover:text-primary font-bold text-base"
              onClick={handleSellClick}
            >
              {t.sell}
            </Button>
          </nav>

          {/* Right Side - Auth & Language */}
          <div className="flex items-center space-x-4">
            {!isLoggedIn ? (
              <>
                <Button 
                  variant="outline"
                  className="font-medium hidden md:block"
                  onClick={() => navigate('/login')}
                >
                  {t.login}
                </Button>
                <Button 
                  variant="default"
                  className="font-medium hidden md:block"
                  onClick={() => navigate('/signup')}
                >
                  {t.signup}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="font-medium hidden md:flex items-center space-x-2"
                  onClick={() => navigate('/profile')}
                >
                  <User className="h-4 w-4" />
                  <span>{userRole === 'seller' ? 'Seller Dashboard' : t.profile}</span>
                </Button>
                <Button
                  variant="outline"
                  className="font-medium hidden md:flex items-center space-x-2"
                  onClick={onLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t.logout}</span>
                </Button>
              </>
            )}
            
            <Select value={currentLang} onValueChange={onLanguageChange}>
              <SelectTrigger className="w-16 border-none bg-transparent">
                <Globe className="h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">EN</SelectItem>
                <SelectItem value="hi">हि</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;