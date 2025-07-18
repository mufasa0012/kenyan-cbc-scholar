import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, Plus } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select(`
          *,
          subjects (name),
          classes (name, grade_level),
          profiles:created_by (full_name)
        `)
        .order('exam_date', { ascending: false });

      if (error) throw error;
      setExams(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch exams",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getExamStatus = (examDate) => {
    const today = new Date();
    const exam = new Date(examDate);
    
    if (exam < today) return 'completed';
    if (exam.toDateString() === today.toDateString()) return 'today';
    return 'upcoming';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-secondary text-secondary-foreground';
      case 'today': return 'bg-primary text-primary-foreground';
      case 'upcoming': return 'bg-accent text-accent-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Examinations</h1>
            <p className="text-muted-foreground">Manage school exams and assessments</p>
          </div>
          <Button variant="hero">
            <Plus className="mr-2 h-4 w-4" />
            Schedule Exam
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{exams.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Exam Schedule</CardTitle>
            <CardDescription>
              View and manage all scheduled examinations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading exams...</p>
            ) : (
              <div className="space-y-4">
                {exams.map((exam) => {
                  const status = getExamStatus(exam.exam_date);
                  return (
                    <Card key={exam.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{exam.name}</CardTitle>
                            <CardDescription>
                              {exam.subjects?.name} • {exam.classes?.name} (Grade {exam.classes?.grade_level})
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {formatDate(exam.exam_date)}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded capitalize ${getStatusColor(status)}`}>
                              {status}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Total Marks:</span>
                            <p>{exam.total_marks}</p>
                          </div>
                          {exam.duration_minutes && (
                            <div>
                              <span className="font-medium">Duration:</span>
                              <p>{exam.duration_minutes} minutes</p>
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Created by:</span>
                            <p>{exam.profiles?.full_name}</p>
                          </div>
                          <div>
                            <span className="font-medium">Status:</span>
                            <p className="capitalize">{status}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            View Results
                          </Button>
                          {status === 'upcoming' && (
                            <Button variant="outline" size="sm">
                              Edit Exam
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {exams.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No exams scheduled
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Exams;