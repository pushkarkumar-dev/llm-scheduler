import { query } from '@/lib/db';

export async function GET() {
  try {
    await query('SELECT 1');
    return Response.json({ ok: true, db: 'connected' });
  } catch (err) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
