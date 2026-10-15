import React from 'react';
import { Order } from '../types/bookstore';
import { Package, Clock, CheckCircle2, Truck, FileText, XCircle } from 'lucide-react';

interface CustomerOrdersViewProps {
  orders: Order[];
  onViewInvoice: (order: Order) => void;
  onCancelOrder: (orderId: string) => void;
  onBrowseBooks: () => void;
}

export const CustomerOrdersView: React.FC<CustomerOrdersViewProps> = ({
  orders,
  onViewInvoice,
  onCancelOrder,
  onBrowseBooks,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="border-b border-neutral-200 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 tracking-tight">
            Order History & Dispatch Tracking
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Monitor real-time shipment status, review invoices, and manage past book deliveries
          </p>
        </div>

        <button
          onClick={onBrowseBooks}
          className="self-start sm:self-auto px-4 py-2 text-xs font-semibold bg-neutral-900 text-stone-100 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          Browse Bookstore
        </button>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 mx-auto flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-neutral-900">
            No orders found
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            You haven't placed any book orders yet. Browse our curated selection and proceed to checkout to see your orders here.
          </p>
          <button
            onClick={onBrowseBooks}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold text-xs rounded-lg transition-colors shadow-2xs"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const steps = [
              { key: 'placed', label: 'Order Placed', icon: Clock },
              { key: 'processing', label: 'Processing & Packed', icon: Package },
              { key: 'shipped', label: 'In Transit', icon: Truck },
              { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
            ];

            const statusIndex =
              order.orderStatus === 'cancelled'
                ? -1
                : steps.findIndex((s) => s.key === order.orderStatus);

            return (
              <div
                key={order.id}
                className="bg-white border border-neutral-200/90 rounded-xl p-6 shadow-xs space-y-5"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-3">
                      <span className="font-serif font-bold text-base text-neutral-900">
                        {order.orderNumber}
                      </span>
                      {order.orderStatus === 'cancelled' ? (
                        <span className="px-2 py-0.5 text-[11px] font-semibold bg-rose-50 text-rose-700 rounded border border-rose-200">
                          Cancelled
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-50 text-amber-900 rounded border border-amber-200/80 uppercase font-mono">
                          {order.orderStatus}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500">
                      Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewInvoice(order)}
                      className="px-3 py-1.5 text-xs font-medium border border-neutral-300 hover:bg-neutral-50 text-neutral-700 rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Invoice</span>
                    </button>

                    {(order.orderStatus === 'placed' || order.orderStatus === 'processing') && (
                      <button
                        onClick={() => onCancelOrder(order.id)}
                        className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel Order</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Tracking Stepper (if not cancelled) */}
                {order.orderStatus !== 'cancelled' && (
                  <div className="py-2">
                    <div className="grid grid-cols-4 gap-2 relative">
                      {steps.map((step, idx) => {
                        const isDone = idx <= statusIndex;
                        const isCurrent = idx === statusIndex;
                        const Icon = step.icon;

                        return (
                          <div key={step.key} className="text-center space-y-1.5">
                            <div
                              className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                isDone
                                  ? 'bg-neutral-900 text-stone-100'
                                  : 'bg-neutral-100 text-neutral-400'
                              } ${isCurrent ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <p
                              className={`text-[11px] font-medium ${
                                isDone ? 'text-neutral-900' : 'text-neutral-400'
                              }`}
                            >
                              {step.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Items in this order */}
                <div className="divide-y divide-neutral-100 pt-2 border-t border-neutral-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-3 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-semibold text-neutral-900">{item.title}</p>
                        <p className="text-neutral-500 text-[11px]">
                          By {item.author} · ISBN: {item.isbn}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-mono tabular-nums text-neutral-900 font-medium">
                          {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                        <p className="font-mono tabular-nums text-neutral-500 font-semibold">
                          ${(item.quantity * item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer Info */}
                <div className="bg-neutral-50 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-600">
                  <div>
                    <span>Shipping To: </span>
                    <strong className="text-neutral-900">
                      {order.shippingAddress.addressLine}, {order.shippingAddress.city}
                    </strong>
                    <span className="font-mono ml-3 text-neutral-500">
                      Tracking: {order.trackingNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500">Total Paid:</span>
                    <span className="font-mono text-base font-bold text-neutral-900 tabular-nums">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
