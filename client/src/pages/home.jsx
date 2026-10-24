import { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api, { productsApi } from '../services/api';
import { useCart } from '../context/CartContext';

const Home = () => {
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const [addingCartId, setAddingCartId] = useState(null);
  const [cartAlert, setCartAlert] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [redirectToLogin, setRedirectToLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Auth guard — redirect to /login if not authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get('/getMe?_t=' + Date.now());
        setAuthLoading(false);
      } catch (err) {
        console.error('Not authenticated', err);
        setRedirectToLogin(true);
      }
    };
    checkAuth();
  }, []);

  const fetchProducts = async (searchQuery = search) => {
    setLoading(true);
    setError(null);
    try {
      let url = '/?';
      if (searchQuery) url += `search=${searchQuery}&`;
      if (category !== 'All') url += `category=${category}&`;
      if (sort) url += `sort=${sort}&`;
      if (page) url += `page=${page}&`;

      const response = await productsApi.get(url);
      setProducts(response.data.products);
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
      setError('Something went wrong while loading products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, sort, page, authLoading]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    fetchProducts();
  };

  if (redirectToLogin) {
    return <Navigate to="/login" replace />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#fafafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500 tracking-wide">Loading ShopKart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafc] text-slate-900 pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto pt-6 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Floating Cart Alert */}
        {cartAlert && (
          <div
            className={`mb-6 p-4 rounded-2xl font-medium text-sm flex items-center justify-between shadow-sm border transition-all ${
              cartAlert.type === 'success'
                ? 'bg-emerald-50/90 border-emerald-200/80 text-emerald-900'
                : 'bg-rose-50/90 border-rose-200/80 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span>{cartAlert.type === 'success' ? '✓' : '⚠️'}</span>
              <span>{cartAlert.message}</span>
            </div>
            <button
              onClick={() => setCartAlert(null)}
              className="text-slate-400 hover:text-slate-700 font-bold ml-4 cursor-pointer"
            >
              &times;
            </button>
          </div>
        )}

        {/* Hero Section */}
        <div className="pt-4 pb-10 text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-slate-100 text-slate-700 border border-slate-200/70 mb-4">
            Curated Collectibles & Toys
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3">
            Designed for Collectors.
          </h1>
          <p className="text-base sm:text-lg text-slate-500 font-normal max-w-xl mx-auto">
            Discover precision die-cast models, iconic cars, and premium collectibles engineered to impress.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-10 apple-glass rounded-2xl p-2.5 sm:p-3 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)]">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-2.5 items-center">
            <div className="relative flex-1 w-full">
              <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search models, cars, toys..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/90 border border-slate-200/80 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full md:w-auto">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="px-3.5 py-2.5 bg-white/90 border border-slate-200/80 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 cursor-pointer transition-all"
              >
                <option value="All">All Categories</option>
                <option value="Cars">Cars</option>
                <option value="Toys">Toys</option>
                <option value="Audio">Audio</option>
                <option value="Accessories">Accessories</option>
                <option value="Fashion">Fashion</option>
                <option value="Electronics">Electronics</option>
                <option value="Footwear">Footwear</option>
                <option value="Decor">Decor</option>
              </select>

              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="px-3.5 py-2.5 bg-white/90 border border-slate-200/80 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 cursor-pointer transition-all"
              >
                <option value="">Sort: Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
              </select>

              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="apple-card rounded-2xl p-4 animate-pulse">
                <div className="h-52 bg-slate-100 rounded-xl mb-4"></div>
                <div className="h-4 bg-slate-100 rounded w-1/3 mb-2"></div>
                <div className="h-5 bg-slate-100 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-slate-100 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-slate-100 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="apple-card rounded-2xl p-8 text-center max-w-lg mx-auto">
            <p className="text-rose-600 font-semibold mb-2">{error}</p>
            <button
              onClick={() => fetchProducts()}
              className="apple-button px-5 py-2 text-sm mt-3"
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="apple-card rounded-3xl p-16 text-center max-w-lg mx-auto">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No products found</h3>
            <p className="text-sm text-slate-500 mb-6">
              Try adjusting your search terms or selecting a different category.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setCategory('All');
                setSort('');
              }}
              className="apple-button px-5 py-2 text-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => {
                const inCart = cartItems.some((i) => i.product?._id === product._id);
                return (
                  <div
                    key={product._id}
                    className="apple-card rounded-2xl overflow-hidden flex flex-col group"
                  >
                    {/* Product Image Frame */}
                    <div
                      onClick={() => navigate(`/products/${product._id}`)}
                      className="h-56 overflow-hidden bg-slate-100 relative cursor-pointer"
                    >
                      <img
                        src={product.image || product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <span className="px-2.5 py-1 text-[11px] font-semibold bg-white/90 backdrop-blur-md text-slate-800 rounded-full shadow-sm border border-slate-200/50">
                          {product.category}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full backdrop-blur-md flex items-center gap-1 ${
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
                          {product.stock > 0 ? `${product.stock} in stock` : 'Sold out'}
                        </span>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3
                          onClick={() => navigate(`/products/${product._id}`)}
                          className="text-base font-bold text-slate-900 group-hover:text-slate-600 transition-colors line-clamp-1 cursor-pointer mb-1.5"
                        >
                          {product.name}
                        </h3>
                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-4">
                          {product.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100">
                        <div className="flex justify-between items-baseline mb-4">
                          <div>
                            <span className="text-xs text-slate-400 uppercase font-medium">Price</span>
                            <div className="text-xl font-extrabold text-slate-900 tracking-tight">
                              ₹{product.price.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => navigate(`/products/${product._id}`)}
                            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs tracking-wide transition-all cursor-pointer text-center"
                          >
                            Details
                          </button>
                          <button
                            onClick={async () => {
                              if (product.stock <= 0) return;
                              setAddingCartId(product._id);
                              const res = await addToCart(product._id);
                              if (res.success) {
                                setCartAlert({
                                  type: 'success',
                                  message: `${product.name} added to cart!`
                                });
                              } else {
                                setCartAlert({ type: 'error', message: res.message });
                              }
                              setAddingCartId(null);
                              setTimeout(() => setCartAlert(null), 3000);
                            }}
                            disabled={product.stock <= 0 || addingCartId === product._id}
                            className={`w-full py-2.5 px-3 rounded-xl font-semibold text-xs tracking-wide transition-all shadow-sm flex items-center justify-center cursor-pointer ${
                              product.stock <= 0
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                : addingCartId === product._id
                                ? 'bg-slate-700 text-white cursor-wait'
                                : inCart
                                ? 'bg-slate-800 hover:bg-black text-white'
                                : 'bg-slate-900 hover:bg-black text-white'
                            }`}
                          >
                            {addingCartId === product._id
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 pt-6">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  &larr; Previous
                </button>
                <span className="text-xs text-slate-500 font-medium px-2">
                  Page <strong className="text-slate-900">{page}</strong> of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
