import { 
  SareeProduct, 
  CategoryItem, 
  PromotionalBanner, 
  PromotionalOffer, 
  Coupon, 
  StoreSettings 
} from '../types/index.ts';

// High-fidelity image assets generated for Kolhapuri Fashion Saree
export const IMAGE_HERO_PAITHANI = '/src/assets/images/hero_paithani_saree_1792591861414.jpg';
export const IMAGE_SAREE_PURPLE = '/src/assets/images/saree_paithani_purple_1792591862050.jpg';
export const IMAGE_SAREE_MAROON = '/src/assets/images/saree_banarasi_maroon_1792591862999.jpg';
export const IMAGE_SAREE_EMERALD = '/src/assets/images/saree_designer_emerald_1792591862844.jpg';

export const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-silk',
    name: 'Silk Sarees',
    slug: 'silk-sarees',
    description: 'Pure Mulberry and Katan silks with authentic lustrous drape and zari borders.',
    imageUrl: IMAGE_SAREE_PURPLE,
    isActive: true,
    sortOrder: 1,
    productCount: 12
  },
  {
    id: 'cat-paithani',
    name: 'Paithani Sarees',
    slug: 'paithani-sarees',
    description: 'Royal Maharashtrian heritage with handwoven peacock and parrot motifs on pallu.',
    imageUrl: IMAGE_HERO_PAITHANI,
    isActive: true,
    sortOrder: 2,
    productCount: 8
  },
  {
    id: 'cat-traditional',
    name: 'Traditional Sarees',
    slug: 'traditional-sarees',
    description: 'Timeless handloom weaves crafted by generational Kolhapur artisans.',
    imageUrl: IMAGE_SAREE_MAROON,
    isActive: true,
    sortOrder: 3,
    productCount: 14
  },
  {
    id: 'cat-designer',
    name: 'Designer Sarees',
    slug: 'designer-sarees',
    description: 'Contemporary silhouettes with opulent hand embroidery and modern hues.',
    imageUrl: IMAGE_SAREE_EMERALD,
    isActive: true,
    sortOrder: 4,
    productCount: 9
  },
  {
    id: 'cat-festive',
    name: 'Festive Sarees',
    slug: 'festive-sarees',
    description: 'Vibrant celebratory colors ideal for Diwali, Gudi Padwa, and festivals.',
    imageUrl: IMAGE_HERO_PAITHANI,
    isActive: true,
    sortOrder: 5,
    productCount: 11
  },
  {
    id: 'cat-wedding',
    name: 'Wedding Sarees',
    slug: 'wedding-sarees',
    description: 'Grand bridal weaves adorned with dense real-look gold zari and intricate meenakari.',
    imageUrl: IMAGE_SAREE_MAROON,
    isActive: true,
    sortOrder: 6,
    productCount: 7
  },
  {
    id: 'cat-cotton',
    name: 'Cotton Sarees',
    slug: 'cotton-sarees',
    description: 'Breathable, feather-light handloom cottons for daily grace and comfort.',
    imageUrl: IMAGE_SAREE_PURPLE,
    isActive: true,
    sortOrder: 7,
    productCount: 6
  },
  {
    id: 'cat-party',
    name: 'Party Wear Sarees',
    slug: 'party-wear-sarees',
    description: 'Shimmering georgette and organza sarees designed for evening celebrations.',
    imageUrl: IMAGE_SAREE_EMERALD,
    isActive: true,
    sortOrder: 8,
    productCount: 5
  }
];

export const INITIAL_BANNERS: PromotionalBanner[] = [
  {
    id: 'banner-1',
    heading: 'Royal Kolhapuri Paithani Weaves',
    subtitle: 'Woven with centuries of Maharashtrian heritage and pure gold zari motifs.',
    ctaText: 'Explore Collection',
    ctaLink: '/catalog?category=Paithani Sarees',
    imageUrl: IMAGE_HERO_PAITHANI,
    badgeText: 'Festive Masterpieces',
    isActive: true,
    sortOrder: 1
  },
  {
    id: 'banner-2',
    heading: 'Rajwada Bridal Splendor 2026',
    subtitle: 'Handpicked bridal silks and traditional ensembles for auspicious celebrations.',
    ctaText: 'Shop Bridal Silks',
    ctaLink: '/catalog?category=Wedding Sarees',
    imageUrl: IMAGE_SAREE_MAROON,
    badgeText: 'Curated Heritage',
    isActive: true,
    sortOrder: 2
  }
];

export const INITIAL_OFFERS: PromotionalOffer[] = [
  {
    id: 'offer-1',
    title: 'Festive Bridal Elegance Offer',
    description: 'Flat 15% off on all authentic Paithani and Bridal silks with free insured shipping across India.',
    discountPercentage: 15,
    imageUrl: IMAGE_SAREE_MAROON,
    ctaText: 'Claim Festive Offer',
    ctaLink: '/catalog?category=Wedding Sarees',
    validUntil: '2026-11-30',
    isActive: true
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'cpn-1',
    code: 'FESTIVE10',
    description: 'Flat 10% discount on orders above ₹4,999',
    discountPercentage: 10,
    maxDiscountPaise: 200000,
    minOrderValuePaise: 499900,
    usageLimit: 500,
    usedCount: 42,
    isActive: true,
    validUntil: '2026-12-31'
  },
  {
    id: 'cpn-2',
    code: 'KOLHAPUR20',
    description: 'Special 20% discount for our valued customers',
    discountPercentage: 20,
    maxDiscountPaise: 350000,
    minOrderValuePaise: 799900,
    usageLimit: 200,
    usedCount: 18,
    isActive: true,
    validUntil: '2026-12-31'
  }
];

export const INITIAL_PRODUCTS: SareeProduct[] = [
  {
    id: 'saree-01',
    name: 'Shahi Royal Purple Peacock Paithani Silk Saree',
    slug: 'shahi-royal-purple-peacock-paithani-silk-saree',
    sku: 'KFS-PAITH-001',
    description: 'An iconic symbol of Maharashtra royal grandeur, this handwoven pure Paithani silk saree features a rich purple body sprinkled with delicate gold coin butis and a signature kaleidoscopic peacock (mor) pallu hand-loomed with metallic gold thread work.',
    categoryIds: ['cat-paithani', 'cat-silk', 'cat-traditional'],
    categoryNames: ['Paithani Sarees', 'Silk Sarees', 'Traditional Sarees'],
    fabric: 'Pure Mulberry Silk',
    occasion: 'Weddings, Traditional Poojas, Gudi Padwa, Diwali',
    lengthMeters: 6.3,
    blousePiece: 'Running 0.8m unstitched pure silk blouse piece with gold zari border included',
    careInstructions: 'Dry clean only. Store wrapped in soft muslin cloth away from direct sunlight.',
    primaryImage: IMAGE_SAREE_PURPLE,
    galleryImages: [IMAGE_SAREE_PURPLE, IMAGE_HERO_PAITHANI],
    variants: [
      {
        variantId: 'var-01-purple',
        colorName: 'Royal Purple & Antique Gold',
        colorHex: '#4B0082',
        sku: 'KFS-PAITH-001-PUR',
        originalPricePaise: 1899900,
        sellingPricePaise: 1449900,
        inventoryStock: 8,
        reservedStock: 0,
        images: [IMAGE_SAREE_PURPLE]
      },
      {
        variantId: 'var-01-crimson',
        colorName: 'Crimson Vermilion & Gold',
        colorHex: '#9E1B32',
        sku: 'KFS-PAITH-001-CRM',
        originalPricePaise: 1899900,
        sellingPricePaise: 1449900,
        inventoryStock: 6,
        reservedStock: 0,
        images: [IMAGE_HERO_PAITHANI]
      }
    ],
    featured: true,
    trending: true,
    isNewArrival: true,
    isPublished: true,
    rating: 4.9,
    reviewsCount: 38,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'saree-02',
    name: 'Rajwada Bridal Maroon Banarasi Katan Silk Saree',
    slug: 'rajwada-bridal-maroon-banarasi-katan-silk-saree',
    sku: 'KFS-BAN-002',
    description: 'Crafted for the unforgettable bride, this deep royal maroon Banarasi saree is woven with pure Katan silk and opulent Champagne Gold kadwa brocade. The heavy pallu showcases classical paisley motifs and an intricate temple architectural border.',
    categoryIds: ['cat-wedding', 'cat-silk', 'cat-traditional'],
    categoryNames: ['Wedding Sarees', 'Silk Sarees', 'Traditional Sarees'],
    fabric: 'Katan Pure Silk with Brocade Zari',
    occasion: 'Bridal Wedding, Sangeet, Reception',
    lengthMeters: 6.3,
    blousePiece: 'Contrast brocade blouse piece with heavy border included (0.8m)',
    careInstructions: 'Strictly professional dry clean only. Iron inside-out on low silk setting.',
    primaryImage: IMAGE_SAREE_MAROON,
    galleryImages: [IMAGE_SAREE_MAROON, IMAGE_HERO_PAITHANI],
    variants: [
      {
        variantId: 'var-02-maroon',
        colorName: 'Royal Maroon & Champagne Gold',
        colorHex: '#641D32',
        sku: 'KFS-BAN-002-MRN',
        originalPricePaise: 2249900,
        sellingPricePaise: 1799900,
        inventoryStock: 5,
        reservedStock: 0,
        images: [IMAGE_SAREE_MAROON]
      }
    ],
    featured: true,
    trending: true,
    isNewArrival: false,
    isPublished: true,
    rating: 5.0,
    reviewsCount: 45,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'saree-03',
    name: 'Emerald Bloom Designer Festive Silk Saree',
    slug: 'emerald-bloom-designer-festive-silk-saree',
    sku: 'KFS-DES-003',
    description: 'An ethereal combination of rich jewel-toned emerald green and hand-woven golden floral vine borders. Lightweight yet intensely rich in sheen, creating effortless draping for long celebratory gatherings.',
    categoryIds: ['cat-designer', 'cat-festive', 'cat-silk'],
    categoryNames: ['Designer Sarees', 'Festive Sarees', 'Silk Sarees'],
    fabric: 'Tussar Art Silk with Zari',
    occasion: 'Diwali, Sangeet, Festive Dinners',
    lengthMeters: 6.3,
    blousePiece: 'Embroidered emerald silk blouse piece included (0.8m)',
    careInstructions: 'Dry clean recommended. Mild steam iron if required.',
    primaryImage: IMAGE_SAREE_EMERALD,
    galleryImages: [IMAGE_SAREE_EMERALD],
    variants: [
      {
        variantId: 'var-03-emerald',
        colorName: 'Emerald Jewel Green',
        colorHex: '#046A38',
        sku: 'KFS-DES-003-EMR',
        originalPricePaise: 1299900,
        sellingPricePaise: 989900,
        inventoryStock: 12,
        reservedStock: 0,
        images: [IMAGE_SAREE_EMERALD]
      }
    ],
    featured: true,
    trending: false,
    isNewArrival: true,
    isPublished: true,
    rating: 4.8,
    reviewsCount: 22,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'saree-04',
    name: 'Kalyani Crimson & Pure Gold Temple Paithani Saree',
    slug: 'kalyani-crimson-pure-gold-temple-paithani-saree',
    sku: 'KFS-KANJ-004',
    description: 'Radiating eternal royal splendor, this authentic crimson silk body shimmers against a rich korvai zari border. Featuring intricate temple peacock motifs and heavy golden pallu detailing.',
    categoryIds: ['cat-wedding', 'cat-paithani', 'cat-silk'],
    categoryNames: ['Wedding Sarees', 'Paithani Sarees', 'Silk Sarees'],
    fabric: 'Pure Silk 3-ply with Silver & Gold Zari',
    occasion: 'Weddings, Engagements, Milestone Poojas',
    lengthMeters: 6.3,
    blousePiece: 'Crimson gold contrast blouse piece with temple border (0.8m)',
    careInstructions: 'Dry clean only. Roll in cotton muslin for preservation.',
    primaryImage: IMAGE_HERO_PAITHANI,
    galleryImages: [IMAGE_HERO_PAITHANI, IMAGE_SAREE_PURPLE],
    variants: [
      {
        variantId: 'var-04-crimson',
        colorName: 'Crimson Vermilion & Gold',
        colorHex: '#9E1B32',
        sku: 'KFS-KANJ-004-GLD',
        originalPricePaise: 2499900,
        sellingPricePaise: 1949900,
        inventoryStock: 4,
        reservedStock: 0,
        images: [IMAGE_HERO_PAITHANI]
      }
    ],
    featured: false,
    trending: true,
    isNewArrival: true,
    isPublished: true,
    rating: 4.9,
    reviewsCount: 31,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Kolhapuri Fashion Saree',
  businessPhone: '9096863092',
  whatsappContact: '9096863092',
  instagramHandle: '@ankita_wavecode',
  businessAddress: 'Shivaji Nagar, Unchgaon, Kolhapur, Maharashtra, India.',
  supportEmail: 'ankitakhot015@gmail.com',
  announcementMessages: [
    '✨ Handwoven Paithani & Bridal Silk Festive Showcase 2026',
    '🚚 Free Insured Shipping across India on orders above ₹2,999',
    '🎁 Use code FESTIVE10 for 10% off on your authentic handloom orders',
    '🌿 100% Certified Authentic Weaves direct from Kolhapur weavers'
  ],
  announcementRotationSpeedSeconds: 4,
  standardShippingFeePaise: 15000,
  freeShippingThresholdPaise: 299900,
  taxPercentage: 5,
  logoUrl: ''
};
