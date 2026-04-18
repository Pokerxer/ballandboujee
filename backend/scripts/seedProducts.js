require('dotenv').config({ override: true });
const mongoose = require('mongoose');
const Product = require('../models/Product');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) { console.error('❌  MONGO_URI not set'); process.exit(1); }

function sku(prefix, size, color) {
  const s = size.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4);
  const c = color.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 3);
  return `BNB-${prefix}-${s}-${c}`;
}

const products = [

  // ── FEMALE FASHION ──────────────────────────────────────────
  {
    name: 'Satin Wrap Midi Dress',
    slug: 'satin-wrap-midi-dress',
    description: 'Luxuriously fluid satin wrap dress with a flattering V-neckline and adjustable tie waist. Falls elegantly to midi length. Perfect for dinners, events, or elevated evening wear.',
    category: 'Female Fashion',
    subcategory: 'Dresses',
    images: [
      { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800' },
      { url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800' },
    ],
    variants: [
      { size: 'XS', color: 'Midnight Black', price: 58000, costPrice: 22000, compareAtPrice: 72000, stock: 8,  sku: sku('FWD', 'XS', 'MidnightBlack') },
      { size: 'S',  color: 'Midnight Black', price: 58000, costPrice: 22000, compareAtPrice: 72000, stock: 12, sku: sku('FWD', 'S',  'MidnightBlack') },
      { size: 'M',  color: 'Midnight Black', price: 58000, costPrice: 22000, compareAtPrice: 72000, stock: 10, sku: sku('FWD', 'M',  'MidnightBlack') },
      { size: 'L',  color: 'Midnight Black', price: 58000, costPrice: 22000, compareAtPrice: 72000, stock: 6,  sku: sku('FWD', 'L',  'MidnightBlack') },
      { size: 'XS', color: 'Champagne',      price: 58000, costPrice: 22000, compareAtPrice: 72000, stock: 6,  sku: sku('FWD', 'XS', 'Champagne') },
      { size: 'S',  color: 'Champagne',      price: 58000, costPrice: 22000, compareAtPrice: 72000, stock: 8,  sku: sku('FWD', 'S',  'Champagne') },
      { size: 'M',  color: 'Champagne',      price: 58000, costPrice: 22000, compareAtPrice: 72000, stock: 7,  sku: sku('FWD', 'M',  'Champagne') },
    ],
    tags: ['bestseller', 'evening'],
    featured: true, status: 'published', minStock: 3,
    ratings: { avg: 4.8, count: 47 },
  },

  {
    name: 'Feather Trim Power Blazer',
    slug: 'feather-trim-power-blazer',
    description: 'Statement blazer with feather-trim cuffs and hem. Tailored fit with structured shoulders and satin lining. Designed to command attention at every entrance.',
    category: 'Female Fashion',
    subcategory: 'Blazers',
    images: [
      { url: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800' },
      { url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800' },
    ],
    variants: [
      { size: 'XS', color: 'Ivory',   price: 89000, costPrice: 35000, compareAtPrice: 110000, stock: 4, sku: sku('FTB', 'XS', 'Ivory') },
      { size: 'S',  color: 'Ivory',   price: 89000, costPrice: 35000, compareAtPrice: 110000, stock: 6, sku: sku('FTB', 'S',  'Ivory') },
      { size: 'M',  color: 'Ivory',   price: 89000, costPrice: 35000, compareAtPrice: 110000, stock: 5, sku: sku('FTB', 'M',  'Ivory') },
      { size: 'S',  color: 'Jet Black', price: 89000, costPrice: 35000, compareAtPrice: 110000, stock: 7, sku: sku('FTB', 'S', 'JetBlack') },
      { size: 'M',  color: 'Jet Black', price: 89000, costPrice: 35000, compareAtPrice: 110000, stock: 5, sku: sku('FTB', 'M', 'JetBlack') },
      { size: 'L',  color: 'Jet Black', price: 89000, costPrice: 35000, compareAtPrice: 110000, stock: 3, sku: sku('FTB', 'L', 'JetBlack') },
    ],
    tags: ['featured', 'statement'],
    featured: true, status: 'published', minStock: 2,
    ratings: { avg: 4.9, count: 31 },
  },

  {
    name: 'Cut-Out Bodycon Mini Dress',
    slug: 'cut-out-bodycon-mini-dress',
    description: 'Form-fitting stretch-crepe mini dress with strategic side cut-outs. Invisible back zip closure. The ultimate going-out dress for the bold and confident.',
    category: 'Female Fashion',
    subcategory: 'Dresses',
    images: [
      { url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800' },
    ],
    variants: [
      { size: 'XS', color: 'Black',  price: 42000, costPrice: 16000, stock: 10, sku: sku('CBD', 'XS', 'Black') },
      { size: 'S',  color: 'Black',  price: 42000, costPrice: 16000, stock: 14, sku: sku('CBD', 'S',  'Black') },
      { size: 'M',  color: 'Black',  price: 42000, costPrice: 16000, stock: 9,  sku: sku('CBD', 'M',  'Black') },
      { size: 'L',  color: 'Black',  price: 42000, costPrice: 16000, stock: 6,  sku: sku('CBD', 'L',  'Black') },
      { size: 'XS', color: 'Nude',   price: 42000, costPrice: 16000, stock: 8,  sku: sku('CBD', 'XS', 'Nude') },
      { size: 'S',  color: 'Nude',   price: 42000, costPrice: 16000, stock: 10, sku: sku('CBD', 'S',  'Nude') },
      { size: 'M',  color: 'Nude',   price: 42000, costPrice: 16000, stock: 7,  sku: sku('CBD', 'M',  'Nude') },
    ],
    tags: ['party', 'trending'],
    featured: true, status: 'published', minStock: 4,
    ratings: { avg: 4.7, count: 63 },
  },

  {
    name: 'Wide-Leg Linen Co-Ord Set',
    slug: 'wide-leg-linen-co-ord-set',
    description: 'Effortlessly chic matching set featuring a cropped button-front top and wide-leg trousers in premium European linen. Breathable, versatile, and impeccably tailored.',
    category: 'Female Fashion',
    subcategory: 'Co-Ords',
    images: [
      { url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800' },
    ],
    variants: [
      { size: 'XS', color: 'Sand',    price: 52000, costPrice: 20000, stock: 6,  sku: sku('WLC', 'XS', 'Sand') },
      { size: 'S',  color: 'Sand',    price: 52000, costPrice: 20000, stock: 9,  sku: sku('WLC', 'S',  'Sand') },
      { size: 'M',  color: 'Sand',    price: 52000, costPrice: 20000, stock: 8,  sku: sku('WLC', 'M',  'Sand') },
      { size: 'L',  color: 'Sand',    price: 52000, costPrice: 20000, stock: 5,  sku: sku('WLC', 'L',  'Sand') },
      { size: 'S',  color: 'Sage Green', price: 52000, costPrice: 20000, stock: 7, sku: sku('WLC', 'S', 'SageGreen') },
      { size: 'M',  color: 'Sage Green', price: 52000, costPrice: 20000, stock: 6, sku: sku('WLC', 'M', 'SageGreen') },
    ],
    tags: ['resort', 'summer'],
    featured: false, status: 'published', minStock: 3,
    ratings: { avg: 4.6, count: 29 },
  },

  // ── MALE FASHION ─────────────────────────────────────────────
  {
    name: 'Slim Fit Linen Suit - 2 Piece',
    slug: 'slim-fit-linen-suit-2-piece',
    description: 'Impeccably tailored 2-piece suit in premium Italian linen blend. Notch lapel jacket with matching flat-front trousers. Breathable and sharp for tropical climates.',
    category: 'Male Fashion',
    subcategory: 'Suits',
    images: [
      { url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800' },
      { url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800' },
    ],
    variants: [
      { size: '38', color: 'Ivory',    price: 145000, costPrice: 58000, compareAtPrice: 175000, stock: 3, sku: sku('SLS', '38', 'Ivory') },
      { size: '40', color: 'Ivory',    price: 145000, costPrice: 58000, compareAtPrice: 175000, stock: 5, sku: sku('SLS', '40', 'Ivory') },
      { size: '42', color: 'Ivory',    price: 145000, costPrice: 58000, compareAtPrice: 175000, stock: 4, sku: sku('SLS', '42', 'Ivory') },
      { size: '44', color: 'Ivory',    price: 145000, costPrice: 58000, compareAtPrice: 175000, stock: 2, sku: sku('SLS', '44', 'Ivory') },
      { size: '38', color: 'Charcoal', price: 145000, costPrice: 58000, compareAtPrice: 175000, stock: 4, sku: sku('SLS', '38', 'Charcoal') },
      { size: '40', color: 'Charcoal', price: 145000, costPrice: 58000, compareAtPrice: 175000, stock: 6, sku: sku('SLS', '40', 'Charcoal') },
      { size: '42', color: 'Charcoal', price: 145000, costPrice: 58000, compareAtPrice: 175000, stock: 4, sku: sku('SLS', '42', 'Charcoal') },
    ],
    tags: ['featured', 'luxury', 'executive'],
    featured: true, status: 'published', minStock: 2,
    ratings: { avg: 4.9, count: 22 },
  },

  {
    name: 'Premium Silk Blend Dress Shirt',
    slug: 'premium-silk-blend-dress-shirt',
    description: 'Elevated dress shirt in a luxurious silk-cotton blend. French collar, mother-of-pearl buttons, and a slim silhouette. Effortlessly transitions from boardroom to dinner.',
    category: 'Male Fashion',
    subcategory: 'Shirts',
    images: [
      { url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800' },
    ],
    variants: [
      { size: 'S',  color: 'White',      price: 32000, costPrice: 12000, stock: 15, sku: sku('PSS', 'S',  'White') },
      { size: 'M',  color: 'White',      price: 32000, costPrice: 12000, stock: 18, sku: sku('PSS', 'M',  'White') },
      { size: 'L',  color: 'White',      price: 32000, costPrice: 12000, stock: 14, sku: sku('PSS', 'L',  'White') },
      { size: 'XL', color: 'White',      price: 32000, costPrice: 12000, stock: 10, sku: sku('PSS', 'XL', 'White') },
      { size: 'S',  color: 'Sky Blue',   price: 32000, costPrice: 12000, stock: 12, sku: sku('PSS', 'S',  'SkyBlue') },
      { size: 'M',  color: 'Sky Blue',   price: 32000, costPrice: 12000, stock: 15, sku: sku('PSS', 'M',  'SkyBlue') },
      { size: 'L',  color: 'Sky Blue',   price: 32000, costPrice: 12000, stock: 11, sku: sku('PSS', 'L',  'SkyBlue') },
    ],
    tags: ['bestseller', 'classic'],
    featured: false, status: 'published', minStock: 5,
    ratings: { avg: 4.7, count: 55 },
  },

  // ── BAGS & PURSES ────────────────────────────────────────────
  {
    name: 'Mini Quilted Chain Bag',
    slug: 'mini-quilted-chain-bag',
    description: 'Compact quilted lambskin bag with gold-tone chain strap. Magnetic snap closure with interior card slot and mirror. The perfect evening companion or luxury daytime accent.',
    category: 'Bags & Purses',
    subcategory: 'Mini Bags',
    images: [
      { url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800' },
      { url: 'https://images.unsplash.com/photo-1594633312681-425c7b97b5b0?w=800' },
    ],
    variants: [
      { size: 'One Size', color: 'Black',    price: 78000, costPrice: 30000, compareAtPrice: 95000, stock: 8,  sku: sku('MQB', 'OS', 'Black') },
      { size: 'One Size', color: 'Blush',    price: 78000, costPrice: 30000, compareAtPrice: 95000, stock: 6,  sku: sku('MQB', 'OS', 'Blush') },
      { size: 'One Size', color: 'Caramel',  price: 78000, costPrice: 30000, compareAtPrice: 95000, stock: 5,  sku: sku('MQB', 'OS', 'Caramel') },
      { size: 'One Size', color: 'Burgundy', price: 78000, costPrice: 30000, compareAtPrice: 95000, stock: 4,  sku: sku('MQB', 'OS', 'Burgundy') },
    ],
    tags: ['bestseller', 'evening', 'luxury'],
    featured: true, status: 'published', minStock: 2, isFavorite: true,
    ratings: { avg: 4.9, count: 68 },
  },

  {
    name: 'Croc-Embossed Oversized Tote',
    slug: 'croc-embossed-oversized-tote',
    description: 'Structured oversized tote in croc-embossed vegan leather. Fits 15" laptop with additional zip and open pockets. Brass feet and gold hardware. The ultimate power tote.',
    category: 'Bags & Purses',
    subcategory: 'Totes',
    images: [
      { url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800' },
    ],
    variants: [
      { size: 'One Size', color: 'Black',   price: 65000, costPrice: 25000, stock: 10, sku: sku('CET', 'OS', 'Black') },
      { size: 'One Size', color: 'Cognac',  price: 65000, costPrice: 25000, stock: 7,  sku: sku('CET', 'OS', 'Cognac') },
      { size: 'One Size', color: 'Ivory',   price: 65000, costPrice: 25000, stock: 5,  sku: sku('CET', 'OS', 'Ivory') },
    ],
    tags: ['work', 'classic'],
    featured: false, status: 'published', minStock: 3,
    ratings: { avg: 4.6, count: 38 },
  },

  // ── SHOES ────────────────────────────────────────────────────
  {
    name: 'Barely-There Stiletto Sandal',
    slug: 'barely-there-stiletto-sandal',
    description: 'Minimalist barely-there sandal with delicate ankle strap and 4-inch stiletto heel in genuine Italian leather. Cushioned footbed for all-night comfort. Defines elegance.',
    category: 'Shoes',
    subcategory: 'Heels',
    images: [
      { url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800' },
    ],
    variants: [
      { size: '36', color: 'Nude',  price: 48000, costPrice: 18000, compareAtPrice: 58000, stock: 6,  sku: sku('BTS', '36', 'Nude') },
      { size: '37', color: 'Nude',  price: 48000, costPrice: 18000, compareAtPrice: 58000, stock: 9,  sku: sku('BTS', '37', 'Nude') },
      { size: '38', color: 'Nude',  price: 48000, costPrice: 18000, compareAtPrice: 58000, stock: 11, sku: sku('BTS', '38', 'Nude') },
      { size: '39', color: 'Nude',  price: 48000, costPrice: 18000, compareAtPrice: 58000, stock: 8,  sku: sku('BTS', '39', 'Nude') },
      { size: '40', color: 'Nude',  price: 48000, costPrice: 18000, compareAtPrice: 58000, stock: 5,  sku: sku('BTS', '40', 'Nude') },
      { size: '37', color: 'Black', price: 48000, costPrice: 18000, compareAtPrice: 58000, stock: 8,  sku: sku('BTS', '37', 'Black') },
      { size: '38', color: 'Black', price: 48000, costPrice: 18000, compareAtPrice: 58000, stock: 10, sku: sku('BTS', '38', 'Black') },
      { size: '39', color: 'Black', price: 48000, costPrice: 18000, compareAtPrice: 58000, stock: 7,  sku: sku('BTS', '39', 'Black') },
    ],
    tags: ['bestseller', 'evening', 'heels'],
    featured: true, status: 'published', minStock: 3, isFavorite: true,
    ratings: { avg: 4.8, count: 82 },
  },

  {
    name: 'Square-Toe Block Heel Mule',
    slug: 'square-toe-block-heel-mule',
    description: 'Contemporary square-toe mule with a stable 3-inch block heel. Slip-on silhouette in supple nappa leather. Equally at home with tailored trousers or a mini dress.',
    category: 'Shoes',
    subcategory: 'Mules',
    images: [
      { url: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800' },
    ],
    variants: [
      { size: '36', color: 'Ivory',  price: 38000, costPrice: 14000, stock: 6,  sku: sku('STM', '36', 'Ivory') },
      { size: '37', color: 'Ivory',  price: 38000, costPrice: 14000, stock: 8,  sku: sku('STM', '37', 'Ivory') },
      { size: '38', color: 'Ivory',  price: 38000, costPrice: 14000, stock: 10, sku: sku('STM', '38', 'Ivory') },
      { size: '39', color: 'Ivory',  price: 38000, costPrice: 14000, stock: 7,  sku: sku('STM', '39', 'Ivory') },
      { size: '37', color: 'Black',  price: 38000, costPrice: 14000, stock: 9,  sku: sku('STM', '37', 'Black') },
      { size: '38', color: 'Black',  price: 38000, costPrice: 14000, stock: 11, sku: sku('STM', '38', 'Black') },
      { size: '39', color: 'Black',  price: 38000, costPrice: 14000, stock: 8,  sku: sku('STM', '39', 'Black') },
      { size: '40', color: 'Black',  price: 38000, costPrice: 14000, stock: 5,  sku: sku('STM', '40', 'Black') },
    ],
    tags: ['trending', 'everyday'],
    featured: false, status: 'published', minStock: 3,
    ratings: { avg: 4.6, count: 44 },
  },

  // ── ACCESSORIES ──────────────────────────────────────────────
  {
    name: 'Gold Layered Necklace Set',
    slug: 'gold-layered-necklace-set',
    description: '3-piece layered necklace set in 18k gold-plated brass. Includes a delicate chain, a pearl pendant, and a chunky link chain. Designed to be worn together or separately.',
    category: 'Accessories',
    subcategory: 'Jewellery',
    images: [
      { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800' },
    ],
    variants: [
      { size: 'One Size', color: 'Gold',      price: 18500, costPrice: 6000, stock: 30, sku: sku('GLN', 'OS', 'Gold') },
      { size: 'One Size', color: 'Rose Gold', price: 18500, costPrice: 6000, stock: 22, sku: sku('GLN', 'OS', 'RoseGold') },
      { size: 'One Size', color: 'Silver',    price: 18500, costPrice: 6000, stock: 18, sku: sku('GLN', 'OS', 'Silver') },
    ],
    tags: ['gift', 'jewellery', 'bestseller'],
    featured: true, status: 'published', minStock: 5,
    ratings: { avg: 4.7, count: 91 },
  },

  {
    name: 'Crystal Drop Statement Earrings',
    slug: 'crystal-drop-statement-earrings',
    description: 'Hand-set Austrian crystal drop earrings on gold-plated hooks. Lightweight despite their dramatic length. The finishing touch that elevates any look from beautiful to unforgettable.',
    category: 'Accessories',
    subcategory: 'Jewellery',
    images: [
      { url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800' },
    ],
    variants: [
      { size: 'One Size', color: 'Clear Gold',   price: 12500, costPrice: 4000, stock: 25, sku: sku('CDE', 'OS', 'ClearGold') },
      { size: 'One Size', color: 'Black Gold',   price: 12500, costPrice: 4000, stock: 18, sku: sku('CDE', 'OS', 'BlackGold') },
      { size: 'One Size', color: 'Champagne',    price: 12500, costPrice: 4000, stock: 20, sku: sku('CDE', 'OS', 'Champagne') },
    ],
    tags: ['evening', 'statement', 'gift'],
    featured: false, status: 'published', minStock: 5,
    ratings: { avg: 4.8, count: 56 },
  },

  // ── PERFUMES ─────────────────────────────────────────────────
  {
    name: 'Signature Noir Eau de Parfum',
    slug: 'signature-noir-eau-de-parfum',
    description: 'An intoxicating oriental fragrance built on precious oud, dark amber, and black musk. Opens with bergamot and saffron, dries to a warm, lingering skin scent. Long-lasting 12-hour projection.',
    category: 'Perfumes',
    subcategory: 'Eau de Parfum',
    images: [
      { url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800' },
      { url: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800' },
    ],
    variants: [
      { size: '50ml',  color: 'Default', price: 42000, costPrice: 15000, compareAtPrice: 52000, stock: 20, sku: sku('SNP', '50', 'Default') },
      { size: '100ml', color: 'Default', price: 68000, costPrice: 25000, compareAtPrice: 82000, stock: 15, sku: sku('SNP', '100', 'Default') },
    ],
    tags: ['luxury', 'oud', 'bestseller'],
    featured: true, status: 'published', minStock: 4, isFavorite: true,
    ratings: { avg: 4.9, count: 104 },
  },

  {
    name: 'Rose & Oud Eau de Parfum',
    slug: 'rose-oud-eau-de-parfum',
    description: 'A modern floral-oriental composition. Bulgarian rose absolute meets aged oud and white sandalwood for a fragrance that is simultaneously romantic and powerful. A Ball & Boujee icon.',
    category: 'Perfumes',
    subcategory: 'Eau de Parfum',
    images: [
      { url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800' },
    ],
    variants: [
      { size: '50ml',  color: 'Default', price: 48000, costPrice: 18000, stock: 18, sku: sku('ROP', '50',  'Default') },
      { size: '100ml', color: 'Default', price: 75000, costPrice: 28000, stock: 12, sku: sku('ROP', '100', 'Default') },
    ],
    tags: ['floral', 'luxury', 'feminine'],
    featured: true, status: 'published', minStock: 3,
    ratings: { avg: 4.8, count: 77 },
  },

  // ── LUXURY HAIR ──────────────────────────────────────────────
  {
    name: 'Raw Indian Straight Bundle',
    slug: 'raw-indian-straight-bundle',
    description: '100% raw unprocessed Indian temple hair. Single donor, naturally straight texture. Minimal shedding, tangle-free, and colour-safe. Cut from a single donor for uniform thickness root to tip.',
    category: 'Luxury Hair',
    subcategory: 'Bundles',
    images: [
      { url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800' },
    ],
    variants: [
      { size: '10 inch', color: 'Natural Black', price: 32000, costPrice: 12000, stock: 20, sku: sku('RIS', '10', 'NatBlack') },
      { size: '12 inch', color: 'Natural Black', price: 36000, costPrice: 14000, stock: 22, sku: sku('RIS', '12', 'NatBlack') },
      { size: '14 inch', color: 'Natural Black', price: 42000, costPrice: 16000, stock: 18, sku: sku('RIS', '14', 'NatBlack') },
      { size: '16 inch', color: 'Natural Black', price: 48000, costPrice: 18000, stock: 15, sku: sku('RIS', '16', 'NatBlack') },
      { size: '18 inch', color: 'Natural Black', price: 55000, costPrice: 21000, stock: 12, sku: sku('RIS', '18', 'NatBlack') },
      { size: '20 inch', color: 'Natural Black', price: 62000, costPrice: 24000, stock: 10, sku: sku('RIS', '20', 'NatBlack') },
    ],
    tags: ['bestseller', 'raw-hair', 'virgin'],
    featured: true, status: 'published', minStock: 4,
    ratings: { avg: 4.9, count: 118 },
  },

  {
    name: 'HD Lace Front Wig - Body Wave',
    slug: 'hd-lace-front-wig-body-wave',
    description: 'Pre-plucked 13x4 HD lace front wig in silky body wave. Invisible HD lace melts seamlessly into all skin tones. Pre-bleached knots, removable elastic band, baby hairs included. 180% density.',
    category: 'Luxury Hair',
    subcategory: 'Wigs',
    images: [
      { url: 'https://images.unsplash.com/photo-1595475207225-428b62bda831?w=800' },
    ],
    variants: [
      { size: '14 inch', color: 'Natural Black', price: 95000,  costPrice: 38000, stock: 8,  sku: sku('HLW', '14', 'NatBlack') },
      { size: '16 inch', color: 'Natural Black', price: 110000, costPrice: 44000, stock: 7,  sku: sku('HLW', '16', 'NatBlack') },
      { size: '18 inch', color: 'Natural Black', price: 125000, costPrice: 50000, stock: 6,  sku: sku('HLW', '18', 'NatBlack') },
      { size: '20 inch', color: 'Natural Black', price: 142000, costPrice: 57000, stock: 5,  sku: sku('HLW', '20', 'NatBlack') },
      { size: '22 inch', color: 'Natural Black', price: 158000, costPrice: 63000, stock: 4,  sku: sku('HLW', '22', 'NatBlack') },
    ],
    tags: ['luxury', 'hd-lace', 'bestseller'],
    featured: true, status: 'published', minStock: 2, isFavorite: true,
    ratings: { avg: 4.9, count: 93 },
  },

  // ── SKINCARE ─────────────────────────────────────────────────
  {
    name: 'Radiance Vitamin C Serum',
    slug: 'radiance-vitamin-c-serum',
    description: 'Stabilised 20% Vitamin C serum with niacinamide and ferulic acid. Visibly brightens, reduces dark spots, and boosts collagen production. Fragrance-free, suitable for all skin tones.',
    category: 'Skincare',
    subcategory: 'Serums',
    images: [
      { url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800' },
    ],
    variants: [
      { size: '30ml', color: 'Default', price: 22000, costPrice: 8000, stock: 30, sku: sku('RVC', '30', 'Default') },
      { size: '50ml', color: 'Default', price: 34000, costPrice: 13000, stock: 25, sku: sku('RVC', '50', 'Default') },
    ],
    tags: ['skincare', 'bestseller', 'brightening'],
    featured: true, status: 'published', minStock: 5,
    ratings: { avg: 4.7, count: 86 },
  },

  {
    name: 'Luxury 24K Gold Night Cream',
    slug: 'luxury-24k-gold-night-cream',
    description: 'Intensive overnight repair cream infused with 24K gold particles, retinol, and hyaluronic acid. Firms, plumps, and restores radiance while you sleep. Wake up to visibly younger-looking skin.',
    category: 'Skincare',
    subcategory: 'Moisturisers',
    images: [
      { url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800' },
    ],
    variants: [
      { size: '50ml',  color: 'Default', price: 35000, costPrice: 13000, compareAtPrice: 42000, stock: 20, sku: sku('LGN', '50',  'Default') },
      { size: '100ml', color: 'Default', price: 58000, costPrice: 22000, compareAtPrice: 70000, stock: 12, sku: sku('LGN', '100', 'Default') },
    ],
    tags: ['luxury', 'anti-aging', 'gold'],
    featured: false, status: 'published', minStock: 4,
    ratings: { avg: 4.8, count: 52 },
  },

  // ── GIFT ITEMS ───────────────────────────────────────────────
  {
    name: 'B&B Luxury Gift Box - Her',
    slug: 'bnb-luxury-gift-box-her',
    description: 'Curated luxury gift box for her. Includes a travel-size Signature Noir perfume, 24K gold lip gloss, crystal earrings, and a hand-written gift card. Presented in a signature B&B black keepsake box.',
    category: 'Gift Items',
    subcategory: 'Gift Sets',
    images: [
      { url: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800' },
    ],
    variants: [
      { size: 'Standard', color: 'Black Gold', price: 45000, costPrice: 18000, stock: 15, sku: sku('LGH', 'STD', 'BlkGold') },
      { size: 'Deluxe',   color: 'Black Gold', price: 75000, costPrice: 30000, stock: 10, sku: sku('LGH', 'DLX', 'BlkGold') },
    ],
    tags: ['gift', 'bestseller', 'celebration'],
    featured: true, status: 'published', minStock: 3, isFavorite: true,
    ratings: { avg: 4.9, count: 61 },
  },

  {
    name: 'Noir Soy Candle Collection',
    slug: 'noir-soy-candle-collection',
    description: 'Hand-poured 100% natural soy wax candles in luxury black glass vessels. Available in Black Oud, Cashmere & Vanilla, and Champagne Rose. Up to 60-hour burn time. Perfect for gifting or self-indulgence.',
    category: 'Gift Items',
    subcategory: 'Home Fragrance',
    images: [
      { url: 'https://images.unsplash.com/photo-1602607730398-1d5d1c16e99c?w=800' },
    ],
    variants: [
      { size: 'Single (250g)', color: 'Black Oud',         price: 12000, costPrice: 4000, stock: 30, sku: sku('NSC', '250', 'BlackOud') },
      { size: 'Single (250g)', color: 'Cashmere Vanilla',  price: 12000, costPrice: 4000, stock: 28, sku: sku('NSC', '250', 'CashVan') },
      { size: 'Single (250g)', color: 'Champagne Rose',    price: 12000, costPrice: 4000, stock: 25, sku: sku('NSC', '250', 'ChampRose') },
      { size: 'Set of 3',      color: 'Assorted',          price: 32000, costPrice: 11000, compareAtPrice: 36000, stock: 20, sku: sku('NSC', '3PK', 'Assorted') },
    ],
    tags: ['gift', 'home', 'fragrance'],
    featured: false, status: 'published', minStock: 5,
    ratings: { avg: 4.7, count: 43 },
  },

  // ── KIDDIES FASHION ──────────────────────────────────────────
  {
    name: 'Mini Me Tulle Party Dress',
    slug: 'mini-me-tulle-party-dress',
    description: 'Adorable sequin-bodice tulle princess dress for little girls. Full volume petticoat underskirt, satin sash, and flower embellishments. Designed to match selected adult styles from our Women\'s collection.',
    category: 'Kiddies Fashion',
    subcategory: 'Girls Dresses',
    images: [
      { url: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800' },
    ],
    variants: [
      { size: '2-3 Years', color: 'Blush Pink', price: 22000, costPrice: 8000, stock: 8,  sku: sku('MTD', '2-3', 'BlushPink') },
      { size: '4-5 Years', color: 'Blush Pink', price: 22000, costPrice: 8000, stock: 10, sku: sku('MTD', '4-5', 'BlushPink') },
      { size: '6-7 Years', color: 'Blush Pink', price: 22000, costPrice: 8000, stock: 7,  sku: sku('MTD', '6-7', 'BlushPink') },
      { size: '8-9 Years', color: 'Blush Pink', price: 24000, costPrice: 9000, stock: 5,  sku: sku('MTD', '8-9', 'BlushPink') },
      { size: '4-5 Years', color: 'Ivory',      price: 22000, costPrice: 8000, stock: 8,  sku: sku('MTD', '4-5', 'Ivory') },
      { size: '6-7 Years', color: 'Ivory',      price: 22000, costPrice: 8000, stock: 6,  sku: sku('MTD', '6-7', 'Ivory') },
    ],
    tags: ['party', 'girls', 'occasion'],
    featured: true, status: 'published', minStock: 2,
    ratings: { avg: 4.9, count: 37 },
  },

  {
    name: 'Boys Smart Kaftan Set',
    slug: 'boys-smart-kaftan-set',
    description: 'Beautifully crafted boys kaftan set in premium Ankara and cotton blend. Includes top and trousers with subtle embroidery detailing. Perfect for naming ceremonies, eid, and special occasions.',
    category: 'Kiddies Fashion',
    subcategory: 'Boys Sets',
    images: [
      { url: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800' },
    ],
    variants: [
      { size: '2-3 Years', color: 'Royal Blue/Gold', price: 18000, costPrice: 6500, stock: 8,  sku: sku('BKS', '2-3', 'BlueGold') },
      { size: '4-5 Years', color: 'Royal Blue/Gold', price: 18000, costPrice: 6500, stock: 10, sku: sku('BKS', '4-5', 'BlueGold') },
      { size: '6-7 Years', color: 'Royal Blue/Gold', price: 18000, costPrice: 6500, stock: 8,  sku: sku('BKS', '6-7', 'BlueGold') },
      { size: '8-9 Years', color: 'Royal Blue/Gold', price: 20000, costPrice: 7500, stock: 6,  sku: sku('BKS', '8-9', 'BlueGold') },
      { size: '4-5 Years', color: 'Burgundy/Gold',   price: 18000, costPrice: 6500, stock: 7,  sku: sku('BKS', '4-5', 'BurgGold') },
      { size: '6-7 Years', color: 'Burgundy/Gold',   price: 18000, costPrice: 6500, stock: 6,  sku: sku('BKS', '6-7', 'BurgGold') },
    ],
    tags: ['occasion', 'boys', 'traditional'],
    featured: false, status: 'published', minStock: 2,
    ratings: { avg: 4.8, count: 24 },
  },
];

async function main() {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   Ball & Boujee — Seed Products          ║');
  console.log('╚══════════════════════════════════════════╝\n');

  console.log('Connecting to MongoDB…');
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 20000,
    socketTimeoutMS: 20000,
  });
  console.log('✓  Connected\n');

  console.log('Clearing existing products…');
  const { deletedCount } = await Product.deleteMany({});
  console.log(`✓  Removed ${deletedCount} existing products\n`);

  console.log(`Inserting ${products.length} products…`);
  const inserted = await Product.insertMany(products);
  console.log(`✓  Inserted ${inserted.length} products\n`);

  const byCategory = {};
  inserted.forEach(p => {
    byCategory[p.category] = (byCategory[p.category] || 0) + 1;
  });

  console.log('── By category ─────────────────────────');
  Object.entries(byCategory).forEach(([cat, count]) => {
    console.log(`   ${cat.padEnd(22)} ${count} product${count !== 1 ? 's' : ''}`);
  });
  console.log('────────────────────────────────────────\n');

  await mongoose.disconnect();
  console.log('✅  Done!\n');
}

main().catch(err => {
  console.error('\n❌ ', err.message);
  process.exit(1);
});
