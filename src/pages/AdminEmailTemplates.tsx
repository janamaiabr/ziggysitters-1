import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, Save, Eye, Edit2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AdminNav } from "@/components/admin/AdminNav";

interface EmailTemplate {
  id: string;
  template_key: string;
  template_name: string;
  subject: string;
  html_content: string;
  description: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminEmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    html_content: "",
    description: "",
  });

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
      
      // Cast variables from Json to string[]
      const templatesWithCastedVariables = (data || []).map(template => ({
        ...template,
        variables: Array.isArray(template.variables) 
          ? (template.variables as string[]).filter(v => typeof v === 'string')
          : []
      }));
      
      setTemplates(templatesWithCastedVariables as EmailTemplate[]);
    } catch (error: any) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load email templates");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      subject: template.subject,
      html_content: template.html_content,
      description: template.description,
    });
    setEditMode(true);
    setPreviewMode(false);
  };

  const handlePreview = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setPreviewMode(true);
    setEditMode(false);
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;

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
    setEditMode(false);
    setPreviewMode(false);
    setSelectedTemplate(null);
  };

  const replaceVariables = (content: string, variables: string[]) => {
    let result = content;
    variables.forEach((variable) => {
      const placeholder = `{${variable}}`;
      result = result.replace(new RegExp(placeholder, "g"), `<span style="background: #fef3c7; padding: 2px 4px; border-radius: 3px; font-weight: 600;">${variable}</span>`);
    });
    return result;
  };

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
          <h1 className="text-3xl font-bold">Email Templates</h1>
          <p className="text-muted-foreground">View and edit all email templates sent by the platform</p>
        </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{template.template_name}</CardTitle>
                </div>
                {template.is_active && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                )}
              </div>
              <CardDescription className="text-sm mt-2">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Subject:</p>
                  <p className="text-sm">{template.subject}</p>
                </div>
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
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handlePreview(template)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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

      {/* Preview Dialog */}
      <Dialog open={previewMode} onOpenChange={handleClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview: {selectedTemplate?.template_name}</DialogTitle>
            <DialogDescription>
              This is how the email will appear to recipients. Variables are highlighted in yellow.
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
      </div>
    </div>
  );
}
