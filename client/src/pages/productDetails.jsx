import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api, { productsApi, wishlistApi } from '../services/api';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistState, setWishlistState] = useState('default');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartFeedback, setCartFeedback] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await productsApi.get(`/${id}`);
        setProduct(response.data.product);
      } catch (err) {
        console.error('Failed to fetch product details', err);
        if (err.response?.status === 400) {
          setError('Invalid product ID format.');
        } else if (err.response?.status === 404) {
          setError('Product not found.');
        } else {
          setError('Something went wrong while loading the product details.');
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchAuthAndCheckWishlist = async () => {
      try {
        await api.get('/getMe?_t=' + Date.now()); // Verify auth

        const wishlistRes = await wishlistApi.get('/');
        const userWishlist = wishlistRes.data.wishlist || [];
        
        // Match by product name instead of ID, as database may have seeded duplicate objects
        if (product && userWishlist.some(item => item.name === product.name)) {
          setWishlistState('added');
        }
      } catch (err) {
        console.error('Failed to get auth/wishlist status', err);
      }
    };

    if (!product) {
      fetchProductDetails();
    } else {
      fetchAuthAndCheckWishlist();
    }
  }, [id, product]);

  const handleAddToWishlist = async () => {
    if (wishlistState === 'saving' || wishlistState === 'added') return;

    setWishlistState('saving');
    try {
      await wishlistApi.post(`/${id}`);
      setWishlistState('added');
      setCartFeedback({ type: 'success', message: 'Added to your wishlist!' });
      setTimeout(() => setCartFeedback(null), 3000);
    } catch (err) {
      console.error('Failed to add to wishlist', err);
      if (err.response?.status === 409) {
        setWishlistState('added');
      } else {
        setWishlistState('error');
        alert(err.response?.data?.message || 'Failed to add to wishlist');
      }
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
              Loading collectible details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#fafafc] flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-lg mx-auto py-20 px-4 text-center">
          <div className="apple-card rounded-3xl p-12">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{error || 'Product not found'}</h3>
            <p className="text-sm text-slate-500 mb-6">
              The item you are looking for might have been discontinued or moved.
            </p>
            <button 
              onClick={() => navigate('/home')}
              className="apple-button px-6 py-2.5 text-xs uppercase tracking-wider cursor-pointer"
            >
              Back to Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  const inCart = cartItems.some((i) => i.product?._id === product._id);

  return (
    <div className="min-h-screen bg-[#fafafc] text-slate-900 pb-20">
      <Navbar />

      <main className="max-w-6xl mx-auto pt-6 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/home"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs"
          >
            <span>&larr;</span>
            <span>Back to Catalog</span>
          </Link>
        </div>

        {/* Feedback Alert */}
        {cartFeedback && (
          <div
            className={`mb-6 p-4 rounded-2xl font-medium text-sm flex items-center justify-between shadow-sm border transition-all ${
              cartFeedback.type === 'success'
                ? 'bg-emerald-50/90 border-emerald-200/80 text-emerald-900'
                : 'bg-rose-50/90 border-rose-200/80 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span>{cartFeedback.type === 'success' ? '✓' : '⚠️'}</span>
              <span>{cartFeedback.message}</span>
            </div>
            <button
              onClick={() => setCartFeedback(null)}
              className="text-slate-400 hover:text-slate-700 font-bold ml-4 cursor-pointer"
            >
              &times;
            </button>
          </div>
        )}

        {/* Main Product Showcase */}
        <div className="apple-card rounded-3xl overflow-hidden p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left: Product Image Box */}
            <div className="rounded-2xl overflow-hidden bg-slate-100/80 border border-slate-200/60 aspect-square relative group flex items-center justify-center p-6">
              <img 
                src={product.image || product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 text-xs font-semibold bg-white/90 backdrop-blur-md text-slate-800 rounded-full shadow-sm border border-slate-200/60">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Right: Info & Purchase Controls */}
            <div className="flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <span
                    className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full flex items-center gap-1.5 ${
                      product.stock > 0
                        ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-700 border border-rose-500/20'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        product.stock > 0 ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    ></span>
                    {product.stock > 0 ? `${product.stock} units available` : 'Sold out'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">SKU: {product._id?.slice(-8).toUpperCase()}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-3">
                  {product.name}
                </h1>
                
                <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-normal">
                  {product.description}
                </p>
              </div>

              {/* Price Display */}
              <div className="py-4 border-y border-slate-100 flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                    Total Price (Incl. GST)
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-0.5">
                    ₹{product.price?.toLocaleString('en-IN')}
                  </div>
                </div>
                <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  Free Dispatch
                </span>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  className={`flex-1 py-4 px-6 rounded-2xl font-bold text-sm tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                    product.stock > 0 
                      ? isAddingToCart
                        ? 'bg-slate-700 text-white cursor-wait'
                        : 'bg-slate-900 hover:bg-black text-white active:scale-98' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}
                  disabled={product.stock === 0 || isAddingToCart}
                  onClick={async () => {
                    setIsAddingToCart(true);
                    setCartFeedback(null);
                    const res = await addToCart(product._id);
                    if (res.success) {
                      setCartFeedback({ type: 'success', message: `${product.name} added to cart!` });
                    } else {
                      setCartFeedback({ type: 'error', message: res.message });
                    }
                    setIsAddingToCart(false);
                    setTimeout(() => setCartFeedback(null), 3000);
                  }}
                >
                  {product.stock === 0
                    ? 'Out of Stock'
                    : isAddingToCart
                    ? 'Adding to Cart...'
                    : inCart
                    ? 'Add Another to Cart +'
                    : 'Add to Cart'}
                </button>

                <button
                  onClick={handleAddToWishlist}
                  disabled={wishlistState === 'saving' || wishlistState === 'added'}
                  className={`px-6 py-4 rounded-2xl border text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    wishlistState === 'added'
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {wishlistState === 'saving' ? (
                    '⏳ Saving...'
                  ) : wishlistState === 'added' ? (
                    <>
                      <span>♥</span>
                      <span>In Wishlist</span>
                    </>
                  ) : (
                    <>
                      <span>♡</span>
                      <span>Save to Wishlist</span>
                    </>
                  )}
                </button>
              </div>

              {/* Value propositions */}
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span>⚡</span>
                  <span>Fast Express Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🛡️</span>
                  <span>Authentic Die-cast</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🔒</span>
                  <span>Razorpay Protected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetails;
