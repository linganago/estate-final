import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AppImage from '../components/AppImage';
import FormChip from '../components/FormChip';

const CLOUDINARY_CLOUD =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dkbd8qtc4';
const CLOUDINARY_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'mern-estate';

const LISTING_TYPES = [
  {
    id: 'rent',
    label: 'For rent',
    description: 'Best for monthly pricing and tenant leads.',
  },
  {
    id: 'sale',
    label: 'For sale',
    description: 'Best for outright property sales.',
  },
];

const FEATURE_OPTIONS = [
  {
    id: 'parking',
    label: 'Parking',
    description: 'Show this listing with parking available.',
  },
  {
    id: 'furnished',
    label: 'Furnished',
    description: 'Let visitors know it is move-in ready.',
  },
  {
    id: 'offer',
    label: 'Special offer',
    description: 'Reveal a discounted price on the listing.',
  },
];

export default function CreateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: '',
    description: '',
    address: '',
    type: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });
  const [imageUploadError, setImageUploadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const storeImage = (file) =>
    new Promise((resolve, reject) => {
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', CLOUDINARY_PRESET);
      fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
        method: 'POST',
        body: data,
      })
        .then((res) => res.json())
        .then((data) =>
          data.secure_url
            ? resolve(data.secure_url)
            : reject(new Error('Upload failed'))
        )
        .catch(reject);
    });

  const handleImageSubmit = () => {
    if (!files.length) return;

    if (files.length + formData.imageUrls.length > 6) {
      setImageUploadError('You can only upload up to 6 images per listing.');
      return;
    }

    setUploading(true);
    setImageUploadError('');

    Promise.all(Array.from(files).map(storeImage))
      .then((urls) => {
        setFormData((prev) => ({
          ...prev,
          imageUrls: [...prev.imageUrls, ...urls],
        }));
        setFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
      })
      .catch(() =>
        setImageUploadError('Image upload failed. Keep files under 2 MB each.')
      )
      .finally(() => setUploading(false));
  };

  const handleChange = (e) => {
    const { id, type, value, checked } = e.target;

    if (id === 'sale' || id === 'rent') {
      setFormData((prev) => ({ ...prev, type: id }));
    } else if (['parking', 'furnished', 'offer'].includes(id)) {
      setFormData((prev) => ({ ...prev, [id]: checked }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [id]: type === 'number' ? Number(value) : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.imageUrls.length < 1) {
      return setError('Please upload at least one image.');
    }

    if (formData.offer && +formData.discountPrice >= +formData.regularPrice) {
      return setError('Discount price must be lower than regular price.');
    }

    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/listing/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userRef: currentUser._id }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || 'Listing creation failed');
      }
      navigate(`/listing/${data._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className='mx-auto max-w-6xl px-4 py-8 sm:px-6'>
      <div className='mb-8 max-w-2xl'>
        <p className='text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700'>
          Publish a listing
        </p>
        <h1 className='mt-3 text-4xl font-semibold text-slate-900'>
          Create a listing
        </h1>
        <p className='mt-3 text-sm leading-7 text-slate-600 sm:text-base'>
          Add polished details, a complete address, and a small set of strong
          images so the listing looks trustworthy the moment it goes live.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className='grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]'
      >
        <section className='rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 ring-1 ring-slate-900/5 sm:p-8'>
          <div className='space-y-8'>
            <div>
              <SectionEyebrow>Core details</SectionEyebrow>
              <div className='mt-4 grid gap-5'>
                <Field
                  id='name'
                  label='Listing title'
                  placeholder='Sunny apartment near downtown'
                  value={formData.name}
                  onChange={handleChange}
                  maxLength='62'
                  minLength='5'
                  required
                />
                <Field
                  as='textarea'
                  id='description'
                  label='Description'
                  placeholder='Describe the home, neighborhood, and standout features.'
                  value={formData.description}
                  onChange={handleChange}
                  rows='5'
                  required
                />
                <div>
                  <Field
                    id='address'
                    label='Address'
                    placeholder='Street, city, state'
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                  <p className='mt-2 text-xs text-slate-500'>
                    Use a real, full address so maps and directions work
                    correctly.
                  </p>
                </div>
              </div>
            </div>

            <fieldset>
              <legend className='text-sm font-semibold text-slate-800'>
                Listing type
              </legend>
              <div className='mt-3 grid gap-3 sm:grid-cols-2'>
                {LISTING_TYPES.map((option) => (
                  <FormChip
                    key={option.id}
                    id={option.id}
                    name='listing-type'
                    type='radio'
                    checked={formData.type === option.id}
                    onChange={handleChange}
                    label={option.label}
                    description={option.description}
                  />
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className='text-sm font-semibold text-slate-800'>
                Features
              </legend>
              <div className='mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
                {FEATURE_OPTIONS.map((option) => (
                  <FormChip
                    key={option.id}
                    id={option.id}
                    name={option.id}
                    type='checkbox'
                    checked={formData[option.id]}
                    onChange={handleChange}
                    label={option.label}
                    description={option.description}
                  />
                ))}
              </div>
            </fieldset>

            <div>
              <SectionEyebrow>Numbers</SectionEyebrow>
              <div className='mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
                <NumberField
                  id='bedrooms'
                  label='Bedrooms'
                  value={formData.bedrooms}
                  onChange={handleChange}
                  min='1'
                />
                <NumberField
                  id='bathrooms'
                  label='Bathrooms'
                  value={formData.bathrooms}
                  onChange={handleChange}
                  min='1'
                />
                <NumberField
                  id='regularPrice'
                  label={formData.type === 'rent' ? 'Monthly price ($)' : 'Price ($)'}
                  value={formData.regularPrice}
                  onChange={handleChange}
                  min='1'
                />
                {formData.offer && (
                  <NumberField
                    id='discountPrice'
                    label='Offer price ($)'
                    value={formData.discountPrice}
                    onChange={handleChange}
                    min='0'
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        <aside className='space-y-6'>
          <section className='rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 ring-1 ring-slate-900/5'>
            <SectionEyebrow>Media</SectionEyebrow>
            <h2 className='mt-2 text-2xl font-semibold text-slate-900'>
              Listing photos
            </h2>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              Upload up to 6 images. The first image becomes the main cover on
              cards and the listing page.
            </p>

            <div className='mt-5 space-y-3'>
              <input
                type='file'
                ref={fileInputRef}
                className='w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700'
                onChange={(e) => setFiles(e.target.files)}
                multiple
                accept='image/*'
              />
              <div className='flex items-center justify-between gap-3'>
                <p className='text-xs text-slate-500'>
                  {files.length
                    ? `${files.length} file${files.length > 1 ? 's' : ''} selected`
                    : 'Choose sharp, well-lit images.'}
                </p>
                <button
                  type='button'
                  disabled={uploading}
                  onClick={handleImageSubmit}
                  className='rounded-full border border-emerald-700 px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60'
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>

            {imageUploadError && (
              <p className='mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
                {imageUploadError}
              </p>
            )}

            <div className='mt-5 space-y-3'>
              {formData.imageUrls.length > 0 ? (
                formData.imageUrls.map((url, index) => (
                  <div
                    key={url}
                    className='flex items-center gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-3'
                  >
                    <AppImage
                      src={url}
                      alt={`Listing upload ${index + 1}`}
                      className='h-20 w-20 rounded-2xl object-cover'
                      width={240}
                      height={240}
                      fallback='property'
                    />
                    <div className='min-w-0 flex-1'>
                      <p className='text-sm font-semibold text-slate-800'>
                        {index === 0 ? 'Cover image' : `Photo ${index + 1}`}
                      </p>
                      <p className='truncate text-xs text-slate-500'>{url}</p>
                    </div>
                    <button
                      type='button'
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          imageUrls: prev.imageUrls.filter((_, idx) => idx !== index),
                        }))
                      }
                      className='text-xs font-semibold uppercase tracking-[0.16em] text-red-600 hover:text-red-700'
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <div className='rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500'>
                  No images uploaded yet.
                </div>
              )}
            </div>
          </section>

          <section className='rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 ring-1 ring-slate-900/5'>
            <SectionEyebrow>Publish</SectionEyebrow>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              Double-check your address, price, and photo order before
              publishing.
            </p>

            <button
              type='submit'
              disabled={loading || uploading}
              className='mt-5 w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70'
            >
              {loading ? 'Creating...' : 'Create listing'}
            </button>

            {error && (
              <p className='mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
                {error}
              </p>
            )}
          </section>
        </aside>
      </form>
    </main>
  );
}

function SectionEyebrow({ children }) {
  return (
    <p className='text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700'>
      {children}
    </p>
  );
}

function Field({ as = 'input', label, id, className = '', ...props }) {
  const Component = as;

  return (
    <label className='block'>
      <span className='mb-2 block text-sm font-semibold text-slate-800'>
        {label}
      </span>
      <Component
        id={id}
        className={`w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none focus:border-emerald-600 focus:bg-white ${className}`}
        {...props}
      />
    </label>
  );
}

function NumberField({ id, label, value, onChange, min }) {
  return (
    <Field
      id={id}
      label={label}
      type='number'
      value={value}
      min={min}
      onChange={onChange}
      required
      inputMode='numeric'
    />
  );
}
