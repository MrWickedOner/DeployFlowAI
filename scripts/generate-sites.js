#!/usr/bin/env node

/**
 * DeployFlow AI — Website Generator Engine CLI
 * 
 * Generates both Standard and Premium AI tier websites for all leads
 * or a specific lead, outputting standalone HTML files to disk.
 * 
 * This is the core automation script that agencies run to generate
 * client previews or production-ready static websites.
 * 
 * Usage:
 *   node scripts/generate-sites.js                          # Generate for all leads
 *   node scripts/generate-sites.js --lead=<lead-id>         # Generate for one lead
 *   node scripts/generate-sites.js --lead=<lead-id> --tier=standard  # Just standard
 *   node scripts/generate-sites.js --output=./dist          # Custom output dir
 *
 * Environment:
 *   DEPLOYFLOW_MODE=local|cloud   (default: cloud)
 */

const fs = require('fs');
const path = require('path');

// Parse command-line arguments
function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach(val => {
    if (val.startsWith('--')) {
      const [key, value] = val.substring(2).split('=');
      args[key] = value || true;
    }
  });
  return args;
}

async function main() {
  const args = parseArgs();
  const outputDir = path.resolve(args.output || path.join(process.cwd(), 'dist'));

  console.log(`================================================================`);
  console.log(`🚀 DeployFlow AI — Website Generator Engine`);
  console.log(`   Mode: ${process.env.DEPLOYFLOW_MODE || 'cloud'}`);
  console.log(`   Output: ${outputDir}`);
  console.log(`================================================================\n`);

  // Dynamic imports (ESM)
  const { generateAllTiers } = await import('../src/engine/generator.js');
  const { db } = await import('../src/lib/db.js');

  // Get leads
  let leads;
  if (args.lead) {
    const lead = await db.getLeadById(args.lead);
    leads = lead ? [lead] : [];
    if (!lead) console.log(`❌ Lead "${args.lead}" not found.`);
  } else {
    leads = await db.getLeads();
  }

  if (leads.length === 0) {
    console.log('❌ No leads found to generate sites for.');
    process.exit(1);
  }

  console.log(`📊 Loaded ${leads.length} lead(s) from database.\n`);

  // Ensure output directories
  const tier = args.tier || 'all';
  if (tier === 'all' || tier === 'standard') {
    fs.mkdirSync(path.join(outputDir, 'standard'), { recursive: true });
  }
  if (tier === 'all' || tier === 'premium') {
    fs.mkdirSync(path.join(outputDir, 'premium'), { recursive: true });
  }

  let totalGenerated = 0;

  for (const lead of leads) {
    console.log(`\n🏢 Generating sites for: ${lead.business_name} (${lead.industry || 'General'})`);

    try {
      const result = generateAllTiers(lead, { isPreview: true, previewId: lead.id });

      if (tier === 'all' || tier === 'standard') {
        const standardPath = path.join(outputDir, 'standard', `${lead.id}.html`);
        fs.writeFileSync(standardPath, result.standard, 'utf8');
        console.log(`   ✅ Standard Tier → ${standardPath}`);
        totalGenerated++;
      }

      if (tier === 'all' || tier === 'premium') {
        const premiumPath = path.join(outputDir, 'premium', `${lead.id}.html`);
        fs.writeFileSync(premiumPath, result.premium, 'utf8');
        console.log(`   ✅ Premium AI Tier → ${premiumPath}`);
        totalGenerated++;
      }

      // Also save the chatbot system prompt as a reference
      const promptDir = path.join(outputDir, 'prompts');
      fs.mkdirSync(promptDir, { recursive: true });
      fs.writeFileSync(
        path.join(promptDir, `${lead.id}-chatbot-prompt.txt`),
        result.chatbotPrompt,
        'utf8'
      );
      console.log(`   📝 Chatbot prompt saved`);

    } catch (err) {
      console.error(`   ❌ Error generating site for ${lead.business_name}:`, err.message);
    }
  }

  console.log(`\n================================================================`);
  console.log(`✅ Generation complete!`);
  console.log(`   Total files generated: ${totalGenerated}`);
  console.log(`   Output directory: ${outputDir}`);
  console.log(`================================================================`);
  process.exit(0);
}

main().catch(err => {
  console.error('💥 Generator engine crashed:', err);
  process.exit(1);
});