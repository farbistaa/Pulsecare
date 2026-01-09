import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { User } from '@/types/user';
import Register from '@/pages/Register';
import { adminApi } from '@/api/donor';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import Loader from '@/components/ui/Loader';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Activity,
  CalendarIcon,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Mail,
  Phone,
  MessageSquare,
  UserPlus,
  Upload,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  UserX,
  ChevronUp
} from 'lucide-react';

// Update the User interface to include all required fields
// Add this interface for the edit form
interface EditUserForm extends Omit<User, 'id' | 'donorId' | 'createdAt'> {}

// Add this interface for deactivation reason
interface DeactivationReason {
  reason: string;
  customReason?: string;
}

// Add this interface for the registration form
interface RegisterForm {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  bloodGroup: string;
  district: string;
  password: string;
  confirmPassword: string;
  isAvailable: boolean;
}

// Add this component for the User Management section
const DonorManagementSection = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // State for sorting
  const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: 'asc' | 'desc' } | null>(null);
  // FIX 1: Memoize sortConfig to prevent unnecessary re-renders
  const stableSortConfig = useMemo(() => sortConfig, [sortConfig?.key, sortConfig?.direction]);
  // State for filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // State for selection
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // State for actions
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<EditUserForm | null>(null);
  const [deactivatingUser, setDeactivatingUser] = useState<User | null>(null);
  const [deactivationReason, setDeactivationReason] = useState<DeactivationReason>({ reason: '' });
  const [bulkAction, setBulkAction] = useState<string>('');
  const [showBulkActionDialog, setShowBulkActionDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  
  // State for registration dialog
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    bloodGroup: '',
    district: '',
    password: '',
    confirmPassword: '',
    isAvailable: true,
  });
  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({});
  
  // Fetch total users count separately
  const { data: totalUsersData, isLoading: totalUsersLoading } = useQuery({
    queryKey: ['adminUsersTotal'],
    queryFn: async () => {
      try {
        const response = await adminApi.getAllUsers({
          limit: '1',
          offset: '0',
          search: '',
          bloodGroup: '',
          district: '',
          isVerified: undefined,
          isAvailable: undefined,
          status: undefined,
          sortBy: 'id',
          sortOrder: 'desc'
        });
        // The API should return the total count, but if not, we'll use a fallback
        return response.total || 2000; // Fallback to 2000 if API doesn't return total
      } catch (error) {
        console.error("Error fetching total users count:", error);
        return 2000; // Fallback value
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch users data
const { data: usersData, isLoading: usersLoading, error: usersError, refetch } = useQuery<{
  users: User[];
  total: number | string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number | string;
    startItem: number;
    endItem: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}>({
  queryKey: ['adminUsers', currentPage, itemsPerPage, searchTerm, selectedBloodGroup, selectedStatus, sortConfig],
  queryFn: () => adminApi.getAllUsers({
    limit: itemsPerPage.toString(),
    offset: ((currentPage - 1) * itemsPerPage).toString(),
    search: searchTerm,
    bloodGroup: selectedBloodGroup,
    district: '',
    // Fix the filter values - don't send empty strings or undefined values
    isVerified: selectedStatus === "verified" ? "true" : selectedStatus === "unverified" ? "false" : undefined,
    isAvailable: selectedStatus === "available" ? "true" : selectedStatus === "unavailable" ? "false" : undefined,
    status: selectedStatus === "all" || selectedStatus === "" ? undefined : selectedStatus,
    sortBy: sortConfig?.key || 'createdAt',
    sortOrder: sortConfig?.direction || 'desc'
  }),
  staleTime: 5 * 60 * 1000,
  refetchOnWindowFocus: false,
});

// Convert string to number for calculations
const users = usersData?.users || [];
const totalUsers = parseInt(usersData?.total?.toString() || '0');
const totalPages = Math.ceil(totalUsers / itemsPerPage);

// Add this temporarily to see what's happening
<div className="bg-gray-100 p-4 rounded mb-4">
  <h3 className="font-bold mb-2">Debug Info:</h3>
  <p>Current Page: {currentPage}</p>
  <p>Items Per Page: {itemsPerPage}</p>
  <p>Total Users: {totalUsers}</p>
  <p>Total Pages: {totalPages}</p>
  <p>Users in Current Page: {users.length}</p>
  <p>Has Next Page: {currentPage < totalPages}</p>
  <p>Has Previous Page: {currentPage > 1}</p>
</div>
  
  // Handle sorting
  const requestSort = (key: keyof User) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Handle selection
  const handleSelectUser = (userId: number) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };
  
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
    setSelectAll(!selectAll);
  };
  
  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectAll(false);
    setSelectedUsers([]);
  }, [searchTerm, selectedBloodGroup, selectedStatus, sortConfig]);
  
  // Update select all checkbox when users change
  useEffect(() => {
    if (users.length > 0 && selectedUsers.length === users.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedUsers, users]);
  
  // Handle edit user
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      bloodGroup: user.bloodGroup,
      district: user.district,
      isVerified: user.isVerified,
      isAvailable: user.isAvailable,
      isAdmin: user.isAdmin,
      donationCount: user.donationCount,
      rating: user.rating,
      status: user.status,
    });
  };
  
  const handleSaveEdit = () => {
    if (!editingUser || !editForm) return;
    
    updateUserMutation.mutate({
      userId: editingUser.id,
      userData: editForm,
    });
    
    setEditingUser(null);
    setEditForm(null);
  };
  
  // Handle deactivate user
  const handleDeactivateUser = (user: User) => {
    setDeactivatingUser(user);
    setDeactivationReason({ reason: '' });
  };
  
  const confirmDeactivation = () => {
    if (!deactivatingUser) return;
    
    deactivateUserMutation.mutate({
      userId: deactivatingUser.id,
      reason: deactivationReason.reason,
      customReason: deactivationReason.customReason,
    });
  };
  
  // Handle delete user
  const handleDeleteUser = (user: User) => {
    if (confirm(`Are you sure you want to delete ${user.fullName}? This action cannot be undone.`)) {
      deleteUserMutation.mutate(user.id);
    }
  };
  
  // Handle bulk actions
  const handleBulkAction = () => {
    if (!bulkAction || selectedUsers.length === 0) return;
    
    switch (bulkAction) {
      case 'changeStatus':
        // Implement bulk status change
        break;
      case 'sendEmail':
        // Implement bulk email
        break;
      case 'export':
        // Export selected users
        handleExportSelected();
        break;
      case 'deactivate':
        // Implement bulk deactivation
        break;
      case 'delete':
        // Implement bulk deletion
        break;
      default:
        break;
    }
    
    setBulkAction('');
    setShowBulkActionDialog(false);
    setSelectedUsers([]);
  };
  
  // Export functions
  const handleExportCSV = () => {
    try {
      // Create the CSV content
      const csvContent = [
        csvHeaders.map(header => header.label).join(','),
        ...users.map(user => 
          csvHeaders.map(header => {
            const value = user[header.key as keyof User];
            // Handle commas and quotes in the data
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');
      
      // Create a blob with the CSV content
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'users.csv');
      link.style.visibility = 'hidden';
      
      // Add the link to the document and click it
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Users data exported as CSV successfully.",
      });
    } catch (error) {
      console.error('CSV export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export users data as CSV.",
        variant: "destructive",
      });
    }
  };
  
  const handleExportExcel = () => {
    try {
      if (!users.length) {
        toast({
          title: "No Data",
          description: "No users data available to export.",
          variant: "destructive",
        });
        return;
      }
      
      // Prepare data for Excel
      const excelData = users.map(user => ({
        'Donor ID': user.donorId,
        'Name': user.fullName,
        'Username': user.username,
        'Blood Type': user.bloodGroup,
        'Email': user.email,
        'Phone': user.phone,
        'District': user.district,
        'Status': user.status,
        'Donation Count': user.donationCount,
        'Rating': user.rating,
        'Verified': user.isVerified ? 'Yes' : 'No',
        'Available': user.isAvailable ? 'Yes' : 'No',
      }));
      
      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
      
      // Auto-size columns
      const maxWidths = Object.keys(excelData[0] || {}).map(key => {
        const max = Math.max(
          key.length,
          ...excelData.map((row: Record<string, any>) => (row[key as keyof typeof row] || '').toString().length)
        );
        return { wch: max + 2 };
      });
      worksheet['!cols'] = maxWidths;
      
      // Save the file
      XLSX.writeFile(workbook, 'users.xlsx');
      
      toast({
        title: "Export Successful",
        description: "Users data exported as Excel successfully.",
      });
    } catch (error) {
      console.error('Excel export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export users data as Excel.",
        variant: "destructive",
      });
    }
  };
  
  const handleExportPDF = () => {
    try {
      if (!users.length) {
        toast({
          title: "No Data",
          description: "No users data available to export.",
          variant: "destructive",
        });
        return;
      }
      
      // Create new PDF document
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text('User Management Report', 15, 15);
      
      // Add timestamp
      doc.setFontSize(10);
      doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 15, 25);
      
      // Prepare table data
      const tableData = users.map(user => [
        user.donorId,
        user.fullName,
        user.bloodGroup,
        user.email,
        user.phone,
        user.status,
      ]);
      
      // Add table
      (doc as any).autoTable({
        head: [['Donor ID', 'Name', 'Blood Type', 'Email', 'Phone', 'Status']],
        body: tableData,
        startY: 35,
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [66, 66, 66],
          textColor: 255,
          fontSize: 9,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 20 }, // Donor ID
          1: { cellWidth: 30 }, // Name
          2: { cellWidth: 15 }, // Blood Type
          3: { cellWidth: 40 }, // Email
          4: { cellWidth: 25 }, // Phone
          5: { cellWidth: 20 }, // Status
        },
      });
      
      // Add footer
      const pageCount = (doc as any).getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.getWidth() - 30,
          doc.internal.pageSize.getHeight() - 10
        );
      }
      
      // Save the PDF
      doc.save('users.pdf');
      
      toast({
        title: "Export Successful",
        description: "Users data exported as PDF successfully.",
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export users data as PDF.",
        variant: "destructive",
      });
    }
  };
  
  const handleExportSelected = () => {
    const selectedData = users.filter(user => selectedUsers.includes(user.id));
    
    // You can implement export for selected users here
    // For simplicity, we'll just show a toast
    toast({
      title: "Export Selected",
      description: `Exporting ${selectedData.length} selected users.`,
    });
  };
  
  // Handle bulk upload
  const handleBulkUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (data) {
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Process the data and upload to server
        // This would be implemented in your backend
        
        toast({
          title: "Bulk Upload",
          description: `Processed ${jsonData.length} records for upload.`,
        });
        
        setShowUploadDialog(false);
      }
    };
    reader.readAsBinaryString(file);
  };
  
  // Handle registration form changes
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRegisterSelectChange = (name: string, value: string) => {
    setRegisterForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRegisterCheckboxChange = (name: string, checked: boolean) => {
    setRegisterForm(prev => ({ ...prev, [name]: checked }));
  };
  
  // Validate registration form
  const validateRegisterForm = () => {
    const errors: Record<string, string> = {};
    
    if (!registerForm.fullName.trim()) {
      errors.fullName = "Full name is required";
    }
    
    if (!registerForm.username.trim()) {
      errors.username = "Username is required";
    }
    
    if (!registerForm.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(registerForm.email)) {
      errors.email = "Email is invalid";
    }
    
    if (!registerForm.phone.trim()) {
      errors.phone = "Phone number is required";
    }
    
    if (!registerForm.bloodGroup) {
      errors.bloodGroup = "Blood group is required";
    }
    
    if (!registerForm.district.trim()) {
      errors.district = "District is required";
    }
    
    if (!registerForm.password) {
      errors.password = "Password is required";
    } else if (registerForm.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    
    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle registration form submission
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateRegisterForm()) {
      // Here you would typically make an API call to register the user
      // For now, we'll just show a success message and close the dialog
      toast({
        title: "Registration Successful",
        description: `${registerForm.fullName} has been registered as a new donor.`,
      });
      
      // Reset form
      setRegisterForm({
        fullName: '',
        username: '',
        email: '',
        phone: '',
        bloodGroup: '',
        district: '',
        password: '',
        confirmPassword: '',
        isAvailable: true,
      });
      setRegisterErrors({});
      setShowRegisterDialog(false);
      
      // Refresh user list
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    }
  };
  
  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, userData }: { userId: number; userData: Partial<User> }) => {
      try {
        const response = await apiRequest(`/api/admin/users/${userId}`, {
          method: 'PATCH',
          body: userData,
        });
        return response;
      } catch (error) {
        console.error("Update user error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch the queries to get the latest data
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      queryClient.invalidateQueries({ queryKey: ['adminUsersTotal'] });
      toast({
        title: "Success",
        description: "User updated successfully!",
      });
    },
    onError: (error) => {
      console.error("Update user mutation error:", error);
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Deactivate user mutation
  const deactivateUserMutation = useMutation({
    mutationFn: async ({ userId, reason, customReason }: { userId: number; reason: string; customReason?: string }) => {
      try {
        const response = await apiRequest(`/api/admin/users/${userId}`, {
          method: 'PATCH',
          body: { 
            isAvailable: false,
            status: 'Unavailable',
            deactivationReason: reason,
            customDeactivationReason: customReason
          },
        });
        return response;
      } catch (error) {
        console.error("Deactivate user error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch the queries to get the latest data
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      queryClient.invalidateQueries({ queryKey: ['adminUsersTotal'] });
      toast({
        title: "Success",
        description: "User deactivated successfully!",
        className: "bg-red-600 text-white",
      });
      setDeactivatingUser(null);
    },
    onError: (error) => {
      console.error("Deactivate user mutation error:", error);
      toast({
        title: "Error",
        description: "Failed to deactivate user. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      try {
        const response = await apiRequest(`/api/admin/users/${userId}`, {
          method: 'DELETE',
        });
        return response;
      } catch (error) {
        console.error("Delete user error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch the queries to get the latest data
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      queryClient.invalidateQueries({ queryKey: ['adminUsersTotal'] });
      toast({
        title: "Success",
        description: "User deleted successfully!",
      });
    },
    onError: (error) => {
      console.error("Delete user mutation error:", error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Blood groups for filter
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  // Status options for filter
  const statusOptions = ['Available', 'Unavailable', 'Eligible', 'Not Eligible'];
  
  // CSV headers for export
  const csvHeaders = [
    { label: 'Donor ID', key: 'donorId' },
    { label: 'Name', key: 'fullName' },
    { label: 'Blood Type', key: 'bloodGroup' },
    { label: 'Email', key: 'email' },
    { label: 'Phone', key: 'phone' },
    { label: 'Status', key: 'status' },
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Donor Management
        </CardTitle>
        
        {/* Improved Search and Filters Section */}
        <div className="flex flex-col md:flex-row gap-6 mt-6 p-4 bg-gray-50 rounded-lg">
          {/* Search Bar */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by name, email, phone, or donor ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <Select value={selectedBloodGroup} onValueChange={setSelectedBloodGroup}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Blood Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Blood Groups</SelectItem>
                {bloodGroups.map(group => (
                  <SelectItem key={group} value={group}>{group}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Enhanced Clear Filter Button with Animation */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="destructive" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedBloodGroup('');
                  setSelectedStatus('');
                }}
                className="bg-red-600 hover:bg-red-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Clear Filters
              </Button>
            </motion.div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mt-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportCSV}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportExcel}>
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-1" />
                Bulk Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk User Upload</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p>Upload a spreadsheet with user information. All required fields must be present.</p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleBulkUpload}
                    className="hidden"
                    id="bulk-upload"
                  />
                  <label htmlFor="bulk-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500 mt-1">XLSX, XLS, CSV up to 10MB</p>
                    </div>
                  </label>
                </div>
                <div className="text-sm text-gray-500">
                  <p className="font-medium">Required fields:</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Full Name</li>
                    <li>Email</li>
                    <li>Phone</li>
                    <li>Blood Group</li>
                    <li>District</li>
                  </ul>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showBulkActionDialog} onOpenChange={setShowBulkActionDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={selectedUsers.length === 0}>
                Bulk Actions
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Actions</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p>Perform actions on {selectedUsers.length} selected users.</p>
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="changeStatus">Change Status</SelectItem>
                    <SelectItem value="sendEmail">Send Mass Email</SelectItem>
                    <SelectItem value="export">Export Selected</SelectItem>
                    <SelectItem value="deactivate">Deactivate Selected</SelectItem>
                    <SelectItem value="delete">Delete Selected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowBulkActionDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBulkAction} disabled={!bulkAction}>
                  Apply
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Enhanced Add User Button with Animation */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="sm" 
              onClick={() => setShowRegisterDialog(true)}
              className="bg-red-600 hover:bg-red-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Add User
            </Button>
          </motion.div>
        </div>
      </CardHeader>
      
      <CardContent>
        {usersLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-500">
                Showing {users.length} of {totalUsers} users
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Items per page:</span>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead className="bg-gray-100">
                      <div
                        className="flex items-center gap-1 p-0 h-auto font-semibold cursor-pointer"
                        onClick={() => requestSort('donorId')}
                      >
                        Donor ID
                        {sortConfig?.key === 'donorId' && (
                          sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="bg-gray-100">
                      <div
                        className="flex items-center gap-1 p-0 h-auto font-semibold cursor-pointer"
                        onClick={() => requestSort('fullName')}
                      >
                        Name
                        {sortConfig?.key === 'fullName' && (
                          sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="bg-gray-100">
                      <div
                        className="flex items-center gap-1 p-0 h-auto font-semibold cursor-pointer"
                        onClick={() => requestSort('bloodGroup')}
                      >
                        Blood Type
                        {sortConfig?.key === 'bloodGroup' && (
                          sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="bg-gray-100">Email & Phone</TableHead>
                    <TableHead className="bg-gray-100">
                      <div
                        className="flex items-center gap-1 p-0 h-auto font-semibold cursor-pointer"
                        onClick={() => requestSort('status')}
                      >
                        Status
                        {sortConfig?.key === 'status' && (
                          sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right bg-gray-100">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length > 0 ? (
                    users.map((user: User) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => handleSelectUser(user.id)}
                            aria-label={`Select ${user.fullName}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{user.donorId}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.fullName}</p>
                            <p className="text-sm text-gray-500">@{user.username}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-red-600 border-red-600">
                            {user.bloodGroup}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span className="text-xs">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span className="text-xs">{user.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              user.status === 'Available' ? 'default' :
                              user.status === 'Eligible' ? 'secondary' :
                              'destructive'
                            }
                            className={
                              user.status === 'Available' ? 'bg-green-600' :
                              user.status === 'Eligible' ? 'bg-blue-600' :
                              ''
                            }
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                <Edit className="h-4 w-4 mr-2" />
                                View/Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Phone className="h-4 w-4 mr-2" />
                                Call
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Send Message
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeactivateUser(user)}>
                                <UserX className="h-4 w-4 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteUser(user)} className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <p className="text-gray-500">No users found</p>
                        {users.length === 0 && totalUsers > 0 && (
                          <p className="text-sm text-gray-400 mt-2">
                            Try adjusting your filters to see more results.
                          </p>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages} ({totalUsers} items)
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1 || totalPages === 0}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1 || totalPages === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
      
      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editForm && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={editForm.username}
                  onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Select value={editForm.bloodGroup} onValueChange={(value) => setEditForm({...editForm, bloodGroup: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodGroups.map(group => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  value={editForm.district}
                  onChange={(e) => setEditForm({...editForm, district: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={editForm.status} onValueChange={(value) => setEditForm({...editForm, status: value as any})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isVerified"
                  checked={editForm.isVerified}
                  onCheckedChange={(checked) => setEditForm({...editForm, isVerified: !!checked})}
                />
                <Label htmlFor="isVerified">Verified</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isAvailable"
                  checked={editForm.isAvailable}
                  onCheckedChange={(checked) => setEditForm({...editForm, isAvailable: !!checked})}
                />
                <Label htmlFor="isAvailable">Available</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Deactivate User Dialog */}
      <Dialog open={!!deactivatingUser} onOpenChange={() => setDeactivatingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to deactivate {deactivatingUser?.fullName}?</p>
            <div>
              <Label htmlFor="reason">Reason for deactivation</Label>
              <Select value={deactivationReason.reason} onValueChange={(value) => setDeactivationReason({...deactivationReason, reason: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="violation">Terms of Service Violation</SelectItem>
                  <SelectItem value="inactivity">Inactivity</SelectItem>
                  <SelectItem value="request">User Request</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {deactivationReason.reason === 'other' && (
              <div>
                <Label htmlFor="customReason">Custom Reason</Label>
                <Textarea
                  id="customReason"
                  value={deactivationReason.customReason || ''}
                  onChange={(e) => setDeactivationReason({...deactivationReason, customReason: e.target.value})}
                />
              </div>
            )}
            <p className="text-sm text-gray-500">
              The user will be notified via email and can request reactivation.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivatingUser(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeactivation}>
              Deactivate User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Register User Dialog - Improved UI/UX */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register New Donor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Register />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegisterDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
export default function DonorManagement() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <DonorManagementSection />
      </div>
    </div>
  );
}