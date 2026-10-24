import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    loading,
    error,
    subtotal,
    totalUnits,
    updateQuantity,
    removeFromCart,
    fetchCart
  } = useCart();

  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionError, setActionError] = useState(null);

  const handleQuantityChange = async (productId, currentQuantity, change, maxStock) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;
    if (newQuantity > maxStock) {
      setActionError(`Cannot add more. Max stock available is ${maxStock}.`);
      setTimeout(() => setActionError(null), 3000);
      return;
    }

    setActionLoadingId(productId);
    setActionError(null);
    const res = await updateQuantity(productId, newQuantity);
    if (!res.success) {
      setActionError(res.message);
      setTimeout(() => setActionError(null), 4000);
    }
    setActionLoadingId(null);
  };

  const handleRemove = async (productId) => {
    setActionLoadingId(productId);
    setActionError(null);
    const res = await removeFromCart(productId);
    if (!res.success) {
      setActionError(res.message);
      setTimeout(() => setActionError(null), 4000);
    }
    setActionLoadingId(null);
  };

  return (
    <div className="min-h-screen bg-[#fafafc] text-slate-900 flex flex-col pb-16">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto pt-4 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-baseline justify-between border-b border-slate-200/60 pb-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Shopping Bag</h1>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
              Review your curated items ({totalUnits} total)
            </p>
          </div>
          <Link
            to="/home"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
          >
            &larr; Continue Exploring
          </Link>
        </div>

        {actionError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50/90 border border-rose-200/80 text-rose-900 text-sm font-medium flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{actionError}</span>
            </div>
            <button
              onClick={() => setActionError(null)}
              className="text-slate-400 hover:text-slate-700 font-bold ml-4 cursor-pointer"
            >
              &times;
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 apple-card rounded-3xl">
            <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-medium text-slate-500 tracking-wide">Loading your bag...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 apple-card rounded-3xl p-8 max-w-md mx-auto">
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Unable to load your bag</h2>
            <p className="text-slate-500 text-xs mb-6">{error}</p>
            <button
              onClick={fetchCart}
              className="apple-button px-5 py-2.5 text-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-24 apple-card rounded-3xl p-8 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl mb-4 mx-auto border border-slate-200/50">
              🛒
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Your Bag is Empty</h2>
            <p className="text-slate-500 text-sm mb-6">
              Looks like you haven&apos;t added any models or toys yet. Start exploring our collection!
            </p>
            <Link
              to="/home"
              className="apple-button px-6 py-3 text-sm inline-flex items-center gap-2"
            >
              <span>Explore Collection</span>
              <span>&rarr;</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {cartItems.map((item) => {
                const product = item.product;
                if (!product) return null;
                const isItemBusy = actionLoadingId === product._id;
                const itemTotal = (product.price || 0) * item.quantity;
                const isMaxStockReached = item.quantity >= product.stock;

                return (
                  <div
                    key={product._id}
                    className={`apple-card rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5 transition ${
                      isItemBusy ? 'opacity-60 pointer-events-none' : ''
                    }`}
                  >
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/50">
                      <img
                        src={product.image || product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                      <Link
                        to={`/products/${product._id}`}
                        className="text-base font-bold text-slate-900 hover:text-slate-600 transition truncate block"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-slate-400 capitalize mt-0.5">{product.category}</p>
                      <p className="text-xs font-semibold text-slate-700 mt-1">
                        ₹{product.price.toLocaleString('en-IN')} each
                      </p>
                      <p
                        className={`text-[11px] mt-1 font-medium ${
                          product.stock > 0 ? 'text-emerald-600' : 'text-rose-500'
                        }`}
                      >
                        {product.stock > 0 ? `${product.stock} units available` : 'Sold out'}
                      </p>
                    </div>

                    {/* Quantity Controls & Price */}
                    <div className="flex flex-col items-center sm:items-end gap-3 w-full sm:w-auto">
                      <div className="flex items-center bg-slate-100/90 rounded-full p-1 border border-slate-200/60">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(product._id, item.quantity, -1, product.stock)}
                          disabled={item.quantity <= 1 || isItemBusy}
                          className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-slate-700 hover:bg-slate-200/80 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold transition shadow-xs cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          &minus;
                        </button>
                        <span className="px-3 text-xs font-bold text-slate-900 min-w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(product._id, item.quantity, 1, product.stock)}
                          disabled={isMaxStockReached || isItemBusy}
                          className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-slate-700 hover:bg-slate-200/80 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold transition shadow-xs cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-base font-extrabold text-slate-900">
                          ₹{itemTotal.toLocaleString('en-IN')}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemove(product._id)}
                          disabled={isItemBusy}
                          className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-4 apple-card rounded-3xl p-6 sm:p-8 sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
                <span>Summary</span>
                <span className="text-xs font-semibold text-slate-500">{totalUnits} units</span>
              </h2>

              <div className="py-4 space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Items Total</span>
                  <span className="font-semibold text-slate-900">{cartItems.length} items</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-600 uppercase tracking-wide">
                    Free
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                      Total
                    </span>
                    <div className="text-2xl font-black text-slate-900 tracking-tight">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400">Taxes included</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/checkout')}
                disabled={cartItems.length === 0}
                className="w-full mt-4 py-4 px-4 bg-slate-900 hover:bg-black disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <span>Proceed to Checkout</span>
                <span>&rarr;</span>
              </button>

              <p className="text-[11px] text-slate-400 text-center mt-3">
                Secure checkout powered by Razorpay Test Mode
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;
