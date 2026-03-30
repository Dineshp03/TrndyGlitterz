export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description?: string;
  stock?: number;
  featured?: boolean;
  isImported?: boolean;
  images?: string[]; // Additional images (8+ supported)
}

export const products: Product[] = [
  // --- EARRINGS (10) ---
  {
    id: "ear-1",
    name: "Elegant Pearl Drop",
    price: 45.00,
    category: "Earrings",
    image: "/images/products/1000544821.jpg.jpeg",
    description: "Handcrafted natural pearls with 14k gold finish.",
    stock: 15,
    isImported: true,
    images: ["/images/products/1000544821.jpg.jpeg", "/images/products/1000544990.jpg.jpeg"]
  },
  {
    id: "ear-2",
    name: "Midnight Star Hoops",
    price: 38.00,
    category: "Earrings",
    image: "/images/products/1000544990.jpg.jpeg",
    description: "Deep obsidian crystals set in sterling silver.",
    stock: 8,
    isImported: false
  },
  {
    id: "ear-3",
    name: "Golden Leaf Studs",
    price: 25.00,
    category: "Earrings",
    image: "/images/products/1000545003.jpg.jpeg",
    description: "Intricate leaf design for daily elegance.",
    stock: 20
  },
  {
    id: "ear-4",
    name: "Diamond Halo Studs",
    price: 120.00,
    category: "Earrings",
    image: "/images/products/1000545109.jpg.jpeg",
    description: "Classic halo setting with laboratory-grown diamonds.",
    stock: 5,
    isImported: true
  },
  {
    id: "ear-5",
    name: "Celestial Moon Danglers",
    price: 52.00,
    category: "Earrings",
    image: "/images/products/1000545119.jpg.jpeg",
    description: "Moonstone accents for a mystical glow.",
    stock: 12
  },
  {
    id: "ear-6",
    name: "Emerald Cut Drops",
    price: 75.00,
    category: "Earrings",
    image: "/images/products/1000544821.jpg.jpeg",
    description: "Vibrant faux emeralds in a vintage setting.",
    stock: 10,
    isImported: true
  },
  {
    id: "ear-7",
    name: "Boho Tassel Earrings",
    price: 22.00,
    category: "Earrings",
    image: "/images/products/1000544990.jpg.jpeg",
    description: "Hand-threaded silk tassels for a playful look.",
    stock: 30
  },
  {
    id: "ear-8",
    name: "Chunky Rope Hoops",
    price: 42.00,
    category: "Earrings",
    image: "/images/products/1000545003.jpg.jpeg",
    description: "High-polish twisted rope texture.",
    stock: 18,
    isImported: false
  },
  {
    id: "ear-9",
    name: "Sapphire Dream Studs",
    price: 95.00,
    category: "Earrings",
    image: "/images/products/1000545109.jpg.jpeg",
    description: "Deep blue sapphires for royal appearances.",
    stock: 7,
    isImported: true
  },
  {
    id: "ear-10",
    name: "Geometric Gold Line",
    price: 30.00,
    category: "Earrings",
    image: "/images/products/1000545119.jpg.jpeg",
    description: "Minimalist minimalist design for the modern woman.",
    stock: 25
  },

  // --- RINGS (10) ---
  {
    id: "ring-1",
    name: "Sculptural Gold Band",
    price: 55.00,
    category: "Rings",
    image: "/images/products/1000545242.jpg.jpeg",
    description: "Fluid lines crafted from hammered gold.",
    stock: 12,
    isImported: true
  },
  {
    id: "ring-2",
    name: "Ethereal Opal Ring",
    price: 85.00,
    category: "Rings",
    image: "/images/products/1000545305.jpg.jpeg",
    description: "Fire opals that dance with every movement.",
    stock: 4
  },
  {
    id: "ring-3",
    name: "Stacked Diamond Row",
    price: 150.00,
    category: "Rings",
    image: "/images/products/1000545312.jpg.jpeg",
    description: "Timeless row of brilliant-cut diamonds.",
    stock: 3,
    isImported: true
  },
  {
    id: "ring-4",
    name: "Vintage Ruby Solitaire",
    price: 110.00,
    category: "Rings",
    image: "/images/products/1000545317.jpg.jpeg",
    description: "Art deco inspired setting with a central ruby.",
    stock: 6
  },
  {
    id: "ring-5",
    name: "Serpent Wrap Ring",
    price: 48.00,
    category: "Rings",
    image: "/images/products/1000545322.jpg.jpeg",
    description: "Symbol of eternity in polished brass.",
    stock: 15,
    isImported: false
  },
  {
    id: "ring-6",
    name: "Oceanic Turquoise Ring",
    price: 62.00,
    category: "Rings",
    image: "/images/products/1000545327.jpg.jpeg",
    description: "Raw turquoise stone for a coastal vibe.",
    stock: 9,
    isImported: true
  },
  {
    id: "ring-7",
    name: "Braided Silver Knot",
    price: 35.00,
    category: "Rings",
    image: "/images/products/1000545242.jpg.jpeg",
    description: "Interwoven sterling silver strands.",
    stock: 22
  },
  {
    id: "ring-8",
    name: "Gothic Onyx Signet",
    price: 78.00,
    category: "Rings",
    image: "/images/products/1000545305.jpg.jpeg",
    description: "Bold black onyx for a powerful statement.",
    stock: 11,
    isImported: true
  },
  {
    id: "ring-9",
    name: "Rose Quartz Heart",
    price: 42.00,
    category: "Rings",
    image: "/images/products/1000545312.jpg.jpeg",
    description: "The stone of love, delicately carved.",
    stock: 18
  },
  {
    id: "ring-10",
    name: "Minimalist Thin Stack",
    price: 20.00,
    category: "Rings",
    image: "/images/products/1000545317.jpg.jpeg",
    description: "Simple thread-thin bands for stacking.",
    stock: 40
  },

  // --- CHAINS / NECKLACES (10) ---
  {
    id: "chain-1",
    name: "Heritage Link Chain",
    price: 95.00,
    category: "Chains",
    image: "/images/products/1000544926.jpg.jpeg",
    description: "Classic oversized links for a bold statement.",
    stock: 10,
    isImported: true
  },
  {
    id: "chain-2",
    name: "Paperclip Layering",
    price: 68.00,
    category: "Chains",
    image: "/images/products/1000544996.jpg.jpeg",
    description: "Versatile paperclip link design.",
    stock: 14
  },
  {
    id: "chain-3",
    name: "Celestial Compass",
    price: 110.00,
    category: "Chains",
    image: "/images/products/1000544926.jpg.jpeg",
    description: "Navigate your path with this stellar pendant.",
    stock: 5,
    isImported: true
  },
  {
    id: "chain-4",
    name: "Snake Chain Choker",
    price: 45.00,
    category: "Chains",
    image: "/images/products/1000544996.jpg.jpeg",
    description: "Sleek and liquid-like movement.",
    stock: 20
  },
  {
    id: "chain-5",
    name: "Baroque Pearl Lariat",
    price: 135.00,
    category: "Chains",
    image: "/images/products/1000544926.jpg.jpeg",
    description: "Unique irregular pearls on a gold drop.",
    stock: 3,
    isImported: true
  },
  {
    id: "chain-6",
    name: "Geometric Disc Trio",
    price: 58.00,
    category: "Chains",
    image: "/images/products/1000544996.jpg.jpeg",
    description: "Three layered discs for a full neck look.",
    stock: 12
  },
  {
    id: "chain-7",
    name: "Vintage Coin Amulet",
    price: 82.00,
    category: "Chains",
    image: "/images/products/1000544926.jpg.jpeg",
    description: "Reproduction of an ancient Mediterranean coin.",
    stock: 8,
    isImported: true
  },
  {
    id: "chain-8",
    name: "Dainty Initial Chain",
    price: 32.00,
    category: "Chains",
    image: "/images/products/1000544996.jpg.jpeg",
    description: "Personalized charm for everyday wear.",
    stock: 50
  },
  {
    id: "chain-9",
    name: "Figaro Gold Finish",
    price: 72.00,
    category: "Chains",
    image: "/images/products/1000544926.jpg.jpeg",
    description: "Traditional Italian link style.",
    stock: 15,
    isImported: false
  },
  {
    id: "chain-10",
    name: "Moon & Star Locket",
    price: 88.00,
    category: "Chains",
    image: "/images/products/1000544996.jpg.jpeg",
    description: "Hold your memories close in this brass locket.",
    stock: 6,
    isImported: true
  },

  // --- BANDS / HEADBANDS (10) ---
  {
    id: "band-1",
    name: "Silk Twist Turban",
    price: 30.00,
    category: "Bands",
    image: "/images/products/1000544923.jpg.jpeg",
    description: "Pure mulberry silk for hair protection.",
    stock: 15,
    isImported: true
  },
  {
    id: "band-2",
    name: "Velvet Knot Lush",
    price: 24.00,
    category: "Bands",
    image: "/images/products/1000544993.jpg.jpeg",
    description: "Deep burgundy velvet with a central knot.",
    stock: 20
  },
  {
    id: "band-3",
    name: "Pearl Encrusted Band",
    price: 55.00,
    category: "Bands",
    image: "/images/products/1000544923.jpg.jpeg",
    description: "Regal design for formal events.",
    stock: 5,
    isImported: true
  },
  {
    id: "band-4",
    name: "Sports Performance Wrap",
    price: 18.00,
    category: "Bands",
    image: "/images/products/1000544993.jpg.jpeg",
    description: "Moisture-wicking fabric for active days.",
    stock: 40
  },
  {
    id: "band-5",
    name: "Floral Garden Bloom",
    price: 28.00,
    category: "Bands",
    image: "/images/products/1000544923.jpg.jpeg",
    description: "Vibrant prints for a summer aesthetic.",
    stock: 18,
    isImported: true
  },
  {
    id: "band-6",
    name: "Braided Leather Halo",
    price: 42.00,
    category: "Bands",
    image: "/images/products/1000544993.jpg.jpeg",
    description: "Unique vegan leather braided design.",
    stock: 10
  },
  {
    id: "band-7",
    name: "Crystal Tiara Band",
    price: 85.00,
    category: "Bands",
    image: "/images/products/1000544923.jpg.jpeg",
    description: "Hand-set crystals for a sparkling crown.",
    stock: 4,
    isImported: true
  },
  {
    id: "band-8",
    name: "Classic Tortoise Shell",
    price: 20.00,
    category: "Bands",
    image: "/images/products/1000544993.jpg.jpeg",
    description: "Timeless pattern in durable acetate.",
    stock: 25
  },
  {
    id: "band-9",
    name: "Boho Embroidery Wrap",
    price: 32.00,
    category: "Bands",
    image: "/images/products/1000544923.jpg.jpeg",
    description: "Intricately stitched folk patterns.",
    stock: 12,
    isImported: false
  },
  {
    id: "band-10",
    name: "Minimalist Satin Slip",
    price: 15.00,
    category: "Bands",
    image: "/images/products/1000544993.jpg.jpeg",
    description: "Understated elegance for clean hair looks.",
    stock: 35,
    isImported: true
  }
];
