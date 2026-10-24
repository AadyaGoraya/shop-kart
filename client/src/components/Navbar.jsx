import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalUnits, clearCartState } = useCart();

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      clearCartState();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 py-3 px-4 sm:px-6 lg:px-8">
      <nav className="max-w-7xl mx-auto apple-glass rounded-2xl px-5 py-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex justify-between items-center transition-all duration-300">
        <Link to="/home" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white text-base shadow-sm group-hover:scale-105 transition-transform">
            🏎️
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg text-slate-900 tracking-tight leading-none">
              ShopKart
            </span>
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Collectibles
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/home"
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
              isActive('/home')
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            Discover
          </Link>

          <Link
            to="/wishlist"
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
              isActive('/wishlist')
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            Wishlist
          </Link>

          <Link
            to="/cart"
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              isActive('/cart') || isActive('/checkout')
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <span>Cart</span>
            {totalUnits > 0 && (
              <span
                className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center ${
                  isActive('/cart') || isActive('/checkout')
                    ? 'bg-white text-slate-900'
                    : 'bg-slate-900 text-white'
                }`}
              >
                {totalUnits}
              </span>
            )}
          </Link>

          <Link
            to="/orders"
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
              isActive('/orders')
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            Orders
          </Link>

          <div className="w-[1px] h-5 bg-slate-200 mx-1 sm:mx-2 hidden sm:block"></div>

          <button
            onClick={handleLogout}
            className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer border border-transparent hover:border-rose-100"
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
