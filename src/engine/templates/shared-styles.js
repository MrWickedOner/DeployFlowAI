/**
 * DeployFlow AI — Shared Template Styles & Utilities
 * 
 * Contains the base Tailwind CSS config and reusable style/script blocks
 * that are common across Standard and Premium tier website outputs.
 */

/**
 * Generates the shared CSS <style> block or links Tailwind CDN.
 * In production mode, we'd pre-compile tailwind; in dev/mockup mode,
 * we use the Play CDN for quick iteration.
 */
export function getTailwindCDNLink() {
  return '<script src="https://cdn.tailwindcss.com"></script>';
}

/**
 * Returns a <style> block with custom utility classes and animations
 * used across all generated sites.
 */
export function getCustomStylesBlock() {
  return `
<style>
  /* Smooth scroll */
  html { scroll-behavior: smooth; }

  /* Fade-in animation for chatbot */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.25s ease-out forwards;
  }

  /* Subtle bounce for chatbot button */
  @keyframes bounceSubtle {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
  .animate-bounce-subtle {
    animation: bounceSubtle 2s ease-in-out infinite;
  }

  /* Loading dots */
  .dot-pulse::after {
    content: '';
    animation: dotPulse 1.5s infinite;
  }
  @keyframes dotPulse {
    0% { content: ''; }
    25% { content: '.'; }
    50% { content: '..'; }
    75% { content: '...'; }
  }
</style>`;
}

/**
 * Generates the HTML head block with meta tags, title, and favicon.
 * @param {string} businessName
 */
export function getHeadBlock(businessName) {
  return `
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(businessName)} — Official Website</title>
    <meta name="description" content="${escapeHtml(businessName)} — Premium services tailored for your needs." />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏢</text></svg>" />
    ${getTailwindCDNLink()}
    ${getCustomStylesBlock()}
  `;
}

/**
 * Escape HTML special characters in a string.
 */
export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Extract services, FAQs, hours, about text from lead scraping_metadata.
 */
export function extractBusinessContext(lead) {
  const meta = lead.scraping_metadata || {};
  const ctx = meta.business_context || {};
  return {
    businessName: lead.business_name || 'Local Business',
    industry: lead.industry || 'Local Services',
    location: lead.location || 'Austin, TX',
    contactName: lead.contact_name || 'Staff Representative',
    contactEmail: lead.contact_email || '',
    contactPhone: lead.contact_phone || '',
    address: ctx.address || lead.location || 'Austin, TX',
    hours: ctx.hours || 'Mon-Fri: 9:00 AM - 5:00 PM',
    about: ctx.about || `${lead.business_name || 'Our business'} is a premier ${lead.industry || 'service'} provider serving ${lead.location || 'the local area'} with excellence, customer dedication, and professional reliability.`,
    services: Array.isArray(ctx.services) && ctx.services.length > 0 
      ? ctx.services 
      : ['Custom Solutions', 'Premium Service', 'Professional Delivery'],
    faqs: Array.isArray(ctx.faqs) && ctx.faqs.length > 0 
      ? ctx.faqs 
      : [
          { q: 'What is your turnaround time?', a: 'We pride ourselves on prompt service. Contact us directly to schedule a priority slot.' },
          { q: 'How can I get an estimate?', a: 'Fill out our inquiry form or give us a call to receive a free, no-obligation custom estimate.' }
        ]
  };
}

/**
 * Returns base color palette based on industry type (for visual variety).
 */
export function getIndustryColors(industry) {
  const palettes = {
    chiropractor: { primary: '#7c3aed', primaryLight: '#ede9fe', primaryDark: '#5b21b6' },
    dentist: { primary: '#0d9488', primaryLight: '#ccfbf1', primaryDark: '#0f766e' },
    plumbing: { primary: '#2563eb', primaryLight: '#dbeafe', primaryDark: '#1d4ed8' },
    roofing: { primary: '#d97706', primaryLight: '#fef3c7', primaryDark: '#b45309' },
    restaurant: { primary: '#dc2626', primaryLight: '#fee2e2', primaryDark: '#b91c1c' },
    'fitness & gym': { primary: '#16a34a', primaryLight: '#dcfce7', primaryDark: '#15803d' },
    bakery: { primary: '#d946ef', primaryLight: '#fdf4ff', primaryDark: '#c026d3' },
    law: { primary: '#4f46e5', primaryLight: '#eef2ff', primaryDark: '#4338ca' },
    veterinary: { primary: '#0891b2', primaryLight: '#cffafe', primaryDark: '#0e7490' },
    accounting: { primary: '#78716c', primaryLight: '#f5f5f4', primaryDark: '#57534e' }
  };

  const key = (industry || '').toLowerCase().trim();
  for (const [k, v] of Object.entries(palettes)) {
    if (key.includes(k)) return v;
  }
  // Default: indigo
  return { primary: '#6366f1', primaryLight: '#eef2ff', primaryDark: '#4f46e5' };
}