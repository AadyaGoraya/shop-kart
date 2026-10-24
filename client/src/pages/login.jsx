import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get('/getMe');
        navigate('/home');
      } catch {
        // Not logged in
      }
    };
    checkAuth();
  }, [navigate]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);
    try {
      await api.post('/login', formData);
      navigate('/home');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Invalid credentials. Please verify your email and password.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafc] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-xl shadow-sm mb-3">
            🏎️
          </div>
          <span className="text-[11px] uppercase tracking-widest font-semibold text-slate-400">
            Collector Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Sign in to ShopKart
          </h1>
          <p className="mt-2 text-center text-xs text-slate-500">
            Access your curated bag, order history, and die-cast models.
          </p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="apple-card rounded-3xl p-8 sm:p-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200/80 text-rose-900 text-xs font-medium flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Password
                </label>
              </div>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 px-4 bg-slate-900 hover:bg-black text-white rounded-xl text-xs uppercase tracking-wider font-bold transition-all shadow-sm active:scale-98 cursor-pointer flex items-center justify-center gap-2 ${
                  loading ? 'opacity-70 cursor-wait' : ''
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Sign In &rarr;</span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              New to ShopKart?{' '}
              <Link to="/register" className="font-bold text-slate-900 hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
