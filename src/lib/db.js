/**
 * DeployFlow AI - Unified Database Abstraction Layer
 * 
 * This module abstracts all database operations (leads, profiles, sites, campaigns, etc.)
 * across the application. It automatically attempts to read/write using the official cloud
 * Supabase instance. If it detects that Supabase is unconfigured, has network issues, or
 * that the tables are not yet provisioned (e.g. PGRST205 missing table error), it gracefully
 * falls back to a lightweight local JSON file database.
 */

import { supabase } from './supabase';
import fs from 'fs';
import path from 'path';

// Path for local database fallback
const LOCAL_DB_PATH = path.join(process.cwd(), 'data/local_leads_db.json');

// Helper to check if we are in a Node environment (since this can run on server-side)
const isServer = typeof window === 'undefined';

/**
 * Ensures the local JSON database exists and returns the parsed array of leads.
 */
function getLocalLeads() {
  if (!isServer) return [];
  try {
    const dir = path.dirname(LOCAL_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
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
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(leads, null, 2), 'utf8');
  } catch (err) {
    console.error('⚠️ Error writing to local leads DB fallback:', err.message);
  }
}

/**
 * Unified DB API
 */
export const db = {
  /**
   * Retrieves all leads.
   * Gracefully falls back to local JSON if Supabase table is not yet provisioned.
   */
  async getLeads() {
    try {
      // 1. Try fetching from official Supabase PostgreSQL
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('intent_score', { ascending: false });

      if (error) {
        // Log the error and trigger fallback if table doesn't exist
        console.warn(`💡 Supabase leads query failed (${error.code || error.message}). Falling back to local database...`);
        return getLocalLeads();
      }

      console.log(`🔌 Loaded ${data.length} leads directly from Supabase Cloud PostgreSQL.`);
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

      if (idx >= 0) {
        localLeads[idx] = preparedLead;
      } else {
        localLeads.push(preparedLead);
      }

      saveLocalLeads(localLeads);
      return preparedLead;
    }
  },

  /**
   * Simulates fetching active user profiles or billing configs.
   */
  async getProfiles() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
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
