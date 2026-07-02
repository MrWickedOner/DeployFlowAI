/**
 * DeployFlow AI — Local SQLite Database Adapter (Self-Hosted Mode)
 * 
 * Provides a complete database interface using libsql (embedded SQLite).
 * Used when DEPLOYFLOW_MODE=local.
 * 
 * Schema mirrors the PostgreSQL/Supabase schema but uses SQLite-compatible
 * types (no ENUMs, no UUID functions, JSON as TEXT).
 * 
 * Migrations are auto-applied on first use.
 */

import fs from 'fs';
import path from 'path';

// Try to use libsql; fall back to a simple JSON-file DB if not installed
let libsql;
try {
  libsql = require('@libsql/client');
} catch (e) {
  libsql = null;
}

const DB_PATH = path.join(process.cwd(), 'data/deployflow.db');

/**
 * Initialize the local database connection.
 * Returns a libsql client or null if unavailable (will fall back to JSON).
 */
let _client = null;
function getClient() {
  if (_client) return _client;
  
  if (libsql) {
    _client = libsql.createClient({
      url: `file:${DB_PATH}`
    });
    return _client;
  }
  return null;
}

/**
 * Get the local JSON file path for fallback data.
 */
const LOCAL_LEADS_PATH = path.join(process.cwd(), 'data/local_leads_db.json');
function getJsonLeads() {
  try {
    if (fs.existsSync(LOCAL_LEADS_PATH)) {
      return JSON.parse(fs.readFileSync(LOCAL_LEADS_PATH, 'utf8'));
    }
  } catch (e) {
    console.error('⚠️ Error reading local leads JSON:', e.message);
  }
  return [];
}

function saveJsonLeads(leads) {
  try {
    const dir = path.dirname(LOCAL_LEADS_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_LEADS_PATH, JSON.stringify(leads, null, 2), 'utf8');
  } catch (e) {
    console.error('⚠️ Error writing local leads JSON:', e.message);
  }
}

/**
 * Apply the SQLite schema migrations if tables don't exist.
 */
export async function applyMigrations() {
  const client = getClient();
  if (!client) {
    console.log('ℹ️ libsql not available, using JSON file storage.');
    return;
  }

  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        agency_name TEXT NOT NULL DEFAULT 'My Agency',
        owner_email TEXT NOT NULL DEFAULT '',
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        sub_tier TEXT NOT NULL DEFAULT 'free',
        sub_status TEXT NOT NULL DEFAULT 'active',
        lead_gen_limit INTEGER NOT NULL DEFAULT 10,
        lead_gen_used INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        agency_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
        business_name TEXT NOT NULL,
        industry TEXT,
        contact_name TEXT,
        contact_email TEXT,
        contact_phone TEXT,
        current_website TEXT,
        location TEXT,
        scraping_metadata TEXT NOT NULL DEFAULT '{}',
        intent_score REAL DEFAULT 0.0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS sites (
        id TEXT PRIMARY KEY,
        lead_id TEXT REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
        agency_id TEXT REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
        subdomain TEXT UNIQUE,
        custom_domain TEXT UNIQUE,
        status TEXT NOT NULL DEFAULT 'draft',
        chosen_tier TEXT,
        standard_config TEXT NOT NULL DEFAULT '{}',
        premium_config TEXT NOT NULL DEFAULT '{}',
        chatbot_system_prompt TEXT,
        chatbot_widget_config TEXT NOT NULL DEFAULT '{}',
        deployed_url TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id TEXT PRIMARY KEY,
        lead_id TEXT REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
        agency_id TEXT REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
        subject TEXT NOT NULL,
        body TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        sent_at TEXT,
        opened_at TEXT,
        clicked_at TEXT,
        preview_engaged INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS negotiations (
        id TEXT PRIMARY KEY,
        lead_id TEXT REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
        agency_id TEXT REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
        campaign_id TEXT REFERENCES campaigns(id) ON DELETE SET NULL,
        sender TEXT NOT NULL DEFAULT 'lead',
        message_body TEXT NOT NULL,
        message_type TEXT NOT NULL DEFAULT 'inbound',
        sentiment TEXT DEFAULT 'neutral',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_negotiations_lead ON negotiations(lead_id)
    `);

    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_campaigns_lead ON campaigns(lead_id)
    `);

    console.log('✅ SQLite schema applied successfully.');
  } catch (err) {
    console.error('⚠️ SQLite migration error:', err.message);
    console.log('ℹ️ Falling back to JSON file storage.');
  }
}

/**
 * Generate a simple unique ID (for SQLite mode since we don't have uuid-ossp).
 */
function generateId() {
  return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 10);
}

/**
 * Local DB Adapter — mirrors the same API as the Supabase-backed db.js
 */
export const localDb = {
  async getLeads() {
    const client = getClient();
    if (client) {
      try {
        const result = await client.execute('SELECT * FROM leads ORDER BY intent_score DESC');
        return result.rows.map(row => ({
          ...row,
          scraping_metadata: typeof row.scraping_metadata === 'string'
            ? JSON.parse(row.scraping_metadata)
            : row.scraping_metadata || {}
        }));
      } catch (e) {
        console.warn('⚠️ SQLite query error, falling back to JSON:', e.message);
      }
    }
    return getJsonLeads();
  },

  async getLeadById(id) {
    const client = getClient();
    if (client) {
      try {
        const result = await client.execute({
          sql: 'SELECT * FROM leads WHERE id = ?',
          args: [id]
        });
        if (result.rows.length > 0) {
          const row = result.rows[0];
          row.scraping_metadata = typeof row.scraping_metadata === 'string'
            ? JSON.parse(row.scraping_metadata)
            : row.scraping_metadata || {};
          return row;
        }
        return null;
      } catch (e) {
        console.warn('⚠️ SQLite query error, falling back to JSON:', e.message);
      }
    }
    const leads = getJsonLeads();
    return leads.find(l => l.id === id) || null;
  },

  async saveLead(leadData) {
    const client = getClient();
    if (client) {
      try {
        const id = leadData.id || generateId();
        const now = new Date().toISOString();
        const metadata = typeof leadData.scraping_metadata === 'string'
          ? leadData.scraping_metadata
          : JSON.stringify(leadData.scraping_metadata || {});

        await client.execute({
          sql: `INSERT INTO leads (id, agency_id, business_name, industry, contact_name, contact_email, contact_phone, current_website, location, scraping_metadata, intent_score, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, datetime('now')), datetime('now'))
                ON CONFLICT(id) DO UPDATE SET
                  business_name = COALESCE(excluded.business_name, leads.business_name),
                  industry = COALESCE(excluded.industry, leads.industry),
                  contact_name = COALESCE(excluded.contact_name, leads.contact_name),
                  contact_email = COALESCE(excluded.contact_email, leads.contact_email),
                  contact_phone = COALESCE(excluded.contact_phone, leads.contact_phone),
                  current_website = COALESCE(excluded.current_website, leads.current_website),
                  location = COALESCE(excluded.location, leads.location),
                  scraping_metadata = COALESCE(excluded.scraping_metadata, leads.scraping_metadata),
                  intent_score = COALESCE(excluded.intent_score, leads.intent_score),
                  updated_at = datetime('now')`,
          args: [
            id,
            leadData.agency_id || '00000000-0000-0000-0000-000000000000',
            leadData.business_name || '',
            leadData.industry || null,
            leadData.contact_name || null,
            leadData.contact_email || null,
            leadData.contact_phone || null,
            leadData.current_website || null,
            leadData.location || null,
            metadata,
            leadData.intent_score || 0,
            leadData.created_at || null
          ]
        });

        return { ...leadData, id };
      } catch (e) {
        console.warn('⚠️ SQLite save error, falling back to JSON:', e.message);
      }
    }

    // JSON fallback
    const leads = getJsonLeads();
    const idx = leads.findIndex(l => l.id === leadData.id || l.business_name === leadData.business_name);
    const prepared = {
      id: leadData.id || generateId(),
      ...leadData,
      created_at: idx >= 0 ? leads[idx].created_at : new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    if (idx >= 0) leads[idx] = prepared;
    else leads.push(prepared);
    saveJsonLeads(leads);
    return prepared;
  },

  async getProfiles() {
    const client = getClient();
    if (client) {
      try {
        const result = await client.execute('SELECT * FROM profiles LIMIT 1');
        if (result.rows.length > 0) return result.rows;
      } catch (e) {
        // ignore
      }
    }
    return [{
      id: '00000000-0000-0000-0000-000000000000',
      agency_name: 'DeployFlow Launch Agency (Local)',
      owner_email: 'agency@deployflow.local',
      sub_tier: 'free',
      sub_status: 'active'
    }];
  },

  // ─── Campaign Methods ──────────────────────────────────────────
  async getCampaigns() {
    const client = getClient();
    if (client) {
      try {
        const result = await client.execute(`
          SELECT c.*, l.business_name as lead_name
          FROM campaigns c LEFT JOIN leads l ON c.lead_id = l.id
          ORDER BY c.created_at DESC
        `);
        return result.rows;
      } catch (e) {
        console.warn('⚠️ SQLite campaigns query error:', e.message);
      }
    }
    return [];
  },

  async getCampaignsByLead(leadId) {
    const client = getClient();
    if (client) {
      try {
        const result = await client.execute({
          sql: 'SELECT * FROM campaigns WHERE lead_id = ? ORDER BY created_at DESC',
          args: [leadId]
        });
        return result.rows;
      } catch (e) {
        console.warn('⚠️ SQLite campaigns query error:', e.message);
      }
    }
    return [];
  },

  async saveCampaign(campaignData) {
    const client = getClient();
    if (client) {
      try {
        const id = campaignData.id || generateId();
        await client.execute({
          sql: `INSERT INTO campaigns (id, lead_id, agency_id, subject, body, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
                ON CONFLICT(id) DO UPDATE SET
                  subject = COALESCE(excluded.subject, campaigns.subject),
                  body = COALESCE(excluded.body, campaigns.body),
                  status = COALESCE(excluded.status, campaigns.status),
                  sent_at = COALESCE(excluded.sent_at, campaigns.sent_at),
                  opened_at = COALESCE(excluded.opened_at, campaigns.opened_at),
                  clicked_at = COALESCE(excluded.clicked_at, campaigns.clicked_at),
                  preview_engaged = COALESCE(excluded.preview_engaged, campaigns.preview_engaged),
                  updated_at = datetime('now')`,
          args: [
            id,
            campaignData.lead_id || '',
            campaignData.agency_id || '00000000-0000-0000-0000-000000000000',
            campaignData.subject || '',
            campaignData.body || '',
            campaignData.status || 'draft'
          ]
        });
        return { ...campaignData, id };
      } catch (e) {
        console.warn('⚠️ SQLite campaign save error:', e.message);
      }
    }
    return campaignData;
  },

  async updateCampaignStatus(id, status, extra = {}) {
    const client = getClient();
    if (client) {
      try {
        const sets = ['updated_at = datetime(\'now\')'];
        const args = [];
        if (status) { sets.push('status = ?'); args.push(status); }
        if (extra.sent_at) { sets.push('sent_at = ?'); args.push(extra.sent_at); }
        if (extra.opened_at) { sets.push('opened_at = ?'); args.push(extra.opened_at); }
        if (extra.clicked_at) { sets.push('clicked_at = ?'); args.push(extra.clicked_at); }
        args.push(id);
        await client.execute({
          sql: `UPDATE campaigns SET ${sets.join(', ')} WHERE id = ?`,
          args
        });
      } catch (e) {
        console.warn('⚠️ SQLite campaign update error:', e.message);
      }
    }
  },

  // ─── Negotiation Methods ───────────────────────────────────────
  async getNegotiations(leadId) {
    const client = getClient();
    if (client) {
      try {
        const result = await client.execute({
          sql: 'SELECT * FROM negotiations WHERE lead_id = ? ORDER BY created_at ASC',
          args: [leadId]
        });
        return result.rows;
      } catch (e) {
        console.warn('⚠️ SQLite negotiations query error:', e.message);
      }
    }
    return [];
  },

  async saveNegotiation(msg) {
    const client = getClient();
    if (client) {
      try {
        const id = msg.id || generateId();
        await client.execute({
          sql: `INSERT INTO negotiations (id, lead_id, agency_id, campaign_id, sender, message_body, message_type, sentiment, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
          args: [
            id,
            msg.lead_id || '',
            msg.agency_id || '00000000-0000-0000-0000-000000000000',
            msg.campaign_id || null,
            msg.sender || 'lead',
            msg.message_body || '',
            msg.message_type || 'inbound',
            msg.sentiment || 'neutral'
          ]
        });
        return { ...msg, id };
      } catch (e) {
        console.warn('⚠️ SQLite negotiation save error:', e.message);
      }
    }
    return msg;
  }
};

export default localDb;