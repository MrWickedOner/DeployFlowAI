/**
 * POST /api/negotiate
 * Receives an inbound lead reply and triggers the AI negotiation engine.
 *
 * Request body:
 *   { leadId: string, messageBody: string, sender?: string }
 *
 * Returns the AI-generated reply and analysis.
 */

import { handleInboundEmail } from '../../../lib/negotiation-engine';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { leadId, messageBody, sender } = await request.json();

    if (!leadId || !messageBody) {
      return NextResponse.json(
        { error: 'leadId and messageBody are required' },
        { status: 400 }
      );
    }

    const result = await handleInboundEmail({
      from: sender || 'lead@example.com',
      body: messageBody,
      leadId,
    });

    return NextResponse.json({
      success: true,
      analysis: {
        sentiment: result.sentiment,
        intent: result.intent,
        interested: result.interested,
      },
      reply: result.response,
    });
  } catch (err) {
    console.error('❌ Negotiation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}