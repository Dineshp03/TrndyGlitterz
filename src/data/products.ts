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
  isSoldOut?: boolean;
  soldOut?: boolean;
  is_sold_out?: boolean;
  images?: string[]; // Additional images (8+ supported)
  oldPrice?: number;
  createdAt?: string;
}

export const products: Product[] = [
  {
    id: "e0ab6418-18e9-409c-b087-ff7627593109",
    name: "Xuping neck piece",
    price: 5500.00,
    category: "Xuping Neckpiece",
    image: "https://zlouhiealaldfvqqjhop.supabase.co/storage/v1/object/public/product-images/product-1778760134736-on6799ko6dc.jpg",
    description: "demo product just",
    stock: 50,
    featured: true,
    isImported: false,
    createdAt: "2026-05-14T12:03:12.030545Z"
  },
  {
    id: "91d70127-4045-47cf-9317-08f733cc08cd",
    name: "ring demo 2",
    price: 1.00,
    category: "Rings",
    image: "https://zlouhiealaldfvqqjhop.supabase.co/storage/v1/object/public/product-images/product-1778757935080-zlp1hrqmxo9.jpg",
    description: "it was demo product just for testing",
    stock: 30,
    featured: true,
    isImported: false,
    createdAt: "2026-05-14T11:25:49.773306Z"
  },
  {
    id: "1f54d949-efa5-4d7d-8e5e-87adf1814307",
    name: "chains demo 2",
    price: 250.00,
    category: "Chains",
    image: "https://zlouhiealaldfvqqjhop.supabase.co/storage/v1/object/public/product-images/product-1778757872994-okj9hujklyk.jpg",
    description: "it was demo product just for testing",
    stock: 0,
    featured: true,
    isImported: false,
    createdAt: "2026-05-14T11:24:41.838179Z"
  },
  {
    id: "2fc49af2-b77e-473d-b28b-83830fbe357f",
    name: "bands demo 1",
    price: 700.00,
    category: "Bands",
    image: "https://zlouhiealaldfvqqjhop.supabase.co/storage/v1/object/public/product-images/product-1778757816384-b9jqxeoxrdg.jpg",
    description: "it was demo product just for testing",
    stock: 100,
    featured: true,
    isImported: false,
    createdAt: "2026-05-14T11:23:59.348671Z"
  },
  {
    id: "8c3e41b9-50fd-4894-90bd-e624d71a32b3",
    name: "Xuping finger ring 1",
    price: 550.00,
    category: "Xuping Finger Rings",
    image: "https://zlouhiealaldfvqqjhop.supabase.co/storage/v1/object/public/product-images/product-1778757702651-9kvvhvjjm8.jpg",
    description: "it was demo product just for testing",
    stock: 200,
    featured: true,
    isImported: false,
    createdAt: "2026-05-14T11:22:19.080682Z"
  },
  {
    id: "34e847a5-f4d2-4cb2-9830-dbc2946b289d",
    name: "Xuping bracelet 1",
    price: 700.00,
    category: "Xuping Bracelets",
    image: "https://zlouhiealaldfvqqjhop.supabase.co/storage/v1/object/public/product-images/product-1778757402679-phpdkwulh3g.jpg",
    description: "it was demo product just for testing",
    stock: 500,
    featured: true,
    isImported: false,
    createdAt: "2026-05-14T11:20:08.170942Z"
  },
  {
    id: "5ffe3d82-171c-46eb-8f0a-086e43bcbf22",
    name: "Xpuing neckpiece",
    price: 600.00,
    category: "Earrings",
    image: "https://zlouhiealaldfvqqjhop.supabase.co/storage/v1/object/public/product-images/product-1778757287311-7yrhsk05umm.jpg",
    description: "it was demo product just for testing",
    stock: 50,
    featured: true,
    isImported: false,
    createdAt: "2026-05-14T11:15:29.312004Z"
  },
  {
    id: "90509204-c0f0-4f96-85a9-0f3146a04e0f",
    name: "Xuping earing 1",
    price: 500.00,
    category: "Xuping Earrings",
    image: "https://zlouhiealaldfvqqjhop.supabase.co/storage/v1/object/public/product-images/product-1778757135698-4ovlbjdwjre.jpg",
    description: "it was demo product just for testing",
    stock: 50,
    featured: true,
    isImported: false,
    createdAt: "2026-05-14T11:12:55.31353Z"
  },
  {
    id: "b8d6009e-8791-41b1-846b-3466a789649f",
    name: "traditional earing 1",
    price: 600.00,
    category: "Traditional Earrings",
    image: "https://zlouhiealaldfvqqjhop.supabase.co/storage/v1/object/public/product-images/product-1778757081867-qmagfrtpexg.jpg",
    description: "it was demo product just for testing",
    stock: 50,
    featured: true,
    isImported: false,
    createdAt: "2026-05-14T11:11:44.631459Z"
  },
  {
    id: "899819f3-6ad5-4a24-81b5-117bde9bc869",
    name: "Korean earing",
    price: 400.00,
    category: "Korean Earrings",
    image: "https://zlouhiealaldfvqqjhop.supabase.co/storage/v1/object/public/product-images/product-1778757023764-sg7ojpf1fsp.jpg",
    description: "it was demo product just for testing",
    stock: 20,
    featured: true,
    isImported: false,
    createdAt: "2026-05-14T11:10:50.722444Z"
  },
  {
    id: "80217d82-e658-4460-8f92-c0e466353876",
    name: "clips for hair (combo)",
    price: 350.00,
    category: "Hair Accessories",
    image: "https://zlouhiealaldfvqqjhop.supabase.co/storage/v1/object/public/product-images/product-1778756935692-2wd11op599r.jpg",
    description: "it was demo product just for testing",
    stock: 100,
    featured: true,
    isImported: false,
    createdAt: "2026-05-14T11:09:21.556433Z"
  },
  {
    id: "736c77c6-7b04-46c7-8451-c5a348d4fa61",
    name: "Ring 1",
    price: 300.00,
    category: "Finger Rings",
    image: "https://zlouhiealaldfvqqjhop.supabase.co/storage/v1/object/public/product-images/product-1778756882512-zq1ato7qclh.jpg",
    description: "it was demo product just for testing",
    stock: 30,
    featured: true,
    isImported: false,
    createdAt: "2026-05-14T11:08:25.38969Z"
  },
  {
    id: "10aa29f0-0f41-4fdf-b59e-0483543dcfe0",
    name: "bracelets",
    price: 350.00,
    category: "Bracelets",
    image: "https://zlouhiealaldfvqqjhop.supabase.co/storage/v1/object/public/product-images/product-1778756758619-l8wu1f2a55.jpg",
    description: "it was demo product just for testing",
    stock: 20,
    featured: true,
    isImported: false,
    createdAt: "2026-05-14T11:06:19.87176Z"
  },
  {
    id: "980dccd2-57ea-4f48-a7bc-2c97c1588c0b",
    name: "chain 1",
    price: 300.00,
    category: "Neckpiece",
    image: "https://zlouhiealaldfvqqjhop.supabase.co/storage/v1/object/public/product-images/product-1778756732956-lgeimfhagxj.jpg",
    description: "it was demo product just for testing",
    stock: 20,
    featured: true,
    isImported: false,
    createdAt: "2026-05-14T11:05:54.968189Z"
  },
  {
    id: "a90201d8-4c43-4944-b564-7c164087e8b2",
    name: "earing demo 1",
    price: 200.00,
    category: "Earrings",
    image: "https://zlouhiealaldfvqqjhop.supabase.co/storage/v1/object/public/product-images/product-1778756699725-pggsqdr8j1.jpeg",
    description: "it was demo product just for testing",
    stock: 10,
    featured: false,
    isImported: false,
    createdAt: "2026-05-14T11:05:24.085651Z"
  }
];
