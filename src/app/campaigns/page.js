'use client';

import React, { useState, useEffect } from 'react';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showComposer, setShowComposer] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [campRes, leadRes] = await Promise.all([
          fetch('/api/campaigns'),
          fetch('/api/leads')
        ]);
        const campData = await campRes.json();
        const leadData = await leadRes.json();
        setCampaigns(Array.isArray(campData) ? campData : []);
        setLeads(Array.isArray(leadData) ? leadData : []);
      } catch (err) {
        console.error('Error loading data:', err);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSendCampaign = async (e) => {
    e.preventDefault();
    if (!selectedLeadId) {
      setMessage('⚠️ Please select a lead first.');
      return;
    }
    setSending(true);
    setMessage(`📤 Sending outreach campaign...`);

    try {
      const res = await fetch('/api/campaigns/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: selectedLeadId,
          subject: customSubject || undefined,
          body: customBody || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ Campaign sent! ${data.message}`);
        // Refresh campaigns
        const campRes = await fetch('/api/campaigns');
        const campData = await campRes.json();
        setCampaigns(Array.isArray(campData) ? campData : []);
        setShowComposer(false);
        setSelectedLeadId('');
        setCustomSubject('');
        setCustomBody('');
      } else {
        setMessage(`❌ Failed: ${data.error}`);
      }
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setSending(false);
      setTimeout(() => setMessage(''), 6000);
    }
  };

  const statusBadge = (status) => {
    const colors = {
      draft: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      sent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      opened: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      replied: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      converted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    };
    return colors[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  const filteredCampaigns = activeTab === 'all'
    ? campaigns
    : campaigns.filter(c => c.status === activeTab);

  const getLeadName = (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    return lead ? lead.business_name : 'Unknown Lead';
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
            <p className="text-[10px] text-slate-400">Campaign Management & Outreach</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <a href="/leads" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
            ← Back to Leads
          </a>
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-slate-200">DeployFlow Launch Agency</p>
            <p className="text-xs text-indigo-400">campaigns active</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold border-2 border-indigo-600 shadow-sm text-slate-100">
            LA
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left column - Campaign Composer */}
        <div className="lg:col-span-1 space-y-6">
          {/* New Campaign Card */}
          <div className="bg-[#122147] rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none"></div>
            
            {!showComposer ? (
              <>
                <h2 className="text-lg font-bold text-white mb-1 flex items-center space-x-2">
                  <span className="text-indigo-400 text-lg">📧</span>
                  <span>New Outreach</span>
                </h2>
                <p className="text-xs text-slate-400 mb-4">
                  Send a personalized Standard & Premium preview email to a lead.
                </p>
                <button
                  onClick={() => setShowComposer(true)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold transition-all duration-200 shadow-lg"
                >
                  ✨ Compose Campaign
                </button>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-white mb-1 flex items-center space-x-2">
                  <span className="text-indigo-400 text-lg">✉️</span>
                  <span>Compose Campaign</span>
                </h2>
                <p className="text-xs text-slate-400 mb-4">
                  Customize or use auto-generated outreach with preview links.
                </p>

                <form onSubmit={handleSendCampaign} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Select Lead</label>
                    <select
                      value={selectedLeadId}
                      onChange={(e) => setSelectedLeadId(e.target.value)}
                      className="w-full bg-[#08122a] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Choose a lead...</option>
                      {leads.map(lead => (
                        <option key={lead.id} value={lead.id}>
                          {lead.business_name} — {lead.industry || 'Niche'} — {lead.intent_score}%
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                      Subject <span className="text-slate-600">(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Leave blank for auto-generated"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      className="w-full bg-[#08122a] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                      Custom Body <span className="text-slate-600">(optional)</span>
                    </label>
                    <textarea
                      placeholder="Leave blank for auto-generated email with Standard & Premium preview links"
                      value={customBody}
                      onChange={(e) => setCustomBody(e.target.value)}
                      rows={5}
                      className="w-full bg-[#08122a] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={sending}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:from-slate-800 disabled:to-slate-800 text-white rounded-xl text-xs font-bold transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
                    >
                      {sending ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <span>🚀 Send Campaign</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowComposer(false)}
                      className="px-4 py-3 bg-[#08122a] hover:bg-slate-800 text-slate-400 rounded-xl text-xs font-medium transition-all border border-slate-800"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}

            {message && (
              <div className="mt-4 p-3.5 bg-indigo-950/40 border border-indigo-500/20 text-indigo-300 rounded-xl text-xs animate-fade-in text-center leading-relaxed">
                {message}
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="bg-[#101c40] rounded-2xl p-6 border border-slate-800 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Campaign Status</h3>
            <div className="space-y-2">
              {['all', 'draft', 'sent', 'opened', 'replied', 'converted'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                    activeTab === tab
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-[#08122a]'
                  }`}
                >
                  {tab === 'all' ? '📋 All Campaigns' : `📌 ${tab}`}
                  {tab !== 'all' && (
                    <span className="float-right text-slate-500">
                      ({campaigns.filter(c => c.status === tab).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - Campaigns List */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center bg-[#101c40] p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                {activeTab === 'all' ? 'All Campaigns' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Campaigns`}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                <span className="text-indigo-400 font-bold">{filteredCampaigns.length}</span> campaigns found
                {activeTab === 'all' && (
                  <span className="text-slate-500"> · {campaigns.filter(c => c.status === 'sent').length} sent / {campaigns.filter(c => c.status === 'replied').length} replies</span>
                )}
              </p>
            </div>
            <div className="text-xs text-slate-400 bg-slate-850 px-3 py-1.5 rounded-lg border border-slate-800">
              {leads.length} leads available
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
              <p className="text-sm text-slate-400">Loading campaign data...</p>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="bg-[#101c40] rounded-2xl py-16 px-4 text-center border border-slate-800 shadow-xl">
              <p className="text-4xl mb-4">📬</p>
              <p className="text-slate-400 mb-2">No campaigns yet.</p>
              <p className="text-xs text-slate-500">
                {activeTab === 'all'
                  ? 'Click "Compose Campaign" to send your first outreach email with Standard & Premium AI previews.'
                  : `No campaigns with status "${activeTab}". Try a different filter.`}
              </p>
              {activeTab === 'all' && !showComposer && (
                <button
                  onClick={() => setShowComposer(true)}
                  className="mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all"
                >
                  ✨ Send First Campaign
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="bg-[#101c40] hover:bg-[#13234f] rounded-2xl p-6 border border-slate-800 hover:border-indigo-500/30 transition-all duration-200 shadow-lg"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2.5">
                        <h3 className="text-base font-bold text-white">{campaign.subject || '(No Subject)'}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadge(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5">
                        To: <span className="text-indigo-300 font-medium">{getLeadName(campaign.lead_id)}</span>
                        {campaign.created_at && (
                          <>
                            <span className="mx-2">·</span>
                            <span>{new Date(campaign.created_at).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}</span>
                          </>
                        )}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      {campaign.preview_engaged > 0 && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
                          👁️ Preview Engaged
                        </span>
                      )}
                      {campaign.opened_at && (
                        <span className="text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
                          Opened
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-3">
                    <p className="text-xs text-slate-400 line-clamp-2">{campaign.body || 'No body content'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-slate-800 bg-[#08122a] py-6 px-6 text-center text-xs text-slate-500">
        <p>© 2026 DeployFlow AI — Email Outreach & Autonomous Negotiation Engine Active</p>
      </footer>
    </div>
  );
}