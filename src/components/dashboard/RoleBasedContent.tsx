import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Award, 
  Clock,
  TrendingUp,
  School,
  DollarSign,
  Bell,
  Settings,
  ChevronRight
} from 'lucide-react';

interface RoleBasedContentProps {
  role: string;
  userStats?: any;
}

const RoleBasedContent: React.FC<RoleBasedContentProps> = ({ role, userStats }) => {
  const getAdminContent = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="text-lg">User Management</span>
            <Users className="h-5 w-5 text-primary" />
          </CardTitle>
          <CardDescription>
            Manage all system users and roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Quick actions:</p>
            <div className="space-y-1">
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => window.location.href = '/students'}>
                <Users className="mr-2 h-4 w-4" />
                Manage Students
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <BookOpen className="mr-2 h-4 w-4" />
                Teacher Assignments
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="text-lg">School Analytics</span>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardTitle>
          <CardDescription>
            Performance and financial reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" className="w-full" onClick={() => window.location.href = '/reports'}>
            View Full Reports
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="text-lg">System Settings</span>
            <Settings className="h-5 w-5 text-primary" />
          </CardTitle>
          <CardDescription>
            Configure school system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" className="w-full" onClick={() => window.location.href = '/settings'}>
            Open Settings
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const getTeacherContent = () => (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <School className="h-5 w-5" />
            <span>My Classes</span>
          </CardTitle>
          <CardDescription>
            Classes you are responsible for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-between" onClick={() => window.location.href = '/classes'}>
              View All Classes
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => window.location.href = '/attendance'}>
              <Clock className="mr-2 h-4 w-4" />
              Mark Attendance
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Assessments</span>
          </CardTitle>
          <CardDescription>
            Manage student assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-between" onClick={() => window.location.href = '/assignments'}>
              View Assignments
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => window.location.href = '/exams'}>
              <BookOpen className="mr-2 h-4 w-4" />
              Manage Exams
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const getStudentContent = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>My Subjects</span>
          </CardTitle>
          <CardDescription>
            CBC curriculum subjects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" className="w-full" onClick={() => window.location.href = '/subjects'}>
            View Subjects
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Assignments</span>
          </CardTitle>
          <CardDescription>
            Pending and completed work
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" className="w-full" onClick={() => window.location.href = '/assignments'}>
            View Assignments
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>My Results</span>
          </CardTitle>
          <CardDescription>
            Academic performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" className="w-full" onClick={() => window.location.href = '/exams'}>
            View Results
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {role === 'admin' && getAdminContent()}
      {role === 'sub_admin' && getAdminContent()}
      {(role === 'class_teacher' || role === 'common_teacher' || role === 'intern_teacher') && getTeacherContent()}
      {role === 'student' && getStudentContent()}
    </div>
  );
};

export default RoleBasedContent;