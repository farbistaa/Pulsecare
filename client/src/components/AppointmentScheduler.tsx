import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User,
  Check,
  X,
  Phone,
  MessageSquare,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, isAfter, isBefore, parseISO } from 'date-fns';

interface Appointment {
  id: number;
  donorId: number;
  seekerId: number;
  donorName?: string;
  seekerName?: string;
  appointmentDate: string;
  appointmentTime: string;
  location: string;
  hospitalName: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  createdAt: string;
}

interface AppointmentSchedulerProps {
  className?: string;
  donorId?: number;
  requestId?: number;
}

export default function AppointmentScheduler({ 
  className = '', 
  donorId,
  requestId 
}: AppointmentSchedulerProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    donorId: donorId || '',
    appointmentTime: '',
    location: '',
    hospitalName: '',
    notes: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments', {
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const createAppointment = async () => {
    if (!date || !formData.appointmentTime || !formData.location || !formData.hospitalName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          donorId: parseInt(formData.donorId as string),
          requestId,
          appointmentDate: format(date, 'yyyy-MM-dd')
        })
      });

      if (response.ok) {
        const newAppointment = await response.json();
        setAppointments(prev => [newAppointment, ...prev]);
        setShowForm(false);
        setFormData({
          donorId: donorId || '',
          appointmentTime: '',
          location: '',
          hospitalName: '',
          notes: ''
        });
        setDate(undefined);
        toast({
          title: "Appointment Scheduled",
          description: "The appointment has been created successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create appointment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: number, status: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId ? { ...apt, status: status as any } : apt
          )
        );
        toast({
          title: "Status Updated",
          description: `Appointment marked as ${status}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'no_show':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-3 w-3" />;
      case 'confirmed':
        return <Check className="h-3 w-3" />;
      case 'completed':
        return <Check className="h-3 w-3" />;
      case 'cancelled':
        return <X className="h-3 w-3" />;
      case 'no_show':
        return <X className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const formatStatus = (status?: string) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30'
  ];

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'PPP');
    } catch (error) {
      console.error('Error parsing date:', error);
      return 'Invalid date';
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const hospitalName = appointment.hospitalName || '';
    const location = appointment.location || '';
    const matchesSearch = hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {showForm ? "Cancel" : "Schedule Appointment"}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-primary/20 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Schedule New Appointment
                </CardTitle>
                <CardDescription>
                  Fill in the details below to schedule a new blood donation appointment
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="donorId" className="text-sm font-medium">Donor ID</Label>
                      <Input
                        id="donorId"
                        type="number"
                        placeholder="Enter donor ID"
                        value={formData.donorId}
                        onChange={(e) => setFormData(prev => ({ ...prev, donorId: e.target.value }))}
                        disabled={!!donorId}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Appointment Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal mt-1 ${
                              !date && "text-muted-foreground"
                            }`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            disabled={(date) =>
                              isBefore(date, new Date()) || isAfter(date, addDays(new Date(), 30))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label htmlFor="time" className="text-sm font-medium">Appointment Time</Label>
                      <select
                        id="time"
                        className="w-full p-2 border border-gray-300 rounded-md mt-1 bg-background"
                        value={formData.appointmentTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, appointmentTime: e.target.value }))}
                      >
                        <option value="">Select time</option>
                        {timeSlots.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="hospital" className="text-sm font-medium">Hospital Name</Label>
                      <Input
                        id="hospital"
                        placeholder="Hospital or blood bank name"
                        value={formData.hospitalName}
                        onChange={(e) => setFormData(prev => ({ ...prev, hospitalName: e.target.value }))}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                      <Input
                        id="location"
                        placeholder="Full address"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Additional instructions or information"
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={createAppointment}
                    disabled={loading}
                    className="gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <CalendarIcon className="h-4 w-4" />
                        Schedule Appointment
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-xl">Your Appointments</CardTitle>
              <CardDescription>
                Manage your scheduled blood donation appointments
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search appointments..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <AnimatePresence>
              {filteredAppointments.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <CalendarIcon className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No appointments found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== 'all' 
                      ? "Try adjusting your search or filter criteria" 
                      : "Schedule your first appointment using the button above"}
                  </p>
                </motion.div>
              ) : (
                filteredAppointments.map((appointment, index) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border rounded-xl overflow-hidden transition-all hover:shadow-md ${
                      appointment.status === 'confirmed' ? 'border-green-200 bg-green-50/30' : 
                      appointment.status === 'completed' ? 'border-purple-200 bg-purple-50/30' : 
                      appointment.status === 'cancelled' ? 'border-red-200 bg-red-50/30' : 
                      appointment.status === 'no_show' ? 'border-gray-200 bg-gray-50/30' : 
                      'border-blue-200 bg-blue-50/30'
                    }`}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge className={`gap-1 ${getStatusColor(appointment.status)}`}>
                              {getStatusIcon(appointment.status)}
                              {formatStatus(appointment.status)}
                            </Badge>
                            <span className="text-sm text-muted-foreground font-mono">
                              #{appointment.id}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Date</p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDate(appointment.appointmentDate)}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Time</p>
                                  <p className="text-sm text-muted-foreground">{appointment.appointmentTime || 'Not specified'}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Hospital</p>
                                  <p className="text-sm text-muted-foreground">{appointment.hospitalName || 'Not specified'}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Location</p>
                                  <p className="text-sm text-muted-foreground">{appointment.location || 'Not specified'}</p>
                                </div>
                              </div>
                              
                              {appointment.notes && (
                                <div className="flex items-start gap-3">
                                  <div className="mt-0.5">
                                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Notes</p>
                                    <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          {appointment.status === 'scheduled' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                                className="gap-1 border-green-200 text-green-700 hover:bg-green-50"
                              >
                                <Check className="h-3 w-3" />
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                                className="gap-1 border-red-200 text-red-700 hover:bg-red-50"
                              >
                                <X className="h-3 w-3" />
                                Cancel
                              </Button>
                            </>
                          )}

                          {appointment.status === 'confirmed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                              className="gap-1 border-purple-200 text-purple-700 hover:bg-purple-50"
                            >
                              <Check className="h-3 w-3" />
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}