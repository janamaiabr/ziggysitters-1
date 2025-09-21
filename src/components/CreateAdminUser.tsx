import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CreateAdminUser() {
  const [email, setEmail] = useState('hello@ziggysitters.com');
  const [password, setPassword] = useState('admin&%#');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const { toast } = useToast();

  const createAdmin = async () => {
    setLoading(true);
    setResult('');

    try {
      const { data, error } = await supabase.functions.invoke('create-admin', {
        body: { email, password }
      });

      if (error) {
        throw error;
      }

      setResult(`✅ Admin user created successfully: ${email}`);
      toast({
        title: "Admin user created",
        description: `Admin user ${email} has been created successfully.`,
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create admin user';
      setResult(`❌ Error: ${errorMessage}`);
      toast({
        title: "Failed to create admin user",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Create Admin User</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
        </div>

        <Button 
          onClick={createAdmin} 
          disabled={loading || !email || !password}
          className="w-full"
        >
          {loading ? 'Creating...' : 'Create Admin User'}
        </Button>

        {result && (
          <Alert>
            <AlertDescription>{result}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}