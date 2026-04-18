require('dotenv').config({ override: true });
const mongoose = require('mongoose');
const Category = require('../models/Category');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌  MONGO_URI not set in .env');
  process.exit(1);
}

const categories = [
  {
    name: 'Female Fashion',
    slug: 'female-fashion',
    description: 'Luxury womenswear — designer dresses, tops, skirts, co-ords and more.',
    image: 'https://res.cloudinary.com/demo/image/upload/female-fashion.jpg',
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'Male Fashion',
    slug: 'male-fashion',
    description: 'Premium menswear — suits, shirts, trousers and streetwear essentials.',
    image: 'https://res.cloudinary.com/demo/image/upload/male-fashion.jpg',
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'Bags & Purses',
    slug: 'bags-purses',
    description: 'Designer handbags, clutches, totes and mini bags for every occasion.',
    image: 'https://res.cloudinary.com/demo/image/upload/bags-purses.jpg',
    isActive: true,
    sortOrder: 3,
  },
  {
    name: 'Shoes',
    slug: 'shoes',
    description: 'Luxury footwear — heels, sneakers, loafers, boots and sandals.',
    image: 'https://res.cloudinary.com/demo/image/upload/shoes.jpg',
    isActive: true,
    sortOrder: 4,
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Statement jewellery, belts, sunglasses and finishing touches.',
    image: 'https://res.cloudinary.com/demo/image/upload/accessories.jpg',
    isActive: true,
    sortOrder: 5,
  },
  {
    name: 'Perfumes',
    slug: 'perfumes',
    description: 'Exclusive fragrances and luxury perfumes for him and her.',
    image: 'https://res.cloudinary.com/demo/image/upload/perfumes.jpg',
    isActive: true,
    sortOrder: 6,
  },
  {
    name: 'Luxury Hair',
    slug: 'luxury-hair',
    description: 'Premium wigs, extensions, bundles and hair care products.',
    image: 'https://res.cloudinary.com/demo/image/upload/luxury-hair.jpg',
    isActive: true,
    sortOrder: 7,
  },
  {
    name: 'Skincare',
    slug: 'skincare',
    description: 'High-end skincare — serums, moisturisers, body butters and treatments.',
    image: 'https://res.cloudinary.com/demo/image/upload/skincare.jpg',
    isActive: true,
    sortOrder: 8,
  },
  {
    name: 'Gift Items',
    slug: 'gift-items',
    description: 'Curated luxury gift sets and hampers for every celebration.',
    image: 'https://res.cloudinary.com/demo/image/upload/gift-items.jpg',
    isActive: true,
    sortOrder: 9,
  },
  {
    name: 'Kiddies Fashion',
    slug: 'kiddies-fashion',
    description: 'Stylish designer clothing and accessories for children.',
    image: 'https://res.cloudinary.com/demo/image/upload/kiddies-fashion.jpg',
    isActive: true,
    sortOrder: 10,
  },
];

async function main() {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   Ball & Boujee — Seed Categories        ║');
  console.log('╚══════════════════════════════════════════╝\n');

  console.log('Connecting to MongoDB…');
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 15000,
  });
  console.log('✓  Connected\n');

  console.log('Clearing existing categories…');
  const { deletedCount } = await Category.deleteMany({});
  console.log(`✓  Removed ${deletedCount} existing categories\n`);

  console.log(`Inserting ${categories.length} categories…`);
  await Category.insertMany(categories);
  console.log(`✓  Inserted ${categories.length} categories\n`);

  console.log('── Categories ──────────────────────────────');
  categories.forEach(c => console.log(`   ${String(c.sortOrder).padStart(2)}.  ${c.name}`));
  console.log('────────────────────────────────────────────\n');

  console.log('✅  Done!');
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('\n❌ ', err.message);
  process.exit(1);
});
