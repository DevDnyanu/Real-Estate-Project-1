// components/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { UserCheck, Store, Eye, EyeOff, ArrowLeft } from 'lucide-react';

// Define TypeScript interfaces
interface LoginProps {
  onLogin: (token: string, role: UserRole) => void;
}

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

interface MockUser {
  email: string;
  password: string;
  token: string;
  user: {
    name: string;
    role: UserRole;
  };
}

type UserRole = 'buyer' | 'seller';

// Type guard to ensure only valid roles are accepted
const isUserRole = (value: string): value is UserRole => {
  return value === 'buyer' || value === 'seller';
};

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<UserRole>(
    (searchParams.get('role') as UserRole) || 'buyer'
  );

  // Handle tab change with type safety
  const handleTabChange = (value: string) => {
    if (isUserRole(value)) {
      setActiveRole(value);
      // Clear errors when switching tabs
      setErrors({});
    }
  };

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Mock user data for testing
  const mockUsers: Record<UserRole, MockUser> = {
    buyer: {
      email: 'buyer@example.com',
      password: 'password123',
      token: 'mock-buyer-token-123',
      user: { name: 'John Buyer', role: 'buyer' }
    },
    seller: {
      email: 'seller@example.com',
      password: 'password123',
      token: 'mock-seller-token-456',
      user: { name: 'Jane Seller', role: 'seller' }
    }
  };

  const handleSubmit = async (e: React.FormEvent, role: UserRole) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      const mockUser = mockUsers[role];
      
      if (formData.email === mockUser.email && formData.password === mockUser.password) {
        onLogin(mockUser.token, mockUser.user.role);
        toast({
          title: "Success",
          description: `Welcome! Logged in as ${mockUser.user.name}`,
        });
        
        // Redirect based on role
        if (mockUser.user.role === 'seller') {
          navigate('/updatelisting');
        } else {
          navigate('/');
        }
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing in the field
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 px-4 py-12">
      <Card className="w-full max-w-md shadow-card relative">
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute top-4 left-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <CardHeader className="text-center pt-12">
          <CardTitle className="text-2xl font-heading">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Use the type-safe handler */}
          <Tabs value={activeRole} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="buyer" className="flex items-center space-x-2">
                <UserCheck className="h-4 w-4" />
                <span>Buyer</span>
              </TabsTrigger>
              <TabsTrigger value="seller" className="flex items-center space-x-2">
                <Store className="h-4 w-4" />
                <span>Seller</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="buyer" className="space-y-4 mt-4">
              <form onSubmit={(e) => handleSubmit(e, 'buyer')} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="buyer-email">Email</Label>
                  <Input
                    id="buyer-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buyer-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="buyer-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className={`pr-10 ${errors.password ? 'border-destructive' : ''}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    Demo: buyer@example.com / password123
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Login as Buyer'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="seller" className="space-y-4 mt-4">
              <form onSubmit={(e) => handleSubmit(e, 'seller')} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seller-email">Email</Label>
                  <Input
                    id="seller-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seller-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="seller-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className={`pr-10 ${errors.password ? 'border-destructive' : ''}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    Demo: seller@example.com / password123
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Login as Seller'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="text-center mt-4">
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot Password?
            </Link>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            New user?{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
          
          {/* <div className="bg-muted p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Test Credentials:</h4>
            <div className="text-xs space-y-1">
              <p><strong>Buyer:</strong> buyer@example.com / password123</p>
              <p><strong>Seller:</strong> seller@example.com / password123</p>
            </div>
          </div> */}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;