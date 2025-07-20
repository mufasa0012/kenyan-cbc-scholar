import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Clock, Filter, Edit, Eye, Calendar, BookOpen } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const Timetable = () => {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [classFilter, setClassFilter] = useState('');
  const [streamFilter, setStreamFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [availableClasses, setAvailableClasses] = useState([]);
  const { toast } = useToast();

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    fetchUserProfile();
    fetchAvailableClasses();
  }, []);

  useEffect(() => {
    if (userProfile) {
      fetchTimetables();
    }
  }, [userProfile, classFilter, streamFilter, gradeFilter]);

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

  const fetchTimetables = async () => {
    try {
      let query = supabase
        .from('timetables')
        .select(`
          *,
          classes (
            id,
            name,
            grade_level,
            stream
          ),
          subjects (
            id,
            name,
            code
          ),
          profiles:teacher_id (
            full_name
          )
        `)
        .order('day_of_week')
        .order('start_time');

      // Apply role-based filtering
      if (userRole === 'class_teacher' && userProfile) {
        // Class teachers see their classes and subjects they teach
        const { data: teacherClasses } = await supabase
          .from('classes')
          .select('id')
          .eq('class_teacher_id', userProfile.id);
        
        const { data: teacherSubjects } = await supabase
          .from('teacher_subjects')
          .select('class_id')
          .eq('teacher_id', userProfile.id);

        const classIds = [
          ...(teacherClasses || []).map(c => c.id),
          ...(teacherSubjects || []).map(s => s.class_id)
        ];

        if (classIds.length > 0) {
          query = query.in('class_id', classIds);
        }
      } else if (userRole === 'student' && userProfile) {
        // Students see only their class timetable
        const { data: student } = await supabase
          .from('students')
          .select('class_id')
          .eq('profile_id', userProfile.id)
          .single();

        if (student?.class_id) {
          query = query.eq('class_id', student.class_id);
        }
      }

      // Apply filters
      if (classFilter) {
        query = query.eq('class_id', classFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Apply stream and grade filters client-side
      let filteredData = data || [];
      if (streamFilter) {
        filteredData = filteredData.filter(t => t.classes?.stream === streamFilter);
      }
      if (gradeFilter) {
        filteredData = filteredData.filter(t => t.classes?.grade_level.toString() === gradeFilter);
      }

      setTimetables(filteredData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch timetables",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTimetableByDay = (day) => {
    const dayNumber = daysOfWeek.indexOf(day) + 1;
    return timetables.filter(t => t.day_of_week === dayNumber);
  };

  const getUniqueStreams = () => {
    const streams = [...new Set(availableClasses.map(c => c.stream).filter(Boolean))];
    return streams;
  };

  const getUniqueGrades = () => {
    const grades = [...new Set(availableClasses.map(c => c.grade_level))];
    return grades.sort((a, b) => a - b);
  };

  const canEditTimetable = ['admin', 'sub_admin'].includes(userRole);
  const isViewOnly = ['class_teacher', 'common_teacher', 'intern_teacher', 'student'].includes(userRole);

  const filteredClasses = availableClasses.filter(cls => {
    if (userRole === 'class_teacher' && userProfile) {
      return cls.class_teacher_id === userProfile.id;
    }
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Timetable</h1>
            <p className="text-muted-foreground">
              {canEditTimetable ? 'Manage class schedules and timetables' : 'View class schedules and timetables'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canEditTimetable && <Badge variant="default"><Edit className="w-3 h-3 mr-1" />Can Edit</Badge>}
            {isViewOnly && <Badge variant="outline"><Eye className="w-3 h-3 mr-1" />View Only</Badge>}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <Select value={gradeFilter} onValueChange={setGradeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Grades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Grades</SelectItem>
              {getUniqueGrades().map(grade => (
                <SelectItem key={grade} value={grade.toString()}>Grade {grade}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={streamFilter} onValueChange={setStreamFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Streams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Streams</SelectItem>
              {getUniqueStreams().map(stream => (
                <SelectItem key={stream} value={stream}>{stream}</SelectItem>
              ))}
            </SelectContent>
          </Select>

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

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {[...new Set(timetables.map(t => t.class_id))].length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {[...new Set(timetables.map(t => t.subject_id))].length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Lessons</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{timetables.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Timetable */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Timetable</CardTitle>
            <CardDescription>
              {isViewOnly && 'View-only schedule for the week'}
              {canEditTimetable && 'Manage the weekly class schedule'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading timetable...</p>
            ) : (
              <div className="space-y-6">
                {daysOfWeek.map((day) => {
                  const dayTimetables = getTimetableByDay(day);
                  return (
                    <div key={day} className="space-y-2">
                      <h3 className="text-lg font-semibold border-b pb-2">{day}</h3>
                      {dayTimetables.length === 0 ? (
                        <p className="text-muted-foreground text-sm py-4">No classes scheduled</p>
                      ) : (
                        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                          {dayTimetables.map((timetable) => (
                            <Card key={timetable.id} className="border border-border/50">
                              <CardContent className="p-4">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-sm">
                                      {formatTime(timetable.start_time)} - {formatTime(timetable.end_time)}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {timetable.room_number || 'TBA'}
                                    </Badge>
                                  </div>
                                  
                                  <div>
                                    <p className="font-semibold">{timetable.subjects?.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {timetable.subjects?.code}
                                    </p>
                                  </div>
                                  
                                  <div className="text-xs space-y-1">
                                    <p>
                                      <span className="font-medium">Class:</span> {timetable.classes?.name}
                                    </p>
                                    <p>
                                      <span className="font-medium">Grade:</span> {timetable.classes?.grade_level} 
                                      {timetable.classes?.stream && ` - ${timetable.classes?.stream}`}
                                    </p>
                                    <p>
                                      <span className="font-medium">Teacher:</span> {timetable.profiles?.full_name || 'TBA'}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {timetables.length === 0 && (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No timetable entries found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {canEditTimetable ? 'Create the first timetable entry to get started' : 'No schedule available for the selected filters'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Timetable;