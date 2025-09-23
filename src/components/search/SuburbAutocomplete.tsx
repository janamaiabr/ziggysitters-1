import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock Auckland suburbs data
const aucklandSuburbs = [
  'Ponsonby', 'Newmarket', 'Mount Eden', 'Parnell', 'Remuera', 'Epsom',
  'Grey Lynn', 'Freemans Bay', 'Herne Bay', 'Saint Marys Bay', 'Grafton',
  'Eden Terrace', 'Newton', 'Kingsland', 'Morningside', 'Saint Lukes',
  'Mount Albert', 'Sandringham', 'Balmoral', 'Mount Roskill', 'Three Kings',
  'Onehunga', 'Royal Oak', 'Ellerslie', 'Penrose', 'Mount Wellington',
  'Sylvia Park', 'Panmure', 'Glen Innes', 'Point England', 'Kohimarama',
  'Mission Bay', 'Saint Heliers', 'Glendowie', 'Meadowbank', 'Orakei',
  'Devonport', 'Takapuna', 'Milford', 'Forrest Hill', 'Sunnynook',
  'Glenfield', 'Birkenhead', 'Northcote', 'Hillcrest', 'Beach Haven',
  'Birkdale', 'Browns Bay', 'Rothesay Bay', 'Murrays Bay', 'Mairangi Bay',
  'Campbells Bay', 'Castor Bay', 'Long Bay', 'Torbay', 'Warkworth',
  'Henderson', 'New Lynn', 'Glen Eden', 'Titirangi', 'Green Bay',
  'Kelston', 'Avondale', 'Blockhouse Bay', 'New Windsor', 'Rosebank',
  'Waterview', 'Point Chevalier', 'Western Springs', 'Westmere',
  'Mangere', 'Otahuhu', 'Papatoetoe', 'Manurewa', 'Papakura',
  'Pukekohe', 'Waiuku', 'Botany Downs', 'Howick', 'Pakuranga',
  'Bucklands Beach', 'Half Moon Bay', 'Beachlands', 'Maraetai'
];

interface SuburbAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SuburbAutocomplete({ value, onChange, placeholder = "Enter suburb or city" }: SuburbAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuburbs, setFilteredSuburbs] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const filtered = aucklandSuburbs.filter(suburb =>
        suburb.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8); // Limit to 8 results
      setFilteredSuburbs(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setFilteredSuburbs([]);
      setIsOpen(false);
    }
    setHighlightedIndex(-1);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSuburbSelect = (suburb: string) => {
    onChange(suburb);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredSuburbs.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredSuburbs.length) {
          handleSuburbSelect(filteredSuburbs[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (filteredSuburbs.length > 0) {
              setIsOpen(true);
            }
          }}
          className="border-gray-300 text-gray-500 placeholder:text-gray-500 focus:border-primary"
          autoComplete="off"
        />
      </div>
      
      {isOpen && filteredSuburbs.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredSuburbs.map((suburb, index) => (
            <div
              key={suburb}
              className={cn(
                "px-3 py-2 cursor-pointer text-sm hover:bg-gray-50 flex items-center gap-2",
                index === highlightedIndex && "bg-gray-50"
              )}
              onClick={() => handleSuburbSelect(suburb)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <MapPin className="h-3 w-3 text-gray-400" />
              <span>{suburb}, Auckland</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}