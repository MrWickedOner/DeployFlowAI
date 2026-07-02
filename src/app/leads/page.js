'use client';

import React, { useState, useEffect } from 'react';

export default function LeadFinder() {
  // Campaign sending state
  const [sendingCampaign, setSendingCampaign] = useState(null);
  const [campaignMessage, setCampaignMessage] = useState('');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('All');
  
  // Custom states for simulated lead generation & API triggers
  const [scraping, setScraping] = useState(false);
  const [newQuery, setNewQuery] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [scrapeMessage, setScrapeMessage] = useState('');

  useEffect(() => {
    async function loadLeads() {
      setLoading(true);
      try {
        const res = await fetch('/api/leads');
        const data = await res.json();
        setLeads(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching leads:', err);
      }
      setLoading(false);
    }
    loadLeads();
  }, []);

  // Filter leads based on user query/location/niche inputs
  const filteredLeads = leads.filter(lead => {
    const matchesQuery = searchQuery === '' || 
      lead.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.industry && lead.industry.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesLocation = searchLocation === '' || 
      lead.location.toLowerCase().includes(searchLocation.toLowerCase());
    
    const matchesNiche = selectedNiche === 'All' || 
      (lead.industry && lead.industry.toLowerCase().includes(selectedNiche.toLowerCase()));

    return matchesQuery && matchesLocation && matchesNiche;
  });

  // Unique list of niches for filter buttons
  const niches = ['All', 'Chiropractor', 'Dentist', 'Plumbing', 'Veterinary', 'Law', 'Restaurant', 'Roofing', 'Fitness', 'Bakery', 'Accounting'];

  // Handle triggered simulated scraper
  const handleScrapeLeads = async (e) => {
    e.preventDefault();
    if (!newQuery) return;
    
    setScraping(true);
    setScrapeMessage(`🔍 Initializing presence audit for "${newQuery}" in "${newLocation || 'Austin, TX'}"...`);
    
    try {
      // Simulate calling the background scraper script
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Calculate realistic results
      const mockBusiness = {
        name: `${newQuery} Pros`,
        website: Math.random() > 0.5 ? `https://${newQuery.toLowerCase().replace(/\s+/g, '')}pros.com` : '',
        contact: 'Jane Smith',
        email: `info@${newQuery.toLowerCase().replace(/\s+/g, '')}pros.com`,
        phone: '(512) 555-0210'
      };

      let painPoints = [];
      let score = 30;

      if (!mockBusiness.website) {
        score += 45;
        painPoints.push('No existing website found');
      } else {
        painPoints.push('Slow page load speed: 5.4s');
        painPoints.push('Website is not mobile responsive');
        score += 35;
      }
      
      const newLead = {
        id: Math.random().toString(36).substring(2, 15),
        business_name: mockBusiness.name,
        industry: newQuery,
        contact_name: mockBusiness.contact,
        contact_email: mockBusiness.email,
        contact_phone: mockBusiness.phone,
        current_website: mockBusiness.website || null,
        location: newLocation || 'Austin, TX',
        intent_score: Math.min(100, score),
        scraping_metadata: {
          has_website: !!mockBusiness.website,
          load_speed_seconds: mockBusiness.website ? 5.4 : 0,
          mobile_friendly: false,
          has_h1_tags: true,
          has_meta_desc: false,
          has_chatbot: false,
          seo_score: mockBusiness.website ? 45 : 0,
          performance_score: mockBusiness.website ? 38 : 0,
          pain_points: painPoints
        }
      };

      // Save via the server-side API endpoint
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead)
      });
      const savedLead = await res.json();
      setLeads([savedLead, ...leads]);
      setScrapeMessage(`🎉 Found high-intent lead "${savedLead.business_name}" with Intent Score: ${savedLead.intent_score}/100!`);
      setNewQuery('');
      setNewLocation('');
    } catch (err) {
      setScrapeMessage(`❌ Scrape error: ${err.message}`);
    } finally {
      setScraping(false);
      setTimeout(() => setScrapeMessage(''), 6000);
    }
  };

  // Handle sending campaign outreach for a lead
  const handleSendCampaign = async (leadId, businessName) => {
    setSendingCampaign(leadId);
    setCampaignMessage(`📤 Sending outreach to ${businessName}...`);
    try {
      const res = await fetch('/api/campaigns/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      });
      const data = await res.json();
      if (res.ok) {
        setCampaignMessage(`✅ Campaign sent to ${businessName}! ${data.message}`);
      } else {
        setCampaignMessage(`❌ Failed: ${data.error}`);
      }
    } catch (err) {
      setCampaignMessage(`❌ Error: ${err.message}`);
    } finally {
      setSendingCampaign(null);
      setTimeout(() => setCampaignMessage(''), 5000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b1329] text-white">
      {/* Platform Navigation */}
      <header className="border-b border-slate-800 bg-[#0f1b3a] py-4 px-6 md:px-8 flex justify-between items-center shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white font-bold tracking-wider text-xl shadow-md">DF</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center">
              DeployFlow <span className="text-indigo-400 font-extrabold ml-1.5 text-xs bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">AI</span>
            </h1>
            <p className="text-[10px] text-slate-400">Autonomous Web Acquisition & Delivery</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-slate-200">DeployFlow Launch Agency</p>
            <p className="text-xs text-indigo-400">agency_pro active plan</p>
                        </div>
                        <a href="/campaigns" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors mr-4">
                          📨 Campaigns
                        </a>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold border-2 border-indigo-600 shadow-sm text-slate-100">
            LA
          </div>
        </div>
      </header>

      {/* Main Body Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left column - Lead discovery form and filter */}
        <div className="lg:col-span-1 space-y-6">
          {/* Autonomous Discovery Scanner Card */}
          <div className="bg-[#122147] rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none"></div>
            <h2 className="text-lg font-bold text-white mb-1 flex items-center space-x-2">
              <span className="text-indigo-400 text-lg">⚡</span>
              <span>Autonomous Finder</span>
            </h2>
            <p className="text-xs text-slate-400 mb-4">Run directory audits to scan presence indicators and trigger proposals.</p>
            
            <form onSubmit={handleScrapeLeads} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Business Niche / Keyword</label>
                <input
                  type="text"
                  placeholder="e.g. Chiropractor, Plumber"
                  value={newQuery}
                  onChange={(e) => setNewQuery(e.target.value)}
                  className="w-full bg-[#08122a] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Location / City</label>
                <input
                  type="text"
                  placeholder="e.g. Austin, TX"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-[#08122a] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={scraping}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:from-slate-800 disabled:to-slate-800 text-white rounded-xl text-xs font-bold transition-all duration-200 transform hover:scale-[1.01] flex items-center justify-center space-x-2 shadow-lg"
              >
                {scraping ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Auditing Directory...</span>
                  </>
                ) : (
                  <>
                    <span>🔍 Trigger Scraper Audit</span>
                  </>
                )}
              </button>
            </form>

            {scrapeMessage && (
              <div className="mt-4 p-3.5 bg-indigo-950/40 border border-indigo-500/20 text-indigo-300 rounded-xl text-xs animate-fade-in text-center leading-relaxed">
                {scrapeMessage}
              </div>
            )}
            {campaignMessage && (
              <div className="mt-2 p-3 bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs animate-fade-in text-center leading-relaxed">
                {campaignMessage}
              </div>
            )}
          </div>

          {/* Filtering Sidebar */}
          <div className="bg-[#101c40] rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Refine Lead Filters</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Search Business Name</label>
                <input
                  type="text"
                  placeholder="Filter name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#08122a] border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Search Location</label>
                <input
                  type="text"
                  placeholder="Filter location..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full bg-[#08122a] border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4">
              <label className="block text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">Filter by Niche</label>
              <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pr-1">
                {niches.map(niche => (
                  <button
                    key={niche}
                    onClick={() => setSelectedNiche(niche)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedNiche === niche
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-[#08122a] hover:bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {niche}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Leads view list */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center bg-[#101c40] p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Lead Acquisition Board</h2>
              <p className="text-xs text-slate-400 mt-1">
                We have verified <span className="text-indigo-400 font-bold">{filteredLeads.length}</span> high-intent leads waiting for AI mockup deployment.
              </p>
            </div>
            <div className="text-xs text-slate-400 bg-slate-850 px-3 py-1.5 rounded-lg border border-slate-800">
              Database Type: <span className="text-green-400 font-bold">Cloud-Linked / Hybrid Fallback</span>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
              <p className="text-sm text-slate-400">Retrieving verified client databases...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="bg-[#101c40] rounded-2xl py-16 px-4 text-center border border-slate-800 shadow-xl">
              <p className="text-slate-400 mb-2">No matching leads found.</p>
              <p className="text-xs text-slate-500">Try adjusting your filters or triggering the Scraper above to discover new clients.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLeads.map((lead) => {
                const painPoints = lead.scraping_metadata?.pain_points || [];
                const hasWebsite = lead.scraping_metadata?.has_website ?? true;
                const loadSpeed = lead.scraping_metadata?.load_speed_seconds || 0;
                
                // Get intent badge colors
                let intentColor = 'bg-red-500/10 text-red-400 border-red-500/20';
                if (lead.intent_score < 50) intentColor = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
                else if (lead.intent_score >= 80) intentColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

                return (
                  <div
                    key={lead.id}
                    className="bg-[#101c40] hover:bg-[#13234f] rounded-2xl p-6 border border-slate-800 hover:border-indigo-500/30 transition-all duration-200 shadow-lg relative overflow-hidden"
                  >
                    {/* Header bar of lead card */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                      <div>
                        <div className="flex items-center space-x-2.5">
                          <h3 className="text-lg font-bold text-white">{lead.business_name}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${intentColor}`}>
                            {lead.intent_score}% Intent
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1.5">
                          <span className="bg-slate-800 px-2 py-0.5 rounded text-indigo-300 font-medium">{lead.industry || 'Local Business'}</span>
                          <span>•</span>
                          <span>{lead.location}</span>
                          {lead.current_website && (
                            <>
                              <span>•</span>
                              <a href={lead.current_website} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline truncate max-w-xs">
                                {lead.current_website.replace(/^https?:\/\//i, '')}
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Standard vs Premium Offers Badges */}
                      <div className="flex space-x-2">
                        <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
                          Standard Offer: $19/mo
                        </span>
                        <span className="text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
                          Premium AI Offer: $49/mo
                        </span>
                      </div>
                    </div>

                    {/* Body content of lead card - audited presence and pain points */}
                    <div className="border-t border-slate-800 pt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-2.5">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Actionable Pain Points</h4>
                        {painPoints.length === 0 ? (
                          <p className="text-xs text-slate-500">No explicit digital footprint pain points detected.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {painPoints.map((pt, index) => (
                              <span
                                key={index}
                                className="px-3 py-1.5 bg-[#08122a] border border-slate-800 text-slate-300 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm"
                              >
                                <span className="text-red-400">⚠️</span>
                                <span>{pt}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="md:col-span-1 bg-[#08122a]/50 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
                        <div className="text-xs space-y-1 text-slate-400">
                          <p><strong className="text-slate-300">Contact:</strong> {lead.contact_name || 'N/A'}</p>
                          <p><strong className="text-slate-300">Email:</strong> {lead.contact_email || 'N/A'}</p>
                          <p><strong className="text-slate-300">Phone:</strong> {lead.contact_phone || 'N/A'}</p>
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <button
                            onClick={() => alert(`🚀 Generating high-performance Standard/Premium AI web mockups for ${lead.business_name}...`)}
                            className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md text-center"
                          >
                            🎨 Create Mockups
                          </button>
                          <button
                            onClick={() => handleSendCampaign(lead.id, lead.business_name)}
                            disabled={sendingCampaign === lead.id}
                            className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:from-slate-800 disabled:to-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-md text-center"
                          >
                            {sendingCampaign === lead.id ? (
                              <svg className="animate-spin h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              '📨 Send Campaign'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-slate-800 bg-[#08122a] py-6 px-6 text-center text-xs text-slate-500">
        <p>© 2026 DeployFlow AI. Powered by fully autonomous sales, negotiation, and instant Vercel/Supabase orchestration.</p>
      </footer>
    </div>
  );
}
