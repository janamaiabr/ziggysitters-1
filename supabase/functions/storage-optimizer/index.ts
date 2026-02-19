import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

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
      // List files via storage API
      const { data: storageFiles, error: listError } = await supabase.storage
        .from(bucket)
        .list('', { limit: 1000 })

      if (listError) throw listError

      // Get file details with sizes
      const filesWithSizes = []
      for (const file of storageFiles || []) {
        if (file.name) {
          // Get public URL to check if file exists
          const { data } = supabase.storage.from(bucket).getPublicUrl(file.name)
          filesWithSizes.push({
            id: file.id,
            name: file.name,
            sizeMB: file.metadata?.size ? Math.round((file.metadata.size) / 1024 / 1024 * 100) / 100 : 0,
            bucket: bucket,
            created_at: file.created_at,
            url: data.publicUrl
          })
        }
      }

      // Filter to large files
      const largeFiles = filesWithSizes
        .filter(f => f.sizeMB > minSizeMB)
        .sort((a, b) => b.sizeMB - a.sizeMB)

      const totalMB = largeFiles.reduce((sum, f) => sum + f.sizeMB, 0)

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

      const { error } = await supabase.storage
        .from(bucket)
        .remove(filesToDelete)

      if (error) throw error

      // Auto-clear broken DB references when deleting from verification-docs
      if (bucket === 'verification-docs') {
        for (const file of filesToDelete) {
          const fullUrl = `${supabaseUrl}/storage/v1/object/public/verification-docs/${file}`
          // Clear id_document_url references
          await supabase
            .from('profiles')
            .update({ id_document_url: null, verification_documents_uploaded_at: null, verification_status: 'pending' })
            .eq('id_document_url', fullUrl)
          // Clear blue_card_document_url references
          await supabase
            .from('profiles')
            .update({ blue_card_document_url: null })
            .eq('blue_card_document_url', fullUrl)
        }
      }

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
        const { data, error } = await supabase.storage
          .from(b)
          .list('', { limit: 1000 })

        if (!error && data) {
          let totalSize = 0
          for (const file of data) {
            totalSize += file.metadata?.size || 0
          }
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
