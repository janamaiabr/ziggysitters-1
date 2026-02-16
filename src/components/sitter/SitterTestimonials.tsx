import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Plus, Trash2, Quote, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/contexts/ProfileContext';
import { toast } from 'sonner';

interface Testimonial {
  id: string;
  client_name: string;
  client_relationship: string;
  testimonial_text: string;
  rating: number;
  is_approved: boolean;
}

export default function SitterTestimonials() {
  const { profile } = useProfile();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    client_name: '',
    client_relationship: 'past_client',
    testimonial_text: '',
    rating: 5,
  });

  useEffect(() => {
    if (profile?.id) fetchTestimonials();
  }, [profile?.id]);

  const fetchTestimonials = async () => {
    const { data, error } = await supabase
      .from('sitter_testimonials')
      .select('*')
      .eq('sitter_id', profile!.id)
      .order('created_at', { ascending: false });
    
    if (data) setTestimonials(data as Testimonial[]);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!form.client_name || !form.testimonial_text) {
      toast.error('Please fill in all fields');
      return;
    }
    if (testimonials.length >= 3) {
      toast.error('Maximum 3 testimonials allowed');
      return;
    }
    
    setSaving(true);
    const { error } = await supabase
      .from('sitter_testimonials')
      .insert({
        sitter_id: profile!.id,
        client_name: form.client_name,
        client_relationship: form.client_relationship,
        testimonial_text: form.testimonial_text,
        rating: form.rating,
      });

    if (error) {
      toast.error('Failed to save testimonial');
    } else {
      toast.success('Testimonial submitted! It will appear after admin approval.');
      setForm({ client_name: '', client_relationship: 'past_client', testimonial_text: '', rating: 5 });
      setShowForm(false);
      fetchTestimonials();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('sitter_testimonials')
      .delete()
      .eq('id', id);
    
    if (!error) {
      setTestimonials(prev => prev.filter(t => t.id !== id));
      toast.success('Testimonial removed');
    }
  };

  if (loading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Quote className="h-5 w-5 text-primary" />
            Client Testimonials ({testimonials.length}/3)
          </div>
          {testimonials.length < 3 && (
            <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Encouragement banner */}
        {testimonials.length === 0 && !showForm && (
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-4 text-center space-y-2">
            <p className="font-semibold text-foreground">🌟 Boost your profile with testimonials!</p>
            <p className="text-sm text-muted-foreground">
              Ask 3 past clients to share their experience. Profiles with testimonials get <span className="font-bold text-primary">3x more enquiries</span>.
            </p>
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Your First Testimonial
            </Button>
          </div>
        )}

        {/* Add form */}
        {showForm && (
          <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
            <Input 
              placeholder="Client's name (e.g. Sarah M.)"
              value={form.client_name}
              onChange={e => setForm(prev => ({ ...prev, client_name: e.target.value }))}
            />
            <Select value={form.client_relationship} onValueChange={v => setForm(prev => ({ ...prev, client_relationship: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="past_client">Past Client</SelectItem>
                <SelectItem value="friend">Friend / Family</SelectItem>
                <SelectItem value="colleague">Pet Care Colleague</SelectItem>
              </SelectContent>
            </Select>
            <Textarea 
              placeholder="What did they say about your pet care? (min 20 characters)"
              value={form.testimonial_text}
              onChange={e => setForm(prev => ({ ...prev, testimonial_text: e.target.value }))}
              rows={3}
            />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Rating:</span>
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <Star 
                    key={s}
                    className={`h-5 w-5 cursor-pointer ${s <= form.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
                    onClick={() => setForm(prev => ({ ...prev, rating: s }))}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={saving} size="sm">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Submit for Approval
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Existing testimonials */}
        {testimonials.map(t => (
          <div key={t.id} className="border rounded-lg p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-semibold text-sm">{t.client_name}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  ({t.client_relationship === 'past_client' ? 'Past Client' : t.client_relationship === 'friend' ? 'Friend/Family' : 'Colleague'})
                </span>
              </div>
              <div className="flex items-center gap-2">
                {t.is_approved ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Live</span>
                ) : (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">⏳ Pending</span>
                )}
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDelete(t.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex mb-1">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`h-3 w-3 ${s <= t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
              ))}
            </div>
            <p className="text-sm text-muted-foreground italic">"{t.testimonial_text}"</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
