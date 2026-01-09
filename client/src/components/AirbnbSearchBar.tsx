import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Calendar as CalendarIcon, 
  ChevronDown, 
  X, 
  MapPin, 
  Droplet,
  Filter,
  Clock,
  UserCheck,
  UserX
} from 'lucide-react';
import { format } from 'date-fns';

// Data constants
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const divisions = [
  'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh'
];

// Type-safe district and upazila definitions
const districts: Record<string, string[]> = {
  'Dhaka': ['Dhaka', 'Gazipur', 'Narayanganj', 'Narsingdi', 'Tangail', 'Kishoreganj', 'Manikganj', 'Munshiganj', 'Rajbari', 'Madaripur', 'Gopalganj', 'Shariatpur', 'Faridpur'],
  'Chittagong': ['Chittagong', 'Comilla', 'Feni', 'Brahmanbaria', 'Rangamati', 'Bandarban', 'Khagrachhari', 'Cox\'s Bazar', 'Lakshmipur', 'Noakhali', 'Chandpur'],
  'Sylhet': ['Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
  'Rajshahi': ['Rajshahi', 'Chapai Nawabganj', 'Natore', 'Naogaon', 'Pabna', 'Bogura', 'Sirajganj', 'Joypurhat'],
  'Khulna': ['Khulna', 'Bagerhat', 'Chuadanga', 'Jessore', 'Jhenaidah', 'Kushtia', 'Magura', 'Meherpur', 'Narail', 'Satkhira'],
  'Barishal': ['Barishal', 'Barguna', 'Bhola', 'Jhalokathi', 'Patuakhali', 'Pirojpur'],
  'Rangpur': ['Rangpur', 'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari', 'Panchagarh', 'Thakurgaon'],
  'Mymensingh': ['Mymensingh', 'Jamalpur', 'Netrokona', 'Sherpur']
};

// Complete upazila data for all districts
const upazilas: Record<string, string[]> = {
  // Barishal Division Districts
  'Barishal': ['Barishal Sadar', 'Babuganj', 'Bakerganj', 'Banaripara', 'Gournadi', 'Hizla', 'Mehendiganj', 'Muladi', 'Wazirpur'],
  'Barguna': ['Barguna Sadar', 'Amtali', 'Bamna', 'Betagi', 'Patharghata', 'Taltali'],
  'Bhola': ['Bhola Sadar', 'Borhanuddin', 'Charfasson', 'Daulatkhan', 'Lalmohan', 'Manpura', 'Tazumuddin'],
  'Jhalokathi': ['Jhalokathi Sadar', 'Kathalia', 'Nalchity', 'Rajapur'],
  'Patuakhali': ['Patuakhali Sadar', 'Bauphal', 'Dashmina', 'Dumki', 'Galachipa', 'Kalapara', 'Mirzaganj', 'Rangabali'],
  'Pirojpur': ['Pirojpur Sadar', 'Bhandaria', 'Kawkhali', 'Mathbaria', 'Nesarabad', 'Nazirpur', 'Zianagar'],
  
  // Dhaka Division Districts
  'Dhaka': ['Dhamrai', 'Dohar', 'Keraniganj', 'Nawabganj', 'Savar'],
  'Gazipur': ['Gazipur Sadar', 'Kaliakair', 'Kapasia', 'Sreepur', 'Kaliganj'],
  'Narayanganj': ['Narayanganj Sadar', 'Araihazar', 'Bandar', 'Narayanganj', 'Rupganj', 'Sonargaon'],
  'Narsingdi': ['Narsingdi Sadar', 'Belabo', 'Monohardi', 'Narsingdi', 'Palash', 'Raipura', 'Shibpur'],
  'Tangail': ['Tangail Sadar', 'Basail', 'Bhuapur', 'Delduar', 'Dhanbari', 'Ghatail', 'Gopalpur', 'Kalihati', 'Madhupur', 'Mirzapur', 'Nagarpur', 'Sakhipur', 'Dhanbari'],
  'Kishoreganj': ['Kishoreganj Sadar', 'Austagram', 'Bajitpur', 'Bhairab', 'Hossainpur', 'Itna', 'Karimganj', 'Katiadi', 'Kishoreganj', 'Mithamain', 'Nikli', 'Pakundia', 'Tarail'],
  'Manikganj': ['Manikganj Sadar', 'Daulatpur', 'Ghior', 'Harirampur', 'Manikganj Sadar', 'Saturia', 'Shivalaya', 'Singair'],
  'Munshiganj': ['Munshiganj Sadar', 'Gazaria', 'Lohajang', 'Munshiganj Sadar', 'Sirajdikhan', 'Sreenagar', 'Tongibari'],
  'Rajbari': ['Rajbari Sadar', 'Goalanda', 'Pangsha', 'Kalukhali'],
  'Madaripur': ['Madaripur Sadar', 'Kalkini', 'Madharipur', 'Rajoir', 'Shibchar'],
  'Gopalganj': ['Gopalganj Sadar', 'Kashiani', 'Kotalipara', 'Muksudpur', 'Sadar Upazila', 'Tungipara'],
  'Shariatpur': ['Shariatpur Sadar', 'Bhedarganj', 'Damudya', 'Gosairhat', 'Naria', 'Shariatpur Sadar', 'Zanjira'],
  'Faridpur': ['Faridpur Sadar', 'Alfadanga', 'Bhanga', 'Boalmari', 'Charbhadrasan', 'Faridpur Sadar', 'Madhukhali', 'Nagarkanda', 'Saltha'],
  
  // Chittagong Division Districts
  'Chittagong': ['Anwara', 'Banshkhali', 'Boalkhali', 'Chandanaish', 'Fatikchhari', 'Hathazari', 'Lohagara', 'Mirsharai', 'Patiya', 'Rangunia', 'Raozan', 'Sandwip', 'Satkania', 'Sitakunda'],
  'Comilla': ['Comilla Sadar', 'Barura', 'Brahmanpara', 'Burichang', 'Chandina', 'Chauddagram', 'Daudkandi', 'Debidwar', 'Homna', 'Laksam', 'Monohorganj', 'Muradnagar', 'Nangalkot', 'Titas'],
  'Feni': ['Feni Sadar', 'Chhagalnaiya', 'Daganbhuiyan', 'Feni Sadar', 'Fulgazi', 'Parshuram', 'Sonagazi'],
  'Brahmanbaria': ['Brahmanbaria Sadar', 'Akhaura', 'Bancharampur', 'Brahmanbaria Sadar', 'Kasba', 'Nasirnagar', 'Nabinagar', 'Sarail'],
  'Rangamati': ['Rangamati Sadar', 'Bagaichhari', 'Barkal', 'Belaichhari', 'Juraichhari', 'Kaptai', 'Langadu', 'Naniarchar', 'Rajasthali', 'Rangamati Sadar'],
  'Bandarban': ['Bandarban Sadar', 'Alikadam', 'Bandarban Sadar', 'Lama', 'Nakyangchari', 'Rowangchhari', 'Ruma', 'Thanchi'],
  'Khagrachhari': ['Khagrachhari Sadar', 'Dighinala', 'Khagrachhari Sadar', 'Laxmichhari', 'Mahalchhari', 'Manikchhari', 'Matiranga', 'Panchhari', 'Ramgarh'],
  'Cox\'s Bazar': ['Cox\'s Bazar Sadar', 'Chakoria', 'Cox\'s Bazar Sadar', 'Ekushey', 'Kutubdia', 'Maheshkhali', 'Pekua', 'Ramu', 'Teknaf', 'Ukhia'],
  'Lakshmipur': ['Lakshmipur Sadar', 'Raipur', 'Lakshmipur Sadar', 'Ramganj', 'Ramgati'],
  'Noakhali': ['Noakhali Sadar', 'Begumganj', 'Chatkhil', 'Companiganj', 'Hatiya', 'Kabirhat', 'Noakhali Sadar', 'Senbagh', 'Sonaimori'],
  'Chandpur': ['Chandpur Sadar', 'Faridganj', 'Haimchar', 'Haziganj', 'Kachua', 'Chandpur Sadar', 'Matlab', 'Shahrasti'],
  
  // Sylhet Division Districts
  'Sylhet': ['Sylhet Sadar', 'Balaganj', 'Beanibazar', 'Bishwanath', 'Companiganj', 'Fenchuganj', 'Golapganj', 'Gowainghat', 'Jaintiapur', 'Kanaighat', 'Zakiganj'],
  'Moulvibazar': ['Moulvibazar Sadar', 'Barlekha', 'Juri', 'Kamalganj', 'Kulaura', 'Moulvibazar Sadar', 'Rajnagar', 'Sreemangal'],
  'Habiganj': ['Habiganj Sadar', 'Ajmiriganj', 'Baniachang', 'Bahubal', 'Chunarughat', 'Habiganj Sadar', 'Lakhai', 'Madhabpur', 'Nabiganj'],
  'Sunamganj': ['Sunamganj Sadar', 'Bishwamvarpur', 'Chhatak', 'Dakshin Sunamganj', 'Derai', 'Dharamapasha', 'Dowarabazar', 'Jagannathpur', 'Jamalganj', 'Sullah', 'Sunamganj Sadar', 'Tahirpur'],
  
  // Rajshahi Division Districts
  'Rajshahi': ['Rajshahi Sadar', 'Bagha', 'Charghat', 'Durgapur', 'Godagari', 'Mohanpur', 'Paba', 'Puthia'],
  'Chapai Nawabganj': ['Chapai Nawabganj Sadar', 'Bholahat', 'Gomastapur', 'Nachole', 'Niamatpur', 'Shibganj'],
  'Natore': ['Natore Sadar', 'Bagatipara', 'Baraigram', 'Gurudaspur', 'Lalpur', 'Natore Sadar', 'Singra'],
  'Naogaon': ['Naogaon Sadar', 'Atrai', 'Badalgachhi', 'Dhamoirhat', 'Manda', 'Mohadevpur', 'Naogaon Sadar', 'Niamatpur', 'Patnitala', 'Porsha', 'Raninagar', 'Sapahar'],
  'Pabna': ['Pabna Sadar', 'Atgharia', 'Bera', 'Bhangura', 'Chatmohar', 'Faridpur', 'Ishwardi', 'Pabna Sadar', 'Sujanagar'],
  'Bogura': ['Bogura Sadar', 'Adamdighi', 'Dhunat', 'Dupchanchia', 'Gabtali', 'Kahaloo', 'Nandigram', 'Shibganj', 'Sherpur', 'Shajahanpur', 'Sonatala'],
  'Sirajganj': ['Sirajganj Sadar', 'Belkuchi', 'Chauhali', 'Kamarkhand', 'Kazipur', 'Raiganj', 'Shahjadpur', 'Sirajganj Sadar', 'Ullapara'],
  'Joypurhat': ['Joypurhat Sadar', 'Akkelpur', 'Joypurhat Sadar', 'Kalai', 'Khetlal', 'Panchbibi'],
  
  // Khulna Division Districts
  'Khulna': ['Khulna Sadar', 'Batiaghata', 'Dacope', 'Dumuria', 'Digholia', 'Koyra', 'Paikgacha', 'Phultala', 'Rupsa', 'Terokhada'],
  'Bagerhat': ['Bagerhat Sadar', 'Chitalmari', 'Fakirhat', 'Kachua', 'Mollahat', 'Mongla', 'Morrelganj', 'Rampal', 'Sarankhola'],
  'Chuadanga': ['Chuadanga Sadar', 'Alamdanga', 'Chuadanga Sadar', 'Jibannagar', 'Damurhuda'],
  'Jessore': ['Jessore Sadar', 'Abhaynagar', 'Bagherpara', 'Chaugachha', 'Jessore Sadar', 'Jhikargachha', 'Keshabpur', 'Manirampur', 'Sharsha'],
  'Jhenaidah': ['Jhenaidah Sadar', 'Harinakunda', 'Jhenaidah Sadar', 'Kaliganj', 'Kotchandpur', 'Maheshpur', 'Shailkupa'],
  'Kushtia': ['Kushtia Sadar', 'Bheramara', 'Daulatpur', 'Khoksa', 'Kumarkhali', 'Kushtia Sadar', 'Mirpur'],
  'Magura': ['Magura Sadar', 'Magura Sadar', 'Mohammadpur', 'Shalikha', 'Sreepur'],
  'Meherpur': ['Meherpur Sadar', 'Gangni', 'Meherpur Sadar', 'Mujibnagar'],
  'Narail': ['Narail Sadar', 'Kalia', 'Lohagara', 'Narail Sadar'],
  'Satkhira': ['Satkhira Sadar', 'Assasuni', 'Debhata', 'Kalaroa', 'Satkhira Sadar', 'Shyamnagar', 'Tala', 'Kaliganj'],
  
  // Barishal Division Districts (already included above)
  
  // Rangpur Division Districts
  'Rangpur': ['Rangpur Sadar', 'Badarganj', 'Gangachara', 'Kaunia', 'Rangpur Sadar', 'Mithapukur', 'Pirganj', 'Pirgachha', 'Taraganj'],
  'Dinajpur': ['Dinajpur Sadar', 'Birampur', 'Birganj', 'Bochaganj', 'Chirirbandar', 'Phulbari', 'Dinajpur Sadar', 'Ghoraghat', 'Hakimpur', 'Kaharole', 'Khansama', 'Nawabganj', 'Parbatipur'],
  'Gaibandha': ['Gaibandha Sadar', 'Fulchhari', 'Gobindaganj', 'Gaibandha Sadar', 'Palashbari', 'Sadullapur', 'Sughatta'],
  'Kurigram': ['Kurigram Sadar', 'Bhurungamari', 'Char Rajibpur', 'Chilmari', 'Phulbari', 'Kurigram Sadar', 'Nageshwari', 'Rajarhat', 'Raomari', 'Ulipur'],
  'Lalmonirhat': ['Lalmonirhat Sadar', 'Aditmari', 'Hatibandha', 'Kaliganj', 'Lalmonirhat Sadar', 'Patgram'],
  'Nilphamari': ['Nilphamari Sadar', 'Dimla', 'Domar', 'Jaldhaka', 'Kishoreganj', 'Nilphamari Sadar', 'Syedpur'],
  'Panchagarh': ['Panchagarh Sadar', 'Atwari', 'Boda', 'Debiganj', 'Panchagarh Sadar', 'Tetulia'],
  'Thakurgaon': ['Thakurgaon Sadar', 'Baliadangi', 'Haripur', 'Pirganj', 'Ranisankail', 'Thakurgaon Sadar'],
  
  // Mymensingh Division Districts
  'Mymensingh': ['Mymensingh Sadar', 'Bhaluka', 'Dhobaura', 'Fulbaria', 'Gaffargaon', 'Gauripur', 'Haluaghat', 'Ishwarganj', 'Muktagachha', 'Mymensingh Sadar', 'Nandail', 'Phulpur', 'Trishal'],
  'Jamalpur': ['Jamalpur Sadar', 'Bakshiganj', 'Dewanganj', 'Islampur', 'Jamalpur Sadar', 'Madarganj', 'Melandaha', 'Sarishabari'],
  'Netrokona': ['Netrokona Sadar', 'Atpara', 'Barhatta', 'Durgapur', 'Kalmakanda', 'Kendua', 'Madan', 'Khaliajuri', 'Mohanganj', 'Netrokona Sadar', 'Purbadhala'],
  'Sherpur': ['Sherpur Sadar', 'Jhenaigati', 'Nakla', 'Nalitabari', 'Sherpur Sadar', 'Sreebardi']
};

interface SearchFilters {
  bloodGroup: string;
  division: string;
  district: string;
  upazila: string;
  lastDonationDate: Date | undefined;
  isAvailable: string;
  eligibility: string;
}

interface AirbnbSearchBarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  resetAllFilters: () => void;
  isSticky?: boolean;
  className?: string;
  searchResults?: any[];
  showResults?: boolean;
}

const AirbnbSearchBar: React.FC<AirbnbSearchBarProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  resetAllFilters,
  isSticky = false,
  className = '',
  searchResults = [],
  showResults = false
}) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLButtonElement>(null);
  const eligibilityRef = useRef<HTMLButtonElement>(null);
  const isSelectOpenRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check for mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle filter changes with immediate effect
  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    // Convert "any" back to empty string for filtering
    const filterValue = value === 'any' ? '' : value;
    const newFilters = { ...filters, [key]: filterValue };
    
    // Reset dependent fields when parent changes
    if (key === 'division') {
      newFilters.district = '';
      newFilters.upazila = '';
    } else if (key === 'district') {
      newFilters.upazila = '';
    }
    
    onFiltersChange(newFilters);
  };

  // Get available options based on selections
  const availableDistricts = filters.division ? districts[filters.division] || [] : [];
  const availableUpazilas = filters.district ? upazilas[filters.district] || [] : [];

  // Clear all filters
  const clearFilters = () => {
    resetAllFilters();
    setActiveSection(null);
    if (isMobile) {
      setShowMobileModal(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    onSearch();
    setActiveSection(null);
    if (isMobile) {
      setShowMobileModal(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        // Don't close popup if a Select dropdown is open
        if (isSelectOpenRef.current) return;
        
        // Add a small delay to prevent rapid closing
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          setActiveSection(null);
        }, 100);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Get active filter count
  const activeFilterCount = Object.values(filters).filter(value => 
    value !== '' && value !== undefined
  ).length;

  // Desktop Search Bar
  const DesktopSearchBar = () => (
    <div
      ref={searchBarRef}
      className={`bg-white rounded-full shadow-lg border border-gray-200 p-2 ${className}`}
    >
      <div className="flex items-center">
        {/* Blood Group Section */}
        <div className="flex-1 min-w-0">
          <button
            onClick={() => setActiveSection(activeSection === 'bloodGroup' ? null : 'bloodGroup')}
            className={`w-full text-left px-6 py-4 rounded-full transition-all duration-200 hover:bg-gray-50 ${
              activeSection === 'bloodGroup' ? 'bg-white shadow-md' : ''
            }`}
            aria-label="Select blood group"
            aria-expanded={activeSection === 'bloodGroup'}
          >
            <div className="flex items-center space-x-3">
              <Droplet className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                  Blood Group
                </div>
                <div className="text-sm text-gray-600 truncate">
                  {filters.bloodGroup || 'Select blood type'}
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                activeSection === 'bloodGroup' ? 'rotate-180' : ''
              }`} />
            </div>
          </button>
          
          {activeSection === 'bloodGroup' && (
            <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 z-50 w-64 transition-opacity duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid grid-cols-4 gap-2">
                {bloodGroups.map((group) => (
                  <button
                    key={group}
                    onClick={() => {
                      handleFilterChange('bloodGroup', group);
                      setActiveSection(null);
                      onSearch();
                    }}
                    className={`p-2 rounded-lg border-2 transition-all hover:border-red-300 hover:bg-red-50 ${
                      filters.bloodGroup === group
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="font-semibold text-sm">{group}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="w-px h-8 bg-gray-300" />
        
        {/* Location Section */}
        <div className="flex-1 min-w-0 relative">
          
          <button
            ref={locationRef}
            onClick={() => setActiveSection(activeSection === 'location' ? null : 'location')}
            className={`w-full text-left px-6 py-4 rounded-full transition-all duration-200 hover:bg-gray-50 ${
              activeSection === 'location' ? 'bg-white shadow-md' : ''
            }`}
            aria-label="Select location"
            aria-expanded={activeSection === 'location'}
          >
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                  Location
                </div>
                <div className="text-sm text-gray-600 truncate">
                  {filters.upazila || filters.district || filters.division || 'Any location'}
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                activeSection === 'location' ? 'rotate-180' : ''
              }`} />
            </div>
          </button>
          
          {activeSection === 'location' && (
            <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 z-50 w-64 transition-opacity duration-200"
              style={{ left: locationRef.current ? locationRef.current.offsetLeft : 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Division
                  </label>
                  <Select 
                    value={filters.division} 
                    onValueChange={(value) => handleFilterChange('division', value)}
                    onOpenChange={(open) => {
                      isSelectOpenRef.current = open;
                    }}
                  >
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder="Select division" />
                    </SelectTrigger>
                    <SelectContent>
                      {divisions.map((division) => (
                        <SelectItem key={division} value={division}>
                          {division}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {filters.division && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      District
                    </label>
                    <Select 
                      value={filters.district} 
                      onValueChange={(value) => handleFilterChange('district', value)}
                      onOpenChange={(open) => {
                        isSelectOpenRef.current = open;
                      }}
                    >
                      <SelectTrigger className="w-full h-10">
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        {districts[filters.division].map((district: string) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {filters.district && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upazila
                    </label>
                    <Select 
                      value={filters.upazila} 
                      onValueChange={(value) => handleFilterChange('upazila', value)}
                      onOpenChange={(open) => {
                        isSelectOpenRef.current = open;
                      }}
                    >
                      <SelectTrigger className="w-full h-10">
                        <SelectValue placeholder="Select upazila" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUpazilas.length > 0 ? (
                          availableUpazilas.map((upazila: string) => (
                            <SelectItem key={upazila} value={upazila}>
                              {upazila}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem disabled value="">
                            No upazilas available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {/* Action buttons */}
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setActiveSection(null);
                      isSelectOpenRef.current = false;
                    }}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => {
                      handleSearch();
                      isSelectOpenRef.current = false;
                    }}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Apply Filter
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="w-px h-8 bg-gray-300" />
        
        {/* Eligibility Section */}
        <div className="flex-1 min-w-0 relative">
          <button
            ref={eligibilityRef}
            onClick={() => setActiveSection(activeSection === 'eligibility' ? null : 'eligibility')}
            className={`w-full text-left px-6 py-4 rounded-full transition-all duration-200 hover:bg-gray-50 ${
              activeSection === 'eligibility' ? 'bg-white shadow-md' : ''
            }`}
            aria-label="Select eligibility criteria"
            aria-expanded={activeSection === 'eligibility'}
          >
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                  Eligibility
                </div>
                <div className="text-sm text-gray-600 truncate">
                  {filters.eligibility 
                    ? filters.eligibility === 'eligible' ? 'Eligible donors' : 'Not eligible donors'
                    : filters.isAvailable === 'true' 
                      ? 'Available only'
                      : filters.isAvailable === 'false'
                        ? 'Include unavailable'
                        : 'All donors'
                  }
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                activeSection === 'eligibility' ? 'rotate-180' : ''
              }`} />
            </div>
          </button>
          
          {activeSection === 'eligibility' && (
            <div className="absolute top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 z-50 w-80 transition-opacity duration-200"
              style={{ left: eligibilityRef.current ? eligibilityRef.current.offsetLeft : 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Eligibility Status
                  </label>
                  <Select 
                    value={filters.eligibility} 
                    onValueChange={(value) => handleFilterChange('eligibility', value)}
                    onOpenChange={(open) => {
                      isSelectOpenRef.current = open;
                    }}
                  >
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder="Any status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="eligible">Eligible</SelectItem>
                      <SelectItem value="not-eligible">Not Eligible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Availability
                  </label>
                  <Select 
                    value={filters.isAvailable} 
                    onValueChange={(value) => handleFilterChange('isAvailable', value)}
                    onOpenChange={(open) => {
                      isSelectOpenRef.current = open;
                    }}
                  >
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder="Any status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="true">Available</SelectItem>
                      <SelectItem value="false">Not Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Action buttons */}
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setActiveSection(null);
                      isSelectOpenRef.current = false;
                    }}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => {
                      handleSearch();
                      isSelectOpenRef.current = false;
                    }}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Apply Filter
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Search Button */}
        <Button
          onClick={handleSearch}
          size="lg"
          className="flex-shrink-0 bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 ml-3"
          aria-label="Search for donors"
          style={{ minWidth: '56px', maxWidth: '56px', height: '56px' }}
        >
          <Search className="w-5 h-5 mx-auto" />
        </Button>
      </div>
    </div>
  );

  // Mobile Floating Button
  const MobileFloatingButton = () => (
    <button
      onClick={() => setShowMobileModal(true)}
      className="fixed bottom-6 left-4 right-4 bg-white rounded-2xl shadow-lg border border-gray-200 p-4 z-40 mx-auto max-w-sm transition-transform duration-200 hover:scale-[1.02]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <Search className="w-5 h-5 text-gray-600 flex-shrink-0" />
          <div className="text-left min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900 truncate">
              {filters.bloodGroup || 'Find donors'}
            </div>
            <div className="text-xs text-gray-600 truncate">
              {filters.district || 'Any location'} • {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
      </div>
    </button>
  );

  // Mobile Modal
  const MobileModal = () => (
    <>
      {showMobileModal && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Find Donors</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileModal(false)}
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <div className="p-4 space-y-6">
            {/* Blood Group */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Blood Group *
              </label>
              <div className="grid grid-cols-4 gap-3">
                {bloodGroups.map((group) => (
                  <button
                    key={group}
                    onClick={() => handleFilterChange('bloodGroup', group)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      filters.bloodGroup === group
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="font-semibold">{group}</div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Location */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Location
              </label>
              
              <div>
                <label className="block text-xs text-gray-600 mb-2">Division</label>
                <Select 
                  value={filters.division} 
                  onValueChange={(value) => handleFilterChange('division', value)}
                  onOpenChange={(open) => {
                    isSelectOpenRef.current = open;
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select division" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map((division) => (
                      <SelectItem key={division} value={division}>
                        {division}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {filters.division && (
                <div>
                  <label className="block text-xs text-gray-600 mb-2">District</label>
                  <Select 
                    value={filters.district} 
                    onValueChange={(value) => handleFilterChange('district', value)}
                    onOpenChange={(open) => {
                      isSelectOpenRef.current = open;
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts[filters.division].map((district: string) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {filters.district && (
                <div>
                  <label className="block text-xs text-gray-600 mb-2">Upazila</label>
                  <Select 
                    value={filters.upazila} 
                    onValueChange={(value) => handleFilterChange('upazila', value)}
                    onOpenChange={(open) => {
                      isSelectOpenRef.current = open;
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select upazila" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUpazilas.length > 0 ? (
                        availableUpazilas.map((upazila: string) => (
                          <SelectItem key={upazila} value={upazila}>
                            {upazila}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem disabled value="">
                          No upazilas available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            {/* Eligibility */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Eligibility Criteria
              </label>
              
              <div>
                <label className="block text-xs text-gray-600 mb-2">Eligibility Status</label>
                <Select 
                  value={filters.eligibility} 
                  onValueChange={(value) => handleFilterChange('eligibility', value)}
                  onOpenChange={(open) => {
                    isSelectOpenRef.current = open;
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="eligible">Eligible</SelectItem>
                    <SelectItem value="not-eligible">Not Eligible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-2">Availability Status</label>
                <Select 
                  value={filters.isAvailable} 
                  onValueChange={(value) => handleFilterChange('isAvailable', value)}
                  onOpenChange={(open) => {
                    isSelectOpenRef.current = open;
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="true">Available</SelectItem>
                    <SelectItem value="false">Not Available</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
            <div className="flex space-x-3">
              <Button variant="outline" onClick={clearFilters} className="flex-1">
                Clear filters
              </Button>
              <Button onClick={handleSearch} className="flex-1 bg-red-600 hover:bg-red-700">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Search Results Section
  const SearchResultsSection = () => {
    if (!showResults || !filters.bloodGroup) return null;
    
    return (
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Search Results
            </h3>
            <p className="text-sm text-gray-600">
              Found {searchResults.length} donor{searchResults.length !== 1 ? 's' : ''} with blood group {filters.bloodGroup}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Clear all filters</span>
          </Button>
        </div>
      </div>
    );
  };

  // Step indicators component
  const StepIndicators = () => {
    const steps = [
      { id: 'blood', label: 'Choose blood group' },
      { id: 'location', label: 'Choose Location' },
      { id: 'eligibility', label: 'Choose Eligibility' },
      { id: 'availability', label: 'Choose Availability' },
      { id: 'results', label: 'Find Suitable Donor' }
    ];
    
    // Determine current step
    const currentStep = filters.bloodGroup ? 
      (filters.division || filters.district || filters.upazila ? 
        (filters.eligibility || filters.isAvailable ? 
          (filters.eligibility && filters.isAvailable ? 'results' : 'availability') 
          : 'eligibility') 
        : 'location') 
      : 'blood';
    
    return (
      <div className="flex items-center justify-center mt-4 mb-6">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                currentStep === step.id || 
                (steps.findIndex(s => s.id === currentStep) > index) 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                <span className="text-sm font-medium">{index + 1}</span>
              </div>
              <span className={`text-sm font-medium ${
                currentStep === step.id ? 'text-red-600' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-10 h-1 mx-2 ${
                steps.findIndex(s => s.id === currentStep) > index 
                  ? 'bg-red-600' 
                  : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  if (isMobile) {
    return (
      <>
        <MobileFloatingButton />
        <MobileModal />
        <SearchResultsSection />
      </>
    );
  }

  return (
    <div className={`relative ${isSticky ? 'sticky top-4 z-30' : ''}`}>
      <DesktopSearchBar />
      <SearchResultsSection />
    </div>
  );
};

export default AirbnbSearchBar;