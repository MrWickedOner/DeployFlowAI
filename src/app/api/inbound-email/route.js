/**
 * POST /api/inbound-email
 * Webhook endpoint for receiving inbound email replies from leads.
 *
 * This endpoint is called by the email provider (Resend, SendGrid)
 * when a lead replies to an outreach campaign email.
 *
 * It triggers the AI negotiation engine to analyze the reply and
 * generate an appropriate sales response.
 *
 * Expected payload:
 *   {
 *     email: string,           // Lead's email address (from address)
 *     subject: string,         // Email subject line
 *     body: string,            // Email body text
 *     campaignId?: string      // Optional: originating campaign ID
 *   }
 */

import { handleInboundEmail } from '../../../lib/negotiation-engine';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const payload = await request.json();
    const { email, subject, body, campaignId } = payload;

    if (!email || !body) {
      return NextResponse.json(
        { error: 'email and body are required' },
        { status: 400 }
      );
    }

    // Look up the lead by email address
    const { db } = await import('../../../lib/db');
    const leads = await db.getLeads();
    const lead = leads.find(l =>
      l.email && l.email.toLowerCase() === email.toLowerCase()
    );

    if (!lead) {
      console.warn(`⚠️ Inbound email from unknown sender: ${email}`);
      return NextResponse.json(
        { error: 'Unknown sender — no matching lead found' },
        { status: 404 }
      );
    }

    console.log(`📬 Inbound email from ${lead.business_name || lead.contact_name} <${email}>`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body.substring(0, 200)}${body.length > 200 ? '...' : ''}`);

    // Process through the negotiation engine
    const result = await handleInboundEmail({
      from: email,
      body,
      leadId: lead.id,
    });

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      analysis: {
        sentiment: result.sentiment,
        intent: result.intent,
        interested: result.interested,
      },
      reply_preview: result.response?.substring(0, 200) + '...',
      message: `Inbound email processed for ${lead.business_name || lead.contact_name}`,
    });
  } catch (err) {
    console.error('❌ Inbound email processing error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * GET /api/inbound-email
 * Health check endpoint.
 */
export async function GET() {
  return NextResponse.json({
    status: 'ready',
    message: 'Inbound email webhook is active',
    endpoints: {
      POST: 'Receive and process inbound email replies',
    },
  });
}