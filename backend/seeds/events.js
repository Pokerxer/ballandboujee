require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Event = require('../models/Event');

const MONGO_URI = process.env.MONGO_URI;

function slug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const events = [
  // ── UPCOMING (published) ────────────────────────────────────────────────
  {
    title: 'Boujee Fashion Night',
    slug: 'boujee-fashion-night-2026',
    description: 'An exclusive evening of style, music, and the freshest looks of the season. Dress to impress as we showcase the new Ball & Boujee Summer Collection on a live runway.',
    date: new Date('2026-05-24T19:00:00'),
    endDate: new Date('2026-05-24T23:00:00'),
    time: '7:00 PM – 11:00 PM',
    location: 'Transcorp Hilton Abuja',
    address: '1 Aguiyi Ironsi St, Maitama, Abuja',
    isOnline: false,
    category: 'fashion-show',
    status: 'published',
    isFeatured: true,
    capacity: 200,
    registrations: 74,
    price: 15000,
    tags: ['Fashion Show', 'Summer Collection', 'Runway', 'VIP'],
    image: {
      url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
      publicId: 'seed/fashion-night',
    },
  },
  {
    title: 'Pop-Up Shop: Wuse II',
    slug: 'pop-up-shop-wuse-ii-2026',
    description: 'Shop the latest Ball & Boujee drops in person — limited-edition pieces, exclusive colourways, and special pop-up-only bundles. First come, first served.',
    date: new Date('2026-06-07T11:00:00'),
    endDate: new Date('2026-06-07T18:00:00'),
    time: '11:00 AM – 6:00 PM',
    location: 'Wuse II Open Market Pavilion',
    address: 'Aminu Kano Crescent, Wuse II, Abuja',
    isOnline: false,
    category: 'pop-up',
    status: 'published',
    isFeatured: false,
    capacity: 0,
    registrations: 0,
    price: 0,
    tags: ['Pop-Up', 'Free Entry', 'Limited Edition', 'Wuse II'],
    image: {
      url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
      publicId: 'seed/popup-wuse',
    },
  },
  {
    title: 'Style Workshop: Build Your Wardrobe',
    slug: 'style-workshop-build-your-wardrobe-2026',
    description: 'A hands-on personal styling session with our in-house stylists. Learn how to mix & match pieces, choose the right fits for your body type, and build a capsule wardrobe that turns heads.',
    date: new Date('2026-06-21T13:00:00'),
    endDate: new Date('2026-06-21T16:00:00'),
    time: '1:00 PM – 4:00 PM',
    location: 'Ball & Boujee Studio, Lekki',
    address: '14 Admiralty Way, Lekki Phase 1, Lagos',
    isOnline: false,
    category: 'workshop',
    status: 'published',
    isFeatured: false,
    capacity: 30,
    registrations: 12,
    price: 8000,
    tags: ['Workshop', 'Styling', 'Personal Style', 'Lagos'],
    image: {
      url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&q=80',
      publicId: 'seed/style-workshop',
    },
  },
  {
    title: 'Mid-Year Clearance Sale',
    slug: 'mid-year-clearance-sale-2026',
    description: 'Up to 60% off on selected items across all categories — clothing, shoes, bags, accessories and more. Online and in-store simultaneously.',
    date: new Date('2026-07-01T09:00:00'),
    endDate: new Date('2026-07-07T21:00:00'),
    time: '9:00 AM daily',
    location: 'Online + All Stores',
    address: '',
    isOnline: true,
    onlineLink: 'https://www.ballandboujee.com/shop',
    category: 'sale',
    status: 'published',
    isFeatured: false,
    capacity: 0,
    registrations: 0,
    price: 0,
    tags: ['Sale', 'Up to 60% Off', 'Online', 'Clearance'],
    image: {
      url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80',
      publicId: 'seed/clearance-sale',
    },
  },

  // ── COMPLETED (past) ─────────────────────────────────────────────────────
  {
    title: 'Brand Launch Party',
    slug: 'brand-launch-party-2025',
    description: 'Where it all began. The official launch of Ball & Boujee — fashion, music, and an unforgettable night that set the tone for everything that followed.',
    date: new Date('2025-12-06T19:00:00'),
    endDate: new Date('2025-12-06T23:59:00'),
    time: '7:00 PM',
    location: 'Transcorp Hilton Abuja',
    address: '1 Aguiyi Ironsi St, Maitama, Abuja',
    isOnline: false,
    category: 'launch',
    status: 'completed',
    isFeatured: false,
    capacity: 300,
    registrations: 298,
    price: 0,
    tags: ['Launch', 'Invite Only', 'Fashion', 'Abuja'],
    image: {
      url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80',
      publicId: 'seed/launch-party',
    },
  },
  {
    title: 'Valentine Pop-Up: Garki',
    slug: 'valentine-pop-up-garki-2026',
    description: "A Valentine's weekend pop-up filled with gifting ideas, couples' styling sessions, and exclusive V-Day bundles. The vibe was immaculate.",
    date: new Date('2026-02-14T12:00:00'),
    endDate: new Date('2026-02-15T18:00:00'),
    time: '12:00 PM – 6:00 PM',
    location: 'Garki Shopping Mall',
    address: 'Plot 770 Tafawa Balewa Way, Garki, Abuja',
    isOnline: false,
    category: 'pop-up',
    status: 'completed',
    isFeatured: false,
    capacity: 0,
    registrations: 0,
    price: 0,
    tags: ["Pop-Up", "Valentine's", "Gifts", "Couples"],
    image: {
      url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=80',
      publicId: 'seed/valentine-popup',
    },
  },
  {
    title: 'Spring Collection Runway',
    slug: 'spring-collection-runway-2026',
    description: 'Our Spring/Summer 2026 collection hit the runway in March to an electric crowd. Bold prints, relaxed silhouettes, and energy you could feel from every seat.',
    date: new Date('2026-03-15T18:00:00'),
    endDate: new Date('2026-03-15T22:00:00'),
    time: '6:00 PM',
    location: 'Eko Hotel & Suites',
    address: 'Plot 1415 Adetokunbo Ademola St, Victoria Island, Lagos',
    isOnline: false,
    category: 'fashion-show',
    status: 'completed',
    isFeatured: false,
    capacity: 150,
    registrations: 150,
    price: 10000,
    tags: ['Fashion Show', 'Spring/Summer', 'Runway', 'Lagos'],
    image: {
      url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&q=80',
      publicId: 'seed/spring-runway',
    },
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Remove only seed events (by slug prefix) so manual events are untouched
    const slugs = events.map(e => e.slug);
    const deleted = await Event.deleteMany({ slug: { $in: slugs } });
    console.log(`Cleared ${deleted.deletedCount} existing seed events`);

    const inserted = await Event.insertMany(events);
    console.log(`Inserted ${inserted.length} events:`);
    inserted.forEach(e => console.log(`  [${e.status}] ${e.title}`));

    await mongoose.disconnect();
    console.log('\nDone.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
