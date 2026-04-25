import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Loader from '@/components/ui/Loader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import DonorCard from '@/components/DonorCard';
import ContactModal from '@/components/ContactModal';
import EmergencyModal from '@/components/EmergencyModal';
import AirbnbSearchBar from '@/components/AirbnbSearchBar';
import { Search as SearchIcon, Filter, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation } from 'wouter';

interface SearchFilters {
  bloodGroup: string;
  division: string;
  district: string;
  upazila: string;
  lastDonationDate: Date | undefined;
  isAvailable: string;
  eligibility: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function Search() {
  const [location, setLocation] = useLocation();
  const [filters, setFilters] = useState<SearchFilters>({
    bloodGroup: '',
    division: '',
    district: '',
    upazila: '',
    lastDonationDate: undefined,
    isAvailable: '',
    eligibility: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('nearest');
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<any>(null);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [searchTriggered, setSearchTriggered] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const debouncedFilters = useDebounce(filters, 500);
  const itemsPerPage = 9;
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialFilters: SearchFilters = {
      bloodGroup: urlParams.get('bloodGroup') || '',
      division: urlParams.get('division') || '',
      district: urlParams.get('district') || '',
      upazila: urlParams.get('upazila') || '',
      lastDonationDate: urlParams.get('lastDonationDate') ? new Date(urlParams.get('lastDonationDate')!) : undefined,
      isAvailable: urlParams.get('isAvailable') || '',
      eligibility: urlParams.get('eligibility') || ''
    };
    setFilters(initialFilters);
    if (urlParams.get('page')) {
      setCurrentPage(parseInt(urlParams.get('page')!) || 1);
    }
    if (initialFilters.bloodGroup || initialFilters.district || initialFilters.isAvailable) {
      setSearchTriggered(true);
    }
  }, []);
  
  useEffect(() => {
    if (!searchTriggered) return;
    
    const params = new URLSearchParams();
    if (debouncedFilters.bloodGroup) params.set('bloodGroup', debouncedFilters.bloodGroup);
    if (debouncedFilters.division) params.set('division', debouncedFilters.division);
    if (debouncedFilters.district) params.set('district', debouncedFilters.district);
    if (debouncedFilters.upazila) params.set('upazila', debouncedFilters.upazila);
    if (debouncedFilters.lastDonationDate) params.set('lastDonationDate', debouncedFilters.lastDonationDate.toISOString());
    if (debouncedFilters.isAvailable) params.set('isAvailable', debouncedFilters.isAvailable);
    if (debouncedFilters.eligibility) params.set('eligibility', debouncedFilters.eligibility);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    const newUrl = params.toString() ? `/search?${params.toString()}` : '/search';
    window.history.replaceState(null, '', newUrl);
  }, [debouncedFilters, currentPage, searchTriggered]);
  
  useEffect(() => {
    if (resultsRef.current && (searchTriggered || filters.bloodGroup)) {
      resultsRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [currentPage, searchTriggered, filters.bloodGroup]);
  
  const { data: donorsData, isLoading } = useQuery({
    queryKey: ['/api/donors/search', { ...debouncedFilters, page: currentPage, limit: itemsPerPage }],
    queryFn: async () => {
      if (!searchTriggered) {
        return { donors: [], total: 0 };
      }
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(debouncedFilters.bloodGroup && { bloodGroup: debouncedFilters.bloodGroup }),
        ...(debouncedFilters.district && { district: debouncedFilters.district }),
        ...(debouncedFilters.isAvailable && { isAvailable: debouncedFilters.isAvailable }),
        ...(debouncedFilters.eligibility && { eligibility: debouncedFilters.eligibility }),
      });
      
      const response = await fetch(`/api/donors/search?${params}`);
      if (!response.ok) throw new Error('Failed to fetch donors');
      return response.json();
    },
    enabled: searchTriggered && (!!debouncedFilters.bloodGroup || !!debouncedFilters.district || !!debouncedFilters.isAvailable || !!debouncedFilters.eligibility),
  });
  
  const donors = donorsData?.donors || [];
  const totalDonors = donorsData?.total || 0;
  
  const handleFiltersChange = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);
  
  const handleSearch = useCallback(() => {
    setSearchTriggered(true);
    setCurrentPage(1);
  }, []);
  
  const resetAllFilters = useCallback(() => {
    const emptyFilters: SearchFilters = {
      bloodGroup: '',
      division: '',
      district: '',
      upazila: '',
      lastDonationDate: undefined,
      isAvailable: '',
      eligibility: ''
    };
    setFilters(emptyFilters);
    setCurrentPage(1);
    setSearchTriggered(false);
    window.history.replaceState(null, '', '/search');
  }, []);
  
  const clearFilters = () => {
    resetAllFilters();
  };
  
  const totalPages = Math.ceil(totalDonors / itemsPerPage);
  
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    
    buttons.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
    );
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(i)}
          className={i === currentPage ? "bg-primary text-white" : ""}
        >
          {i}
        </Button>
      );
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis" className="px-2 text-gray-500">...</span>
        );
      }
      buttons.push(
        <Button
          key={totalPages}
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }
    
    buttons.push(
      <Button
        key="next"
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    );
    
    return buttons;
  };
  
  const StepIndicators = () => {
    const steps = [
      { id: 'blood', label: 'Choose blood group' },
      { id: 'location', label: 'Choose Location' },
      { id: 'eligibility', label: 'Choose Eligibility' },
      { id: 'availability', label: 'Choose Availability' },
      { id: 'results', label: 'Find Suitable Donor' }
    ];
    
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
  
  const ReadyToFindDonorsWithSteps = () => (
    <div className="text-center mt-12 mb-8">
      <StepIndicators />
    </div>
  );
  
  return (
    // Keeps background covering the white space perfectly
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 -mt-[100px] pt-[80px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* FIX: Increased pt-8 to pt-12 to add proper white space below the navbar */}
        <div className="pt-20 pb-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Blood Donors</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
              Connect with verified blood donors in your area through our intelligent matching system
            </p>
            <Button 
              onClick={() => setEmergencyModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <AlertTriangle className="w-5 h-5 mr-2" />
              Emergency Request
            </Button>
          </div>
        </div>
        
        {/* Airbnb-style Search Bar */}
        <div className="mb-12">
          <AirbnbSearchBar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onSearch={handleSearch}
            resetAllFilters={resetAllFilters}
            isSticky={true}
            className="max-w-5xl mx-auto"
          />
        </div>
        
        {/* Search Results Section */}
        <div ref={resultsRef}>
          {(searchTriggered || filters.bloodGroup) && (
            <div className="mb-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">
                      {isLoading ? (
                        'Searching for donors...'
                      ) : (
                        <>Found {totalDonors} donor{totalDonors !== 1 ? 's' : ''}</>
                      )}
                    </h2>
                    <p className="text-gray-600">
                      {filters.bloodGroup && `Blood type ${filters.bloodGroup}`}
                      {filters.district && ` in ${filters.district}`}
                      {filters.division && !filters.district && ` in ${filters.division}`}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Sort by:</span>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nearest">Nearest First</SelectItem>
                          <SelectItem value="recent">Most Recent</SelectItem>
                          <SelectItem value="rating">Highest Rated</SelectItem>
                          <SelectItem value="donations">Most Donations</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {(filters.bloodGroup || filters.district || filters.division || filters.eligibility || filters.isAvailable) && (
                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {!searchTriggered && !filters.bloodGroup ? (
            <div className="text-center py-20">
              <SearchIcon className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Ready to find donors?</h3>
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                Use the search bar above to find blood donors in your area. Start by selecting a blood group.
              </p>
              
              <ReadyToFindDonorsWithSteps />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-md mx-auto">
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => (
                  <button
                    key={group}
                    onClick={() => {
                      handleFiltersChange({ ...filters, bloodGroup: group });
                      handleSearch();
                    }}
                    className="p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200 font-semibold text-gray-800 hover:text-red-700"
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center items-center py-20 mb-8">
              <Loader />
            </div>
          ) : donors.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {donors.map((donor: any) => (
                  <DonorCard
                    key={donor.id}
                    donor={donor}
                    onContactClick={() => {
                      setSelectedDonor(donor);
                      setContactModalOpen(true);
                    }}
                  />
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="flex justify-center pb-12">
                  <nav className="flex items-center space-x-2">
                    {renderPaginationButtons()}
                  </nav>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No donors found</h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any donors matching your criteria. Try adjusting your filters or expanding your search area.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={clearFilters} variant="outline">
                    Clear All Filters
                  </Button>
                  <Button onClick={() => setEmergencyModalOpen(true)} className="bg-red-600 hover:bg-red-700">
                    Create Emergency Request
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <ContactModal 
        open={contactModalOpen}
        onOpenChange={(open) => {
          setContactModalOpen(open);
          if (!open) setSelectedDonor(null);
        }}
        donor={selectedDonor}
      />
      
      <EmergencyModal 
        open={emergencyModalOpen}
        onOpenChange={setEmergencyModalOpen}
      />
    </div>
  );
}