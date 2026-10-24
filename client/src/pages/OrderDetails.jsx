import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ordersApi } from '../services/api';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await ordersApi.get(`/${id}`);
        setOrder(res.data.order);
      } catch (err) {
        console.error('Failed to load order', err);
        setError(err.response?.data?.message || 'Could not find the requested order.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleStatusProgress = async (newStatus) => {
    setStatusUpdating(true);
    try {
      const res = await ordersApi.patch(`/${id}/status`, { status: newStatus });
      setOrder(res.data.order);
    } catch (err) {
      console.error('Failed to update status', err);
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafc] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-slate-500 tracking-wide">
              Loading order receipt...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#fafafc] flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-lg mx-auto py-20 px-4 text-center">
          <div className="apple-card rounded-3xl p-12">
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Order Not Found</h2>
            <p className="text-sm text-slate-500 mb-6">{error || 'Unable to locate order record.'}</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => navigate('/orders')}
                className="apple-button px-5 py-2.5 text-xs uppercase tracking-wider"
              >
                View Orders
              </button>
              <button
                onClick={() => navigate('/home')}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold rounded-full transition-all cursor-pointer"
              >
                Back to Store
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const steps = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
  const currentStepIdx = steps.indexOf(order.status);

  return (
    <div className="min-h-screen bg-[#fafafc] text-slate-900 pb-20">
      <Navbar />

      <main className="max-w-4xl w-full mx-auto pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <span>&larr;</span>
            <span>Back to All Orders</span>
          </Link>
          <span className="text-xs font-mono text-slate-400">Order #{order._id}</span>
        </div>

        {/* Success / Status Hero */}
        <div className="apple-card rounded-3xl p-8 sm:p-10 mb-8 text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center text-2xl mx-auto mb-4">
            ✓
          </div>
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
            Payment Completed
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 mb-2">
            Order Confirmed & Secured
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Thank you for your acquisition. A confirmation receipt has been recorded and your items are being prepared.
          </p>

          {/* Timeline Tracker */}
          <div className="mt-8 max-w-xl mx-auto pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-slate-200 -z-0"></div>
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-900 -z-0 transition-all duration-500"
                style={{
                  width: `${
                    currentStepIdx >= 0 ? (currentStepIdx / (steps.length - 1)) * 100 : 0
                  }%`
                }}
              ></div>

              {steps.map((st, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;
                return (
                  <div key={st} className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        isCurrent
                          ? 'bg-slate-900 text-white ring-4 ring-slate-100 shadow-sm'
                          : isPassed
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-400 border border-slate-200'
                      }`}
                    >
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`text-[10px] font-bold mt-2 uppercase tracking-wider ${
                        isCurrent
                          ? 'text-slate-900'
                          : isPassed
                          ? 'text-slate-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {st}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detailed Receipt Card */}
        <div className="apple-card rounded-3xl p-8 sm:p-10 space-y-8">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-slate-100 text-xs">
            <div>
              <p className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                Order Reference
              </p>
              <p className="font-mono font-bold text-slate-900 mt-0.5 truncate">{order._id}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                Date & Time
              </p>
              <p className="font-medium text-slate-800 mt-0.5">
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                Payment Status
              </p>
              <p className="font-bold text-emerald-600 mt-0.5 uppercase">
                {order.paymentStatus || 'COMPLETED'}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                Current Status
              </p>
              <p className="font-bold text-slate-900 mt-0.5">{order.status}</p>
            </div>
          </div>

          {/* Delivery & Payment Two-Column */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">📍</span>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Delivery Destination
                </h3>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {order.shippingAddress?.fullName || 'Collector'}
              </p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {order.shippingAddress?.addressLine1}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                {order.shippingAddress?.city}, {order.shippingAddress?.state} -{' '}
                {order.shippingAddress?.pincode}
              </p>
              <p className="text-xs text-slate-500 mt-3 font-medium">
                📞 {order.shippingAddress?.phone}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">💳</span>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Payment Details
                </h3>
              </div>
              <p className="text-xs text-slate-600">
                Gateway: <span className="font-semibold text-slate-900">Razorpay (Secured)</span>
              </p>
              {order.razorpayPaymentId && (
                <p className="text-xs font-mono text-slate-600 mt-2 truncate bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/60">
                  <span className="text-slate-400">Payment ID:</span> {order.razorpayPaymentId}
                </p>
              )}
              {order.razorpayOrderId && (
                <p className="text-xs font-mono text-slate-600 mt-1.5 truncate bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/60">
                  <span className="text-slate-400">Order ID:</span> {order.razorpayOrderId}
                </p>
              )}
            </div>
          </div>

          {/* Purchased Items */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
              Acquired Items
            </h3>
            <div className="divide-y divide-slate-100">
              {order.items?.map((item, index) => (
                <div key={index} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200/60 overflow-hidden shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        ₹{item.price?.toLocaleString('en-IN')} &times; {item.quantity} unit
                        {item.quantity > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-slate-900">
                    ₹{((item.price || 0) * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Total breakdown */}
            <div className="pt-6 border-t border-slate-100 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Subtotal</span>
                <span>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Standard Delivery</span>
                <span className="text-emerald-600 font-semibold">Free Compliment</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-200/70">
                <span className="text-base font-bold text-slate-900">Total Settled</span>
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  ₹{order.totalAmount?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Lab 06 Status Simulation Controls */}
          <div className="pt-6 border-t border-dashed border-slate-200">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              🧪 Lab 06 Order Progression Simulation
            </p>
            <div className="flex flex-wrap gap-2">
              {steps.map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusProgress(st)}
                  disabled={order.status === st || statusUpdating}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    order.status === st
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Mark {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderDetails;
