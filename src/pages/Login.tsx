import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import header from '../assets/header.png';
import back from '../assets/back.png';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let success = false;
      if (isLogin) {
        success = await login(email, password);
      } else {
        if (!name.trim()) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        success = await register(email, password, name);
      }

      if (success) {
        navigate('/Digi');
      } else {
        setError(isLogin ? 'Invalid email or password' : 'Email already exists');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-lined-paper relative overflow-x-hidden font-mynerve">
      {/* Back Button */}
      <motion.button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 md:left-12 z-20"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.1, rotate: -5 }}
      >
        <img
          src={back}
          alt="Back"
          className="w-12 md:w-16 opacity-90 hover:opacity-100 transition-opacity"
        />
      </motion.button>

      {/* Header Logo */}
      <motion.div
        className="absolute top-6 right-6 md:right-12 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <img src={header} alt="Scrible" className="w-40 md:w-48 h-auto" />
      </motion.div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen px-6 py-24">
        <motion.div
          className="relative bg-white border-[3px] border-zinc-900 rounded-[255px_15px_225px_15px/15px_225px_15px_255px] p-8 md:p-12 shadow-[10px_10px_0px_rgba(0,0,0,0.12)] w-full max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center text-zinc-800">
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-lg font-semibold mb-2 text-zinc-700">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border-[2px] border-zinc-900 rounded-lg font-mynerve text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Your name"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-lg font-semibold mb-2 text-zinc-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-[2px] border-zinc-900 rounded-lg font-mynerve text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2 text-zinc-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-[2px] border-zinc-900 rounded-lg font-mynerve text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-100 border-2 border-red-500 rounded-lg p-3 text-red-700 text-center font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full sketchy-button-purple text-lg md:text-xl px-8 py-3 shadow-[4px_4px_0px_black] hover:shadow-[6px_6px_0px_black] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-zinc-600 hover:text-zinc-800 font-semibold underline"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Login'}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Notebook margin line */}
      <div className="fixed top-0 left-20 bottom-0 w-[2px] bg-[#fca5a5] opacity-40 z-0" />
    </div>
  );
};

export default Login;
