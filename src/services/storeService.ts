import {
  SareeProduct,
  CategoryItem,
  PromotionalBanner,
  PromotionalOffer,
  Coupon,
  CartItem,
  DeliveryAddress,
  Order,
  OrderItem,
  OrderStatus,
  InventoryMovement,
  AuditLogItem,
  StoreSettings,
  UserSession
} from '../types/index.ts';
import {
  INITIAL_CATEGORIES,
  INITIAL_BANNERS,
  INITIAL_OFFERS,
  INITIAL_COUPONS,
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS
} from '../data/initialData.ts';

const STORAGE_KEY_PRODUCTS = 'kfs_products_v1';
const STORAGE_KEY_CATEGORIES = 'kfs_categories_v1';
const STORAGE_KEY_BANNERS = 'kfs_banners_v1';
const STORAGE_KEY_OFFERS = 'kfs_offers_v1';
const STORAGE_KEY_COUPONS = 'kfs_coupons_v1';
const STORAGE_KEY_ORDERS = 'kfs_orders_v1';
const STORAGE_KEY_MOVEMENTS = 'kfs_movements_v1';
const STORAGE_KEY_AUDIT = 'kfs_audit_v1';
const STORAGE_KEY_SETTINGS = 'kfs_settings_v1';
const STORAGE_KEY_CART = 'kfs_cart_v1';
const STORAGE_KEY_WISHLIST = 'kfs_wishlist_v1';
const STORAGE_KEY_ADDRESSES = 'kfs_addresses_v1';
const STORAGE_KEY_USER = 'kfs_user_session_v1';

export interface DispatchedEmail {
  id: string;
  to: string;
  from: string;
  subject: string;
  sentAt: string;
  otp: string;
}

class StoreService {
  private products: SareeProduct[] = [];
  private categories: CategoryItem[] = [];
  private banners: PromotionalBanner[] = [];
  private offers: PromotionalOffer[] = [];
  private coupons: Coupon[] = [];
  private orders: Order[] = [];
  private inventoryMovements: InventoryMovement[] = [];
  private auditLogs: AuditLogItem[] = [];
  private settings: StoreSettings = { ...INITIAL_SETTINGS };
  private session: UserSession | null = null;
  private cart: CartItem[] = [];
  private wishlist: string[] = [];
  private addresses: DeliveryAddress[] = [];
  private listeners: Set<() => void> = new Set();
  private otpChallenges: Map<string, { email: string; otp: string; expiresAt: number; attempts: number }> = new Map();
  private lastDispatchedEmail: DispatchedEmail | null = null;

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const p = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      this.products = p ? JSON.parse(p) : [...INITIAL_PRODUCTS];

      const c = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      this.categories = c ? JSON.parse(c) : [...INITIAL_CATEGORIES];

      const b = localStorage.getItem(STORAGE_KEY_BANNERS);
      this.banners = b ? JSON.parse(b) : [...INITIAL_BANNERS];

      const o = localStorage.getItem(STORAGE_KEY_OFFERS);
      this.offers = o ? JSON.parse(o) : [...INITIAL_OFFERS];

      const cpn = localStorage.getItem(STORAGE_KEY_COUPONS);
      this.coupons = cpn ? JSON.parse(cpn) : [...INITIAL_COUPONS];

      const ord = localStorage.getItem(STORAGE_KEY_ORDERS);
      this.orders = ord ? JSON.parse(ord) : this.createInitialSampleOrders();

      const mov = localStorage.getItem(STORAGE_KEY_MOVEMENTS);
      this.inventoryMovements = mov ? JSON.parse(mov) : this.createInitialMovements();

      const aud = localStorage.getItem(STORAGE_KEY_AUDIT);
      this.auditLogs = aud ? JSON.parse(aud) : [];

      const set = localStorage.getItem(STORAGE_KEY_SETTINGS);
      this.settings = set ? JSON.parse(set) : { ...INITIAL_SETTINGS };

      const usr = localStorage.getItem(STORAGE_KEY_USER);
      this.session = usr ? JSON.parse(usr) : null;

      const crt = localStorage.getItem(STORAGE_KEY_CART);
      this.cart = crt ? JSON.parse(crt) : [];

      const wsh = localStorage.getItem(STORAGE_KEY_WISHLIST);
      this.wishlist = wsh ? JSON.parse(wsh) : [];

      const adr = localStorage.getItem(STORAGE_KEY_ADDRESSES);
      this.addresses = adr ? JSON.parse(adr) : [
        {
          id: 'addr-default-1',
          fullName: 'Pooja Kulkarni',
          mobileNumber: '9096863092',
          email: 'pooja.kulkarni@example.com',
          addressLine1: 'Shivaji Nagar, Unchgaon',
          landmark: 'Near Mahalaxmi Temple road',
          city: 'Kolhapur',
          state: 'Maharashtra',
          pinCode: '416005',
          country: 'India',
          isDefault: true
        }
      ];
    } catch (e) {
      console.warn('Error loading stored boutique state, fallback to seed data', e);
      this.products = [...INITIAL_PRODUCTS];
      this.categories = [...INITIAL_CATEGORIES];
      this.banners = [...INITIAL_BANNERS];
      this.offers = [...INITIAL_OFFERS];
      this.coupons = [...INITIAL_COUPONS];
      this.orders = this.createInitialSampleOrders();
      this.inventoryMovements = this.createInitialMovements();
      this.settings = { ...INITIAL_SETTINGS };
      this.session = null;
      this.cart = [];
      this.wishlist = [];
      this.addresses = [];
    }
  }

  private persist(key: string, data: any) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to persist to localStorage', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(fn => fn());
  }

  private createInitialMovements(): InventoryMovement[] {
    const list: InventoryMovement[] = [];
    for (const p of INITIAL_PRODUCTS) {
      for (const v of p.variants) {
        list.push({
          id: `mov-${Math.random().toString(36).substring(2, 9)}`,
          productId: p.id,
          productName: p.name,
          variantId: v.variantId,
          colorName: v.colorName,
          sku: v.sku,
          changeType: 'INITIAL',
          quantityChange: v.inventoryStock,
          stockAfter: v.inventoryStock,
          reason: 'Initial Kolhapur workshop warehouse stocking',
          performedBy: 'System / Owner',
          timestamp: new Date().toISOString()
        });
      }
    }
    return list;
  }

  private createInitialSampleOrders(): Order[] {
    const p = INITIAL_PRODUCTS[0];
    const v = p.variants[0];
    return [
      {
        id: 'ord-sample-1042',
        orderNumber: 'KFS-2026-1042',
        userId: 'pooja.kulkarni@example.com',
        customerName: 'Pooja Kulkarni',
        customerEmail: 'pooja.kulkarni@example.com',
        customerPhone: '9822012345',
        items: [
          {
            productId: p.id,
            variantId: v.variantId,
            name: p.name,
            colorName: v.colorName,
            sku: v.sku,
            unitPricePaise: v.sellingPricePaise,
            quantity: 1,
            totalPaise: v.sellingPricePaise,
            image: v.images[0] || p.primaryImage,
            fabric: p.fabric
          }
        ],
        shippingAddressSnapshot: {
          id: 'addr-sample-1',
          fullName: 'Pooja Kulkarni',
          mobileNumber: '9822012345',
          email: 'pooja.kulkarni@example.com',
          addressLine1: 'Bunglow No. 12, Tarabai Park',
          addressLine2: 'Near Circuit House',
          landmark: 'Opposite Dream World',
          city: 'Kolhapur',
          state: 'Maharashtra',
          pinCode: '416003',
          country: 'India',
          isDefault: true
        },
        subtotalPaise: v.sellingPricePaise,
        couponDiscountPaise: 0,
        shippingChargePaise: 0,
        taxPaise: Math.round(v.sellingPricePaise * 0.05),
        finalPayablePaise: Math.round(v.sellingPricePaise * 1.05),
        orderStatus: 'Processing',
        paymentStatus: 'Paid',
        paymentDetails: {
          razorpayOrderId: 'order_test_9876543210',
          razorpayPaymentId: 'pay_test_5432109876',
          paidAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          method: 'Razorpay UPI'
        },
        shipment: {
          courierName: 'Blue Dart Express',
          trackingNumber: 'BDKOL2026099182',
          trackingUrl: 'https://www.bluedart.com',
          shippedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          estimatedDeliveryDate: '2026-10-25'
        },
        statusHistory: [
          {
            status: 'Pending Payment',
            timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
            actor: 'Customer'
          },
          {
            status: 'Payment Confirmed',
            timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
            note: 'Razorpay payment signature verified (pay_test_5432109876)',
            actor: 'Razorpay Gateway'
          },
          {
            status: 'Order Confirmed',
            timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString(),
            note: 'Inventory allocated and order verified',
            actor: 'Store Admin'
          },
          {
            status: 'Processing',
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
            note: 'Handloom quality inspection completed',
            actor: 'Warehouse Supervisor'
          }
        ],
        adminNotes: 'Customer requested festive silk gift wrap packaging.',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ];
  }

  // --- CATALOG ---
  public getProducts(filter?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    fabric?: string;
    occasion?: string;
    trending?: boolean;
    newArrivals?: boolean;
    featured?: boolean;
    sort?: 'newest' | 'price-asc' | 'price-desc' | 'popularity' | 'discount';
  }): SareeProduct[] {
    let result = this.products.filter(p => p.isPublished);

    if (filter) {
      if (filter.category && filter.category !== 'All') {
        result = result.filter(p =>
          p.categoryNames.some(c => c.toLowerCase() === filter.category!.toLowerCase()) ||
          p.categoryIds.includes(filter.category!)
        );
      }
      if (filter.search) {
        const q = filter.search.toLowerCase().trim();
        result = result.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.fabric.toLowerCase().includes(q) ||
          p.occasion.toLowerCase().includes(q)
        );
      }
      if (filter.minPrice !== undefined) {
        result = result.filter(p => p.variants.some(v => v.sellingPricePaise >= filter.minPrice! * 100));
      }
      if (filter.maxPrice !== undefined) {
        result = result.filter(p => p.variants.some(v => v.sellingPricePaise <= filter.maxPrice! * 100));
      }
      if (filter.fabric) {
        result = result.filter(p => p.fabric.toLowerCase().includes(filter.fabric!.toLowerCase()));
      }
      if (filter.occasion) {
        result = result.filter(p => p.occasion.toLowerCase().includes(filter.occasion!.toLowerCase()));
      }
      if (filter.trending) {
        result = result.filter(p => p.trending);
      }
      if (filter.newArrivals) {
        result = result.filter(p => p.isNewArrival);
      }
      if (filter.featured) {
        result = result.filter(p => p.featured);
      }

      if (filter.sort) {
        switch (filter.sort) {
          case 'price-asc':
            result.sort((a, b) => (a.variants[0]?.sellingPricePaise || 0) - (b.variants[0]?.sellingPricePaise || 0));
            break;
          case 'price-desc':
            result.sort((a, b) => (b.variants[0]?.sellingPricePaise || 0) - (a.variants[0]?.sellingPricePaise || 0));
            break;
          case 'popularity':
            result.sort((a, b) => b.reviewsCount - a.reviewsCount);
            break;
          case 'discount':
            result.sort((a, b) => {
              const discA = a.variants[0] ? (a.variants[0].originalPricePaise - a.variants[0].sellingPricePaise) / a.variants[0].originalPricePaise : 0;
              const discB = b.variants[0] ? (b.variants[0].originalPricePaise - b.variants[0].sellingPricePaise) / b.variants[0].originalPricePaise : 0;
              return discB - discA;
            });
            break;
          case 'newest':
          default:
            result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
        }
      }
    }

    return result;
  }

  public getProductBySlug(slug: string): SareeProduct | undefined {
    return this.products.find(p => p.slug === slug || p.id === slug);
  }

  public getAllProductsAdmin(): SareeProduct[] {
    return this.products;
  }

  public saveProduct(productData: Partial<SareeProduct>, actor: string): SareeProduct {
    let saved: SareeProduct;
    if (productData.id) {
      const idx = this.products.findIndex(p => p.id === productData.id);
      if (idx !== -1) {
        saved = {
          ...this.products[idx],
          ...productData,
          updatedAt: new Date().toISOString()
        };
        this.products[idx] = saved;
        this.logAudit('PRODUCT', saved.id, `Updated saree "${saved.name}"`, actor);
      } else {
        saved = this.createProductEntity(productData, actor);
      }
    } else {
      saved = this.createProductEntity(productData, actor);
    }

    this.persist(STORAGE_KEY_PRODUCTS, this.products);
    return saved;
  }

  private createProductEntity(productData: Partial<SareeProduct>, actor: string): SareeProduct {
    const id = `saree-${Date.now()}`;
    const slug = (productData.name || 'saree')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newProduct: SareeProduct = {
      id,
      name: productData.name || 'Authentic Handloom Saree',
      slug,
      sku: productData.sku || `KFS-NEW-${Math.floor(100 + Math.random() * 900)}`,
      description: productData.description || 'Pure handloom saree woven with rich traditional motifs.',
      categoryIds: productData.categoryIds || ['cat-silk'],
      categoryNames: productData.categoryNames || ['Silk Sarees'],
      fabric: productData.fabric || 'Pure Silk',
      occasion: productData.occasion || 'Festivals & Weddings',
      lengthMeters: productData.lengthMeters || 6.3,
      blousePiece: productData.blousePiece || 'Matching unstitched 0.8m blouse piece included',
      careInstructions: productData.careInstructions || 'Dry clean only',
      primaryImage: productData.primaryImage || INITIAL_PRODUCTS[0].primaryImage,
      galleryImages: productData.galleryImages || [INITIAL_PRODUCTS[0].primaryImage],
      variants: productData.variants || [
        {
          variantId: `var-${id}-1`,
          colorName: 'Royal Maroon & Gold',
          colorHex: '#641D32',
          sku: `${productData.sku || 'KFS'}-MRN`,
          originalPricePaise: 1499900,
          sellingPricePaise: 1199900,
          inventoryStock: 8,
          reservedStock: 0,
          images: [productData.primaryImage || INITIAL_PRODUCTS[0].primaryImage]
        }
      ],
      featured: productData.featured ?? false,
      trending: productData.trending ?? false,
      isNewArrival: productData.isNewArrival ?? true,
      isPublished: productData.isPublished ?? true,
      rating: 5.0,
      reviewsCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.products.unshift(newProduct);
    this.logAudit('PRODUCT', newProduct.id, `Created new saree "${newProduct.name}"`, actor);
    return newProduct;
  }

  public deleteProduct(id: string, actor: string): boolean {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      const p = this.products[idx];
      this.products.splice(idx, 1);
      this.logAudit('PRODUCT', id, `Deleted saree "${p.name}"`, actor);
      this.persist(STORAGE_KEY_PRODUCTS, this.products);
      return true;
    }
    return false;
  }

  // --- CATEGORIES ---
  public getCategories(): CategoryItem[] {
    return this.categories;
  }

  public saveCategory(cat: Partial<CategoryItem>, actor: string): CategoryItem {
    let saved: CategoryItem;
    if (cat.id) {
      const idx = this.categories.findIndex(c => c.id === cat.id);
      if (idx !== -1) {
        this.categories[idx] = { ...this.categories[idx], ...cat };
        saved = this.categories[idx];
        this.logAudit('CATEGORY', cat.id, `Updated category ${cat.name}`, actor);
      } else {
        saved = this.createCategoryEntity(cat, actor);
      }
    } else {
      saved = this.createCategoryEntity(cat, actor);
    }
    this.persist(STORAGE_KEY_CATEGORIES, this.categories);
    return saved;
  }

  private createCategoryEntity(cat: Partial<CategoryItem>, actor: string): CategoryItem {
    const newCat: CategoryItem = {
      id: `cat-${Date.now()}`,
      name: cat.name || 'New Collection',
      slug: (cat.name || 'collection').toLowerCase().replace(/\s+/g, '-'),
      description: cat.description || '',
      imageUrl: cat.imageUrl || INITIAL_CATEGORIES[0].imageUrl,
      isActive: cat.isActive ?? true,
      sortOrder: this.categories.length + 1
    };
    this.categories.push(newCat);
    this.logAudit('CATEGORY', newCat.id, `Created category ${newCat.name}`, actor);
    return newCat;
  }

  public deleteCategory(id: string, actor: string): boolean {
    const idx = this.categories.findIndex(c => c.id === id);
    if (idx !== -1) {
      const [c] = this.categories.splice(idx, 1);
      this.logAudit('CATEGORY', id, `Deleted category ${c.name}`, actor);
      this.persist(STORAGE_KEY_CATEGORIES, this.categories);
      return true;
    }
    return false;
  }

  // --- BANNERS ---
  public getBanners(activeOnly = true): PromotionalBanner[] {
    if (activeOnly) {
      return this.banners.filter(b => b.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return this.banners.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public saveBanner(banner: Partial<PromotionalBanner>, actor: string): PromotionalBanner {
    let saved: PromotionalBanner;
    if (banner.id) {
      const idx = this.banners.findIndex(b => b.id === banner.id);
      if (idx !== -1) {
        this.banners[idx] = { ...this.banners[idx], ...banner };
        saved = this.banners[idx];
        this.logAudit('BANNER', banner.id, `Updated banner "${banner.heading}"`, actor);
      } else {
        saved = this.createBannerEntity(banner, actor);
      }
    } else {
      saved = this.createBannerEntity(banner, actor);
    }
    this.persist(STORAGE_KEY_BANNERS, this.banners);
    return saved;
  }

  private createBannerEntity(banner: Partial<PromotionalBanner>, actor: string): PromotionalBanner {
    const newBanner: PromotionalBanner = {
      id: `banner-${Date.now()}`,
      heading: banner.heading || 'Maharashtrian Royal Collection',
      subtitle: banner.subtitle || 'Exquisite handwoven luxury sarees',
      ctaText: banner.ctaText || 'Shop Collection',
      ctaLink: banner.ctaLink || '/catalog',
      imageUrl: banner.imageUrl || INITIAL_BANNERS[0].imageUrl,
      badgeText: banner.badgeText || 'Exclusive',
      isActive: banner.isActive ?? true,
      sortOrder: this.banners.length + 1
    };
    this.banners.push(newBanner);
    this.logAudit('BANNER', newBanner.id, `Created banner "${newBanner.heading}"`, actor);
    return newBanner;
  }

  public deleteBanner(id: string, actor: string): boolean {
    const idx = this.banners.findIndex(b => b.id === id);
    if (idx !== -1) {
      const [b] = this.banners.splice(idx, 1);
      this.logAudit('BANNER', id, `Deleted banner "${b.heading}"`, actor);
      this.persist(STORAGE_KEY_BANNERS, this.banners);
      return true;
    }
    return false;
  }

  // --- OFFERS ---
  public getOffers(activeOnly = true): PromotionalOffer[] {
    if (activeOnly) {
      return this.offers.filter(o => o.isActive);
    }
    return this.offers;
  }

  public saveOffer(offer: Partial<PromotionalOffer>, actor: string): PromotionalOffer {
    let saved: PromotionalOffer;
    if (offer.id) {
      const idx = this.offers.findIndex(o => o.id === offer.id);
      if (idx !== -1) {
        this.offers[idx] = { ...this.offers[idx], ...offer };
        saved = this.offers[idx];
        this.logAudit('SETTINGS', offer.id, `Updated offer "${offer.title}"`, actor);
      } else {
        saved = this.createOfferEntity(offer, actor);
      }
    } else {
      saved = this.createOfferEntity(offer, actor);
    }
    this.persist(STORAGE_KEY_OFFERS, this.offers);
    return saved;
  }

  private createOfferEntity(offer: Partial<PromotionalOffer>, actor: string): PromotionalOffer {
    const newOffer: PromotionalOffer = {
      id: `offer-${Date.now()}`,
      title: offer.title || 'Festive Discount',
      description: offer.description || '',
      discountPercentage: offer.discountPercentage || 10,
      imageUrl: offer.imageUrl || INITIAL_OFFERS[0].imageUrl,
      ctaText: offer.ctaText || 'Shop Now',
      ctaLink: offer.ctaLink || '/catalog',
      validUntil: offer.validUntil || '2026-12-31',
      isActive: offer.isActive ?? true
    };
    this.offers.push(newOffer);
    this.logAudit('SETTINGS', newOffer.id, `Created offer "${newOffer.title}"`, actor);
    return newOffer;
  }

  public deleteOffer(id: string, actor: string): boolean {
    const idx = this.offers.findIndex(o => o.id === id);
    if (idx !== -1) {
      const [o] = this.offers.splice(idx, 1);
      this.logAudit('SETTINGS', id, `Deleted offer "${o.title}"`, actor);
      this.persist(STORAGE_KEY_OFFERS, this.offers);
      return true;
    }
    return false;
  }

  // --- COUPONS ---
  public getCoupons(): Coupon[] {
    return this.coupons;
  }

  public validateCoupon(code: string, subtotalPaise: number): { valid: boolean; coupon?: Coupon; discountPaise: number; message: string } {
    const coupon = this.coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!coupon) {
      return { valid: false, discountPaise: 0, message: 'Invalid coupon code.' };
    }
    if (!coupon.isActive) {
      return { valid: false, discountPaise: 0, message: 'This coupon is no longer active.' };
    }
    if (new Date(coupon.validUntil).getTime() < Date.now()) {
      return { valid: false, discountPaise: 0, message: 'This coupon has expired.' };
    }
    if (subtotalPaise < coupon.minOrderValuePaise) {
      const minINR = Math.round(coupon.minOrderValuePaise / 100);
      return { valid: false, discountPaise: 0, message: `Minimum order value of ₹${minINR.toLocaleString('en-IN')} required.` };
    }
    if (coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, discountPaise: 0, message: 'Coupon usage limit has been reached.' };
    }

    let calculatedDiscount = Math.round((subtotalPaise * coupon.discountPercentage) / 100);
    if (calculatedDiscount > coupon.maxDiscountPaise) {
      calculatedDiscount = coupon.maxDiscountPaise;
    }

    return {
      valid: true,
      coupon,
      discountPaise: calculatedDiscount,
      message: `Coupon ${coupon.code} applied! Saved ₹${Math.round(calculatedDiscount / 100).toLocaleString('en-IN')}`
    };
  }

  public saveCoupon(cpn: Partial<Coupon>, actor: string): Coupon {
    let saved: Coupon;
    if (cpn.id) {
      const idx = this.coupons.findIndex(c => c.id === cpn.id);
      if (idx !== -1) {
        this.coupons[idx] = { ...this.coupons[idx], ...cpn };
        saved = this.coupons[idx];
        this.logAudit('COUPON', cpn.id, `Updated coupon "${cpn.code}"`, actor);
      } else {
        saved = this.createCouponEntity(cpn, actor);
      }
    } else {
      saved = this.createCouponEntity(cpn, actor);
    }
    this.persist(STORAGE_KEY_COUPONS, this.coupons);
    return saved;
  }

  private createCouponEntity(cpn: Partial<Coupon>, actor: string): Coupon {
    const newCoupon: Coupon = {
      id: `cpn-${Date.now()}`,
      code: (cpn.code || 'SAVE10').toUpperCase().trim(),
      description: cpn.description || 'Special store discount',
      discountPercentage: cpn.discountPercentage || 10,
      maxDiscountPaise: cpn.maxDiscountPaise || 200000,
      minOrderValuePaise: cpn.minOrderValuePaise || 300000,
      usageLimit: cpn.usageLimit || 100,
      usedCount: 0,
      isActive: cpn.isActive ?? true,
      validUntil: cpn.validUntil || '2026-12-31'
    };
    this.coupons.push(newCoupon);
    this.logAudit('COUPON', newCoupon.id, `Created coupon "${newCoupon.code}"`, actor);
    return newCoupon;
  }

  // --- INVENTORY MANAGEMENT & RESERVATIONS ---
  public adjustStock(params: {
    productId: string;
    variantId: string;
    adjustment: number;
    reason: string;
    performedBy: string;
  }): { success: boolean; newStock: number; message: string } {
    const product = this.products.find(p => p.id === params.productId);
    if (!product) return { success: false, newStock: 0, message: 'Product not found' };

    const variant = product.variants.find(v => v.variantId === params.variantId);
    if (!variant) return { success: false, newStock: 0, message: 'Variant not found' };

    const projected = variant.inventoryStock + params.adjustment;
    if (projected < 0) {
      return { success: false, newStock: variant.inventoryStock, message: 'Cannot reduce stock below 0' };
    }

    variant.inventoryStock = projected;

    const mov: InventoryMovement = {
      id: `mov-${Math.random().toString(36).substring(2, 9)}`,
      productId: product.id,
      productName: product.name,
      variantId: variant.variantId,
      colorName: variant.colorName,
      sku: variant.sku,
      changeType: params.adjustment > 0 ? 'RESTOCK' : 'MANUAL_ADJUSTMENT',
      quantityChange: params.adjustment,
      stockAfter: variant.inventoryStock,
      reason: params.reason,
      performedBy: params.performedBy,
      timestamp: new Date().toISOString()
    };
    this.inventoryMovements.unshift(mov);
    this.logAudit('INVENTORY', product.id, `Stock adjusted by ${params.adjustment} (${params.reason}). Total on hand: ${projected}`, params.performedBy);

    this.persist(STORAGE_KEY_PRODUCTS, this.products);
    this.persist(STORAGE_KEY_MOVEMENTS, this.inventoryMovements);

    return { success: true, newStock: variant.inventoryStock, message: 'Stock updated successfully' };
  }

  public reserveStockForOrder(items: { productId: string; variantId: string; quantity: number }[]): { success: boolean; message?: string } {
    for (const item of items) {
      const product = this.products.find(p => p.id === item.productId);
      if (!product) return { success: false, message: `Product not found: ${item.productId}` };
      const variant = product.variants.find(v => v.variantId === item.variantId);
      if (!variant) return { success: false, message: `Variant not found: ${item.variantId}` };

      const available = variant.inventoryStock - variant.reservedStock;
      if (available < item.quantity) {
        return {
          success: false,
          message: `Insufficient inventory for ${product.name} (${variant.colorName}). Only ${available} available in handloom stock.`
        };
      }
    }

    for (const item of items) {
      const product = this.products.find(p => p.id === item.productId)!;
      const variant = product.variants.find(v => v.variantId === item.variantId)!;
      variant.reservedStock += item.quantity;

      this.inventoryMovements.unshift({
        id: `mov-${Math.random().toString(36).substring(2, 9)}`,
        productId: product.id,
        productName: product.name,
        variantId: variant.variantId,
        colorName: variant.colorName,
        sku: variant.sku,
        changeType: 'RESERVE',
        quantityChange: item.quantity,
        stockAfter: variant.inventoryStock - variant.reservedStock,
        reason: 'Reserved during checkout initiation',
        performedBy: 'Checkout System',
        timestamp: new Date().toISOString()
      });
    }

    this.persist(STORAGE_KEY_PRODUCTS, this.products);
    this.persist(STORAGE_KEY_MOVEMENTS, this.inventoryMovements);

    return { success: true };
  }

  public releaseOrderReservation(order: Order, reason = 'Order cancelled / Payment expired') {
    for (const item of order.items) {
      const product = this.products.find(p => p.id === item.productId);
      if (!product) continue;
      const variant = product.variants.find(v => v.variantId === item.variantId);
      if (!variant) continue;

      variant.reservedStock = Math.max(0, variant.reservedStock - item.quantity);

      this.inventoryMovements.unshift({
        id: `mov-${Math.random().toString(36).substring(2, 9)}`,
        productId: product.id,
        productName: product.name,
        variantId: variant.variantId,
        colorName: variant.colorName,
        sku: variant.sku,
        changeType: 'CANCEL_RELEASE',
        quantityChange: item.quantity,
        stockAfter: variant.inventoryStock - variant.reservedStock,
        reason,
        performedBy: 'System / Cancellation',
        timestamp: new Date().toISOString()
      });
    }

    this.persist(STORAGE_KEY_PRODUCTS, this.products);
    this.persist(STORAGE_KEY_MOVEMENTS, this.inventoryMovements);
  }

  public finalizeOrderPayment(orderId: string, razorpayPaymentId: string): boolean {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return false;

    for (const item of order.items) {
      const product = this.products.find(p => p.id === item.productId);
      if (!product) continue;
      const variant = product.variants.find(v => v.variantId === item.variantId);
      if (!variant) continue;

      variant.inventoryStock = Math.max(0, variant.inventoryStock - item.quantity);
      variant.reservedStock = Math.max(0, variant.reservedStock - item.quantity);

      this.inventoryMovements.unshift({
        id: `mov-${Math.random().toString(36).substring(2, 9)}`,
        productId: product.id,
        productName: product.name,
        variantId: variant.variantId,
        colorName: variant.colorName,
        sku: variant.sku,
        changeType: 'SALE',
        quantityChange: -item.quantity,
        stockAfter: variant.inventoryStock,
        reason: `Order ${order.orderNumber} confirmed & paid`,
        performedBy: 'Razorpay Gateway',
        timestamp: new Date().toISOString()
      });
    }

    order.paymentStatus = 'Paid';
    order.orderStatus = 'Order Confirmed';
    order.paymentDetails = {
      razorpayOrderId: order.paymentDetails?.razorpayOrderId || `order_${orderId}`,
      razorpayPaymentId,
      paidAt: new Date().toISOString(),
      method: 'Razorpay Verified (UPI/Card/NetBanking)'
    };

    order.statusHistory.push({
      status: 'Order Confirmed',
      timestamp: new Date().toISOString(),
      note: `Payment verified (${razorpayPaymentId}) and stock confirmed.`,
      actor: 'Razorpay Gateway'
    });
    order.updatedAt = new Date().toISOString();

    this.logAudit('ORDER', order.id, `Payment confirmed (${razorpayPaymentId}) for ${order.orderNumber}`, 'Payment Gateway');

    this.persist(STORAGE_KEY_ORDERS, this.orders);
    this.persist(STORAGE_KEY_PRODUCTS, this.products);
    this.persist(STORAGE_KEY_MOVEMENTS, this.inventoryMovements);

    return true;
  }

  // --- PRICING QUOTE ---
  public calculateQuote(params: {
    items: { productId: string; variantId: string; quantity: number }[];
    couponCode?: string;
  }): {
    subtotalPaise: number;
    couponDiscountPaise: number;
    shippingChargePaise: number;
    taxPaise: number;
    finalPayablePaise: number;
    couponApplied?: Coupon;
    itemSnapshots: OrderItem[];
  } {
    let subtotalPaise = 0;
    const itemSnapshots: OrderItem[] = [];

    for (const item of params.items) {
      const product = this.products.find(p => p.id === item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      const variant = product.variants.find(v => v.variantId === item.variantId);
      if (!variant) throw new Error(`Variant not found: ${item.variantId}`);

      const lineTotal = variant.sellingPricePaise * item.quantity;
      subtotalPaise += lineTotal;

      itemSnapshots.push({
        productId: product.id,
        variantId: variant.variantId,
        name: product.name,
        colorName: variant.colorName,
        sku: variant.sku,
        unitPricePaise: variant.sellingPricePaise,
        quantity: item.quantity,
        totalPaise: lineTotal,
        image: variant.images[0] || product.primaryImage,
        fabric: product.fabric
      });
    }

    let couponDiscountPaise = 0;
    let couponApplied: Coupon | undefined;
    if (params.couponCode) {
      const val = this.validateCoupon(params.couponCode, subtotalPaise);
      if (val.valid && val.coupon) {
        couponDiscountPaise = val.discountPaise;
        couponApplied = val.coupon;
      }
    }

    const discountedSubtotal = Math.max(0, subtotalPaise - couponDiscountPaise);
    const shippingChargePaise = discountedSubtotal >= this.settings.freeShippingThresholdPaise ? 0 : this.settings.standardShippingFeePaise;
    const taxPaise = Math.round((discountedSubtotal * this.settings.taxPercentage) / 100);
    const finalPayablePaise = discountedSubtotal + shippingChargePaise + taxPaise;

    return {
      subtotalPaise,
      couponDiscountPaise,
      shippingChargePaise,
      taxPaise,
      finalPayablePaise,
      couponApplied,
      itemSnapshots
    };
  }

  // --- ORDERS ---
  public createPendingOrder(params: {
    userId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    items: { productId: string; variantId: string; quantity: number }[];
    shippingAddress: DeliveryAddress;
    couponCode?: string;
  }): { success: boolean; order?: Order; razorpayOrderId?: string; message?: string } {
    const reserveResult = this.reserveStockForOrder(params.items);
    if (!reserveResult.success) {
      return { success: false, message: reserveResult.message };
    }

    const quote = this.calculateQuote({
      items: params.items,
      couponCode: params.couponCode
    });

    const orderId = `ord-${Date.now()}`;
    const orderNumber = `KFS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const razorpayOrderId = `order_${Math.random().toString(36).substring(2, 12)}`;

    const order: Order = {
      id: orderId,
      orderNumber,
      userId: params.userId,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
      items: quote.itemSnapshots,
      shippingAddressSnapshot: params.shippingAddress,
      subtotalPaise: quote.subtotalPaise,
      couponDiscountPaise: quote.couponDiscountPaise,
      shippingChargePaise: quote.shippingChargePaise,
      taxPaise: quote.taxPaise,
      finalPayablePaise: quote.finalPayablePaise,
      couponCodeApplied: quote.couponApplied?.code,
      orderStatus: 'Pending Payment',
      paymentStatus: 'Pending',
      paymentDetails: {
        razorpayOrderId
      },
      shipment: {},
      statusHistory: [
        {
          status: 'Pending Payment',
          timestamp: new Date().toISOString(),
          actor: 'Checkout Initiation'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.orders.unshift(order);
    this.logAudit('ORDER', order.id, `Created pending order ${orderNumber} for ${params.customerName}`, 'Customer');
    this.persist(STORAGE_KEY_ORDERS, this.orders);

    return {
      success: true,
      order,
      razorpayOrderId
    };
  }

  public getOrders(filter?: {
    userId?: string;
    status?: OrderStatus;
    search?: string;
  }): Order[] {
    let result = this.orders;
    if (filter?.userId) {
      const u = filter.userId.toLowerCase();
      result = result.filter(o => o.userId.toLowerCase() === u || o.customerEmail.toLowerCase() === u);
    }
    if (filter?.status) {
      result = result.filter(o => o.orderStatus === filter.status);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.customerPhone.includes(q)
      );
    }
    return result;
  }

  public getOrderById(orderId: string): Order | undefined {
    return this.orders.find(o => o.id === orderId || o.orderNumber === orderId);
  }

  public updateOrderStatus(orderId: string, newStatus: OrderStatus, actor: string, note?: string): boolean {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return false;

    if (newStatus === 'Cancelled') {
      if (['Shipped', 'Out for Delivery', 'Delivered'].includes(order.orderStatus)) {
        throw new Error('Order cannot be cancelled after dispatch or shipment.');
      }
      this.releaseOrderReservation(order, `Cancelled by ${actor}`);
      order.cancellation = {
        cancelledAt: new Date().toISOString(),
        reason: note || 'Cancelled by admin/customer',
        refundAmountPaise: order.paymentStatus === 'Paid' ? order.finalPayablePaise : 0,
        cancelledBy: actor
      };
      order.orderStatus = order.paymentStatus === 'Paid' ? 'Refund Pending' : 'Cancelled';
    } else {
      order.orderStatus = newStatus;
    }

    order.statusHistory.push({
      status: order.orderStatus,
      timestamp: new Date().toISOString(),
      note,
      actor
    });
    order.updatedAt = new Date().toISOString();

    this.logAudit('ORDER', order.id, `Status updated to ${order.orderStatus}`, actor);
    this.persist(STORAGE_KEY_ORDERS, this.orders);
    return true;
  }

  public updateShipmentDetails(orderId: string, shipment: Partial<Order['shipment']>, actor: string): boolean {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return false;

    order.shipment = { ...order.shipment, ...shipment };
    if (shipment.trackingNumber && order.orderStatus !== 'Shipped' && order.orderStatus !== 'Delivered') {
      order.orderStatus = 'Shipped';
      order.shipment.shippedAt = new Date().toISOString();
      order.statusHistory.push({
        status: 'Shipped',
        timestamp: new Date().toISOString(),
        note: `Dispatched with ${shipment.courierName || 'Courier Partner'}. Tracking #${shipment.trackingNumber}`,
        actor
      });
    }
    order.updatedAt = new Date().toISOString();
    this.logAudit('ORDER', order.id, `Updated shipment tracking: ${shipment.trackingNumber}`, actor);
    this.persist(STORAGE_KEY_ORDERS, this.orders);
    return true;
  }

  public processOrderRefund(orderId: string, refundAmountPaise: number, actor: string): boolean {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return false;

    order.paymentStatus = 'Refunded';
    order.orderStatus = 'Refunded';
    order.statusHistory.push({
      status: 'Refunded',
      timestamp: new Date().toISOString(),
      note: `Refund of ₹${Math.round(refundAmountPaise / 100).toLocaleString('en-IN')} confirmed to source account.`,
      actor
    });
    order.updatedAt = new Date().toISOString();
    this.logAudit('ORDER', order.id, `Refunded ₹${refundAmountPaise / 100}`, actor);
    this.persist(STORAGE_KEY_ORDERS, this.orders);
    return true;
  }

  // --- OTP & AUTH ---
  public requestOTP(email: string): { challengeId: string; expiresAt: number } {
    const cleanEmail = email.trim().toLowerCase();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const challengeId = `otp-${Math.random().toString(36).substring(2, 9)}`;
    const expiresAt = Date.now() + 5 * 60 * 1000;

    this.otpChallenges.set(challengeId, {
      email: cleanEmail,
      otp,
      expiresAt,
      attempts: 0
    });

    this.lastDispatchedEmail = {
      id: `email-${Date.now()}`,
      to: cleanEmail,
      from: `Kolhapuri Fashion Saree <${this.settings.supportEmail || 'ankitakhot015@gmail.com'}>`,
      subject: `✨ Your Kolhapuri Fashion Saree Verification Code: ${otp}`,
      sentAt: new Date().toISOString(),
      otp
    };

    try {
      fetch('/api/v1/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: cleanEmail,
          subject: `✨ Your Kolhapuri Fashion Saree Verification Code: ${otp}`,
          text: `Namaste,\n\nYour 6-digit OTP code for Kolhapuri Fashion Saree is: ${otp}\nValid for 5 minutes.\n\nKolhapuri Fashion Saree, Shivaji Nagar, Unchgaon, Kolhapur.`,
          otp
        })
      }).catch(() => {});
    } catch {}

    this.notifyListeners();
    return {
      challengeId,
      expiresAt
    };
  }

  public getLastDispatchedEmail(targetEmail?: string): DispatchedEmail | null {
    if (!this.lastDispatchedEmail) return null;
    if (targetEmail && this.lastDispatchedEmail.to.toLowerCase() !== targetEmail.trim().toLowerCase()) {
      return null;
    }
    return this.lastDispatchedEmail;
  }

  public verifyOTP(challengeId: string, inputOtp: string): { success: boolean; email?: string; message: string; session?: UserSession } {
    const challenge = this.otpChallenges.get(challengeId);
    if (!challenge) {
      return { success: false, message: 'Invalid or expired OTP session. Please request a new OTP.' };
    }

    if (Date.now() > challenge.expiresAt) {
      this.otpChallenges.delete(challengeId);
      return { success: false, message: 'OTP has expired (5-minute limit). Please request a new code.' };
    }

    challenge.attempts++;
    if (challenge.attempts > 5) {
      this.otpChallenges.delete(challengeId);
      return { success: false, message: 'Too many incorrect attempts. Please generate a new code.' };
    }

    if (inputOtp.trim() !== challenge.otp) {
      return { success: false, message: `Incorrect 6-digit code. ${5 - challenge.attempts} attempts remaining.` };
    }

    this.otpChallenges.delete(challengeId);

    const isAdmin = challenge.email === 'ankitakhot015@gmail.com' ||
                    challenge.email === 'ankita_wavecode' ||
                    challenge.email === 'akashkhot73@gmail.com';

    const session: UserSession = {
      email: challenge.email,
      fullName: challenge.email.split('@')[0],
      role: isAdmin ? 'admin' : 'customer',
      token: `kfs_${Math.random().toString(36).substring(2, 12)}`
    };

    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(session));
    return {
      success: true,
      email: challenge.email,
      message: 'Email successfully verified.',
      session
    };
  }

  public getSession(): UserSession | null {
    return this.session;
  }

  public setSession(session: UserSession | null) {
    this.session = session;
    if (session) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
    this.notifyListeners();
  }

  // --- CART ---
  public getCart(): CartItem[] {
    return this.cart;
  }

  public saveCart(cart: CartItem[]) {
    this.cart = cart;
    localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(cart));
    this.notifyListeners();
  }

  public addToCart(item: CartItem) {
    const current = [...this.cart];
    const existingIdx = current.findIndex(c => c.productId === item.productId && c.variantId === item.variantId);
    if (existingIdx !== -1) {
      current[existingIdx] = {
        ...current[existingIdx],
        quantity: current[existingIdx].quantity + item.quantity
      };
    } else {
      current.push(item);
    }
    this.saveCart(current);
  }

  public updateCartQuantity(productId: string, variantId: string, quantity: number) {
    let current = [...this.cart];
    if (quantity <= 0) {
      current = current.filter(c => !(c.productId === productId && c.variantId === variantId));
    } else {
      const idx = current.findIndex(c => c.productId === productId && c.variantId === variantId);
      if (idx !== -1) {
        current[idx] = { ...current[idx], quantity };
      }
    }
    this.saveCart(current);
  }

  public removeFromCart(productId: string, variantId: string) {
    const current = this.cart.filter(c => !(c.productId === productId && c.variantId === variantId));
    this.saveCart(current);
  }

  public clearCart() {
    this.saveCart([]);
  }

  // --- WISHLIST ---
  public getWishlist(): string[] {
    return this.wishlist;
  }

  public toggleWishlist(productId: string): boolean {
    const exists = this.wishlist.includes(productId);
    let updated: string[];
    if (exists) {
      updated = this.wishlist.filter(id => id !== productId);
    } else {
      updated = [...this.wishlist, productId];
    }
    this.wishlist = updated;
    localStorage.setItem(STORAGE_KEY_WISHLIST, JSON.stringify(updated));
    this.notifyListeners();
    return !exists;
  }

  // --- ADDRESSES ---
  public getAddresses(): DeliveryAddress[] {
    return this.addresses;
  }

  public saveAddress(addr: DeliveryAddress) {
    const current = [...this.addresses];
    if (addr.isDefault) {
      current.forEach(a => a.isDefault = false);
    }
    const idx = current.findIndex(a => a.id === addr.id);
    if (idx !== -1) {
      current[idx] = addr;
    } else {
      current.push(addr);
    }
    this.addresses = current;
    localStorage.setItem(STORAGE_KEY_ADDRESSES, JSON.stringify(current));
    this.notifyListeners();
  }

  // --- SETTINGS ---
  public getSettings(): StoreSettings {
    return this.settings;
  }

  public updateSettings(partial: Partial<StoreSettings>, actor: string): StoreSettings {
    this.settings = { ...this.settings, ...partial };
    this.logAudit('SETTINGS', 'global', 'Updated store settings & announcement rules', actor);
    this.persist(STORAGE_KEY_SETTINGS, this.settings);
    return this.settings;
  }

  // --- AUDIT LOGS ---
  public logAudit(entityType: AuditLogItem['entityType'], entityId: string, details: string, performedBy: string) {
    const log: AuditLogItem = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action: entityType,
      entityType,
      entityId,
      details,
      performedBy,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 300) this.auditLogs.pop();
    this.persist(STORAGE_KEY_AUDIT, this.auditLogs);
  }

  public getAuditLogs(): AuditLogItem[] {
    return this.auditLogs;
  }

  public getInventoryMovements(): InventoryMovement[] {
    return this.inventoryMovements;
  }

  // --- DASHBOARD METRICS ---
  public getDashboardStats() {
    const totalOrders = this.orders.length;
    const pendingOrders = this.orders.filter(o => o.orderStatus === 'Pending Payment').length;
    const processingOrders = this.orders.filter(o => ['Order Confirmed', 'Processing', 'Packed'].includes(o.orderStatus)).length;
    const shippedOrders = this.orders.filter(o => ['Shipped', 'Out for Delivery'].includes(o.orderStatus)).length;
    const deliveredOrders = this.orders.filter(o => o.orderStatus === 'Delivered').length;
    const cancelledOrders = this.orders.filter(o => o.orderStatus === 'Cancelled').length;

    const paidOrders = this.orders.filter(o => o.paymentStatus === 'Paid');
    const grossSalesPaise = this.orders.reduce((sum, o) => sum + o.finalPayablePaise, 0);
    const confirmedPaidRevenuePaise = paidOrders.reduce((sum, o) => sum + o.finalPayablePaise, 0);
    const pendingPaymentsPaise = this.orders.filter(o => o.paymentStatus === 'Pending').reduce((sum, o) => sum + o.finalPayablePaise, 0);
    const refundTotalsPaise = this.orders.filter(o => o.paymentStatus === 'Refunded').reduce((sum, o) => sum + o.finalPayablePaise, 0);

    const totalProducts = this.products.length;
    let lowStockProducts = 0;
    let outOfStockProducts = 0;

    for (const p of this.products) {
      const totalAvailable = p.variants.reduce((sum, v) => sum + (v.inventoryStock - v.reservedStock), 0);
      if (totalAvailable === 0) {
        outOfStockProducts++;
      } else if (totalAvailable <= 5) {
        lowStockProducts++;
      }
    }

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      grossSalesPaise,
      confirmedPaidRevenuePaise,
      pendingPaymentsPaise,
      refundTotalsPaise,
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalRegisteredCustomers: 148
    };
  }
}

export const storeService = new StoreService();
