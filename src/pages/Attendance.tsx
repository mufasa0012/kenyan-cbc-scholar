import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { UserCheck, Plus } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const Attendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          students (
            student_number,
            profiles:profile_id (full_name)
          ),
          classes (name, grade_level),
          profiles:marked_by (full_name)
        `)
        .order('date', { ascending: false })
        .limit(50);

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
    const presentPercentage = total > 0 ? Math.round((present / total) * 100) : 0;
    
    return { total, present, absent, presentPercentage };
  };

  const stats = getAttendanceStats();
  const todaysAttendance = getTodaysAttendance();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Attendance</h1>
            <p className="text-muted-foreground">Track and manage student attendance</p>
          </div>
          <Button variant="hero">
            <Plus className="mr-2 h-4 w-4" />
            Mark Attendance
          </Button>
        </div>

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
              <div className="h-4 w-4 bg-blue-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.presentPercentage}%</div>
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
                      <span className={`text-xs px-2 py-1 rounded ${
                        record.is_present 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {record.is_present ? 'Present' : 'Absent'}
                      </span>
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
                Latest attendance records
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
                          {formatDate(record.date)} • {record.classes?.name}
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