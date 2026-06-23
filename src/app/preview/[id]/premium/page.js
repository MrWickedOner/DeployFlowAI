'use client';

import React, { useState, useEffect, useRef, use } from 'react';

export default function PremiumPreview({ params }) {
  const { id } = use(params);
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Chat Widget State
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    async function fetchLead() {
      try {
        const res = await fetch('/api/leads');
        const data = await res.json();
        const found = Array.isArray(data) ? data.find(l => l.id === id) : null;
        setLead(found);
      } catch (err) {
        console.error('Error fetching lead data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLead();
  }, [id]);

  useEffect(() => {
    if (chatOpen && messages.length === 0 && lead) {
      // Seed with initial greetings
      setMessages([
        { 
          text: `👋 Hi! I'm your virtual assistant at ${lead.business_name}. How can I help you today? Ask me about our services, pricing, or operating hours!`, 
          sender: 'bot', 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }
      ]);
    }
  }, [chatOpen, lead, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || sending) return;

    const userText = inputMessage.trim();
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add User Message
    const userMsg = { text: userText, sender: 'user', time: currentTime };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setSending(true);

    try {
      // Call preview API simulation endpoint for responding
      const res = await fetch(`/api/preview/${id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });
      const responseData = await res.json();
      
      const botMsg = {
        text: responseData.reply,
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = {
        text: "I apologize, I'm having difficulty connecting right now. Please try again or reach out to our staff directly!",
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <p className="text-sm text-slate-400">Loading custom AI preview site...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center space-y-4 p-4 text-center">
        <p className="text-slate-400">Preview Lead profile not found.</p>
        <a href="/leads" className="bg-indigo-600 hover:bg-indigo-500 text-xs px-4 py-2 rounded-lg font-bold">Return to Dashboard</a>
      </div>
    );
  }

  const businessName = lead.business_name;
  const industry = lead.industry || 'Local Services';
  const location = lead.location || 'Austin, TX';
  const services = lead.scraping_metadata?.business_context?.services || ['Custom Solutions', 'Premium Service', 'Professional Delivery'];
  const hours = lead.scraping_metadata?.business_context?.hours || 'Mon-Fri: 9:00 AM - 5:00 PM';
  const aboutText = lead.scraping_metadata?.business_context?.about || `${businessName} is a premier ${industry} provider serving ${location} with excellence, customer dedication, and professional reliability.`;
  const faqs = lead.scraping_metadata?.business_context?.faqs || [
    { q: 'What is your turnaround time?', a: 'We pride ourselves on prompt service. Contact us directly to schedule a priority slot.' },
    { q: 'How can I get an estimate?', a: 'Fill out our inquiry form or give us a call to receive a free, no-obligation custom estimate.' }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans relative">
      {/* Top tier selection banner (For Lead preview purposes) */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-800 text-white py-2.5 px-4 text-center text-xs font-semibold flex justify-between items-center shadow-inner relative z-20">
        <span className="flex items-center space-x-1.5">
          <span className="animate-pulse">✨</span>
          <span>Previewing: <strong>Premium AI-Integrated Tier Website</strong> for {businessName}</span>
        </span>
        <div className="flex space-x-2">
          <span className="bg-white/20 px-2.5 py-0.5 rounded text-[10px] font-bold">Premium AI Host: $49/mo</span>
          <button onClick={() => alert(`🎉 Deploying ${businessName} premium site to custom subdomain now! (Stripe checkout triggered)`)} className="bg-green-500 hover:bg-green-400 text-white px-3.5 py-1 rounded text-[10px] font-extrabold transition shadow-sm uppercase tracking-wider">
            💳 Approve & Deploy Live ($49)
          </button>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="border-b border-slate-100 bg-white sticky top-0 z-10 py-4 px-6 md:px-12 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="bg-purple-600 text-white w-9 h-9 rounded-lg flex items-center justify-center font-black text-lg shadow">
            {businessName.charAt(0)}
          </div>
          <span className="font-extrabold text-lg text-slate-800 tracking-tight">{businessName}</span>
        </div>
        <nav className="hidden md:flex space-x-8 text-sm font-semibold text-slate-600">
          <a href="#about" className="hover:text-purple-600 transition">About</a>
          <a href="#services" className="hover:text-purple-600 transition">Services</a>
          <a href="#faq" className="hover:text-purple-600 transition">FAQ</a>
          <a href="#contact" className="hover:text-purple-600 transition">Contact</a>
        </nav>
        <a href="#contact" className="bg-purple-600 text-white hover:bg-purple-700 px-5 py-2 rounded-xl text-sm font-bold transition shadow-md">
          Book Appointment
        </a>
      </header>

      {/* Hero Section */}
      <section className="bg-slate-50 border-b border-slate-100 py-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              {industry} • {location}
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-tight">
              Premium {industry} Solutions Tailored For Your Needs.
            </h1>
            <p className="text-slate-600 leading-relaxed text-base">
              Providing top-tier services, elite professionalism, and client satisfaction in the {location} metroplex. Experience the difference today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a href="#contact" className="bg-purple-600 hover:bg-purple-700 text-white text-center py-3.5 px-8 rounded-xl font-bold transition shadow-lg">
                Schedule Service
              </a>
              <a href="#services" className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-center py-3.5 px-8 rounded-xl font-semibold transition">
                Our Services
              </a>
            </div>
          </div>
          <div className="bg-gradient-to-tr from-slate-200 to-slate-100 border border-slate-200 rounded-3xl aspect-[4/3] p-8 flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl"></div>
            <div>
              <p className="text-xs text-slate-400 font-extrabold uppercase tracking-widest">Operating Hours</p>
              <p className="text-sm font-bold text-slate-700 mt-1">{hours}</p>
            </div>
            <div className="bg-white/80 backdrop-blur border border-slate-200/50 p-6 rounded-2xl shadow-sm space-y-2">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Quick Contact</p>
              <p className="text-sm font-bold text-slate-800">{lead.contact_name || 'Staff Representative'}</p>
              <p className="text-xs text-slate-500">{lead.contact_email || 'info@' + businessName.toLowerCase().replace(/\s+/g, '') + '.com'}</p>
              <p className="text-xs text-slate-500 font-medium">{lead.contact_phone || '(512) 555-0100'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 md:px-12 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-1">
            <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">Who We Are</h2>
            <div className="w-12 h-1 bg-purple-600 rounded mt-3"></div>
          </div>
          <div className="md:col-span-2 text-slate-600 space-y-6 leading-relaxed">
            <p className="text-lg text-slate-700 font-medium">
              We focus on delivering high-performance care, trusted craftsmanship, and premium client execution.
            </p>
            <p>{aboutText}</p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="bg-slate-50 border-y border-slate-100 py-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">Our Professional Services</h2>
            <p className="text-slate-500 text-sm">Engineered for quality, longevity, and ultimate performance.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-500/20 transition-all">
                <div className="bg-purple-50 text-purple-600 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm mb-4">
                  0{index + 1}
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{service}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">High-integrity execution configured precisely for your schedule and exact business specifications.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-6 md:px-12 max-w-4xl mx-auto">
        <div className="text-center mb-16 space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">Frequently Asked Questions</h2>
          <p className="text-slate-500 text-sm">Everything you need to know about our workflow and scheduling.</p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-900 flex items-start space-x-2">
                <span className="text-purple-600">Q.</span>
                <span>{faq.q}</span>
              </h3>
              <p className="text-slate-600 text-sm pl-6 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="bg-slate-950 text-white py-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h2 className="text-3xl font-black tracking-tight">Connect with Us Today.</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Have questions or ready to schedule your consultation? Leave us your details and a representative will reach out shortly.
            </p>
            <div className="space-y-4 pt-4 text-xs text-slate-400">
              <p>📍 <strong className="text-white">Location:</strong> {location}</p>
              <p>📞 <strong className="text-white">Phone:</strong> {lead.contact_phone || '(512) 555-0100'}</p>
              <p>✉️ <strong className="text-white">Email:</strong> {lead.contact_email || 'info@' + businessName.toLowerCase().replace(/\s+/g, '') + '.com'}</p>
            </div>
          </div>
          
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Inquiry successfully recorded (Simulated Demo)'); }}>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                required
              />
            </div>
            <input
              type="email"
              placeholder="Your Email"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              required
            />
            <textarea
              placeholder="Tell us about your needs..."
              rows={4}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              required
            ></textarea>
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-3.5 rounded-xl transition shadow-lg">
              Submit Inquiry
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-8 px-6 text-center text-xs text-slate-400">
        <p>© 2026 {businessName}. All rights reserved.</p>
      </footer>

      {/* FLOATING CHATBOT WIDGET BUTTON */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {chatOpen && (
          <div className="bg-white rounded-3xl w-80 md:w-96 h-[480px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden mb-4 animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 flex justify-between items-center shadow-md">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-base border border-white/20">
                  ✨
                </div>
                <div>
                  <h4 className="font-bold text-sm tracking-tight">{businessName} Support AI</h4>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-[10px] text-purple-100 font-semibold">Pre-Configured Chatbot</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setChatOpen(false)}
                className="w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-white transition text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Message Pane */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-3.5">
              {messages.map((msg, index) => {
                const isBot = msg.sender === 'bot';
                return (
                  <div key={index} className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs shadow-sm leading-relaxed ${
                      isBot 
                        ? 'bg-white border border-slate-200 text-slate-800' 
                        : 'bg-purple-600 text-white font-medium'
                    }`}>
                      <p>{msg.text}</p>
                      <p className={`text-[9px] mt-1 text-right ${isBot ? 'text-slate-400' : 'text-purple-200'}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                );
              })}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 text-slate-800 max-w-[80%] rounded-2xl p-3 px-4 shadow-sm flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="border-t border-slate-100 p-3 bg-white flex items-center space-x-2">
              <input
                type="text"
                placeholder="Ask me anything..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                required
              />
              <button 
                type="submit" 
                disabled={sending}
                className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl py-2.5 px-4 text-xs font-bold transition shadow-sm flex items-center justify-center"
              >
                Send
              </button>
            </form>
          </div>
        )}

        {/* Floating Bubble Button */}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 animate-bounce-subtle"
        >
          {chatOpen ? (
            <span className="font-bold text-xs tracking-tight uppercase px-1">Hide Chat</span>
          ) : (
            <div className="flex items-center space-x-2 px-1.5">
              <span className="text-sm">💬</span>
              <span className="font-bold text-xs tracking-tight uppercase">Test Support AI</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
