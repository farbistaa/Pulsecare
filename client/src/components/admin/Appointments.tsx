// client/src/components/admin/Appointment.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CalendarDays, Search, Filter, Eye, XCircle, CheckCircle2, Clock, AlertTriangle, Loader2 } from 'lucide-react';

// --- TYPES BASED ON YOUR SHARED/SCHEMA.TS ---
interface Appointment {
  id: number;
  donorId: number;
  seekerId: number;
  requestId: number | null;
  appointmentDate: string;
  appointmentTime: string;
  location: string;
  hospitalName: string;
  status: 'scheduled' | 'donor_confirmed' | 'seeker_confirmed' | 'completed' | 'cancelled';
  notes: string | null;
  cancellationReason: string | null;
  createdAt: string;
}

interface AppointmentProps {
  isDarkMode: boolean;
}

// --- FALLBACK MOCK DATA (Used if backend endpoint isn't ready yet) ---
const MOCK_DATA: Appointment[] = [
  { id: 1001, donorId: 12, seekerId: 45, requestId: 88, appointmentDate: '2024-02-15', appointmentTime: '10:00 AM', location: 'Dhanmondi, Dhaka', hospitalName: 'Labaid Hospital', status: 'completed', notes: 'Successful donation', cancellationReason: null, createdAt: '2024-02-10T10:00:00Z' },
  { id: 1002, donorId: 18, seekerId: 52, requestId: 91, appointmentDate: '2024-02-20', appointmentTime: '02:30 PM', location: 'Gulshan, Dhaka', hospitalName: 'United Hospital', status: 'scheduled', notes: 'Bring previous medical reports', cancellationReason: null, createdAt: '2024-02-12T11:00:00Z' },
  { id: 1003, donorId: 25, seekerId: 60, requestId: 95, appointmentDate: '2024-02-18', appointmentTime: '11:00 AM', location: 'Mirpur, Dhaka', hospitalName: 'Square Hospital', status: 'cancelled', notes: null, cancellationReason: 'Donor fell sick', createdAt: '2024-02-11T09:00:00Z' },
  { id: 1004, donorId: 30, seekerId: 12, requestId: null, appointmentDate: '2024-02-22', appointmentTime: '09:00 AM', location: 'Bashundhara, Dhaka', hospitalName: 'Evercare Hospital', status: 'donor_confirmed', notes: 'Direct appointment, not linked to emergency request', cancellationReason: null, createdAt: '2024-02-13T14:00:00Z' },
  { id: 1005, donorId: 42, seekerId: 18, requestId: 102, appointmentDate: '2024-02-25', appointmentTime: '03:00 PM', location: 'Uttara, Dhaka', hospitalName: 'Ibn Sina Hospital', status: 'seeker_confirmed', notes: 'Seeker confirmed availability', cancellationReason: null, createdAt: '2024-02-14T08:30:00Z' },
];

export default function Appointment({ isDarkMode }: AppointmentProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      try {
        // NOTE: You will need to create this endpoint in server/routes.ts
        // e.g., app.get("/api/admin/appointments", requireAuth, requireAdmin, async (req, res) => {...})
        const response = await fetch('/api/admin/appointments', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setAppointments(data.appointments || data);
        } else {
          // Fallback to mock data if endpoint doesn't exist (404) to show UI
          console.warn("Admin Appointments endpoint not found, loading mock data.");
          setAppointments(MOCK_DATA);
        }
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
        setAppointments(MOCK_DATA); // Fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // --- FILTERING LOGIC ---
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchesSearch = 
        apt.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.donorId.toString().includes(searchQuery) ||
        apt.seekerId.toString().includes(searchQuery);

      const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchQuery, statusFilter]);

  // --- HELPERS ---
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      donor_confirmed: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      seeker_confirmed: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const formatStatusText = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const openDetails = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 h-full overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2" style={{ color: isDarkMode ? '#FFFFFF' : '#0F1724' }}>
            <CalendarDays className="h-8 w-8 text-[#000B58]" />
            Appointment Management
          </h1>
          <p className="text-sm mt-1" style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}>
            Monitor and manage all blood donation appointments across the system.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', count: appointments.length, icon: CalendarDays, color: 'text-blue-600' },
          { label: 'Scheduled', count: appointments.filter(a => a.status === 'scheduled' || a.status === 'donor_confirmed' || a.status === 'seeker_confirmed').length, icon: Clock, color: 'text-orange-600' },
          { label: 'Completed', count: appointments.filter(a => a.status === 'completed').length, icon: CheckCircle2, color: 'text-green-600' },
          { label: 'Cancelled', count: appointments.filter(a => a.status === 'cancelled').length, icon: XCircle, color: 'text-red-600' },
        ].map((stat) => (
          <Card key={stat.label} className="shadow-sm" style={{ backgroundColor: isDarkMode ? '#0f172a' : '#FFFFFF', borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-md bg-opacity-20 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm" style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}>{stat.label}</p>
                <p className="text-xl font-bold" style={{ color: isDarkMode ? '#FFFFFF' : '#0F1724' }}>{stat.count}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters Section */}
      <Card className="shadow-sm" style={{ backgroundColor: isDarkMode ? '#0f172a' : '#FFFFFF', borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by Hospital, Location, Donor/Seeker ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                style={{ backgroundColor: isDarkMode ? '#1e293b' : '#F8FAFC', borderColor: isDarkMode ? '#475569' : '#CBD5E1', color: isDarkMode ? '#FFFFFF' : '#0F1724' }}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400 hidden md:block" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]" style={{ backgroundColor: isDarkMode ? '#1e293b' : '#F8FAFC', borderColor: isDarkMode ? '#475569' : '#CBD5E1', color: isDarkMode ? '#FFFFFF' : '#0F1724' }}>
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: isDarkMode ? '#1e293b' : '#FFFFFF', borderColor: isDarkMode ? '#475569' : '#CBD5E1' }}>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="donor_confirmed">Donor Confirmed</SelectItem>
                  <SelectItem value="seeker_confirmed">Seeker Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="shadow-sm overflow-hidden" style={{ backgroundColor: isDarkMode ? '#0f172a' : '#FFFFFF', borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-[#000B58]" />
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-4">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
              <h3 className="text-lg font-medium" style={{ color: isDarkMode ? '#FFFFFF' : '#0F1724' }}>No Appointments Found</h3>
              <p className="text-sm mt-1" style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}>
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader style={{ backgroundColor: isDarkMode ? '#1e293b' : '#F1F5F9' }}>
                  <TableRow>
                    <TableHead className="font-semibold" style={{ color: isDarkMode ? '#CBD5E1' : '#334155' }}>ID</TableHead>
                    <TableHead className="font-semibold" style={{ color: isDarkMode ? '#CBD5E1' : '#334155' }}>Hospital</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell" style={{ color: isDarkMode ? '#CBD5E1' : '#334155' }}>Location</TableHead>
                    <TableHead className="font-semibold" style={{ color: isDarkMode ? '#CBD5E1' : '#334155' }}>Date & Time</TableHead>
                    <TableHead className="font-semibold text-center" style={{ color: isDarkMode ? '#CBD5E1' : '#334155' }}>Status</TableHead>
                    <TableHead className="font-semibold text-right" style={{ color: isDarkMode ? '#CBD5E1' : '#334155' }}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((apt) => (
                    <TableRow 
                      key={apt.id} 
                      className="cursor-pointer transition-colors hover:bg-opacity-50"
                      style={{ borderColor: isDarkMode ? '#334155' : '#E2E8F0' }}
                      onClick={() => openDetails(apt)}
                    >
                      <TableCell className="font-mono text-xs" style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}>
                        #APT-{apt.id}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium" style={{ color: isDarkMode ? '#FFFFFF' : '#0F1724' }}>{apt.hospitalName}</div>
                        <div className="text-xs md:hidden" style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}>{apt.location}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell" style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}>
                        {apt.location}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium" style={{ color: isDarkMode ? '#FFFFFF' : '#0F1724' }}>{apt.appointmentDate}</div>
                        <div className="text-xs" style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}>{apt.appointmentTime}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className={`${getStatusBadge(apt.status)} border-0 font-medium`}>
                          {formatStatusText(apt.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openDetails(apt); }}>
                          <Eye className="h-4 w-4 text-[#000B58]" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg" style={{ backgroundColor: isDarkMode ? '#0f172a' : '#FFFFFF', borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: isDarkMode ? '#FFFFFF' : '#0F1724' }}>
              Appointment Details #{selectedAppointment?.id}
            </DialogTitle>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}>Hospital Name</p>
                  <p className="text-sm font-semibold" style={{ color: isDarkMode ? '#FFFFFF' : '#0F1724' }}>{selectedAppointment.hospitalName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}>Location</p>
                  <p className="text-sm font-semibold" style={{ color: isDarkMode ? '#FFFFFF' : '#0F1724' }}>{selectedAppointment.location}</p>
                </div>
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}>Appointment Date</p>
                  <p className="text-sm font-semibold" style={{ color: isDarkMode ? '#FFFFFF' : '#0F1724' }}>{selectedAppointment.appointmentDate}</p>
                </div>
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}>Appointment Time</p>
                  <p className="text-sm font-semibold" style={{ color: isDarkMode ? '#FFFFFF' : '#0F1724' }}>{selectedAppointment.appointmentTime}</p>
                </div>
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}>Donor ID</p>
                  <p className="text-sm font-mono" style={{ color: isDarkMode ? '#FFFFFF' : '#0F1724' }}>#DON-{selectedAppointment.donorId}</p>
                </div>
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}>Seeker ID</p>
                  <p className="text-sm font-mono" style={{ color: isDarkMode ? '#FFFFFF' : '#0F1724' }}>#SEEK-{selectedAppointment.seekerId}</p>
                </div>
              </div>

              <div className="pt-2 border-t" style={{ borderColor: isDarkMode ? '#334155' : '#E2E8F0' }}>
                <p className="text-xs font-medium mb-1" style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}>Current Status</p>
                <Badge variant="secondary" className={`${getStatusBadge(selectedAppointment.status)} border-0 text-sm px-3 py-1`}>
                  {formatStatusText(selectedAppointment.status)}
                </Badge>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }}>Notes</p>
                  <p className="text-sm p-3 rounded-md" style={{ backgroundColor: isDarkMode ? '#1e293b' : '#F8FAFC', color: isDarkMode ? '#CBD5E1' : '#334155' }}>
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}

              {selectedAppointment.status === 'cancelled' && selectedAppointment.cancellationReason && (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
                  <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Cancellation Reason</p>
                  <p className="text-sm text-red-800 dark:text-red-300">{selectedAppointment.cancellationReason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}