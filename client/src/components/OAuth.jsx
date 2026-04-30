import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useState } from 'react';
import { auth, firebaseAuthDomain } from '../firebase';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';

const getGoogleAuthErrorMessage = (err) => {
  if (err?.code === 'auth/unauthorized-domain') {
    return `${window.location.hostname} is not added in Firebase Authentication authorized domains.`;
  }

  if (err?.message?.includes('redirect_uri_mismatch')) {
    return `Google OAuth is missing this redirect URI: https://${firebaseAuthDomain}/__/auth/handler`;
  }

  if (err?.code === 'auth/popup-blocked') {
    return 'The Google sign-in popup was blocked by the browser.';
  }

  return err?.message || 'Google sign-in failed';
};

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleClick = async () => {
    if (loading) return;
    try {
      setLoading(true);
      setError('');
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Google sign-in failed');
      dispatch(signInSuccess(data));
      navigate('/');
    } catch (err) {
      // Ignore if user just closed the popup
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError(getGoogleAuthErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col gap-2'>
      <button
        onClick={handleGoogleClick}
        type='button'
        disabled={loading}
        className='inline-flex w-full items-center justify-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-slate-700 shadow-sm transition hover:border-emerald-600 hover:text-emerald-700 disabled:opacity-70'
      >
        <FaGoogle className='text-base text-red-500' />
        <span>{loading ? 'Opening Google...' : 'Continue with Google'}</span>
      </button>
      {error && (
        <p className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
          {error}
        </p>
      )}
    </div>
  );
}
