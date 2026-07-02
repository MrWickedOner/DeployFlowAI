/**
 * POST /api/campaigns
 * Creates a new outreach campaign for a lead.
 * GET /api/campaigns
 * Lists all campaigns (optionally filtered by lead_id).
 */

import { db } from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('lead_id');

    let campaigns;
    if (leadId) {
      campaigns = await db.getCampaignsByLead(leadId);
    } else {
      campaigns = await db.getCampaigns();
    }

    return NextResponse.json(campaigns);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const saved = await db.saveCampaign(body);
    return NextResponse.json(saved, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, status, ...extra } = body;
    if (!id) {
      return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 });
    }
    await db.updateCampaignStatus(id, status, extra);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}