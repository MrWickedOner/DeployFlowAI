/**
 * POST /api/campaigns/send
 * Sends a personalized outreach email to a lead with Standard & Premium preview links.
 *
 * Request body:
 *   { leadId: string, subject?: string, body?: string }
 *
 * If no subject/body provided, auto-generates from the lead's data.
 */

import { db } from '../../../../lib/db';
import { sendEmail, generateOutreachEmail } from '../../../../lib/email';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { leadId, subject, body } = await request.json();
    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 });
    }

    // Look up the lead
    const leads = await db.getLeads();
    const lead = leads.find(l => l.id === leadId);
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Get the agency profile for the sender identity
    const profiles = await db.getProfiles();
    const profile = profiles[0] || {};
    const agencyName = profile.agency_name || 'DeployFlow AI';

    // Generate or use provided content
    const emailContent = (subject && body)
      ? { subject, body }
      : generateOutreachEmail(lead, { agencyName });

    // Send the email
    const result = await sendEmail({
      to: lead.email,
      subject: emailContent.subject,
      body: emailContent.body,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Save the campaign record
    const campaign = await db.saveCampaign({
      lead_id: leadId,
      agency_id: profile.id || '00000000-0000-0000-0000-000000000000',
      subject: emailContent.subject,
      body: emailContent.body,
      status: 'sent',
      sent_at: new Date().toISOString(),
    });

    // Update the lead's status
    await db.updateLead(leadId, { status: 'contacted' });

    return NextResponse.json({
      success: true,
      campaignId: campaign.id,
      message: `Campaign sent to ${lead.business_name || lead.contact_name || lead.email}`
    });
  } catch (err) {
    console.error('❌ Campaign send error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}