import React from 'react';
import { db } from '../../../../lib/db';
import { notFound } from 'next/navigation';

export const revalidate = 0; // Dynamic server component

export default async function StandardPreview({ params }) {
  const { id } = await params;
  const lead = await db.getLeadById(id);

  if (!lead) {
    notFound();
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
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* Top tier selection banner (For Lead preview purposes) */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white py-2.5 px-4 text-center text-xs font-semibold flex justify-between items-center shadow-inner">
        <span>👀 Previewing: <strong>Standard Tier Website Offer</strong> for {businessName}</span>
        <div className="flex space-x-2">
          <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">Standard Host: $19/mo</span>
          <a href={`/preview/${id}/premium`} className="bg-white text-indigo-700 px-3 py-1 rounded text-[10px] font-bold hover:bg-slate-100 transition shadow-sm">
            ⚡ Upgrade to Premium AI Tier
          </a>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="border-b border-slate-100 bg-white sticky top-0 z-10 py-4 px-6 md:px-12 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="bg-indigo-600 text-white w-9 h-9 rounded-lg flex items-center justify-center font-black text-lg shadow">
            {businessName.charAt(0)}
          </div>
          <span className="font-extrabold text-lg text-slate-800 tracking-tight">{businessName}</span>
        </div>
        <nav className="hidden md:flex space-x-8 text-sm font-semibold text-slate-600">
          <a href="#about" className="hover:text-indigo-600 transition">About</a>
          <a href="#services" className="hover:text-indigo-600 transition">Services</a>
          <a href="#faq" className="hover:text-indigo-600 transition">FAQ</a>
          <a href="#contact" className="hover:text-indigo-600 transition">Contact</a>
        </nav>
        <a href="#contact" className="bg-indigo-600 text-white hover:bg-indigo-700 px-5 py-2 rounded-xl text-sm font-bold transition shadow-md">
          Book Appointment
        </a>
      </header>

      {/* Hero Section */}
      <section className="bg-slate-50 border-b border-slate-100 py-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              {industry} • {location}
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-tight">
              Premium {industry} Solutions Tailored For Your Needs.
            </h1>
            <p className="text-slate-600 leading-relaxed text-base">
              Providing top-tier services, elite professionalism, and client satisfaction in the {location} metroplex. Experience the difference today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a href="#contact" className="bg-indigo-600 hover:bg-indigo-700 text-white text-center py-3.5 px-8 rounded-xl font-bold transition shadow-lg">
                Schedule Service
              </a>
              <a href="#services" className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-center py-3.5 px-8 rounded-xl font-semibold transition">
                Our Services
              </a>
            </div>
          </div>
          <div className="bg-gradient-to-tr from-slate-200 to-slate-100 border border-slate-200 rounded-3xl aspect-[4/3] p-8 flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl"></div>
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
            <div className="w-12 h-1 bg-indigo-600 rounded mt-3"></div>
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
              <div key={index} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-500/20 transition-all">
                <div className="bg-indigo-50 text-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm mb-4">
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
                <span className="text-indigo-600">Q.</span>
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
          
          <form className="space-y-4" action="#" method="GET">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
            <input
              type="email"
              placeholder="Your Email"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
            <textarea
              placeholder="Tell us about your needs..."
              rows={4}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            ></textarea>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-3.5 rounded-xl transition shadow-lg">
              Submit Inquiry
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-8 px-6 text-center text-xs text-slate-400">
        <p>© 2026 {businessName}. All rights reserved.</p>
      </footer>
    </div>
  );
}
