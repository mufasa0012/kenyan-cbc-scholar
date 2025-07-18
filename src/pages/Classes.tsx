import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { School, Plus, Users } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          profiles:class_teacher_id (
            full_name
          )
        `);

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch classes",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Classes</h1>
            <p className="text-muted-foreground">Manage school classes and grade levels</p>
          </div>
          <Button variant="hero">
            <Plus className="mr-2 h-4 w-4" />
            Add Class
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <School className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classes.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Class List</CardTitle>
            <CardDescription>
              View and manage all school classes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading classes...</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {classes.map((classItem) => (
                  <Card key={classItem.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{classItem.name}</CardTitle>
                      <CardDescription>
                        Grade {classItem.grade_level} • {classItem.academic_year}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Users className="mr-2 h-4 w-4" />
                          Capacity: {classItem.capacity}
                        </div>
                        {classItem.profiles && (
                          <div className="text-sm text-muted-foreground">
                            Class Teacher: {classItem.profiles.full_name}
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm" className="mt-4">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {classes.length === 0 && (
                  <p className="col-span-full text-center text-muted-foreground py-8">
                    No classes found
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

export default Classes;