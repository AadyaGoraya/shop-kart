import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { wishlistApi } from '../services/api';
import { useCart } from '../context/CartContext';

const Wishlist = () => {
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await wishlistApi.get('/');
      setWishlistItems(response.data.wishlist || []);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate('/login');
      } else {
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (productId) => {
    try {
      await wishlistApi.delete(`/${productId}`);
      setWishlistItems((prev) => prev.filter((item) => item._id !== productId));
      setToast({ type: 'info', message: 'Item removed from wishlist.' });
      setTimeout(() => setToast(null), 2500);
    } catch (err) {
      console.error('Failed to remove from wishlist', err);
      alert('Unable to remove product from wishlist');
    }
  };

  const handleAddToCart = async (product) => {
    if (product.stock <= 0) return;
    setAddingId(product._id);
    const res = await addToCart(product._id);
    if (res.success) {
      setToast({ type: 'success', message: `${product.name} added to your cart!` });
    } else {
      setToast({ type: 'error', message: res.message });
    }
    setAddingId(null);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#fafafc] text-slate-900 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Floating Toast Notification */}
        {toast && (
          <div
            className={`mb-6 p-4 rounded-2xl font-medium text-sm flex items-center justify-between shadow-sm border transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-50/90 border-emerald-200/80 text-emerald-900'
                : toast.type === 'info'
                ? 'bg-slate-50 border-slate-200 text-slate-800'
                : 'bg-rose-50/90 border-rose-200/80 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span>{toast.type === 'success' ? '✓' : toast.type === 'info' ? 'ℹ️' : '⚠️'}</span>
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-700 font-bold ml-4 cursor-pointer"
            >
              &times;
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
              Saved Collection
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
              Wishlist
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Items you&apos;ve curated for future acquisition.
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

        {/* Body */}
        {loading ? (
          <div className="apple-card rounded-3xl p-16 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-medium text-slate-500 tracking-wide">
              Loading your saved items...
            </p>
          </div>
        ) : error ? (
          <div className="apple-card rounded-3xl p-12 text-center max-w-lg mx-auto">
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Unable to load wishlist</h2>
            <p className="text-sm text-slate-500 mb-6">
              There was an issue retrieving your saved items.
            </p>
            <button
              onClick={fetchWishlist}
              className="apple-button px-6 py-2.5 text-xs uppercase tracking-wider cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="apple-card rounded-3xl p-16 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center text-2xl mx-auto mb-4 border border-rose-100">
              ♡
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Your wishlist is empty</h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Explore our die-cast models and collectibles, and tap the heart icon to save items you admire.
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
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {wishlistItems.length} Saved Model{wishlistItems.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((product) => {
                const inCart = cartItems.some((i) => i.product?._id === product._id);
                return (
                  <div
                    key={product._id}
                    className="apple-card rounded-2xl overflow-hidden flex flex-col group"
                  >
                    {/* Image Area */}
                    <div
                      className="h-56 overflow-hidden bg-slate-100 relative cursor-pointer"
                      onClick={() => navigate(`/products/${product._id}`)}
                    >
                      <img
                        src={product.image || product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 text-[11px] font-semibold bg-white/90 backdrop-blur-md text-slate-800 rounded-full shadow-sm border border-slate-200/50">
                          {product.category}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(product._id);
                        }}
                        title="Remove from Wishlist"
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:scale-110 shadow-sm border border-slate-200/50 transition-all cursor-pointer"
                      >
                        ♥
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`text-[10px] font-bold rounded-full flex items-center gap-1 ${
                              product.stock > 0
                                ? 'text-emerald-700'
                                : 'text-rose-600'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                product.stock > 0 ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            ></span>
                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                          </span>
                        </div>
                        <h3
                          className="text-base font-bold text-slate-900 group-hover:text-slate-600 transition-colors line-clamp-1 cursor-pointer mb-1"
                          onClick={() => navigate(`/products/${product._id}`)}
                        >
                          {product.name}
                        </h3>
                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-4">
                          {product.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100">
                        <div className="mb-4">
                          <span className="text-[10px] text-slate-400 uppercase font-medium">Price</span>
                          <div className="text-xl font-extrabold text-slate-900 tracking-tight">
                            ₹{product.price?.toLocaleString('en-IN')}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => navigate(`/products/${product._id}`)}
                            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs tracking-wide transition-all cursor-pointer text-center"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock <= 0 || addingId === product._id}
                            className={`w-full py-2.5 px-3 rounded-xl font-semibold text-xs tracking-wide transition-all shadow-sm flex items-center justify-center cursor-pointer ${
                              product.stock <= 0
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                : addingId === product._id
                                ? 'bg-slate-700 text-white cursor-wait'
                                : inCart
                                ? 'bg-slate-800 hover:bg-black text-white'
                                : 'bg-slate-900 hover:bg-black text-white'
                            }`}
                          >
                            {addingId === product._id
                              ? 'Adding...'
                              : inCart
                              ? 'Add More +'
                              : 'Add to Cart'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Wishlist;
