import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';
import AuthShell from '../components/AuthShell';
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa';

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const payload = {
        username: formData.username?.trim(),
        email: formData.email?.trim().toLowerCase(),
        password: formData.password,
      };
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        setError(data.message || 'Sign up failed');
        return;
      }
      navigate('/sign-in');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title='Create account'>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <div className='space-y-2'>
          <label htmlFor='username' className='text-sm font-semibold text-slate-700'>
            Username
          </label>
          <div className='relative'>
            <FaUser className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400' />
            <input
              type='text'
              placeholder='Username'
              className='w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pl-11 text-slate-700 outline-none transition focus:border-emerald-600 focus:bg-white'
              id='username'
              required
              minLength={3}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className='space-y-2'>
          <label htmlFor='email' className='text-sm font-semibold text-slate-700'>
            Email
          </label>
          <div className='relative'>
            <FaEnvelope className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400' />
            <input
              type='email'
              placeholder='you@example.com'
              className='w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pl-11 text-slate-700 outline-none transition focus:border-emerald-600 focus:bg-white'
              id='email'
              required
              onChange={handleChange}
            />
          </div>
        </div>
        <div className='space-y-2'>
          <label htmlFor='password' className='text-sm font-semibold text-slate-700'>
            Password
          </label>
          <div className='relative'>
            <FaLock className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400' />
            <input
              type='password'
              placeholder='Minimum 6 characters'
              className='w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pl-11 text-slate-700 outline-none transition focus:border-emerald-600 focus:bg-white'
              id='password'
              required
              minLength={6}
              onChange={handleChange}
            />
          </div>
        </div>
        <button
          disabled={loading}
          className='rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70'
        >
          {loading ? 'Loading...' : 'Sign Up'}
        </button>
        <OAuth />
      </form>
      <div className='mt-6 flex flex-wrap items-center gap-2 text-sm text-slate-600'>
        <p>Already have an account?</p>
        <Link to='/sign-in'>
          <span className='font-semibold text-emerald-700 hover:text-emerald-800'>
            Sign in
          </span>
        </Link>
      </div>
      {error && (
        <p className='mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
          {error}
        </p>
      )}
    </AuthShell>
  );
}
