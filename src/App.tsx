import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AuthPage from "./components/auth/AuthPage";
import NotFound from "./pages/NotFound";
import Students from "./pages/Students";
import Classes from "./pages/Classes";
import Subjects from "./pages/Subjects";
import Calendar from "./pages/Calendar";
import Assignments from "./pages/Assignments";
import Exams from "./pages/Exams";
import Attendance from "./pages/Attendance";
import Timetable from "./pages/Timetable";
import Finance from "./pages/Finance";
import Announcements from "./pages/Announcements";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/timetable" element={<Timetable />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
