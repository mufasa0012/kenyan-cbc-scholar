import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { User, Session } from '@supabase/supabase-js';
import { Navigate } from 'react-router-dom';
import schoolLogo from '@/assets/school-logo.jpg';
import { 
  Bell, 
  LogOut, 
  Menu, 
  X,
  Home,
  Users,
  BookOpen,
  Calendar,
  BarChart3,
  Settings,
  DollarSign,
  UserCheck,
  Award,
  Clock
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, avatar_url')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile data.",
        });
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out.",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    }
  };

  // Redirect if not authenticated
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const getNavigationItems = (role: string) => {
    const baseItems = [
      { icon: Home, label: 'Dashboard', href: '/dashboard' },
    ];

    switch (role) {
      case 'admin':
        return [
          ...baseItems,
          { icon: Users, label: 'User Management', href: '/dashboard/users' },
          { icon: BookOpen, label: 'Academic Management', href: '/dashboard/academic' },
          { icon: Calendar, label: 'School Calendar', href: '/dashboard/calendar' },
          { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
          { icon: DollarSign, label: 'Finance', href: '/dashboard/finance' },
          { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
        ];
      case 'sub_admin':
        return [
          ...baseItems,
          { icon: Users, label: 'Students & Teachers', href: '/dashboard/users' },
          { icon: BookOpen, label: 'Academic', href: '/dashboard/academic' },
          { icon: Calendar, label: 'Calendar', href: '/dashboard/calendar' },
          { icon: BarChart3, label: 'Reports', href: '/dashboard/analytics' },
        ];
      case 'class_teacher':
      case 'common_teacher':
      case 'intern_teacher':
        return [
          ...baseItems,
          { icon: Users, label: 'My Classes', href: '/dashboard/classes' },
          { icon: BookOpen, label: 'Subjects', href: '/dashboard/subjects' },
          { icon: UserCheck, label: 'Attendance', href: '/dashboard/attendance' },
          { icon: Award, label: 'Assessments', href: '/dashboard/assessments' },
          { icon: Calendar, label: 'Timetable', href: '/dashboard/timetable' },
        ];
      case 'student':
        return [
          ...baseItems,
          { icon: BookOpen, label: 'My Subjects', href: '/dashboard/subjects' },
          { icon: Award, label: 'My Results', href: '/dashboard/results' },
          { icon: Calendar, label: 'Timetable', href: '/dashboard/timetable' },
          { icon: Clock, label: 'Assignments', href: '/dashboard/assignments' },
        ];
      default:
        return baseItems;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'sub_admin': return 'secondary';
      case 'class_teacher': return 'default';
      case 'common_teacher': return 'secondary';
      case 'intern_teacher': return 'outline';
      case 'student': return 'outline';
      default: return 'outline';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'sub_admin': return 'Sub Administrator';
      case 'class_teacher': return 'Class Teacher';
      case 'common_teacher': return 'Subject Teacher';
      case 'intern_teacher': return 'Intern Teacher';
      case 'student': return 'Student';
      default: return role;
    }
  };

  const navigationItems = profile ? getNavigationItems(profile.role) : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-background/80 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 z-50 h-full w-64 bg-card shadow-strong transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <img 
                src={schoolLogo} 
                alt="Kenya CBC" 
                className="w-8 h-8 object-contain rounded"
              />
              <span className="font-bold text-sm">CBC School System</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* User profile section */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback>
                  {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{profile?.full_name}</p>
                <Badge variant={getRoleBadgeVariant(profile?.role || '')} className="text-xs">
                  {getRoleDisplayName(profile?.role || '')}
                </Badge>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top navigation */}
        <header className="bg-card shadow-soft border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <h1 className="text-lg font-semibold">
                Welcome back, {profile?.full_name?.split(' ')[0]}!
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;