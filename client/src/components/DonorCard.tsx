import React from 'react';
import { User } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Star, Phone, Eye } from 'lucide-react';
import { formatRating, isEligibleToDonate, calculateDaysSinceLastDonation } from '@/lib/utils';

interface DonorCardProps {
  donor: User;
  onContactClick: () => void;
  onViewProfile?: () => void;
}

export default function DonorCard({ donor, onContactClick, onViewProfile }: DonorCardProps) {
  // DEBUGGING: Log the received donor data to the console.
  // Open your browser's developer tools (F12) and check the console tab.
  // If 'district' or 'upazila' are missing here, the issue is in your data fetching logic.
  console.log('DonorCard received data:', donor);

  const displayName = donor.fullName || 'Unknown Donor';
  
  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvailabilityStatus = () => {
    // NOTE: Your schema has both 'lastDonation' and 'lastDonationDate'.
    // The component uses 'lastDonationDate'. Ensure your data fetching provides this field.
    if (!donor.isAvailable) return { label: 'Unavailable', variant: 'secondary' as const };
    
    const eligible = isEligibleToDonate(donor.lastDonationDate);
    if (eligible) return { label: 'Available', variant: 'default' as const };
    
    const daysRemaining = 120 - calculateDaysSinceLastDonation(donor.lastDonationDate);
    return { label: `${daysRemaining} days`, variant: 'outline' as const };
  };

  const availabilityStatus = getAvailabilityStatus();

  // --- FIXES ---

  // 1. FIX for Age: Use the pre-calculated 'age' integer from the schema.
  // This is much more reliable than parsing the 'dateOfBirth' text string on the client.
  const displayAge = donor.age ?? 'Unknown';

  // 2. FIX for Location: The schema defines 'district' and 'upazila' as text fields.
  // The logic is correct, but if these show as 'Unknown', it means the data
  // isn't being populated from your database into the 'donor' object.
  const displayLocation = `${donor.district ?? 'Unknown'}, ${donor.upazila ?? 'Unknown'}`;

  // --- END FIXES ---

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
      <div className="flex items-start space-x-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={donor.profilePicture || undefined} alt={displayName} />
          <AvatarFallback className="bg-gray-100 text-gray-600">
            {getUserInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-grow">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-gray-900">{displayName}</h3>
            <Badge 
              variant={availabilityStatus.variant}
              className={availabilityStatus.variant === 'default' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
            >
              {availabilityStatus.label}
            </Badge>
            {donor.isVerified && (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                <Heart className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          
          {/* Updated to use the new display variables */}
          <p className="text-sm text-gray-600 mb-2">
            Age: {displayAge} • {displayLocation}
          </p>
          
          <div className="flex items-center space-x-4 text-sm">
            <span className="font-bold text-primary text-lg">{donor.bloodGroup || 'Unknown'}</span>
            <span className="text-gray-600">
              <Heart className="w-4 h-4 inline mr-1 text-primary" />
              {donor.donationCount || 0} donations
            </span>
            <div className="flex items-center">
              <div className="flex text-yellow-500 mr-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3 h-3 ${i < Math.floor((donor.rating ?? 0) / 10) ? 'fill-current' : ''}`} 
                  />
                ))}
              </div>
              <span className="text-gray-600">{formatRating(donor.rating ?? 0)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex space-x-2">
        <Button
          onClick={onContactClick}
          className="flex-1 bg-primary text-white hover:bg-red-700 transition-colors text-sm"
          size="sm"
        >
          <Phone className="w-4 h-4 mr-2" />
          Get Contact Details
        </Button>
        {onViewProfile && (
          <Button
            onClick={onViewProfile}
            variant="outline"
            size="sm"
            className="px-4"
          >
            <Eye className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}