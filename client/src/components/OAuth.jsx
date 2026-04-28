import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { useState } from 'react';
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';

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
      provider.setCustomParameters({ prompt: 'select_account' });
      const auth = getAuth(app);
      const result = await signInWithPopup(auth, provider);
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message);
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