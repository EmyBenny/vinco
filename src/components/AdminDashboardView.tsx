import {
  ArrowLeft,
  BarChart3,
  Box,
  Mail,
  MapPin,
  Megaphone,
  Minus,
  PackageCheck,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { STORE_INFO } from '../data/storeInfo';
import { formatNaira, type CategoryType, type OrderStatus, type Product } from '../types/ecommerce';

interface AdminDashboardViewProps {
  onBackToStore?: () => void;
}

const CATEGORY_IMAGE_MAP: Record<Exclude<CategoryType, 'All'>, string> = {
  Towels: '/src/assets/images/vinco_towels_stack_1795273636429.jpg',
  Bathrobes: '/src/assets/images/vinco_bathrobe_sage_1795273635860.jpg',
  Pyjamas: '/src/assets/images/vinco_pyjamas_set_1795273636266.jpg',
  Blankets: '/src/assets/images/vinco_students_blanket_1795274681854.jpg',
  Boxers: '/src/assets/images/vinco_boxers_pack_1795274681522.jpg',
  Bedcovers: '/src/assets/images/vinco_stretching_bedcover_1795274681529.jpg',
  Essentials: '/src/assets/images/vinco_bath_collection_1795273635717.jpg',
};

export function AdminDashboardView({ onBackToStore }: AdminDashboardViewProps) {
  const {
    products,
    orders,
    emailLogs,
    adjustProductStock,
    upsertProduct,
    deleteProduct,
    updateOrderStatus,
    sendPromoBroadcast,
    refreshEmailLogs,
    pushLocalToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'analytics' | 'inventory' | 'orders' | 'communications'>('analytics');
  const [inventorySearch, setInventorySearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderStatus>('all');
  const [promoTitle, setPromoTitle] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [sendingPromo, setSendingPromo] = useState(false);

  const [skuModalOpen, setSkuModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [skuTitle, setSkuTitle] = useState('');
  const [skuSubtitle, setSkuSubtitle] = useState('');
  const [skuCategory, setSkuCategory] = useState<Exclude<CategoryType, 'All'>>('Towels');
  const [skuPrice, setSkuPrice] = useState('25000');
  const [skuStock, setSkuStock] = useState('20');
  const [skuThreshold, setSkuThreshold] = useState('5');
  const [skuDescription, setSkuDescription] = useState('');

  const analytics = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'cancelled');
    const grossRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
    const totalUnitsSold = validOrders.reduce(
      (sum, o) => sum + o.items.reduce((s, item) => s + item.quantity, 0),
      0
    );
    const totalInventoryUnits = products.reduce((sum, p) => sum + p.stock, 0);
    const lowStockProducts = products.filter((p) => p.stock <= p.lowStockThreshold);

    const revenueByCategory: Record<string, number> = {
      Towels: 0,
      Bathrobes: 0,
      Pyjamas: 0,
      Blankets: 0,
      Boxers: 0,
      Bedcovers: 0,
      Essentials: 0,
    };

    for (const order of validOrders) {
      for (const item of order.items) {
        const prod = products.find((p) => p.id === item.productId);
        const cat = prod?.category || 'Towels';
        revenueByCategory[cat] = (revenueByCategory[cat] || 0) + item.price * item.quantity;
      }
    }

    const maxCatRev = Math.max(1, ...Object.values(revenueByCategory));

    return {
      grossRevenue,
      orderCount: validOrders.length,
      totalUnitsSold,
      totalInventoryUnits,
      lowStockProducts,
      revenueByCategory,
      maxCatRev,
    };
  }, [orders, products]);

  const filteredInventory = useMemo(() => {
    const q = inventorySearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q)
    );
  }, [products, inventorySearch]);

  const filteredOrders = useMemo(() => {
    if (orderStatusFilter === 'all') return orders;
    return orders.filter((o) => o.status === orderStatusFilter);
  }, [orders, orderStatusFilter]);

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoTitle.trim() || !promoMessage.trim()) return;
    setSendingPromo(true);
    try {
      await sendPromoBroadcast(promoTitle, promoMessage);
      setPromoTitle('');
      setPromoMessage('');
      pushLocalToast({
        title: 'Promotion Pushed',
        message: 'Live alert delivered to all connected Vinco & More shoppers.',
        tone: 'emerald',
      });
    } finally {
      setSendingPromo(false);
    }
  };

  const openAddSkuModal = () => {
    setEditingProduct(null);
    setSkuTitle('');
    setSkuSubtitle('');
    setSkuCategory('Towels');
    setSkuPrice('25000');
    setSkuStock('20');
    setSkuThreshold('5');
    setSkuDescription('');
    setSkuModalOpen(true);
  };

  const openEditSkuModal = (product: Product) => {
    setEditingProduct(product);
    setSkuTitle(product.title);
    setSkuSubtitle(product.subtitle);
    setSkuCategory(product.category);
    setSkuPrice(String(product.price));
    setSkuStock(String(product.stock));
    setSkuThreshold(String(product.lowStockThreshold));
    setSkuDescription(product.description);
    setSkuModalOpen(true);
  };

  const handleSaveSku = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = skuTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48);
    if (!slug) return;

    const defaultImg = CATEGORY_IMAGE_MAP[skuCategory] || CATEGORY_IMAGE_MAP.Towels;
    const priceNum = Math.max(500, Number(skuPrice) || 25000);
    const stockNum = Math.max(0, Math.round(Number(skuStock) || 0));
    const thresholdNum = Math.max(1, Math.round(Number(skuThreshold) || 5));

    const payload: Omit<Product, 'createdAtMs' | 'updatedAtMs'> = editingProduct
      ? {
          id: editingProduct.id,
          title: skuTitle.trim(),
          subtitle: skuSubtitle.trim() || editingProduct.subtitle,
          category: skuCategory,
          price: priceNum,
          stock: stockNum,
          lowStockThreshold: thresholdNum,
          description: skuDescription.trim() || editingProduct.description,
          fabricSpecs: editingProduct.fabricSpecs,
          colors: editingProduct.colors,
          sizes: editingProduct.sizes,
          styles: editingProduct.styles,
          imageUrl: editingProduct.imageUrl || defaultImg,
          galleryImages: editingProduct.galleryImages.length ? editingProduct.galleryImages : [defaultImg],
          featured: editingProduct.featured,
          badge: editingProduct.badge,
          rating: editingProduct.rating,
          reviewCount: editingProduct.reviewCount,
        }
      : {
          id: `${slug}-${Date.now().toString().slice(-4)}`,
          title: skuTitle.trim(),
          subtitle: skuSubtitle.trim() || 'Vinco & More Emerald & Gold Collection',
          category: skuCategory,
          price: priceNum,
          stock: stockNum,
          lowStockThreshold: thresholdNum,
          description:
            skuDescription.trim() ||
            'Crafted by Vinco & More using breathable natural fibres for everyday comfort.',
          fabricSpecs: '600GSM Combed Organic Cotton',
          colors: ['Sharp Emerald', 'Royal Gold', 'Warm Ivory'],
          sizes: ['Standard', 'M', 'L', 'Queen'],
          styles: ['Plush', 'Waffle'],
          imageUrl: defaultImg,
          galleryImages: [defaultImg],
          featured: false,
          badge: 'New Drop',
          rating: 4.9,
          reviewCount: 1,
        };

    await upsertProduct(payload);
    setSkuModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-28 space-y-6">
      {/* Dedicated Admin Portal Header */}
      <section className="bg-gradient-to-r from-[#004D2C] via-[#006837] to-[#004D2C] rounded-3xl p-6 text-white border border-[#D4AF37] shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#F3E5AB]">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>Vinco &amp; More</span>
              <span aria-hidden="true">/</span>
              <span>Admin Portal</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight">
              Vinco &amp; More Admin Portal
            </h1>
            <p className="text-xs sm:text-sm text-[#E3EED4]/90 max-w-2xl">
              Manage Naira revenue analytics, catalog SKUs, real-time warehouse stock, order fulfillment, and customer push alerts.
            </p>
            <p className="text-xs text-[#F3E5AB] inline-flex items-center gap-1.5 pt-1">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span>
                {STORE_INFO.headOfficeLabel}: {STORE_INFO.fullAddress}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onBackToStore && (
              <button
                type="button"
                onClick={onBackToStore}
                className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-[#D4AF37]/70 text-xs font-bold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#F3E5AB]" />
                Back to Storefront
              </button>
            )}
            <button
              type="button"
              onClick={openAddSkuModal}
              className="px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#F3E5AB] text-[#003B20] text-xs font-bold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              New Product SKU
            </button>
          </div>
        </div>
      </section>

      {/* Portal Workspace Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-white border border-[#D4AF37]/60 rounded-2xl overflow-x-auto no-scrollbar">
          {[
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'inventory', label: `Inventory (${products.length})`, icon: Box },
            { id: 'orders', label: `Orders (${orders.length})`, icon: PackageCheck },
            { id: 'communications', label: 'Email & Push', icon: Mail },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#006837] text-[#F3E5AB] ring-1 ring-[#D4AF37]'
                    : 'text-[#006837] hover:text-[#004D2C] hover:bg-[#E3EED4]/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <span className="text-xs font-medium text-[#3B7A57] tabular-nums">
          Currency: Nigerian Naira (NGN) · {analytics.lowStockProducts.length} low-stock alert(s)
        </span>
      </div>

      {/* 4-Column KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#D4AF37]/60">
          <p className="text-xs font-medium text-[#3B7A57]">Gross Revenue</p>
          <p className="font-mono text-2xl font-bold text-[#004D2C] mt-1 tabular-nums">
            {formatNaira(analytics.grossRevenue)}
          </p>
          <p className="text-[11px] text-[#006837] mt-1 tabular-nums font-medium">
            {analytics.orderCount} verified order(s)
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#D4AF37]/60">
          <p className="text-xs font-medium text-[#3B7A57]">Units Sold</p>
          <p className="font-mono text-2xl font-bold text-[#004D2C] mt-1 tabular-nums">
            {analytics.totalUnitsSold}
          </p>
          <p className="text-[11px] text-[#3B7A57] mt-1">Across Vinco &amp; More catalog</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#D4AF37]/60">
          <p className="text-xs font-medium text-[#3B7A57]">Warehouse Stock</p>
          <p className="font-mono text-2xl font-bold text-[#004D2C] mt-1 tabular-nums">
            {analytics.totalInventoryUnits}
          </p>
          <p className="text-[11px] text-[#3B7A57] mt-1 tabular-nums">{products.length} active SKUs</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#D4AF37]/60">
          <p className="text-xs font-medium text-[#3B7A57]">Low Stock Alerts</p>
          <p
            className={`font-mono text-2xl font-bold mt-1 tabular-nums ${
              analytics.lowStockProducts.length > 0 ? 'text-[#B8860B]' : 'text-[#006837]'
            }`}
          >
            {analytics.lowStockProducts.length}
          </p>
          <p className="text-[11px] text-[#3B7A57] mt-1">
            {analytics.lowStockProducts.length > 0 ? 'Restock recommended' : 'All SKUs healthy'}
          </p>
        </div>
      </div>

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#D4AF37]/60 space-y-4">
            <h2 className="font-display text-base font-bold text-[#004D2C]">Revenue by Category</h2>
            <div className="space-y-3">
              {Object.entries(analytics.revenueByCategory).map(([category, rev]) => {
                const pct = Math.round((rev / analytics.maxCatRev) * 100);
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[#004D2C]">{category}</span>
                      <span className="font-mono font-bold text-[#004D2C] tabular-nums">
                        {formatNaira(rev)}
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-[#E3EED4] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#006837] to-[#D4AF37] transition-all"
                        style={{ width: `${Math.max(rev > 0 ? 6 : 0, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#D4AF37]/60 space-y-4">
            <h2 className="font-display text-base font-bold text-[#004D2C]">Stock Health Watchlist</h2>
            {analytics.lowStockProducts.length === 0 ? (
              <p className="text-xs text-[#3B7A57] py-8 text-center">
                All Vinco &amp; More SKUs are above their configured restock threshold.
              </p>
            ) : (
              <div className="divide-y divide-[#E3EED4]">
                {analytics.lowStockProducts.map((p) => (
                  <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#004D2C]">{p.title}</p>
                      <p className="text-xs text-[#B8860B] font-medium tabular-nums">
                        {p.stock} left (threshold {p.lowStockThreshold})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void adjustProductStock(p.id, p.stock + 10)}
                      className="px-3 py-1.5 rounded-xl bg-[#E3EED4] border border-[#D4AF37]/70 text-[#004D2C] text-xs font-bold hover:bg-[#D4AF37]/30 whitespace-nowrap"
                    >
                      +10 Restock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* INVENTORY TAB */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-[#D4AF37]/60 overflow-hidden">
          <div className="p-5 border-b border-[#AEC3B0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-display text-base font-bold text-[#004D2C]">Live Warehouse Inventory</h2>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 bg-[#E3EED4]/60 border border-[#AEC3B0] rounded-xl px-3 py-1.5">
                <Search className="w-3.5 h-3.5 text-[#006837]" />
                <input
                  type="search"
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  placeholder="Filter SKUs..."
                  aria-label="Filter inventory SKUs"
                  className="bg-transparent text-xs text-[#004D2C] placeholder:text-[#3B7A57] outline-none w-36 sm:w-48"
                />
              </div>
              <button
                type="button"
                onClick={openAddSkuModal}
                className="px-4 py-2 rounded-xl bg-[#006837] text-white border border-[#D4AF37] text-xs font-bold flex items-center gap-1.5 hover:bg-[#004D2C] transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4 text-[#D4AF37]" />
                Add SKU
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#E3EED4]/60 text-[#006837] border-b border-[#AEC3B0]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Product</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold text-right">Price</th>
                  <th className="py-3 px-4 font-semibold text-right">Stock</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3EED4]">
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-xs text-[#3B7A57]">
                      No products match &ldquo;{inventorySearch}&rdquo;.
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((p) => {
                    const statusLabel =
                      p.stock === 0 ? 'Out of Stock' : p.stock <= p.lowStockThreshold ? 'Low Stock' : 'In Stock';
                    const statusClass =
                      p.stock === 0
                        ? 'text-rose-700'
                        : p.stock <= p.lowStockThreshold
                          ? 'text-[#B8860B]'
                          : 'text-[#006837]';

                    return (
                      <tr key={p.id} className="hover:bg-[#E3EED4]/30">
                        <td className="py-3 px-4 font-semibold text-[#004D2C]">{p.title}</td>
                        <td className="py-3 px-4 text-[#3B7A57]">{p.category}</td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-[#004D2C]">
                          {formatNaira(p.price)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-[#004D2C]">
                          {p.stock}
                        </td>
                        <td className={`py-3 px-4 font-semibold ${statusClass}`}>{statusLabel}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => void adjustProductStock(p.id, Math.max(0, p.stock - 1))}
                              aria-label={`Decrease ${p.title} stock`}
                              className="w-8 h-8 rounded-lg border border-[#AEC3B0] text-[#004D2C] flex items-center justify-center hover:bg-[#E3EED4]"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void adjustProductStock(p.id, p.stock + 5)}
                              aria-label={`Restock ${p.title}`}
                              className="px-2.5 h-8 rounded-lg bg-[#E3EED4] border border-[#D4AF37]/60 text-[#004D2C] font-bold hover:bg-[#D4AF37]/30"
                            >
                              +5
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditSkuModal(p)}
                              aria-label={`Edit ${p.title}`}
                              className="w-8 h-8 rounded-lg border border-[#AEC3B0] text-[#006837] hover:bg-[#E3EED4] flex items-center justify-center"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void deleteProduct(p.id)}
                              aria-label={`Delete ${p.title}`}
                              className="w-8 h-8 rounded-lg text-[#3B7A57] hover:text-rose-700 flex items-center justify-center"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-[#D4AF37]/60 overflow-hidden">
          <div className="p-5 border-b border-[#AEC3B0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-display text-base font-bold text-[#004D2C]">Order Fulfillment Pipeline</h2>
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value as 'all' | OrderStatus)}
              aria-label="Filter orders by fulfillment status"
              className="rounded-xl border border-[#AEC3B0] bg-[#E3EED4]/45 px-3 py-1.5 text-xs font-semibold text-[#004D2C]"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          {filteredOrders.length === 0 ? (
            <p className="p-10 text-center text-xs text-[#3B7A57]">No matching customer orders recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#E3EED4]/60 text-[#006837] border-b border-[#AEC3B0]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Order</th>
                    <th className="py-3 px-4 font-semibold">Customer</th>
                    <th className="py-3 px-4 font-semibold text-right">Total</th>
                    <th className="py-3 px-4 font-semibold">Payment</th>
                    <th className="py-3 px-4 font-semibold">Fulfillment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3EED4]">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#E3EED4]/30">
                      <td className="py-3 px-4 font-mono font-bold text-[#004D2C]">{order.orderNumber}</td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-[#004D2C]">{order.customerName}</p>
                        <p className="text-[11px] text-[#3B7A57]">{order.customerEmail}</p>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-[#004D2C]">
                        {formatNaira(order.total)}
                      </td>
                      <td className="py-3 px-4 text-[#006837]">
                        {order.paymentMethod} ···· {order.paymentLast4}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={order.status}
                          onChange={(e) => void updateOrderStatus(order.id, e.target.value as OrderStatus)}
                          aria-label={`Update status for ${order.orderNumber}`}
                          className="rounded-xl border border-[#AEC3B0] bg-white px-3 py-1.5 text-xs font-semibold text-[#004D2C]"
                        >
                          <option value="paid">Paid</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* EMAIL & PUSH TAB */}
      {activeTab === 'communications' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#D4AF37]/60 space-y-4">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="font-display text-base font-bold text-[#004D2C]">Send Live Push Promotion</h2>
            </div>
            <form onSubmit={(e) => void handlePromoSubmit(e)} className="space-y-3">
              <input
                type="text"
                required
                value={promoTitle}
                onChange={(e) => setPromoTitle(e.target.value)}
                placeholder="Headline (e.g. Boxers & Bedcovers Weekend Promo)"
                className="w-full min-h-[44px] rounded-xl border border-[#AEC3B0] px-3.5 text-sm text-[#004D2C] outline-none focus:border-[#006837]"
              />
              <textarea
                rows={3}
                required
                value={promoMessage}
                onChange={(e) => setPromoMessage(e.target.value)}
                placeholder="Promotional message pushed instantaneously to connected Vinco & More shoppers..."
                className="w-full rounded-xl border border-[#AEC3B0] p-3.5 text-sm text-[#004D2C] outline-none focus:border-[#006837]"
              />
              <button
                type="submit"
                disabled={sendingPromo}
                className="w-full min-h-[46px] rounded-xl bg-[#006837] hover:bg-[#004D2C] text-white border border-[#D4AF37] text-sm font-bold disabled:opacity-50 transition-colors"
              >
                {sendingPromo ? 'Broadcasting...' : 'Broadcast Live Push Alert'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#D4AF37]/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#006837]" />
                <h2 className="font-display text-base font-bold text-[#004D2C]">Automated Admin Email Dispatch Log</h2>
              </div>
              <button
                type="button"
                onClick={() => void refreshEmailLogs()}
                className="p-2 rounded-xl hover:bg-[#E3EED4] text-[#006837]"
                aria-label="Refresh email log"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {emailLogs.length === 0 ? (
              <p className="text-xs text-[#3B7A57] py-8 text-center">
                Automated admin emails fire automatically on new orders, order cancellations, and low-stock events.
              </p>
            ) : (
              <div className="divide-y divide-[#E3EED4] max-h-80 overflow-y-auto">
                {emailLogs.map((log) => (
                  <div key={log.id} className="py-3 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-[#004D2C]">{log.subject}</p>
                      <span className="text-[11px] font-mono text-[#B8860B] font-semibold">
                        {log.deliveryMode === 'smtp' ? 'SMTP Sent' : 'Queued'}
                      </span>
                    </div>
                    <p className="text-xs text-[#006837]">{log.summary}</p>
                    <p className="text-[11px] text-[#3B7A57] tabular-nums">
                      To: {log.recipient} · {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit SKU Modal */}
      {skuModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#004D2C]/55 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSkuModalOpen(false)}
        >
          <form
            onSubmit={(e) => void handleSaveSku(e)}
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-2 border-[#D4AF37] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <h3 className="font-display text-lg font-bold text-[#004D2C]">
              {editingProduct ? 'Edit Vinco & More SKU' : 'Add New Vinco & More SKU'}
            </h3>
            <input
              type="text"
              required
              value={skuTitle}
              onChange={(e) => setSkuTitle(e.target.value)}
              placeholder="Product Title (e.g. Lagos Waffle Bath Towel)"
              className="w-full min-h-[44px] rounded-xl border border-[#AEC3B0] px-3 text-sm text-[#004D2C] outline-none focus:border-[#006837]"
            />
            <input
              type="text"
              value={skuSubtitle}
              onChange={(e) => setSkuSubtitle(e.target.value)}
              placeholder="Subtitle (e.g. 600GSM Combed Cotton)"
              className="w-full min-h-[44px] rounded-xl border border-[#AEC3B0] px-3 text-sm text-[#004D2C] outline-none focus:border-[#006837]"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={skuCategory}
                onChange={(e) => setSkuCategory(e.target.value as Exclude<CategoryType, 'All'>)}
                className="min-h-[44px] rounded-xl border border-[#AEC3B0] px-2 text-xs font-semibold text-[#004D2C]"
              >
                <option value="Towels">Towels</option>
                <option value="Bathrobes">Bathrobes</option>
                <option value="Pyjamas">Pyjamas</option>
                <option value="Blankets">Blankets</option>
                <option value="Boxers">Boxers</option>
                <option value="Bedcovers">Bedcovers</option>
                <option value="Essentials">Essentials</option>
              </select>
              <input
                type="number"
                required
                min={500}
                value={skuPrice}
                onChange={(e) => setSkuPrice(e.target.value)}
                placeholder="Price (₦)"
                aria-label="Price in Naira"
                className="min-h-[44px] rounded-xl border border-[#AEC3B0] px-3 text-sm text-[#004D2C] tabular-nums"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-[#3B7A57] block mb-1">Stock Units</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={skuStock}
                  onChange={(e) => setSkuStock(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-[#AEC3B0] px-3 text-sm text-[#004D2C] tabular-nums"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#3B7A57] block mb-1">Low Stock Alert</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={skuThreshold}
                  onChange={(e) => setSkuThreshold(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-[#AEC3B0] px-3 text-sm text-[#004D2C] tabular-nums"
                />
              </div>
            </div>
            <textarea
              rows={2}
              value={skuDescription}
              onChange={(e) => setSkuDescription(e.target.value)}
              placeholder="Product description..."
              className="w-full rounded-xl border border-[#AEC3B0] p-3 text-sm text-[#004D2C] outline-none focus:border-[#006837]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSkuModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-[#AEC3B0] text-xs font-semibold text-[#004D2C]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#006837] hover:bg-[#004D2C] text-white border border-[#D4AF37] text-xs font-bold transition-colors"
              >
                {editingProduct ? 'Update SKU' : 'Save to Catalog'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
