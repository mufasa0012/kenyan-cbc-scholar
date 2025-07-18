import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import schoolLogo from '@/assets/school-logo.jpg';
import {
  GraduationCap,
  BookOpen,
  Users,
  Calendar,
  Award,
  BarChart3,
  Shield,
  Globe,
  Heart,
  Star,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  // Redirect authenticated users to dashboard
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img 
                src={schoolLogo} 
                alt="Kenya CBC School System" 
                className="w-10 h-10 object-contain rounded-lg shadow-soft"
              />
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                CBC School System
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => window.location.href = '/auth'}>
                Sign In
              </Button>
              <Button variant="hero" onClick={() => window.location.href = '/auth'}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="outline" className="w-fit">
                  🇰🇪 Made for Kenya CBC
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Modern School Management for the{' '}
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    Competency-Based Curriculum
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground">
                  Comprehensive school management system designed specifically for Kenyan schools implementing CBC. 
                  Manage students, teachers, academics, and finances all in one place.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="text-lg px-8 py-6"
                  onClick={() => window.location.href = '/auth'}
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-6"
                >
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-sm font-medium">CBC Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-success" />
                  <span className="text-sm font-medium">Secure & Reliable</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-success" />
                  <span className="text-sm font-medium">Cloud-Based</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-3xl transform rotate-3 opacity-20"></div>
              <img 
                src={schoolLogo} 
                alt="Kenya CBC School System" 
                className="relative w-full max-w-md mx-auto rounded-3xl shadow-strong"
              />
              <div className="absolute -top-4 -right-4 bg-accent rounded-full p-3 shadow-medium">
                <Star className="h-6 w-6 text-accent-foreground" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-warning rounded-full p-3 shadow-medium">
                <Heart className="h-6 w-6 text-warning-foreground" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Everything You Need for School Management
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From student enrollment to academic reporting, our comprehensive platform 
              covers all aspects of modern school administration.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "User Management",
                description: "Manage students, teachers, and administrative staff with role-based access control.",
                color: "text-primary"
              },
              {
                icon: BookOpen,
                title: "Academic Management",
                description: "Handle subjects, classes, assignments, and CBC-compliant curriculum tracking.",
                color: "text-success"
              },
              {
                icon: Calendar,
                title: "School Calendar",
                description: "Organize events, exams, holidays, and important school activities seamlessly.",
                color: "text-info"
              },
              {
                icon: Award,
                title: "Assessment & Grading",
                description: "Track student performance, generate reports, and monitor CBC learning outcomes.",
                color: "text-warning"
              },
              {
                icon: BarChart3,
                title: "Analytics & Reports",
                description: "Comprehensive insights into school performance with detailed analytics and reporting.",
                color: "text-accent"
              },
              {
                icon: GraduationCap,
                title: "Student Portal",
                description: "Students can access their results, timetables, assignments, and school announcements.",
                color: "text-primary"
              }
            ].map((feature, index) => (
              <Card key={index} className="border-0 shadow-medium hover:shadow-strong transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-background to-secondary flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Designed for Every Role in Your School
            </h2>
            <p className="text-xl text-muted-foreground">
              Tailored dashboards and features for administrators, teachers, and students.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                role: "Administrator",
                description: "Complete school oversight with user management, analytics, and system configuration.",
                badge: "Full Access"
              },
              {
                role: "Sub-Administrator",
                description: "Academic oversight with student registration and performance tracking capabilities.",
                badge: "Academic Focus"
              },
              {
                role: "Teachers",
                description: "Class management, attendance tracking, assignment grading, and student progress monitoring.",
                badge: "Classroom Tools"
              },
              {
                role: "Students",
                description: "Access to results, timetables, assignments, and communication with teachers.",
                badge: "Student Portal"
              }
            ].map((role, index) => (
              <Card key={index} className="text-center hover:shadow-medium transition-shadow">
                <CardHeader>
                  <Badge variant="outline" className="w-fit mx-auto mb-2">
                    {role.badge}
                  </Badge>
                  <CardTitle>{role.role}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{role.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground">
              Ready to Transform Your School Management?
            </h2>
            <p className="text-xl text-primary-foreground/80">
              Join schools across Kenya in implementing modern, efficient CBC-compliant management systems.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary" 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => window.location.href = '/auth'}
              >
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <img 
                src={schoolLogo} 
                alt="Kenya CBC School System" 
                className="w-8 h-8 object-contain rounded"
              />
              <span className="text-lg font-semibold">Kenya CBC School System</span>
            </div>
            <p className="text-muted-foreground">
              © 2024 Kenya CBC School System. Built for modern education.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
