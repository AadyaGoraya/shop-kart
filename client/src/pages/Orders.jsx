import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ordersApi } from '../services/api';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ordersApi.get('/');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to load orders', err);
      setError(err.response?.data?.message || 'Unable to retrieve your orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
      case 'SHIPPED':
        return 'bg-sky-500/10 text-sky-700 border-sky-500/20';
      case 'CONFIRMED':
        return 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20';
      case 'PLACED':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      default:
        return 'bg-amber-500/10 text-amber-700 border-amber-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafc] text-slate-900 pb-16">
      <Navbar />

      <main className="max-w-5xl w-full mx-auto pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
              Purchase History
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
              My Orders
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review your past acquisitions and track active shipments.
            </p>
          </div>
          <Link
            to="/home"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs self-start sm:self-auto"
          >
            <span>&larr;</span>
            <span>Browse Catalog</span>
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="apple-card rounded-3xl p-16 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-medium text-slate-500 tracking-wide">
              Loading orders history...
            </p>
          </div>
        ) : error ? (
          <div className="apple-card rounded-3xl p-12 text-center max-w-lg mx-auto">
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Unable to load orders</h2>
            <p className="text-sm text-slate-500 mb-6">{error}</p>
            <button
              onClick={fetchOrders}
              className="apple-button px-6 py-2.5 text-xs uppercase tracking-wider cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="apple-card rounded-3xl p-16 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl mx-auto mb-4">
              📦
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">No orders placed yet</h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Once you checkout and complete payment via Razorpay, your order tracking and invoices will appear here.
            </p>
            <Link
              to="/home"
              className="apple-button inline-flex items-center gap-2 px-6 py-3 text-sm shadow-sm"
            >
              <span>Explore Collectibles</span>
              <span>&rarr;</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="apple-card rounded-3xl overflow-hidden hover:shadow-lg transition-all"
              >
                {/* Order Top Bar */}
                <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100/90 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Date Placed
                      </p>
                      <p className="text-xs font-semibold text-slate-800 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>

                    <div className="h-7 w-[1px] bg-slate-200/80"></div>

                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Total Amount
                      </p>
                      <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                        ₹{order.totalAmount?.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="hidden sm:block h-7 w-[1px] bg-slate-200/80"></div>

                    <div className="hidden sm:block">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Payment
                      </p>
                      <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                        Razorpay {order.paymentStatus || 'PAID'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                    <button
                      onClick={() => navigate(`/orders/${order._id}`)}
                      className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Receipt</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="p-6">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[11px] font-mono text-slate-400">
                      ID: <span className="text-slate-600">{order._id}</span>
                    </p>
                    <span className="text-xs text-slate-400 font-medium">
                      {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/60 overflow-hidden shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Qty {item.quantity} &bull; ₹{item.price?.toLocaleString('en-IN')} each
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                          ₹{((item.price || 0) * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.shippingAddress && (
                    <div className="mt-4 pt-4 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-500">
                      <div>
                        Destination:{' '}
                        <span className="font-semibold text-slate-700">
                          {order.shippingAddress.fullName}
                        </span>{' '}
                        &bull; {order.shippingAddress.city} ({order.shippingAddress.pincode})
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {order.razorpayPaymentId ? `Ref: ${order.razorpayPaymentId}` : ''}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;
