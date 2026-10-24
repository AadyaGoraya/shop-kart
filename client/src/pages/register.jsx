import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
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
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password || !formData.phone) {
      setError('All fields are mandatory');
      return;
    }
    if (formData.fullName.length < 3) {
      setError('Full name must be at least 3 characters');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.post('/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
            Create an Account
          </h1>
          <p className="mt-2 text-center text-xs text-slate-500">
            Join the collector community to buy, track, and curate die-cast models.
          </p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="apple-card rounded-3xl p-8 sm:p-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200/80 text-rose-900 text-xs font-medium flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Full Name
              </label>
              <input
                name="fullName"
                type="text"
                required
                placeholder="Aadya Singh"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
            </div>

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
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Phone Number
              </label>
              <input
                name="phone"
                type="tel"
                required
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-slate-200/90 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
            </div>

            <div className="pt-3">
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
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Account &rarr;</span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-slate-900 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
