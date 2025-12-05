import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Mail, MapPin, Search, Download, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface SitterLead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  suburb: string | null;
  services_interested: string[] | null;
  experience_level: string | null;
  source: string | null;
  converted_to_user: boolean;
  created_at: string;
}

export default function AdminSitterLeads() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: leads, isLoading } = useQuery({
    queryKey: ['sitter-leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sitter_leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SitterLead[];
    }
  });

  const filteredLeads = leads?.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.suburb?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    if (!leads) return;
    
    const headers = ['Name', 'Email', 'Phone', 'Suburb', 'Services', 'Experience', 'Source', 'Date'];
    const rows = leads.map(lead => [
      lead.name,
      lead.email,
      lead.phone || '',
      lead.suburb || '',
      lead.services_interested?.join(', ') || '',
      lead.experience_level || '',
      lead.source || '',
      format(new Date(lead.created_at), 'yyyy-MM-dd'),
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sitter-leads-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const stats = {
    total: leads?.length || 0,
    thisWeek: leads?.filter(l => new Date(l.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 0,
    converted: leads?.filter(l => l.converted_to_user).length || 0,
    bySuburb: leads?.reduce((acc, l) => {
      const suburb = l.suburb || 'Unknown';
      acc[suburb] = (acc[suburb] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {},
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading leads...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sitter Leads</h1>
          <p className="text-muted-foreground">People interested in becoming pet sitters</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Mail className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.thisWeek}</p>
                <p className="text-xs text-muted-foreground">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.converted}</p>
                <p className="text-xs text-muted-foreground">Converted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{Object.keys(stats.bySuburb).length}</p>
                <p className="text-xs text-muted-foreground">Suburbs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Suburbs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Suburbs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.bySuburb)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 10)
              .map(([suburb, count]) => (
                <Badge key={suburb} variant="secondary">
                  {suburb}: {count}
                </Badge>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or suburb..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Leads Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Suburb</TableHead>
                <TableHead>Services</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads?.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>
                    <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                      {lead.email}
                    </a>
                  </TableCell>
                  <TableCell>{lead.phone || '-'}</TableCell>
                  <TableCell>{lead.suburb || '-'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {lead.services_interested?.map((s) => (
                        <Badge key={s} variant="outline" className="text-xs">
                          {s.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {lead.source?.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(lead.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    {lead.converted_to_user ? (
                      <Badge className="bg-green-500">Converted</Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredLeads?.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No leads found matching your search.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
