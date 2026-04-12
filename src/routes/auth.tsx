// src/routes/auth.tsx
import { useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { motion } from 'motion/react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      // Login with username + password
      const { error } = await supabase.auth.signInWithPassword({
        email: `${username}@thepagegallery.local`, // we use a fake email internally
        password,
      });
      if (error) alert(error.message);
    } else {
      // Sign up
      const { error } = await supabase.auth.signUp({
        email: `${username}@thepagegallery.local`,
        password,
        options: {
          data: { username }
        }
      });
      if (error) alert(error.message);
      else alert('Account created — you can now log in');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F4EC] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white border border-[#E5DFD2] shadow-xl p-10 rounded-3xl"
      >
        <h1 className="text-4xl font-serif tracking-tighter mb-2">Welcome back to the studio.</h1>
        <p className="text-[#6B2A2A] font-mono text-sm mb-8">The Page Gallery • The Garden</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs tracking-widest mb-1">USERNAME</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-[#E5DFD2] focus:border-[#6B2A2A] px-5 py-4 rounded-2xl outline-none text-lg"
              placeholder="yourname"
              required
            />
          </div>

          <div>
            <label className="block text-xs tracking-widest mb-1">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#E5DFD2] focus:border-[#6B2A2A] px-5 py-4 rounded-2xl outline-none text-lg"
              placeholder="••••••••"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-[#6B2A2A] text-white py-5 rounded-3xl text-sm tracking-[2px] font-medium"
          >
            {loading ? 'WORKING…' : isLogin ? 'ENTER THE STUDIO' : 'CREATE ACCOUNT'}
          </motion.button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-xs text-[#6B2A2A] mt-6 underline"
        >
          {isLogin ? 'Need an account? Sign up' : 'Already have an account? Log in'}
        </button>
      </motion.div>
    </div>
  );
}
