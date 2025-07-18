import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Users, UserPlus, Search } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          profiles:profile_id (
            full_name,
            email
          ),
          classes (
            name,
            grade_level
          )
        `);

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch students",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Students</h1>
            <p className="text-muted-foreground">Manage student information and records</p>
          </div>
          <Button variant="hero">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Student List</CardTitle>
            <CardDescription>
              View and manage all enrolled students
            </CardDescription>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading students...</p>
            ) : (
              <div className="space-y-4">
                {filteredStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{student.profiles?.full_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Student #: {student.student_number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Class: {student.classes?.name} (Grade {student.classes?.grade_level})
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
                {filteredStudents.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No students found
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

export default Students;