import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';

interface GoogleAddressInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const bangladeshLocations = [
  'Dhanmondi, Dhaka', 'Gulshan, Dhaka', 'Uttara, Dhaka', 'Wari, Dhaka',
  'Shahbag, Dhaka', 'Mirpur, Dhaka', 'Mohammadpur, Dhaka', 'Farmgate, Dhaka',
  'Agrabad, Chittagong', 'Nasirabad, Chittagong', 'Zindabazar, Sylhet',
  'Shahporan, Sylhet', 'Rajpara, Rajshahi', 'Boalia, Rajshahi',
  'Kazir Dewri, Chittagong', 'Pahartali, Chittagong', 'Tilagor, Sylhet'
];

export default function GoogleAddressInput({ value, onChange, placeholder, className }: GoogleAddressInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);
    
    if (inputValue.length > 1) {
      const filtered = bangladeshLocations.filter(location =>
        location.toLowerCase().includes(inputValue.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className={className}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onFocus={() => value.length > 1 && setSuggestions(bangladeshLocations.filter(loc => loc.toLowerCase().includes(value.toLowerCase())).slice(0, 5))}
        />
        <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
      
      {showSuggestions && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
              onClick={() => selectSuggestion(suggestion)}
            >
              <div className="flex items-center">
                <MapPin className="h-3 w-3 text-gray-400 mr-2" />
                {suggestion}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}