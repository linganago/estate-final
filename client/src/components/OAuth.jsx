import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useState } from 'react';
import { auth, firebaseAuthDomain } from '../firebase';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';

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
        className='bg-red-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
      >
        {loading ? 'Opening Google...' : 'Continue with Google'}
      </button>
      {error && <p className='text-red-500 text-sm'>{error}</p>}
    </div>
  );
}
