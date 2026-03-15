import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp } from 'lucide-react';

const REGIONS = {
  nz: { label: '🇳🇿 New Zealand (NZD)', currency: 'NZD', symbol: '$' },
  au: { label: '🇦🇺 Sunshine Coast (AUD)', currency: 'AUD', symbol: '$' },
};

const AVERAGE_RATES = {
  nz: {
    pet_sitting_owners_home: { daily: 65, label: "Pet Sitting (Owner's Home)" },
    pet_sitting_sitters_home: { daily: 55, label: "Pet Sitting (Your Home)" },
    drop_in_visits: { daily: 35, label: "Drop-in Visits" },
  },
  au: {
    pet_sitting_owners_home: { daily: 75, label: "Pet Sitting (Owner's Home)" },
    pet_sitting_sitters_home: { daily: 60, label: "Pet Sitting (Your Home)" },
    drop_in_visits: { daily: 40, label: "Drop-in Visits" },
  },
};

const SUBURB_MULTIPLIERS: Record<string, Record<string, number>> = {
  nz: {
    'Ponsonby': 1.2, 'Grey Lynn': 1.15, 'Mt Eden': 1.1, 'Parnell': 1.2,
    'Remuera': 1.25, 'Herne Bay': 1.3, 'Devonport': 1.15, 'Takapuna': 1.1,
    'default': 1.0,
  },
  au: {
    'Noosa Heads': 1.25, 'Noosaville': 1.15, 'Buderim': 1.1,
    'Maroochydore': 1.1, 'Mooloolaba': 1.15, 'Caloundra': 1.05,
    'default': 1.0,
  },
};

type ServiceKey = keyof typeof AVERAGE_RATES.nz;

export default function EarningsCalculator() {
  const [region, setRegion] = useState<'nz' | 'au'>('nz');
  const [hoursPerWeek, setHoursPerWeek] = useState([15]);
  const [serviceType, setServiceType] = useState<ServiceKey>('pet_sitting_owners_home');
  const [suburb, setSuburb] = useState('default');

  const rates = AVERAGE_RATES[region];
  const suburbs = SUBURB_MULTIPLIERS[region];
  const multiplier = suburbs[suburb] || 1.0;
  const baseRate = rates[serviceType].daily;
  const adjustedRate = Math.round(baseRate * multiplier);
  
  const bookingsPerWeek = Math.ceil(hoursPerWeek[0] / 8);
  const weeklyEarnings = Math.round(bookingsPerWeek * adjustedRate);
  const monthlyEarnings = weeklyEarnings * 4;
  const yearlyEarnings = monthlyEarnings * 12;
  const { symbol } = REGIONS[region];

  const handleRegionChange = (r: 'nz' | 'au') => {
    setRegion(r);
    setSuburb('default');
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          Earnings Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium">Your region</label>
          <Select value={region} onValueChange={(v) => handleRegionChange(v as 'nz' | 'au')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(REGIONS).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">Hours per week you want to work</label>
          <Slider
            value={hoursPerWeek}
            onValueChange={setHoursPerWeek}
            max={40}
            min={5}
            step={5}
            className="w-full"
          />
          <div className="text-center text-lg font-semibold text-primary">
            {hoursPerWeek[0]} hours/week
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">Primary service</label>
          <Select value={serviceType} onValueChange={(v) => setServiceType(v as ServiceKey)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(rates).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">Your suburb</label>
          <Select value={suburb} onValueChange={setSuburb}>
            <SelectTrigger>
              <SelectValue placeholder="Select suburb" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Other {region === 'nz' ? 'Auckland' : 'Sunshine Coast'} suburb</SelectItem>
              {Object.keys(suburbs).filter(s => s !== 'default').map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {suburb !== 'default' && (
            <Badge variant="secondary" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              High demand area - {Math.round((multiplier - 1) * 100)}% higher rates
            </Badge>
          )}
        </div>

        <div className="pt-4 border-t space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Estimated monthly earnings</p>
            <p className="text-4xl font-bold text-primary">{symbol}{monthlyEarnings.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{REGIONS[region].currency}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-background/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Weekly</p>
              <p className="text-lg font-semibold">{symbol}{weeklyEarnings}</p>
            </div>
            <div className="bg-background/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Yearly</p>
              <p className="text-lg font-semibold">{symbol}{yearlyEarnings.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            *Based on average rates for {rates[serviceType].label.toLowerCase()} at {symbol}{adjustedRate}/day
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
