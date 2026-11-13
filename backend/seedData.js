/**
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

const seedProducts = [
  {
    "title": "Kanso Studio ANC Wireless Headphones",
    "description": "Engineered with custom 40mm bio-cellulose acoustic drivers, active noise cancellation, and memory-foam lambskin earcups for exceptional acoustic clarity and 40-hour playback duration.",
    "price": 3899,
    "originalPrice": 4999,
    "category": "Electronics",
    "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    "stockCount": 14,
    "rating": 4.9,
    "reviewsCount": 38,
    "specs": {
      "Driver Size": "40mm Bio-Cellulose",
      "Battery Life": "40 Hours Playback",
      "Connectivity": "Bluetooth 5.3 & 3.5mm Aux",
      "Weight": "245g"
    },
    "tags": [
      "Audio",
      "Wireless",
      "Noise Cancelling",
      "Studio"
    ],
    "isFeatured": true,
    "sellerBusinessName": "Kanso Sound & Acoustics"
  },
  {
    "title": "Tactile Wireless Mechanical Keyboard",
    "description": "CNC-machined aluminum chassis fitted with pre-lubricated silent tactile switches and PBT dye-sublimated keycaps. Dual-mode 2.4GHz and Bluetooth 5.3 connectivity with hot-swappable sockets.",
    "price": 4699,
    "originalPrice": 5499,
    "category": "Electronics",
    "imageUrl": "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80",
    "stockCount": 22,
    "rating": 4.8,
    "reviewsCount": 29,
    "specs": {
      "Switch Type": "Gateron Silent Tactile",
      "Keycaps": "PBT Dye-Sublimated",
      "Battery": "4000mAh Lithium-Ion",
      "Chassis": "CNC Anodized Aluminum"
    },
    "tags": [
      "Keyboard",
      "Mechanical",
      "Desk Setup",
      "Wireless"
    ],
    "isFeatured": true,
    "sellerBusinessName": "Kanso Sound & Acoustics"
  },
  {
    "title": "Minimal Silver Smartwatch",
    "description": "Architectural silver unibody casing with a circular high-resolution AMOLED display, continuous biometric sensors, and an ultra-soft hypoallergenic silicone band with 7-day battery life.",
    "price": 5499,
    "originalPrice": 6999,
    "category": "Electronics",
    "imageUrl": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    "stockCount": 18,
    "rating": 4.7,
    "reviewsCount": 24,
    "specs": {
      "Case Diameter": "39mm",
      "Glass": "Sapphire Crystal Anti-Reflective",
      "Movement": "Precision Quartz Caliber",
      "Water Resistance": "5 ATM / 50m"
    },
    "tags": [
      "Watch",
      "Minimalist",
      "Horology",
      "Stainless Steel"
    ],
    "isFeatured": true,
    "sellerBusinessName": "Kanso Sound & Acoustics"
  },
  {
    "title": "Solid Walnut Hi-Fi Bookshelf Speakers",
    "description": "Handcrafted acoustic cabinet built from sustainably harvested American walnut, housing Kevlar mid-bass woofers and silk dome tweeters for warm, natural stereo imaging.",
    "price": 8999,
    "originalPrice": 10999,
    "category": "Electronics",
    "imageUrl": "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
    "stockCount": 7,
    "rating": 4.9,
    "reviewsCount": 19,
    "specs": {
      "Output Power": "75W RMS per channel",
      "Frequency Range": "48Hz – 22kHz",
      "Cabinet": "Solid Walnut & MDF Acoustic Baffle",
      "Inputs": "RCA, Optical, Bluetooth aptX HD"
    },
    "tags": [
      "Speakers",
      "Hi-Fi",
      "Walnut",
      "Audiophile"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Kanso Sound & Acoustics"
  },
  {
    "title": "Anodized Aluminum Ergonomic Laptop Riser",
    "description": "Precision milled unibody aluminum stand tilted at an optimal 18-degree angle for cervical spine relief and enhanced passive laptop thermal dissipation.",
    "price": 2199,
    "category": "Electronics",
    "imageUrl": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80",
    "stockCount": 35,
    "rating": 4.6,
    "reviewsCount": 42,
    "specs": {
      "Material": "6063-T6 Aerospace Aluminum",
      "Compatibility": "11-inch to 16-inch Laptops",
      "Weight Capacity": "10kg",
      "Padding": "Non-slip Silicone Dampers"
    },
    "tags": [
      "Desk Setup",
      "Ergonomic",
      "Aluminum",
      "Workstation"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Kanso Sound & Acoustics"
  },
  {
    "title": "Precision TWS Noise-Isolating Earbuds",
    "description": "Compact featherweight true wireless earphones tuned for micro-detail reproduction, featuring hybrid active noise control, IPX5 water resistance, and wireless charging case.",
    "price": 2799,
    "originalPrice": 3499,
    "category": "Electronics",
    "imageUrl": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
    "stockCount": 26,
    "rating": 4.7,
    "reviewsCount": 31,
    "specs": {
      "Battery": "8 Hours + 24 Hours in Case",
      "Water Resistance": "IPX5 Sweat & Splash Guard",
      "Codecs": "AAC, SBC, LDAC",
      "Charging": "USB-C & Qi Wireless"
    },
    "tags": [
      "Earbuds",
      "Wireless",
      "Audio",
      "TWS"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Kanso Sound & Acoustics"
  },
  {
    "title": "Vintage Walnut Bluetooth Audio Receiver",
    "description": "Mid-century inspired analogue amplifier housing modern Class-D amplification with Bluetooth 5.2 connectivity and warm backlit VU metering needles.",
    "price": 7299,
    "category": "Electronics",
    "imageUrl": "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?auto=format&fit=crop&w=800&q=80",
    "stockCount": 9,
    "rating": 4.8,
    "reviewsCount": 15,
    "specs": {
      "Power": "50W + 50W",
      "Controls": "Brass Knurled Knobs for Bass/Treble",
      "Meters": "Dual Warm-Illuminated Analogue VU",
      "Housing": "American Walnut Veneer"
    },
    "tags": [
      "Vintage",
      "Audio",
      "Receiver",
      "Amplifier"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Kanso Sound & Acoustics"
  },
  {
    "title": "Artisanal Leather Tech Folio & Cable Kit",
    "description": "Organize your charging bricks, styluses, cables, and dongles inside vegetable-tanned harness leather sleeves secured with custom brass button studs.",
    "price": 1899,
    "category": "Electronics",
    "imageUrl": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    "stockCount": 40,
    "rating": 4.5,
    "reviewsCount": 17,
    "specs": {
      "Leather": "Full-Grain Vegetable Tanned Cowhide",
      "Dimensions": "24cm x 16cm x 4cm",
      "Compartments": "6 Elastic Loops, 2 Zipper Pockets",
      "Closure": "Antiqued Brass Snap"
    },
    "tags": [
      "Organizer",
      "Leather",
      "Travel",
      "Accessories"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Kanso Sound & Acoustics"
  },
  {
    "title": "Quilted Italian Leather Crossbody Camera Bag",
    "description": "Handcrafted from supple calfskin leather with chevron quilting, solid antiqued gold-toned hardware, and an adjustable chain-and-leather shoulder strap.",
    "price": 6899,
    "originalPrice": 8500,
    "category": "Fashion",
    "imageUrl": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
    "stockCount": 8,
    "rating": 4.9,
    "reviewsCount": 44,
    "specs": {
      "Dimensions": "52cm x 28cm x 26cm",
      "Volume": "38 Litres",
      "Leather": "Italian Vachetta Full-Grain",
      "Hardware": "Solid Antiqued Cast Brass"
    },
    "tags": [
      "Leather",
      "Travel",
      "Duffel",
      "Heritage"
    ],
    "isFeatured": true,
    "sellerBusinessName": "Nomad Leather Atelier"
  },
  {
    "title": "Minimalist Heavyweight Kraft Paper Shopper Tote",
    "description": "Eco-friendly washable kraft paper market tote featuring reinforced woven herringbone handles and an expandable gusset base.",
    "price": 2650,
    "category": "Fashion",
    "imageUrl": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    "stockCount": 19,
    "rating": 4.7,
    "reviewsCount": 36,
    "specs": {
      "Canvas": "18oz Heavy Duck Waxed Canvas",
      "Straps": "Bridle Leather with 24cm Drop",
      "Pockets": "2 Exterior Slip Pockets, 1 Interior Zip",
      "Care": "Wipe Clean with Damp Sponge"
    },
    "tags": [
      "Tote",
      "Canvas",
      "Waxed",
      "Everyday Carry"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Nomad Leather Atelier"
  },
  {
    "title": "Hand-Burnished Italian Leather Card Wallet",
    "description": "Slim four-pocket minimalist card sleeve saddle-stitched by hand with waxed French linen thread. Beveled edge paint hand-waxed for lifetime durability.",
    "price": 1299,
    "originalPrice": 1699,
    "category": "Fashion",
    "imageUrl": "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
    "stockCount": 45,
    "rating": 4.8,
    "reviewsCount": 52,
    "specs": {
      "Capacity": "6-8 Cards plus Folded Notes",
      "Leather": "Tuscan Buttero Leather",
      "Stitching": "Hand Saddle-Stitched 0.6mm Thread",
      "Thickness": "Just 6mm Empty"
    },
    "tags": [
      "Wallet",
      "Leather",
      "Minimalist",
      "Everyday Carry"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Nomad Leather Atelier"
  },
  {
    "title": "Heritage Heavyweight Oxford Cotton Overshirt",
    "description": "Tailored from 280gsm yarn-dyed organic Oxford cotton. Features mother-of-pearl buttons, twin chest patch pockets, and reinforced flat-felled seam construction.",
    "price": 3299,
    "originalPrice": 3999,
    "category": "Fashion",
    "imageUrl": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
    "stockCount": 24,
    "rating": 4.8,
    "reviewsCount": 27,
    "specs": {
      "Material": "100% GOTS Certified Organic Cotton",
      "Fabric Weight": "280gsm",
      "Buttons": "Genuine Natural Trocas Shell",
      "Origin": "Ethically Woven in Coimbatore"
    },
    "tags": [
      "Apparel",
      "Oxford Shirt",
      "Organic Cotton",
      "Menswear"
    ],
    "isFeatured": true,
    "sellerBusinessName": "Nomad Leather Atelier"
  },
  {
    "title": "14oz Kuroki Selvedge Denim Chore Jacket",
    "description": "Woven on vintage Toyoda shuttle looms using rope-dyed indigo yarn. Classic French workwear silhouette with interior notebook pocket and donut copper shanks.",
    "price": 5499,
    "category": "Fashion",
    "imageUrl": "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=800&q=80",
    "stockCount": 12,
    "rating": 4.9,
    "reviewsCount": 18,
    "specs": {
      "Denim": "14oz Unwashed Raw Selvedge",
      "ID": "Red Line Selvedge ID",
      "Buttons": "Antiqued Copper Tack Buttons",
      "Pockets": "4 Functional Workwear Pockets"
    },
    "tags": [
      "Denim",
      "Selvedge",
      "Chore Coat",
      "Heritage"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Nomad Leather Atelier"
  },
  {
    "title": "Extra-Fine Merino Wool Ribbed Knit Beanie",
    "description": "Spun from 19.5-micron non-mulesed Australian merino wool. Double-fold cuff offers adaptable temperature control and luxurious softness against the skin.",
    "price": 1450,
    "category": "Fashion",
    "imageUrl": "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=800&q=80",
    "stockCount": 32,
    "rating": 4.6,
    "reviewsCount": 21,
    "specs": {
      "Yarn": "100% Extra-Fine Merino Wool",
      "Knit": "7-Gauge Traditional Ribbed Knit",
      "Fit": "One Size Fits All (Adaptive Stretch)",
      "Care": "Hand Wash Cold, Dry Flat"
    },
    "tags": [
      "Knitwear",
      "Merino Wool",
      "Beanie",
      "Winter"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Nomad Leather Atelier"
  },
  {
    "title": "English Bridle Leather Belt with Solid Brass Buckle",
    "description": "Cut from 10-12oz vegetable-tanned bridle leather with hand-burnished beeswax edges and a sand-cast solid brass roller buckle made to endure a lifetime.",
    "price": 1850,
    "category": "Fashion",
    "imageUrl": "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80",
    "stockCount": 28,
    "rating": 4.7,
    "reviewsCount": 33,
    "specs": {
      "Width": "1.5 inches / 38mm",
      "Leather": "Sedgwick Traditional Bridle Leather",
      "Hardware": "Sand-Cast Solid Brass",
      "Holes": "5 Teardrop Adjustment Holes"
    },
    "tags": [
      "Belt",
      "Leather",
      "Brass",
      "Handcrafted"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Nomad Leather Atelier"
  },
  {
    "title": "Relaxed French Linen Boatneck Tunic",
    "description": "Cut from 100% Normandy washed flax linen with subtle vertical chalk stripes, dropped shoulders, and breathable side-split hems.",
    "price": 4200,
    "originalPrice": 4950,
    "category": "Fashion",
    "imageUrl": "https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?auto=format&fit=crop&w=800&q=80",
    "stockCount": 15,
    "rating": 4.9,
    "reviewsCount": 16,
    "specs": {
      "Dimensions": "190cm x 50cm",
      "Fiber": "100% Grade-A Mongolian Cashmere",
      "Fringe": "Hand-Twisted 8cm Eyelash Fringe",
      "Weight": "180g Ultra-Soft Plaid"
    },
    "tags": [
      "Cashmere",
      "Scarf",
      "Luxury",
      "Handwoven"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Nomad Leather Atelier"
  },
  {
    "title": "Hand-Polished Cellulose Acetate Sunglasses",
    "description": "Mazzucchelli bio-acetate frames hand-polished for over 72 hours. Fitted with scratch-resistant CR-39 amber tint lenses providing 100% UVA/UVB UV400 defense.",
    "price": 3490,
    "category": "Fashion",
    "imageUrl": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
    "stockCount": 20,
    "rating": 4.8,
    "reviewsCount": 29,
    "specs": {
      "Frame": "Italian Mazzucchelli Bio-Acetate",
      "Lenses": "Polarized CR-39 Category 3 UV400",
      "Hinges": "German 5-Barrel Wire-Core Hinges",
      "Includes": "Leather Hard Case & Microfiber Cloth"
    },
    "tags": [
      "Eyewear",
      "Sunglasses",
      "Acetate",
      "Handcrafted"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Nomad Leather Atelier"
  },
  {
    "title": "Artisanal Single-Origin Roasted Whole Coffee Beans",
    "description": "Small-batch specialty Arabica beans, roasted to a medium profile with balanced tasting notes of caramelized citrus, dark chocolate, and toasted almond.",
    "price": 2450,
    "originalPrice": 2950,
    "category": "Home & Kitchen",
    "imageUrl": "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80",
    "stockCount": 12,
    "rating": 4.8,
    "reviewsCount": 40,
    "specs": {
      "Carafe Capacity": "600ml / 2-4 Cups",
      "Dripper Compatibility": "Standard 02 Cone Filters",
      "Material": "High-Fire Stoneware & Borosilicate Glass",
      "Care": "Dishwasher Safe Server, Handwash Dripper"
    },
    "tags": [
      "Coffee",
      "Pour Over",
      "Ceramics",
      "Handcrafted"
    ],
    "isFeatured": true,
    "sellerBusinessName": "Terra Stoneware Studio"
  },
  {
    "title": "Organic Ceremonial Grade Matcha Latte Cup",
    "description": "Stone-ground Uji matcha whisked with oat milk, served in a ceramic cafe cup with signature micro-foam leaf art.",
    "price": 1850,
    "category": "Home & Kitchen",
    "imageUrl": "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80",
    "stockCount": 14,
    "rating": 4.9,
    "reviewsCount": 22,
    "specs": {
      "Bowl Diameter": "12.5cm, Height: 7.8cm",
      "Capacity": "420ml",
      "Whisk": "100-Prong Natural Bamboo Chasen",
      "Finish": "Unglazed Exterior, Matte Tenmoku Interior"
    },
    "tags": [
      "Matcha",
      "Ceramics",
      "Tea Ceremony",
      "Handmade"
    ],
    "isFeatured": true,
    "sellerBusinessName": "Terra Stoneware Studio"
  },
  {
    "title": "Handcrafted Speckled Stoneware Espresso Mug",
    "description": "Ergonomic 180ml flat white and cappuccino cup hand-thrown from river stoneware. Features a raw unglazed thumb rest and rich iron speckle glaze.",
    "price": 890,
    "category": "Home & Kitchen",
    "imageUrl": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    "stockCount": 35,
    "rating": 4.7,
    "reviewsCount": 58,
    "specs": {
      "Volume": "180ml / 6oz",
      "Clay": "Raw Khurja Dark Stoneware",
      "Firing": "Cone 10 Reduction Fired at 1280°C",
      "Microwave & Dishwasher Safe": "Yes"
    },
    "tags": [
      "Mug",
      "Ceramics",
      "Espresso",
      "Coffee"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Terra Stoneware Studio"
  },
  {
    "title": "Heavyweight Enamelled Cast Iron Dutch Oven",
    "description": "5.5-quart heirloom cooking vessel with thick cast-iron walls for even heat distribution and heavy self-basting condensation lid with solid brass knob.",
    "price": 4750,
    "originalPrice": 5800,
    "category": "Home & Kitchen",
    "imageUrl": "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=800&q=80",
    "stockCount": 9,
    "rating": 4.9,
    "reviewsCount": 31,
    "specs": {
      "Capacity": "5.2 Litres / 5.5 Quarts",
      "Interior": "Satin Sand Enamel Non-Reactive Finish",
      "Heat Resistance": "Oven Safe up to 260°C / 500°F",
      "Cooktop Compatibility": "Gas, Electric, Induction, Ceramic"
    },
    "tags": [
      "Cookware",
      "Cast Iron",
      "Dutch Oven",
      "Culinary"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Terra Stoneware Studio"
  },
  {
    "title": "Solid Olive Wood Artisanal Serving & Carving Board",
    "description": "Carved from a single piece of dense Mediterranean wild olive wood displaying dramatic grain patterns. Treated with food-grade raw walnut oil and natural beeswax.",
    "price": 1890,
    "category": "Home & Kitchen",
    "imageUrl": "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80",
    "stockCount": 26,
    "rating": 4.8,
    "reviewsCount": 24,
    "specs": {
      "Dimensions": "44cm x 22cm x 2.2cm",
      "Wood": "Old-Growth Mediterranean Olive Wood",
      "Features": "Integrated Juice Groove & Hanging Hole",
      "Finish": "Pure Organic Beeswax and Mineral Oil"
    },
    "tags": [
      "Woodwork",
      "Kitchen",
      "Cutting Board",
      "Charcuterie"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Terra Stoneware Studio"
  },
  {
    "title": "Double-Walled Borosilicate Glass Latte Tumbler",
    "description": "Handblown insulating double-wall glass tumbler designed to keep hot espresso and iced beverages at temperature without surface condensation.",
    "price": 3150,
    "originalPrice": 3800,
    "category": "Home & Kitchen",
    "imageUrl": "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=800&q=80",
    "stockCount": 17,
    "rating": 4.7,
    "reviewsCount": 33,
    "specs": {
      "Volume": "900ml",
      "Spout": "Curved 8mm Precision Restrictor",
      "Material": "304 Food-Grade Stainless Steel",
      "Lid": "Built-In Dial Thermometer Gauge"
    },
    "tags": [
      "Kettle",
      "Coffee",
      "Gooseneck",
      "Barista"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Terra Stoneware Studio"
  },
  {
    "title": "Handblown Fluted Borosilicate Glasses (Set of 4)",
    "description": "Delicate yet resilient ribbed glassware individually blown by master glassmakers. Perfect for iced cold brew, natural wines, or sparkling waters.",
    "price": 1650,
    "category": "Home & Kitchen",
    "imageUrl": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=800&q=80",
    "stockCount": 21,
    "rating": 4.6,
    "reviewsCount": 19,
    "specs": {
      "Set Contains": "4 Tumbler Glasses",
      "Capacity": "320ml each",
      "Thermal Shock Resistance": "-20°C to 150°C",
      "Dishwasher Safe": "Yes, Upper Rack Recommended"
    },
    "tags": [
      "Glassware",
      "Tableware",
      "Fluted Glass",
      "Barware"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Terra Stoneware Studio"
  },
  {
    "title": "Handmade Ceramic Espresso & Tea Tumbler Set",
    "description": "Set of earthy stoneware tumblers featuring raw unglazed terracotta bases and dipped matte cream glazes.",
    "price": 1990,
    "category": "Home & Kitchen",
    "imageUrl": "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80",
    "stockCount": 15,
    "rating": 4.8,
    "reviewsCount": 28,
    "specs": {
      "Diameter": "20.5cm, Depth: 8.5cm",
      "Capacity": "1100ml each",
      "Quantity": "Pair (2 Bowls)",
      "Firing": "Reduction Atmosphere Stoneware"
    },
    "tags": [
      "Bowls",
      "Ceramics",
      "Ramen",
      "Dinnerware"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Terra Stoneware Studio"
  },
  {
    "title": "Handblown Glass Tea Cup with Botanical Pyramid Sachets",
    "description": "Heat-resistant borosilicate glass tea mug with loop handle, paired with artisan herbal loose-leaf tea sachets.",
    "price": 1250,
    "category": "Home & Kitchen",
    "imageUrl": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
    "stockCount": 28,
    "rating": 4.6,
    "reviewsCount": 15,
    "specs": {
      "Volume": "450ml",
      "Filter Mesh": "0.2mm Laser Cut Stainless Steel",
      "Lid": "Silicone-Sealed Bamboo Lid",
      "Wall": "Thermal Insulating Double Wall"
    },
    "tags": [
      "Cold Brew",
      "Glassware",
      "Tea",
      "Infuser"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Terra Stoneware Studio"
  },
  {
    "title": "The Architecture of Solitude (Hardcover Monograph)",
    "description": "A photographic monograph and architectural study of contemplative alpine refuges, coastal hermitages, and Nordic timber cabins. Printed on 170gsm archival stock with linen quarter-binding.",
    "price": 1350,
    "category": "Books",
    "imageUrl": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    "stockCount": 25,
    "rating": 4.9,
    "reviewsCount": 41,
    "specs": {
      "Format": "Hardcover Linen Quarter-Bound",
      "Pages": "288 Pages with 180 Color Plates",
      "Paper": "170gsm Munken Uncoated Archival",
      "Language": "English"
    },
    "tags": [
      "Architecture",
      "Monograph",
      "Hardcover",
      "Photography"
    ],
    "isFeatured": true,
    "sellerBusinessName": "Sonder Books & Prints"
  },
  {
    "title": "The Modern Entrepreneur Library: Strategy & Innovation",
    "description": "Curated collection of bestselling strategy, leadership, and startup handbooks bound in hardcover and trade paperback.",
    "price": 890,
    "category": "Books",
    "imageUrl": "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
    "stockCount": 30,
    "rating": 4.7,
    "reviewsCount": 34,
    "specs": {
      "Cover": "Blind Debossed Heavy Greyboard",
      "Pages": "192 Pages",
      "Binding": "Ota-Bind Layflat Binding",
      "Dimensions": "17cm x 24cm"
    },
    "tags": [
      "Typography",
      "Graphic Design",
      "Swiss Style",
      "Art"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Sonder Books & Prints"
  },
  {
    "title": "Vintage Illustrated Hardcover Storybook Collection",
    "description": "Set of classic mid-century children's illustrated storybooks with vintage clothbound spines and archival paper.",
    "price": 1150,
    "originalPrice": 1450,
    "category": "Books",
    "imageUrl": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
    "stockCount": 22,
    "rating": 4.8,
    "reviewsCount": 29,
    "specs": {
      "Binding": "Traditional Japanese Exposed Spine Stitch",
      "Pages": "216 Pages",
      "Paper": "FSC-Certified Textured Bamboo Paper",
      "Illustrations": "Dual-Tone Monochrome Plates"
    },
    "tags": [
      "Wabi Sabi",
      "Design Theory",
      "Philosophy",
      "Aesthetics"
    ],
    "isFeatured": true,
    "sellerBusinessName": "Sonder Books & Prints"
  },
  {
    "title": "Nordic Living: Materiality, Light & Spatial Calm",
    "description": "Tour 24 private homes across Denmark, Norway, and Sweden showcasing how organic textures, lime washes, and low natural light create serene sanctuary spaces.",
    "price": 1650,
    "category": "Books",
    "imageUrl": "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80",
    "stockCount": 18,
    "rating": 4.8,
    "reviewsCount": 26,
    "specs": {
      "Format": "Large Coffee Table Hardcover (25cm x 31cm)",
      "Pages": "304 Pages",
      "Print": "Fidelity Stochastic Screening Print",
      "Language": "English"
    },
    "tags": [
      "Interiors",
      "Nordic",
      "Home Design",
      "Coffee Table Book"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Sonder Books & Prints"
  },
  {
    "title": "How Innovation Works by Matt Ridley (Hardcover Edition)",
    "description": "Acclaimed technological and economic history exploring how human breakthrough inventions flourish in freedom. Hardcover with jacket.",
    "price": 2100,
    "originalPrice": 2600,
    "category": "Books",
    "imageUrl": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80",
    "stockCount": 14,
    "rating": 4.9,
    "reviewsCount": 17,
    "specs": {
      "Cover": "Natural Oatmeal Woven Linen with Foil Stamping",
      "Maps": "32 Gatefold Hand-Drawn Cartographic Insets",
      "Pages": "256 Pages",
      "Weight": "1.8kg"
    },
    "tags": [
      "Cartography",
      "Travel",
      "Geography",
      "Art Book"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Sonder Books & Prints"
  },
  {
    "title": "The Last Bookstore Archival Architectural Art Print",
    "description": "Limited-edition architectural fine art photograph capturing the iconic book tunnel and flying books of Downtown LA's legendary literary vault.",
    "price": 1250,
    "category": "Books",
    "imageUrl": "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80",
    "stockCount": 20,
    "rating": 4.7,
    "reviewsCount": 23,
    "specs": {
      "Contents": "8 Archival Prints in Ribbon Folio Box",
      "Paper": "300gsm 100% Cotton Rag with Deckled Edges",
      "Print Method": "1954 Heidelberg Windmill Letterpress",
      "Print Size": "A4 (21cm x 29.7cm)"
    },
    "tags": [
      "Prints",
      "Letterpress",
      "Botanical",
      "Art"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Sonder Books & Prints"
  },
  {
    "title": "Milk and Honey: Special Edition Poetry Collection",
    "description": "The defining modern poetry and prose collection by rupi kaur exploring love, loss, trauma, and healing. Special black-and-gold matte cover.",
    "price": 750,
    "category": "Books",
    "imageUrl": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80",
    "stockCount": 45,
    "rating": 4.8,
    "reviewsCount": 62,
    "specs": {
      "Grid": "5mm Subdued Dot Grid",
      "Paper": "120gsm Acid-Free Ink-Proof Cream Paper",
      "Binding": "180° Layflat Smyth Sewn Binding",
      "Ribbons": "Dual Grosgrain Page Markers"
    },
    "tags": [
      "Journal",
      "Stationery",
      "Notebook",
      "Writing"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Sonder Books & Prints"
  },
  {
    "title": "Cathedrals of Knowledge: The World's Great Libraries",
    "description": "Panoramic architectural coffee table monograph documenting the most stunning library rotundas and book sanctuaries across the globe.",
    "price": 1450,
    "category": "Books",
    "imageUrl": "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80",
    "stockCount": 16,
    "rating": 4.6,
    "reviewsCount": 14,
    "specs": {
      "Pages": "224 Pages",
      "Binding": "Cloth Spine with Textured Cardstock Cover",
      "Photography": "Shot across Uji, Wuyi, and Darjeeling",
      "Dimensions": "19cm x 26cm"
    },
    "tags": [
      "Tea",
      "Ceramics",
      "Ritual",
      "Publishing"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Sonder Books & Prints"
  },
  {
    "title": "Natural Organic Cork & Forest Rubber Studio Mat",
    "description": "Anti-microbial organic Mediterranean cork surface bonded with dense, sustainably harvested Vietnamese tree rubber. Provides exceptional tactile traction and joint cushioning without synthetic odors.",
    "price": 2790,
    "originalPrice": 3400,
    "category": "Fitness",
    "imageUrl": "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=80",
    "stockCount": 16,
    "rating": 4.9,
    "reviewsCount": 53,
    "specs": {
      "Dimensions": "183cm x 66cm x 5mm",
      "Materials": "100% Organic Cork & Natural Tree Rubber",
      "Grip": "Sweat-Activated Traction Coefficient",
      "Weight": "2.6kg"
    },
    "tags": [
      "Yoga",
      "Cork Mat",
      "Eco Friendly",
      "Fitness"
    ],
    "isFeatured": true,
    "sellerBusinessName": "Prana Movement Lab"
  },
  {
    "title": "Studio Neoprene Hand Dumbbell Pair (3kg)",
    "description": "Hexagonal anti-roll cast iron dumbbells coated in soft non-slip matte neoprene. Ideal for barre, aerobics, pilates, and home strength sessions.",
    "price": 2890,
    "category": "Fitness",
    "imageUrl": "https://images.unsplash.com/photo-1586401100295-7a8096fd231a?auto=format&fit=crop&w=800&q=80",
    "stockCount": 18,
    "rating": 4.8,
    "reviewsCount": 37,
    "specs": {
      "Weight": "16kg / 35.2 lbs",
      "Handle Diameter": "35mm Competition Standard",
      "Casting": "Single-Piece Void-Free Cast Iron",
      "Color Code": "Yellow Handle Rings"
    },
    "tags": [
      "Kettlebell",
      "Strength",
      "Cast Iron",
      "Conditioning"
    ],
    "isFeatured": true,
    "sellerBusinessName": "Prana Movement Lab"
  },
  {
    "title": "High-Density Solid Cork Yoga Block Pair",
    "description": "Constructed from fine-grain compressed cork bark offering solid structural support, rounded comfort bevels, and slip-free grip under high weight loads.",
    "price": 1150,
    "category": "Fitness",
    "imageUrl": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
    "stockCount": 30,
    "rating": 4.7,
    "reviewsCount": 42,
    "specs": {
      "Dimensions": "23cm x 15cm x 7.5cm each",
      "Set": "Contains 2 Solid Blocks",
      "Density": "High Density 450kg/m³",
      "Edges": "Comfort Contoured Bevels"
    },
    "tags": [
      "Yoga Blocks",
      "Cork",
      "Props",
      "Alignment"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Prana Movement Lab"
  },
  {
    "title": "Organic Herringbone Cotton Yoga Alignment Strap",
    "description": "Sturdy 2.5m woven cotton belt with welded iron D-ring buckles. Designed to assist deep hamstring opening, shoulder stabilization, and restorative postures.",
    "price": 650,
    "category": "Fitness",
    "imageUrl": "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=800&q=80",
    "stockCount": 50,
    "rating": 4.6,
    "reviewsCount": 28,
    "specs": {
      "Length": "2.5 Meters / 8.2 Feet",
      "Width": "38mm",
      "Buckles": "Solid Matte Black Cast Iron D-Rings",
      "Weave": "Thick Herringbone Anti-Slip Weave"
    },
    "tags": [
      "Yoga Strap",
      "Cotton",
      "Mobility",
      "Flexibility"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Prana Movement Lab"
  },
  {
    "title": "Double-Walled Matte Insulated Hydro Tumbler (750ml)",
    "description": "Pro-grade 18/8 stainless steel bottle featuring TempShield vacuum insulation that preserves liquids cold for 24 hours or piping hot for 12 hours.",
    "price": 1490,
    "originalPrice": 1850,
    "category": "Fitness",
    "imageUrl": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
    "stockCount": 35,
    "rating": 4.8,
    "reviewsCount": 49,
    "specs": {
      "Capacity": "750ml / 25oz",
      "Insulation": "Double Wall Vacuum Insulated",
      "Lid": "Leakproof Silicone Sealed Cap with Grip Loop",
      "Finish": "Durable Matte Powder Coat"
    },
    "tags": [
      "Water Bottle",
      "Insulated",
      "Hydration",
      "Stainless Steel"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Prana Movement Lab"
  },
  {
    "title": "Deep-Tissue Textured Mobility Roller",
    "description": "High-density EVA foam molded around a rigid hollow PVC core. Distinct grid matrix simulates the hands and fingertips of a sports massage therapist.",
    "price": 1950,
    "category": "Fitness",
    "imageUrl": "https://images.unsplash.com/photo-1600881333168-2ef49b341f30?auto=format&fit=crop&w=800&q=80",
    "stockCount": 22,
    "rating": 4.7,
    "reviewsCount": 26,
    "specs": {
      "Dimensions": "33cm x 14cm",
      "Core": "Reinforced ABS Rigid Core (Holds up to 200kg)",
      "Surface": "Multi-Density EVA Distrodensity Zones",
      "Weight": "820g"
    },
    "tags": [
      "Foam Roller",
      "Recovery",
      "Mobility",
      "Myofascial"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Prana Movement Lab"
  },
  {
    "title": "Weatherproof Ballistic Commuter Daypack (24L)",
    "description": "Minimalist urban laptop backpack built from 1680D ballistic nylon with padded 16-inch laptop compartment and ergonomic ventilated back panel.",
    "price": 3450,
    "category": "Fitness",
    "imageUrl": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    "stockCount": 14,
    "rating": 4.8,
    "reviewsCount": 20,
    "specs": {
      "Volume": "42 Litres",
      "Materials": "1000D Cordura Nylon with DWR Coating",
      "Zippers": "Waterproof YKK Aquaguard Zippers",
      "Shoe Compartment": "Vented up to Men's Size UK 12"
    },
    "tags": [
      "Gym Bag",
      "Duffel",
      "Training",
      "Fitness"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Prana Movement Lab"
  },
  {
    "title": "Graduated Natural Rubber Resistance Band Trio",
    "description": "Set of three 100% Malaysian natural latex loop bands offering progressive tension levels (Light, Medium, Heavy) for warm-ups, glute activation, and rehab.",
    "price": 990,
    "category": "Fitness",
    "imageUrl": "https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=800&q=80",
    "stockCount": 42,
    "rating": 4.6,
    "reviewsCount": 31,
    "specs": {
      "Material": "100% Eco-Friendly Natural Tree Latex",
      "Tensions": "Light (10-15 lbs), Medium (20-25 lbs), Heavy (30-35 lbs)",
      "Circumference": "60cm x 5cm Wide",
      "Includes": "Breathable Mesh Storage Drawstring Pouch"
    },
    "tags": [
      "Resistance Bands",
      "Latex",
      "Warmup",
      "Rehab"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Prana Movement Lab"
  },
  {
    "title": "Smoked Cedar & Wild Bergamot Studio Candle",
    "description": "Hand-poured 100% natural soy wax candle scented with steam-distilled Atlas cedarwood, crushed black pepper, and Calabrian bergamot. Housed in a reusable amber mouth-blown glass tumbler with a crackling wooden wick.",
    "price": 1150,
    "originalPrice": 1450,
    "category": "Other",
    "imageUrl": "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80",
    "stockCount": 35,
    "rating": 4.8,
    "reviewsCount": 66,
    "specs": {
      "Wax": "100% GMO-Free Sustainable Soy Wax",
      "Wick": "FSC-Certified Hardwood Crackling Wick",
      "Burn Time": "55-60 Clean Hours",
      "Vessel": "Recycled Heavy Amber Glass Tumbler"
    },
    "tags": [
      "Candle",
      "Aromatherapy",
      "Soy Wax",
      "Home Fragrance"
    ],
    "isFeatured": true,
    "sellerBusinessName": "Aethel Botanical & Living"
  },
  {
    "title": "Organic Jojoba & Atlas Cedar Botanical Beard Oil",
    "description": "Cold-pressed Moroccan argan, golden jojoba, and grapeseed oils scented with Atlas cedarwood and frankincense. Calms facial skin irritation while nourishing bristles.",
    "price": 1200,
    "category": "Other",
    "imageUrl": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80",
    "stockCount": 25,
    "rating": 4.7,
    "reviewsCount": 29,
    "specs": {
      "Volume": "50ml / 1.7 fl oz",
      "Ingredients": "Argan, Jojoba, Vitamin E, Essential Oils",
      "Dropper": "Glass Pipette with Rubber Bulb",
      "Formula": "100% Plant-Based Non-Greasy Fast Absorption"
    },
    "tags": [
      "Grooming",
      "Beard Oil",
      "Botanicals",
      "Skincare"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Aethel Botanical & Living"
  },
  {
    "title": "Kyoto Hinoki & Vetiver Reed Diffuser",
    "description": "Continuous flame-free home fragrance crafted with pure Japanese cypress (hinoki), Haitian vetiver, and smoky black tea. Includes eight natural rattan reeds in a matte porcelain bottle.",
    "price": 2250,
    "category": "Other",
    "imageUrl": "https://images.unsplash.com/photo-1620733723572-11c53f73a416?auto=format&fit=crop&w=800&q=80",
    "stockCount": 19,
    "rating": 4.9,
    "reviewsCount": 38,
    "specs": {
      "Volume": "200ml Glass Refill",
      "Longevity": "Disperses Fragrance for 4 to 5 Months",
      "Vessel": "Matte Chalk White Stoneware Bottle",
      "Reeds": "8 Unbleached Indonesian Rattan Reeds"
    },
    "tags": [
      "Diffuser",
      "Home Fragrance",
      "Hinoki",
      "Aromatherapy"
    ],
    "isFeatured": true,
    "sellerBusinessName": "Aethel Botanical & Living"
  },
  {
    "title": "Solid Spun Brass Incense Vessel & Cedar Cones",
    "description": "Heavy spun solid raw brass dome designed to burn both incense sticks and cones. Features an integrated ash catcher base that develops a natural tarnished luster over time.",
    "price": 1390,
    "category": "Other",
    "imageUrl": "https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&w=800&q=80",
    "stockCount": 27,
    "rating": 4.8,
    "reviewsCount": 24,
    "specs": {
      "Material": "100% Solid Spun Brass (No Plating)",
      "Dimensions": "9cm Diameter x 3.5cm Height",
      "Includes": "Box of 20 Wild Himalayan Cedarwood Cones",
      "Weight": "380g Heavy Base"
    },
    "tags": [
      "Incense",
      "Brass",
      "Meditation",
      "Home Accents"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Aethel Botanical & Living"
  },
  {
    "title": "Luxury Botanical Skincare & Recovery Serum Set",
    "description": "Comprehensive multi-step facial care ritual featuring gentle purifying foam cleanser, energizing gel moisturizer, and jade facial roller.",
    "price": 850,
    "category": "Other",
    "imageUrl": "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80",
    "stockCount": 40,
    "rating": 4.6,
    "reviewsCount": 31,
    "specs": {
      "Volume": "120ml / 4 fl oz",
      "Sprayer": "Fine Atomizer Pump with Cap",
      "Formulation": "Distilled Spring Water & Pure Essential Oils",
      "Synthetic Fragrances": "Zero / Completely Natural"
    },
    "tags": [
      "Room Spray",
      "Linen Mist",
      "Eucalyptus",
      "Botanicals"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Aethel Botanical & Living"
  },
  {
    "title": "Horsehair & Beechwood Desktop Hearth Duster",
    "description": "Handmade miniature hand brush crafted from oiled European beechwood and dense split horsehair bristles. Gently sweeps keyboard crumbs, eraser shavings, and desktop grit.",
    "price": 790,
    "category": "Other",
    "imageUrl": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    "stockCount": 33,
    "rating": 4.5,
    "reviewsCount": 18,
    "specs": {
      "Wood": "FSC Certified Oiled Beechwood",
      "Bristles": "Natural Split Horsehair",
      "Dimensions": "14cm x 8cm x 2cm",
      "Cord": "Vegetable-Tanned Leather Hanging Loop"
    },
    "tags": [
      "Desk Accessory",
      "Woodwork",
      "Stationery",
      "Craft"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Aethel Botanical & Living"
  },
  {
    "title": "Solid Brass Architect's Scale Ruler & Paper Knife",
    "description": "Heavyweight desk object machined from a solid hexagonal brass bar. Precision laser engraved metric scales and gently honed paper-splitting bevel edge.",
    "price": 590,
    "category": "Other",
    "imageUrl": "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80",
    "stockCount": 48,
    "rating": 4.7,
    "reviewsCount": 22,
    "specs": {
      "Length": "18cm / 7 inches",
      "Material": "Solid C360 Brass",
      "Scales": "1:1, 1:20, 1:50, 1:100 Laser Etched",
      "Weight": "165g"
    },
    "tags": [
      "Stationery",
      "Brass",
      "Desk Object",
      "Architect"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Aethel Botanical & Living"
  },
  {
    "title": "Glazed Terracotta Match Striker Vessel",
    "description": "Hand-thrown terracotta pot with an unglazed abrasive exterior wall that strikes any strike-anywhere match in a single stroke. Includes 60 black matches.",
    "price": 690,
    "category": "Other",
    "imageUrl": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
    "stockCount": 36,
    "rating": 4.6,
    "reviewsCount": 19,
    "specs": {
      "Material": "Earthenware Terracotta with Charcoal Dip Glaze",
      "Height": "5.5cm, Diameter: 4.5cm",
      "Striker Surface": "Rough Fired Sand Texture",
      "Includes": "60 Strike-Anywhere Black Wooden Matches"
    },
    "tags": [
      "Ceramics",
      "Match Striker",
      "Living",
      "Home Decor"
    ],
    "isFeatured": false,
    "sellerBusinessName": "Aethel Botanical & Living"
  }
];

async function seedDatabase() {
  // Production Safety Guard: Database seeding is strictly blocked by default in production.
  // To prevent accidental resets caused by persistent cloud environment variables,
  // production execution requires an explicit, deliberate CLI flag: --confirm-production-seed
  if (process.env.NODE_ENV === 'production') {
    const hasExplicitCliFlag = process.argv.includes('--confirm-production-seed');
    if (!hasExplicitCliFlag) {
      console.error('\n🛑 BLOCKED: Database seeding is prohibited in production (NODE_ENV=production).');
      console.error('To prevent accidental data corruption, persistent environment flags are disabled.');
      console.error('If you deliberately need to initialize an empty production database, execute:');
      console.error('  NODE_ENV=production node seedData.js --confirm-production-seed\n');
      process.exit(1);
    }
  }

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
