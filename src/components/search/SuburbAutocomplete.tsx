import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

// Auckland suburbs
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

// Sunshine Coast suburbs
const sunshineCoastSuburbs = [
  'Noosa Heads', 'Noosa Junction', 'Noosaville', 'Sunshine Beach', 'Peregian Beach',
  'Coolum Beach', 'Marcoola', 'Mudjimba', 'Twin Waters', 'Pacific Paradise',
  'Maroochydore', 'Alexandra Headland', 'Mooloolaba', 'Buderim', 'Sippy Downs',
  'Mountain Creek', 'Kawana Waters', 'Birtinya', 'Currimundi', 'Caloundra',
  'Kings Beach', 'Pelican Waters', 'Golden Beach', 'Landsborough', 'Beerwah',
  'Glass House Mountains', 'Maleny', 'Montville', 'Mapleton', 'Nambour',
  'Yandina', 'Eumundi', 'Palmwoods', 'Woombye', 'Bli Bli', 'Coolum'
];

type SuburbEntry = { name: string; region: string };

const allSuburbs: SuburbEntry[] = [
  ...aucklandSuburbs.map(s => ({ name: s, region: 'Auckland' })),
  ...sunshineCoastSuburbs.map(s => ({ name: s, region: 'Sunshine Coast' })),
];

interface SuburbAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SuburbAutocomplete({ value, onChange, placeholder = "Enter suburb or city", className }: SuburbAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuburbs, setFilteredSuburbs] = useState<SuburbEntry[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const normalizedSearch = value.toLowerCase()
        .replace(/\bst\b/gi, 'saint')
        .replace(/\bst\./gi, 'saint');
      
      const filtered = allSuburbs.filter(entry => {
        const normalizedSuburb = entry.name.toLowerCase();
        const normalizedRegion = entry.region.toLowerCase();
        return normalizedSuburb.includes(value.toLowerCase()) || 
               normalizedSuburb.includes(normalizedSearch) ||
               normalizedRegion.includes(value.toLowerCase());
      }).slice(0, 8);
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

  const handleSuburbSelect = (entry: SuburbEntry) => {
    onChange(entry.name);
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
          className={cn("h-11 text-base", className)}
          autoComplete="off"
        />
      </div>
      
      {isOpen && filteredSuburbs.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredSuburbs.map((entry, index) => (
            <div
              key={`${entry.region}-${entry.name}`}
              className={cn(
                "px-3 py-2 cursor-pointer text-sm hover:bg-muted flex items-center gap-2",
                index === highlightedIndex && "bg-muted"
              )}
              onClick={() => handleSuburbSelect(entry)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span>{entry.name}, {entry.region}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}