import React, { useState, useEffect, useRef, ChangeEvent, useCallback } from 'react';

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
}

const AddressInput: React.FC<AddressInputProps> = ({ value, onChange }) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
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

  

  useEffect(() => {
    const input = inputRef.current;
    if (input) {
      input.addEventListener('input', handleInput as any);
    }

    return () => {
      if (input) {
        input.removeEventListener('input', handleInput as any);
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [handleInput]);

  const handleSelectSuggestion = (suggestion: any) => {
    onChange(suggestion.display_name);
    setSuggestions([]);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="text"
        className="input input-bordered"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.place_id}
              onClick={() => handleSelectSuggestion(suggestion)}
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
