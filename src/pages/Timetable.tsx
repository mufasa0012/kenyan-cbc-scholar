import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Clock, Plus } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const Timetable = () => {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTimetables();
  }, []);

  const fetchTimetables = async () => {
    try {
      const { data, error } = await supabase
        .from('timetables')
        .select(`
          *,
          subjects (name, code),
          classes (name, grade_level),
          profiles:teacher_id (full_name)
        `)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      setTimetables(data || []);
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

  const getDayName = (dayNumber) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber];
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const groupedTimetables = timetables.reduce((acc, timetable) => {
    const day = getDayName(timetable.day_of_week);
    if (!acc[day]) acc[day] = [];
    acc[day].push(timetable);
    return acc;
  }, {});

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Timetable</h1>
            <p className="text-muted-foreground">Manage class schedules and periods</p>
          </div>
          <Button variant="hero">
            <Plus className="mr-2 h-4 w-4" />
            Add Period
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Periods</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{timetables.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6">
          {weekDays.map((day) => (
            <Card key={day}>
              <CardHeader>
                <CardTitle>{day}</CardTitle>
                <CardDescription>
                  Class schedule for {day}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading timetable...</p>
                ) : groupedTimetables[day] && groupedTimetables[day].length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {groupedTimetables[day].map((period) => (
                      <Card key={period.id}>
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">
                                {period.subjects?.name}
                              </CardTitle>
                              <CardDescription>
                                {period.classes?.name} (Grade {period.classes?.grade_level})
                              </CardDescription>
                            </div>
                            <span className="text-xs bg-secondary px-2 py-1 rounded">
                              {period.subjects?.code}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="font-medium">Time:</span>
                              <span>
                                {formatTime(period.start_time)} - {formatTime(period.end_time)}
                              </span>
                            </div>
                            {period.room_number && (
                              <div className="flex justify-between">
                                <span className="font-medium">Room:</span>
                                <span>{period.room_number}</span>
                              </div>
                            )}
                            {period.profiles && (
                              <div className="flex justify-between">
                                <span className="font-medium">Teacher:</span>
                                <span>{period.profiles.full_name}</span>
                              </div>
                            )}
                          </div>
                          <Button variant="outline" size="sm" className="mt-3 w-full">
                            Edit Period
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No periods scheduled for {day}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Timetable;