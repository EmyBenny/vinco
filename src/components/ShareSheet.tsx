import { Check, Copy, Share2, X } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatNaira, type Product } from '../types/ecommerce';

interface ShareSheetProps {
  product: Product;
  onClose: () => void;
}

export function ShareSheet({ product, onClose }: ShareSheetProps) {
  const { pushLocalToast } = useStore();
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?product=${encodeURIComponent(product.id)}`
      : `https://vinco.store/?product=${encodeURIComponent(product.id)}`;

  const shareText = `Check out ${product.title} (${formatNaira(product.price)}) on Vinco & More`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      pushLocalToast({
        title: 'Link Copied',
        message: `Direct link for ${product.title} copied to clipboard.`,
        tone: 'emerald',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      pushLocalToast({
        title: 'Copy Unavailable',
        message: 'Please copy the URL from the field below.',
        tone: 'amber',
      });
    }
  };

  const triggerNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: shareText,
          url: shareUrl,
        });
        onClose();
      } catch {
        // User cancelled share sheet
      }
    }
  };

  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const waHref = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#004D2C]/50 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-3xl p-6 space-y-5 shadow-2xl border-2 border-[#D4AF37]/75"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-[#004D2C]">Share Product</h3>
            <p className="text-xs text-[#006837] mt-0.5 tabular-nums">
              {product.title} · {formatNaira(product.price)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close share sheet"
            className="min-w-[44px] min-h-[44px] rounded-full bg-[#E3EED4] hover:bg-[#D4AF37]/30 flex items-center justify-center text-[#004D2C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <a
            href={xHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1.5 py-3.5 px-2 rounded-2xl bg-[#E3EED4]/60 hover:bg-[#D4AF37]/25 border border-[#AEC3B0] text-[#004D2C] text-xs font-semibold transition-colors"
          >
            <span className="font-display text-base font-bold">X</span>
            <span>Post to X</span>
          </a>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1.5 py-3.5 px-2 rounded-2xl bg-[#E3EED4]/60 hover:bg-[#D4AF37]/25 border border-[#AEC3B0] text-[#004D2C] text-xs font-semibold transition-colors"
          >
            <span className="font-display text-base font-bold text-[#006837]">WA</span>
            <span>WhatsApp</span>
          </a>
          <a
            href={fbHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1.5 py-3.5 px-2 rounded-2xl bg-[#E3EED4]/60 hover:bg-[#D4AF37]/25 border border-[#AEC3B0] text-[#004D2C] text-xs font-semibold transition-colors"
          >
            <span className="font-display text-base font-bold text-[#B8860B]">FB</span>
            <span>Facebook</span>
          </a>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-2xl bg-[#E3EED4]/45 border border-[#AEC3B0]">
          <input
            type="text"
            readOnly
            value={shareUrl}
            aria-label="Direct product link"
            className="flex-1 bg-transparent text-xs font-mono text-[#006837] px-2 outline-none truncate"
          />
          <button
            type="button"
            onClick={() => void copyLink()}
            className="min-h-[40px] px-4 rounded-xl bg-[#006837] text-white border border-[#D4AF37] text-xs font-semibold hover:bg-[#004D2C] transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#D4AF37]" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
          <button
            type="button"
            onClick={() => void triggerNativeShare()}
            className="w-full min-h-[44px] rounded-xl border border-[#D4AF37] text-[#004D2C] text-sm font-semibold hover:bg-[#E3EED4]/40 transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4 text-[#006837]" />
            More Sharing Options
          </button>
        )}
      </div>
    </div>
  );
}
