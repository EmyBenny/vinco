import {
  ArrowRight,
  Bath,
  BedDouble,
  Heart,
  Layers,
  MapPin,
  Plus,
  Search,
  Shirt,
  SlidersHorizontal,
  Sparkles,
  Tag,
  X,
} from 'lucide-react';
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

interface MobileStorefrontProps {
  filteredProducts: Product[];
  filters: FilterState;
  onUpdateFilters: (patch: Partial<FilterState>) => void;
  onResetFilters: () => void;
  onSelectProduct: (product: Product, initialMode?: 'overview' | 'studio' | 'lookbook') => void;
  onQuickBuy: (product: Product) => void;
  onOpenAdmin?: () => void;
}

const CATEGORY_TABS: Array<{ id: CategoryType; label: string; icon: typeof Bath }> = [
  { id: 'Towels', label: 'Towels', icon: Layers },
  { id: 'Bathrobes', label: 'Bathrobes', icon: Bath },
  { id: 'Pyjamas', label: 'Pyjamas', icon: Shirt },
  { id: 'Blankets', label: 'Blankets', icon: BedDouble },
  { id: 'Boxers', label: 'Boxers', icon: Tag },
  { id: 'Bedcovers', label: 'Bedcovers', icon: BedDouble },
  { id: 'Essentials', label: 'Spa Kits', icon: Sparkles },
  { id: 'All', label: 'All', icon: SlidersHorizontal },
];

export function MobileStorefront({
  filteredProducts,
  filters,
  onUpdateFilters,
  onResetFilters,
  onSelectProduct,
  onQuickBuy,
  onOpenAdmin,
}: MobileStorefrontProps) {
  const { products, addToCart } = useStore();
  const { profile, toggleWishlist } = useAuth();
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const towelProduct =
    products.find((p) => p.id === 'vinco-character-towels') ||
    products.find((p) => p.id === 'vinco-egyptian-towel-set') ||
    products[0];
  const bathrobeProduct =
    products.find((p) => p.id === 'vinco-waffle-bathrobe') || products[0];
  const spotlightProduct =
    products.find((p) => p.id === 'vinco-stretching-bedcover') ||
    products.find((p) => p.id === 'vinco-eucalyptus-pyjamas') ||
    products[0];

  const hasActiveSearchOrFilter =
    filters.search.trim().length > 0 ||
    filters.priceBand !== 'all' ||
    filters.color !== 'All' ||
    filters.inStockOnly ||
    (filters.category !== 'Bathrobes' && filters.category !== 'All') ||
    filters.category === 'All';

  const allColors = Array.from(new Set(products.flatMap((p) => p.colors))).slice(0, 6);

  return (
    <div className="md:hidden pb-24 bg-[#E3EED4] min-h-screen">
      {/* Top Search Pill Bar + Brand Wordmark */}
      <div className="px-4 pt-4 pb-3 bg-[#E3EED4]">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] ring-2 ring-[#006837]" aria-hidden="true" />
            <span className="font-display text-xl font-extrabold tracking-tight text-[#004D2C] whitespace-nowrap">
              Vinco &amp; More
            </span>
          </div>
          {onOpenAdmin ? (
            <button
              type="button"
              onClick={onOpenAdmin}
              className="text-xs font-bold text-[#006837] hover:text-[#004D2C] border-b border-[#D4AF37] pb-0.5 whitespace-nowrap shrink-0"
            >
              Admin Portal
            </button>
          ) : (
            <span className="text-[11px] font-bold text-[#006837] border-b border-[#D4AF37] pb-0.5">
              Towels · Boxers · Bedcovers · Blankets
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 bg-white/95 rounded-full px-4 py-2 border border-[#D4AF37]/70 shadow-xs">
          <Search className="w-4 h-4 text-[#006837] shrink-0" />
          <input
            type="search"
            value={filters.search}
            onChange={(e) => onUpdateFilters({ search: e.target.value })}
            placeholder="Find Towels, Boxers, Bedcovers, Blankets..."
            aria-label="Search Vinco & More catalog"
            className="flex-1 bg-transparent text-sm text-[#004D2C] placeholder:text-[#3B7A57] outline-none min-h-[36px]"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onUpdateFilters({ search: '' })}
              aria-label="Clear search"
              className="p-1 text-[#3B7A57] hover:text-[#004D2C]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setFilterSheetOpen(true)}
            aria-label="Open product filters"
            className="min-w-[36px] min-h-[36px] rounded-full bg-[#E3EED4] border border-[#D4AF37]/60 text-[#004D2C] flex items-center justify-center"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Horizontal Category Icon Strip */}
        <div className="flex items-center gap-3 mt-4 overflow-x-auto no-scrollbar pb-1">
          {CATEGORY_TABS.map((cat) => {
            const Icon = cat.icon;
            const active = filters.category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onUpdateFilters({ category: cat.id })}
                className="flex flex-col items-center gap-1.5 min-w-[58px] shrink-0 group"
              >
                <span
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    active
                      ? 'bg-[#006837] text-[#D4AF37] ring-2 ring-[#D4AF37] shadow-md shadow-[#004D2C]/20'
                      : 'bg-white/90 text-[#006837] border border-[#AEC3B0] group-hover:bg-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <span
                  className={`text-[11px] font-semibold whitespace-nowrap ${
                    active ? 'text-[#004D2C] font-bold' : 'text-[#006837]'
                  }`}
                >
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bento Showcase Grid matching Screen 1 */}
      {!hasActiveSearchOrFilter && towelProduct && bathrobeProduct && spotlightProduct && (
        <div className="px-4 pt-2 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            {/* Left Light Card */}
            <div
              onClick={() => onSelectProduct(towelProduct, 'studio')}
              className="bg-white rounded-3xl p-3.5 flex flex-col justify-between border border-[#D4AF37]/55 cursor-pointer active:scale-[0.99] transition-transform"
            >
              <div className="flex items-start justify-between gap-1">
                <div>
                  <h2 className="font-display text-sm font-bold text-[#004D2C] leading-tight">
                    {towelProduct.title}
                  </h2>
                  <p className="text-[11px] text-[#3B7A57] mt-0.5 line-clamp-1">
                    {towelProduct.category} · Gold Trim
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart({
                      productId: towelProduct.id,
                      title: towelProduct.title,
                      price: towelProduct.price,
                      imageUrl: towelProduct.imageUrl,
                      color: towelProduct.colors[0] || 'Sharp Emerald',
                      size: towelProduct.sizes[0] || 'Standard',
                      style: towelProduct.styles[0] || 'Standard',
                      quantity: 1,
                    });
                  }}
                  aria-label={`Quick add ${towelProduct.title}`}
                  className="w-7 h-7 rounded-full bg-[#E3EED4] hover:bg-[#D4AF37] text-[#004D2C] flex items-center justify-center shrink-0 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="my-2.5 h-32 rounded-2xl overflow-hidden bg-[#E3EED4]/50">
                <SafeImage
                  src={towelProduct.imageUrl}
                  alt={towelProduct.title}
                  fallbackTitle={towelProduct.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-center justify-between gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickBuy(towelProduct);
                  }}
                  className="px-3 py-1.5 rounded-full bg-[#006837] text-white text-[11px] font-semibold hover:bg-[#004D2C] transition-colors whitespace-nowrap"
                >
                  Buy Now
                </button>
                <span className="text-xs font-bold text-[#004D2C] tabular-nums">
                  {formatNaira(towelProduct.price)}
                </span>
              </div>
            </div>

            {/* Right Column: Sharp Emerald Gradient Card + View All Button */}
            <div className="flex flex-col gap-2.5">
              <div
                onClick={() => onSelectProduct(bathrobeProduct, 'lookbook')}
                className="flex-1 bg-gradient-to-br from-[#006837] via-[#00522D] to-[#003B20] rounded-3xl p-3.5 flex flex-col justify-between text-[#E3EED4] border border-[#D4AF37]/60 shadow-md shadow-[#004D2C]/25 cursor-pointer active:scale-[0.99] transition-transform"
              >
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <h2 className="font-display text-sm font-bold text-white leading-tight">
                      {bathrobeProduct.title}
                    </h2>
                    <p className="text-[11px] text-[#F3E5AB] mt-0.5 line-clamp-1">
                      Sharp Emerald Edit
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      void toggleWishlist(bathrobeProduct.id);
                    }}
                    aria-label="Toggle wishlist"
                    className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center shrink-0"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        profile?.wishlist.includes(bathrobeProduct.id)
                          ? 'fill-[#D4AF37] text-[#D4AF37]'
                          : 'text-white'
                      }`}
                    />
                  </button>
                </div>

                <div className="my-2 h-24 rounded-2xl overflow-hidden bg-white/10 ring-1 ring-[#D4AF37]/40">
                  <SafeImage
                    src={bathrobeProduct.imageUrl}
                    alt={bathrobeProduct.title}
                    fallbackTitle={bathrobeProduct.title}
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                <div className="flex items-center justify-between gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickBuy(bathrobeProduct);
                    }}
                    className="px-3 py-1.5 rounded-full bg-[#D4AF37] text-[#003B20] text-[11px] font-bold hover:bg-[#F3E5AB] transition-colors whitespace-nowrap"
                  >
                    Buy Now
                  </button>
                  <span className="text-xs font-bold text-white tabular-nums">
                    {formatNaira(bathrobeProduct.price)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onUpdateFilters({ category: 'All' })}
                className="w-full min-h-[44px] rounded-2xl bg-white border border-[#D4AF37]/75 text-[#004D2C] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#F5FAEE] transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
              </button>
            </div>
          </div>

          {/* Bottom Horizontal Spotlight Card */}
          <div
            onClick={() => onSelectProduct(spotlightProduct, 'overview')}
            className="bg-white rounded-3xl p-4 flex items-center justify-between gap-3 border border-[#D4AF37]/55 cursor-pointer active:scale-[0.99] transition-transform"
          >
            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <h2 className="font-display text-base font-bold text-[#004D2C] leading-snug">
                  {spotlightProduct.title}
                </h2>
                <p className="text-xs text-[#3B7A57] mt-0.5">
                  360° Jersey Stretch ·{' '}
                  <span className="tabular-nums font-bold text-[#004D2C]">
                    {formatNaira(spotlightProduct.price)}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectProduct(spotlightProduct, 'overview');
                  }}
                  className="px-4 py-2 rounded-full bg-[#006837] text-white text-xs font-semibold hover:bg-[#004D2C] transition-colors whitespace-nowrap"
                >
                  Buy Now
                </button>
                <span className="text-[11px] font-mono text-[#B8860B] font-bold tabular-nums">
                  {spotlightProduct.stock} left
                </span>
              </div>
            </div>

            <div className="w-28 h-28 rounded-2xl overflow-hidden bg-[#E3EED4]/60 shrink-0 ring-1 ring-[#D4AF37]/40">
              <SafeImage
                src={spotlightProduct.imageUrl}
                alt={spotlightProduct.title}
                fallbackTitle={spotlightProduct.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}

      {/* Filtered / Full Catalog Feed */}
      <div className="px-4 pt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-sm font-bold text-[#004D2C]">
            {hasActiveSearchOrFilter ? 'Filtered Selection' : 'All Vinco & More Collections'}
          </h3>
          {hasActiveSearchOrFilter && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs font-semibold text-[#006837] underline decoration-[#D4AF37] underline-offset-2"
            >
              Reset Filters
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-[#AEC3B0] space-y-3">
            <p className="text-sm font-semibold text-[#004D2C]">No items match your filters</p>
            <p className="text-xs text-[#3B7A57]">Try clearing your search or switching categories.</p>
            <button
              type="button"
              onClick={onResetFilters}
              className="px-4 py-2 rounded-full bg-[#006837] text-white text-xs font-semibold"
            >
              Show All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product, 'overview')}
                className="bg-white rounded-3xl p-3 border border-[#AEC3B0]/80 hover:border-[#D4AF37] flex flex-col justify-between cursor-pointer transition-colors"
              >
                <div className="relative h-36 rounded-2xl overflow-hidden bg-[#E3EED4]/50 mb-2.5">
                  <SafeImage
                    src={product.imageUrl}
                    alt={product.title}
                    fallbackTitle={product.title}
                    className="w-full h-full object-cover object-top"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      void toggleWishlist(product.id);
                    }}
                    aria-label={`Save ${product.title}`}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#004D2C]"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        profile?.wishlist.includes(product.id) ? 'fill-[#D4AF37] text-[#D4AF37]' : ''
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <p className="text-[11px] text-[#3B7A57] truncate">
                    {product.category} · {product.stock} in stock
                  </p>
                  <h4 className="font-display text-sm font-bold text-[#004D2C] truncate mt-0.5">
                    {product.title}
                  </h4>
                </div>

                <div className="flex items-center justify-between mt-2.5 gap-1.5">
                  <span className="font-mono text-xs font-bold text-[#004D2C] tabular-nums">
                    {formatNaira(product.price)}
                  </span>
                  <button
                    type="button"
                    disabled={product.stock <= 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickBuy(product);
                    }}
                    className="px-3 py-1.5 rounded-full bg-[#006837] text-white text-[11px] font-semibold disabled:opacity-40 whitespace-nowrap"
                  >
                    {product.stock > 0 ? 'Buy' : 'Out'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Head Office Address Card */}
      <div className="px-4 pt-6">
        <div className="bg-[#004D2C] text-white rounded-3xl p-4 border border-[#D4AF37] flex items-start gap-3">
          <span className="w-9 h-9 rounded-xl bg-[#006837] border border-[#D4AF37]/70 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-[#F3E5AB]" />
          </span>
          <div className="space-y-0.5 text-xs">
            <p className="font-display font-bold text-[#F3E5AB]">
              {STORE_INFO.brandName} · {STORE_INFO.headOfficeLabel}
            </p>
            <p className="text-[#E3EED4] leading-relaxed">{STORE_INFO.fullAddress}</p>
          </div>
        </div>
      </div>

      {/* Mobile Multi-Facet Filter Bottom Sheet */}
      {filterSheetOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#004D2C]/50 backdrop-blur-xs flex items-end"
          onClick={() => setFilterSheetOpen(false)}
        >
          <div
            className="bg-white w-full rounded-t-3xl p-6 space-y-5 max-h-[82vh] overflow-y-auto border-t-2 border-[#D4AF37]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1.5 bg-[#D4AF37] rounded-full mx-auto" />
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-[#004D2C]">Filter &amp; Sort</h3>
              <button
                type="button"
                onClick={onResetFilters}
                className="text-xs font-semibold text-[#006837]"
              >
                Reset All
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#006837]">Price Range (Naira)</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'all', label: 'All Prices' },
                  { id: 'under20k', label: 'Under ₦20,000' },
                  { id: '20kto40k', label: '₦20,000 – ₦40,000' },
                  { id: 'over40k', label: '₦40,000+' },
                ].map((band) => (
                  <button
                    key={band.id}
                    type="button"
                    onClick={() => onUpdateFilters({ priceBand: band.id as FilterState['priceBand'] })}
                    className={`min-h-[44px] rounded-xl text-xs font-semibold border transition-colors ${
                      filters.priceBand === band.id
                        ? 'bg-[#006837] text-white border-[#D4AF37]'
                        : 'bg-[#E3EED4]/45 text-[#004D2C] border-[#AEC3B0]'
                    }`}
                  >
                    {band.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#006837]">Shade</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateFilters({ color: 'All' })}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border ${
                    filters.color === 'All'
                      ? 'bg-[#006837] text-white border-[#D4AF37]'
                      : 'bg-[#E3EED4]/45 text-[#004D2C] border-[#AEC3B0]'
                  }`}
                >
                  All Colors
                </button>
                {allColors.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => onUpdateFilters({ color: col })}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 ${
                      filters.color === col
                        ? 'bg-[#006837] text-white border-[#D4AF37]'
                        : 'bg-[#E3EED4]/45 text-[#004D2C] border-[#AEC3B0]'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/15"
                      style={{ backgroundColor: COLOR_SWATCH_MAP[col] || '#006837' }}
                    />
                    {col}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#006837]">Sort Order</p>
              <select
                value={filters.sortBy}
                onChange={(e) => onUpdateFilters({ sortBy: e.target.value as FilterState['sortBy'] })}
                className="w-full min-h-[44px] rounded-xl border border-[#AEC3B0] bg-[#E3EED4]/40 px-3 text-sm text-[#004D2C]"
              >
                <option value="featured">Featured Drops</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            <label className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-[#004D2C]">In Stock Only</span>
              <input
                type="checkbox"
                checked={filters.inStockOnly}
                onChange={(e) => onUpdateFilters({ inStockOnly: e.target.checked })}
                className="w-5 h-5 accent-[#006837]"
              />
            </label>

            <button
              type="button"
              onClick={() => setFilterSheetOpen(false)}
              className="w-full min-h-[48px] rounded-2xl bg-[#006837] text-white text-sm font-bold border border-[#D4AF37]"
            >
              Show {filteredProducts.length} Result{filteredProducts.length === 1 ? '' : 's'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
