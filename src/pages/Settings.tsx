import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, Save, User, Shield, Bell, School } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const Settings = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [notifications, setNotifications] = useState({
    email_announcements: true,
    email_assignments: true,
    email_exams: true,
    push_notifications: true,
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (profile) {
          setProfile(profile);
          setFormData({
            full_name: profile.full_name || '',
            email: profile.email || '',
            phone: profile.phone || '',
            address: profile.address || '',
          });
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load user data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      
      fetchUserData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (setting, value) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p>Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={formData.email}
                  disabled
                  placeholder="Email cannot be changed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter your address"
                />
              </div>
              <Button 
                onClick={handleSaveProfile} 
                disabled={saving}
                className="w-full"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email_announcements">Email Announcements</Label>
                  <p className="text-sm text-muted-foreground">Get notified about school announcements</p>
                </div>
                <Switch
                  id="email_announcements"
                  checked={notifications.email_announcements}
                  onCheckedChange={(value) => handleNotificationChange('email_announcements', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email_assignments">Assignment Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified about new assignments</p>
                </div>
                <Switch
                  id="email_assignments"
                  checked={notifications.email_assignments}
                  onCheckedChange={(value) => handleNotificationChange('email_assignments', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email_exams">Exam Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified about upcoming exams</p>
                </div>
                <Switch
                  id="email_exams"
                  checked={notifications.email_exams}
                  onCheckedChange={(value) => handleNotificationChange('email_exams', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push_notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Enable browser push notifications</p>
                </div>
                <Switch
                  id="push_notifications"
                  checked={notifications.push_notifications}
                  onCheckedChange={(value) => handleNotificationChange('push_notifications', value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Security
              </CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Role</Label>
                <div className="p-2 bg-secondary rounded text-sm">
                  {profile?.role || 'Not assigned'}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Account Status</Label>
                <div className={`p-2 rounded text-sm ${
                  profile?.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {profile?.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Change Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                School Information
              </CardTitle>
              <CardDescription>
                View school system information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>School System</Label>
                <div className="p-2 bg-secondary rounded text-sm">
                  Kenya CBC School Management System
                </div>
              </div>
              <div className="space-y-2">
                <Label>Version</Label>
                <div className="p-2 bg-secondary rounded text-sm">
                  v1.0.0
                </div>
              </div>
              <div className="space-y-2">
                <Label>Last Updated</Label>
                <div className="p-2 bg-secondary rounded text-sm">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;