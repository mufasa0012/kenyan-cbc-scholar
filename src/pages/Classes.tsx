import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { School, Plus, Users, Filter } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [streamFilter, setStreamFilter] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newClass, setNewClass] = useState({
    name: '',
    grade_level: '',
    stream: '',
    academic_year: new Date().getFullYear().toString(),
    capacity: 30,
    class_teacher_id: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      setUserRole(data?.role || '');
    }
  };

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

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('role', ['class_teacher', 'common_teacher']);

      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleAddClass = async () => {
    try {
      const classData = {
        ...newClass,
        grade_level: parseInt(newClass.grade_level)
      };
      
      const { error } = await supabase
        .from('classes')
        .insert([classData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Class added successfully",
      });

      setShowAddDialog(false);
      setNewClass({
        name: '',
        grade_level: '',
        stream: '',
        academic_year: new Date().getFullYear().toString(),
        capacity: 30,
        class_teacher_id: ''
      });
      fetchClasses();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add class",
      });
    }
  };

  const filteredClasses = classes.filter(classItem => {
    const gradeMatch = !gradeFilter || classItem.grade_level.toString() === gradeFilter;
    const streamMatch = !streamFilter || classItem.stream === streamFilter;
    return gradeMatch && streamMatch;
  });

  const canManageClasses = ['admin', 'sub_admin'].includes(userRole);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Classes</h1>
            <p className="text-muted-foreground">Manage school classes and grade levels with streams</p>
          </div>
          {canManageClasses && (
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button variant="hero">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Class
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Class</DialogTitle>
                  <DialogDescription>Create a new class with grade and stream information</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input
                      id="name"
                      value={newClass.name}
                      onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                      className="col-span-3"
                      placeholder="e.g. Grade 1 Red"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="grade" className="text-right">Grade</Label>
                    <Select value={newClass.grade_level} onValueChange={(value) => setNewClass({...newClass, grade_level: value})}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9].map(grade => (
                          <SelectItem key={grade} value={grade.toString()}>Grade {grade}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="stream" className="text-right">Stream</Label>
                    <Select value={newClass.stream} onValueChange={(value) => setNewClass({...newClass, stream: value})}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select stream" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Red">Red</SelectItem>
                        <SelectItem value="Yellow">Yellow</SelectItem>
                        <SelectItem value="Blue">Blue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="teacher" className="text-right">Class Teacher</Label>
                    <Select value={newClass.class_teacher_id} onValueChange={(value) => setNewClass({...newClass, class_teacher_id: value})}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select class teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map(teacher => (
                          <SelectItem key={teacher.id} value={teacher.id}>{teacher.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddClass}>Add Class</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
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
              {[1,2,3,4,5,6,7,8,9].map(grade => (
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
              <SelectItem value="Red">Red</SelectItem>
              <SelectItem value="Yellow">Yellow</SelectItem>
              <SelectItem value="Blue">Blue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <School className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredClasses.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Teachers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teachers.length}</div>
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
                {filteredClasses.map((classItem) => (
                  <Card key={classItem.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{classItem.name}</CardTitle>
                      <CardDescription>
                        Grade {classItem.grade_level} • Stream {classItem.stream} • {classItem.academic_year}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Users className="mr-2 h-4 w-4" />
                          Capacity: {classItem.capacity}
                        </div>
                        {classItem.stream && (
                          <div className="text-sm">
                            <span className="font-medium">Stream:</span> {classItem.stream}
                          </div>
                        )}
                        {classItem.profiles && (
                          <div className="text-sm text-muted-foreground">
                            Class Teacher: {classItem.profiles.full_name}
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm" className="mt-4" onClick={() => window.location.href = `/class/${classItem.id}`}>
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {filteredClasses.length === 0 && (
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