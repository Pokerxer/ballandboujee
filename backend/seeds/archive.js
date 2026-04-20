require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Archive = require('../models/Archive');

const MONGO_URI = process.env.MONGO_URI;

const items = [
  // ── Featured ────────────────────────────────────────────────────────
  {
    title: 'Boujee Fashion Night — Opening Walk',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
    type: 'photo', category: 'Events',
    date: new Date('2026-04-10'), photographer: '@ballandboujee',
    caption: 'The crowd went silent as the lights dimmed and the first model hit the runway.',
    featured: true, status: 'published',
    tags: ['Fashion Night', 'Runway', 'Abuja'],
  },
  {
    title: 'Spring Collection — Bold Prints',
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&q=80',
    type: 'photo', category: 'Fashion',
    date: new Date('2026-03-15'), photographer: '@ballandboujee',
    caption: 'Spring/Summer 2026 collection on the Lagos runway.',
    featured: true, status: 'published',
    tags: ['Spring', 'Runway', 'Lagos'],
  },
  {
    title: 'Brand Launch — The Night',
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80',
    type: 'photo', category: 'Events',
    date: new Date('2025-12-06'), photographer: '@ballandboujee',
    caption: 'Where it all began. Ball & Boujee launch night at Transcorp Hilton.',
    featured: true, status: 'published',
    tags: ['Launch', 'Abuja'],
  },
  {
    title: 'Pop-Up Shop — Wuse II Crowd',
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
    type: 'photo', category: 'Events',
    date: new Date('2026-04-05'), photographer: '@ballandboujee',
    caption: 'Hundreds turned out for the Wuse II pop-up. Energy was unmatched.',
    featured: true, status: 'published',
    tags: ['Pop-Up', 'Wuse II'],
  },

  // ── Fashion ──────────────────────────────────────────────────────────
  {
    title: 'Luxury Hair Collection — Close Up',
    url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&q=80',
    type: 'photo', category: 'Fashion',
    date: new Date('2026-02-20'), photographer: '@ballandboujee',
    caption: 'HD Lace Front detail shot from the latest hair lookbook.',
    featured: false, status: 'published',
    tags: ['Hair', 'Lookbook'],
  },
  {
    title: 'Street Style — Lagos',
    url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1200&q=80',
    type: 'photo', category: 'Fashion',
    date: new Date('2026-01-15'), photographer: '@ballandboujee',
    caption: 'Lagos street style captured during the January shoot.',
    featured: false, status: 'published',
    tags: ['Street Style', 'Lagos'],
  },
  {
    title: 'New Season — Bags & Accessories',
    url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&q=80',
    type: 'photo', category: 'Fashion',
    date: new Date('2026-03-01'), photographer: '@ballandboujee',
    caption: 'New season bags from the Spring/Summer lineup.',
    featured: false, status: 'published',
    tags: ['Bags', 'Accessories'],
  },
  {
    title: 'Men\'s Collection — Editorial',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80',
    type: 'photo', category: 'Fashion',
    date: new Date('2026-02-10'), photographer: '@ballandboujee',
    caption: 'The male fashion side of Ball & Boujee — clean, sharp, confident.',
    featured: false, status: 'published',
    tags: ["Men's", 'Editorial'],
  },

  // ── Community ─────────────────────────────────────────────────────────
  {
    title: 'Community — Valentine Pop-Up Crowd',
    url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=80',
    type: 'photo', category: 'Community',
    date: new Date('2026-02-14'), photographer: '@ballandboujee',
    caption: "Valentine's pop-up brought the whole family out.",
    featured: false, status: 'published',
    tags: ["Valentine's", 'Community'],
  },
  {
    title: 'Style Workshop — Hands-On Session',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&q=80',
    type: 'photo', category: 'Community',
    date: new Date('2026-01-28'), photographer: '@ballandboujee',
    caption: 'Our in-house stylists worked one-on-one with attendees during the workshop.',
    featured: false, status: 'published',
    tags: ['Workshop', 'Styling'],
  },
  {
    title: 'The Vibe — Launch Night',
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&q=80',
    type: 'photo', category: 'Community',
    date: new Date('2025-12-06'), photographer: '@ballandboujee',
    caption: 'The energy inside Transcorp Hilton on launch night.',
    featured: false, status: 'published',
    tags: ['Launch', 'Community', 'Abuja'],
  },

  // ── Behind the Scenes ─────────────────────────────────────────────────
  {
    title: 'BTS — Runway Prep',
    url: 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=1200&q=80',
    type: 'photo', category: 'Behind the Scenes',
    date: new Date('2026-03-14'), photographer: '@ballandboujee',
    caption: 'Backstage moments before the Spring runway show.',
    featured: false, status: 'published',
    tags: ['BTS', 'Runway'],
  },
  {
    title: 'BTS — Photography Session',
    url: 'https://images.unsplash.com/photo-1603384164656-2b8cd81d3f4b?w=1200&q=80',
    type: 'photo', category: 'Behind the Scenes',
    date: new Date('2026-02-05'), photographer: '@ballandboujee',
    caption: 'Behind the lens during the February product shoot.',
    featured: false, status: 'published',
    tags: ['BTS', 'Photography'],
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const slugs = items.map(i => i.title);
    const deleted = await Archive.deleteMany({ title: { $in: slugs } });
    console.log(`Cleared ${deleted.deletedCount} existing seed archive items`);

    const inserted = await Archive.insertMany(items);
    console.log(`Inserted ${inserted.length} archive items:`);
    inserted.forEach(i => console.log(`  [${i.category}] ${i.title}`));

    await mongoose.disconnect();
    console.log('\nDone.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
