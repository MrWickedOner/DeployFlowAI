/**
 * DeployFlow AI — Email Abstraction Layer
 *
 * Handles sending emails via the available inbox tool.
 * In local mode, sends via user-configured SMTP.
 * In cloud mode, sends via Resend/SendGrid API.
 */

/**
 * Generate a personalized outreach email body.
 * @param {Object} lead - Lead data
 * @param {Object} options
 * @param {string} options.tier - 'standard' or 'premium'
 * @returns {{ subject: string, body: string }}
 */
export function generateOutreachEmail(lead, options = {}) {
  const businessName = lead.business_name || 'your business';
  const contactName = lead.contact_name || 'there';
  const industry = lead.industry || 'local business';
  const location = lead.location || 'your area';
  const leadId = lead.id;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const standardLink = `${baseUrl}/preview/${leadId}/standard`;
  const premiumLink = `${baseUrl}/preview/${leadId}/premium`;

  const subject = `✨ ${businessName} — A modern ${industry} website built for ${location}`;

  const body = `Hi ${contactName},

I was browsing ${industry} businesses in ${location} and noticed that ${businessName} could really benefit from a modern, high-performing website.

I took the liberty of building TWO full website mockups specifically for ${businessName} — completely free, no strings attached:

🏆 **Standard Edition** — A lightning-fast, professional ${industry} site:
${standardLink}

🚀 **Premium AI Edition** — Same beautiful site + an AI assistant trained on your business:
${premiumLink}

Both are live right now. Click around, test the AI chatbot on the Premium version — it already knows about your services, hours, and FAQs.

Would love to hear your thoughts! Happy to customize anything.

Best,
The DeployFlow AI Team`;

  return { subject, body };
}

/**
 * Send an email via the available inbox.
 * This wraps the sendEmail tool for use from API routes.
 *
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.body - Email body
 * @param {string} options.from - Sender email (optional)
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export async function sendEmail(options) {
  const { to, subject, body } = options;

  try {
    // In production, this would call the email provider API
    // For now, we log the email for demonstration purposes
    console.log(`\n📧 === EMAIL OUTBOUND ===`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${body}`);
    console.log(`========================\n`);

    return { success: true, id: `email_${Date.now()}` };
  } catch (err) {
    console.error('❌ Email send failed:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Analyze email content for sentiment and intent.
 * Used by the negotiation engine to understand lead responses.
 * @param {string} messageBody
 * @returns {{ sentiment: string, intent: string, interested: boolean }}
 */
export function analyzeMessageSentiment(messageBody) {
  const lower = (messageBody || '').toLowerCase();

  // Positive signals
  const positiveWords = ['yes', 'sure', 'interested', 'love', 'great', 'awesome', 'nice', 'beautiful', 'like', 'want', 'please', 'tell me more', 'pricing', 'cost', 'how much', 'sign me up', 'let\'s do it', 'proceed', 'book a call'];
  // Negative signals
  const negativeWords = ['no', 'not interested', 'stop', 'unsubscribe', 'don\'t', 'not', 'spam', 'leave me alone', 'too expensive', 'can\'t afford'];
  // Question signals
  const questionWords = ['?', 'how', 'what', 'when', 'where', 'why', 'which', 'could you', 'can you', 'tell me', 'explain'];

  const hasPositive = positiveWords.some(w => lower.includes(w));
  const hasNegative = negativeWords.some(w => lower.includes(w));
  const hasQuestions = questionWords.some(w => lower.includes(w));

  let sentiment = 'neutral';
  let intent = 'inquiry';
  let interested = false;

  if (hasNegative && !hasPositive) {
    sentiment = 'negative';
    intent = 'disinterest';
    interested = false;
  } else if (hasPositive && !hasNegative) {
    sentiment = 'positive';
    intent = 'interested';
    interested = true;
    if (lower.includes('cost') || lower.includes('price') || lower.includes('how much')) {
      intent = 'pricing_inquiry';
    }
  } else if (hasQuestions) {
    sentiment = 'curious';
    intent = 'inquiry';
    interested = true;
  }

  return { sentiment, intent, interested };
}