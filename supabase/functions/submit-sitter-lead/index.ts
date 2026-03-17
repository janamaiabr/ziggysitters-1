import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { name, email, phone, suburb, services_interested, experience_level, source } = body;

    if (!name || !email) {
      return new Response(
        JSON.stringify({ error: "Name and email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert using service role (bypasses RLS)
    const { data, error } = await supabase
      .from("sitter_leads")
      .insert({
        name,
        email,
        phone: phone || null,
        suburb: suburb || null,
        services_interested: services_interested || null,
        experience_level: experience_level || null,
        source: source || "website",
      })
      .select()
      .maybeSingle();

    if (error) {
      // Duplicate email
      if (error.code === "23505") {
        return new Response(
          JSON.stringify({ success: true, duplicate: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw error;
    }

    // Send notification email to admin
    try {
      const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
      await resend.emails.send({
        from: "ZiggySitters <hello@ziggysitters.com>",
        to: ["janamaia@gmail.com"],
        subject: `New Sitter Lead: ${name} (${suburb || "no suburb"})`,
        html: `
          <h2>New Sitter Lead!</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || "not provided"}</p>
          <p><strong>Suburb:</strong> ${suburb || "not specified"}</p>
          <p><strong>Services:</strong> ${services_interested ? services_interested.join(", ") : "not specified"}</p>
          <p><strong>Experience:</strong> ${experience_level || "not specified"}</p>
          <p><strong>Source:</strong> ${source || "website"}</p>
          <p><em>Submitted at ${new Date().toISOString()}</em></p>
        `,
      });
    } catch (emailErr) {
      console.error("Failed to send admin notification:", emailErr);
    }

    return new Response(
      JSON.stringify({ success: true, id: data?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
