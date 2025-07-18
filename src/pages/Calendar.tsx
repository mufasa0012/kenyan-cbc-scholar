import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, Plus } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch calendar events",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const upcomingEvents = events.filter(event => 
    new Date(event.event_date) >= new Date()
  ).slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">School Calendar</h1>
            <p className="text-muted-foreground">Manage school events, holidays, and important dates</p>
          </div>
          <Button variant="hero">
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>
                Next 5 scheduled events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading events...</p>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(event.event_date)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Type: {event.event_type}
                        </p>
                        {event.description && (
                          <p className="text-sm mt-2">{event.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {upcomingEvents.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No upcoming events
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Events</CardTitle>
              <CardDescription>
                Complete list of calendar events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading events...</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {events.map((event) => (
                    <div key={event.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.event_date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs bg-secondary px-2 py-1 rounded">
                        {event.event_type}
                      </span>
                    </div>
                  ))}
                  {events.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No events found
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Calendar;