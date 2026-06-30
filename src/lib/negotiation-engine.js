/**
 * DeployFlow AI — AI-Powered Sales Negotiation Engine
 *
 * Analyzes inbound lead replies, classifies sentiment/intent,
 * generates context-aware AI responses, and orchestrates the
 * reply flow via the email module.
 */

import { db } from '../lib/db';
import { sendEmail, analyzeMessageSentiment } from '../lib/email';

/**
 * Analyze a lead's reply message and return structured insights.
 * @param {string} messageBody
 * @param {Object} lead
 * @param {Array} campaignHistory
 * @returns {Object} { sentiment, intent, interested, response }
 */
export async function processInboundReply(messageBody, lead, campaignHistory = []) {
  // Analyze the message sentiment and intent
  const analysis = analyzeMessageSentiment(messageBody);

  // Generate an appropriate response based on intent
  const response = await generateResponse(analysis, lead, campaignHistory);

  return {
    ...analysis,
    response,
    leadId: lead.id,
  };
}

/**
 * Generate a contextual sales response based on the lead's intent.
 * @param {Object} analysis - { sentiment, intent, interested }
 * @param {Object} lead
 * @param {Array} campaignHistory
 * @returns {string} Reply body
 */
async function generateResponse(analysis, lead, campaignHistory = []) {
  const { sentiment, intent, interested } = analysis;
  const businessName = lead.business_name || 'your business';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const standardLink = `${baseUrl}/preview/${lead.id}/standard`;
  const premiumLink = `${baseUrl}/preview/${lead.id}/premium`;

  // Determine the pricing info for the lead's location/industry
  const pricingInfo = getPricingTiers();

  if (intent === 'disinterest' || sentiment === 'negative') {
    return `Thanks for letting me know! No hard feelings at all. If you ever change your mind or want a quick refresh in the future, just reply to this email — I'll be happy to help.

In the meantime, feel free to share the preview links with anyone you know who might need a new site:
Standard: ${standardLink}
Premium AI: ${premiumLink}

Best of luck with ${businessName}! 🚀`;
  }

  if (intent === 'pricing_inquiry') {
    return `Great question about pricing! Here's the breakdown:

🏆 Standard Website Package:
• High-performance, responsive ${lead.industry || 'business'} site
• SEO-optimized, mobile-friendly, fast-loading
• Option A: One-time payment — Full ownership, no recurring fees
• Option B: Installment plan — Spread the cost with low monthly payments

🚀 Premium AI Package (Everything in Standard +):
• Custom-trained AI chatbot that knows your business inside-out
• Self-serve knowledge base portal — upload docs, the AI learns automatically
• Dynamic widgets & lead capture tools
• AI-powered 24/7 customer support for your visitors

Pricing starts at [custom quote based on your needs]. Want me to put together a specific quote for ${businessName}?

Check out both live previews here:
Standard: ${standardLink}
Premium AI: ${premiumLink}

Let me know if you'd like a call to discuss!`;
  }

  if (interested || sentiment === 'positive' || sentiment === 'curious') {
    return `That's great to hear! 🎉

I'm glad you're interested in seeing what a modern website can do for ${businessName}.

Here's a quick recap of both options, and you can view them live right now:

🔗 Standard Edition: ${standardLink}
🔗 Premium AI Edition: ${premiumLink}

On the Premium version, try clicking the chatbot icon — it's already trained with info about ${businessName}'s services!

Next steps would be:
1️⃣ Let me know which version you prefer
2️⃣ I can customize colors, logo, and content — just tell me what you'd like
3️⃣ Set up hosting & go live within days

Happy to jump on a quick call too if that's easier. Just let me know!`;
  }

  // Default: curious/inquiry with no strong signal
  return `Thanks for replying! 👋

I built these two live mockups specifically for ${businessName}:

🏆 Standard Website: ${standardLink}
🚀 Premium AI Website: ${premiumLink}

The Premium version includes a smart AI chatbot that can answer your customer questions 24/7 — it's already loaded with info about your business.

No pressure at all — just wanted to show you what's possible. Let me know:
• Which version you like better?
• Any colors or branding you'd want changed?
• Want me to send over pricing details?

Talk soon!`;
}

/**
 * Get pricing tiers for reference in replies.
 */
function getPricingTiers() {
  return {
    standard: {
      oneTime: 'Custom quote — one-time setup, full ownership',
      installment: 'Flexible monthly payments available',
    },
    premium: {
      oneTime: 'Custom quote — includes AI chatbot & knowledge base',
      installment: 'Flexible monthly payments available',
    },
  };
}

/**
 * Full pipeline: receive inbound email → analyze → generate reply → store → return
 * @param {Object} payload
 * @param {string} payload.from - Sender email
 * @param {string} payload.body - Message body
 * @param {string} payload.leadId - Lead ID (resolved from email)
 * @returns {Promise<Object>} Processed result with reply text
 */
export async function handleInboundEmail(payload) {
  const { from, body, leadId } = payload;

  // Look up the lead
  const leads = await db.getLeads();
  const lead = leads.find(l => l.id === leadId);
  if (!lead) {
    console.warn(`⚠️ Inbound email from unknown lead: ${from}`);
    return { error: 'Unknown lead' };
  }

  // Get campaign history for context
  const campaigns = await db.getCampaignsByLead(leadId);

  // Analyze and generate reply
  const result = await processInboundReply(body, lead, campaigns);

  // Save the negotiation message
  await db.saveNegotiation({
    lead_id: leadId,
    agency_id: '00000000-0000-0000-0000-000000000000',
    sender: 'lead',
    message_body: body,
    message_type: 'inbound',
    sentiment: result.sentiment,
  });

  // Save the auto-generated reply as an outbound negotiation message
  await db.saveNegotiation({
    lead_id: leadId,
    agency_id: '00000000-0000-0000-0000-000000000000',
    sender: 'system',
    message_body: result.response,
    message_type: 'outbound',
    sentiment: 'professional',
  });

  // Update lead status based on sentiment
  if (result.interested) {
    await db.updateLead(leadId, { status: 'negotiating' });
  } else if (result.sentiment === 'negative') {
    await db.updateLead(leadId, { status: 'lost' });
  }

  return result;
}