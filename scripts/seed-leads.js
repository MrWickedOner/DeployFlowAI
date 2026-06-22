#!/usr/bin/env node

/**
 * DeployFlow AI - Mock Data Seeding Script
 * 
 * This script populates the 'leads' table with 10 highly realistic local business leads,
 * each enriched with extensive digital presence audits, performance metrics, and business-specific context
 * (about us, services, business hours, FAQs) to feed the site generator and outreach modules.
 * 
 * Usage:
 *   node scripts/seed-leads.js
 * 
 * Saves directly to Supabase if credentials exist, otherwise falls back to the local JSON database file.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

console.log(`================================================================`);
console.log(`🌱 DeployFlow AI Mock Data Seeder`);
console.log(`   Preparing 10 high-intent local business profiles...`);
console.log(`================================================================\n`);

// Initialize Supabase client if keys are available
let supabase = null;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (supabaseUrl && supabaseServiceKey && supabaseUrl !== 'your_supabase_project_url') {
  console.log(`🔌 Supabase detected. Initializing database connection...`);
  supabase = createClient(supabaseUrl, supabaseServiceKey);
} else {
  console.log(`ℹ️  No Supabase credentials configured. Seeding into local JSON database...`);
}

// Local JSON DB Helper
const LOCAL_DB_PATH = path.join(__dirname, '../data/local_leads_db.json');
function ensureDirExists(filePath) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

function saveLocalLeads(leads) {
  ensureDirExists(LOCAL_DB_PATH);
  let existingLeads = [];
  if (fs.existsSync(LOCAL_DB_PATH)) {
    try {
      existingLeads = JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf8'));
    } catch (e) {
      existingLeads = [];
    }
  }

  // Merge or add seeded leads
  leads.forEach(newLead => {
    const idx = existingLeads.findIndex(l => 
      l.business_name.toLowerCase() === newLead.business_name.toLowerCase() && 
      l.location.toLowerCase() === newLead.location.toLowerCase()
    );
    
    const preparedLead = {
      id: idx >= 0 ? existingLeads[idx].id : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      ...newLead,
      created_at: idx >= 0 ? existingLeads[idx].created_at : new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (idx >= 0) {
      existingLeads[idx] = preparedLead;
    } else {
      existingLeads.push(preparedLead);
    }
  });

  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(existingLeads, null, 2), 'utf8');
  console.log(`\n💾 Seeded ${leads.length} leads locally to ${LOCAL_DB_PATH}`);
}

function preparedLead(newLead, id = null) {
  return {
    id: id || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    ...newLead,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

// 10 Detailed business profiles with realistic metadata
const SEED_DATA = [
  {
    business_name: "Apex Chiropractic Center",
    industry: "Chiropractor",
    contact_name: "Dr. Ryan Sterling",
    contact_email: "ryan.sterling@apexchiroatx.com",
    contact_phone: "(512) 555-8910",
    current_website: null,
    location: "Austin, TX",
    intent_score: 95.0,
    scraping_metadata: {
      has_website: false,
      load_speed_seconds: 0,
      mobile_friendly: false,
      has_h1_tags: false,
      has_meta_desc: false,
      has_chatbot: false,
      seo_score: 0,
      performance_score: 0,
      pain_points: [
        "No existing website found",
        "No online booking capability",
        "Lacks any automated client intake channel"
      ],
      business_context: {
        address: "4501 Spicewood Springs Rd, Austin, TX 78759",
        hours: "Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 1:00 PM, Sun: Closed",
        about: "Apex Chiropractic Center specializes in spine and posture rehabilitation, sports injury therapy, and pediatric chiropractic care. Led by Dr. Ryan Sterling with 12+ years of experience.",
        services: ["Spinal Adjustment", "Postural Correction", "Sports Injury Recovery", "Myofascial Release Therapy"],
        faqs: [
          { q: "Do you accept insurance?", a: "Yes, we accept most major health insurance plans including Blue Cross Blue Shield, Aetna, and UnitedHealthcare." },
          { q: "What should I expect on my first visit?", a: "Your first visit includes a comprehensive postural assessment, custom digital X-rays, and a personalized treatment roadmap designed by Dr. Sterling." }
        ]
      }
    }
  },
  {
    business_name: "Austin Dental Care",
    industry: "Dentistry",
    contact_name: "Dr. Emily Taylor",
    contact_email: "office@austindentalcare.com",
    contact_phone: "(512) 555-0199",
    current_website: "https://austindentalcare.com",
    location: "Austin, TX",
    intent_score: 82.5,
    scraping_metadata: {
      has_website: true,
      load_speed_seconds: 6.2,
      mobile_friendly: false,
      has_h1_tags: true,
      has_meta_desc: false,
      has_chatbot: false,
      seo_score: 45,
      performance_score: 38,
      pain_points: [
        "Slow page load speed: 6.2s",
        "Website is not mobile responsive",
        "Missing SEO meta description tag",
        "Lacks an interactive AI chatbot helper for booking"
      ],
      business_context: {
        address: "1012 Rio Grande St, Austin, TX 78701",
        services: ["Root Canals", "Teeth Whitening", "Pediatric Dentistry", "Dental Implants", "Routine Cleaning"],
        hours: "Mon-Thu: 8:00 AM - 5:00 PM, Fri: 8:00 AM - 1:00 PM, Sat-Sun: Closed",
        tagline: "Providing bright, clean smiles to Central Texas with compassionate care.",
        faqs: [
          { q: "Are you accepting new patients?", a: "Yes, we are actively accepting new patients of all ages!" },
          { name: "Do you offer financing?", a: "We offer flexible payment plans and accept CareCredit." }
        ]
      }
    }
  },
  {
    // Plumbing service with high intent (no site)
    business_name: "PlumbRight Services",
    industry: "Plumbing",
    contact_name: "Gary Vance",
    contact_email: "vance.plumbright@gmail.com",
    contact_phone: "(713) 555-9900",
    current_website: "",
    location: "Houston, TX",
    intent_score: 90.0,
    scraping_metadata: {
      has_website: false,
      load_speed_seconds: 0,
      mobile_friendly: false,
      has_chatbot: false,
      seo_score: 0,
      performance_score: 0,
      pain_points: [
        "No existing website found",
        "Missing 24/7 lead capture tool for emergency service calls"
      ],
      business_context: {
        address: "9402 Westheimer Rd, Houston, TX",
        services: ["Emergency Drain Cleaning", "Water Heater Installation", "Pipe & Leak Repairs", "Sewer Line Inspections"],
        hours: "24/7 Emergency Services available",
        faqs: [
          { q: "Do you charge extra for emergency after-hours calls?", a: "We provide competitive emergency rates with no hidden dispatch fees. Call us for upfront pricing." },
          { q: "Are you licensed and insured?", a: "Yes, we are fully licensed master plumbers in the state of Texas." }
        ]
      }
    }
  },
  {
    // Veterinary
    business_name: "Green Leaf Veterinary Clinic",
    industry: "Veterinary Medicine",
    contact_name: "Dr. Natalie Cooper",
    contact_email: "vet@greenleafvet.com",
    contact_phone: "(214) 555-3344",
    current_website: "https://greenleafvet.com",
    location: "Dallas, TX",
    intent_score: 72.0,
    scraping_metadata: {
      has_website: true,
      load_speed_seconds: 5.1,
      mobile_friendly: true,
      has_h1_tags: false,
      has_meta_desc: true,
      has_chatbot: false,
      seo_score: 70,
      performance_score: 52,
      pain_points: [
        "Slow page load speed: 5.1s",
        "Missing primary heading (H1) tags",
        "Lacks an automated system to pre-screen pet symptoms or capture emergency contacts"
      ],
      business_context: {
        address: "3201 Greenville Ave, Dallas, TX 75206",
        services: ["Vaccinations & Wellness", "Veterinary Surgery", "Pet Dental Care", "Emergency Vet Services", "Grooming & Boarding"],
        hours: "Mon-Fri: 7:30 AM - 7:00 PM, Sat: 8:00 AM - 4:00 PM, Sun: Closed",
        faqs: [
          { q: "What should I do if my pet has an emergency after-hours?", a: "We partner with Dallas Emergency Veterinary Hospital for overnight critical care. Please call our main number for forwarding instructions." },
          { q: "Do you treat exotic pets?", a: "Yes, Dr. Cooper is specialized in small mammals, reptiles, and avian care alongside cats and dogs." }
        ]
      }
    }
  },
  {
    // Legal Services
    business_name: "Vanguard Law Group",
    industry: "Law Firm",
    contact_name: "Marcus Sterling, Esq.",
    contact_email: "m.sterling@vanguardlawtx.com",
    contact_phone: "(512) 555-1212",
    current_website: "https://vanguardlawtx.com",
    location: "Austin, TX",
    intent_score: 65.0,
    scraping_metadata: {
      has_website: true,
      load_speed_seconds: 3.4,
      mobile_friendly: true,
      has_h1_tags: true,
      has_meta_desc: false,
      has_chatbot: false,
      seo_score: 80,
      performance_score: 75,
      pain_points: [
        "Missing SEO meta description tag",
        "Lacks intelligent chatbot for client pre-qualification and consultation scheduling"
      ],
      business_context: {
        address: "701 Brazos St, Austin, TX 78701",
        services: ["Divorce & Family Law", "Estate Planning & Wills", "Child Custody Disputes", "Business Contract Law"],
        hours: "Mon-Fri: 9:00 AM - 5:00 PM, Sat-Sun: By Appointment Only",
        faqs: [
          { q: "Do you charge for an initial consultation?", a: "We offer a brief 15-minute phone screening for free. Comprehensive strategy sessions are billed at our standard hourly rates." }
        ]
      }
    }
  },
  {
    // Restaurant with no website
    business_name: "Sizzling Wok Café",
    industry: "Restaurant",
    contact_name: "Chef Johnny Chen",
    contact_email: "chen@sizzlingwokcafe.com",
    contact_phone: "(210) 555-5020",
    current_website: "",
    location: "San Antonio, TX",
    intent_score: 88.0,
    scraping_metadata: {
      has_website: false,
      load_speed_seconds: 0,
      mobile_friendly: false,
      has_chatbot: false,
      seo_score: 0,
      performance_score: 0,
      pain_points: [
        "No existing website found",
        "No online menu or order placement capabilities",
        "Highly reliant on third-party aggregators (Yelp/UberEats) taking high commissions"
      ],
      business_context: {
        address: "849 E Commerce St, San Antonio, TX 78205",
        services: ["Dine-In Chinese & Thai Cuisine", "Takeout & Delivery", "Catering Packages"],
        hours: "Mon-Sun: 11:00 AM - 10:00 PM",
        popular_dishes: ["General Tso's Chicken", "Pad Thai Noodles", "Steamed Pork Dumplings", "Mango Sticky Rice"],
        faqs: [
          { q: "Do you offer gluten-free options?", a: "Yes, many of our stir-fried items can be prepared gluten-free upon request. Please notify your server of any allergies." }
        ]
      }
    }
  },
  {
    // Roofers with high intent (no website)
    business_name: "Summit Roofing & Construction",
    industry: "Roofing",
    contact_name: "Dave Miller",
    contact_email: "dave.miller@summitroofingtx.com",
    contact_phone: "(817) 555-4301",
    current_website: "",
    location: "Fort Worth, TX",
    intent_score: 92.5,
    scraping_metadata: {
      has_website: false,
      load_speed_seconds: 0,
      mobile_friendly: false,
      has_chatbot: false,
      seo_score: 0,
      performance_score: 0,
      pain_points: [
        "No existing website found",
        "Missing automated roof assessment request form",
        "Lacks hail and storm damage claim intake assistants"
      ],
      business_context: {
        address: "2411 N Main St, Fort Worth, TX 76164",
        services: ["Residential Roof Replacement", "Commercial Roof Inspection", "Storm & Hail Damage Repairs", "Gutter Maintenance"],
        hours: "Mon-Sat: 7:00 AM - 7:00 PM, Sun: Closed (Emergency Dispatch Available)",
        faqs: [
          { q: "Can you help assist with my insurance claim?", a: "Yes! We specialize in assisting homeowners with insurance claims, providing full documentation, drone photos, and cost estimates for your provider." }
        ]
      }
    }
  },
  {
    // Gym
    business_name: "Elite Fitness Gym",
    industry: "Fitness & Gym",
    contact_name: "Coach Brandon Vance",
    contact_email: "brandon@elitefitatx.com",
    contact_phone: "(512) 555-9011",
    current_website: "https://elitefitatx.com",
    location: "Austin, TX",
    intent_score: 74.5,
    scraping_metadata: {
      has_website: true,
      load_speed_seconds: 4.8,
      mobile_friendly: false,
      has_h1_tags: true,
      has_meta_desc: true,
      has_chatbot: false,
      seo_score: 68,
      performance_score: 55,
      pain_points: [
        "Slow page load speed: 4.8s",
        "Website is not mobile responsive",
        "Lacks interactive AI booking agent for personal training sessions"
      ],
      business_context: {
        address: "2201 S Lamar Blvd, Austin, TX 78704",
        services: ["Group HIIT Classes", "1-on-1 Personal Training", "Strength & Conditioning", "Nutrition Coaching"],
        hours: "Mon-Fri: 5:00 AM - 9:00 PM, Sat: 7:00 AM - 5:00 PM, Sun: 8:00 AM - 2:00 PM",
        faqs: [
          { q: "Do you offer a trial pass?", a: "We offer a complimentary 3-day class pass for local Austin residents." }
        ]
      }
    }
  },
  {
    // Bakery
    business_name: "Sweet Blossom Bakery",
    industry: "Bakery",
    contact_name: "Clarissa Finch",
    contact_email: "clarissa@sweetblossombakery.com",
    contact_phone: "(512) 555-1289",
    current_website: "",
    location: "Austin, TX",
    intent_score: 85.0,
    scraping_metadata: {
      has_website: false,
      load_speed_seconds: 0,
      mobile_friendly: false,
      has_chatbot: false,
      seo_score: 0,
      performance_score: 0,
      pain_points: [
        "No existing website found",
        "No custom cake quotation tool",
        "Lacks online delivery order intake"
      ],
      business_context: {
        address: "1206 W Lynn St, Austin, TX 78703",
        services: ["Custom Wedding Cakes", "Artisanal Breads", "French Pastries", "Catering & Events"],
        hours: "Tue-Sat: 7:00 AM - 4:00 PM, Sun: 8:00 AM - 1:00 PM, Mon: Closed",
        faqs: [
          { q: "How far in advance do I need to order a custom cake?", a: "We require at least 2 weeks notice for custom celebration cakes, and 4 weeks for large wedding orders." }
        ]
      }
    }
  },
  {
    // Accounting CPA
    business_name: "NextGen CPA Services",
    industry: "Accounting & CPA",
    contact_name: "Sarah Lind, CPA",
    contact_email: "sarah@nextgencpatx.com",
    contact_phone: "(713) 555-0211",
    current_website: "https://nextgencpatx.com",
    location: "Houston, TX",
    intent_score: 80.0,
    scraping_metadata: {
      has_website: true,
      load_speed_seconds: 5.5,
      mobile_friendly: false,
      has_h1_tags: false,
      has_meta_desc: false,
      has_chatbot: false,
      seo_score: 40,
      performance_score: 48,
      pain_points: [
        "Slow page load speed: 5.5s",
        "Website is not mobile responsive",
        "Missing primary heading (H1) tags",
        "Missing SEO meta description tag",
        "Lacks an automated lead screening / document intake helper"
      ],
      business_context: {
        address: "4203 Montrose Blvd, Houston, TX 77006",
        services: ["Corporate Tax Filing", "Personal Tax Preparation", "Bookkeeping & Payroll", "IRS Audit Representative"],
        hours: "Mon-Fri: 8:30 AM - 5:30 PM (Extended hours during tax season)",
        faqs: [
          { q: "What documents do I need to bring for personal tax filing?", a: "Please upload your W-2s, 1099s, mortgage interest statements, and any investment tax summaries to our secure portal before your session." }
        ]
      }
    }
  }
];

async function seed() {
  if (supabase) {
    try {
      console.log(`📤 Seeding Supabase database...`);
      
      // Resolve agency_id from profiles
      let agencyId = null;
      const { data: profiles, error: pErr } = await supabase.from('profiles').select('id').limit(1);
      
      if (pErr) throw pErr;
      
      if (profiles && profiles.length > 0) {
        agencyId = profiles[0].id;
        console.log(`🔌 Resolved existing agency_id: ${agencyId}`);
      } else {
        console.log(`⚠️  No agency profiles found. Creating default mock profile first...`);
        const dummyUserUuid = '00000000-0000-0000-0000-000000000000';
        
        const { error: profError } = await supabase.from('profiles').upsert({
          id: dummyUserUuid,
          agency_name: "DeployFlow Launch Agency",
          owner_email: "agency@deployflow.ai",
          sub_tier: "free",
          sub_status: "active"
        }, { onConflict: 'id' });
        
        if (profError) {
          throw new Error(`Failed to seed mock agency profile: ${profError.message}`);
        }
        
        agencyId = dummyUserUuid;
        console.log(`✨ Created default mock profile with ID: ${agencyId}`);
      }

      // Delete existing leads for clean seed
      console.log(`🗑️  Cleaning existing mock leads in Supabase...`);
      const { error: delError } = await supabase.from('leads').delete().eq('agency_id', agencyId);
      if (delError) {
        console.log(`ℹ️ Note: Clean step completed or skipped. Proceeding to insert.`);
      }

      // Insert seeded data
      const leadsToInsert = SEED_DATA.map(lead => ({
        ...lead,
        agency_id: agencyId
      }));

      const { data, error } = await supabase.from('leads').insert(leadsToInsert).select();
      if (error) throw error;

      console.log(`\n✨ Successfully seeded ${data.length} mock leads directly into Supabase!`);
      
      // Also update local copy
      saveLocalLeads(SEED_DATA);

    } catch (err) {
      console.error(`❌ Supabase Seed Error:`, err.message);
      console.log(`ℹ️ Falling back to local seeding.`);
      saveLocalLeads(SEED_DATA);
    }
  } else {
    saveLocalLeads(SEED_DATA);
  }

  console.log(`\n✅ Mock data seeding finished.`);
}

seed().catch(err => {
  console.error(`💥 Seeding process crashed:`, err);
  process.exit(1);
});
