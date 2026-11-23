import { Heart, MapPin, Plus, Search, Share2, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { STORE_INFO } from '../data/storeInfo';
import {
  COLOR_SWATCH_MAP,
  formatNaira,
  type CategoryType,
  type FilterState,
  type Product,
} from '../types/ecommerce';
import { SafeImage } from './SafeImage';
import { ShareSheet } from './ShareSheet';

interface DesktopStorefrontProps {
  filteredProducts: Product[];
  filters: FilterState;
  onUpdateFilters: (patch: Partial<FilterState>) => void;
  onResetFilters: () => void;
  onSelectProduct: (product: Product, initialMode?: 'overview' | 'studio' | 'lookbook') => void;
  onQuickBuy: (product: Product) => void;
}

const CATEGORIES: CategoryType[] = [
  'All',
  'Towels',
  'Bathrobes',
  'Pyjamas',
  'Blankets',
  'Boxers',
  'Bedcovers',
  'Essentials',
];

export function DesktopStorefront({
  filteredProducts,
  filters,
  onUpdateFilters,
  onResetFilters,
  onSelectProduct,
  onQuickBuy,
}: DesktopStorefrontProps) {
  const { products, addToCart } = useStore();
  const { profile, toggleWishlist } = useAuth();
  const [shareProduct, setShareProduct] = useState<Product | null>(null);

  const heroProduct = products.find((p) => p.id === 'vinco-waffle-bathrobe') || products[0];
  const allColors = Array.from(new Set(products.flatMap((p) => p.colors))).slice(0, 6);

  return (
    <div className="hidden md:block bg-[#E3EED4] pb-20">
      {/* Section 1: Storefront Split Hero */}
      {heroProduct && (
        <section className="max-w-7xl mx-auto px-8 pt-8 pb-10">
          <div className="grid grid-cols-12 gap-8 items-stretch">
            {/* Left Copy & Spotlight */}
            <div className="col-span-6 bg-white rounded-[32px] p-10 border border-[#D4AF37]/60 flex flex-col justify-between shadow-xs">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#006837]">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37]" aria-hidden="true" />
                  <span>Vinco &amp; More · Home, Sleep &amp; Apparel</span>
                  <span aria-hidden="true" className="text-[#D4AF37]">·</span>
                  <span className="tabular-nums text-[#B8860B]">{heroProduct.stock} units ready to ship</span>
                </div>

                <h1 className="font-display text-4xl xl:text-5xl font-bold text-[#004D2C] leading-[1.08] text-balance">
                  Towels, Robes, Boxers, Bedcovers &amp; Blankets
                </h1>

                <p className="text-base text-[#006837] leading-relaxed max-w-lg">
                  Crafted in breathable organic cotton, stretch jersey bedcovers, kids character towels, and warm student blankets with gold-standard comfort and Naira checkout.
                </p>
              </div>

              <div className="pt-8 space-y-5">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-3xl font-bold text-[#004D2C] tabular-nums">
                    {formatNaira(heroProduct.price)}
                  </span>
                  <span className="text-sm text-[#3B7A57]">{heroProduct.title} · Sizes S–XXL</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onQuickBuy(heroProduct)}
                    className="px-7 py-3.5 rounded-full bg-[#006837] hover:bg-[#004D2C] text-white border border-[#D4AF37]/60 font-display text-sm font-bold transition-colors whitespace-nowrap"
                  >
                    Buy Now
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectProduct(heroProduct, 'studio')}
                    className="px-7 py-3.5 rounded-full bg-[#E3EED4] hover:bg-[#D4AF37]/25 text-[#004D2C] border border-[#D4AF37] font-display text-sm font-bold transition-colors whitespace-nowrap"
                  >
                    Inspect 360° Studio
                  </button>
                </div>
              </div>
            </div>

            {/* Right Sharp Emerald + Gold Showcase */}
            <div
              onClick={() => onSelectProduct(heroProduct, 'lookbook')}
              className="col-span-6 bg-gradient-to-br from-[#007A3D] via-[#00592D] to-[#003D20] rounded-[32px] p-8 text-white border-2 border-[#D4AF37]/75 grid grid-cols-12 gap-6 items-stretch cursor-pointer group overflow-hidden shadow-lg shadow-[#004D2C]/20"
            >
              <div className="col-span-5 flex flex-col justify-between py-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#F3E5AB]">
                    Emerald &amp; Gold Edit
                  </p>
                  <h2 className="font-display text-2xl font-bold mt-2 leading-tight text-white">
                    Bathrobes, Towels &amp; Luxury Bedding
                  </h2>
                  <p className="text-sm text-[#E3EED4]/95 mt-2 leading-relaxed">
                    Sharp emerald weaves, gold-trimmed borders, fitted bedcovers, and cozy essentials.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-bold text-[#F3E5AB] group-hover:translate-x-1 transition-transform">
                  Explore Lookbook →
                </span>
              </div>
              <div className="col-span-7 rounded-2xl overflow-hidden bg-black/15 min-h-[340px] ring-1 ring-[#D4AF37]/50">
                <SafeImage
                  src={heroProduct.imageUrl}
                  alt={heroProduct.title}
                  fallbackTitle={heroProduct.title}
                  className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section 2: Search, Multi-Facet Filter Toolbar & 3-Column Product Grid */}
      <section id="catalog-section" className="max-w-7xl mx-auto px-8 space-y-6">
        <div className="bg-white rounded-3xl p-5 border border-[#D4AF37]/60 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Search Input */}
            <div className="flex items-center gap-2.5 bg-[#E3EED4]/55 border border-[#AEC3B0] focus-within:border-[#D4AF37] rounded-2xl px-4 py-2 flex-1 min-w-[240px] max-w-sm">
              <Search className="w-4 h-4 text-[#006837] shrink-0" />
              <input
                type="search"
                value={filters.search}
                onChange={(e) => onUpdateFilters({ search: e.target.value })}
                placeholder="Search boxers, bedcovers, towels, blankets..."
                aria-label="Search Vinco & More catalog"
                className="flex-1 bg-transparent text-sm text-[#004D2C] placeholder:text-[#3B7A57] outline-none"
              />
              {filters.search && (
                <button
                  type="button"
                  onClick={() => onUpdateFilters({ search: '' })}
                  aria-label="Clear search"
                  className="text-[#3B7A57] hover:text-[#004D2C]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Segmented Tabs */}
            <div className="flex items-center gap-1 p-1 bg-[#E3EED4] rounded-2xl overflow-x-auto no-scrollbar max-w-full">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onUpdateFilters({ category: cat })}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    filters.category === cat
                      ? 'bg-[#006837] text-[#F3E5AB] ring-1 ring-[#D4AF37] shadow-xs'
                      : 'text-[#006837] hover:text-[#004D2C]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Filter Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#AEC3B0]/50 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 font-semibold text-[#006837]">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#D4AF37]" />
                Filters:
              </span>

              <select
                value={filters.priceBand}
                onChange={(e) => onUpdateFilters({ priceBand: e.target.value as FilterState['priceBand'] })}
                aria-label="Filter by price"
                className="rounded-xl border border-[#AEC3B0] bg-white px-3 py-2 text-xs font-medium text-[#004D2C]"
              >
                <option value="all">All Prices</option>
                <option value="under20k">Under ₦20,000</option>
                <option value="20kto40k">₦20,000 – ₦40,000</option>
                <option value="over40k">₦40,000+</option>
              </select>

              <div className="flex items-center gap-1.5 pl-2">
                <button
                  type="button"
                  onClick={() => onUpdateFilters({ color: 'All' })}
                  className={`px-2.5 py-1.5 rounded-lg font-medium border ${
                    filters.color === 'All'
                      ? 'border-[#D4AF37] bg-[#E3EED4] text-[#004D2C]'
                      : 'border-[#AEC3B0] text-[#006837]'
                  }`}
                >
                  All Colors
                </button>
                {allColors.map((col) => (
                  <button
                    key={col}
                    type="button"
                    title={col}
                    aria-label={`Filter color ${col}`}
                    onClick={() => onUpdateFilters({ color: filters.color === col ? 'All' : col })}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      filters.color === col ? 'border-[#D4AF37] scale-110' : 'border-[#AEC3B0]'
                    }`}
                    style={{ backgroundColor: COLOR_SWATCH_MAP[col] || '#006837' }}
                  />
                ))}
              </div>

              <label className="inline-flex items-center gap-2 pl-2 cursor-pointer text-[#004D2C] font-medium">
                <input
                  type="checkbox"
                  checked={filters.inStockOnly}
                  onChange={(e) => onUpdateFilters({ inStockOnly: e.target.checked })}
                  className="accent-[#006837] w-4 h-4"
                />
                In Stock Only
              </label>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[#3B7A57] tabular-nums font-medium">
                {filteredProducts.length} item{filteredProducts.length === 1 ? '' : 's'}
              </span>
              <select
                value={filters.sortBy}
                onChange={(e) => onUpdateFilters({ sortBy: e.target.value as FilterState['sortBy'] })}
                aria-label="Sort products"
                className="rounded-xl border border-[#AEC3B0] bg-white px-3 py-2 text-xs font-medium text-[#004D2C]"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3-Column Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-14 text-center border border-[#AEC3B0] space-y-4">
            <p className="font-display text-xl font-bold text-[#004D2C]">No matching items found</p>
            <p className="text-sm text-[#3B7A57]">Adjust your search keywords or clear active filters.</p>
            <button
              type="button"
              onClick={onResetFilters}
              className="px-6 py-2.5 rounded-full bg-[#006837] text-white text-sm font-semibold hover:bg-[#004D2C]"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredProducts.map((product) => {
              const isWishlisted = profile?.wishlist.includes(product.id) ?? false;
              const lowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;
              return (
                <article
                  key={product.id}
                  onClick={() => onSelectProduct(product, 'overview')}
                  className="bg-white rounded-3xl p-5 border border-[#AEC3B0] hover:border-[#D4AF37] hover:-translate-y-0.5 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#E3EED4]/55 mb-4">
                      <SafeImage
                        src={product.imageUrl}
                        alt={product.title}
                        fallbackTitle={product.title}
                        className="w-full h-full object-cover object-top"
                      />
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShareProduct(product);
                          }}
                          aria-label={`Share ${product.title}`}
                          className="w-9 h-9 rounded-full bg-white/95 backdrop-blur-xs text-[#004D2C] hover:text-[#006837] flex items-center justify-center shadow-xs"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void toggleWishlist(product.id);
                          }}
                          aria-label={`Save ${product.title} to wishlist`}
                          className="w-9 h-9 rounded-full bg-white/95 backdrop-blur-xs text-[#004D2C] hover:text-[#D4AF37] flex items-center justify-center shadow-xs"
                        >
                          <Heart
                            className={`w-4 h-4 ${isWishlisted ? 'fill-[#D4AF37] text-[#D4AF37]' : ''}`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#3B7A57]">
                      <span className="font-semibold text-[#006837]">{product.category}</span>
                      <span aria-hidden="true" className="text-[#D4AF37]">·</span>
                      <span
                        className={`tabular-nums font-medium ${
                          product.stock === 0
                            ? 'text-rose-600'
                            : lowStock
                              ? 'text-[#B8860B]'
                              : 'text-[#006837]'
                        }`}
                      >
                        {product.stock === 0
                          ? 'Out of Stock'
                          : lowStock
                            ? `Low Stock (${product.stock})`
                            : `${product.stock} in stock`}
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-bold text-[#004D2C] mt-1 truncate">
                      {product.title}
                    </h3>
                    <p className="text-xs text-[#3B7A57] mt-0.5 truncate">{product.subtitle}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#AEC3B0]/40">
                    <span className="font-mono text-base font-bold text-[#004D2C] tabular-nums">
                      {formatNaira(product.price)}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={product.stock <= 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart({
                            productId: product.id,
                            title: product.title,
                            price: product.price,
                            imageUrl: product.imageUrl,
                            color: product.colors[0] || 'Sharp Emerald',
                            size: product.sizes[0] || 'Standard',
                            style: product.styles[0] || 'Standard',
                            quantity: 1,
                          });
                        }}
                        aria-label={`Quick add ${product.title}`}
                        className="w-10 h-10 rounded-full border border-[#D4AF37] hover:bg-[#E3EED4] text-[#004D2C] flex items-center justify-center disabled:opacity-40"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={product.stock <= 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickBuy(product);
                        }}
                        className="px-4 py-2 rounded-full bg-[#006837] hover:bg-[#004D2C] text-white text-xs font-semibold transition-colors disabled:opacity-40 whitespace-nowrap"
                      >
                        {product.stock > 0 ? 'Buy Now' : 'Sold Out'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Section 3: Vinco & More Assurance Strip */}
      <section className="max-w-7xl mx-auto px-8 pt-12">
        <div className="bg-white rounded-3xl p-8 border border-[#D4AF37]/60 grid grid-cols-3 gap-8">
          <div>
            <p className="font-display text-lg font-bold text-[#004D2C]">Real-Time Stock Sync</p>
            <p className="text-sm text-[#006837] mt-1.5 leading-relaxed">
              Every towel set, bathrobe, boxer pack, bedcover, and blanket updates warehouse stock live at checkout.
            </p>
          </div>
          <div>
            <p className="font-display text-lg font-bold text-[#004D2C]">Secure Naira Checkout</p>
            <p className="text-sm text-[#006837] mt-1.5 leading-relaxed">
              Card and express wallet authorizations are verified server-side in Naira (₦) with instant order receipts.
            </p>
          </div>
          <div>
            <p className="font-display text-lg font-bold text-[#004D2C]">Live Delivery Alerts</p>
            <p className="text-sm text-[#006837] mt-1.5 leading-relaxed">
              Instant WebSocket and browser push updates keep you posted from Benin City dispatch to doorstep delivery.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Head Office & Store Footer */}
      <footer className="max-w-7xl mx-auto px-8 pt-8">
        <div className="bg-[#004D2C] text-white rounded-3xl p-8 border border-[#D4AF37] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <p className="font-display text-xl font-bold text-[#F3E5AB]">{STORE_INFO.brandName}</p>
            <p className="text-xs text-[#E3EED4]/90">
              Towels, Bathrobes, Pyjamas, Boxers, Stretching Bedcovers &amp; Students Blankets
            </p>
          </div>

          <div className="flex items-start gap-3 max-w-md">
            <span className="w-9 h-9 rounded-xl bg-[#006837] border border-[#D4AF37]/70 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-4 h-4 text-[#F3E5AB]" />
            </span>
            <div className="space-y-0.5 text-xs">
              <p className="font-bold text-[#F3E5AB]">{STORE_INFO.headOfficeLabel}</p>
              <p className="text-[#E3EED4] leading-relaxed">{STORE_INFO.fullAddress}</p>
            </div>
          </div>
        </div>
      </footer>

      {shareProduct && <ShareSheet product={shareProduct} onClose={() => setShareProduct(null)} />}
    </div>
  );
}
