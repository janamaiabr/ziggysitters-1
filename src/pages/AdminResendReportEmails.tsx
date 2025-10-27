import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Mail, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportToResend {
  id: string;
  report_date: string;
  booking_id: string;
  booking_reference: string;
  email_sent_at: string | null;
  owner_email: string;
  general_notes: string;
  status?: "pending" | "sending" | "sent" | "failed";
  error?: string;
}

export default function AdminResendReportEmails() {
  const [reports, setReports] = useState<ReportToResend[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const findReportsWithoutEmails = async () => {
    setLoading(true);
    try {
      const { data: reportsData, error: reportsError } = await supabase
        .from('daily_reports')
        .select(`
          id,
          report_date,
          booking_id,
          email_sent_at,
          general_notes,
          mood,
          food_consumption,
          exercise_duration,
          exercise_notes,
          medication_given,
          medication_notes,
          sleep_quality,
          sleep_notes,
          time_alone_hours,
          food_notes,
          photo_urls,
          booking:bookings(
            booking_reference,
            owner_id
          )
        `)
        .is('email_sent_at', null)
        .order('report_date', { ascending: false })
        .limit(50);

      if (reportsError) throw reportsError;

      // Get owner emails
      const reportsWithOwner = await Promise.all(
        (reportsData || []).map(async (report: any) => {
          const { data: ownerData } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', report.booking.owner_id)
            .single();

          return {
            id: report.id,
            report_date: report.report_date,
            booking_id: report.booking_id,
            booking_reference: report.booking.booking_reference,
            email_sent_at: report.email_sent_at,
            owner_email: ownerData?.email || 'Unknown',
            general_notes: report.general_notes,
            reportData: {
              photo_urls: report.photo_urls,
              exercise_duration: report.exercise_duration,
              exercise_notes: report.exercise_notes,
              medication_given: report.medication_given,
              medication_notes: report.medication_notes,
              sleep_quality: report.sleep_quality,
              sleep_notes: report.sleep_notes,
              time_alone_hours: report.time_alone_hours,
              food_consumption: report.food_consumption,
              food_notes: report.food_notes,
              general_notes: report.general_notes,
              mood: report.mood,
            },
            status: 'pending' as const
          };
        })
      );

      setReports(reportsWithOwner);

      toast({
        title: "Reports found",
        description: `Found ${reportsWithOwner.length} reports without emails sent`,
      });
    } catch (error: any) {
      console.error('Error finding reports:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resendEmail = async (report: ReportToResend & { reportData?: any }) => {
    setReports(prev => prev.map(r => 
      r.id === report.id ? { ...r, status: 'sending' as const } : r
    ));

    try {
      console.log('📧 Resending email for report:', report.id, report.booking_reference);
      
      const result = await supabase.functions.invoke('send-daily-report-email', {
        body: {
          bookingId: report.booking_id,
          reportDate: report.report_date,
          reportData: report.reportData
        }
      });

      if (result.error) {
        throw result.error;
      }

      setReports(prev => prev.map(r => 
        r.id === report.id ? { ...r, status: 'sent' as const, email_sent_at: new Date().toISOString() } : r
      ));

      toast({
        title: "Email sent",
        description: `Email sent successfully for ${report.booking_reference}`,
      });
    } catch (error: any) {
      console.error('Error resending email:', error);
      
      setReports(prev => prev.map(r => 
        r.id === report.id ? { ...r, status: 'failed' as const, error: error.message } : r
      ));

      toast({
        title: "Email failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resendAllEmails = async () => {
    for (const report of reports) {
      if (report.status !== 'sent') {
        await resendEmail(report as any);
        // Wait a bit between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'sending':
        return <AlertCircle className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Mail className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Resend Report Emails (Admin Tool)</CardTitle>
          <CardDescription>
            Find and resend emails for daily reports that weren't emailed to owners.
            This tool is for fixing the issue where reports were submitted but emails failed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <Button 
              onClick={findReportsWithoutEmails} 
              disabled={loading}
            >
              {loading ? "Searching..." : "Find Reports Without Emails"}
            </Button>

            {reports.length > 0 && (
              <Button 
                onClick={resendAllEmails}
                variant="secondary"
                disabled={loading}
              >
                Resend All Emails
              </Button>
            )}
          </div>

          {reports.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">
                Reports Needing Emails ({reports.length})
              </h3>
              {reports.map((report) => (
                <Card key={report.id} className={
                  report.status === 'sent' ? 'border-green-200 bg-green-50' :
                  report.status === 'failed' ? 'border-red-200 bg-red-50' :
                  report.status === 'sending' ? 'border-blue-200 bg-blue-50' :
                  ''
                }>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(report.status)}
                        <div className="flex-1 space-y-1">
                          <div className="font-medium">
                            {report.booking_reference} - {new Date(report.report_date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Owner: {report.owner_email}
                          </div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {report.general_notes}
                          </div>
                          {report.error && (
                            <div className="text-sm text-red-600 mt-2">
                              Error: {report.error}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={
                          report.status === 'sent' ? 'default' :
                          report.status === 'failed' ? 'destructive' :
                          report.status === 'sending' ? 'secondary' :
                          'outline'
                        }>
                          {report.status || 'pending'}
                        </Badge>
                        {report.status !== 'sent' && report.status !== 'sending' && (
                          <Button
                            size="sm"
                            onClick={() => resendEmail(report as any)}
                          >
                            Resend Email
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-base">ℹ️ What This Tool Does</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>✓ Finds all daily reports where email_sent_at is NULL</div>
              <div>✓ Shows booking reference, date, and owner email</div>
              <div>✓ Allows resending emails individually or in bulk</div>
              <div>✓ Updates email_sent_at timestamp when successful</div>
              <div>⚠️ Use this to fix Rachel's missing report emails (BK-AD6D7676)</div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
