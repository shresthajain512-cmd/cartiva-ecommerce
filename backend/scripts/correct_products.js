const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const corrections = [
  // 1. Mechanical Keyboard
  {
    id: '6aee1804dd520c7ea4f6d885',
    imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80'
  },
  // 2. Minimal Silver Smartwatch (was Chronograph Watch showing digital smartwatch)
  {
    id: '6aee1804dd520c7ea4f6d887',
    title: 'Minimal Silver Smartwatch',
    description: 'Architectural silver unibody casing with a circular high-resolution AMOLED display, continuous biometric sensors, and an ultra-soft hypoallergenic silicone band with 7-day battery life.',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
  },
  // 3. Laptop Riser (was iMac)
  {
    id: '6aee1804dd520c7ea4f6d88b',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80'
  },
  // 4. Vintage Audio Receiver (was neon sign)
  {
    id: '6aee1804dd520c7ea4f6d88f',
    imageUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?auto=format&fit=crop&w=800&q=80'
  },
  // 5. Leather Tech Folio (was 404)
  {
    id: '6aee1804dd520c7ea4f6d891',
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'
  },
  // 6. Leather Duffel (was Gucci camera bag)
  {
    id: '6aee1804dd520c7ea4f6d893',
    title: 'Quilted Italian Leather Crossbody Camera Bag',
    description: 'Handcrafted from supple calfskin leather with chevron quilting, solid antiqued gold-toned hardware, and an adjustable chain-and-leather shoulder strap.'
  },
  // 7. Waxed Canvas Tote (was paper grocery bag)
  {
    id: '6aee1804dd520c7ea4f6d895',
    title: 'Minimalist Heavyweight Kraft Paper Shopper Tote',
    description: 'Eco-friendly washable kraft paper market tote featuring reinforced woven herringbone handles and an expandable gusset base.'
  },
  // 8. Denim Chore Jacket (was denim jeans)
  {
    id: '6aee1804dd520c7ea4f6d89b',
    imageUrl: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=800&q=80'
  },
  // 9. Linen Tunic (was coffee cup in hands)
  {
    id: '6aee1804dd520c7ea4f6d8a1',
    title: 'Relaxed French Linen Boatneck Tunic',
    description: 'Cut from 100% Normandy washed flax linen with subtle vertical chalk stripes, dropped shoulders, and breathable side-split hems.',
    imageUrl: 'https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?auto=format&fit=crop&w=800&q=80'
  },
  // 10. Coffee Beans (was Carafe Set showing coffee beans)
  {
    id: '6aee1804dd520c7ea4f6d8a5',
    title: 'Artisanal Single-Origin Roasted Whole Coffee Beans',
    description: 'Small-batch specialty Arabica beans, roasted to a medium profile with balanced tasting notes of caramelized citrus, dark chocolate, and toasted almond.'
  },
  // 11. Matcha Latte Cup (was Matcha Bowl & Whisk showing cafe matcha latte)
  {
    id: '6aee1804dd520c7ea4f6d8a7',
    title: 'Organic Ceremonial Grade Matcha Latte Cup',
    description: 'Stone-ground Uji matcha whisked with oat milk, served in a ceramic cafe cup with signature micro-foam leaf art.'
  },
  // 12. Enamelled Cast Iron Dutch Oven (was 404)
  {
    id: '6aee1804dd520c7ea4f6d8ab',
    imageUrl: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=800&q=80'
  },
  // 13. Olive Wood Cutting Board (was bacon strips)
  {
    id: '6aee1804dd520c7ea4f6d8ad',
    imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80'
  },
  // 14. Double-Walled Glass Latte Cup (was Gooseneck Kettle showing glass latte)
  {
    id: '6aee1804dd520c7ea4f6d8af',
    title: 'Double-Walled Borosilicate Glass Latte Tumbler',
    description: 'Handblown insulating double-wall glass tumbler designed to keep hot espresso and iced beverages at temperature without surface condensation.'
  },
  // 15. Ceramic Espresso Tumblers (was Noodle Bowls showing small cups)
  {
    id: '6aee1804dd520c7ea4f6d8b3',
    title: 'Handmade Ceramic Espresso & Tea Tumbler Set',
    description: 'Set of earthy stoneware tumblers featuring raw unglazed terracotta bases and dipped matte cream glazes.'
  },
  // 16. Glass Tea Cup with Infusers (was Cold Brew showing hot tea)
  {
    id: '6aee1804dd520c7ea4f6d8b5',
    title: 'Handblown Glass Tea Cup with Botanical Pyramid Sachets',
    description: 'Heat-resistant borosilicate glass tea mug with loop handle, paired with artisan herbal loose-leaf tea sachets.'
  },
  // 17. Startup Strategy Books (was Typography Essays showing Zero to One)
  {
    id: '6aee1804dd520c7ea4f6d8b9',
    title: 'The Modern Entrepreneur Library: Strategy & Innovation',
    description: 'Curated collection of bestselling strategy, leadership, and startup handbooks bound in hardcover and trade paperback.'
  },
  // 18. Vintage Illustrated Storybooks (was Wabi Sabi showing children books)
  {
    id: '6aee1804dd520c7ea4f6d8bb',
    title: 'Vintage Illustrated Hardcover Storybook Collection',
    description: 'Set of classic mid-century children\'s illustrated storybooks with vintage clothbound spines and archival paper.'
  },
  // 19. How Innovation Works (was Islands Geography showing How Innovation Works cover)
  {
    id: '6aee1804dd520c7ea4f6d8bf',
    title: 'How Innovation Works by Matt Ridley (Hardcover Edition)',
    description: 'Acclaimed technological and economic history exploring how human breakthrough inventions flourish in freedom. Hardcover with jacket.'
  },
  // 20. The Last Bookstore Architectural Print (was Botanical Folio showing Last Bookstore tunnel)
  {
    id: '6aee1804dd520c7ea4f6d8c1',
    title: 'The Last Bookstore Archival Architectural Art Print',
    description: 'Limited-edition architectural fine art photograph capturing the iconic book tunnel and flying books of Downtown LA\'s legendary literary vault.'
  },
  // 21. Milk and Honey Poetry (was Sonder Dot-Grid Journal showing Rupi Kaur book)
  {
    id: '6aee1804dd520c7ea4f6d8c3',
    title: 'Milk and Honey: Special Edition Poetry Collection',
    description: 'The defining modern poetry and prose collection by rupi kaur exploring love, loss, trauma, and healing. Special black-and-gold matte cover.'
  },
  // 22. Great Libraries of the World (was Tea Ceremony showing public library rotunda)
  {
    id: '6aee1804dd520c7ea4f6d8c5',
    title: 'Cathedrals of Knowledge: The World\'s Great Libraries',
    description: 'Panoramic architectural coffee table monograph documenting the most stunning library rotundas and book sanctuaries across the globe.'
  },
  // 23. Neoprene Dumbbells (was 16kg Kettlebell showing 3lb pink dumbbells)
  {
    id: '6aee1804dd520c7ea4f6d8c9',
    title: 'Studio Neoprene Hand Dumbbell Pair (3kg)',
    description: 'Hexagonal anti-roll cast iron dumbbells coated in soft non-slip matte neoprene. Ideal for barre, aerobics, pilates, and home strength sessions.'
  },
  // 24. Cork Yoga Block (was beach sunset silhouette)
  {
    id: '6aee1804dd520c7ea4f6d8cb',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80'
  },
  // 25. Yoga Alignment Strap (was gym workout class)
  {
    id: '6aee1804dd520c7ea4f6d8cd',
    imageUrl: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=800&q=80'
  },
  // 26. Deep-Tissue Foam Roller (was spin bicycles)
  {
    id: '6aee1804dd520c7ea4f6d8d1',
    imageUrl: 'https://images.unsplash.com/photo-1600881333168-2ef49b341f30?auto=format&fit=crop&w=800&q=80'
  },
  // 27. Ballistic Commuter Daypack (was gym duffel showing backpack)
  {
    id: '6aee1804dd520c7ea4f6d8d3',
    title: 'Weatherproof Ballistic Commuter Daypack (24L)',
    description: 'Minimalist urban laptop backpack built from 1680D ballistic nylon with padded 16-inch laptop compartment and ergonomic ventilated back panel.'
  },
  // 28. Resistance Bands (was barbell squat powerlifter)
  {
    id: '6aee1804dd520c7ea4f6d8d5',
    imageUrl: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=800&q=80'
  },
  // 29. Scented Candle (was hiker with backpack)
  {
    id: '6aee1804dd520c7ea4f6d8d7',
    imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80'
  },
  // 30. Botanical Beard Oil (was chemistry vials)
  {
    id: '6aee1804dd520c7ea4f6d8d9',
    imageUrl: 'https://images.unsplash.com/photo-1608248597359-00989e2467d1?auto=format&fit=crop&w=800&q=80'
  },
  // 31. Reed Diffuser (was dropper bottle)
  {
    id: '6aee1804dd520c7ea4f6d8db',
    imageUrl: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80'
  },
  // 32. Brass Incense Vessel (was living room furniture)
  {
    id: '6aee1804dd520c7ea4f6d8dd',
    imageUrl: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&w=800&q=80'
  },
  // 33. Botanical Skincare Set (was room spray showing Estee Lauder cosmetics)
  {
    id: '6aee1804dd520c7ea4f6d8df',
    title: 'Luxury Botanical Skincare & Recovery Serum Set',
    description: 'Comprehensive multi-step facial care ritual featuring gentle purifying foam cleanser, energizing gel moisturizer, and jade facial roller.'
  },
  // 34. Desktop Duster Brush (was gallery picture frames)
  {
    id: '6aee1804dd520c7ea4f6d8e1',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
  },
  // 35. Brass Architect Ruler (was 404)
  {
    id: '6aee1804dd520c7ea4f6d8e3',
    imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80'
  },
  // 36. Terracotta Vessel (was Chanel N°5 perfume)
  {
    id: '6aee1804dd520c7ea4f6d8e5',
    imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80'
  },
  // 37. Test Item: ANC Headphones (was smartwatch)
  {
    id: '6aee184ebb57a4ffa51567ad',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
  },
  // 38. Test Item: Clean Code Book (was smartwatch)
  {
    id: '6aee184ebb57a4ffa51567b6',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
  }
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cartiva');
  const Product = require('../models/Product');
  console.log(`Starting execution of ${corrections.length} product corrections in live MongoDB...`);
  
  let updatedCount = 0;
  for (const c of corrections) {
    const updateData = {};
    if (c.title) updateData.title = c.title;
    if (c.description) updateData.description = c.description;
    if (c.imageUrl) updateData.imageUrl = c.imageUrl;
    
    const doc = await Product.findByIdAndUpdate(c.id, { $set: updateData }, { new: true });
    if (doc) {
      updatedCount++;
      console.log(`✅ [UPDATED] ID: ${c.id} => "${doc.title}" | Image: ${doc.imageUrl}`);
    } else {
      console.warn(`⚠️ [NOT FOUND] ID: ${c.id}`);
    }
  }
  
  console.log(`\n🎉 Successfully updated ${updatedCount} / ${corrections.length} live products in MongoDB.`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Fatal error during correction:', err);
  process.exit(1);
});
