import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, BarChart3, PieChart } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const reportTypes = [
    {
      id: 'student-performance',
      title: 'Student Performance Report',
      description: 'Academic performance across all subjects and classes',
      icon: BarChart3,
      type: 'academic'
    },
    {
      id: 'attendance-summary',
      title: 'Attendance Summary',
      description: 'Student attendance rates by class and period',
      icon: FileText,
      type: 'attendance'
    },
    {
      id: 'financial-overview',
      title: 'Financial Overview',
      description: 'School fees, payments, and financial transactions',
      icon: PieChart,
      type: 'financial'
    },
    {
      id: 'exam-results',
      title: 'Examination Results',
      description: 'Comprehensive exam results and analysis',
      icon: BarChart3,
      type: 'academic'
    },
    {
      id: 'teacher-workload',
      title: 'Teacher Workload Report',
      description: 'Teaching assignments and class distributions',
      icon: FileText,
      type: 'staff'
    },
    {
      id: 'enrollment-statistics',
      title: 'Enrollment Statistics',
      description: 'Student enrollment trends and demographics',
      icon: PieChart,
      type: 'administrative'
    }
  ];

  const handleGenerateReport = async (reportId) => {
    setLoading(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Report Generated",
        description: "Your report has been generated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate report",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'academic': return 'bg-blue-100 text-blue-800';
      case 'attendance': return 'bg-green-100 text-green-800';
      case 'financial': return 'bg-yellow-100 text-yellow-800';
      case 'staff': return 'bg-purple-100 text-purple-800';
      case 'administrative': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">Generate and download comprehensive school reports</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportTypes.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Report Generator</CardTitle>
            <CardDescription>
              Select a report type to generate comprehensive data analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reportTypes.map((report) => {
                const IconComponent = report.icon;
                return (
                  <Card key={report.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <IconComponent className="h-8 w-8 text-primary mb-2" />
                        <span className={`text-xs px-2 py-1 rounded capitalize ${getTypeColor(report.type)}`}>
                          {report.type}
                        </span>
                      </div>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {report.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleGenerateReport(report.id)}
                          disabled={loading}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Generate
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateReport(report.id)}
                          disabled={loading}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>
              Key performance indicators at a glance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">98.5%</div>
                <div className="text-sm text-muted-foreground">Overall Attendance</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">87.2%</div>
                <div className="text-sm text-muted-foreground">Average Performance</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">KES 2.1M</div>
                <div className="text-sm text-muted-foreground">Total Collections</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">450</div>
                <div className="text-sm text-muted-foreground">Total Students</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Reports;