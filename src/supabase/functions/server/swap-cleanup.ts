/**
 * SWAP Storage Cleanup - Automatic lifecycle management
 * 
 * This runs periodically (via cron) to:
 * 1. Mark expired items (7+ days old)
 * 2. Archive old items (30+ days old)
 * 3. Delete images from Supabase Storage
 * 4. Track storage savings
 * 
 * Call via: POST /make-server-053bcd80/swap-cleanup
 * Or setup a cron job to call this daily
 */

import { Hono } from 'npm:hono';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const app = new Hono();

// ================================================
// TYPES
// ================================================

interface CleanupStats {
  items_expired: number;
  items_archived: number;
  storage_freed_mb: number;
  images_deleted: number;
  errors: string[];
}

interface ImageToDelete {
  item_id: string;
  image_url: string;
  storage_path: string | null;
  status: string;
}

// ================================================
// HELPER: Extract storage path from URL
// ================================================

function extractStoragePath(imageUrl: string): string | null {
  if (!imageUrl) return null;
  
  // Match: .../storage/v1/object/public/bucket-name/path/to/file.jpg
  // Or: .../storage/v1/object/authenticated/bucket-name/path/to/file.jpg
  const match = imageUrl.match(/\/storage\/v1\/object\/(public|authenticated)\/([^\/]+)\/(.+)$/);
  if (match) {
    const bucket = match[2];
    const path = match[3];
    return `${bucket}/${path}`;
  }
  
  // Match: base64 or data URLs (skip these)
  if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
    return null;
  }
  
  // Match: already archived
  if (imageUrl.startsWith('archived://')) {
    return null;
  }
  
  return null;
}

// ================================================
// CLEANUP ROUTE
// ================================================

app.post('/swap-cleanup', async (c) => {
  console.log('🧹 Starting SWAP cleanup...');
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const stats: CleanupStats = {
    items_expired: 0,
    items_archived: 0,
    storage_freed_mb: 0,
    images_deleted: 0,
    errors: []
  };

  try {
    // ================================================
    // STEP 1: Run cleanup function in database
    // ================================================
    console.log('📊 Running cleanup_expired_swap_items()...');
    
    const { data: cleanupResult, error: cleanupError } = await supabase
      .rpc('cleanup_expired_swap_items');

    if (cleanupError) {
      console.error('❌ Cleanup function error:', cleanupError);
      stats.errors.push(`Cleanup function: ${cleanupError.message}`);
    } else if (cleanupResult && cleanupResult.length > 0) {
      stats.items_expired = cleanupResult[0].items_expired || 0;
      stats.items_archived = cleanupResult[0].items_archived || 0;
      stats.storage_freed_mb = cleanupResult[0].storage_freed_mb || 0;
      
      console.log(`✅ Expired: ${stats.items_expired}, Archived: ${stats.items_archived}`);
    }

    // ================================================
    // STEP 2: Get images that need deletion
    // ================================================
    console.log('🖼️  Fetching images to delete...');
    
    const { data: imagesToDelete, error: imagesError } = await supabase
      .rpc('get_images_to_delete') as { data: ImageToDelete[], error: any };

    if (imagesError) {
      console.error('❌ Get images error:', imagesError);
      stats.errors.push(`Get images: ${imagesError.message}`);
    } else if (imagesToDelete && imagesToDelete.length > 0) {
      console.log(`📦 Found ${imagesToDelete.length} images to delete`);

      // ================================================
      // STEP 3: Delete images from Supabase Storage
      // ================================================
      for (const image of imagesToDelete) {
        try {
          let storagePath = image.storage_path || extractStoragePath(image.image_url);
          
          if (!storagePath) {
            console.log(`⏭️  Skipping ${image.item_id}: No valid storage path`);
            // Mark as deleted anyway (base64 or invalid URL)
            await supabase.rpc('mark_image_deleted', { p_item_id: image.item_id });
            continue;
          }

          // Parse bucket and path
          const [bucket, ...pathParts] = storagePath.split('/');
          const filePath = pathParts.join('/');

          console.log(`🗑️  Deleting: ${bucket}/${filePath}`);

          // Delete from storage
          const { error: deleteError } = await supabase.storage
            .from(bucket)
            .remove([filePath]);

          if (deleteError) {
            console.error(`❌ Failed to delete ${filePath}:`, deleteError);
            stats.errors.push(`Delete ${image.item_id}: ${deleteError.message}`);
          } else {
            console.log(`✅ Deleted: ${filePath}`);
            stats.images_deleted++;

            // Mark as deleted in database
            await supabase.rpc('mark_image_deleted', { p_item_id: image.item_id });
          }
        } catch (error) {
          console.error(`❌ Error processing ${image.item_id}:`, error);
          stats.errors.push(`Process ${image.item_id}: ${error.message}`);
        }
      }
    } else {
      console.log('✨ No images to delete');
    }

    // ================================================
    // STEP 4: Log analytics
    // ================================================
    console.log('📈 Fetching storage analytics...');
    
    const { data: analytics, error: analyticsError } = await supabase
      .from('swap_storage_analytics')
      .select('*');

    if (analyticsError) {
      console.error('❌ Analytics error:', analyticsError);
    } else {
      console.log('📊 Storage analytics:');
      console.table(analytics);
    }

    // ================================================
    // STEP 5: Return results
    // ================================================
    const response = {
      success: stats.errors.length === 0,
      timestamp: new Date().toISOString(),
      stats,
      analytics: analytics || []
    };

    console.log('🎉 Cleanup complete!');
    console.log(JSON.stringify(response, null, 2));

    return c.json(response);

  } catch (error) {
    console.error('💥 Cleanup failed:', error);
    return c.json({
      success: false,
      error: error.message,
      stats
    }, 500);
  }
});

// ================================================
// MANUAL TRIGGER (for testing)
// ================================================

app.get('/swap-cleanup/test', async (c) => {
  return c.json({
    message: 'Use POST to run cleanup',
    endpoint: '/make-server-053bcd80/swap-cleanup',
    info: {
      what_it_does: [
        'Mark items as expired after 7 days',
        'Archive items after 30 days',
        'Delete images from storage',
        'Track storage savings'
      ],
      safe_to_run: true,
      idempotent: true
    }
  });
});

// ================================================
// CRON SETUP INSTRUCTIONS
// ================================================

app.get('/swap-cleanup/cron-setup', async (c) => {
  return c.json({
    title: 'SWAP Cleanup Cron Setup',
    instructions: [
      '1. Go to Supabase Dashboard → Database → Cron Jobs',
      '2. Create new cron job',
      '3. Name: "SWAP Cleanup"',
      '4. Schedule: "0 2 * * *" (daily at 2am)',
      '5. Command: SELECT net.http_post(...)',
      '6. See example below'
    ],
    example_sql: `
      -- Run cleanup daily at 2am
      SELECT cron.schedule(
        'swap-cleanup-daily',
        '0 2 * * *',  -- Every day at 2am
        $$
        SELECT net.http_post(
          url := 'https://YOUR_PROJECT.supabase.co/functions/v1/make-server-053bcd80/swap-cleanup',
          headers := jsonb_build_object(
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
          )
        );
        $$
      );
    `,
    alternative: 'Use GitHub Actions, Vercel Cron, or any scheduler to POST this endpoint daily',
    manual_trigger: 'POST /make-server-053bcd80/swap-cleanup'
  });
});

export default app;
