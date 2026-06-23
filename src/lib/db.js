/**
 * DeployFlow AI — Unified Database Abstraction Layer (Dual-Mode)
 * 
 * Automatically selects the correct database backend based on DEPLOYFLOW_MODE:
 * 
 *   DEPLOYFLOW_MODE=cloud  → Uses Supabase PostgreSQL (original SaaS mode)
 *   DEPLOYFLOW_MODE=local  → Uses SQLite via libsql (self-hosted mode)
 *   (unset)                → Tries Supabase first, falls back to local JSON
 * 
 * Both modes expose the same API so the rest of the app doesn't care
 * which backend is active.
 */

import { supabase } from './supabase';
import fs from 'fs';
import path from 'path';

// Lazy-load localDB only if needed (avoids breaking Cloud builds)
let localDb = null;

/**
 * Get the current deployment mode.
 */
function getMode() {
  return (process.env.DEPLOYFLOW_MODE || 'cloud').toLowerCase();
}

/**
 * Check if we should use the local database backend.
 */
function isLocalMode() {
  return getMode() === 'local';
}

/**
 * Load the local DB adapter lazily.
 */
async function getLocalDb() {
  if (!localDb) {
    const mod = await import('./local-db.js');
    localDb = mod.localDb || mod.default;
    await mod.applyMigrations?.();
  }
  return localDb;
}

// Path for local JSON database fallback
const LOCAL_DB_PATH = path.join(process.cwd(), 'data/local_leads_db.json');

// Helper to check if we are in a Node environment
const isServer = typeof window === 'undefined';

/**
 * Ensures the local JSON database exists and returns the parsed array of leads.
 */
function getLocalLeads() {
  if (!isServer) return [];
  try {
    const dir = path.dirname(LOCAL_DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(LOCAL_DB_PATH)) {
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
    const data = fs.readFileSync(LOCAL_DB_PATH, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('⚠️ Error reading local leads DB fallback:', err.message);
    return [];
  }
}

/**
 * Saves a list of leads back to the local JSON database.
 */
function saveLocalLeads(leads) {
  if (!isServer) return;
  try {
    const dir = path.dirname(LOCAL_DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(leads, null, 2), 'utf8');
  } catch (err) {
    console.error('⚠️ Error writing to local leads DB fallback:', err.message);
  }
}

/**
 * Unified DB API — works identically in both cloud and local modes.
 */
export const db = {
  /**
   * Retrieves all leads, sorted by intent score (descending).
   */
  async getLeads() {
    // Local mode: use SQLite
    if (isLocalMode()) {
      const local = await getLocalDb();
      return local.getLeads();
    }

    // Cloud mode: try Supabase first, fall back to JSON
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('intent_score', { ascending: false });

      if (error) {
        console.warn(`💡 Supabase leads query failed (${error.code || error.message}). Falling back to local database...`);
        return getLocalLeads();
      }

      return data;
    } catch (err) {
      console.warn(`💡 Supabase connection error: ${err.message}. Falling back to local database...`);
      return getLocalLeads();
    }
  },

  /**
   * Retrieves a single lead by its ID.
   */
  async getLeadById(id) {
    // Local mode
    if (isLocalMode()) {
      const local = await getLocalDb();
      return local.getLeadById(id);
    }

    // Cloud mode
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.log(`ℹ️ Supabase getLeadById query failed or skipped. Falling back to local data...`);
      const localLeads = getLocalLeads();
      return localLeads.find(l => l.id === id) || null;
    }
  },

  /**
   * Saves or updates a lead.
   */
  async saveLead(leadData) {
    // Local mode
    if (isLocalMode()) {
      const local = await getLocalDb();
      return local.saveLead(leadData);
    }

    // Cloud mode
    try {
      const { data, error } = await supabase
        .from('leads')
        .upsert(leadData, { onConflict: 'id' })
        .select();

      if (error) throw error;
      console.log(`🔌 Saved lead to Supabase: ${leadData.business_name}`);
      return data[0];
    } catch (err) {
      console.warn(`💡 Supabase saveLead failed. Saving to local database...`);
      const localLeads = getLocalLeads();
      const idx = localLeads.findIndex(l => l.id === leadData.id || l.business_name.toLowerCase() === leadData.business_name.toLowerCase());
      
      const preparedLead = {
        id: leadData.id || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        ...leadData,
        created_at: idx >= 0 ? localLeads[idx].created_at : new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (idx >= 0) localLeads[idx] = preparedLead;
      else localLeads.push(preparedLead);

      saveLocalLeads(localLeads);
      return preparedLead;
    }
  },

  /**
   * Retrieves agency/user profiles for campaign/outreach usage.
   */
  async getProfiles() {
    // Local mode
    if (isLocalMode()) {
      const local = await getLocalDb();
      return local.getProfiles();
    }

    // Cloud mode
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      return data;
    } catch (err) {
      // Fallback profile
      return [{
        id: '00000000-0000-0000-0000-000000000000',
        agency_name: 'DeployFlow Launch Agency',
        owner_email: 'agency@deployflow.ai',
        sub_tier: 'free',
        sub_status: 'active'
      }];
    }
  }
};