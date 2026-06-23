/**
 * DeployFlow AI — Website Generator Engine
 * 
 * The core engine that generates Standard and Premium tier websites.
 * Can be used in two modes:
 *   1. Next.js SSR — returns HTML strings for the preview pages
 *   2. CLI — generates standalone static HTML files to disk
 * 
 * Both modes share the exact same template rendering — the output is
 * always a complete, self-contained HTML document with inline Tailwind CSS.
 * 
 * Architecture follows the dual-mode pattern:
 * - Cloud/SaaS: Uses Supabase PostgreSQL, cloud AI, built-in email
 * - Local/Self-Hosted: Uses SQLite via libsql, Ollama for AI, user SMTP
 */

import { generateStandardSite } from './templates/standard-template.js';
import { generatePremiumSite, buildChatbotPrompt } from './templates/premium-template.js';

/**
 * Generate a complete Standard Tier website HTML document for a lead.
 * 
 * @param {Object} lead - Lead data from database (must include business_name, industry, scraping_metadata, etc.)
 * @param {Object} [options] - Generation options
 * @param {boolean} [options.isPreview=false] - If true, includes preview-mode banner bar
 * @param {string} [options.previewId] - Lead ID used for preview link URLs
 * @returns {string} Complete self-contained HTML document
 */
export function generateStandardTier(lead, options = {}) {
  return generateStandardSite(lead, {
    isPreview: options.isPreview ?? false,
    previewId: options.previewId || lead.id
  });
}

/**
 * Generate a complete Premium AI Tier website HTML document for a lead.
 * Extends the Standard tier with an embedded, business-aware AI chatbot widget.
 * 
 * @param {Object} lead - Lead data from database
 * @param {Object} [options] - Generation options
 * @param {boolean} [options.isPreview=false] - Include preview banner
 * @param {string} [options.previewId] - Lead ID for preview links
 * @param {string} [options.aiEndpoint] - Custom AI endpoint URL (default: API route)
 * @returns {string} Complete self-contained HTML document with chatbot
 */
export function generatePremiumTier(lead, options = {}) {
  const defaultEndpoint = process.env.DEPLOYFLOW_MODE === 'cloud'
    ? `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/chatbot/chat`
    : `/api/preview/${options.previewId || lead.id}/chat`;

  return generatePremiumSite(lead, {
    isPreview: options.isPreview ?? false,
    previewId: options.previewId || lead.id,
    aiEndpoint: options.aiEndpoint || defaultEndpoint
  });
}

/**
 * Generate a business chatbot system prompt for use in the AI backend.
 * Can be stored in a site's config for the cloud API endpoint.
 * 
 * @param {Object} lead - Lead data
 * @returns {string} System prompt string
 */
export function generateChatbotPrompt(lead) {
  const meta = lead.scraping_metadata || {};
  const ctx = meta.business_context || {};
  const services = Array.isArray(ctx.services) ? ctx.services : [];
  const faqs = Array.isArray(ctx.faqs) ? ctx.faqs : [];
  const hours = ctx.hours || 'Mon-Fri: 9:00 AM - 5:00 PM';
  const about = ctx.about || '';
  const contactPhone = lead.contact_phone || '';

  return buildChatbotPrompt(
    lead.business_name || 'Local Business',
    lead.industry || 'Local Services',
    lead.location || 'Austin, TX',
    services,
    faqs,
    hours,
    contactPhone,
    about
  );
}

/**
 * Generate all site types for a lead and return as an object of HTML strings.
 * 
 * @param {Object} lead - Lead data
 * @param {Object} [options] - Options
 * @returns {{ standard: string, premium: string, chatbotPrompt: string }}
 */
export function generateAllTiers(lead, options = {}) {
  return {
    standard: generateStandardTier(lead, { ...options, isPreview: true }),
    premium: generatePremiumTier(lead, { ...options, isPreview: true }),
    chatbotPrompt: generateChatbotPrompt(lead)
  };
}

export default {
  generateStandardTier,
  generatePremiumTier,
  generateChatbotPrompt,
  generateAllTiers
};