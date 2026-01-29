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
    const minSizeMB = parseFloat(url.searchParams.get('minSize') || '1')

    if (action === 'list') {
      // List large files
      const { data: files, error } = await supabase
        .from('storage.objects' as any)
        .select('id, name, metadata, created_at, bucket_id')
        .eq('bucket_id', bucket)
        .order('created_at', { ascending: false })

      if (error) {
        // Fallback: list via storage API
        const { data: storageFiles, error: listError } = await supabase.storage
          .from(bucket)
          .list('', { limit: 1000 })

        if (listError) throw listError

        return new Response(JSON.stringify({
          success: true,
          message: 'Listed files (no size info available via storage API)',
          files: storageFiles?.slice(0, 50) || [],
          note: 'Use Supabase Dashboard SQL Editor to query storage.objects for sizes'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const largeFiles = (files || [])
        .filter((f: any) => {
          const size = f.metadata?.size || 0
          return size > minSizeMB * 1024 * 1024
        })
        .map((f: any) => ({
          id: f.id,
          name: f.name,
          sizeMB: Math.round((f.metadata?.size || 0) / 1024 / 1024 * 100) / 100,
          bucket: f.bucket_id,
          created_at: f.created_at
        }))
        .sort((a: any, b: any) => b.sizeMB - a.sizeMB)

      const totalMB = largeFiles.reduce((sum: number, f: any) => sum + f.sizeMB, 0)

      return new Response(JSON.stringify({
        success: true,
        bucket,
        minSizeMB,
        totalLargeFilesMB: Math.round(totalMB * 100) / 100,
        count: largeFiles.length,
        files: largeFiles.slice(0, 100)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'delete') {
      const body = await req.json()
      const filesToDelete: string[] = body.files || []

      if (filesToDelete.length === 0) {
        return new Response(JSON.stringify({
          success: false,
          error: 'No files specified for deletion'
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
        message: `Deleted ${filesToDelete.length} files from ${bucket}`,
        deleted: filesToDelete
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'stats') {
      // Get storage stats for all buckets
      const buckets = ['profile-photos', 'verification-docs', 'pet-photos']
      const stats = []

      for (const b of buckets) {
        const { data, error } = await supabase
          .from('storage.objects' as any)
          .select('metadata')
          .eq('bucket_id', b)

        if (!error && data) {
          const totalSize = data.reduce((sum: number, f: any) => sum + (f.metadata?.size || 0), 0)
          stats.push({
            bucket: b,
            fileCount: data.length,
            totalMB: Math.round(totalSize / 1024 / 1024 * 100) / 100
          })
        }
      }

      return new Response(JSON.stringify({
        success: true,
        stats,
        totalMB: stats.reduce((sum, s) => sum + s.totalMB, 0)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Unknown action. Use: list, delete, or stats'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Storage optimizer error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
