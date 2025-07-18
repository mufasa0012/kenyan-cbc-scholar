import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Plus } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('grade_level', { ascending: true });

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch subjects",
      });
    } finally {
      setLoading(false);
    }
  };

  const groupedSubjects = subjects.reduce((acc, subject) => {
    const grade = subject.grade_level;
    if (!acc[grade]) acc[grade] = [];
    acc[grade].push(subject);
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Subjects</h1>
            <p className="text-muted-foreground">Manage CBC curriculum subjects and learning areas</p>
          </div>
          <Button variant="hero">
            <Plus className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subjects.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {Object.keys(groupedSubjects).sort().map((grade) => (
            <Card key={grade}>
              <CardHeader>
                <CardTitle>Grade {grade} Subjects</CardTitle>
                <CardDescription>
                  CBC curriculum subjects for Grade {grade}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {groupedSubjects[grade].map((subject) => (
                    <Card key={subject.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{subject.name}</CardTitle>
                        <CardDescription>
                          Code: {subject.code}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          {subject.learning_area && (
                            <div>
                              <span className="font-medium">Learning Area:</span> {subject.learning_area}
                            </div>
                          )}
                          {subject.cbc_strand && (
                            <div>
                              <span className="font-medium">CBC Strand:</span> {subject.cbc_strand}
                            </div>
                          )}
                        </div>
                        <Button variant="outline" size="sm" className="mt-4">
                          Edit Subject
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          {Object.keys(groupedSubjects).length === 0 && !loading && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No subjects found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Subjects;