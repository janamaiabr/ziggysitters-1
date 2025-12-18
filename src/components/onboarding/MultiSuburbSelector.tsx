import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, MapPin, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Auckland suburbs grouped by area for easier selection
const SUBURB_GROUPS = {
  'Central Auckland': [
    'Ponsonby', 'Newmarket', 'Mount Eden', 'Parnell', 'Remuera', 'Epsom',
    'Grey Lynn', 'Freemans Bay', 'Herne Bay', 'Grafton', 'Eden Terrace',
    'Newton', 'Kingsland', 'Morningside', 'Saint Lukes'
  ],
  'Eastern Suburbs': [
    'Mission Bay', 'Saint Heliers', 'Kohimarama', 'Glendowie', 'Meadowbank',
    'Orakei', 'Glen Innes', 'Point England', 'Panmure', 'Ellerslie'
  ],
  'North Shore': [
    'Devonport', 'Takapuna', 'Milford', 'Browns Bay', 'Mairangi Bay',
    'Campbells Bay', 'Long Bay', 'Torbay', 'Glenfield', 'Birkenhead',
    'Northcote', 'Beach Haven'
  ],
  'West Auckland': [
    'Henderson', 'New Lynn', 'Glen Eden', 'Titirangi', 'Green Bay',
    'Kelston', 'Avondale', 'Blockhouse Bay', 'Point Chevalier', 'Westmere'
  ],
  'South Auckland': [
    'Onehunga', 'Royal Oak', 'Mount Wellington', 'Penrose', 'Mangere',
    'Otahuhu', 'Papatoetoe', 'Manurewa', 'Papakura'
  ],
  'East Auckland': [
    'Howick', 'Pakuranga', 'Botany Downs', 'Bucklands Beach', 'Half Moon Bay',
    'Beachlands', 'Maraetai'
  ]
};

const ALL_SUBURBS = Object.values(SUBURB_GROUPS).flat();

interface MultiSuburbSelectorProps {
  selectedSuburbs: string[];
  onChange: (suburbs: string[]) => void;
  primarySuburb?: string;
  onPrimaryChange?: (suburb: string) => void;
  maxSuburbs?: number;
}

export default function MultiSuburbSelector({
  selectedSuburbs,
  onChange,
  primarySuburb,
  onPrimaryChange,
  maxSuburbs = 15
}: MultiSuburbSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  // Normalize search term: convert "St" to "Saint" for matching
  const normalizeSearch = (query: string) => query.toLowerCase()
    .replace(/\bst\b/gi, 'saint')
    .replace(/\bst\./gi, 'saint');

  const filteredSuburbs = searchQuery
    ? ALL_SUBURBS.filter(s => {
        const normalizedSuburb = s.toLowerCase();
        const normalizedQuery = normalizeSearch(searchQuery);
        return normalizedSuburb.includes(searchQuery.toLowerCase()) || 
               normalizedSuburb.includes(normalizedQuery);
      })
    : [];

  const toggleSuburb = (suburb: string) => {
    if (selectedSuburbs.includes(suburb)) {
      const newSuburbs = selectedSuburbs.filter(s => s !== suburb);
      onChange(newSuburbs);
      // If removing primary, set new primary to first remaining suburb
      if (primarySuburb === suburb && onPrimaryChange && newSuburbs.length > 0) {
        onPrimaryChange(newSuburbs[0]);
      }
    } else if (selectedSuburbs.length < maxSuburbs) {
      const newSuburbs = [...selectedSuburbs, suburb];
      onChange(newSuburbs);
      // If this is the first suburb, make it primary
      if (onPrimaryChange && selectedSuburbs.length === 0) {
        onPrimaryChange(suburb);
      }
    }
  };

  const toggleGroup = (groupName: string) => {
    const groupSuburbs = SUBURB_GROUPS[groupName as keyof typeof SUBURB_GROUPS];
    const allSelected = groupSuburbs.every(s => selectedSuburbs.includes(s));
    
    if (allSelected) {
      // Deselect all in group
      onChange(selectedSuburbs.filter(s => !groupSuburbs.includes(s)));
    } else {
      // Select all in group (up to max)
      const newSuburbs = [...new Set([...selectedSuburbs, ...groupSuburbs])].slice(0, maxSuburbs);
      onChange(newSuburbs);
      if (onPrimaryChange && !primarySuburb && newSuburbs.length > 0) {
        onPrimaryChange(newSuburbs[0]);
      }
    }
  };

  const setPrimary = (suburb: string) => {
    if (onPrimaryChange && selectedSuburbs.includes(suburb)) {
      onPrimaryChange(suburb);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-base font-medium">Service Areas</Label>
        <p className="text-sm text-muted-foreground">
          Select all Auckland suburbs where you're willing to pet sit (up to {maxSuburbs})
        </p>
      </div>

      {/* Selected suburbs display */}
      {selectedSuburbs.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
          {selectedSuburbs.map(suburb => (
            <Badge
              key={suburb}
              variant={suburb === primarySuburb ? 'default' : 'secondary'}
              className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setPrimary(suburb)}
            >
              {suburb === primarySuburb && <MapPin className="w-3 h-3" />}
              {suburb}
              <X
                className="w-3 h-3 ml-1 hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSuburb(suburb);
                }}
              />
            </Badge>
          ))}
          {primarySuburb && (
            <p className="w-full text-xs text-muted-foreground mt-2">
              Click a suburb to make it your primary location (shown first in search)
            </p>
          )}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Input
          placeholder="Search suburbs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      </div>

      {/* Search results */}
      {searchQuery && filteredSuburbs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 border rounded-lg max-h-48 overflow-y-auto">
          {filteredSuburbs.map(suburb => (
            <button
              key={suburb}
              type="button"
              onClick={() => toggleSuburb(suburb)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors text-left",
                selectedSuburbs.includes(suburb)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              {selectedSuburbs.includes(suburb) && <Check className="w-3 h-3" />}
              {suburb}
            </button>
          ))}
        </div>
      )}

      {/* Grouped suburb selection */}
      {!searchQuery && (
        <div className="space-y-3">
          {Object.entries(SUBURB_GROUPS).map(([groupName, suburbs]) => {
            const selectedCount = suburbs.filter(s => selectedSuburbs.includes(s)).length;
            const isExpanded = expandedGroup === groupName;
            
            return (
              <div key={groupName} className="border rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedGroup(isExpanded ? null : groupName)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium">{groupName}</span>
                  <div className="flex items-center gap-2">
                    {selectedCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {selectedCount} selected
                      </Badge>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleGroup(groupName);
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      {suburbs.every(s => selectedSuburbs.includes(s)) ? 'Deselect all' : 'Select all'}
                    </button>
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3">
                    {suburbs.map(suburb => (
                      <button
                        key={suburb}
                        type="button"
                        onClick={() => toggleSuburb(suburb)}
                        disabled={!selectedSuburbs.includes(suburb) && selectedSuburbs.length >= maxSuburbs}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors text-left",
                          selectedSuburbs.includes(suburb)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        {selectedSuburbs.includes(suburb) && <Check className="w-3 h-3" />}
                        {suburb}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {selectedSuburbs.length}/{maxSuburbs} suburbs selected
      </p>
    </div>
  );
}
