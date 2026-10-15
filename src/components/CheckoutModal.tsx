import React, { useState } from 'react';
import { CartItem, User, ShippingAddress, PaymentMethod, Order } from '../types/bookstore';
import { X, CreditCard, QrCode, Truck, ShieldCheck, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currentUser: User;
  discountAmount: number;
  promoCode: string;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  currentUser,
  discountAmount,
  promoCode: _promoCode,
  onOrderSuccess,
}) => {
  const [step, setStep] = useState<'shipping' | 'payment' | 'processing'>('shipping');
  
  // Shipping form state
  const [shipping, setShipping] = useState<ShippingAddress>({
    fullName: currentUser.name || 'Julian Henderson',
    email: currentUser.email || 'customer@example.com',
    phone: currentUser.phone || '+1 (555) 678-1234',
    addressLine: currentUser.address || '742 Evergreen Terrace',
    city: currentUser.city || 'Springfield',
    state: 'OR',
    postalCode: currentUser.postalCode || '97477',
    country: 'United States',
  });

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('884');
  const [cardName, setCardName] = useState(currentUser.name || 'Julian Henderson');
  const [upiId, setUpiId] = useState('customer@okaxis');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('Securing SSL connection...');

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.book.price * item.quantity, 0);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = taxableAmount * 0.08;
  const shippingFee = subtotal > 50 || subtotal === 0 ? 0 : 4.50;
  const total = taxableAmount + tax + shippingFee;

  const handleProcessPayment = () => {
    setIsProcessing(true);
    setStep('processing');
    
    // Realistic payment gateway sequence simulation
    setProcessingStatus('Authorizing transaction with payment gateway...');
    setTimeout(() => {
      setProcessingStatus('Verifying cryptographic token & ledger...');
    }, 800);

    setTimeout(() => {
      setProcessingStatus('Payment verified. Generating order manifest...');
    }, 1500);

    setTimeout(() => {
      const orderNumber = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const trackingNumber = `TRK-USPS-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const transactionId = paymentMethod === 'cod'
        ? 'TXN-COD-PENDING'
        : `TXN-${paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber,
        userId: currentUser.id,
        customerName: shipping.fullName,
        customerEmail: shipping.email,
        items: items.map((i) => ({
          bookId: i.book.id,
          title: i.book.title,
          author: i.book.author,
          isbn: i.book.isbn,
          price: i.book.price,
          quantity: i.quantity,
          coverPalette: i.book.coverPalette,
        })),
        subtotal,
        discount: discountAmount,
        tax,
        shippingFee,
        total,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        orderStatus: 'placed',
        shippingAddress: shipping,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        trackingNumber,
        transactionId,
      };

      setIsProcessing(false);
      onOrderSuccess(newOrder);
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-neutral-200">
        
        {/* Top Bar */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div>
            <h3 className="font-serif font-bold text-lg text-neutral-900">
              {step === 'processing' ? 'Processing Transaction' : 'Checkout & Payment'}
            </h3>
            <p className="text-xs text-neutral-500">
              {step === 'shipping' ? 'Step 1 of 2: Shipping Destination' : step === 'payment' ? 'Step 2 of 2: Payment Method' : 'Verifying through payment network'}
            </p>
          </div>

          {step !== 'processing' && (
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {step === 'processing' ? (
            <div className="py-16 text-center space-y-5">
              <div className="inline-flex p-4 rounded-full bg-amber-50 text-amber-600">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-lg font-bold text-neutral-900">
                  Processing Your Payment
                </h4>
                <p className="text-xs text-neutral-500 font-mono">
                  {processingStatus}
                </p>
              </div>
              <p className="text-[11px] text-neutral-400">
                Please do not close or refresh this window.
              </p>
            </div>
          ) : step === 'shipping' ? (
            /* Step 1: Shipping */
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Recipient Full Name
                  </label>
                  <input
                    type="text"
                    value={shipping.fullName}
                    onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    placeholder="Jane Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Email for Order Confirmation
                  </label>
                  <input
                    type="email"
                    value={shipping.email}
                    onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    placeholder="jane@example.com"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Street Address & Apartment / Suite
                  </label>
                  <input
                    type="text"
                    value={shipping.addressLine}
                    onChange={(e) => setShipping({ ...shipping, addressLine: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    placeholder="123 Library Lane, Apt 4"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    State / Postal Code
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={shipping.state}
                      onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 uppercase"
                      placeholder="NY"
                    />
                    <input
                      type="text"
                      value={shipping.postalCode}
                      onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                      placeholder="10001"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={shipping.phone}
                    onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                    placeholder="+1 (555) 000-0000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={shipping.country}
                    onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              {/* Order quick overview */}
              <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200 text-xs flex justify-between items-center">
                <div>
                  <span className="font-semibold text-neutral-900">{items.length} book titles</span>
                  <span className="text-neutral-500 ml-2">Total: <strong className="font-mono text-neutral-900">${total.toFixed(2)}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('payment')}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Step 2: Payment Method */
            <div className="space-y-6">
              
              {/* Payment Method Selector */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors ${
                    paymentMethod === 'credit_card'
                      ? 'border-amber-500 bg-amber-50/50 text-neutral-900'
                      : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-amber-600 mb-2" />
                  <div>
                    <p className="text-xs font-bold">Credit/Debit Card</p>
                    <p className="text-[10px] text-neutral-500">Visa, Mastercard, Amex</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors ${
                    paymentMethod === 'upi'
                      ? 'border-amber-500 bg-amber-50/50 text-neutral-900'
                      : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-amber-600 mb-2" />
                  <div>
                    <p className="text-xs font-bold">UPI / QR Code</p>
                    <p className="text-[10px] text-neutral-500">Instant app scan</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors ${
                    paymentMethod === 'cod'
                      ? 'border-amber-500 bg-amber-50/50 text-neutral-900'
                      : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                  }`}
                >
                  <Truck className="w-5 h-5 text-amber-600 mb-2" />
                  <div>
                    <p className="text-xs font-bold">Cash on Delivery</p>
                    <p className="text-[10px] text-neutral-500">Pay upon doorstep receipt</p>
                  </div>
                </button>
              </div>

              {/* Dynamic Payment Details */}
              {paymentMethod === 'credit_card' && (
                <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 space-y-4">
                  <div className="flex items-center justify-between text-xs text-neutral-500 pb-2 border-b border-neutral-200">
                    <span className="flex items-center gap-1.5 font-medium text-neutral-800">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Mock Stripe / Card Payment Gateway
                    </span>
                    <span className="text-[11px] font-mono text-emerald-700 font-medium">Test Mode Active</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-mono border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                          CVC / CVV
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-mono border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-200 text-center space-y-4">
                  <div className="inline-block p-3 bg-white border border-neutral-300 rounded-xl shadow-xs">
                    <div className="w-32 h-32 bg-neutral-900 flex flex-col items-center justify-center text-white text-[10px] font-mono p-2">
                      <QrCode className="w-16 h-16 mb-1 text-amber-400" />
                      <span>SCAN TO PAY</span>
                      <span className="tabular-nums font-bold text-amber-300">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="max-w-xs mx-auto text-left">
                    <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                      Or Pay via Virtual Payment Address (VPA)
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                      placeholder="username@bank"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="bg-amber-50/60 rounded-xl p-5 border border-amber-200 text-xs space-y-2 text-neutral-800">
                  <p className="font-semibold text-neutral-900 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-amber-700" />
                    Cash on Delivery Terms
                  </p>
                  <p className="text-neutral-600 leading-relaxed">
                    You can pay the full amount of <strong className="font-mono text-neutral-950">${total.toFixed(2)}</strong> via cash or mobile POS when the courier delivers your book parcel to <strong>{shipping.addressLine}, {shipping.city}</strong>.
                  </p>
                </div>
              )}

              {/* Price summary & Pay Button */}
              <div className="pt-2 border-t border-neutral-200 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500">Total Charged</span>
                  <span className="font-mono text-xl font-bold text-neutral-900 tabular-nums">
                    ${total.toFixed(2)}
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('shipping')}
                    className="px-4 py-2.5 text-xs font-medium border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
                  >
                    Back to Shipping
                  </button>

                  <button
                    type="button"
                    onClick={handleProcessPayment}
                    className="flex-1 py-3 px-4 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize Payment · ${total.toFixed(2)}</span>
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
