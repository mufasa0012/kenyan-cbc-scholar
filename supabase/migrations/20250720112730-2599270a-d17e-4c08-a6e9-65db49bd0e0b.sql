-- Add stream support to classes table
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS stream text;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_classes_grade_stream ON public.classes(grade_level, stream);

-- Update RLS policies for attendance table
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Policy for class teachers to manage attendance
CREATE POLICY "Class teachers can manage attendance for their classes" 
ON public.attendance 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.classes c
    JOIN public.profiles p ON p.id = c.class_teacher_id
    WHERE c.id = attendance.class_id AND p.user_id = auth.uid()
  )
);

-- Policy for admin/sub-admin to view all attendance (read-only)
CREATE POLICY "Admin/Sub-admin can view all attendance" 
ON public.attendance 
FOR SELECT 
USING (is_admin_or_sub_admin(auth.uid()));

-- Policy for students to view their own attendance
CREATE POLICY "Students can view their own attendance" 
ON public.attendance 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.students s
    JOIN public.profiles p ON p.id = s.profile_id
    WHERE s.id = attendance.student_id AND p.user_id = auth.uid()
  )
);

-- Enable RLS on assignments table
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Policy for teachers to manage assignments for their subjects/classes
CREATE POLICY "Teachers can manage their assignments" 
ON public.assignments 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.id = assignments.teacher_id
  )
);

-- Policy for admin/sub-admin to view assignments (read-only)
CREATE POLICY "Admin/Sub-admin can view assignments" 
ON public.assignments 
FOR SELECT 
USING (is_admin_or_sub_admin(auth.uid()));

-- Policy for students to view assignments for their classes
CREATE POLICY "Students can view their class assignments" 
ON public.assignments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.students s
    JOIN public.profiles p ON p.id = s.profile_id
    WHERE s.class_id = assignments.class_id AND p.user_id = auth.uid()
  )
);

-- Enable RLS on timetables table
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;

-- Policy for admin/sub-admin to manage timetables
CREATE POLICY "Admin/Sub-admin can manage timetables" 
ON public.timetables 
FOR ALL 
USING (is_admin_or_sub_admin(auth.uid()));

-- Policy for teachers to view timetables for their classes/subjects
CREATE POLICY "Teachers can view relevant timetables" 
ON public.timetables 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.id = timetables.teacher_id
  ) OR
  EXISTS (
    SELECT 1 FROM public.classes c
    JOIN public.profiles p ON p.id = c.class_teacher_id
    WHERE c.id = timetables.class_id AND p.user_id = auth.uid()
  )
);

-- Policy for students to view their class timetables
CREATE POLICY "Students can view their class timetables" 
ON public.timetables 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.students s
    JOIN public.profiles p ON p.id = s.profile_id
    WHERE s.class_id = timetables.class_id AND p.user_id = auth.uid()
  )
);

-- Enable RLS on exams table
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- Policy for admin/sub-admin to view exams (read-only)
CREATE POLICY "Admin/Sub-admin can view exams" 
ON public.exams 
FOR SELECT 
USING (is_admin_or_sub_admin(auth.uid()));

-- Policy for teachers to manage exams for their classes/subjects
CREATE POLICY "Teachers can manage their exams" 
ON public.exams 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.id = exams.created_by
  )
);

-- Policy for students to view their class exams
CREATE POLICY "Students can view their class exams" 
ON public.exams 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.students s
    JOIN public.profiles p ON p.id = s.profile_id
    WHERE s.class_id = exams.class_id AND p.user_id = auth.uid()
  )
);