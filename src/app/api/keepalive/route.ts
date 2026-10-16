import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Daily keep-alive for the Supabase Free plan, which pauses projects after
 * ~7 days of low database activity. Runs one tiny read-only query; a failure
 * returns 500 so it surfaces in Vercel logs.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await createAdminClient()
    .from('site_documents')
    .select('slug')
    .limit(1);

  if (error) {
    console.error('[keepalive] database query failed:', error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
