import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { User, Session } from '@supabase/supabase-js';
import { Navigate } from 'react-router-dom';
import schoolLogo from '@/assets/school-logo.jpg';
import { GraduationCap, BookOpen, Users, Calendar } from 'lucide-react';

const AuthPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          toast({
            title: "Welcome!",
            description: "Successfully signed in to the school system.",
          });
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: error.message,
      });
    }

    setLoading(false);
  };

  const handleSignUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    setError(null);

    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: error.message,
      });
    } else {
      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account.",
      });
    }

    setLoading(false);
  };

  // Redirect if user is already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - School branding */}
        <div className="hidden lg:flex flex-col items-center justify-center text-center space-y-6 p-8">
          <div className="relative">
            <img 
              src={schoolLogo} 
              alt="Kenya CBC School System" 
              className="w-48 h-48 object-contain rounded-2xl shadow-strong"
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-primary opacity-10"></div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Kenya CBC School System
            </h1>
            <p className="text-xl text-muted-foreground">
              Modern School Management for the Competency-Based Curriculum
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            <div className="flex flex-col items-center p-4 rounded-lg bg-card shadow-soft">
              <GraduationCap className="h-8 w-8 text-primary mb-2" />
              <span className="text-sm font-medium">Student Management</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-card shadow-soft">
              <BookOpen className="h-8 w-8 text-primary mb-2" />
              <span className="text-sm font-medium">CBC Curriculum</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-card shadow-soft">
              <Users className="h-8 w-8 text-primary mb-2" />
              <span className="text-sm font-medium">Teacher Portal</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-card shadow-soft">
              <Calendar className="h-8 w-8 text-primary mb-2" />
              <span className="text-sm font-medium">School Calendar</span>
            </div>
          </div>
        </div>

        {/* Right side - Authentication forms */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-strong border-0 bg-gradient-card">
            <CardHeader className="text-center">
              <div className="lg:hidden mb-4">
                <img 
                  src={schoolLogo} 
                  alt="Kenya CBC School System" 
                  className="w-20 h-20 object-contain mx-auto rounded-xl shadow-medium"
                />
              </div>
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to access your school dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <SignInForm onSubmit={handleSignIn} loading={loading} />
                </TabsContent>

                <TabsContent value="signup">
                  <SignUpForm onSubmit={handleSignUp} loading={loading} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

interface SignInFormProps {
  onSubmit: (email: string, password: string) => void;
  loading: boolean;
}

const SignInForm: React.FC<SignInFormProps> = ({ onSubmit, loading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signin-email">Email</Label>
        <Input
          id="signin-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signin-password">Password</Label>
        <Input
          id="signin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter your password"
        />
      </div>
      <Button 
        type="submit" 
        className="w-full" 
        variant="hero" 
        disabled={loading}
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </Button>
    </form>
  );
};

interface SignUpFormProps {
  onSubmit: (email: string, password: string, fullName: string) => void;
  loading: boolean;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSubmit, loading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password, fullName);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-name">Full Name</Label>
        <Input
          id="signup-name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          placeholder="Enter your full name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Create a password"
        />
      </div>
      <Button 
        type="submit" 
        className="w-full" 
        variant="hero" 
        disabled={loading}
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
};

export default AuthPage;