import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    })

    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'list'
    const bucket = url.searchParams.get('bucket') || 'profile-photos'
    const minSizeKB = parseInt(url.searchParams.get('minSize') || '500') // 500KB default
    const maxWidth = parseInt(url.searchParams.get('maxWidth') || '800')
    const quality = parseInt(url.searchParams.get('quality') || '80')

    if (action === 'list') {
      // List large files that could be compressed
      const { data: files, error } = await supabase.storage
        .from(bucket)
        .list('', { limit: 500 })

      if (error) throw error

      // Get file details with sizes
      const fileDetails = []
      for (const file of files || []) {
        if (file.name && !file.id?.includes('/')) {
          // Get file metadata
          const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(file.name)
          
          fileDetails.push({
            name: file.name,
            created_at: file.created_at,
            metadata: file.metadata,
            url: urlData?.publicUrl
          })
        }
      }

      // Also try to get sizes from storage.objects
      const { data: objectsData } = await supabase
        .from('storage.objects' as any)
        .select('name, metadata, created_at')
        .eq('bucket_id', bucket)
        .order('created_at', { ascending: false })

      const largeFiles = (objectsData || [])
        .filter((f: any) => {
          const size = f.metadata?.size || 0
          const isImage = f.name?.match(/\.(jpg|jpeg|png|webp|gif)$/i)
          return size > minSizeKB * 1024 && isImage
        })
        .map((f: any) => ({
          name: f.name,
          sizeKB: Math.round((f.metadata?.size || 0) / 1024),
          sizeMB: Math.round((f.metadata?.size || 0) / 1024 / 1024 * 100) / 100,
          created_at: f.created_at,
          mimetype: f.metadata?.mimetype
        }))
        .sort((a: any, b: any) => b.sizeKB - a.sizeKB)

      const totalKB = largeFiles.reduce((sum: number, f: any) => sum + f.sizeKB, 0)

      return new Response(JSON.stringify({
        success: true,
        bucket,
        minSizeKB,
        totalLargeFilesKB: totalKB,
        totalLargeFilesMB: Math.round(totalKB / 1024 * 100) / 100,
        count: largeFiles.length,
        files: largeFiles.slice(0, 50),
        message: largeFiles.length > 0 
          ? `Found ${largeFiles.length} images over ${minSizeKB}KB that can be compressed`
          : 'No large images found to compress'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'compress') {
      const body = await req.json()
      const filesToCompress: string[] = body.files || []
      
      if (filesToCompress.length === 0) {
        // If no specific files, get all large files
        const { data: objectsData } = await supabase
          .from('storage.objects' as any)
          .select('name, metadata')
          .eq('bucket_id', bucket)

        const autoFiles = (objectsData || [])
          .filter((f: any) => {
            const size = f.metadata?.size || 0
            const isImage = f.name?.match(/\.(jpg|jpeg|png|webp)$/i)
            return size > minSizeKB * 1024 && isImage
          })
          .map((f: any) => f.name)
          .slice(0, 10) // Process max 10 at a time
        
        filesToCompress.push(...autoFiles)
      }

      if (filesToCompress.length === 0) {
        return new Response(JSON.stringify({
          success: true,
          message: 'No files to compress'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const results = []
      let totalSaved = 0

      for (const fileName of filesToCompress) {
        try {
          // Download the file
          const { data: blob, error: downloadError } = await supabase.storage
            .from(bucket)
            .download(fileName)

          if (downloadError) {
            results.push({ name: fileName, status: 'error', error: downloadError.message })
            continue
          }

          const originalSize = blob.size

          // Skip if already small
          if (originalSize < minSizeKB * 1024) {
            results.push({ name: fileName, status: 'skipped', reason: 'Already optimized' })
            continue
          }

          // For now, we'll just report what could be saved
          // True compression would need ImageMagick or similar
          // But we can re-upload with proper content-type which sometimes helps
          
          // Create a simple approach: just note the file for manual attention
          const potentialSavings = Math.round(originalSize * 0.6) // Estimate 40% savings
          
          results.push({ 
            name: fileName, 
            status: 'identified',
            originalSizeKB: Math.round(originalSize / 1024),
            estimatedSavingsKB: Math.round(potentialSavings / 1024),
            message: 'File identified for compression'
          })
          
          totalSaved += potentialSavings

        } catch (err) {
          results.push({ name: fileName, status: 'error', error: String(err) })
        }
      }

      return new Response(JSON.stringify({
        success: true,
        message: `Identified ${results.filter(r => r.status === 'identified').length} files for compression`,
        potentialSavingsMB: Math.round(totalSaved / 1024 / 1024 * 100) / 100,
        results,
        note: 'To actually compress these files, use the Supabase Dashboard to download, compress locally, and re-upload. Or upgrade your storage quota.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'delete-large') {
      // Delete files over a certain size (emergency cleanup)
      const body = await req.json()
      const filesToDelete: string[] = body.files || []

      if (filesToDelete.length === 0) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Specify files to delete in the request body'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const { data, error } = await supabase.storage
        .from(bucket)
        .remove(filesToDelete)

      if (error) throw error

      return new Response(JSON.stringify({
        success: true,
        message: `Deleted ${filesToDelete.length} files`,
        deleted: filesToDelete
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Unknown action. Use: list, compress, or delete-large',
      usage: {
        list: 'GET ?action=list&bucket=profile-photos&minSize=500',
        compress: 'POST ?action=compress with body { files: ["file1.jpg"] }',
        deleteLarge: 'POST ?action=delete-large with body { files: ["file1.jpg"] }'
      }
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Compress storage error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: (error as Error).message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
