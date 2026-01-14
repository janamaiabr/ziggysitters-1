import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Camera, 
  Plus, 
  Trash2,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface SitterPortfolioProps {
  profileId: string;
  userId: string;
  photos: string[];
  onPhotosChange: () => void;
  isOwnProfile?: boolean;
}

export default function SitterPortfolio({ 
  profileId, 
  userId, 
  photos, 
  onPhotosChange,
  isOwnProfile = true
}: SitterPortfolioProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        // Validate file
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} is over 5MB. Please use a smaller image.`,
            variant: "destructive",
          });
          continue;
        }

        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file",
            description: `${file.name} is not an image.`,
            variant: "destructive",
          });
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `${userId}/portfolio/${fileName}`;

        const { error } = await supabase.storage
          .from('profile-photos')
          .upload(filePath, file);

        if (error) {
          console.error('Upload error:', error);
          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}`,
            variant: "destructive",
          });
          continue;
        }
      }

      toast({
        title: "Photos uploaded! 📸",
        description: "Your portfolio has been updated.",
      });

      onPhotosChange();
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast({
        title: "Upload error",
        description: "An error occurred while uploading photos.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = photoUrl.split('/');
      const bucketIndex = urlParts.findIndex(part => part === 'profile-photos');
      if (bucketIndex === -1) return;

      const filePath = urlParts.slice(bucketIndex + 1).join('/');

      const { error } = await supabase.storage
        .from('profile-photos')
        .remove([filePath]);

      if (error) throw error;

      toast({
        title: "Photo deleted",
        description: "The photo has been removed from your portfolio.",
      });

      onPhotosChange();
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete the photo.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" />
          {isOwnProfile ? 'My Portfolio' : 'Photo Gallery'}
          {isOwnProfile && (
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              {photos.length} photo{photos.length !== 1 ? 's' : ''}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Upload section for own profile */}
        {isOwnProfile && (
          <div className="mb-4">
            <label htmlFor="portfolio-upload" className="cursor-pointer">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:border-primary/50 hover:bg-muted/50 transition-colors">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">
                  {uploading ? 'Uploading...' : 'Upload photos'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Show pet owners examples of your care
                </p>
              </div>
              <input
                id="portfolio-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Photo grid */}
        {photos.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo, index) => (
              <Dialog key={index}>
                <DialogTrigger asChild>
                  <div 
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img 
                      src={photo} 
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    {isOwnProfile && (
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(photo);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Portfolio Photo</DialogTitle>
                  </DialogHeader>
                  <img 
                    src={photo} 
                    alt={`Portfolio ${index + 1}`}
                    className="w-full h-auto rounded-lg"
                  />
                </DialogContent>
              </Dialog>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {isOwnProfile 
                ? 'Add photos to show pet owners your experience'
                : 'No portfolio photos yet'
              }
            </p>
            {isOwnProfile && (
              <p className="text-xs mt-1">
                Profiles with 3+ photos get 5x more enquiries
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
