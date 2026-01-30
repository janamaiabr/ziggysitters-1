import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { compressImage, compressionPresets } from '@/lib/imageCompression';
import { ArrowLeft, HardDrive, Zap, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface LargeFile {
  id: string;
  name: string;
  size: number;
  sizeMB: number;
  bucket: string;
  created_at: string;
  selected: boolean;
  status: 'pending' | 'compressing' | 'done' | 'error';
  newSize?: number;
}

export default function AdminStorageOptimizer() {
  const [largeFiles, setLargeFiles] = useState<LargeFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [compressing, setCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchLargeFiles();
  }, []);

  const fetchLargeFiles = async () => {
    setLoading(true);
    console.log('[StorageOptimizer] Starting to fetch files from storage buckets...');
    
    try {
      const buckets = ['profile-photos', 'pet-photos', 'verification-docs'];
      const allFiles: LargeFile[] = [];

      for (const bucket of buckets) {
        console.log(`[StorageOptimizer] Listing files in bucket: ${bucket}`);
        
        // List root level files
        const { data: rootFiles, error: rootError } = await supabase.storage
          .from(bucket)
          .list('', { limit: 500 });

        if (rootError) {
          console.warn(`[StorageOptimizer] Error listing ${bucket}:`, rootError);
          continue;
        }

        console.log(`[StorageOptimizer] Found ${rootFiles?.length || 0} items in ${bucket}`);

        // Process files - some might be in subdirectories
        for (const item of rootFiles || []) {
          // Check if it's a folder (has no metadata or id is null)
          if (!item.metadata && item.id === null) {
            // It's a folder, list its contents
            const { data: subFiles } = await supabase.storage
              .from(bucket)
              .list(item.name, { limit: 500 });
            
            for (const subFile of subFiles || []) {
              if (!subFile.name || subFile.id === null) continue;
              
              const sizeMB = subFile.metadata?.size 
                ? Math.round((subFile.metadata.size / 1024 / 1024) * 100) / 100 
                : 0;

              if (sizeMB > 1) {
                allFiles.push({
                  id: subFile.id || `${item.name}/${subFile.name}`,
                  name: `${item.name}/${subFile.name}`,
                  size: subFile.metadata?.size || 0,
                  sizeMB,
                  bucket,
                  created_at: subFile.created_at || '',
                  selected: true,
                  status: 'pending' as const
                });
              }
            }
          } else {
            // It's a file
            if (!item.name) continue;
            
            const sizeMB = item.metadata?.size 
              ? Math.round((item.metadata.size / 1024 / 1024) * 100) / 100 
              : 0;

            if (sizeMB > 1) {
              allFiles.push({
                id: item.id || item.name,
                name: item.name,
                size: item.metadata?.size || 0,
                sizeMB,
                bucket,
                created_at: item.created_at || '',
                selected: true,
                status: 'pending' as const
              });
            }
          }
        }
      }

      console.log(`[StorageOptimizer] Total large files found: ${allFiles.length}`);
      
      // Sort by size descending
      allFiles.sort((a, b) => b.sizeMB - a.sizeMB);
      setLargeFiles(allFiles);
      
      if (allFiles.length === 0) {
        toast({
          title: "All optimized!",
          description: "No files larger than 1MB found in storage.",
        });
      }
    } catch (err: any) {
      console.error('[StorageOptimizer] Error fetching files:', err);
      toast({
        title: "Error",
        description: err?.message || "Failed to fetch files. Make sure you have admin access.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const toggleFile = (id: string) => {
    setLargeFiles(prev => prev.map(f => 
      f.id === id ? { ...f, selected: !f.selected } : f
    ));
  };

  const toggleAll = (selected: boolean) => {
    setLargeFiles(prev => prev.map(f => ({ ...f, selected })));
  };

  const compressSelectedFiles = async () => {
    const selected = largeFiles.filter(f => f.selected && f.status === 'pending');
    if (selected.length === 0) return;

    setCompressing(true);
    setProgress(0);
    let saved = 0;

    for (let i = 0; i < selected.length; i++) {
      const file = selected[i];
      
      // Update status
      setLargeFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'compressing' } : f
      ));

      try {
        // Download the file
        const { data: blob, error: downloadError } = await supabase.storage
          .from('profile-photos')
          .download(file.name);

        if (downloadError) throw downloadError;

        // Convert to File object
        const originalFile = new File([blob], file.name, { type: blob.type });
        
        // Determine compression preset based on path
        const isAvatar = file.name.includes('avatar');
        const preset = isAvatar ? compressionPresets.avatar : compressionPresets.portfolio;

        // Compress
        const compressedFile = await compressImage(originalFile, preset);

        // Only re-upload if actually smaller
        if (compressedFile.size < originalFile.size) {
          // Delete old file and upload compressed version
          const { error: deleteError } = await supabase.storage
            .from('profile-photos')
            .remove([file.name]);

          if (deleteError) {
            console.warn('Delete error (continuing anyway):', deleteError);
          }

          // Upload with same path but .jpg extension for compressed
          const newName = file.name.replace(/\.[^/.]+$/, '.jpg');
          const { error: uploadError } = await supabase.storage
            .from('profile-photos')
            .upload(newName, compressedFile, { upsert: true });

          if (uploadError) throw uploadError;

          const savedBytes = file.size - compressedFile.size;
          saved += savedBytes;

          setLargeFiles(prev => prev.map(f => 
            f.id === file.id ? { 
              ...f, 
              status: 'done', 
              newSize: compressedFile.size 
            } : f
          ));
        } else {
          // Already optimized
          setLargeFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'done', newSize: file.size } : f
          ));
        }
      } catch (err) {
        console.error(`Error compressing ${file.name}:`, err);
        setLargeFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: 'error' } : f
        ));
      }

      setProgress(((i + 1) / selected.length) * 100);
    }

    setTotalSaved(saved);
    setCompressing(false);
    
    toast({
      title: "Compression complete! 🎉",
      description: `Saved ${(saved / 1024 / 1024).toFixed(1)}MB of storage space.`
    });
  };

  const totalSize = largeFiles.reduce((sum, f) => sum + f.size, 0);
  const selectedSize = largeFiles.filter(f => f.selected).reduce((sum, f) => sum + f.size, 0);
  const selectedCount = largeFiles.filter(f => f.selected).length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <HardDrive className="h-6 w-6" />
              Storage Optimizer
            </h1>
            <p className="text-muted-foreground">
              Compress large images to free up storage quota
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold">{largeFiles.length}</div>
              <div className="text-sm text-muted-foreground">Large files (&gt;1MB)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold">{(totalSize / 1024 / 1024).toFixed(0)}MB</div>
              <div className="text-sm text-muted-foreground">Total size</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary">
                {(totalSaved / 1024 / 1024).toFixed(1)}MB
              </div>
              <div className="text-sm text-muted-foreground">Saved so far</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Select files to compress</span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toggleAll(true)}
                >
                  Select all
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toggleAll(false)}
                >
                  Clear
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : largeFiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Check className="h-12 w-12 mx-auto mb-2 text-primary" />
                <p>No large files found! Storage is already optimized.</p>
              </div>
            ) : (
              <>
                {compressing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Compressing...</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {largeFiles.map(file => (
                    <div 
                      key={file.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50"
                    >
                      <Checkbox 
                        checked={file.selected}
                        onCheckedChange={() => toggleFile(file.id)}
                        disabled={compressing || file.status !== 'pending'}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.sizeMB}MB
                          {file.newSize && (
                            <span className="text-primary ml-2">
                              → {(file.newSize / 1024 / 1024).toFixed(2)}MB
                              ({Math.round((1 - file.newSize / file.size) * 100)}% saved)
                            </span>
                          )}
                        </p>
                      </div>
                      {file.status === 'compressing' && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {file.status === 'done' && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                      {file.status === 'error' && (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                      <Badge variant="outline">{file.sizeMB}MB</Badge>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    {selectedCount} files selected ({(selectedSize / 1024 / 1024).toFixed(0)}MB)
                  </div>
                  <Button 
                    onClick={compressSelectedFiles}
                    disabled={compressing || selectedCount === 0}
                  >
                    {compressing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Compressing...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Compress {selectedCount} files
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
