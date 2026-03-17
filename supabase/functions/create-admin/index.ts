import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body for custom credentials
    let requestData;
    try {
      requestData = await req.json();
    } catch {
      // Default fallback if no body provided
      requestData = {
        email: 'admin@ziggysitters.com',
        password: '1234'
      };
    }

    const adminEmail = requestData.email || 'admin@ziggysitters.com';
    const adminPassword = requestData.password || '1234';
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin user using Supabase Admin API
    const createUserResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
      },
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true, // Skip email confirmation
        user_metadata: {
          first_name: 'Admin',
          last_name: 'User'
        }
      })
    });

    if (!createUserResponse.ok) {
      const error = await createUserResponse.text();
      console.error('Failed to create admin user:', error);
      
      // If user already exists, that's fine
      if (error.includes('already registered')) {
        return new Response(
          JSON.stringify({ message: 'Admin user already exists and can sign in' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
      
      throw new Error(`Failed to create user: ${error}`);
    }

    const userData = await createUserResponse.json();
    console.log('Admin user created successfully:', userData.user?.email);

    return new Response(
      JSON.stringify({ 
        message: 'Admin user created successfully',
        email: adminEmail,
        canSignIn: true
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error creating admin user:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create admin user',
        details: (error as Error).message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});