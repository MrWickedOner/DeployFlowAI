import { db } from '../../../lib/db';
import { NextResponse } from 'next/server';

/**
 * GET /api/leads
 * Retrieves all leads from Supabase with fallback to local JSON database.
 */
export async function GET() {
  try {
    const leads = await db.getLeads();
    return NextResponse.json(leads);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/leads
 * Saves/updates a single lead in Supabase or falls back to local JSON database.
 */
export async function POST(request) {
  try {
    const leadData = await request.json();
    const savedLead = await db.saveLead(leadData);
    return NextResponse.json(savedLead);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
