import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileText, Plus } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          subjects (name),
          classes (name, grade_level),
          profiles:teacher_id (full_name)
        `)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch assignments",
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

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Assignments</h1>
            <p className="text-muted-foreground">Manage student assignments and submissions</p>
          </div>
          <Button variant="hero">
            <Plus className="mr-2 h-4 w-4" />
            Create Assignment
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignments.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Assignment List</CardTitle>
            <CardDescription>
              View and manage all assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading assignments...</p>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <Card key={assignment.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{assignment.title}</CardTitle>
                          <CardDescription>
                            {assignment.subjects?.name} • {assignment.classes?.name} (Grade {assignment.classes?.grade_level})
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${isOverdue(assignment.due_date) ? 'text-destructive' : 'text-muted-foreground'}`}>
                            Due: {formatDate(assignment.due_date)}
                          </p>
                          {isOverdue(assignment.due_date) && (
                            <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded">
                              Overdue
                            </span>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {assignment.description && (
                          <p className="text-sm">{assignment.description}</p>
                        )}
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">
                            Teacher: {assignment.profiles?.full_name}
                          </div>
                          {assignment.total_marks && (
                            <div className="text-sm text-muted-foreground">
                              Total Marks: {assignment.total_marks}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          View Submissions
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {assignments.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No assignments found
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

export default Assignments;