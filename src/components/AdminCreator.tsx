import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Component to create admin user on app initialization
export function AdminCreator() {
  useEffect(() => {
    const createAdminUser = async () => {
      try {
        // Call the edge function to create admin user
        const { data, error } = await supabase.functions.invoke('create-admin');
        
        if (error) {
          console.error('Error creating admin user:', error);
        } else {
          console.log('Admin user setup:', data);
        }
      } catch (error) {
        console.error('Failed to create admin user:', error);
      }
    };

    // Create admin user when app loads
    createAdminUser();
  }, []);

  return null; // This component doesn't render anything
}