import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Layers, 
  Image, 
  Tag, 
  Settings, 
  FileText, 
  ShieldCheck, 
  LogOut, 
  Plus, 
  Edit2, 
  Trash2, 
  Truck, 
  AlertTriangle, 
  ArrowLeft, 
  CheckCircle, 
  RefreshCw,
  Search,
  ExternalLink
} from 'lucide-react';
import { 
  SareeProduct, 
  CategoryItem, 
  PromotionalBanner, 
  Coupon, 
  Order, 
  OrderStatus, 
  InventoryMovement, 
  StoreSettings, 
  AuditLogItem 
} from '../../types/index.ts';
import { storeService } from '../../services/storeService.ts';
import { formatPriceINR, formatDate } from '../../utils/formatters.ts';

interface AdminPortalProps {
  onExitToStore: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onExitToStore }) => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'products' | 'orders' | 'inventory' | 'categories' | 'banners' | 'coupons' | 'settings' | 'audit'
  >('dashboard');

  const [session, setSession] = useState(storeService.getSession());
  const [stats, setStats] = useState(storeService.getDashboardStats());
  const [products, setProducts] = useState<SareeProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [banners, setBanners] = useState<PromotionalBanner[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(storeService.getSettings());

  // Editing modals
  const [editingProduct, setEditingProduct] = useState<Partial<SareeProduct> | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [stockAdjustItem, setStockAdjustItem] = useState<{ productId: string; variantId: string; productName: string; colorName: string; currentStock: number } | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState(5);
  const [adjustmentReason, setAdjustmentReason] = useState('New handloom shipment arrived from Kolhapur weavers');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [courierInput, setCourierInput] = useState('Blue Dart Express');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [trackingUrlInput, setTrackingUrlInput] = useState('https://www.bluedart.com');

  // Coupon form
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(15);
  const [newCouponMinOrder, setNewCouponMinOrder] = useState(4999);

  // Settings form
  const [announcementInput, setAnnouncementInput] = useState('');

  useEffect(() => {
    const update = () => {
      setSession(storeService.getSession());
      setStats(storeService.getDashboardStats());
      setProducts(storeService.getAllProductsAdmin());
      setOrders(storeService.getOrders());
      setCategories(storeService.getCategories());
      setBanners(storeService.getBanners(false));
      setCoupons(storeService.getCoupons());
      setMovements(storeService.getInventoryMovements());
      setAuditLogs(storeService.getAuditLogs());
      setSettings(storeService.getSettings());
    };
    update();
    return storeService.subscribe(update);
  }, []);

  const handleAdminAuth = () => {
    storeService.setSession({
      email: 'ankitakhot015@gmail.com',
      fullName: 'Ankita Khot (Owner)',
      phone: '9096863092',
      role: 'admin',
      token: 'adm_kfs_' + Date.now()
    });
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name) return;

    storeService.saveProduct(editingProduct, session?.fullName || 'Owner');
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this saree?')) {
      storeService.deleteProduct(id, session?.fullName || 'Owner');
    }
  };

  const handlePerformStockAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockAdjustItem) return;

    storeService.adjustStock({
      productId: stockAdjustItem.productId,
      variantId: stockAdjustItem.variantId,
      adjustment: Number(adjustmentAmount),
      reason: adjustmentReason,
      performedBy: session?.fullName || 'Owner'
    });
    setStockAdjustItem(null);
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    storeService.updateOrderStatus(orderId, status, session?.fullName || 'Owner', `Status updated in admin console`);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(storeService.getOrderById(orderId) || null);
    }
  };

  const handleAssignTracking = (orderId: string) => {
    if (!trackingNumberInput) return;
    storeService.updateShipmentDetails(orderId, {
      courierName: courierInput,
      trackingNumber: trackingNumberInput,
      trackingUrl: trackingUrlInput
    }, session?.fullName || 'Owner');
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(storeService.getOrderById(orderId) || null);
    }
    setTrackingNumberInput('');
  };

  const handleProcessRefund = (orderId: string, amountPaise: number) => {
    if (confirm(`Confirm refund of ${formatPriceINR(amountPaise)}?`)) {
      storeService.processOrderRefund(orderId, amountPaise, session?.fullName || 'Owner');
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(storeService.getOrderById(orderId) || null);
      }
    }
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;
    storeService.saveCoupon({
      code: newCouponCode.toUpperCase().trim(),
      description: `Save ${newCouponDiscount}% on orders above ₹${newCouponMinOrder}`,
      discountPercentage: Number(newCouponDiscount),
      minOrderValuePaise: Number(newCouponMinOrder) * 100,
      maxDiscountPaise: 300000,
      usageLimit: 200,
      isActive: true,
      validUntil: '2026-12-31'
    }, session?.fullName || 'Owner');
    setNewCouponCode('');
  };

  const handleAddAnnouncement = () => {
    if (!announcementInput.trim()) return;
    const current = [...(settings.announcementMessages || []), announcementInput.trim()];
    storeService.updateSettings({ announcementMessages: current }, session?.fullName || 'Owner');
    setAnnouncementInput('');
  };

  const handleRemoveAnnouncement = (index: number) => {
    const current = settings.announcementMessages.filter((_, i) => i !== index);
    storeService.updateSettings({ announcementMessages: current }, session?.fullName || 'Owner');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col">
      {/* Top Bar */}
      <header className="bg-[#641D32] text-white px-6 py-3.5 flex items-center justify-between border-b border-[#4A1223] shadow-sm z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={onExitToStore}
            className="flex items-center gap-1.5 text-xs text-[#C7A66A] hover:text-white transition-colors border border-[#C7A66A]/40 rounded px-2.5 py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Customer Website</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-lg text-[#FAF7F0]">Kolhapuri Fashion Saree</span>
            <span className="text-[11px] text-[#C7A66A] font-semibold bg-[#4A1223] px-2 py-0.5 rounded">Owner Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="hidden sm:inline text-white/80">Owner: Ankita Khot</span>
          <button
            onClick={onExitToStore}
            className="p-1.5 hover:text-[#C7A66A] transition-colors"
            title="Exit to store"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-60 bg-white border-r border-[#E6E0D8] p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'dashboard' ? 'bg-[#641D32] text-white' : 'text-[#292522] hover:bg-[#FAF7F0]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview & KPIs</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'orders' ? 'bg-[#641D32] text-white' : 'text-[#292522] hover:bg-[#FAF7F0]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-4 h-4" />
                <span>Orders & Tracking</span>
              </div>
              {orders.length > 0 && (
                <span className="bg-[#C7A66A] text-[#292522] px-1.5 py-0.2 rounded text-[10px] font-bold">
                  {orders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'products' ? 'bg-[#641D32] text-white' : 'text-[#292522] hover:bg-[#FAF7F0]'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Saree Catalog</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'inventory' ? 'bg-[#641D32] text-white' : 'text-[#292522] hover:bg-[#FAF7F0]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4" />
                <span>Inventory & Stocks</span>
              </div>
              {stats.lowStockProducts > 0 && (
                <span className="bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded text-[10px] font-bold">
                  {stats.lowStockProducts} Low
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'categories' ? 'bg-[#641D32] text-white' : 'text-[#292522] hover:bg-[#FAF7F0]'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Categories</span>
            </button>

            <button
              onClick={() => setActiveTab('banners')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'banners' ? 'bg-[#641D32] text-white' : 'text-[#292522] hover:bg-[#FAF7F0]'
              }`}
            >
              <Image className="w-4 h-4" />
              <span>Hero Banners</span>
            </button>

            <button
              onClick={() => setActiveTab('coupons')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'coupons' ? 'bg-[#641D32] text-white' : 'text-[#292522] hover:bg-[#FAF7F0]'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Coupons & Offers</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'settings' ? 'bg-[#641D32] text-white' : 'text-[#292522] hover:bg-[#FAF7F0]'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Store Configuration</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'audit' ? 'bg-[#641D32] text-white' : 'text-[#292522] hover:bg-[#FAF7F0]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Audit Logs</span>
            </button>
          </div>

          <div className="pt-4 border-t border-[#E6E0D8] text-[11px] text-[#766B61]">
            <p><strong>Boutique Address:</strong></p>
            <p className="mt-0.5 leading-tight">{settings.businessAddress}</p>
            <p className="mt-1 font-semibold text-[#641D32]">Ph: {settings.businessPhone}</p>
          </div>
        </aside>

        {/* Tab View Content */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          
          {/* 1. DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 max-w-6xl">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#292522]">Boutique Performance Dashboard</h2>
                <p className="text-xs text-[#766B61] mt-0.5">Authoritative metrics calculated from real database orders and stock movements.</p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-[#E6E0D8] shadow-xs space-y-1">
                  <span className="text-xs text-[#766B61] font-medium">Confirmed Paid Revenue</span>
                  <div className="text-2xl font-bold text-[#641D32] tabular-nums font-sans">
                    {formatPriceINR(stats.confirmedPaidRevenuePaise)}
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold">100% Verified Razorpay</span>
                </div>

                <div className="bg-white p-5 rounded-xl border border-[#E6E0D8] shadow-xs space-y-1">
                  <span className="text-xs text-[#766B61] font-medium">Total Orders Placed</span>
                  <div className="text-2xl font-bold text-[#292522] tabular-nums font-sans">
                    {stats.totalOrders}
                  </div>
                  <span className="text-[11px] text-[#766B61]">{stats.processingOrders} in processing / packaging</span>
                </div>

                <div className="bg-white p-5 rounded-xl border border-[#E6E0D8] shadow-xs space-y-1">
                  <span className="text-xs text-[#766B61] font-medium">Active Saree Weaves</span>
                  <div className="text-2xl font-bold text-[#292522] tabular-nums font-sans">
                    {stats.totalProducts}
                  </div>
                  <span className="text-[11px] text-[#766B61]">Across Paithani & Bridal Silks</span>
                </div>

                <div className="bg-white p-5 rounded-xl border border-[#E6E0D8] shadow-xs space-y-1">
                  <span className="text-xs text-[#766B61] font-medium">Low Stock Alerts</span>
                  <div className="text-2xl font-bold text-amber-700 tabular-nums font-sans">
                    {stats.lowStockProducts}
                  </div>
                  <span className="text-[11px] text-amber-800">Requires weaver restocking</span>
                </div>
              </div>

              {/* Recent Orders in Dashboard */}
              <div className="bg-white rounded-xl border border-[#E6E0D8] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-serif font-bold text-[#292522]">Recent Orders</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-[#641D32] hover:underline"
                  >
                    View All Orders →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#FAF7F0] text-[#766B61] font-semibold border-b border-[#E6E0D8]">
                      <tr>
                        <th className="p-3">Order Number</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Items</th>
                        <th className="p-3">Total Amount</th>
                        <th className="p-3">Payment</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E6E0D8]">
                      {orders.slice(0, 5).map((o) => (
                        <tr key={o.id} className="hover:bg-[#FAF7F0]/60">
                          <td className="p-3 font-mono font-bold text-[#641D32]">#{o.orderNumber}</td>
                          <td className="p-3">
                            <span className="font-semibold text-[#292522] block">{o.customerName}</span>
                            <span className="text-[#766B61] text-[11px]">{o.customerEmail}</span>
                          </td>
                          <td className="p-3 truncate max-w-[180px]">{o.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</td>
                          <td className="p-3 font-bold tabular-nums font-sans">{formatPriceINR(o.finalPayablePaise)}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              o.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {o.paymentStatus}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-semibold">{o.orderStatus}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. PRODUCTS MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-[#292522]">Saree Product Catalog Management</h2>
                  <p className="text-xs text-[#766B61] mt-0.5">Manage Paithani, Kanjivaram, and designer sarees, SKU, color variants, and prices.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingProduct({
                      name: '',
                      fabric: 'Pure Mulberry Silk',
                      occasion: 'Festive & Weddings',
                      lengthMeters: 6.3,
                      blousePiece: 'Running 0.8m unstitched silk piece included',
                      careInstructions: 'Dry clean only',
                      categoryNames: ['Silk Sarees'],
                      variants: [
                        {
                          variantId: `var-${Date.now()}-1`,
                          colorName: 'Royal Purple & Gold',
                          colorHex: '#4B0082',
                          sku: 'KFS-SILK-' + Math.floor(100 + Math.random() * 900),
                          originalPricePaise: 1699900,
                          sellingPricePaise: 1299900,
                          inventoryStock: 8,
                          reservedStock: 0,
                          images: [products[0]?.primaryImage || '']
                        }
                      ],
                      featured: true,
                      isPublished: true
                    });
                    setIsProductModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#641D32] hover:bg-[#4A1223] text-white text-xs font-semibold rounded-md shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Saree</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => {
                  const v = p.variants[0];
                  const totalStock = p.variants.reduce((sum, item) => sum + (item.inventoryStock - item.reservedStock), 0);
                  return (
                    <div key={p.id} className="bg-white rounded-xl border border-[#E6E0D8] overflow-hidden flex flex-col justify-between shadow-xs">
                      <div className="aspect-[4/3] bg-[#FAF7F0] relative overflow-hidden">
                        <img src={p.primaryImage} alt={p.name} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 flex gap-1">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setIsProductModalOpen(true);
                            }}
                            className="p-1.5 bg-white/90 hover:bg-white text-[#292522] rounded shadow-xs"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 bg-white/90 hover:bg-white text-red-600 rounded shadow-xs"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-[#766B61]">
                          <span>{p.fabric}</span>
                          <span>SKU: {p.sku}</span>
                        </div>
                        <h4 className="text-sm font-semibold font-serif text-[#292522] line-clamp-1">{p.name}</h4>
                        <div className="flex items-baseline justify-between pt-1 border-t border-[#E6E0D8]">
                          <span className="text-base font-bold text-[#641D32] tabular-nums font-sans">
                            {formatPriceINR(v?.sellingPricePaise || 0)}
                          </span>
                          <span className={`text-[11px] font-semibold ${totalStock <= 3 ? 'text-amber-700' : 'text-emerald-700'}`}>
                            Stock: {totalStock} units
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#292522]">Order & Shipment Tracking Management</h2>
                <p className="text-xs text-[#766B61] mt-0.5">Control order status lifecycle, dispatch shipments via Blue Dart/Delhivery, and handle authorized refunds.</p>
              </div>

              <div className="bg-white rounded-xl border border-[#E6E0D8] overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF7F0] text-[#766B61] font-semibold border-b border-[#E6E0D8]">
                    <tr>
                      <th className="p-3">Order Number</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Items</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Shipment</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E0D8]">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-[#FAF7F0]/60">
                        <td className="p-3 font-mono font-bold text-[#641D32]">#{o.orderNumber}</td>
                        <td className="p-3">
                          <span className="font-semibold text-[#292522] block">{o.customerName}</span>
                          <span className="text-[#766B61] text-[11px]">{o.customerPhone}</span>
                        </td>
                        <td className="p-3 max-w-[200px] truncate">{o.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</td>
                        <td className="p-3 font-bold tabular-nums font-sans">{formatPriceINR(o.finalPayablePaise)}</td>
                        <td className="p-3">
                          <select
                            value={o.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                            className="text-xs p-1 bg-[#FAF7F0] border border-[#E6E0D8] rounded font-semibold text-[#292522]"
                          >
                            <option value="Pending Payment">Pending Payment</option>
                            <option value="Payment Confirmed">Payment Confirmed</option>
                            <option value="Order Confirmed">Order Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Packed">Packed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Refunded">Refunded</option>
                          </select>
                        </td>
                        <td className="p-3">
                          {o.shipment?.trackingNumber ? (
                            <span className="font-mono text-[11px] text-[#641D32] font-semibold">
                              {o.shipment.courierName}: {o.shipment.trackingNumber}
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedOrder(o);
                                setTrackingNumberInput(`BDKOL${Date.now().toString().slice(-6)}`);
                              }}
                              className="text-[11px] text-[#641D32] hover:underline font-semibold"
                            >
                              + Assign Courier
                            </button>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="px-2.5 py-1 bg-[#FAF7F0] hover:bg-white text-[#292522] border border-[#E6E0D8] rounded font-medium text-[11px]"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Order Detail Side Drawer / Modal */}
              {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                  <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl border border-[#E6E0D8] space-y-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E6E0D8]">
                      <div>
                        <span className="text-xs text-[#766B61]">Order Inspector</span>
                        <h3 className="text-lg font-mono font-bold text-[#641D32]">#{selectedOrder.orderNumber}</h3>
                      </div>
                      <button onClick={() => setSelectedOrder(null)} className="p-1 text-[#766B61] hover:text-[#292522]">
                        ✕
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <strong className="block text-[#292522] mb-1">Customer Delivery Address:</strong>
                        <p className="text-[#766B61]">
                          {selectedOrder.shippingAddressSnapshot.fullName}<br />
                          {selectedOrder.shippingAddressSnapshot.addressLine1}<br />
                          {selectedOrder.shippingAddressSnapshot.city}, {selectedOrder.shippingAddressSnapshot.state} - {selectedOrder.shippingAddressSnapshot.pinCode}<br />
                          Phone: {selectedOrder.shippingAddressSnapshot.mobileNumber} · Email: {selectedOrder.customerEmail}
                        </p>
                      </div>

                      {/* Shipment Tracking assignment form */}
                      <div className="p-3 bg-[#FAF7F0] border border-[#E6E0D8] rounded-md space-y-2">
                        <strong className="block text-[#292522]">Shipment Tracking Assignment:</strong>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Courier (e.g. Blue Dart)"
                            value={courierInput}
                            onChange={(e) => setCourierInput(e.target.value)}
                            className="p-1.5 bg-white border border-[#E6E0D8] rounded text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Tracking Number"
                            value={trackingNumberInput}
                            onChange={(e) => setTrackingNumberInput(e.target.value)}
                            className="p-1.5 bg-white border border-[#E6E0D8] rounded text-xs font-mono"
                          />
                        </div>
                        <button
                          onClick={() => handleAssignTracking(selectedOrder.id)}
                          className="w-full py-1.5 bg-[#641D32] text-white text-xs font-semibold rounded hover:bg-[#4A1223]"
                        >
                          Save & Mark Order Shipped
                        </button>
                      </div>

                      {/* Refund Trigger if order eligible */}
                      {selectedOrder.paymentStatus === 'Paid' && selectedOrder.orderStatus !== 'Refunded' && (
                        <div className="pt-2 border-t border-[#E6E0D8] flex items-center justify-between">
                          <span className="text-[#766B61]">Need to cancel/refund?</span>
                          <button
                            onClick={() => handleProcessRefund(selectedOrder.id, selectedOrder.finalPayablePaise)}
                            className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white rounded font-medium text-xs"
                          >
                            Process Refund ({formatPriceINR(selectedOrder.finalPayablePaise)})
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. INVENTORY & STOCK */}
          {activeTab === 'inventory' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#292522]">Handloom Inventory Management</h2>
                <p className="text-xs text-[#766B61] mt-0.5">Real-time tracking of available stock, reserved stock, and physical stock adjustments.</p>
              </div>

              <div className="bg-white rounded-xl border border-[#E6E0D8] overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF7F0] text-[#766B61] font-semibold border-b border-[#E6E0D8]">
                    <tr>
                      <th className="p-3">Saree Name</th>
                      <th className="p-3">Color Variant</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">On Hand</th>
                      <th className="p-3">Reserved</th>
                      <th className="p-3">Available</th>
                      <th className="p-3 text-right">Adjustment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E0D8]">
                    {products.flatMap((p) =>
                      p.variants.map((v) => {
                        const available = v.inventoryStock - v.reservedStock;
                        return (
                          <tr key={v.variantId} className="hover:bg-[#FAF7F0]/60">
                            <td className="p-3 font-medium text-[#292522]">{p.name}</td>
                            <td className="p-3 flex items-center gap-1.5">
                              <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: v.colorHex }} />
                              <span>{v.colorName}</span>
                            </td>
                            <td className="p-3 font-mono text-[11px] text-[#766B61]">{v.sku}</td>
                            <td className="p-3 font-bold tabular-nums">{v.inventoryStock}</td>
                            <td className="p-3 tabular-nums text-amber-800">{v.reservedStock}</td>
                            <td className="p-3">
                              <span className={`font-bold tabular-nums ${available <= 3 ? 'text-amber-700' : 'text-emerald-700'}`}>
                                {available} units
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => setStockAdjustItem({
                                  productId: p.id,
                                  variantId: v.variantId,
                                  productName: p.name,
                                  colorName: v.colorName,
                                  currentStock: v.inventoryStock
                                })}
                                className="px-2.5 py-1 bg-[#FAF7F0] hover:bg-white text-[#641D32] border border-[#E6E0D8] rounded font-semibold text-[11px]"
                              >
                                Adjust Stock
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Movement Logs */}
              <div className="bg-white rounded-xl border border-[#E6E0D8] p-6 shadow-xs space-y-3">
                <h3 className="text-sm font-serif font-bold text-[#292522]">Stock Movement History</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {movements.slice(0, 15).map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-2 rounded bg-[#FAF7F0] text-xs">
                      <div>
                        <span className="font-semibold text-[#292522]">{m.productName} ({m.colorName})</span>
                        <span className="text-[#766B61] text-[11px] block">{m.reason} · {formatDate(m.timestamp)}</span>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold tabular-nums ${m.quantityChange > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                          {m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange}
                        </span>
                        <span className="text-[11px] text-[#766B61] block">Stock: {m.stockAfter}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. CATEGORIES & BANNERS */}
          {activeTab === 'categories' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#292522]">Circular Saree Category Manager</h2>
                <p className="text-xs text-[#766B61] mt-0.5">Control categories displayed on the customer homepage.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map((c) => (
                  <div key={c.id} className="bg-white rounded-xl border border-[#E6E0D8] p-4 flex items-center gap-3 shadow-xs">
                    <img src={c.imageUrl} alt={c.name} className="w-14 h-14 rounded-full object-cover border" />
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-[#292522] font-serif">{c.name}</h4>
                      <span className="text-[11px] text-emerald-700 font-semibold">Active Category</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. HERO BANNERS */}
          {activeTab === 'banners' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#292522]">Promotional Hero Carousel Banners</h2>
                <p className="text-xs text-[#766B61] mt-0.5">Manage banners rotating on the storefront homepage.</p>
              </div>

              <div className="space-y-4">
                {banners.map((b) => (
                  <div key={b.id} className="bg-white rounded-xl border border-[#E6E0D8] p-4 flex gap-4 items-center shadow-xs">
                    <img src={b.imageUrl} alt={b.heading} className="w-32 h-20 rounded-lg object-cover" />
                    <div className="flex-1 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#C7A66A]">{b.badgeText}</span>
                      <h4 className="text-sm font-bold font-serif text-[#292522]">{b.heading}</h4>
                      <p className="text-xs text-[#766B61]">{b.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. COUPONS */}
          {activeTab === 'coupons' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#292522]">Discount Coupons & Offers</h2>
                <p className="text-xs text-[#766B61] mt-0.5">Create coupon codes (e.g. FESTIVE10, KOLHAPUR20) with minimum order values.</p>
              </div>

              {/* Add Coupon Form */}
              <form onSubmit={handleAddCoupon} className="bg-white p-5 rounded-xl border border-[#E6E0D8] flex flex-wrap gap-4 items-end shadow-xs text-xs">
                <div>
                  <label className="font-semibold text-[#292522] block mb-1">Coupon Code</label>
                  <input
                    type="text"
                    placeholder="e.g. SPECIAL20"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    className="p-2 border border-[#E6E0D8] rounded bg-[#FAF7F0] font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#292522] block mb-1">Discount %</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={newCouponDiscount}
                    onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                    className="p-2 border border-[#E6E0D8] rounded bg-[#FAF7F0] w-24"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#292522] block mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={newCouponMinOrder}
                    onChange={(e) => setNewCouponMinOrder(Number(e.target.value))}
                    className="p-2 border border-[#E6E0D8] rounded bg-[#FAF7F0] w-28"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#641D32] hover:bg-[#4A1223] text-white font-semibold rounded"
                >
                  Create Coupon Code
                </button>
              </form>

              {/* Coupons list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.map((cp) => (
                  <div key={cp.id} className="bg-white p-5 rounded-xl border border-[#E6E0D8] space-y-2 shadow-xs">
                    <div className="flex justify-between items-start">
                      <span className="font-mono font-bold text-base text-[#641D32] bg-[#FAF7F0] px-2 py-0.5 rounded border border-[#E6E0D8]">
                        {cp.code}
                      </span>
                      <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {cp.discountPercentage}% OFF
                      </span>
                    </div>
                    <p className="text-xs text-[#766B61]">{cp.description}</p>
                    <div className="text-[11px] text-[#766B61] pt-2 border-t border-[#E6E0D8]">
                      Min Order: ₹{Math.round(cp.minOrderValuePaise / 100).toLocaleString('en-IN')} · Redemptions: {cp.usedCount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#292522]">Store Configuration & Policies</h2>
                <p className="text-xs text-[#766B61] mt-0.5">Control announcement banner messages, business address, and shipping fees.</p>
              </div>

              {/* Rotating Announcement Bar Manager */}
              <div className="bg-white p-6 rounded-xl border border-[#E6E0D8] space-y-4 shadow-xs">
                <h3 className="text-sm font-serif font-bold text-[#292522]">Homepage Announcement Bar Messages</h3>
                <div className="space-y-2">
                  {settings.announcementMessages.map((msg, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-[#FAF7F0] rounded border border-[#E6E0D8] text-xs">
                      <span>{msg}</span>
                      <button
                        onClick={() => handleRemoveAnnouncement(idx)}
                        className="text-red-600 hover:text-red-800 text-xs font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add promotional message for the top bar..."
                    value={announcementInput}
                    onChange={(e) => setAnnouncementInput(e.target.value)}
                    className="flex-1 p-2 text-xs bg-[#FAF7F0] border border-[#E6E0D8] rounded focus:outline-none focus:border-[#641D32]"
                  />
                  <button
                    onClick={handleAddAnnouncement}
                    className="px-4 py-2 bg-[#641D32] hover:bg-[#4A1223] text-white text-xs font-semibold rounded"
                  >
                    Add Message
                  </button>
                </div>
              </div>

              {/* Business Contact & Shipping */}
              <div className="bg-white p-6 rounded-xl border border-[#E6E0D8] space-y-4 shadow-xs text-xs">
                <h3 className="text-sm font-serif font-bold text-[#292522]">Brand & Shipping Rules</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-1">Business Phone & WhatsApp</label>
                    <input
                      type="text"
                      value={settings.businessPhone}
                      onChange={(e) => storeService.updateSettings({ businessPhone: e.target.value, whatsappContact: e.target.value }, 'Owner')}
                      className="w-full p-2 bg-[#FAF7F0] border border-[#E6E0D8] rounded"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Instagram Handle</label>
                    <input
                      type="text"
                      value={settings.instagramHandle}
                      onChange={(e) => storeService.updateSettings({ instagramHandle: e.target.value }, 'Owner')}
                      className="w-full p-2 bg-[#FAF7F0] border border-[#E6E0D8] rounded"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-semibold block mb-1">Physical Boutique Address</label>
                    <input
                      type="text"
                      value={settings.businessAddress}
                      onChange={(e) => storeService.updateSettings({ businessAddress: e.target.value }, 'Owner')}
                      className="w-full p-2 bg-[#FAF7F0] border border-[#E6E0D8] rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 9. AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#292522]">Security & Action Audit Logs</h2>
                <p className="text-xs text-[#766B61] mt-0.5">Chronological record of every administrative action, stock mutation, and order transition.</p>
              </div>

              <div className="bg-white rounded-xl border border-[#E6E0D8] p-5 shadow-xs">
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-[#FAF7F0] rounded border border-[#E6E0D8] text-xs flex items-start justify-between">
                      <div>
                        <span className="font-semibold text-[#641D32] uppercase tracking-wider text-[10px]">
                          [{log.entityType}]
                        </span>
                        <p className="font-medium text-[#292522] mt-0.5">{log.details}</p>
                        <span className="text-[#766B61] text-[11px] block mt-0.5">
                          By: {log.performedBy}
                        </span>
                      </div>
                      <span className="text-[#766B61] text-[11px] shrink-0">
                        {formatDate(log.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Stock Adjustment Dialog */}
      {stockAdjustItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form onSubmit={handlePerformStockAdjustment} className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-[#E6E0D8] space-y-4 text-xs">
            <h3 className="text-base font-serif font-bold text-[#292522]">
              Adjust Handloom Stock: {stockAdjustItem.productName}
            </h3>
            <p className="text-[#766B61]">Color: {stockAdjustItem.colorName} · Current on-hand: {stockAdjustItem.currentStock} units</p>

            <div>
              <label className="font-semibold block mb-1">Quantity Change (+ to add, - to subtract)</label>
              <input
                type="number"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(Number(e.target.value))}
                className="w-full p-2 bg-[#FAF7F0] border border-[#E6E0D8] rounded font-bold"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Reason for Adjustment</label>
              <input
                type="text"
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                className="w-full p-2 bg-[#FAF7F0] border border-[#E6E0D8] rounded"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStockAdjustItem(null)}
                className="flex-1 py-2 border border-[#E6E0D8] rounded font-medium hover:bg-[#FAF7F0]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-[#641D32] hover:bg-[#4A1223] text-white font-semibold rounded"
              >
                Confirm Update
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add / Edit Saree Modal */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form onSubmit={handleSaveProduct} className="bg-white rounded-xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#E6E0D8] space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E0D8]">
              <h3 className="text-base font-serif font-bold text-[#292522]">
                {editingProduct.id ? 'Edit Saree Specifications' : 'Add New Saree to Catalog'}
              </h3>
              <button type="button" onClick={() => setIsProductModalOpen(false)} className="text-[#766B61]">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="font-semibold block mb-1">Saree Name</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="e.g. Royal Kolhapuri Paithani Pure Silk Saree"
                  className="w-full p-2 bg-[#FAF7F0] border border-[#E6E0D8] rounded"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Fabric</label>
                <input
                  type="text"
                  value={editingProduct.fabric || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, fabric: e.target.value })}
                  className="w-full p-2 bg-[#FAF7F0] border border-[#E6E0D8] rounded"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Occasion</label>
                <input
                  type="text"
                  value={editingProduct.occasion || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, occasion: e.target.value })}
                  className="w-full p-2 bg-[#FAF7F0] border border-[#E6E0D8] rounded"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Original Price (₹)</label>
                <input
                  type="number"
                  value={editingProduct.variants?.[0] ? Math.round(editingProduct.variants[0].originalPricePaise / 100) : 15999}
                  onChange={(e) => {
                    const price = Number(e.target.value) * 100;
                    const variants = [...(editingProduct.variants || [])];
                    if (variants[0]) variants[0].originalPricePaise = price;
                    setEditingProduct({ ...editingProduct, variants });
                  }}
                  className="w-full p-2 bg-[#FAF7F0] border border-[#E6E0D8] rounded"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Discounted Selling Price (₹)</label>
                <input
                  type="number"
                  value={editingProduct.variants?.[0] ? Math.round(editingProduct.variants[0].sellingPricePaise / 100) : 12999}
                  onChange={(e) => {
                    const price = Number(e.target.value) * 100;
                    const variants = [...(editingProduct.variants || [])];
                    if (variants[0]) variants[0].sellingPricePaise = price;
                    setEditingProduct({ ...editingProduct, variants });
                  }}
                  className="w-full p-2 bg-[#FAF7F0] border border-[#E6E0D8] rounded"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold block mb-1">Detailed Weaving Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full p-2 bg-[#FAF7F0] border border-[#E6E0D8] rounded"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-[#E6E0D8]">
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="flex-1 py-2 border border-[#E6E0D8] rounded font-medium hover:bg-[#FAF7F0]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-[#641D32] hover:bg-[#4A1223] text-white font-semibold rounded"
              >
                Save Saree
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
