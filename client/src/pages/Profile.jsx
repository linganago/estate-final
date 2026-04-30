import { useRef, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  updateUserFailure,
  updateUserStart,
  updateUserSuccess,
  signOutUserStart,
  signOutUserSuccess,
  signOutUserFailure,
} from '../redux/user/userSlice';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaCamera,
  FaEnvelope,
  FaHome,
  FaLock,
  FaPen,
  FaPlus,
  FaSignOutAlt,
  FaTrash,
  FaUser,
} from 'react-icons/fa';
import AppImage from '../components/AppImage';

export default function Profile() {
  const fileRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser, loading, error } = useSelector((state) => state.user);

  const [file, setFile] = useState(undefined);
  const [imageUrl, setImageUrl] = useState(currentUser?.avatar || '');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingError, setShowListingError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    password: '',
    avatar: currentUser?.avatar || '',
  });

  useEffect(() => {
    if (!currentUser) navigate('/sign-in');
  }, [currentUser, navigate]);

  useEffect(() => {
    if (file) {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('upload_preset', 'mern-estate');
      uploadData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dkbd8qtc4');

      const xhr = new XMLHttpRequest();
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dkbd8qtc4';
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setImageUrl(response.secure_url);
          setFormData((prev) => ({ ...prev, avatar: response.secure_url }));
        }
        setUploading(false);
        setProgress(0);
      };

      xhr.onerror = () => setUploading(false);
      setUploading(true);
      xhr.send(uploadData);
    }
  }, [file]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const body = { ...formData };
      if (!body.password) delete body.password;
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
      setFormData((prev) => ({ ...prev, password: '' }));
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      dispatch(updateUserFailure(err.message));
    }
  };

  const handleDeleteUser = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess());
      navigate('/sign-in');
    } catch (err) {
      dispatch(deleteUserFailure(err.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      await fetch('/api/auth/signout');
      dispatch(signOutUserSuccess());
      navigate('/sign-in');
    } catch (err) {
      dispatch(signOutUserFailure(err.message));
    }
  };

  const handleShowListings = async () => {
    try {
      setShowListingError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();
      if (!res.ok || data.success === false) {
        setShowListingError(true);
        return;
      }
      setUserListings(data.listings);
    } catch {
      setShowListingError(true);
    }
  };

  const handleListingDelete = async (listingId) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || data.success === false) return;
      setUserListings((prev) => prev.filter((l) => l._id !== listingId));
    } catch (err) {
      console.error(err);
    }
  };

  if (!currentUser) return null;

  return (
    <main className='mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12'>
      <section className='rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 ring-1 ring-slate-900/5 sm:p-8'>
        <div className='mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700'>
              Account center
            </p>
            <h1 className='mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl'>
              Profile
            </h1>
          </div>
          <Link
            className='inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-slate-900'
            to='/create-listing'
          >
            <FaPlus className='text-xs' />
            Create listing
          </Link>
        </div>

        <form onSubmit={handleSubmit} className='grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]'>
          <div className='rounded-[26px] border border-slate-200 bg-slate-50/80 p-5 text-center'>
            <input
              onChange={(e) => setFile(e.target.files[0])}
              type='file'
              ref={fileRef}
              hidden
              accept='image/*'
            />
            <button
              type='button'
              onClick={() => fileRef.current.click()}
              className='group relative mx-auto block rounded-full'
              aria-label='Change profile photo'
            >
              <AppImage
                src={imageUrl || currentUser.avatar}
                alt={`${currentUser.username || 'User'} avatar`}
                fallback='avatar'
                width={192}
                height={192}
                className='h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg shadow-slate-900/10 transition group-hover:brightness-90'
              />
              <span className='absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg transition group-hover:bg-emerald-700'>
                <FaCamera className='text-sm' />
              </span>
            </button>
            <h2 className='mt-5 truncate text-xl font-semibold text-slate-900'>
              {formData.username || currentUser.username}
            </h2>
            <p className='mt-1 truncate text-sm text-slate-500'>
              {formData.email || currentUser.email}
            </p>
            {uploading && (
              <p className='mt-4 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700'>
                Uploading {progress}%
              </p>
            )}
          </div>

          <div className='flex flex-col gap-4'>
            <div className='space-y-2'>
              <label htmlFor='username' className='text-sm font-semibold text-slate-700'>
                Username
              </label>
              <div className='relative'>
                <FaUser className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400' />
                <input
                  type='text'
                  placeholder='Username'
                  value={formData.username}
                  id='username'
                  className='w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pl-11 text-slate-700 outline-none transition focus:border-emerald-600 focus:bg-white'
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
                  placeholder='Email'
                  value={formData.email}
                  id='email'
                  className='w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pl-11 text-slate-700 outline-none transition focus:border-emerald-600 focus:bg-white'
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className='space-y-2'>
              <label htmlFor='password' className='text-sm font-semibold text-slate-700'>
                New password
              </label>
              <div className='relative'>
                <FaLock className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400' />
                <input
                  type='password'
                  placeholder='Leave blank to keep current'
                  id='password'
                  className='w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pl-11 text-slate-700 outline-none transition focus:border-emerald-600 focus:bg-white'
                  onChange={handleChange}
                  value={formData.password}
                />
              </div>
            </div>

            <div className='grid gap-3 sm:grid-cols-2'>
              <button
                disabled={loading}
                className='rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70'
              >
                {loading ? 'Loading...' : 'Update'}
              </button>
              <button
                onClick={handleShowListings}
                className='inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-slate-700 transition hover:border-emerald-600 hover:text-emerald-700'
                type='button'
              >
                <FaHome className='text-sm' />
                My listings
              </button>
            </div>

            <div className='flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4'>
              <button
                onClick={handleDeleteUser}
                className='inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50'
                type='button'
              >
                <FaTrash className='text-xs' />
                Delete account
              </button>
              <button
                onClick={handleSignOut}
                className='inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50'
                type='button'
              >
                <FaSignOutAlt className='text-sm' />
                Sign out
              </button>
            </div>

            {error && (
              <p className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
                {error}
              </p>
            )}
            {updateSuccess && (
              <p className='rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700'>
                Profile updated successfully.
              </p>
            )}
            {showListingError && (
              <p className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
                Error showing listings.
              </p>
            )}
          </div>
        </form>
      </section>

      {userListings.length > 0 && (
        <section className='mt-6 rounded-[30px] border border-white/70 bg-white/90 p-5 shadow-lg shadow-slate-900/5 ring-1 ring-slate-900/5 sm:p-6'>
          <div className='mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-slate-200/80 pb-4'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.24em] text-slate-400'>
                Inventory
              </p>
              <h2 className='mt-1 text-2xl font-semibold text-slate-900'>
                Your listings
              </h2>
            </div>
            <p className='rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700'>
              {userListings.length} listing{userListings.length > 1 ? 's' : ''}
            </p>
          </div>

          <div className='grid gap-4'>
            {userListings.map((listing) => (
              <div
                key={listing._id}
                className='grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50/80 p-3 sm:grid-cols-[96px_minmax(0,1fr)_auto] sm:items-center'
              >
                <Link to={`/listing/${listing._id}`}>
                  <AppImage
                    src={listing.imageUrls?.[0]}
                    alt={listing.name}
                    fallback='property'
                    width={192}
                    height={144}
                    className='h-24 w-full rounded-[18px] object-cover sm:w-24'
                  />
                </Link>
                <div className='min-w-0'>
                  <Link
                    className='block truncate text-lg font-semibold text-slate-800 transition hover:text-emerald-700'
                    to={`/listing/${listing._id}`}
                  >
                    {listing.name}
                  </Link>
                  <p className='mt-1 truncate text-sm text-slate-500'>
                    {listing.address}
                  </p>
                </div>
                <div className='flex flex-wrap gap-2 sm:justify-end'>
                  <Link
                    to={`/update-listing/${listing._id}`}
                    className='inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-600 hover:text-emerald-700'
                  >
                    <FaPen className='text-xs' />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleListingDelete(listing._id)}
                    className='inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100'
                    type='button'
                  >
                    <FaTrash className='text-xs' />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
