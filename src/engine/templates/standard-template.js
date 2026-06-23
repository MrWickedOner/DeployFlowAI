/**
 * DeployFlow AI — Standard Tier Website Template Generator
 * 
 * Generates a full, standalone HTML document for the Standard Tier website.
 * This is a string-based builder so it works both in Next.js SSR and
 * as a standalone CLI static file generator.
 */

import { extractBusinessContext, escapeHtml, getHeadBlock } from './shared-styles.js';

/**
 * Builds a complete Standard Tier HTML page for a given lead.
 * @param {Object} lead - Lead object from DB (must have business_name, industry, location, scraping_metadata, etc.)
 * @param {Object} [options]
 * @param {boolean} [options.isPreview] - If true, includes the preview banner bar
 * @param {string} [options.previewId] - Lead ID for preview links
 * @returns {string} Complete HTML document string
 */
export function generateStandardSite(lead, options = {}) {
  const { isPreview = false, previewId = null } = options;
  const ctx = extractBusinessContext(lead);
  const { businessName, industry, location, contactName, contactEmail, contactPhone, hours, about, services, faqs } = ctx;

  const color = lead.industry?.toLowerCase().includes('dentist') ? '#0d9488' :
    lead.industry?.toLowerCase().includes('roofing') ? '#d97706' :
    lead.industry?.toLowerCase().includes('plumb') ? '#2563eb' :
    lead.industry?.toLowerCase().includes('law') ? '#4f46e5' :
    lead.industry?.toLowerCase().includes('vet') ? '#0891b2' :
    lead.industry?.toLowerCase().includes('fitness') ? '#16a34a' :
    lead.industry?.toLowerCase().includes('account') ? '#78716c' :
    lead.industry?.toLowerCase().includes('bakery') ? '#d946ef' :
    lead.industry?.toLowerCase().includes('restaurant') ? '#dc2626' :
    lead.industry?.toLowerCase().includes('chiroprac') ? '#7c3aed' : '#6366f1';

  const primaryColor = color;
  const lighterShade = primaryColor + '15'; // 15% opacity bg
  const darkerShade = primaryColor;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${getHeadBlock(businessName)}
  <style>
    .gradient-bg { background: linear-gradient(135deg, ${lighterShade}, transparent); }
  </style>
</head>
<body class="bg-white text-slate-900 font-sans min-h-screen">
  ${isPreview && previewId ? generatePreviewBanner(businessName, 'standard', previewId, primaryColor) : ''}

  <!-- Navigation Header -->
  <header class="border-b border-slate-100 bg-white sticky top-0 z-10 py-4 px-6 md:px-12 flex justify-between items-center shadow-sm">
    <div class="flex items-center space-x-2.5">
      <div class="text-white w-9 h-9 rounded-lg flex items-center justify-center font-black text-lg shadow" style="background:${darkerShade}">
        ${escapeHtml(businessName.charAt(0))}
      </div>
      <span class="font-extrabold text-lg text-slate-800 tracking-tight">${escapeHtml(businessName)}</span>
    </div>
    <nav class="hidden md:flex space-x-8 text-sm font-semibold text-slate-600">
      <a href="#about" class="hover:text-[${darkerShade}] transition">About</a>
      <a href="#services" class="hover:text-[${darkerShade}] transition">Services</a>
      <a href="#faq" class="hover:text-[${darkerShade}] transition">FAQ</a>
      <a href="#contact" class="hover:text-[${darkerShade}] transition">Contact</a>
    </nav>
    <a href="#contact" class="text-white hover:opacity-90 px-5 py-2 rounded-xl text-sm font-bold transition shadow-md" style="background:${darkerShade}">
      Book Appointment
    </a>
  </header>

  <!-- Hero Section -->
  <section class="bg-slate-50 border-b border-slate-100 py-20 px-6 md:px-12">
    <div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <div class="space-y-6">
        <span class="text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider inline-block" style="background:${lighterShade};color:${darkerShade}">
          ${escapeHtml(industry)} • ${escapeHtml(location)}
        </span>
        <h1 class="text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-tight">
          Premium ${escapeHtml(industry)} Solutions Tailored For Your Needs.
        </h1>
        <p class="text-slate-600 leading-relaxed text-base">
          Providing top-tier services, elite professionalism, and client satisfaction in the ${escapeHtml(location)} metroplex. Experience the difference today.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 pt-2">
          <a href="#contact" class="text-white text-center py-3.5 px-8 rounded-xl font-bold transition shadow-lg hover:opacity-90" style="background:${darkerShade}">
            Schedule Service
          </a>
          <a href="#services" class="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-center py-3.5 px-8 rounded-xl font-semibold transition">
            Our Services
          </a>
        </div>
      </div>
      <div class="bg-gradient-to-tr from-slate-200 to-slate-100 border border-slate-200 rounded-3xl aspect-[4/3] p-8 flex flex-col justify-between shadow-lg relative overflow-hidden">
        <div class="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none" style="background:${lighterShade}"></div>
        <div>
          <p class="text-xs text-slate-400 font-extrabold uppercase tracking-widest">Operating Hours</p>
          <p class="text-sm font-bold text-slate-700 mt-1">${escapeHtml(hours)}</p>
        </div>
        <div class="bg-white/80 backdrop-blur border border-slate-200/50 p-6 rounded-2xl shadow-sm space-y-2">
          <p class="text-xs text-slate-400 font-bold uppercase tracking-wider">Quick Contact</p>
          <p class="text-sm font-bold text-slate-800">${escapeHtml(contactName)}</p>
          ${contactEmail ? `<p class="text-xs text-slate-500">${escapeHtml(contactEmail)}</p>` : ''}
          ${contactPhone ? `<p class="text-xs text-slate-500 font-medium">${escapeHtml(contactPhone)}</p>` : ''}
        </div>
      </div>
    </div>
  </section>

  <!-- About Section -->
  <section id="about" class="py-20 px-6 md:px-12 max-w-5xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
      <div class="md:col-span-1">
        <h2 class="text-2xl font-extrabold text-slate-950 tracking-tight">Who We Are</h2>
        <div class="w-12 h-1 rounded mt-3" style="background:${darkerShade}"></div>
      </div>
      <div class="md:col-span-2 text-slate-600 space-y-6 leading-relaxed">
        <p class="text-lg text-slate-700 font-medium">
          We focus on delivering high-performance care, trusted craftsmanship, and premium client execution.
        </p>
        <p>${escapeHtml(about)}</p>
      </div>
    </div>
  </section>

  <!-- Services Section -->
  <section id="services" class="bg-slate-50 border-y border-slate-100 py-20 px-6 md:px-12">
    <div class="max-w-5xl mx-auto">
      <div class="text-center max-w-2xl mx-auto mb-16 space-y-3">
        <h2 class="text-3xl font-extrabold text-slate-950 tracking-tight">Our Professional Services</h2>
        <p class="text-slate-500 text-sm">Engineered for quality, longevity, and ultimate performance.</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        ${services.map((service, index) => `
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all" style="hover:border-color:${darkerShade}33">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm mb-4" style="background:${lighterShade};color:${darkerShade}">
            ${String(index + 1).padStart(2, '0')}
          </div>
          <h3 class="font-bold text-slate-900 mb-2">${escapeHtml(service)}</h3>
          <p class="text-slate-500 text-xs leading-relaxed">High-integrity execution configured precisely for your schedule and exact business specifications.</p>
        </div>`).join('')}
      </div>
    </div>
  </section>

  <!-- FAQ Section -->
  <section id="faq" class="py-20 px-6 md:px-12 max-w-4xl mx-auto">
    <div class="text-center mb-16 space-y-3">
      <h2 class="text-3xl font-extrabold text-slate-950 tracking-tight">Frequently Asked Questions</h2>
      <p class="text-slate-500 text-sm">Everything you need to know about our workflow and scheduling.</p>
    </div>

    <div class="space-y-6">
      ${faqs.map(faq => `
      <div class="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-2">
        <h3 class="font-bold text-slate-900 flex items-start space-x-2">
          <span style="color:${darkerShade}">Q.</span>
          <span>${escapeHtml(faq.q)}</span>
        </h3>
        <p class="text-slate-600 text-sm pl-6 leading-relaxed">${escapeHtml(faq.a)}</p>
      </div>`).join('')}
    </div>
  </section>

  <!-- Contact Section -->
  <section id="contact" class="text-white py-20 px-6 md:px-12" style="background:${darkerShade}">
    <div class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
      <div class="space-y-6">
        <h2 class="text-3xl font-black tracking-tight">Connect with Us Today.</h2>
        <p class="text-white/70 text-sm leading-relaxed">
          Have questions or ready to schedule your consultation? Leave us your details and a representative will reach out shortly.
        </p>
        <div class="space-y-4 pt-4 text-xs text-white/60">
          <p><strong class="text-white">Location:</strong> ${escapeHtml(location)}</p>
          ${contactPhone ? `<p><strong class="text-white">Phone:</strong> ${escapeHtml(contactPhone)}</p>` : ''}
          ${contactEmail ? `<p><strong class="text-white">Email:</strong> ${escapeHtml(contactEmail)}</p>` : ''}
        </div>
      </div>
      
      <form class="space-y-4" onsubmit="event.preventDefault(); alert('Inquiry successfully recorded (Simulated Demo)');">
        <div class="grid grid-cols-2 gap-4">
          <input type="text" placeholder="First Name"
            class="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/50" required />
          <input type="text" placeholder="Last Name"
            class="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/50" required />
        </div>
        <input type="email" placeholder="Your Email"
          class="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/50" required />
        <textarea placeholder="Tell us about your needs..." rows="4"
          class="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/50" required></textarea>
        <button type="submit" class="w-full bg-white hover:bg-white/90 text-xs font-bold py-3.5 rounded-xl transition shadow-lg" style="color:${darkerShade}">
          Submit Inquiry
        </button>
      </form>
    </div>
  </section>

  <!-- Footer -->
  <footer class="border-t border-slate-100 bg-white py-8 px-6 text-center text-xs text-slate-400">
    <p>© 2026 ${escapeHtml(businessName)}. All rights reserved.</p>
  </footer>
</body>
</html>`;
}

/**
 * Generates the preview mode banner at the top of the page.
 */
function generatePreviewBanner(businessName, tier, previewId, primaryColor) {
  const isStandard = tier === 'standard';
  return `
  <div class="bg-gradient-to-r py-2.5 px-4 text-center text-xs font-semibold flex justify-between items-center shadow-inner" 
       style="background:linear-gradient(135deg, ${isStandard ? '#10b981, #059669' : '#9333ea, #7c3aed'});color:white">
    <span>${isStandard ? '👀' : '✨'} Previewing: <strong>${isStandard ? 'Standard Tier' : 'Premium AI-Integrated Tier'} Website</strong> for ${escapeHtml(businessName)}</span>
    <div class="flex space-x-2">
      <span class="bg-white/20 px-2 py-0.5 rounded text-[10px]">${isStandard ? 'Standard Host: $19/mo' : 'Premium AI Host: $49/mo'}</span>
      ${isStandard 
        ? `<a href="/preview/${previewId}/premium" class="bg-white text-emerald-700 px-3 py-1 rounded text-[10px] font-bold hover:bg-slate-100 transition shadow-sm">⚡ Upgrade to Premium AI Tier</a>`
        : `<button onclick="alert('🎉 Deploying ${escapeHtml(businessName)} premium site! (Stripe checkout triggered)')" class="bg-green-500 hover:bg-green-400 text-white px-3.5 py-1 rounded text-[10px] font-extrabold transition shadow-sm uppercase tracking-wider">💳 Approve & Deploy Live ($49)</button>`
      }
    </div>
  </div>`;
}