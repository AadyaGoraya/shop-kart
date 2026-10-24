import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import api, { ordersApi } from '../services/api';
import { loadRazorpayScript } from '../utils/razorpay';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, loading: cartLoading, subtotal, totalUnits, clearCartState } = useCart();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState(null);

  // Pre-fill user data if available
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/getMe');
        if (res.data?.user) {
          setShippingAddress((prev) => ({
            ...prev,
            fullName: prev.fullName || res.data.user.fullName || '',
            phone: prev.phone || res.data.user.phone || ''
          }));
        }
      } catch (err) {
        console.warn('Failed to pre-fetch user for checkout', err);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!shippingAddress.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    const phoneClean = shippingAddress.phone.trim().replace(/[\s\-()]/g, '');
    if (!phoneClean) {
      newErrors.phone = 'Phone Number is required';
    } else if (phoneClean.length < 10) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!shippingAddress.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address line is required';
    }

    if (!shippingAddress.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!shippingAddress.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!shippingAddress.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(shippingAddress.pincode.trim())) {
      newErrors.pincode = 'Pincode must contain exactly 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (cartItems.length === 0) {
      setOrderError('Your cart is empty. Please add items before placing an order.');
      return;
    }

    setIsSubmitting(true);
    setOrderError(null);

    try {
      // Step 1: Create ShopKart Pending Order and get Razorpay Order ID from backend
      const orderRes = await ordersApi.post('/create-payment-order', {
        shippingAddress
      });

      const { shopKartOrderId, razorpayOrderId, amount, currency, key } = orderRes.data;

      // Step 2: Load Razorpay Checkout Script
      const isScriptLoaded = await loadRazorpayScript();

      if (!isScriptLoaded || !window.Razorpay) {
        setOrderError('Razorpay checkout script could not be loaded. Please disable ad-blockers or check your network connection.');
        setIsSubmitting(false);
        return;
      }

      // Step 3: Open Razorpay Test Mode Checkout
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: 'ShopKart',
        description: 'Complete your ShopKart order',
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            // Step 4: Verify cryptographic HMAC SHA-256 signature on backend
            const verifyRes = await ordersApi.post('/verify-payment', {
              shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.data.success) {
              // Clear global cart state only after verified payment
              clearCartState();
              navigate(`/orders/${shopKartOrderId}`);
            } else {
              setOrderError(verifyRes.data.message || 'Payment signature verification failed.');
            }
          } catch (verifyErr) {
            console.error('Payment verification failed:', verifyErr);
            setOrderError(
              verifyErr.response?.data?.message ||
                'Payment verification failed. Please contact support.'
            );
          } finally {
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: shippingAddress.fullName,
          contact: shippingAddress.phone
        },
        theme: {
          color: '#4f46e5'
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            setOrderError('Payment was dismissed or cancelled. Your cart has not been cleared.');
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on('payment.failed', function (failResponse) {
        console.error('Razorpay payment failed:', failResponse.error);
        setOrderError(
          `Payment failed: ${failResponse.error.description || 'Transaction unsuccessful'}. Your cart has not been cleared.`
        );
        setIsSubmitting(false);
      });

      razorpayInstance.open();
    } catch (err) {
      console.error('Checkout error:', err);
      setOrderError(err.response?.data?.message || 'Failed to initialize order payment.');
      setIsSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-600 font-semibold animate-pulse text-lg">
            Preparing Checkout...
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#fafafc] flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto py-20 px-4 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl mb-4 shadow-sm border border-slate-200/50">
            🛒
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Your Cart is Empty</h2>
          <p className="text-slate-500 text-sm max-w-sm mb-6">
            You cannot proceed to checkout without items. Explore our curated collectibles first.
          </p>
          <Link
            to="/home"
            className="apple-button px-6 py-3 text-sm inline-flex items-center gap-2"
          >
            <span>Explore Collection</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafc] text-slate-900 flex flex-col pb-16">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto pt-4 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-baseline justify-between border-b border-slate-200/60 pb-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Checkout</h1>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
              Step 2 of 2 &bull; Shipping & Payment
            </p>
          </div>
          <Link
            to="/cart"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
          >
            &larr; Back to Cart
          </Link>
        </div>

        {orderError && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-50/90 border border-rose-200/80 text-rose-900 text-sm font-medium flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{orderError}</span>
            </div>
            <button
              onClick={() => setOrderError(null)}
              className="text-slate-400 hover:text-slate-700 font-bold ml-4 cursor-pointer"
            >
              &times;
            </button>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Shipping Address Form */}
          <div className="lg:col-span-7 apple-card rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Shipping Destination
              </h2>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                Express Delivery
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={shippingAddress.fullName}
                  onChange={handleChange}
                  placeholder="Aarav Sharma"
                  className={`w-full px-4 py-3 rounded-xl bg-slate-50/50 border text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                    errors.fullName
                      ? 'border-rose-400 focus:ring-rose-100'
                      : 'border-slate-200 focus:ring-slate-900/10 focus:border-slate-900'
                  }`}
                />
                {errors.fullName && <p className="text-xs text-rose-500 mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Contact Phone <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className={`w-full px-4 py-3 rounded-xl bg-slate-50/50 border text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                    errors.phone
                      ? 'border-rose-400 focus:ring-rose-100'
                      : 'border-slate-200 focus:ring-slate-900/10 focus:border-slate-900'
                  }`}
                />
                {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Street Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={shippingAddress.addressLine1}
                  onChange={handleChange}
                  placeholder="Flat/House No., Street, Landmark"
                  className={`w-full px-4 py-3 rounded-xl bg-slate-50/50 border text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                    errors.addressLine1
                      ? 'border-rose-400 focus:ring-rose-100'
                      : 'border-slate-200 focus:ring-slate-900/10 focus:border-slate-900'
                  }`}
                />
                {errors.addressLine1 && (
                  <p className="text-xs text-rose-500 mt-1">{errors.addressLine1}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleChange}
                    placeholder="Bengaluru"
                    className={`w-full px-4 py-3 rounded-xl bg-slate-50/50 border text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                      errors.city
                        ? 'border-rose-400 focus:ring-rose-100'
                        : 'border-slate-200 focus:ring-slate-900/10 focus:border-slate-900'
                    }`}
                  />
                  {errors.city && <p className="text-xs text-rose-500 mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    State <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleChange}
                    placeholder="Karnataka"
                    className={`w-full px-4 py-3 rounded-xl bg-slate-50/50 border text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                      errors.state
                        ? 'border-rose-400 focus:ring-rose-100'
                        : 'border-slate-200 focus:ring-slate-900/10 focus:border-slate-900'
                    }`}
                  />
                  {errors.state && <p className="text-xs text-rose-500 mt-1">{errors.state}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Pincode <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={shippingAddress.pincode}
                    onChange={handleChange}
                    placeholder="560001"
                    maxLength={6}
                    className={`w-full px-4 py-3 rounded-xl bg-slate-50/50 border text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                      errors.pincode
                        ? 'border-rose-400 focus:ring-rose-100'
                        : 'border-slate-200 focus:ring-slate-900/10 focus:border-slate-900'
                    }`}
                  />
                  {errors.pincode && <p className="text-xs text-rose-500 mt-1">{errors.pincode}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary & Payment Button */}
          <div className="lg:col-span-5 apple-card rounded-3xl p-6 sm:p-8 sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-semibold text-slate-500">{totalUnits} units</span>
            </h2>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 mb-4 pr-1">
              {cartItems.map((item) => {
                const product = item.product;
                if (!product) return null;
                return (
                  <div key={product._id} className="py-3 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/50">
                        <img
                          src={product.image || product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-xs sm:text-sm line-clamp-1">
                          {product.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Qty: {item.quantity} &times; ₹{product.price.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 text-sm">
                      ₹{((product.price || 0) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Standard Delivery</span>
                <span className="font-semibold text-emerald-600 uppercase tracking-wide">
                  Free
                </span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                    Total Due
                  </span>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </div>
                </div>
                <span className="text-[11px] text-slate-400">Taxes included</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 py-4 px-4 bg-slate-900 hover:bg-black disabled:bg-slate-400 text-white font-bold rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-semibold tracking-wide">Opening Secure Gateway...</span>
                </>
              ) : (
                <>
                  <span>🔒 Pay with Razorpay</span>
                  <span>&bull;</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 mt-4 text-[11px] text-slate-400">
              <span>🛡️</span>
              <span>Razorpay Test Mode &bull; Official Standard Checkout</span>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Checkout;
