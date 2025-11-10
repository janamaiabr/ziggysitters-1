import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, Eye, Edit2, Save, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AdminNav } from "@/components/admin/AdminNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EmailTemplate {
  id: string;
  template_key: string;
  template_name: string;
  subject: string;
  html_content: string;
  description: string;
  variables: string[];
  is_active: boolean;
  source: 'database' | 'hardcoded';
  trigger: string;
  edge_function?: string;
}

// Hardcoded email templates from edge functions
const hardcodedTemplates: Omit<EmailTemplate, 'id' | 'is_active'>[] = [
  {
    template_key: 'launch_announcement_owner',
    template_name: 'Launch Announcement - Pet Owner',
    subject: '🎉 ZiggySitters is Officially LIVE! Your Pet Care Journey Starts Now',
    description: 'Email sent to pet owners announcing the platform launch',
    variables: ['firstName'],
    source: 'hardcoded' as const,
    trigger: 'Manual - Admin sends to all users',
    edge_function: 'send-launch-announcement',
    html_content: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.7; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .banner { background: linear-gradient(45deg, #ffd700, #ffed4e); color: #333; text-align: center; padding: 15px; font-weight: bold; font-size: 18px; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; text-decoration: none; border-radius: 30px; margin: 25px 0; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
    .footer { text-align: center; padding: 30px; background: #f9f9f9; color: #666; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="banner">🚀 WE'RE OFFICIALLY LIVE! 🚀</div>
    <div class="header"><h1>Welcome to the Future of Pet Care!</h1></div>
    <div class="content">
      <h2>Hi {firstName}! 🎊</h2>
      <p>We're thrilled to announce that <strong>ZiggySitters is officially LIVE</strong>!</p>
      <center><a href="https://ziggysitters.com/find-sitters" class="button">🔍 Find a Sitter Now</a></center>
      <p>Warm regards,<br><strong>The ZiggySitters Team</strong></p>
    </div>
    <div class="footer"><p><strong>ZiggySitters</strong></p></div>
  </div>
</body>
</html>`
  },
  {
    template_key: 'golden_badge_congratulations',
    template_name: 'Golden Badge Congratulations',
    subject: '🏆 Congratulations! You\'ve Earned Your Golden Badge',
    description: 'Congratulations email for sitters who earned the golden badge',
    variables: ['sitterName'],
    source: 'hardcoded' as const,
    trigger: 'Automatic - When sitter completes golden badge requirements',
    edge_function: 'send-golden-badge-congratulations',
    html_content: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); color: #333; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { padding: 40px 30px; }
    .badge-icon { font-size: 80px; text-align: center; margin: 20px 0; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); color: #333; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; margin: 20px 0; box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4); }
    .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 14px; border-radius: 0 0 10px 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>🏆 Congratulations!</h1><p>You've Earned Your Golden Badge</p></div>
    <div class="content">
      <div class="badge-icon">🏅</div>
      <h2 style="color: #ffd700; text-align: center;">Hi {sitterName}!</h2>
      <p>We're thrilled to inform you that you've earned your <strong>Golden Badge</strong> on ZiggySitters!</p>
      <center><a href="https://ziggysitters.com/profile" class="cta-button">View Your Profile →</a></center>
      <p>Best regards,<br><strong>The ZiggySitters Team</strong></p>
    </div>
    <div class="footer"><p><strong>ZiggySitters</strong></p></div>
  </div>
</body>
</html>`
  },
  {
    template_key: 'golden_badge_invitation',
    template_name: 'Golden Badge Invitation',
    subject: '⭐ Stand Out with a Golden Badge - Get More Bookings!',
    description: 'Invitation for verified sitters to apply for golden badge',
    variables: ['sitterName', 'policeCheckUrl'],
    source: 'hardcoded' as const,
    trigger: 'Manual - Admin sends to verified sitters',
    edge_function: 'send-golden-badge-invitation',
    html_content: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 40px 30px; }
    .golden-box { background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); border-left: 4px solid #ffd700; padding: 20px; border-radius: 8px; margin: 25px 0; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); color: #333; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>⭐ Unlock Your Golden Badge</h1><p>Stand out and get more bookings!</p></div>
    <div class="content">
      <p style="font-size: 18px; color: #667eea; font-weight: 600;">Hi {sitterName}! 👋</p>
      <p>You're eligible to apply for a <strong>Golden Badge</strong> on ZiggySitters.</p>
      <div class="golden-box">
        <h3 style="margin-top: 0; color: #ffd700;">🏆 Benefits:</h3>
        <ul>
          <li>Stand out to pet owners</li>
          <li>Get more booking requests</li>
          <li>Build trust with verified credentials</li>
        </ul>
      </div>
      <center><a href="{policeCheckUrl}" class="cta-button">Apply for Golden Badge →</a></center>
      <p>Best regards,<br><strong>The ZiggySitters Team</strong></p>
    </div>
    <div class="footer"><p><strong>ZiggySitters</strong></p></div>
  </div>
</body>
</html>`
  }
];

export default function AdminEmailPreview() {
  const [dbTemplates, setDbTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [sendMode, setSendMode] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    html_content: "",
    description: "",
  });
  const [sendFormData, setSendFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("template_name");

      if (error) throw error;
      
      const templatesWithSource = (data || []).map(template => ({
        ...template,
        variables: Array.isArray(template.variables) 
          ? (template.variables as string[]).filter(v => typeof v === 'string')
          : [],
        source: 'database' as const,
        trigger: template.trigger || 'Automatic - Sent based on system events',
        edge_function: undefined
      }));
      
      setDbTemplates(templatesWithSource as EmailTemplate[]);
    } catch (error: any) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load email templates");
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setPreviewMode(true);
    setEditMode(false);
  };

  const handleEdit = (template: EmailTemplate) => {
    if (template.source === 'hardcoded') {
      toast.error("Hardcoded templates cannot be edited. They must be updated in the code.");
      return;
    }
    setSelectedTemplate(template);
    setFormData({
      subject: template.subject,
      html_content: template.html_content,
      description: template.description,
    });
    setEditMode(true);
    setPreviewMode(false);
  };

  const handleSave = async () => {
    if (!selectedTemplate || selectedTemplate.source === 'hardcoded') return;

    try {
      const { error } = await supabase
        .from("email_templates")
        .update({
          subject: formData.subject,
          html_content: formData.html_content,
          description: formData.description,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedTemplate.id);

      if (error) throw error;

      toast.success("Email template updated successfully");
      setEditMode(false);
      setSelectedTemplate(null);
      fetchTemplates();
    } catch (error: any) {
      console.error("Error updating template:", error);
      toast.error("Failed to update email template");
    }
  };

  const handleClose = () => {
    setPreviewMode(false);
    setEditMode(false);
    setSendMode(false);
    setSelectedTemplate(null);
    setSendFormData({});
  };

  const handleSendEmail = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setSendMode(true);
    setPreviewMode(false);
    setEditMode(false);
    
    // Initialize form with empty values for all variables
    const initialData: Record<string, string> = {};
    template.variables.forEach(v => {
      initialData[v] = '';
    });
    setSendFormData(initialData);
  };

  const handleSendSubmit = async () => {
    if (!selectedTemplate?.edge_function) {
      toast.error("No edge function defined for this template");
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.functions.invoke(selectedTemplate.edge_function, {
        body: sendFormData
      });

      if (error) throw error;

      toast.success("Email sent successfully!");
      handleClose();
    } catch (error: any) {
      console.error("Error sending email:", error);
      toast.error(`Failed to send email: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  const replaceVariables = (content: string, variables: string[]) => {
    let result = content;
    variables.forEach((variable) => {
      const placeholder = `{${variable}}`;
      result = result.replace(new RegExp(placeholder, "g"), `<span style="background: #fef3c7; padding: 2px 4px; border-radius: 3px; font-weight: 600;">${variable}</span>`);
    });
    return result;
  };

  const allTemplates = [...dbTemplates, ...hardcodedTemplates.map((t, idx) => ({ ...t, id: `hardcoded-${idx}`, is_active: true }))];

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <p>Loading email templates...</p>
      </div>
    );
  }

  return (
    <div>
      <AdminNav />
      <div className="container mx-auto py-8 space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Email Templates Management</h1>
          <p className="text-muted-foreground">View, preview, and edit all email templates with full rendering</p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Templates ({allTemplates.length})</TabsTrigger>
            <TabsTrigger value="database">Database ({dbTemplates.length})</TabsTrigger>
            <TabsTrigger value="hardcoded">Hardcoded ({hardcodedTemplates.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
            {allTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} onPreview={handlePreview} onEdit={handleEdit} onSend={handleSendEmail} />
            ))}
          </TabsContent>

          <TabsContent value="database" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
            {dbTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} onPreview={handlePreview} onEdit={handleEdit} onSend={handleSendEmail} />
            ))}
          </TabsContent>

          <TabsContent value="hardcoded" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
            {hardcodedTemplates.map((template, idx) => (
              <TemplateCard key={`hardcoded-${idx}`} template={{ ...template, id: `hardcoded-${idx}`, is_active: true }} onPreview={handlePreview} onEdit={handleEdit} onSend={handleSendEmail} />
            ))}
          </TabsContent>
        </Tabs>

        {/* Preview Dialog */}
        <Dialog open={previewMode} onOpenChange={handleClose}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Preview: {selectedTemplate?.template_name}</DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                <span>Full email rendering with all design elements</span>
                <Badge variant={selectedTemplate?.source === 'database' ? 'default' : 'secondary'}>
                  {selectedTemplate?.source === 'database' ? 'Database' : 'Hardcoded'}
                </Badge>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground mb-1">Subject:</p>
                <p className="text-lg font-semibold">
                  <span dangerouslySetInnerHTML={{ 
                    __html: selectedTemplate ? replaceVariables(selectedTemplate.subject, selectedTemplate.variables) : "" 
                  }} />
                </p>
              </div>
              <div className="border rounded-lg bg-gray-100 overflow-hidden">
                <iframe
                  srcDoc={selectedTemplate ? replaceVariables(selectedTemplate.html_content, selectedTemplate.variables) : ""}
                  className="w-full min-h-[600px] bg-white"
                  style={{ border: 'none' }}
                  title="Email Preview"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editMode} onOpenChange={handleClose}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Email Template: {selectedTemplate?.template_name}</DialogTitle>
              <DialogDescription>
                Edit the subject and content of this email template. Use variables in curly braces like {"{variable}"}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Email subject"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Template description"
                />
              </div>
              <div>
                <Label htmlFor="html_content">HTML Content</Label>
                <Textarea
                  id="html_content"
                  value={formData.html_content}
                  onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                  placeholder="Email HTML content"
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>
              {selectedTemplate && selectedTemplate.variables.length > 0 && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm font-medium mb-2">Available Variables:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.variables.map((variable) => (
                      <code key={variable} className="text-xs bg-background px-2 py-1 rounded">
                        {`{${variable}}`}
                      </code>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Send Email Dialog */}
        <Dialog open={sendMode} onOpenChange={handleClose}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send Email: {selectedTemplate?.template_name}</DialogTitle>
              <DialogDescription>
                Fill in the required information to send this email manually
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-medium mb-1">Trigger:</p>
                <p className="text-sm">{selectedTemplate?.trigger}</p>
              </div>
              
              {selectedTemplate?.variables && selectedTemplate.variables.length > 0 ? (
                <>
                  {selectedTemplate.variables.map((variable) => (
                    <div key={variable}>
                      <Label htmlFor={variable}>
                        {variable.charAt(0).toUpperCase() + variable.slice(1).replace(/([A-Z])/g, ' $1')}
                      </Label>
                      <Input
                        id={variable}
                        value={sendFormData[variable] || ''}
                        onChange={(e) => setSendFormData({ ...sendFormData, [variable]: e.target.value })}
                        placeholder={`Enter ${variable}`}
                      />
                    </div>
                  ))}
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={handleClose} disabled={sending}>
                      Cancel
                    </Button>
                    <Button onClick={handleSendSubmit} disabled={sending}>
                      <Send className="h-4 w-4 mr-2" />
                      {sending ? 'Sending...' : 'Send Email'}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    This email will be sent to all eligible recipients automatically.
                  </p>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={handleClose} disabled={sending}>
                      Cancel
                    </Button>
                    <Button onClick={handleSendSubmit} disabled={sending}>
                      <Send className="h-4 w-4 mr-2" />
                      {sending ? 'Sending...' : 'Send to All'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function TemplateCard({ 
  template, 
  onPreview, 
  onEdit,
  onSend 
}: { 
  template: EmailTemplate; 
  onPreview: (template: EmailTemplate) => void;
  onEdit: (template: EmailTemplate) => void;
  onSend: (template: EmailTemplate) => void;
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{template.template_name}</CardTitle>
          </div>
          <Badge variant={template.source === 'database' ? 'default' : 'secondary'}>
            {template.source === 'database' ? 'DB' : 'Code'}
          </Badge>
        </div>
        <CardDescription className="text-sm mt-2">
          {template.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Subject:</p>
            <p className="text-sm font-semibold line-clamp-2">{template.subject}</p>
          </div>
          
          {template.trigger && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Trigger:</p>
              <p className="text-xs bg-muted px-2 py-1 rounded">{template.trigger}</p>
            </div>
          )}
          
          {template.variables && template.variables.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Variables:</p>
              <div className="flex flex-wrap gap-1">
                {template.variables.map((variable) => (
                  <Badge key={variable} variant="outline" className="text-xs">
                    {variable}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={() => onPreview(template)} className="flex-1">
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onEdit(template)}
              disabled={template.source === 'hardcoded'}
              className="flex-1"
            >
              <Edit2 className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
          {template.edge_function && (
            <Button 
              size="sm" 
              variant="default" 
              onClick={() => onSend(template)}
              className="w-full mt-2"
            >
              <Send className="h-4 w-4 mr-1" />
              Send Email
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
