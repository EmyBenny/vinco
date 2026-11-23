import { Bell, Heart, Home, ShieldCheck, ShoppingBag, User } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AdminDashboardView } from './components/AdminDashboardView';
import { CartCheckoutDrawer } from './components/CartCheckoutDrawer';
import { DesktopStorefront } from './components/DesktopStorefront';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MobileStorefront } from './components/MobileStorefront';
import { LiveToastStack, NotificationDrawer } from './components/NotificationCenter';
import { OrdersAndAccountView } from './components/OrdersAndAccountView';
import { ProductDetailView } from './components/ProductDetailView';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import type { FilterState, Product } from './types/ecommerce';

type ActiveSection = 'shop' | 'orders' | 'admin';

const INITIAL_FILTERS: FilterState = {
  search: '',
  category: 'Bathrobes',
  priceBand: 'all',
  color: 'All',
  inStockOnly: false,
  sortBy: 'featured',
};

function StorefrontShell() {
  const { user } = useAuth();
  const { products, cartCount, notifications, addToCart } = useStore();

  const [section, setSection] = useState<ActiveSection>(() => {
    if (typeof window === 'undefined') return 'shop';
    const params = new URLSearchParams(window.location.search);
    if (params.get('page') === 'admin' || window.location.pathname === '/admin') {
      return 'admin';
    }
    if (params.get('page') === 'orders') {
      return 'orders';
    }
    return 'shop';
  });
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [detailMode, setDetailMode] = useState<'overview' | 'studio' | 'lookbook'>('overview');
  const [cartOpen, setCartOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      return { ...INITIAL_FILTERS, category: 'All' };
    }
    return INITIAL_FILTERS;
  });

  // Handle shared product deep-links (?product=<id>) and keep ?page=admin synced
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (section === 'admin') {
      url.searchParams.set('page', 'admin');
    } else if (section === 'orders') {
      url.searchParams.set('page', 'orders');
    } else {
      url.searchParams.delete('page');
    }
    window.history.replaceState({}, '', `${url.pathname}${url.search}`);
  }, [section]);

  useEffect(() => {
    if (typeof window === 'undefined' || products.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const sharedId = params.get('product');
    if (sharedId && products.some((p) => p.id === sharedId)) {
      setSelectedProductId(sharedId);
    }
  }, [products]);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) || null,
    [products, selectedProductId]
  );

  const filteredProducts = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    const result = products.filter((p) => {
      if (filters.category !== 'All' && p.category !== filters.category) return false;
      if (filters.inStockOnly && p.stock <= 0) return false;
      if (filters.color !== 'All' && !p.colors.includes(filters.color)) return false;

      if (filters.priceBand === 'under20k' && p.price >= 20000) return false;
      if (filters.priceBand === '20kto40k' && (p.price < 20000 || p.price > 40000)) return false;
      if (filters.priceBand === 'over40k' && p.price <= 40000) return false;

      if (query) {
        const hay = `${p.title} ${p.subtitle} ${p.category} ${p.fabricSpecs} ${p.description}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }

      return true;
    });

    if (filters.sortBy === 'price-asc') {
      return [...result].sort((a, b) => a.price - b.price);
    }
    if (filters.sortBy === 'price-desc') {
      return [...result].sort((a, b) => b.price - a.price);
    }
    if (filters.sortBy === 'rating') {
      return [...result].sort((a, b) => b.rating - a.rating);
    }
    return result;
  }, [products, filters]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.readBy.includes(user.uid)).length,
    [notifications, user.uid]
  );

  const updateFilters = (patch: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const resetFilters = () => {
    setFilters({
      ...INITIAL_FILTERS,
      category: typeof window !== 'undefined' && window.innerWidth >= 768 ? 'All' : 'Bathrobes',
    });
  };

  const handleSelectProduct = (
    product: Product,
    mode: 'overview' | 'studio' | 'lookbook' = 'overview'
  ) => {
    setDetailMode(mode);
    setSelectedProductId(product.id);
    setSection('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickBuy = (product: Product) => {
    addToCart({
      productId: product.id,
      title: product.title,
      price: product.price,
      imageUrl: product.imageUrl,
      color: product.colors[0] || 'Sharp Emerald',
      size: product.sizes.includes('M') ? 'M' : product.sizes[0] || 'Standard',
      style: product.styles[0] || 'Standard',
      quantity: 1,
    });
    setCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#E3EED4] text-[#004D2C]">
      {/* Desktop Top Navigation Bar — Strict 3-Zone Contract */}
      <header className="hidden md:flex sticky top-0 z-30 bg-[#E3EED4]/95 backdrop-blur-md border-b border-[#D4AF37]/60 px-8 h-16 items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => {
            setSelectedProductId(null);
            setSection('shop');
          }}
          className="font-display text-2xl font-extrabold tracking-tight text-[#004D2C] whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="w-3 h-3 rounded-full bg-[#D4AF37] ring-2 ring-[#006837]" aria-hidden="true" />
          Vinco &amp; More
        </button>

        {/* Zone 2: Single-Line Navigation Links */}
        <nav className="flex items-center gap-7 text-sm font-semibold text-[#006837]">
          <button
            type="button"
            onClick={() => {
              setSelectedProductId(null);
              setSection('shop');
            }}
            className={`whitespace-nowrap shrink-0 hover:text-[#004D2C] transition-colors ${
              section === 'shop' && !selectedProduct
                ? 'text-[#004D2C] font-bold underline underline-offset-8 decoration-[#D4AF37] decoration-2'
                : ''
            }`}
          >
            Catalog
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedProductId(null);
              setSection('orders');
            }}
            className={`whitespace-nowrap shrink-0 hover:text-[#004D2C] transition-colors ${
              section === 'orders'
                ? 'text-[#004D2C] font-bold underline underline-offset-8 decoration-[#D4AF37] decoration-2'
                : ''
            }`}
          >
            Orders
          </button>
          <button
            type="button"
            onClick={() => setNotificationsOpen(true)}
            className="whitespace-nowrap shrink-0 hover:text-[#004D2C] transition-colors tabular-nums"
          >
            Alerts{unreadCount > 0 ? ` (${unreadCount})` : ''}
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedProductId(null);
              setSection('admin');
            }}
            className={`whitespace-nowrap shrink-0 hover:text-[#004D2C] transition-colors ${
              section === 'admin'
                ? 'text-[#004D2C] font-bold underline underline-offset-8 decoration-[#D4AF37] decoration-2'
                : ''
            }`}
          >
            Admin Portal
          </button>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="px-5 py-2 rounded-full bg-[#006837] hover:bg-[#004D2C] text-white border border-[#D4AF37] text-xs font-bold transition-colors whitespace-nowrap shrink-0 tabular-nums"
        >
          Bag ({cartCount})
        </button>
      </header>

      {/* Main Active Viewport */}
      <main>
        {selectedProduct && section === 'shop' ? (
          <ProductDetailView
            key={selectedProduct.id}
            product={selectedProduct}
            initialMode={detailMode}
            onBack={() => setSelectedProductId(null)}
            onSelectProduct={(p, m) => handleSelectProduct(p, m || 'overview')}
            onOpenCartCheckout={() => setCartOpen(true)}
          />
        ) : section === 'orders' ? (
          <OrdersAndAccountView
            onSelectProduct={(p) => handleSelectProduct(p, 'overview')}
            onOpenAdmin={() => setSection('admin')}
          />
        ) : section === 'admin' ? (
          <AdminDashboardView onBackToStore={() => setSection('shop')} />
        ) : (
          <>
            <MobileStorefront
              filteredProducts={filteredProducts}
              filters={filters}
              onUpdateFilters={updateFilters}
              onResetFilters={resetFilters}
              onSelectProduct={handleSelectProduct}
              onQuickBuy={handleQuickBuy}
              onOpenAdmin={() => {
                setSelectedProductId(null);
                setSection('admin');
              }}
            />
            <DesktopStorefront
              filteredProducts={filteredProducts}
              filters={filters}
              onUpdateFilters={updateFilters}
              onResetFilters={resetFilters}
              onSelectProduct={handleSelectProduct}
              onQuickBuy={handleQuickBuy}
            />
          </>
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      {!selectedProduct && (
        <nav
          aria-label="Mobile primary navigation"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#E3EED4]/95 backdrop-blur-md border-t border-[#D4AF37]/60 h-16 px-3 grid grid-cols-5 items-center"
        >
          <button
            type="button"
            onClick={() => setSection('shop')}
            aria-label="Home"
            className="flex flex-col items-center justify-center min-h-[44px]"
          >
            <span
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                section === 'shop'
                  ? 'bg-[#006837] text-[#F3E5AB] ring-2 ring-[#D4AF37] shadow-md shadow-[#004D2C]/20'
                  : 'text-[#006837]'
              }`}
            >
              <Home className="w-5 h-5" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label="Shopping Bag"
            className="flex flex-col items-center justify-center min-h-[44px] relative text-[#004D2C]"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1.5 right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#006837] text-[#F3E5AB] border border-[#D4AF37] text-[10px] font-bold flex items-center justify-center tabular-nums">
                {cartCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setNotificationsOpen(true)}
            aria-label="Notifications and Saved"
            className="flex flex-col items-center justify-center min-h-[44px] relative text-[#004D2C]"
          >
            {unreadCount > 0 ? <Bell className="w-5 h-5 text-[#006837]" /> : <Heart className="w-5 h-5" />}
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#D4AF37] text-[#003B20] text-[10px] font-bold flex items-center justify-center tabular-nums">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSection('orders')}
            aria-label="Orders and Saved"
            className="flex flex-col items-center justify-center min-h-[44px]"
          >
            <span
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                section === 'orders'
                  ? 'bg-[#006837] text-[#F3E5AB] ring-2 ring-[#D4AF37]'
                  : 'text-[#004D2C]'
              }`}
            >
              <User className="w-5 h-5" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSection('admin')}
            aria-label="Admin Portal"
            className="flex flex-col items-center justify-center min-h-[44px]"
          >
            <span
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                section === 'admin'
                  ? 'bg-[#006837] text-[#F3E5AB] ring-2 ring-[#D4AF37]'
                  : 'text-[#004D2C]'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </span>
          </button>
        </nav>
      )}

      <CartCheckoutDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onViewOrders={() => {
          setSelectedProductId(null);
          setSection('orders');
        }}
      />

      <NotificationDrawer open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      <LiveToastStack />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <StoreProvider>
          <StorefrontShell />
        </StoreProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
