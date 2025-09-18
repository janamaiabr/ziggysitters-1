import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, X, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

interface OnboardingStepProps {
  title: string;
  description: string;
  children: React.ReactNode;
  onNext?: () => void;
  onPrev?: () => void;
  showPrev?: boolean;
  showNext?: boolean;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
}

export function OnboardingStep({ 
  title, 
  description, 
  children, 
  onNext, 
  onPrev, 
  showPrev = false, 
  showNext = true,
  nextLabel = 'Next',
  nextDisabled = false,
  loading = false
}: OnboardingStepProps) {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold mb-2`}>{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {children}

      {(showPrev || showNext) && (
        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'justify-between'} ${isMobile ? 'pt-4' : 'pt-6'}`}>
          {showPrev ? (
            <Button
              variant="outline"
              onClick={onPrev}
              className={isMobile ? 'w-full' : 'px-6'}
            >
              Previous
            </Button>
          ) : !isMobile && <div />}
          
          {showNext && (
            <Button
              onClick={onNext}
              disabled={nextDisabled || loading}
              className={isMobile ? 'w-full' : 'px-6'}
            >
              {loading ? 'Saving...' : nextLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

interface FieldGroupProps {
  title?: string;
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
}

export function FieldGroup({ title, children, columns = 1 }: FieldGroupProps) {
  const isMobile = useIsMobile();
  const gridCols = isMobile ? 1 : columns;

  return (
    <div className="space-y-4">
      {title && <h3 className="font-medium text-lg">{title}</h3>}
      <div className={`grid grid-cols-${gridCols} gap-4`}>
        {children}
      </div>
    </div>
  );
}

interface ImageUploadProps {
  label: string;
  value: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  userId: string;
  bucket: string;
}

export function ImageUpload({ 
  label, 
  value, 
  onChange, 
  multiple = false, 
  maxFiles = 5,
  userId,
  bucket
}: ImageUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const isMobile = useIsMobile();

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (multiple && value.length + files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${bucket}-${Date.now()}-${index}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      
      if (multiple) {
        onChange([...value, ...uploadedUrls]);
      } else {
        onChange(uploadedUrls);
      }
      
      toast({
        title: "Upload successful!",
        description: `${uploadedUrls.length} ${uploadedUrls.length === 1 ? 'file' : 'files'} uploaded.`,
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={(e) => handleUpload(e.target.files)}
            className="hidden"
            id={`upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
            disabled={uploading}
          />
          <Label 
            htmlFor={`upload-${label.replace(/\s+/g, '-').toLowerCase()}`} 
            className="cursor-pointer"
          >
            <div className={`flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 ${uploading ? 'opacity-50' : ''}`}>
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'Uploading...' : `Upload ${multiple ? 'Images' : 'Image'}`}</span>
            </div>
          </Label>
        </div>
        
        {value.length > 0 && (
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
            {value.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface BadgeSelector {
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  maxSelections?: number;
}

export function BadgeSelector({ label, options, value, onChange, maxSelections }: BadgeSelector) {
  const isMobile = useIsMobile();

  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter(v => v !== option));
    } else {
      if (maxSelections && value.length >= maxSelections) return;
      onChange([...value, option]);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
        {options.map(option => (
          <Badge
            key={option}
            variant={value.includes(option) ? "default" : "outline"}
            className="cursor-pointer text-center py-2 hover:scale-105 transition-transform"
            onClick={() => toggleOption(option)}
          >
            {value.includes(option) && <CheckCircle className="w-3 h-3 mr-1" />}
            {option}
          </Badge>
        ))}
      </div>
      {maxSelections && (
        <p className="text-xs text-muted-foreground">
          {value.length}/{maxSelections} selected
        </p>
      )}
    </div>
  );
}