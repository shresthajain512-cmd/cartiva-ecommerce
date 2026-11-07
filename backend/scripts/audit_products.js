const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cartiva');
  const Product = require('../models/Product');
  const products = await Product.find().lean();
  console.log('TOTAL_PRODUCTS:' + products.length);
  products.forEach((p, idx) => {
    console.log(JSON.stringify({
      index: idx + 1,
      id: p._id.toString(),
      title: p.title,
      category: p.category,
      price: p.price,
      imageUrl: p.imageUrl,
      description: p.description,
      seller: p.storeName,
      isPublished: p.isPublished
    }));
  });
  await mongoose.disconnect();
}
run();
