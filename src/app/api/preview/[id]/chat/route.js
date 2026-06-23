import { db } from '../../../../../lib/db';
import { NextResponse } from 'next/server';

/**
 * POST /api/preview/[id]/chat
 * Context-aware dynamic chatbot simulator for lead preview.
 * Responds intelligently using the lead's actual business context.
 */
export async function POST(request, { params: paramsPromise }) {
  try {
    const params = await paramsPromise;
    const { id } = params;
    const body = await request.json();
    const userMessage = (body.message || '').toLowerCase();
    
    // Fetch the lead's profile from database
    const lead = await db.getLeadById(id);
    if (!lead) {
      return NextResponse.json({ reply: "I'm sorry, I could not retrieve my knowledge base for this business. Please try again!" }, { status: 404 });
    }

    const name = lead.business_name;
    const services = lead.scraping_metadata?.business_context?.services || [];
    const hours = lead.scraping_metadata?.business_context?.hours || 'Mon-Fri: 9:00 AM - 5:00 PM';
    const address = lead.scraping_metadata?.business_context?.address || lead.location;
    const faqs = lead.scraping_metadata?.business_context?.faqs || [];

    let reply = "";

    // 1. Search for FAQ exact matches or semantic keywords
    const matchedFaq = faqs.find(faq => {
      const question = faq.q.toLowerCase();
      return userMessage.includes(question) || 
             (userMessage.includes('insurance') && question.includes('insurance')) ||
             (userMessage.includes('cost') && question.includes('charge')) ||
             (userMessage.includes('first visit') && question.includes('first visit')) ||
             (userMessage.includes('emergency') && question.includes('emergency')) ||
             (userMessage.includes('trial') && question.includes('trial')) ||
             (userMessage.includes('custom cake') && question.includes('cake'));
    });

    if (matchedFaq) {
      reply = matchedFaq.a;
    }
    // 2. Schedule / Book / Appointment
    else if (userMessage.includes('schedule') || userMessage.includes('book') || userMessage.includes('appointment') || userMessage.includes('consultation')) {
      reply = `I would be delighted to help you schedule an appointment with our team at ${name}! You can use the "Book Appointment" form right here on our page to submit your details, or feel free to call us at ${lead.contact_phone || '(512) 555-0100'} and a member of our team will secure a slot for you immediately.`;
    }
    // 3. Services / What do you do
    else if (userMessage.includes('services') || userMessage.includes('do you offer') || userMessage.includes('what do you') || userMessage.includes('treat') || userMessage.includes('popular')) {
      if (services.length > 0) {
        reply = `At ${name}, we specialize in a wide range of professional services, including: ${services.join(', ')}. Is there a specific service you would like to ask about or schedule?`;
      } else {
        reply = `We provide exceptional, custom-tailored solutions for all our clients in the local area. Please tell me more about your requirements so I can guide you to the perfect service!`;
      }
    }
    // 4. Hours / Open / Timing
    else if (userMessage.includes('hours') || userMessage.includes('open') || userMessage.includes('timing') || userMessage.includes('when are you')) {
      reply = `Our standard operating hours at ${name} are: ${hours}. Please note that we are closed on holidays, but you can request appointments online anytime!`;
    }
    // 5. Location / Address / Where are you
    else if (userMessage.includes('location') || userMessage.includes('address') || userMessage.includes('where are you') || userMessage.includes('find you')) {
      reply = `You can find ${name} located at: ${address}. We look forward to seeing you!`;
    }
    // 6. Who are you / Tell me about
    else if (userMessage.includes('about') || userMessage.includes('who are you') || userMessage.includes('info') || userMessage.includes('owner')) {
      const aboutText = lead.scraping_metadata?.business_context?.about;
      reply = aboutText || `${name} is a leading provider in ${lead.location} committed to premium quality and customer satisfaction.`;
    }
    // 7. Standard Fallbacks based on business type
    else {
      reply = `That is a great question! At ${name}, we strive to provide the absolute best experience for our clients. Since this is an AI mockup preview, you can customize this chatbot's specific responses and knowledge. What else would you like to know about our ${lead.industry || 'premium services'}?`;
    }

    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
