import { CheckCircle2, CreditCard, Lock, MapPin, Minus, Plus, ShieldCheck, Trash2, Wallet, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { STORE_INFO } from '../data/storeInfo';
import { formatNaira, type Order } from '../types/ecommerce';
import { SafeImage } from './SafeImage';

interface CartCheckoutDrawerProps {
  open: boolean;
  onClose: () => void;
  onViewOrders: () => void;
}

export function CartCheckoutDrawer({ open, onClose, onViewOrders }: CartCheckoutDrawerProps) {
  const { profile } = useAuth();
  const { cart, cartSubtotal, updateCartQuantity, removeFromCart, placeOrder } = useStore();

  const [step, setStep] = useState<'bag' | 'checkout' | 'confirmed'>('bag');
  const [customerName, setCustomerName] = useState(profile?.displayName || '');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'express_wallet'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  if (!open) return null;

  const shippingCost = cartSubtotal >= 100000 || cartSubtotal === 0 ? 0 : 4500;
  const totalCost = cartSubtotal + shippingCost;
  const freeShippingRemaining = Math.max(0, 100000 - cartSubtotal);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const order = await placeOrder({
        customerName: customerName || profile?.displayName || 'Vinco & More Customer',
        shippingAddress,
        paymentMethod,
        cardNumber: paymentMethod === 'card' ? cardNumber : undefined,
        expiry: paymentMethod === 'card' ? expiry : undefined,
        cvc: paymentMethod === 'card' ? cvc : undefined,
      });
      setConfirmedOrder(order);
      setStep('confirmed');
      setCardNumber('');
      setExpiry('');
      setCvc('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Checkout could not be completed.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setStep('bag');
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#004D2C]/50 backdrop-blur-xs flex justify-end" onClick={resetAndClose}>
      <aside
        className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl border-l-2 border-[#D4AF37]/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-[#AEC3B0]/50 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-[#004D2C]">
              {step === 'bag'
                ? 'Vinco & More Bag'
                : step === 'checkout'
                  ? 'Express Naira Checkout'
                  : 'Order Confirmed'}
            </h2>
            {step === 'bag' && (
              <p className="text-xs text-[#3B7A57] mt-0.5 tabular-nums">
                {freeShippingRemaining === 0 && cartSubtotal > 0
                  ? 'Unlocked free express delivery'
                  : cartSubtotal > 0
                    ? `Add ${formatNaira(freeShippingRemaining)} more for free express delivery`
                    : 'Add towels, boxers, bedcovers, robes, or blankets'}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            aria-label="Close bag drawer"
            className="min-w-[44px] min-h-[44px] rounded-full bg-[#E3EED4] hover:bg-[#D4AF37]/30 flex items-center justify-center text-[#004D2C]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {step === 'bag' && (
            <>
              {cart.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <p className="font-display text-base font-bold text-[#004D2C]">Your Vinco &amp; More bag is empty</p>
                  <p className="text-xs text-[#3B7A57] max-w-xs mx-auto">
                    Select any towel suite, boxer pack, bedcover, bathrobe, or blanket to begin checkout.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={`${item.productId}-${item.color}-${item.size}`}
                      className="flex gap-3.5 p-3 rounded-2xl bg-[#E3EED4]/45 border border-[#AEC3B0]"
                    >
                      <SafeImage
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-20 h-24 rounded-xl object-cover shrink-0 bg-white"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-display text-sm font-bold text-[#004D2C] truncate">
                              {item.title}
                            </h3>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.productId, item.color, item.size)}
                              aria-label={`Remove ${item.title}`}
                              className="text-[#3B7A57] hover:text-rose-600 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-[#006837] mt-0.5">
                            {item.size} · {item.color} · {item.style}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="inline-flex items-center gap-1 bg-white rounded-xl border border-[#AEC3B0] p-0.5">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.productId, item.color, item.size, -1)}
                              aria-label="Decrease quantity"
                              className="w-8 h-8 flex items-center justify-center text-[#004D2C] hover:bg-[#E3EED4] rounded-lg"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.productId, item.color, item.size, 1)}
                              aria-label="Increase quantity"
                              className="w-8 h-8 flex items-center justify-center text-[#004D2C] hover:bg-[#E3EED4] rounded-lg"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="font-mono text-sm font-bold text-[#004D2C] tabular-nums">
                            {formatNaira(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 'checkout' && (
            <form id="checkout-form" onSubmit={(e) => void handleCheckoutSubmit(e)} className="space-y-5">
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-3">
                <p className="text-xs font-bold text-[#004D2C]">1. Delivery Details</p>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full min-h-[44px] rounded-xl border border-[#AEC3B0] px-3.5 text-sm text-[#004D2C] outline-none focus:border-[#006837]"
                />
                <textarea
                  rows={2}
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Delivery address, city, state (e.g. Benin City, Edo State or Lagos)"
                  className="w-full rounded-xl border border-[#AEC3B0] p-3.5 text-sm text-[#004D2C] outline-none focus:border-[#006837]"
                />
                <div className="flex items-start gap-2 rounded-xl bg-[#E3EED4]/65 border border-[#D4AF37]/50 p-3 text-[11px] text-[#004D2C]">
                  <MapPin className="w-3.5 h-3.5 text-[#006837] shrink-0 mt-0.5" />
                  <span>
                    <strong>{STORE_INFO.headOfficeLabel}:</strong> {STORE_INFO.fullAddress}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-[#004D2C]">2. Naira Payment Gateway (NGN)</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`min-h-[44px] rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 ${
                      paymentMethod === 'card'
                        ? 'bg-[#006837] text-white border-[#D4AF37]'
                        : 'bg-[#E3EED4]/50 text-[#004D2C] border-[#AEC3B0]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    Debit / Credit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('express_wallet')}
                    className={`min-h-[44px] rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 ${
                      paymentMethod === 'express_wallet'
                        ? 'bg-[#006837] text-white border-[#D4AF37]'
                        : 'bg-[#E3EED4]/50 text-[#004D2C] border-[#AEC3B0]'
                    }`}
                  >
                    <Wallet className="w-4 h-4" />
                    Express Wallet
                  </button>
                </div>

                {paymentMethod === 'card' ? (
                  <div className="space-y-2.5 p-4 rounded-2xl bg-[#E3EED4]/45 border border-[#D4AF37]/50">
                    <div className="flex items-center justify-between text-[11px] text-[#006837]">
                      <span className="inline-flex items-center gap-1 font-medium">
                        <Lock className="w-3 h-3 text-[#D4AF37]" />
                        Encrypted Gateway Tokenization
                      </span>
                      <span>Test card: 4242 ··· 4242</span>
                    </div>
                    <input
                      type="text"
                      required
                      inputMode="numeric"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="Card Number (e.g. 4242 4242 4242 4242)"
                      className="w-full min-h-[44px] rounded-xl border border-[#AEC3B0] bg-white px-3.5 text-sm font-mono text-[#004D2C] outline-none focus:border-[#006837]"
                    />
                    <div className="grid grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        required
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full min-h-[44px] rounded-xl border border-[#AEC3B0] bg-white px-3.5 text-sm font-mono text-[#004D2C] outline-none focus:border-[#006837]"
                      />
                      <input
                        type="text"
                        required
                        inputMode="numeric"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                        placeholder="CVC"
                        className="w-full min-h-[44px] rounded-xl border border-[#AEC3B0] bg-white px-3.5 text-sm font-mono text-[#004D2C] outline-none focus:border-[#006837]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#E3EED4] border border-[#D4AF37]/60 text-xs text-[#004D2C] space-y-1">
                    <p className="font-bold">Express Digital Wallet Authorization (NGN)</p>
                    <p>Generates a signed single-use payment token verified directly on our server.</p>
                  </div>
                )}
              </div>
            </form>
          )}

          {step === 'confirmed' && confirmedOrder && (
            <div className="py-6 space-y-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#E3EED4] border border-[#D4AF37] text-[#004D2C] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-[#006837]" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-[#004D2C]">
                  Order {confirmedOrder.orderNumber} Confirmed
                </h3>
                <p className="text-xs text-[#3B7A57] mt-1">
                  Preparing Shipment · Payment verified ({confirmedOrder.paymentMethod} ···· {confirmedOrder.paymentLast4})
                </p>
              </div>

              <div className="bg-[#E3EED4]/55 rounded-2xl p-4 text-left space-y-2 border border-[#D4AF37]/60 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#3B7A57]">Customer</span>
                  <span className="font-semibold text-[#004D2C]">{confirmedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#3B7A57]">Payment Ref</span>
                  <span className="font-mono text-[#006837]">{confirmedOrder.paymentIntentId}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#AEC3B0]">
                  <span className="font-bold text-[#004D2C]">Total Paid</span>
                  <span className="font-mono font-bold text-[#B8860B] tabular-nums">
                    {formatNaira(confirmedOrder.total)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    resetAndClose();
                    onViewOrders();
                  }}
                  className="w-full min-h-[46px] rounded-full bg-[#006837] text-white border border-[#D4AF37] text-sm font-bold"
                >
                  Track Order Live
                </button>
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="w-full min-h-[44px] rounded-full border border-[#AEC3B0] text-[#004D2C] text-xs font-semibold"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>

        {step !== 'confirmed' && cart.length > 0 && (
          <div className="p-5 border-t border-[#AEC3B0]/50 bg-white space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#3B7A57]">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">{formatNaira(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-[#3B7A57]">
                <span>Express Delivery</span>
                <span className="font-mono tabular-nums">
                  {shippingCost === 0 ? 'FREE' : formatNaira(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#004D2C] pt-1.5 border-t border-[#AEC3B0]/40">
                <span>Total</span>
                <span className="font-mono tabular-nums">{formatNaira(totalCost)}</span>
              </div>
            </div>

            {step === 'bag' ? (
              <button
                type="button"
                onClick={() => {
                  if (!customerName && profile?.displayName) setCustomerName(profile.displayName);
                  setStep('checkout');
                }}
                className="w-full min-h-[48px] rounded-full bg-[#006837] hover:bg-[#004D2C] text-white border border-[#D4AF37] font-display text-sm font-bold transition-colors"
              >
                Proceed to Checkout
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep('bag')}
                  className="px-4 min-h-[48px] rounded-full border border-[#AEC3B0] text-xs font-semibold text-[#004D2C]"
                >
                  Back
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={submitting}
                  className="flex-1 min-h-[48px] rounded-full bg-[#006837] hover:bg-[#004D2C] text-white border border-[#D4AF37] font-display text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  {submitting ? 'Authorizing...' : `Pay ${formatNaira(totalCost)}`}
                </button>
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
