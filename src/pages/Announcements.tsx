import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Megaphone, Plus, AlertTriangle } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          profiles:created_by (full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch announcements",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const activeAnnouncements = announcements.filter(a => !isExpired(a.expires_at));
  const expiredAnnouncements = announcements.filter(a => isExpired(a.expires_at));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Announcements</h1>
            <p className="text-muted-foreground">Manage school-wide announcements and notices</p>
          </div>
          <Button variant="hero">
            <Plus className="mr-2 h-4 w-4" />
            Create Announcement
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Announcements</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{announcements.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <div className="h-4 w-4 bg-green-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeAnnouncements.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {announcements.filter(a => a.is_urgent).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {activeAnnouncements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Active Announcements</CardTitle>
                <CardDescription>
                  Current announcements visible to users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeAnnouncements.map((announcement) => (
                    <Card key={announcement.id} className={announcement.is_urgent ? 'border-red-200 bg-red-50' : ''}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {announcement.title}
                              {announcement.is_urgent && (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              )}
                            </CardTitle>
                            <CardDescription>
                              By {announcement.profiles?.full_name} • {formatDate(announcement.created_at)}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            {announcement.is_urgent && (
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                Urgent
                              </span>
                            )}
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Active
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-4">{announcement.content}</p>
                        <div className="space-y-2 text-xs text-muted-foreground">
                          {announcement.target_roles && announcement.target_roles.length > 0 && (
                            <div>
                              <span className="font-medium">Target Roles:</span> {announcement.target_roles.join(', ')}
                            </div>
                          )}
                          {announcement.target_classes && announcement.target_classes.length > 0 && (
                            <div>
                              <span className="font-medium">Target Classes:</span> {announcement.target_classes.join(', ')}
                            </div>
                          )}
                          {announcement.expires_at && (
                            <div>
                              <span className="font-medium">Expires:</span> {formatDate(announcement.expires_at)}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {expiredAnnouncements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Expired Announcements</CardTitle>
                <CardDescription>
                  Past announcements that are no longer active
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expiredAnnouncements.slice(0, 5).map((announcement) => (
                    <Card key={announcement.id} className="opacity-60">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{announcement.title}</CardTitle>
                            <CardDescription>
                              By {announcement.profiles?.full_name} • {formatDate(announcement.created_at)}
                            </CardDescription>
                          </div>
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            Expired
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{announcement.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {announcements.length === 0 && !loading && (
            <Card>
              <CardContent className="text-center py-12">
                <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No announcements yet</h3>
                <p className="text-muted-foreground">Create your first announcement to get started.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Announcements;