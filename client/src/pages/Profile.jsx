import React, { useRef, useState, useEffect } from 'react';
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
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type='file'
          ref={fileRef}
          hidden
          accept='image/*'
        />
        <img
          onClick={() => fileRef.current.click()}
          src={imageUrl || currentUser.avatar}
          alt='profile'
          className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'
        />
        {uploading && (
          <p className='text-center text-slate-500 text-sm'>
            Uploading... {progress}%
          </p>
        )}
        <input
          type='text'
          placeholder='Username'
          defaultValue={currentUser.username}
          id='username'
          className='border p-3 rounded-lg'
          onChange={handleChange}
        />
        <input
          type='email'
          placeholder='Email'
          defaultValue={currentUser.email}
          id='email'
          className='border p-3 rounded-lg'
          onChange={handleChange}
        />
        <input
          type='password'
          placeholder='New Password (leave blank to keep current)'
          id='password'
          className='border p-3 rounded-lg'
          onChange={handleChange}
          value={formData.password}
        />
        <button
          disabled={loading}
          className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'
        >
          {loading ? 'Loading...' : 'Update'}
        </button>
        <Link
          className='bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95'
          to='/create-listing'
        >
          Create Listing
        </Link>
      </form>
      <div className='flex justify-between mt-5'>
        <span
          onClick={handleDeleteUser}
          className='text-red-700 cursor-pointer hover:underline'
        >
          Delete account
        </span>
        <span
          onClick={handleSignOut}
          className='text-red-700 cursor-pointer hover:underline'
        >
          Sign out
        </span>
      </div>

      {error && <p className='text-red-500 mt-3'>{error}</p>}
      {updateSuccess && <p className='text-green-500 mt-3'>Profile updated successfully!</p>}

      <button
        onClick={handleShowListings}
        className='text-green-700 w-full mt-5 hover:underline'
        type='button'
      >
        Show My Listings
      </button>
      {showListingError && (
        <p className='text-red-500 mt-2 text-sm'>Error showing listings</p>
      )}

      {userListings.length > 0 && (
        <div className='flex flex-col gap-4 mt-4'>
          <h2 className='text-center mt-5 text-xl font-semibold'>Your Listings</h2>
          {userListings.map((listing) => (
            <div
              key={listing._id}
              className='border rounded-lg p-3 flex justify-between items-center gap-4'
            >
              <Link to={`/listing/${listing._id}`}>
                <img
                  src={listing.imageUrls[0]}
                  alt='listing cover'
                  className='h-16 w-16 object-contain'
                />
              </Link>
              <Link
                className='text-slate-700 font-semibold hover:underline truncate flex-1'
                to={`/listing/${listing._id}`}
              >
                <p>{listing.name}</p>
              </Link>
              <div className='flex flex-col item-center'>
                <button
                  onClick={() => handleListingDelete(listing._id)}
                  className='text-red-700 uppercase text-sm hover:underline'
                  type='button'
                >
                  Delete
                </button>
                <Link to={`/update-listing/${listing._id}`}>
                  <button className='text-green-700 uppercase text-sm hover:underline' type='button'>
                    Edit
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
