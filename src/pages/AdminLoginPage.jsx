
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Loader2, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    const result = await login(email, password);
    
    if (result.success) {
      const from = location.state?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Invalid admin credentials');
      setIsLoggingIn(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Login - Giver Recording Studio</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="googlebot" content="noindex,nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
          </div>

          <Card className="bg-card/80 backdrop-blur-xl border-border shadow-2xl">
            <CardHeader className="text-center space-y-2 pb-6">
              <CardTitle className="text-2xl font-bold tracking-tight">Admin Authentication</CardTitle>
              <CardDescription className="text-muted-foreground">
                Giver Recording Studio Management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                {error && (
                  <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20 text-center">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-muted-foreground">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    placeholder="Enter administrator email"
                    className="bg-background border-border focus-visible:ring-primary/50 text-foreground"
                    disabled={isLoggingIn}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-muted-foreground">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    className="bg-background border-border focus-visible:ring-primary/50 text-foreground"
                    disabled={isLoggingIn}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Authenticate'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <div className="mt-8 text-center">
            <Button variant="link" onClick={() => navigate('/')} className="text-muted-foreground hover:text-primary">
              &larr; Back to Website
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLoginPage;
