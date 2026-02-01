import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { compressImage, compressionPresets } from '@/lib/imageCompression';
import { ArrowLeft, HardDrive, Zap, Check, AlertCircle, Loader2, Trash2, Copy, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface LargeFile {
  id: string;
  name: string;
  size: number;
  sizeMB: number;
  bucket: string;
  created_at: string;
  selected: boolean;
  status: 'pending' | 'compressing' | 'done' | 'error' | 'deleting';
  newSize?: number;
}

interface DuplicateGroup {
  size: number;
  files: string[];
  selected: boolean;
}

interface OrphanFile {
  name: string;
  size: number;
  bucket: string;
  selected: boolean;
}

// Aggressive compression presets for storage recovery
const aggressivePresets = {
  avatar: {
    maxSizeMB: 0.15, // 150KB target (was 300KB)
    maxWidthOrHeight: 400,
    useWebWorker: true,
    fileType: 'image/jpeg' as const,
    initialQuality: 0.7,
  },
  portfolio: {
    maxSizeMB: 0.3, // 300KB target (was 500KB)  
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: 'image/jpeg' as const,
    initialQuality: 0.75,
  }
};

export default function AdminStorageOptimizer() {
  const [largeFiles, setLargeFiles] = useState<LargeFile[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [orphans, setOrphans] = useState<OrphanFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [compressing, setCompressing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0);
  const [activeTab, setActiveTab] = useState('compress');
  const [confirmDelete, setConfirmDelete] = useState<'duplicates' | 'orphans' | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchLargeFiles(),
      fetchDuplicates(),
      fetchOrphans()
    ]);
    setLoading(false);
  };

  const fetchLargeFiles = async () => {
    console.log('[StorageOptimizer] Fetching large files...');
    
    try {
      const buckets = ['profile-photos', 'pet-photos'];
      const allFiles: LargeFile[] = [];
      const SIZE_THRESHOLD = 200 * 1024; // 200KB threshold (aggressive)

      for (const bucket of buckets) {
        // List root level files
        const { data: rootFiles, error: rootError } = await supabase.storage
          .from(bucket)
          .list('', { limit: 1000 });

        if (rootError) {
          console.warn(`Error listing ${bucket}:`, rootError);
          continue;
        }

        // Process files - some might be in subdirectories
        for (const item of rootFiles || []) {
          // Check if it's a folder
          if (!item.metadata && item.id === null) {
            // It's a folder, list its contents recursively
            await listSubdirectory(bucket, item.name, allFiles, SIZE_THRESHOLD);
          } else {
            // It's a file
            if (!item.name) continue;
            
            const size = item.metadata?.size || 0;
            if (size > SIZE_THRESHOLD) {
              allFiles.push({
                id: item.id || item.name,
                name: item.name,
                size,
                sizeMB: Math.round((size / 1024 / 1024) * 100) / 100,
                bucket,
                created_at: item.created_at || '',
                selected: true,
                status: 'pending'
              });
            }
          }
        }
      }

      console.log(`[StorageOptimizer] Found ${allFiles.length} large files`);
      allFiles.sort((a, b) => b.size - a.size);
      setLargeFiles(allFiles);
    } catch (err: any) {
      console.error('[StorageOptimizer] Error:', err);
    }
  };

  const listSubdirectory = async (
    bucket: string, 
    path: string, 
    allFiles: LargeFile[], 
    threshold: number
  ) => {
    const { data: subFiles } = await supabase.storage
      .from(bucket)
      .list(path, { limit: 500 });
    
    for (const subFile of subFiles || []) {
      if (!subFile.name) continue;
      
      const fullPath = `${path}/${subFile.name}`;
      
      // Check if it's a nested folder
      if (!subFile.metadata && subFile.id === null) {
        await listSubdirectory(bucket, fullPath, allFiles, threshold);
      } else {
        const size = subFile.metadata?.size || 0;
        if (size > threshold) {
          allFiles.push({
            id: subFile.id || fullPath,
            name: fullPath,
            size,
            sizeMB: Math.round((size / 1024 / 1024) * 100) / 100,
            bucket,
            created_at: subFile.created_at || '',
            selected: true,
            status: 'pending'
          });
        }
      }
    }
  };

  const fetchDuplicates = async () => {
    console.log('[StorageOptimizer] Fetching duplicates...');
    
    try {
      // Client-side duplicate detection by file size
      const { data: files } = await supabase.storage
        .from('profile-photos')
        .list('', { limit: 1000 });

      const sizeMap = new Map<number, string[]>();
      
      // Process root files
      for (const file of files || []) {
        if (file.metadata?.size && file.metadata.size > 100000) {
          const size = file.metadata.size;
          if (!sizeMap.has(size)) {
            sizeMap.set(size, []);
          }
          sizeMap.get(size)!.push(file.name);
        }
        
        // Check subdirectories
        if (!file.metadata && file.id === null && file.name) {
          const { data: subFiles } = await supabase.storage
            .from('profile-photos')
            .list(file.name, { limit: 100 });
          
          for (const subFile of subFiles || []) {
            if (subFile.metadata?.size && subFile.metadata.size > 100000) {
              const size = subFile.metadata.size;
              const fullPath = `${file.name}/${subFile.name}`;
              if (!sizeMap.has(size)) {
                sizeMap.set(size, []);
              }
              sizeMap.get(size)!.push(fullPath);
            }
          }
        }
      }
      
      // Filter to only groups with duplicates
      const duplicateGroups: DuplicateGroup[] = [];
      sizeMap.forEach((fileNames, size) => {
        if (fileNames.length > 1) {
          duplicateGroups.push({
            size,
            files: fileNames,
            selected: true
          });
        }
      });
      
      // Sort by wasted space
      duplicateGroups.sort((a, b) => 
        (b.size * (b.files.length - 1)) - (a.size * (a.files.length - 1))
      );
      
      console.log(`[StorageOptimizer] Found ${duplicateGroups.length} duplicate groups`);
      setDuplicates(duplicateGroups);
    } catch (err) {
      console.log('Duplicate detection error:', err);
    }
  };

  const fetchOrphans = async () => {
    console.log('[StorageOptimizer] Fetching orphaned files...');
    
    try {
      // Get all profile IDs
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id');
      
      const profileIds = new Set(profiles?.map(p => p.id) || []);
      
      // List all files and check if owner exists
      const { data: files } = await supabase.storage
        .from('profile-photos')
        .list('', { limit: 1000 });
      
      const orphanFiles: OrphanFile[] = [];
      
      for (const file of files || []) {
        // Extract UUID from filename
        const uuidMatch = file.name?.match(/^([a-f0-9-]{36})/);
        if (uuidMatch) {
          const userId = uuidMatch[1];
          if (!profileIds.has(userId)) {
            orphanFiles.push({
              name: file.name,
              size: file.metadata?.size || 0,
              bucket: 'profile-photos',
              selected: true
            });
          }
        }
        
        // Also check folders
        if (!file.metadata && file.id === null && file.name) {
          const folderUuid = file.name;
          if (folderUuid.match(/^[a-f0-9-]{36}$/) && !profileIds.has(folderUuid)) {
            // Orphaned folder - list contents
            const { data: subFiles } = await supabase.storage
              .from('profile-photos')
              .list(file.name, { limit: 100 });
            
            for (const subFile of subFiles || []) {
              if (subFile.metadata?.size) {
                orphanFiles.push({
                  name: `${file.name}/${subFile.name}`,
                  size: subFile.metadata.size,
                  bucket: 'profile-photos',
                  selected: true
                });
              }
            }
          }
        }
      }
      
      console.log(`[StorageOptimizer] Found ${orphanFiles.length} orphaned files`);
      setOrphans(orphanFiles);
    } catch (err) {
      console.error('Error fetching orphans:', err);
    }
  };

  const toggleFile = (id: string) => {
    setLargeFiles(prev => prev.map(f => 
      f.id === id ? { ...f, selected: !f.selected } : f
    ));
  };

  const toggleAllFiles = (selected: boolean) => {
    setLargeFiles(prev => prev.map(f => ({ ...f, selected })));
  };

  const toggleOrphan = (name: string) => {
    setOrphans(prev => prev.map(f => 
      f.name === name ? { ...f, selected: !f.selected } : f
    ));
  };

  const toggleAllOrphans = (selected: boolean) => {
    setOrphans(prev => prev.map(f => ({ ...f, selected })));
  };

  const compressSelectedFiles = async () => {
    const selected = largeFiles.filter(f => f.selected && f.status === 'pending');
    if (selected.length === 0) return;

    setCompressing(true);
    setProgress(0);
    let saved = 0;

    for (let i = 0; i < selected.length; i++) {
      const file = selected[i];
      
      setLargeFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'compressing' } : f
      ));

      try {
        // Download the file
        const { data: blob, error: downloadError } = await supabase.storage
          .from(file.bucket)
          .download(file.name);

        if (downloadError) throw downloadError;

        // Convert to File object
        const originalFile = new File([blob], file.name, { type: blob.type });
        
        // Use aggressive presets
        const isAvatar = file.name.includes('avatar');
        const preset = isAvatar ? aggressivePresets.avatar : aggressivePresets.portfolio;

        // Compress
        const compressedFile = await compressImage(originalFile, preset);

        // Only re-upload if actually smaller
        if (compressedFile.size < originalFile.size * 0.9) { // At least 10% savings
          // Delete old file
          await supabase.storage
            .from(file.bucket)
            .remove([file.name]);

          // Upload compressed version
          const newName = file.name.replace(/\.[^/.]+$/, '.jpg');
          const { error: uploadError } = await supabase.storage
            .from(file.bucket)
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

    setTotalSaved(prev => prev + saved);
    setCompressing(false);
    
    toast({
      title: "Compression complete! 🎉",
      description: `Saved ${(saved / 1024 / 1024).toFixed(1)}MB of storage space.`
    });
  };

  const deleteOrphanedFiles = async () => {
    const selected = orphans.filter(f => f.selected);
    if (selected.length === 0) return;

    setDeleting(true);
    setProgress(0);
    let deleted = 0;
    let savedBytes = 0;

    for (let i = 0; i < selected.length; i++) {
      const file = selected[i];
      
      try {
        const { error } = await supabase.storage
          .from(file.bucket)
          .remove([file.name]);

        if (!error) {
          deleted++;
          savedBytes += file.size;
        }
      } catch (err) {
        console.error(`Error deleting ${file.name}:`, err);
      }

      setProgress(((i + 1) / selected.length) * 100);
    }

    setTotalSaved(prev => prev + savedBytes);
    setDeleting(false);
    setConfirmDelete(null);
    
    // Remove deleted files from list
    setOrphans(prev => prev.filter(f => !f.selected));
    
    toast({
      title: "Cleanup complete! 🗑️",
      description: `Deleted ${deleted} orphaned files, freed ${(savedBytes / 1024 / 1024).toFixed(1)}MB.`
    });
  };

  const deleteDuplicateFiles = async () => {
    const selected = duplicates.filter(d => d.selected);
    if (selected.length === 0) return;

    setDeleting(true);
    setProgress(0);
    let deleted = 0;
    let savedBytes = 0;

    for (let i = 0; i < selected.length; i++) {
      const group = selected[i];
      
      // Keep the first file, delete the rest
      const filesToDelete = group.files.slice(1);
      
      for (const fileName of filesToDelete) {
        try {
          const { error } = await supabase.storage
            .from('profile-photos')
            .remove([fileName]);

          if (!error) {
            deleted++;
            savedBytes += group.size;
          }
        } catch (err) {
          console.error(`Error deleting ${fileName}:`, err);
        }
      }

      setProgress(((i + 1) / selected.length) * 100);
    }

    setTotalSaved(prev => prev + savedBytes);
    setDeleting(false);
    setConfirmDelete(null);
    
    // Remove processed duplicates from list
    setDuplicates(prev => prev.filter(d => !d.selected));
    
    toast({
      title: "Duplicates removed! 🗑️",
      description: `Deleted ${deleted} duplicate files, freed ${(savedBytes / 1024 / 1024).toFixed(1)}MB.`
    });
  };

  const totalSize = largeFiles.reduce((sum, f) => sum + f.size, 0);
  const selectedSize = largeFiles.filter(f => f.selected).reduce((sum, f) => sum + f.size, 0);
  const selectedCount = largeFiles.filter(f => f.selected).length;
  const orphanSize = orphans.reduce((sum, f) => sum + f.size, 0);
  const selectedOrphanCount = orphans.filter(f => f.selected).length;
  const duplicateSize = duplicates.reduce((sum, d) => sum + (d.size * (d.files.length - 1)), 0);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <HardDrive className="h-6 w-6" />
              Storage Optimizer
            </h1>
            <p className="text-muted-foreground">
              Compress, deduplicate, and clean up storage to reduce from 1.35GB to under 1GB
            </p>
          </div>
          <Button variant="outline" onClick={fetchAllData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold">{largeFiles.length}</div>
              <div className="text-sm text-muted-foreground">Large files (&gt;200KB)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-destructive">{orphans.length}</div>
              <div className="text-sm text-muted-foreground">Orphaned files</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-secondary-foreground">{duplicates.length}</div>
              <div className="text-sm text-muted-foreground">Duplicate groups</div>
            </CardContent>
          </Card>
          <Card className="border-primary">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary">
                {(totalSaved / 1024 / 1024).toFixed(1)}MB
              </div>
              <div className="text-sm text-muted-foreground">Saved so far</div>
            </CardContent>
          </Card>
        </div>

        {/* Potential savings summary */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">📊 Potential Savings Estimate</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Compression (50% avg):</span>
                <span className="ml-2 font-medium">~{(totalSize / 1024 / 1024 / 2).toFixed(0)}MB</span>
              </div>
              <div>
                <span className="text-muted-foreground">Orphaned files:</span>
                <span className="ml-2 font-medium text-destructive">~{(orphanSize / 1024 / 1024).toFixed(0)}MB</span>
              </div>
              <div>
                <span className="text-muted-foreground">Duplicates:</span>
                <span className="ml-2 font-medium text-secondary-foreground">~{(duplicateSize / 1024 / 1024).toFixed(0)}MB</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="compress" className="gap-2">
              <Zap className="h-4 w-4" />
              Compress ({largeFiles.length})
            </TabsTrigger>
            <TabsTrigger value="orphans" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Orphans ({orphans.length})
            </TabsTrigger>
            <TabsTrigger value="duplicates" className="gap-2">
              <Copy className="h-4 w-4" />
              Duplicates ({duplicates.length})
            </TabsTrigger>
          </TabsList>

          {/* Compress Tab */}
          <TabsContent value="compress">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Large files to compress (aggressive mode: 150-300KB target)</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => toggleAllFiles(true)}>
                      Select all
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toggleAllFiles(false)}>
                      Clear
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Files will be compressed to JPEG format with aggressive quality settings
                </CardDescription>
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
                              {file.sizeMB}MB • {file.bucket}
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
                          <Badge variant={file.sizeMB > 2 ? "destructive" : "outline"}>
                            {file.sizeMB}MB
                          </Badge>
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
          </TabsContent>

          {/* Orphans Tab */}
          <TabsContent value="orphans">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Orphaned files (users deleted)</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => toggleAllOrphans(true)}>
                      Select all
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toggleAllOrphans(false)}>
                      Clear
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Files belonging to deleted users - safe to remove
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : orphans.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Check className="h-12 w-12 mx-auto mb-2 text-primary" />
                    <p>No orphaned files found!</p>
                  </div>
                ) : (
                  <>
                    {deleting && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Deleting...</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} />
                      </div>
                    )}

                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {orphans.map(file => (
                        <div 
                          key={file.name}
                          className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50"
                        >
                          <Checkbox 
                            checked={file.selected}
                            onCheckedChange={() => toggleOrphan(file.name)}
                            disabled={deleting}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)}MB
                            </p>
                          </div>
                          <Badge variant="destructive">
                            Orphan
                          </Badge>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        {selectedOrphanCount} files selected ({(orphans.filter(f => f.selected).reduce((s, f) => s + f.size, 0) / 1024 / 1024).toFixed(1)}MB)
                      </div>
                      <Button 
                        variant="destructive"
                        onClick={() => setConfirmDelete('orphans')}
                        disabled={deleting || selectedOrphanCount === 0}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete {selectedOrphanCount} orphaned files
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Duplicates Tab */}
          <TabsContent value="duplicates">
            <Card>
              <CardHeader>
                <CardTitle>Duplicate files (same size)</CardTitle>
                <CardDescription>
                  Files with identical sizes - keeps first, deletes duplicates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : duplicates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Check className="h-12 w-12 mx-auto mb-2 text-primary" />
                    <p>No duplicate files detected!</p>
                    <p className="text-xs mt-2">Duplicates are detected by matching file sizes.</p>
                  </div>
                ) : (
                  <>
                    <div className="max-h-96 overflow-y-auto space-y-3">
                      {duplicates.map((group, idx) => (
                        <div 
                          key={idx}
                          className="p-3 rounded-lg border bg-card"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <Checkbox 
                              checked={group.selected}
                              onCheckedChange={() => {
                                setDuplicates(prev => prev.map((d, i) => 
                                  i === idx ? { ...d, selected: !d.selected } : d
                                ));
                              }}
                              disabled={deleting}
                            />
                            <Badge variant="outline">
                              {(group.size / 1024 / 1024).toFixed(2)}MB each × {group.files.length} copies
                            </Badge>
                            <span className="text-sm text-destructive">
                              Wastes {((group.size * (group.files.length - 1)) / 1024 / 1024).toFixed(1)}MB
                            </span>
                          </div>
                      <div className="pl-8 space-y-1">
                            {group.files.map((file, fileIdx) => (
                              <p key={file} className={`text-xs truncate ${fileIdx === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                                {fileIdx === 0 ? '✓ Keep: ' : '✗ Delete: '}{file}
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        {duplicates.filter(d => d.selected).length} groups selected
                      </div>
                      <Button 
                        variant="destructive"
                        onClick={() => setConfirmDelete('duplicates')}
                        disabled={deleting || duplicates.filter(d => d.selected).length === 0}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove duplicates
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={confirmDelete !== null} onOpenChange={() => setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete === 'orphans' 
                ? `This will permanently delete ${selectedOrphanCount} orphaned files. These files belong to deleted users and are safe to remove.`
                : `This will delete duplicate copies, keeping only the original. ${duplicates.filter(d => d.selected).length} duplicate groups will be cleaned up.`
              }
              <br /><br />
              <strong>This action cannot be undone.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirmDelete === 'orphans') {
                  deleteOrphanedFiles();
                } else {
                  deleteDuplicateFiles();
                }
              }}
            >
              Delete Files
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
