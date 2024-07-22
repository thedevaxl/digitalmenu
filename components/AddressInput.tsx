import React, { useState, useEffect, useRef, ChangeEvent, useCallback } from 'react';

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
}

const AddressInput: React.FC<AddressInputProps> = ({ value, onChange }) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = async (inputValue: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(inputValue)}&format=json&addressdetails=1`
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Failed to fetch address suggestions:', error);
    }
  };

  const debouncedFetchSuggestions = useCallback((inputValue: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(inputValue);
    }, 300);
  }, []);

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    if (inputValue.length >= 3) {
      debouncedFetchSuggestions(inputValue);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (suggestion: any) => {
    onChange(suggestion.display_name);
    setSuggestions([]);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div>
      <input
        type="text"
        className="input input-bordered"
        value={value}
        onChange={handleInput}
      />
      {suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.place_id}
              onClick={() => handleSelectSuggestion(suggestion)}
              className="cursor-pointer"
            >
              {suggestion.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressInput;
