import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  AlertTriangle,
  Users,
  Droplet,
  MapPin,
  Phone,
  Clock,
  Calendar,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
} from 'lucide-react';

interface EmergencyRequest {
  id: number;
  patientName: string;
  patientAge: number;
  bloodGroup: string;
  unitsRequired: number;
  hospitalName: string;
  hospitalAddress: string;
  doctorName: string;
  contactNumber: string;
  requiredBy: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  isCritical: boolean;
  additionalInfo?: string;
  createdAt: string;
  updatedAt: string;
}

interface EmergencyStats {
  totalRequests: number;
  pendingRequests: number;
  criticalRequests: number;
  completedRequests: number;
  cancelledRequests: number;
  averageResponseTime: number;
  requestsByBloodGroup: Array<{ bloodGroup: string; count: number }>;
  requestsByStatus: Array<{ status: string; count: number }>;
}

const EmergencyRequestManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [dateRange, setDateRange] = useState('30d');
  const [editingRequest, setEditingRequest] = useState<EmergencyRequest | null>(null);
  const [isAddingRequest, setIsAddingRequest] = useState(false);
  const [newRequest, setNewRequest] = useState({
    patientName: '',
    patientAge: '',
    bloodGroup: '',
    unitsRequired: '',
    hospitalName: '',
    hospitalAddress: '',
    doctorName: '',
    contactNumber: '',
    requiredBy: '',
    isCritical: false,
    additionalInfo: '',
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Fetch emergency requests
  const { data: emergencyRequests, isLoading, error } = useQuery<EmergencyRequest[]>({
    queryKey: ['/api/admin/emergency-requests'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch emergency stats
  const { data: stats } = useQuery<EmergencyStats>({
    queryKey: ['/api/admin/emergency-stats'],
    staleTime: 5 * 60 * 1000,
  });

  // Update request status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ requestId, status }: { requestId: number; status: string }) =>
      apiRequest(`/api/emergency-requests/${requestId}/status`, {
        method: 'PATCH',
        body: { status },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/emergency-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/emergency-stats'] });
      toast({
        title: "Success",
        description: "Request status updated successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update request status.",
        variant: "destructive",
      });
    },
  });

  // Delete request mutation
  const deleteRequestMutation = useMutation({
    mutationFn: (requestId: number) =>
      apiRequest(`/api/emergency-requests/${requestId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/emergency-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/emergency-stats'] });
      toast({
        title: "Success",
        description: "Emergency request deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete emergency request.",
        variant: "destructive",
      });
    },
  });

  // Add new request mutation
  const addRequestMutation = useMutation({
    mutationFn: (requestData: any) =>
      apiRequest('/api/emergency-requests', {
        method: 'POST',
        body: requestData,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/emergency-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/emergency-stats'] });
      toast({
        title: "Success",
        description: "Emergency request created successfully!",
      });
      setIsAddingRequest(false);
      setNewRequest({
        patientName: '',
        patientAge: '',
        bloodGroup: '',
        unitsRequired: '',
        hospitalName: '',
        hospitalAddress: '',
        doctorName: '',
        contactNumber: '',
        requiredBy: '',
        isCritical: false,
        additionalInfo: '',
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create emergency request.",
        variant: "destructive",
      });
    },
  });

  // Filter requests
  const filteredRequests = emergencyRequests?.filter(request => {
    const matchesSearch = request.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.contactNumber.includes(searchTerm);
    const matchesBloodGroup = !selectedBloodGroup || request.bloodGroup === selectedBloodGroup;
    const matchesStatus = !selectedStatus || request.status === selectedStatus;
    const matchesPriority = !selectedPriority || 
      (selectedPriority === 'critical' && request.isCritical) ||
      (selectedPriority === 'normal' && !request.isCritical);
    return matchesSearch && matchesBloodGroup && matchesStatus && matchesPriority;
  }) || [];

  const handleStatusUpdate = (requestId: number, status: string) => {
    updateStatusMutation.mutate({ requestId, status });
  };

  const handleDeleteRequest = (requestId: number) => {
    if (confirm('Are you sure you want to delete this emergency request? This action cannot be undone.')) {
      deleteRequestMutation.mutate(requestId);
    }
  };

  const handleAddRequest = () => {
    const requestData = {
      ...newRequest,
      patientAge: parseInt(newRequest.patientAge),
      unitsRequired: parseInt(newRequest.unitsRequired),
    };
    addRequestMutation.mutate(requestData);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800">Approved</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const exportRequests = () => {
    toast({
      title: "Export Started",
      description: "Exporting emergency requests as CSV...",
    });
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Patient Name,Patient Age,Blood Group,Units Required,Hospital Name,Doctor Name,Contact Number,Required By,Status,Critical,Created At\n";
    
    filteredRequests.forEach(request => {
      csvContent += `${request.id},${request.patientName},${request.patientAge},${request.bloodGroup},${request.unitsRequired},"${request.hospitalName}","${request.doctorName}",${request.contactNumber},${request.requiredBy},${request.status},${request.isCritical},${request.createdAt}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "emergency_requests.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Complete",
      description: "Emergency requests exported successfully.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <Button
            variant="outline"
            onClick={exportRequests}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={() => setIsAddingRequest(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{stats?.totalRequests || '0'}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.pendingRequests || '0'}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-600">{stats?.criticalRequests || '0'}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats?.completedRequests || '0'}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold">{stats?.averageResponseTime || '0'}m</p>
              </div>
              <RefreshCw className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Request Form */}
      {isAddingRequest && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Add New Emergency Request</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Patient Name</label>
                <Input
                  value={newRequest.patientName}
                  onChange={(e) => setNewRequest({...newRequest, patientName: e.target.value})}
                  placeholder="Enter patient name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Patient Age</label>
                <Input
                  type="number"
                  value={newRequest.patientAge}
                  onChange={(e) => setNewRequest({...newRequest, patientAge: e.target.value})}
                  placeholder="Enter patient age"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Blood Group</label>
                <Select value={newRequest.bloodGroup} onValueChange={(value) => setNewRequest({...newRequest, bloodGroup: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodGroups.map(group => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Units Required</label>
                <Input
                  type="number"
                  value={newRequest.unitsRequired}
                  onChange={(e) => setNewRequest({...newRequest, unitsRequired: e.target.value})}
                  placeholder="Enter units required"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hospital Name</label>
                <Input
                  value={newRequest.hospitalName}
                  onChange={(e) => setNewRequest({...newRequest, hospitalName: e.target.value})}
                  placeholder="Enter hospital name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Doctor Name</label>
                <Input
                  value={newRequest.doctorName}
                  onChange={(e) => setNewRequest({...newRequest, doctorName: e.target.value})}
                  placeholder="Enter doctor name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Number</label>
                <Input
                  value={newRequest.contactNumber}
                  onChange={(e) => setNewRequest({...newRequest, contactNumber: e.target.value})}
                  placeholder="Enter contact number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Required By</label>
                <Input
                  type="datetime-local"
                  value={newRequest.requiredBy}
                  onChange={(e) => setNewRequest({...newRequest, requiredBy: e.target.value})}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Hospital Address</label>
                <Input
                  value={newRequest.hospitalAddress}
                  onChange={(e) => setNewRequest({...newRequest, hospitalAddress: e.target.value})}
                  placeholder="Enter hospital address"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Additional Information</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={newRequest.additionalInfo}
                  onChange={(e) => setNewRequest({...newRequest, additionalInfo: e.target.value})}
                  placeholder="Enter any additional information"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isCritical"
                  checked={newRequest.isCritical}
                  onChange={(e) => setNewRequest({...newRequest, isCritical: e.target.checked})}
                />
                <label htmlFor="isCritical" className="text-sm font-medium">Mark as Critical</label>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddingRequest(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRequest}>
                Create Request
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedBloodGroup} onValueChange={setSelectedBloodGroup}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Blood Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                {bloodGroups.map(group => (
                  <SelectItem key={group} value={group}>{group}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Emergency Requests</CardTitle>
          <CardDescription>
            Showing {filteredRequests.length} of {emergencyRequests?.length || 0} requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Patient Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Blood Type & Units
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Hospital
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium">{request.patientName}</p>
                          <p className="text-sm text-muted-foreground">Age: {request.patientAge}</p>
                          {request.additionalInfo && (
                            <p className="text-xs text-muted-foreground truncate max-w-xs">
                              {request.additionalInfo}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-center">
                          <Badge variant="outline" className="mb-1">
                            {request.bloodGroup}
                          </Badge>
                          <p className="text-sm font-semibold">{request.unitsRequired} units</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-sm">{request.hospitalName}</p>
                          <p className="text-xs text-muted-foreground">{request.hospitalAddress}</p>
                          <p className="text-xs text-muted-foreground">Dr. {request.doctorName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium">{request.contactNumber}</p>
                          <p className="text-xs text-muted-foreground">
                            Required by: {new Date(request.requiredBy).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={request.status}
                          onChange={(e) => handleStatusUpdate(request.id, e.target.value)}
                          className={`px-2 py-1 text-sm rounded border ${
                            request.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-300' :
                            request.status === 'approved' ? 'bg-blue-50 text-blue-700 border-blue-300' :
                            request.status === 'completed' ? 'bg-green-50 text-green-700 border-green-300' :
                            'bg-red-50 text-red-700 border-red-300'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {request.isCritical ? (
                          <Badge variant="destructive" className="animate-pulse">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Critical
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Normal</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(request.createdAt).toLocaleDateString()}
                        <br />
                        <span className="text-xs">
                          {new Date(request.createdAt).toLocaleTimeString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingRequest(request)}
                            className="hover:text-blue-600"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(request.id)}
                            className="hover:text-red-600"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Detail Modal */}
      {editingRequest && (
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Emergency Request Details</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingRequest(null)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Patient Information</h3>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="w-32 text-sm text-muted-foreground">Name:</span>
                    <span className="text-sm">{editingRequest.patientName}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-sm text-muted-foreground">Age:</span>
                    <span className="text-sm">{editingRequest.patientAge}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-sm text-muted-foreground">Blood Group:</span>
                    <Badge variant="outline">{editingRequest.bloodGroup}</Badge>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-sm text-muted-foreground">Units Required:</span>
                    <span className="text-sm">{editingRequest.unitsRequired}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Hospital Information</h3>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="w-32 text-sm text-muted-foreground">Hospital:</span>
                    <span className="text-sm">{editingRequest.hospitalName}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-sm text-muted-foreground">Address:</span>
                    <span className="text-sm">{editingRequest.hospitalAddress}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-sm text-muted-foreground">Doctor:</span>
                    <span className="text-sm">Dr. {editingRequest.doctorName}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-sm text-muted-foreground">Contact:</span>
                    <span className="text-sm">{editingRequest.contactNumber}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Request Details</h3>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="w-32 text-sm text-muted-foreground">Status:</span>
                    {getStatusBadge(editingRequest.status)}
                  </div>
                  <div className="flex">
                    <span className="w-32 text-sm text-muted-foreground">Priority:</span>
                    {editingRequest.isCritical ? (
                      <Badge variant="destructive">Critical</Badge>
                    ) : (
                      <Badge variant="secondary">Normal</Badge>
                    )}
                  </div>
                  <div className="flex">
                    <span className="w-32 text-sm text-muted-foreground">Required By:</span>
                    <span className="text-sm">
                      {new Date(editingRequest.requiredBy).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-sm text-muted-foreground">Created:</span>
                    <span className="text-sm">
                      {new Date(editingRequest.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Additional Information</h3>
                {editingRequest.additionalInfo ? (
                  <p className="text-sm p-3 rounded bg-muted">
                    {editingRequest.additionalInfo}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">No additional information provided</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmergencyRequestManagement;