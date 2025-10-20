import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DailyReportEmailRequest {
  bookingId: string;
  reportDate: string;
  reportData: {
    photo_urls: string[];
    exercise_duration: number;
    exercise_notes?: string;
    medication_given: boolean;
    medication_notes?: string;
    sleep_quality: string;
    sleep_notes?: string;
    time_alone_hours: number;
    food_consumption: string;
    food_notes?: string;
    general_notes: string;
    mood: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const { bookingId, reportDate, reportData }: DailyReportEmailRequest = await req.json();

    console.log("Processing daily report email for booking:", bookingId);

    // Get booking and owner details
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select(`
        *,
        owner:profiles!bookings_owner_id_fkey(first_name, last_name, email),
        sitter:profiles!bookings_sitter_id_fkey(first_name, last_name)
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error(`Failed to fetch booking details: ${bookingError?.message}`);
    }

    // Get pet details using RPC function
    const { data: pets, error: petsError } = await supabaseClient
      .rpc('get_pet_basic_info_for_booking', { booking_id: bookingId });

    if (petsError) {
      console.error('Error fetching pet details:', petsError);
    }

    // Format pet names
    const petNames = pets?.map((pet: any) => pet.name).join(', ') || 'your pet(s)';

    // Format mood and sleep quality for display
    const formatMood = (mood: string) => {
      const moodMap: { [key: string]: string } = {
        'very_happy': '😊 Very Happy',
        'happy': '😄 Happy',
        'content': '😌 Content',
        'anxious': '😰 Anxious',
        'sad': '😢 Sad'
      };
      return moodMap[mood] || mood;
    };

    const formatSleepQuality = (quality: string) => {
      return quality.charAt(0).toUpperCase() + quality.slice(1);
    };

    const formatFoodConsumption = (consumption: string) => {
      const consumptionMap: { [key: string]: string } = {
        'all': 'All - finished entire meal',
        'most': 'Most - ate majority of food',
        'some': 'Some - ate about half',
        'little': 'Little - barely touched food',
        'none': 'None - refused to eat'
      };
      return consumptionMap[consumption] || consumption;
    };

    // Create photo section for email
    const photoSection = reportData.photo_urls.map((url, index) => 
      `<img src="${url}" alt="Pet photo ${index + 1}" style="max-width: 200px; height: auto; border-radius: 8px; margin: 5px;">`
    ).join('');

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Daily Pet Report</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">🐾 Daily Pet Report</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
          ${new Date(reportDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e1e1e1; border-top: none; border-radius: 0 0 10px 10px;">
        <div style="margin-bottom: 25px;">
          <h2 style="color: #667eea; margin-bottom: 10px;">Hello ${booking.owner.first_name}!</h2>
          <p>Here's how ${petNames} did today with ${booking.sitter.first_name}:</p>
        </div>

        ${photoSection ? `
        <div style="margin-bottom: 25px;">
          <h3 style="color: #667eea; margin-bottom: 15px;">📸 Today's Photos</h3>
          <div style="text-align: center;">
            ${photoSection}
          </div>
        </div>
        ` : ''}

        <div style="margin-bottom: 25px;">
          <h3 style="color: #667eea; margin-bottom: 15px;">📝 Today's Highlights</h3>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
            <p style="margin: 0; font-size: 16px;">${reportData.general_notes}</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
          <div>
            <h4 style="color: #667eea; margin-bottom: 10px;">😊 Mood & Behavior</h4>
            <p style="margin: 5px 0;"><strong>Overall Mood:</strong> ${formatMood(reportData.mood)}</p>
            <p style="margin: 5px 0;"><strong>Time Alone:</strong> ${reportData.time_alone_hours} hours</p>
          </div>
          
          <div>
            <h4 style="color: #667eea; margin-bottom: 10px;">🏃‍♂️ Exercise & Activity</h4>
            <p style="margin: 5px 0;"><strong>Exercise Time:</strong> ${reportData.exercise_duration} minutes</p>
            ${reportData.exercise_notes ? `<p style="margin: 5px 0;"><strong>Notes:</strong> ${reportData.exercise_notes}</p>` : ''}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
          <div>
            <h4 style="color: #667eea; margin-bottom: 10px;">🍽️ Food & Eating</h4>
            <p style="margin: 5px 0;"><strong>Food Consumption:</strong> ${formatFoodConsumption(reportData.food_consumption)}</p>
            ${reportData.food_notes ? `<p style="margin: 5px 0;"><strong>Notes:</strong> ${reportData.food_notes}</p>` : ''}
          </div>
          
          <div>
            <h4 style="color: #667eea; margin-bottom: 10px;">😴 Sleep & Rest</h4>
            <p style="margin: 5px 0;"><strong>Sleep Quality:</strong> ${formatSleepQuality(reportData.sleep_quality)}</p>
            ${reportData.sleep_notes ? `<p style="margin: 5px 0;"><strong>Notes:</strong> ${reportData.sleep_notes}</p>` : ''}
          </div>
        </div>

        ${reportData.medication_given || reportData.medication_notes ? `
        <div style="margin-bottom: 25px;">
          <h4 style="color: #667eea; margin-bottom: 10px;">💊 Medication & Health</h4>
          <p style="margin: 5px 0;"><strong>Medication Given:</strong> ${reportData.medication_given ? 'Yes' : 'No'}</p>
          ${reportData.medication_notes ? `<p style="margin: 5px 0;"><strong>Notes:</strong> ${reportData.medication_notes}</p>` : ''}
        </div>
        ` : ''}

        <div style="border-top: 2px solid #e1e1e1; padding-top: 20px; text-align: center;">
          <p style="color: #666; margin: 0;">
            This report was submitted by ${booking.sitter.first_name} at ${new Date().toLocaleTimeString()}
          </p>
          <p style="color: #667eea; margin: 10px 0 0 0; font-weight: bold;">
            ZiggySitters - Transparent Pet Care You Can Trust
          </p>
        </div>
      </div>
    </body>
    </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "ZiggySitters <reports@ziggysitters.com>",
      to: [booking.owner.email],
      subject: `Daily Report for ${petNames} - ${new Date(reportDate).toLocaleDateString()}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-daily-report-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);