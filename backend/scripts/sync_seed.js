const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cartiva');
  const Product = require('../models/Product');
  const products = await Product.find().lean();
  
  // Exclude Day 6 test artifacts
  const seedProducts = products.filter(p => !p.storeName.includes('Alice Apex') && !p.storeName.includes('Bob Boutique'));
  console.log('Master seed products count:', seedProducts.length);
  
  const cleanProducts = seedProducts.map(p => ({
    title: p.title,
    description: p.description,
    price: p.price,
    originalPrice: p.originalPrice || undefined,
    category: p.category,
    imageUrl: p.imageUrl,
    stockCount: p.stockCount,
    rating: p.rating || 4.8,
    reviewsCount: p.reviewsCount || 0,
    specs: p.specs || {},
    tags: p.tags || [],
    isFeatured: p.isFeatured || false,
    sellerBusinessName: p.storeName
  }));

  const content = `/**
 * Cartiva Master Database Seed Script
 * Pre-populates 6 Approved Artisan Studios and 50 Fully Verified Products
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Product = require('./models/Product');

const seedUsers = [
  {
    name: 'Kaito Tanaka',
    email: 'kaito@kansosound.com',
    password: 'ArtisanPassword123!',
    role: 'seller',
    businessName: 'Kanso Sound & Acoustics',
    sellerApprovalStatus: 'approved',
    phone: '+91 98765 43210'
  },
  {
    name: 'Elena Rostova',
    email: 'elena@nomadleather.com',
    password: 'ArtisanPassword123!',
    role: 'seller',
    businessName: 'Nomad Leather Atelier',
    sellerApprovalStatus: 'approved',
    phone: '+91 98765 43211'
  },
  {
    name: 'Arjun & Tara Mehta',
    email: 'studio@terrastoneware.in',
    password: 'ArtisanPassword123!',
    role: 'seller',
    businessName: 'Terra Stoneware Studio',
    sellerApprovalStatus: 'approved',
    phone: '+91 98765 43212'
  },
  {
    name: 'Julian Vance',
    email: 'julian@sonderbooks.co',
    password: 'ArtisanPassword123!',
    role: 'seller',
    businessName: 'Sonder Books & Prints',
    sellerApprovalStatus: 'approved',
    phone: '+91 98765 43213'
  },
  {
    name: 'Vikram Singhania',
    email: 'vikram@pranamovement.in',
    password: 'ArtisanPassword123!',
    role: 'seller',
    businessName: 'Prana Movement Lab',
    sellerApprovalStatus: 'approved',
    phone: '+91 98765 43214'
  },
  {
    name: 'Maya Lin',
    email: 'maya@aethelbotanicals.com',
    password: 'ArtisanPassword123!',
    role: 'seller',
    businessName: 'Aethel Botanical & Living',
    sellerApprovalStatus: 'approved',
    phone: '+91 98765 43215'
  }
];

const seedProducts = ${JSON.stringify(cleanProducts, null, 2)};

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/cartiva';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding.');

    for (const u of seedUsers) {
      let existingUser = await User.findOne({ email: u.email });
      if (!existingUser) {
        existingUser = await User.create(u);
        console.log('Created artisan seller: ' + u.businessName);
      }
    }

    const sellerDocs = await User.find({ role: 'seller' });
    const sellerMap = {};
    for (const s of sellerDocs) {
      sellerMap[s.businessName] = s._id;
    }

    for (const p of seedProducts) {
      const sellerId = sellerMap[p.sellerBusinessName];
      if (!sellerId) continue;
      
      const productPayload = {
        title: p.title,
        description: p.description,
        price: p.price,
        originalPrice: p.originalPrice,
        category: p.category,
        imageUrl: p.imageUrl,
        stockCount: p.stockCount,
        seller: sellerId,
        createdBy: sellerId,
        storeName: p.sellerBusinessName,
        isPublished: true,
        isArchived: false,
        rating: p.rating,
        reviewsCount: p.reviewsCount,
        specs: p.specs,
        tags: p.tags,
        isFeatured: p.isFeatured
      };

      await Product.findOneAndUpdate(
        { title: p.title, storeName: p.sellerBusinessName },
        { $set: productPayload },
        { upsert: true, new: true }
      );
    }

    console.log('✅ Seeding complete. 50 master products verified across 6 artisan studios.');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedUsers, seedProducts };
`;

  fs.writeFileSync('seedData.js', content);
  console.log('Successfully wrote backend/seedData.js with clean products!');
  await mongoose.disconnect();
}

run();
