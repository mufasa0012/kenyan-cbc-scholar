import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { User } from '@supabase/supabase-js';
import {
  Users,
  BookOpen,
  Calendar,
  TrendingUp,
  Bell,
  Clock,
  Award,
  DollarSign,
  School,
  ChevronRight
} from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  is_urgent: boolean;
  created_at: string;
}

interface DashboardStats {
  students: number;
  teachers: number;
  classes: number;
  subjects: number;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    students: 0,
    teachers: 0,
    classes: 0,
    subjects: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchUserProfile(user.id);
        fetchAnnouncements();
        fetchDashboardStats();
      }
    });
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('id, title, content, is_urgent, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setAnnouncements(data);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // Fetch multiple stats in parallel
      const [studentsRes, teachersRes, classesRes, subjectsRes] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }).in('role', ['class_teacher', 'common_teacher', 'intern_teacher']),
        supabase.from('classes').select('id', { count: 'exact' }),
        supabase.from('subjects').select('id', { count: 'exact' })
      ]);

      setStats({
        students: studentsRes.count || 0,
        teachers: teachersRes.count || 0,
        classes: classesRes.count || 0,
        subjects: subjectsRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const getWelcomeMessage = (role: string) => {
    switch (role) {
      case 'admin':
        return "Welcome to your administrative dashboard. Manage your school system efficiently.";
      case 'sub_admin':
        return "Welcome to your sub-administrative dashboard. Oversee academic activities.";
      case 'class_teacher':
        return "Welcome to your class teacher dashboard. Manage your class effectively.";
      case 'common_teacher':
        return "Welcome to your teacher dashboard. Track your subjects and students.";
      case 'intern_teacher':
        return "Welcome to your intern dashboard. Learn and contribute to education.";
      case 'student':
        return "Welcome to your student portal. Track your academic progress.";
      default:
        return "Welcome to the Kenya CBC School System.";
    }
  };

  const getQuickActions = (role: string) => {
    switch (role) {
      case 'admin':
        return [
          { label: 'Manage Students', icon: Users, href: '/students' },
          { label: 'View Finance', icon: DollarSign, href: '/finance' },
          { label: 'School Calendar', icon: Calendar, href: '/calendar' },
          { label: 'View Reports', icon: TrendingUp, href: '/reports' }
        ];
      case 'sub_admin':
        return [
          { label: 'Manage Students', icon: Users, href: '/students' },
          { label: 'Manage Classes', icon: School, href: '/classes' },
          { label: 'School Calendar', icon: Calendar, href: '/calendar' },
          { label: 'View Reports', icon: TrendingUp, href: '/reports' }
        ];
      case 'class_teacher':
      case 'common_teacher':
        return [
          { label: 'Mark Attendance', icon: Clock, href: '/attendance' },
          { label: 'My Classes', icon: School, href: '/classes' },
          { label: 'Assignments', icon: BookOpen, href: '/assignments' },
          { label: 'View Timetable', icon: Calendar, href: '/timetable' }
        ];
      case 'intern_teacher':
        return [
          { label: 'My Classes', icon: School, href: '/classes' },
          { label: 'View Timetable', icon: Calendar, href: '/timetable' },
          { label: 'Assignments', icon: BookOpen, href: '/assignments' }
        ];
      case 'student':
        return [
          { label: 'My Subjects', icon: BookOpen, href: '/subjects' },
          { label: 'My Assignments', icon: Clock, href: '/assignments' },
          { label: 'View Timetable', icon: Calendar, href: '/timetable' },
          { label: 'My Exams', icon: Award, href: '/exams' }
        ];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Unable to load your profile. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  const quickActions = getQuickActions(profile.role);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-primary rounded-xl p-6 text-primary-foreground">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 rounded-lg p-3">
              <School className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {profile.full_name.split(' ')[0]}!
              </h1>
              <p className="text-primary-foreground/80">
                {getWelcomeMessage(profile.role)}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid - Only for admin and sub_admin */}
        {(profile.role === 'admin' || profile.role === 'sub_admin') && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.students}</div>
                <p className="text-xs text-muted-foreground">
                  Enrolled students
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Teachers</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.teachers}</div>
                <p className="text-xs text-muted-foreground">
                  Teaching staff
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Classes</CardTitle>
                <School className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.classes}</div>
                <p className="text-xs text-muted-foreground">
                  Active classes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subjects</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.subjects}</div>
                <p className="text-xs text-muted-foreground">
                  CBC subjects
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
                <CardDescription>
                  Access your most used features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-between h-auto p-4"
                      onClick={() => window.location.href = action.href}
                    >
                      <div className="flex items-center space-x-3">
                        <action.icon className="h-5 w-5 text-primary" />
                        <span className="font-medium">{action.label}</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Announcements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Announcements</span>
              </CardTitle>
              <CardDescription>
                Latest school updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.length > 0 ? (
                  announcements.map((announcement) => (
                    <div key={announcement.id} className="border-l-2 border-primary pl-4">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm">{announcement.title}</h4>
                        {announcement.is_urgent && (
                          <Badge variant="destructive" className="text-xs">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {announcement.content.length > 100 
                          ? `${announcement.content.substring(0, 100)}...` 
                          : announcement.content
                        }
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No announcements available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;