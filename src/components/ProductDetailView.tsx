import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Layers,
  Palette,
  Plus,
  RotateCw,
  Ruler,
  Share2,
  Star,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { COLOR_SWATCH_MAP, formatNaira, type Product } from '../types/ecommerce';
import { SafeImage } from './SafeImage';
import { ShareSheet } from './ShareSheet';

interface ProductDetailViewProps {
  product: Product;
  initialMode?: 'overview' | 'studio' | 'lookbook';
  onBack: () => void;
  onSelectProduct: (product: Product, mode?: 'overview' | 'studio' | 'lookbook') => void;
  onOpenCartCheckout: () => void;
}

export function ProductDetailView({
  product,
  initialMode = 'overview',
  onBack,
  onSelectProduct,
  onOpenCartCheckout,
}: ProductDetailViewProps) {
  const { products, reviews, addToCart, addReview, pushLocalToast } = useStore();
  const { profile, toggleWishlist } = useAuth();

  const [viewMode, setViewMode] = useState<'overview' | 'studio' | 'lookbook'>(initialMode);
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || 'Sharp Emerald');
  const [selectedSize, setSelectedSize] = useState(product.sizes.includes('M') ? 'M' : product.sizes[0] || 'Standard');
  const [selectedStyle, setSelectedStyle] = useState(product.styles[0] || 'Standard');
  const [attrTab, setAttrTab] = useState<'colors' | 'size' | 'styles'>('colors');
  const [infoTab, setInfoTab] = useState<'closet' | 'about' | 'reviews'>('about');
  const [rotationDeg, setRotationDeg] = useState(0);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const gallery = useMemo(() => {
    const imgs = [product.imageUrl, ...product.galleryImages].filter(Boolean);
    return Array.from(new Set(imgs));
  }, [product.imageUrl, product.galleryImages]);

  const activeImage = gallery[activeGalleryIndex % gallery.length] || product.imageUrl;

  const relatedProducts = useMemo(
    () => products.filter((p) => p.id !== product.id).slice(0, 3),
    [products, product.id]
  );

  const productReviews = useMemo(
    () => reviews.filter((r) => r.productId === product.id),
    [reviews, product.id]
  );

  const nextProduct = () => {
    const idx = products.findIndex((p) => p.id === product.id);
    const next = products[(idx + 1) % products.length];
    if (next) {
      setActiveGalleryIndex(0);
      setRotationDeg(0);
      setSelectedColor(next.colors[0] || 'Sharp Emerald');
      setSelectedSize(next.sizes[0] || 'Standard');
      setSelectedStyle(next.styles[0] || 'Standard');
      onSelectProduct(next, viewMode);
    }
  };

  const handleAddToCart = (openCheckoutImmediately = false) => {
    if (product.stock <= 0) {
      pushLocalToast({
        title: 'Out of Stock',
        message: 'This item is currently awaiting restock.',
        tone: 'rose',
      });
      return;
    }
    addToCart({
      productId: product.id,
      title: product.title,
      price: product.price,
      imageUrl: product.imageUrl,
      color: selectedColor,
      size: selectedSize,
      style: selectedStyle,
      quantity: 1,
    });
    if (openCheckoutImmediately) {
      onOpenCartCheckout();
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      await addReview(product.id, reviewRating, reviewComment);
      setReviewComment('');
      setReviewRating(5);
    } catch (err) {
      pushLocalToast({
        title: 'Review Notice',
        message: err instanceof Error ? err.message : 'Unable to post review.',
        tone: 'amber',
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const isWishlisted = profile?.wishlist.includes(product.id) ?? false;

  return (
    <div className="bg-[#E3EED4] min-h-screen pb-28 md:pb-16">
      {/* Top Action Bar */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-4 pb-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-xl text-sm font-semibold text-[#004D2C] hover:bg-white/60 transition-colors whitespace-nowrap"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {/* Inspection Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-white/90 border border-[#D4AF37]/60 rounded-xl">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'studio', label: '360°' },
            { id: 'lookbook', label: 'Lookbook' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setViewMode(tab.id as 'overview' | 'studio' | 'lookbook')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                viewMode === tab.id
                  ? 'bg-[#006837] text-[#F3E5AB] ring-1 ring-[#D4AF37] shadow-xs'
                  : 'text-[#006837] hover:text-[#004D2C]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            aria-label="Share product"
            className="min-w-[44px] min-h-[44px] rounded-xl bg-white/90 hover:bg-white text-[#004D2C] border border-[#D4AF37]/60 flex items-center justify-center transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextProduct}
            className="hidden sm:inline-flex min-h-[44px] px-3.5 rounded-xl text-xs font-semibold text-[#004D2C] hover:bg-white/60 items-center gap-1 whitespace-nowrap"
          >
            Change Product
            <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37]" />
          </button>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* MODE 1: Curved Sharp Emerald + Gold Hero Card + Colors/Size/Styles + Recommendations */}
        {viewMode === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6 bg-gradient-to-br from-[#007A3D] via-[#00592D] to-[#003D20] rounded-[32px] p-6 md:p-8 text-white relative overflow-hidden border-2 border-[#D4AF37]/75 shadow-xl shadow-[#004D2C]/20">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-6 space-y-4 z-10">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#F3E5AB]">
                    <span>{product.category}</span>
                    <span>·</span>
                    <span className="tabular-nums">{product.stock > 0 ? `${product.stock} in stock` : 'Sold Out'}</span>
                  </div>

                  <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight text-balance">
                    {product.title}
                  </h1>

                  <div className="space-y-0.5">
                    <span className="font-display text-2xl sm:text-3xl font-extrabold tabular-nums text-[#F3E5AB] block">
                      {formatNaira(product.price)}
                    </span>
                    <span className="text-xs text-[#E3EED4]/90">Available Sizes &amp; Shades</span>
                  </div>

                  <button
                    type="button"
                    disabled={product.stock <= 0}
                    onClick={() => handleAddToCart(true)}
                    className="px-6 py-3 rounded-full bg-[#D4AF37] hover:bg-[#F3E5AB] text-[#003B20] font-display text-sm font-bold shadow-md transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    Buy Now
                  </button>
                </div>

                <div className="col-span-6 relative">
                  <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-black/20 ring-1 ring-[#D4AF37]/50">
                    <SafeImage
                      src={activeImage}
                      alt={product.title}
                      fallbackTitle={product.title}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white rounded-3xl p-4 border border-[#D4AF37]/60 space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'colors', label: 'Colors', icon: Palette },
                    { id: 'size', label: 'Size', icon: Ruler },
                    { id: 'styles', label: 'Styles', icon: Layers },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const active = attrTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setAttrTab(tab.id as 'colors' | 'size' | 'styles')}
                        className={`min-h-[44px] rounded-2xl px-3 flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors ${
                          active
                            ? 'bg-[#006837] text-[#F3E5AB] ring-1 ring-[#D4AF37] shadow-sm'
                            : 'bg-[#E3EED4]/55 text-[#004D2C] hover:bg-[#E3EED4]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {attrTab === 'colors' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#004D2C]">Selected: {selectedColor}</span>
                      <span className="text-[#3B7A57]">Available Shades</span>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      {product.colors.map((color) => {
                        const active = selectedColor === color;
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setSelectedColor(color)}
                            title={color}
                            aria-label={`Select color ${color}`}
                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-transform ${
                              active ? 'border-[#D4AF37] scale-110' : 'border-[#AEC3B0]'
                            }`}
                          >
                            <span
                              className="w-7 h-7 rounded-full border border-black/10"
                              style={{ backgroundColor: COLOR_SWATCH_MAP[color] || '#006837' }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {attrTab === 'size' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#004D2C]">Selected Size: {selectedSize}</span>
                      <button
                        type="button"
                        onClick={() => setSizeChartOpen(true)}
                        className="text-[#006837] font-semibold hover:underline decoration-[#D4AF37]"
                      >
                        Size Guide
                      </button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`min-w-[48px] min-h-[44px] px-3 rounded-xl text-xs font-bold border transition-colors ${
                            selectedSize === size
                              ? 'bg-[#006837] text-white border-[#D4AF37]'
                              : 'bg-[#E3EED4]/45 text-[#004D2C] border-[#AEC3B0] hover:border-[#D4AF37]'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {attrTab === 'styles' && (
                  <div className="space-y-2.5">
                    <p className="text-xs font-semibold text-[#004D2C]">Selected Weave / Cut: {selectedStyle}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {product.styles.map((style) => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => setSelectedStyle(style)}
                          className={`min-h-[44px] px-4 rounded-xl text-xs font-semibold border transition-colors ${
                            selectedStyle === style
                              ? 'bg-[#006837] text-white border-[#D4AF37]'
                              : 'bg-[#E3EED4]/45 text-[#004D2C] border-[#AEC3B0] hover:border-[#D4AF37]'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* You May Like More */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-base font-bold text-[#004D2C]">You may like more</h2>
                  <button
                    type="button"
                    onClick={nextProduct}
                    className="text-xs font-semibold text-[#006837] inline-flex items-center gap-1"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {relatedProducts.map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => onSelectProduct(rel, 'overview')}
                      className="rounded-2xl bg-white border border-[#AEC3B0] p-3 flex items-center justify-between gap-2 cursor-pointer hover:border-[#D4AF37] transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="font-display text-xs font-bold text-[#004D2C] truncate">{rel.title}</p>
                        <p className="font-mono text-xs text-[#006837] font-semibold mt-0.5 tabular-nums">
                          {formatNaira(rel.price)}
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart({
                              productId: rel.id,
                              title: rel.title,
                              price: rel.price,
                              imageUrl: rel.imageUrl,
                              color: rel.colors[0] || 'Sharp Emerald',
                              size: rel.sizes[0] || 'Standard',
                              style: rel.styles[0] || 'Standard',
                              quantity: 1,
                            });
                          }}
                          aria-label={`Quick add ${rel.title}`}
                          className="mt-2 w-7 h-7 rounded-full bg-[#006837] text-[#F3E5AB] border border-[#D4AF37] flex items-center justify-center"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="w-16 h-20 rounded-xl overflow-hidden bg-[#E3EED4]/50 shrink-0">
                        <SafeImage
                          src={rel.imageUrl}
                          alt={rel.title}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Inline Purchase Module */}
              <div className="hidden md:flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => void toggleWishlist(product.id)}
                  aria-label="Toggle wishlist"
                  className="min-w-[48px] min-h-[48px] rounded-2xl bg-white border border-[#D4AF37] flex items-center justify-center text-[#004D2C] hover:bg-[#E3EED4]/50"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-[#D4AF37] text-[#D4AF37]' : ''}`} />
                </button>
                <button
                  type="button"
                  disabled={product.stock <= 0}
                  onClick={() => handleAddToCart(false)}
                  className="flex-1 min-h-[48px] rounded-2xl bg-white border-2 border-[#006837] text-[#004D2C] font-display text-sm font-bold hover:bg-[#E3EED4]/50 transition-colors disabled:opacity-40"
                >
                  Add to Cart
                </button>
                <button
                  type="button"
                  disabled={product.stock <= 0}
                  onClick={() => handleAddToCart(true)}
                  className="flex-1 min-h-[48px] rounded-2xl bg-[#006837] text-white border border-[#D4AF37] font-display text-sm font-bold hover:bg-[#004D2C] transition-colors disabled:opacity-40"
                >
                  Buy Now · {formatNaira(product.price)}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: 360 Studio Inspection + Pairing / About / Reviews */}
        {viewMode === 'studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6 space-y-4">
              <div className="text-center">
                <p className="text-xs font-semibold text-[#006837]">Vinco &amp; More {product.category} Inspection</p>
                <h1 className="font-display text-2xl font-bold text-[#004D2C] mt-1">{product.title}</h1>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-[#D4AF37]/60 flex flex-col items-center">
                <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden bg-[#E3EED4]/45 shadow-sm flex items-center justify-center">
                  <div
                    className="w-full h-full transition-transform duration-150"
                    style={{
                      transform: `perspective(900px) rotateY(${rotationDeg}deg) scale(${
                        1 - Math.abs(rotationDeg) * 0.001
                      })`,
                    }}
                  >
                    <SafeImage
                      src={activeImage}
                      alt={`${product.title} 360 preview`}
                      fallbackTitle={product.title}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </div>

                <div className="w-full max-w-xs mt-5 space-y-2">
                  <div className="h-3 rounded-full border-2 border-[#D4AF37]/70 flex items-center px-2 relative">
                    <input
                      type="range"
                      min={-45}
                      max={45}
                      value={rotationDeg}
                      onChange={(e) => {
                        const deg = Number(e.target.value);
                        setRotationDeg(deg);
                        if (gallery.length > 1) {
                          const idx = Math.floor(((deg + 45) / 91) * gallery.length);
                          setActiveGalleryIndex(Math.min(gallery.length - 1, Math.max(0, idx)));
                        }
                      }}
                      aria-label="Rotate product angle"
                      className="w-full accent-[#006837] cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-[#3B7A57]">
                    <RotateCw className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Drag slider to inspect 360° angle &amp; frames</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2.5">
                {gallery.slice(0, 4).map((img, i) => (
                  <button
                    key={`${img}-${i}`}
                    type="button"
                    onClick={() => setActiveGalleryIndex(i)}
                    className={`h-20 rounded-2xl overflow-hidden border-2 bg-white transition-all ${
                      activeGalleryIndex === i ? 'border-[#D4AF37] shadow-sm' : 'border-transparent'
                    }`}
                  >
                    <SafeImage src={img} alt={`${product.title} view ${i + 1}`} className="w-full h-full object-cover object-top" />
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-[#D4AF37]/60 space-y-5">
              <div className="flex items-center justify-between border-b border-[#AEC3B0]/50">
                {[
                  { id: 'closet', label: 'Pairing' },
                  { id: 'about', label: 'About' },
                  { id: 'reviews', label: `Reviews (${productReviews.length || product.reviewCount})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setInfoTab(tab.id as 'closet' | 'about' | 'reviews')}
                    className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                      infoTab === tab.id
                        ? 'border-[#D4AF37] text-[#004D2C]'
                        : 'border-transparent text-[#3B7A57] hover:text-[#004D2C]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {infoTab === 'about' && (
                <div className="space-y-4">
                  <p className="text-sm text-[#006837] leading-relaxed">{product.description}</p>
                  <div className="rounded-2xl bg-[#E3EED4]/55 p-4 space-y-2 border border-[#D4AF37]/50">
                    <p className="text-xs font-bold text-[#004D2C]">Textile &amp; Craftsmanship</p>
                    <p className="text-xs text-[#006837]">{product.fabricSpecs}</p>
                    <div className="flex items-center gap-4 pt-2 text-xs text-[#004D2C]">
                      <span className="tabular-nums font-bold">{formatNaira(product.price)}</span>
                      <span className="text-[#D4AF37]">·</span>
                      <span className="tabular-nums">{product.stock} units available</span>
                    </div>
                  </div>
                </div>
              )}

              {infoTab === 'closet' && (
                <div className="space-y-3">
                  <p className="text-xs text-[#3B7A57]">
                    Complete your home &amp; bath suite with matching Vinco &amp; More textiles:
                  </p>
                  {relatedProducts.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onSelectProduct(item, 'studio')}
                      className="flex items-center justify-between p-3 rounded-2xl border border-[#AEC3B0] hover:border-[#D4AF37] cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <SafeImage
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div>
                          <p className="text-sm font-semibold text-[#004D2C]">{item.title}</p>
                          <p className="text-xs text-[#3B7A57] tabular-nums">
                            {formatNaira(item.price)} · {item.stock} left
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                  ))}
                </div>
              )}

              {infoTab === 'reviews' && (
                <div className="space-y-4">
                  <form onSubmit={(e) => void handleReviewSubmit(e)} className="bg-[#E3EED4]/50 p-4 rounded-2xl space-y-3 border border-[#AEC3B0]/60">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#004D2C]">Write a Review</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setReviewRating(num)}
                            aria-label={`Rate ${num} stars`}
                          >
                            <Star
                              className={`w-4 h-4 ${
                                num <= reviewRating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-[#AEC3B0]'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share softness, stretch, absorbency, and sizing notes..."
                      className="w-full rounded-xl border border-[#AEC3B0] bg-white p-2.5 text-xs text-[#004D2C] outline-none focus:border-[#006837]"
                    />
                    <button
                      type="submit"
                      disabled={submittingReview || !reviewComment.trim()}
                      className="px-4 py-2 rounded-xl bg-[#006837] text-white text-xs font-semibold border border-[#D4AF37] disabled:opacity-50"
                    >
                      {submittingReview ? 'Posting...' : 'Post Review'}
                    </button>
                  </form>

                  <div className="space-y-2.5 max-h-60 overflow-y-auto">
                    {productReviews.length === 0 ? (
                      <p className="text-xs text-[#3B7A57] py-4 text-center">
                        Rated {product.rating.toFixed(1)}/5 across {product.reviewCount} shoppers.
                      </p>
                    ) : (
                      productReviews.map((rev) => (
                        <div key={rev.id} className="p-3.5 rounded-2xl border border-[#AEC3B0]/60 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#004D2C]">{rev.userName}</span>
                            <span className="text-xs font-mono text-[#B8860B] font-bold tabular-nums">{rev.rating}/5 ★</span>
                          </div>
                          <p className="text-xs text-[#006837]">{rev.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className="hidden md:flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={product.stock <= 0}
                  onClick={() => handleAddToCart(false)}
                  className="flex-1 min-h-[48px] rounded-2xl border-2 border-[#006837] text-[#004D2C] font-display text-sm font-bold hover:bg-[#E3EED4]/50"
                >
                  Add to Cart
                </button>
                <button
                  type="button"
                  disabled={product.stock <= 0}
                  onClick={() => handleAddToCart(true)}
                  className="flex-1 min-h-[48px] rounded-2xl bg-[#006837] text-white border border-[#D4AF37] font-display text-sm font-bold hover:bg-[#004D2C]"
                >
                  Buy Now · {formatNaira(product.price)}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODE 3: Editorial Lookbook & Size Guide */}
        {viewMode === 'lookbook' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-b from-white via-[#AEC3B0]/40 to-[#004D2C] border-2 border-[#D4AF37]/70 p-6 flex flex-col items-center">
              <div className="w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden bg-white shadow-lg ring-1 ring-[#D4AF37]/50">
                <SafeImage
                  src={gallery[gallery.length - 1] || product.imageUrl}
                  alt={`${product.title} editorial lookbook`}
                  fallbackTitle={product.title}
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-[#D4AF37]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[40px] min-h-[40px] px-3 rounded-xl text-xs font-bold transition-colors ${
                        selectedSize === size
                          ? 'bg-[#006837] text-[#F3E5AB] ring-1 ring-[#D4AF37]'
                          : 'bg-[#E3EED4] text-[#004D2C] hover:bg-[#AEC3B0]/60'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setSizeChartOpen(true)}
                  className="text-xs font-semibold text-[#006837] hover:text-[#004D2C] underline decoration-[#D4AF37] underline-offset-2"
                >
                  Size &amp; Dimension Guide
                </button>
              </div>

              <div className="space-y-1.5 sm:text-right">
                <div className="flex items-center gap-2 sm:justify-end">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      aria-label={`Choose color ${color}`}
                      className={`w-7 h-7 rounded-full border-2 ${
                        selectedColor === color ? 'border-[#D4AF37] scale-110' : 'border-[#AEC3B0]'
                      }`}
                      style={{ backgroundColor: COLOR_SWATCH_MAP[color] || '#006837' }}
                    />
                  ))}
                </div>
                <p className="text-xs font-medium text-[#3B7A57]">Shade · {selectedColor}</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button
                type="button"
                disabled={product.stock <= 0}
                onClick={() => handleAddToCart(false)}
                className="flex-1 min-h-[48px] rounded-full bg-white border-2 border-[#006837] text-[#004D2C] font-display text-sm font-bold hover:bg-[#E3EED4]/40"
              >
                Add to Cart
              </button>
              <button
                type="button"
                disabled={product.stock <= 0}
                onClick={() => handleAddToCart(true)}
                className="flex-1 min-h-[48px] rounded-full bg-[#006837] text-white border border-[#D4AF37] font-display text-sm font-bold hover:bg-[#004D2C]"
              >
                Buy Now · {formatNaira(product.price)}
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 text-[#004D2C]">
              <button
                type="button"
                onClick={() => setViewMode('studio')}
                aria-label="Previous lookbook view"
                className="min-w-[44px] min-h-[44px] rounded-full hover:bg-white/60 flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                {(['overview', 'studio', 'lookbook'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setViewMode(m)}
                    aria-label={`Switch to ${m}`}
                    className={`h-2 rounded-full transition-all ${
                      viewMode === m ? 'w-5 bg-[#D4AF37]' : 'w-2 bg-[#AEC3B0]'
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={nextProduct}
                aria-label="Next product"
                className="min-w-[44px] min-h-[44px] rounded-full hover:bg-white/60 flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Mobile Bottom Dual Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#D4AF37]/70 px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          disabled={product.stock <= 0}
          onClick={() => handleAddToCart(false)}
          className="flex-1 min-h-[46px] rounded-full border border-[#006837] text-[#004D2C] font-display text-sm font-bold disabled:opacity-40"
        >
          Add to Cart
        </button>
        <button
          type="button"
          disabled={product.stock <= 0}
          onClick={() => handleAddToCart(true)}
          className="flex-1 min-h-[46px] rounded-full bg-[#006837] text-white border border-[#D4AF37] font-display text-sm font-bold shadow-md shadow-[#004D2C]/20 disabled:opacity-40"
        >
          {product.stock > 0 ? 'Buy Now' : 'Sold Out'}
        </button>
      </div>

      {sizeChartOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#004D2C]/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSizeChartOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#D4AF37]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-[#004D2C]">Vinco &amp; More Dimension Guide</h3>
              <button
                type="button"
                onClick={() => setSizeChartOpen(false)}
                className="text-xs font-semibold text-[#006837]"
              >
                Done
              </button>
            </div>
            <table className="w-full text-xs text-left tabular-nums">
              <thead>
                <tr className="border-b border-[#AEC3B0] text-[#3B7A57]">
                  <th className="py-2">Item / Size</th>
                  <th className="py-2">Width</th>
                  <th className="py-2">Length</th>
                  <th className="py-2">Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3EED4] text-[#004D2C] font-medium">
                {[
                  ['Bath Sheet', '90 cm', '170 cm', '700 GSM'],
                  ['Character Towel', '75 cm', '140 cm', '600 GSM'],
                  ['Bathrobe (M/L)', '126 cm', '122 cm', '450 GSM'],
                  ['Boxers (M/L)', '76–90 cm', '32 cm', '190 GSM'],
                  ['Stretching Bedcover', '180 cm', '200 cm', '260 GSM'],
                  ['Students Blanket', '140 cm', '190 cm', '380 GSM'],
                ].map(([sz, w, len, gsm]) => (
                  <tr key={sz}>
                    <td className="py-2.5 font-bold">{sz}</td>
                    <td className="py-2.5">{w}</td>
                    <td className="py-2.5">{len}</td>
                    <td className="py-2.5">{gsm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {shareOpen && <ShareSheet product={product} onClose={() => setShareOpen(false)} />}
    </div>
  );
}
