import React, { useEffect, useState } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import { colors } from '../../config/colors';
import { toast } from 'sonner';

interface LocationSearchProps {
  onLocationSelect: (location: {
    address: string;
    lat: number;
    lng: number;
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  }) => void;
  initialValue?: string;
  className?: string;
}

export default function LocationSearch({ onLocationSelect, initialValue = '', className = '' }: LocationSearchProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(initialValue);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: 'pl' },
      types: ['address']
    },
    debounce: 300,
    defaultValue: initialValue
  });

  useEffect(() => {
    // Load Google Maps JavaScript API script
    if (!document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places&language=pl`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsScriptLoaded(true);
      document.head.appendChild(script);
    } else {
      setIsScriptLoaded(true);
    }
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setSelectedAddress(e.target.value);
  };

  const handleSelect = async (suggestion: google.maps.places.AutocompletePrediction) => {
    setValue(suggestion.description, false);
    setSelectedAddress(suggestion.description);
    clearSuggestions();

    try {
      const results = await getGeocode({ address: suggestion.description });
      const { lat, lng } = await getLatLng(results[0]);
      
      // Extract address components
      const addressComponents = results[0].address_components;
      let street = '', city = '', postalCode = '', country = '';
      
      for (const component of addressComponents) {
        const types = component.types;
        
        if (types.includes('street_number') || types.includes('route')) {
          street = street ? `${street} ${component.long_name}` : component.long_name;
        }
        if (types.includes('locality')) {
          city = component.long_name;
        }
        if (types.includes('postal_code')) {
          postalCode = component.long_name;
        }
        if (types.includes('country')) {
          country = component.long_name;
        }
      }

      onLocationSelect({
        address: suggestion.description,
        lat,
        lng,
        street,
        city,
        postalCode,
        country
      });
    } catch (error) {
      console.error('Error getting geocode:', error);
      toast.error('Nie udało się pobrać współrzędnych dla tego adresu');
    }
  };

  const openInGoogleMaps = () => {
    if (selectedAddress) {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedAddress)}`;
      window.open(mapsUrl, '_blank');
    }
  };

  if (!isScriptLoaded || !ready) {
    return (
      <div className={`${colors.form.input} flex items-center`}>
        <MapPin className="w-5 h-5 text-gray-400 mr-2" />
        <span className="text-gray-400">Ładowanie...</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative flex items-center">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={value}
          onChange={handleInput}
          className={`${colors.form.input} pl-10 pr-10`}
          placeholder="Wpisz adres..."
        />
        {selectedAddress && (
          <button
            type="button"
            onClick={openInGoogleMaps}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            title="Otwórz w Google Maps"
          >
            <ExternalLink className="w-5 h-5" />
          </button>
        )}
      </div>

      {status === 'OK' && (
        <ul className={`absolute z-50 w-full mt-1 ${colors.bg.secondary} border ${colors.border.primary} rounded-lg shadow-lg max-h-60 overflow-y-auto`}>
          {data.map((suggestion) => (
            <li
              key={suggestion.place_id}
              onClick={() => handleSelect(suggestion)}
              className="px-4 py-2 hover:bg-gray-800 cursor-pointer text-gray-300 hover:text-white transition-colors"
            >
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{suggestion.description}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}