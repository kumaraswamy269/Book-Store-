import React from 'react';
import { Order } from '../types/bookstore';
import { X, Printer, CheckCircle, Package } from 'lucide-react';

interface OrderInvoiceModalProps {
  order: Order | null;
  onClose: () => void;
  onGoToOrders: () => void;
}

export const OrderInvoiceModal: React.FC<OrderInvoiceModalProps> = ({
  order,
  onClose,
  onGoToOrders,
}) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-neutral-200">
        
        {/* Modal Controls (Not printed) */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10 print:hidden">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle className="w-5 h-5" />
            <h3 className="font-serif font-bold text-base text-neutral-900">
              Order Confirmed & Invoice Issued
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-medium border border-neutral-300 hover:bg-neutral-100 rounded-lg flex items-center gap-1.5 text-neutral-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable Invoice Container */}
        <div id="printable-invoice" className="p-8 sm:p-10 space-y-8 bg-white text-neutral-900 text-xs">
          
          {/* Invoice Header */}
          <div className="flex justify-between items-start border-b border-neutral-200 pb-6">
            <div>
              <h1 className="text-2xl font-serif font-bold text-neutral-900 tracking-tight">
                Book Heavean
              </h1>
              <p className="text-[11px] text-neutral-500 font-sans mt-0.5">
                Online Bookstore & Archive Systems
              </p>
              <p className="text-[11px] text-neutral-500 font-mono mt-2">
                Tax ID / EIN: 84-2910482-B
              </p>
            </div>

            <div className="text-right space-y-1">
              <span className="inline-block px-2.5 py-1 bg-neutral-100 text-neutral-800 font-mono font-bold text-[11px] rounded uppercase">
                Tax Invoice
              </span>
              <p className="font-mono text-neutral-900 font-semibold pt-1">
                {order.orderNumber}
              </p>
              <p className="text-neutral-500">
                Date: {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p className="text-neutral-500 font-mono">
                Txn: {order.transactionId}
              </p>
            </div>
          </div>

          {/* Customer & Shipping Summary */}
          <div className="grid grid-cols-2 gap-6 pb-6 border-b border-neutral-200">
            <div>
              <p className="font-bold text-neutral-900 uppercase tracking-wider text-[10px] text-neutral-400 mb-1">
                Billed & Shipped To:
              </p>
              <p className="font-semibold text-neutral-900 text-sm">{order.shippingAddress.fullName}</p>
              <p className="text-neutral-600 mt-0.5">{order.shippingAddress.addressLine}</p>
              <p className="text-neutral-600">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p className="text-neutral-600">{order.shippingAddress.country}</p>
              <p className="text-neutral-500 font-mono mt-1">{order.shippingAddress.phone}</p>
            </div>

            <div className="space-y-1 text-right">
              <p className="font-bold text-neutral-900 uppercase tracking-wider text-[10px] text-neutral-400 mb-1">
                Payment & Fulfillment:
              </p>
              <p className="text-neutral-700">
                Method: <strong className="uppercase font-mono">{order.paymentMethod.replace('_', ' ')}</strong>
              </p>
              <p className="text-neutral-700">
                Payment Status: <strong className="uppercase font-mono text-emerald-700">{order.paymentStatus}</strong>
              </p>
              <p className="text-neutral-700">
                Order Status: <strong className="uppercase font-mono text-amber-700">{order.orderStatus}</strong>
              </p>
              <p className="text-neutral-500 font-mono pt-1">
                Tracking: {order.trackingNumber}
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 text-[10px] uppercase font-semibold">
                  <th className="py-2">Item Description & ISBN</th>
                  <th className="py-2 text-right">Qty</th>
                  <th className="py-2 text-right">Unit Price</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-mono">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="py-2.5">
                    <td className="py-2.5 font-sans">
                      <p className="font-medium text-neutral-900">{item.title}</p>
                      <p className="text-[11px] text-neutral-400 font-mono">ISBN: {item.isbn} · By {item.author}</p>
                    </td>
                    <td className="py-2.5 text-right tabular-nums">{item.quantity}</td>
                    <td className="py-2.5 text-right tabular-nums">${item.price.toFixed(2)}</td>
                    <td className="py-2.5 text-right tabular-nums font-semibold text-neutral-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Price Totals */}
          <div className="flex justify-end pt-4 border-t border-neutral-200">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount Applied</span>
                  <span className="font-mono tabular-nums">-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>Sales Tax (8%)</span>
                <span className="font-mono tabular-nums">${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Shipping</span>
                <span className="font-mono tabular-nums">
                  {order.shippingFee === 0 ? 'Free' : `$${order.shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-neutral-900 pt-2 border-t border-neutral-300">
                <span>Total Paid</span>
                <span className="font-mono tabular-nums text-base">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center text-neutral-400 text-[11px] pt-6 border-t border-neutral-100">
            Thank you for supporting literary craft. If you have questions regarding your order, contact dispatch@bookheavean.com.
          </div>

        </div>

        {/* Bottom Actions (Not printed) */}
        <div className="p-6 bg-neutral-50 border-t border-neutral-200 flex justify-between items-center print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-200/60 rounded-lg transition-colors"
          >
            Continue Browsing
          </button>

          <button
            onClick={() => {
              onClose();
              onGoToOrders();
            }}
            className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors"
          >
            <Package className="w-4 h-4" />
            <span>Track in My Orders</span>
          </button>
        </div>

      </div>
    </div>
  );
};
