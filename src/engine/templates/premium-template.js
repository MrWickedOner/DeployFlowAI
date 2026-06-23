/**
 * DeployFlow AI — Premium AI Tier Website Template Generator
 * 
 * Generates a full, standalone HTML document for the Premium AI Tier website.
 * Extends the Standard tier with an embedded, customizable AI chatbot
 * that understands the business context (services, FAQs, hours, etc.)
 * and can respond to visitor inquiries dynamically.
 */

import { extractBusinessContext, escapeHtml, getHeadBlock } from './shared-styles.js';

/**
 * Builds a complete Premium AI Tier HTML page for a given lead.
 * Includes the same base site as Standard + an interactive chatbot widget
 * that uses either local (Ollama) or cloud (OpenAI) AI backend.
 *
 * @param {Object} lead - Lead object from DB
 * @param {Object} [options]
 * @param {boolean} [options.isPreview] - If true, includes preview banner
 * @param {string} [options.previewId] - Lead ID for preview links
 * @param {string} [options.aiEndpoint] - API endpoint for chatbot AI
 * @returns {string} Complete HTML document string
 */
export function generatePremiumSite(lead, options = {}) {
  const { isPreview = false, previewId = null, aiEndpoint = '/api/preview/{id}/chat' } = options;
  const ctx = extractBusinessContext(lead);
  const { businessName, industry, location, contactName, contactEmail, contactPhone, hours, about, services, faqs } = ctx;

  // Color palette — purple family for premium tier
  const primaryColor = '#7c3aed';
  const lighterShade = '#f5f3ff';
  const darkerShade = '#6d28d9';

  // Build chatbot system prompt with business context
  const chatbotPrompt = buildChatbotPrompt(businessName, industry, location, services, faqs, hours, contactPhone, about);

  // Resolve the chat API endpoint
  const chatEndpoint = aiEndpoint.replace('{id}', previewId || lead.id || '');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${getHeadBlock(businessName)}
  <style>
    .gradient-bg { background: linear-gradient(135deg, ${lighterShade}, transparent); }
  </style>
</head>
<body class="bg-white text-slate-900 font-sans min-h-screen relative">
  ${isPreview && previewId ? generatePremiumPreviewBanner(businessName, previewId, darkerShade) : ''}

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
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
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

  <!-- FLOATING CHATBOT WIDGET -->
  <div id="deployflow-chatbot" 
       data-business-name="${escapeHtml(businessName)}"
       data-business-context='${escapeHtml(JSON.stringify({services, faqs, hours, contactPhone, about, industry, location}))}'
       data-chat-endpoint="${escapeHtml(chatEndpoint)}"
       data-primary-color="${primaryColor}">
  </div>

  <script>
  (function() {
    'use strict';

    const CONFIG = {
      businessName: ${JSON.stringify(businessName)},
      context: ${JSON.stringify({services, faqs, hours, contactPhone, about, industry, location})},
      chatEndpoint: ${JSON.stringify(chatEndpoint)},
      primaryColor: '${primaryColor}',
      initialMessage: ${JSON.stringify(`👋 Hi! I'm the virtual assistant at ${businessName}. How can I help you today? Ask me about our services, pricing, or operating hours!`)}
    };

    // State
    let chatOpen = false;
    let messages = [{
      text: CONFIG.initialMessage,
      sender: 'bot',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }];
    let sending = false;

    // Create container
    const container = document.createElement('div');
    container.id = 'df-chat-root';
    container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;align-items:flex-end;font-family:system-ui,-apple-system,sans-serif;';

    // Create chat panel
    const panel = document.createElement('div');
    panel.id = 'df-chat-panel';
    panel.style.cssText = 'display:none;width:320px;height:480px;background:white;border-radius:24px;box-shadow:0 20px 60px rgba(0,0,0,0.15);border:1px solid #e2e8f0;flex-direction:column;overflow:hidden;margin-bottom:12px;';

    // Chat header
    const header = document.createElement('div');
    header.style.cssText = \`background:linear-gradient(135deg, ${primaryColor}, #6d28d9);color:white;padding:16px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 2px 8px rgba(0,0,0,0.1);\`;
    header.innerHTML = \`
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:18px;">✨</div>
        <div>
          <div style="font-weight:700;font-size:13px;">\${CONFIG.businessName} Support AI</div>
          <div style="display:flex;align-items:center;gap:4px;margin-top:2px;">
            <span style="width:8px;height:8px;background:#4ade80;border-radius:50%;display:inline-block;"></span>
            <span style="font-size:10px;color:rgba(255,255,255,0.8);font-weight:600;">AI-Powered Assistant</span>
          </div>
        </div>
      </div>
      <button id="df-chat-close" style="width:28px;height:28px;border-radius:50%;background:rgba(0,0,0,0.1);border:none;color:white;cursor:pointer;font-size:12px;font-weight:bold;display:flex;align-items:center;justify-content:center;">✕</button>
    \`;
    panel.appendChild(header);

    // Messages container
    const msgContainer = document.createElement('div');
    msgContainer.style.cssText = 'flex:1;overflow-y:auto;padding:16px;background:#f8fafc;display:flex;flex-direction:column;gap:12px;';
    msgContainer.id = 'df-msg-container';
    panel.appendChild(msgContainer);

    // Input form
    const inputForm = document.createElement('form');
    inputForm.style.cssText = 'border-top:1px solid #e2e8f0;padding:12px;background:white;display:flex;gap:8px;align-items:center;';
    inputForm.innerHTML = \`
      <input type="text" id="df-chat-input" placeholder="Ask me anything..." 
        style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:10px 14px;font-size:12px;color:#1e293b;outline:none;" />
      <button type="submit" id="df-chat-send"
        style="background:${primaryColor};color:white;border:none;border-radius:12px;padding:10px 16px;font-size:12px;font-weight:700;cursor:pointer;transition:opacity 0.2s;">Send</button>
    \`;
    panel.appendChild(inputForm);
    container.appendChild(panel);

    // Floating button
    const btn = document.createElement('button');
    btn.id = 'df-chat-toggle';
    btn.style.cssText = \`background:linear-gradient(135deg, ${primaryColor}, #6d28d9);color:white;border:none;border-radius:50%;width:58px;height:58px;box-shadow:0 8px 24px rgba(0,0,0,0.2);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:24px;transition:all 0.2s;\`;
    btn.innerHTML = '💬';
    container.appendChild(btn);
    document.body.appendChild(container);

    // Render messages
    function renderMessages() {
      msgContainer.innerHTML = '';
      messages.forEach(function(msg, i) {
        const isBot = msg.sender === 'bot';
        const div = document.createElement('div');
        div.style.cssText = \`display:flex;justify-content:\${isBot ? 'flex-start' : 'flex-end'};\`;
        div.innerHTML = \`
          <div style="max-width:80%;border-radius:16px;padding:12px 14px;font-size:12px;line-height:1.5;box-shadow:0 1px 3px rgba(0,0,0,0.05);\${isBot ? 'background:white;border:1px solid #e2e8f0;color:#1e293b' : 'background:' + CONFIG.primaryColor + ';color:white;font-weight:500'}">
            <p style="margin:0;">\${msg.text}</p>
            <p style="margin:4px 0 0;font-size:9px;text-align:right;\${isBot ? 'color:#94a3b8' : 'color:rgba(255,255,255,0.7)'}">\${msg.time}</p>
          </div>\`;
        msgContainer.appendChild(div);
      });
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }

    // Send message
    async function sendMessage(text) {
      if (!text.trim() || sending) return;
      sending = true;

      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      messages.push({ text: text, sender: 'user', time: now });
      
      const sendBtn = document.getElementById('df-chat-send');
      const input = document.getElementById('df-chat-input');
      if (sendBtn) sendBtn.disabled = true;
      if (input) input.value = '';
      renderMessages();

      try {
        const res = await fetch(CONFIG.chatEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });
        const data = await res.json();
        const reply = data.reply || "I appreciate your question! Let me connect you with our team for more details.";
        messages.push({
          text: reply,
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      } catch (err) {
        messages.push({
          text: "I apologize, I'm having difficulty connecting right now. Please try again or reach out to our staff directly!",
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
      
      sending = false;
      if (sendBtn) sendBtn.disabled = false;
      renderMessages();
    }

    // Event handlers
    document.getElementById('df-chat-toggle').addEventListener('click', function() {
      chatOpen = !chatOpen;
      panel.style.display = chatOpen ? 'flex' : 'none';
      this.innerHTML = chatOpen ? '✕' : '💬';
      this.style.width = chatOpen ? '48px' : '58px';
      this.style.height = chatOpen ? '48px' : '58px';
      this.style.fontSize = chatOpen ? '16px' : '24px';
      this.style.borderRadius = chatOpen ? '50%' : '50%';
      if (chatOpen) renderMessages();
    });

    document.getElementById('df-chat-close').addEventListener('click', function() {
      chatOpen = false;
      panel.style.display = 'none';
      btn.innerHTML = '💬';
      btn.style.width = '58px';
      btn.style.height = '58px';
      btn.style.fontSize = '24px';
    });

    document.getElementById('df-chat-close').parentElement.querySelector('form') || inputForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const input = document.getElementById('df-chat-input');
      if (input && input.value.trim()) sendMessage(input.value);
    });

    inputForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const input = document.getElementById('df-chat-input');
      if (input && input.value.trim()) sendMessage(input.value);
    });

    // Auto-open after 3 seconds for demo/preview
    setTimeout(function() {
      if (!chatOpen) {
        document.getElementById('df-chat-toggle').click();
      }
    }, 3000);

    console.log('✅ DeployFlow AI Chatbot initialized for', CONFIG.businessName);
  })();
  </script>
</body>
</html>`;
}

/**
 * Builds a system prompt string with full business context for the AI.
 * Used by the backend API to guide chatbot responses intelligently.
 */
export function buildChatbotPrompt(businessName, industry, location, services, faqs, hours, contactPhone, about) {
  return `You are the AI support assistant for ${businessName}, a ${industry} business serving ${location}.

BUSINESS CONTEXT:
${about ? `About: ${about}` : ''}
Services: ${services.join(', ')}
Hours: ${hours}
Contact: ${contactPhone || 'See website'}
FAQs: ${faqs.map(f => `Q: ${f.q} | A: ${f.a}`).join('; ')}

INSTRUCTIONS:
- Be helpful, friendly, and professional at all times.
- Answer questions about services, pricing, hours, and policies using the business context above.
- If asked about booking or scheduling, guide the user to use the contact form or call the business.
- If asked something outside your knowledge, politely say you'll connect them with the team.
- Keep responses concise (2-3 sentences max) and conversational.
- Never claim to be a human — you are an AI assistant for this business.`;
}

/**
 * Generates the premium preview banner at the top of the page.
 */
function generatePremiumPreviewBanner(businessName, previewId, darkerShade) {
  return `
  <div class="bg-gradient-to-r py-2.5 px-4 text-center text-xs font-semibold flex justify-between items-center shadow-inner" 
       style="background:linear-gradient(135deg, #9333ea, #7c3aed);color:white">
    <span class="flex items-center gap-1.5">
      <span>✨</span>
      <span>Previewing: <strong>Premium AI-Integrated Tier Website</strong> for ${escapeHtml(businessName)}</span>
    </span>
    <div class="flex space-x-2">
      <span class="bg-white/20 px-2.5 py-0.5 rounded text-[10px] font-bold">Premium AI Host: $49/mo</span>
      <button onclick="alert('🎉 Deploying ${escapeHtml(businessName)} premium site to custom subdomain now! (Stripe checkout triggered)')" 
              class="bg-green-500 hover:bg-green-400 text-white px-3.5 py-1 rounded text-[10px] font-extrabold transition shadow-sm uppercase tracking-wider">
        💳 Approve & Deploy Live ($49)
      </button>
    </div>
  </div>`;
}