import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { UserCheck, Users, Calendar, TrendingUp, Edit, Eye, Filter } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const Attendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [classFilter, setClassFilter] = useState('');
  const [availableClasses, setAvailableClasses] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserProfile();
    fetchAvailableClasses();
  }, []);

  useEffect(() => {
    if (userProfile) {
      fetchAttendance();
    }
  }, [userProfile, classFilter]);

  const fetchUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setUserProfile(data);
        setUserRole(data.role);
      }
    }
  };

  const fetchAvailableClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, grade_level, stream, class_teacher_id')
        .order('grade_level');

      if (error) throw error;
      setAvailableClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      let query = supabase
        .from('attendance')
        .select(`
          *,
          students (
            student_number,
            profiles:profile_id (
              full_name
            )
          ),
          classes (
            name,
            grade_level,
            stream
          )
        `)
        .order('date', { ascending: false });

      // Apply role-based filtering
      if (userRole === 'class_teacher' && userProfile) {
        // Class teachers only see their classes
        const { data: teacherClasses } = await supabase
          .from('classes')
          .select('id')
          .eq('class_teacher_id', userProfile.id);
        
        if (teacherClasses && teacherClasses.length > 0) {
          const classIds = teacherClasses.map(c => c.id);
          query = query.in('class_id', classIds);
        }
      }

      // Apply class filter
      if (classFilter) {
        query = query.eq('class_id', classFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAttendanceRecords(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch attendance records",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (studentId: string, classId: string, isPresent: boolean) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('attendance')
        .upsert({
          student_id: studentId,
          class_id: classId,
          date: today,
          is_present: isPresent,
          marked_by: userProfile?.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Attendance marked successfully",
      });

      fetchAttendance();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark attendance",
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTodaysAttendance = () => {
    const today = new Date().toISOString().split('T')[0];
    return attendanceRecords.filter(record => record.date === today);
  };

  const getAttendanceStats = () => {
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter(record => record.is_present).length;
    const absent = total - present;
    const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, attendanceRate };
  };

  const canEditAttendance = userRole === 'class_teacher';
  const canViewAllAttendance = ['admin', 'sub_admin'].includes(userRole);
  
  const filteredClasses = availableClasses.filter(cls => {
    if (userRole === 'class_teacher' && userProfile) {
      // Show only classes this teacher is responsible for
      return cls.class_teacher_id === userProfile.id;
    }
    return true;
  });

  const stats = getAttendanceStats();
  const todaysAttendance = getTodaysAttendance();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Attendance</h1>
            <p className="text-muted-foreground">
              {canEditAttendance ? 'Mark and manage student attendance' : 'View attendance records and reports'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canEditAttendance && <Badge variant="default"><Edit className="w-3 h-3 mr-1" />Can Edit</Badge>}
            {canViewAllAttendance && <Badge variant="outline"><Eye className="w-3 h-3 mr-1" />View Only</Badge>}
          </div>
        </div>

        {/* Class Filter */}
        {availableClasses.length > 0 && (
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filter by Class:</span>
            </div>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Classes</SelectItem>
                {filteredClasses.map(cls => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name} - Grade {cls.grade_level} {cls.stream}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present</CardTitle>
              <div className="h-4 w-4 bg-green-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.present}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absent</CardTitle>
              <div className="h-4 w-4 bg-red-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.absent}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Today's Attendance</CardTitle>
              <CardDescription>
                Attendance records for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todaysAttendance.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No attendance marked for today
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {todaysAttendance.map((record) => (
                    <div key={record.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">
                          {record.students?.profiles?.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {record.students?.student_number} • {record.classes?.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          record.is_present 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {record.is_present ? 'Present' : 'Absent'}
                        </span>
                        {canEditAttendance && (
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant={record.is_present ? "default" : "outline"}
                              onClick={() => handleMarkAttendance(record.student_id, record.class_id, true)}
                            >
                              P
                            </Button>
                            <Button 
                              size="sm" 
                              variant={!record.is_present ? "default" : "outline"}
                              onClick={() => handleMarkAttendance(record.student_id, record.class_id, false)}
                            >
                              A
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Attendance</CardTitle>
              <CardDescription>
                {canEditAttendance ? 'Latest attendance records for your classes' : 'View-only attendance reports'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading attendance...</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {attendanceRecords.slice(0, 20).map((record) => (
                    <div key={record.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">
                          {record.students?.profiles?.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(record.date)} • {record.classes?.name} - Grade {record.classes?.grade_level} {record.classes?.stream}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        record.is_present 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {record.is_present ? 'Present' : 'Absent'}
                      </span>
                    </div>
                  ))}
                  {attendanceRecords.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No attendance records found
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Attendance;