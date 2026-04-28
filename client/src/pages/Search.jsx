import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FormChip from '../components/FormChip';
import ListingItem from '../components/ListingItem';

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebardata, setSidebardata] = useState({
    searchTerm: '',
    type: 'all',
    parking: false,
    furnished: false,
    offer: false,
    sort: 'createdAt',
    order: 'desc',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    setSidebardata({
      searchTerm: urlParams.get('searchTerm') || '',
      type: urlParams.get('type') || 'all',
      parking: urlParams.get('parking') === 'true',
      furnished: urlParams.get('furnished') === 'true',
      offer: urlParams.get('offer') === 'true',
      sort: urlParams.get('sort') || 'createdAt',
      order: urlParams.get('order') || 'desc',
    });

    const fetchListings = async () => {
      try {
        setLoading(true);
        setError('');
        setShowMore(false);
        const res = await fetch(`/api/listing/get?${urlParams.toString()}`);
        const data = await res.json();
        if (!res.ok || !Array.isArray(data)) {
          throw new Error('Could not load listings.');
        }
        setShowMore(data.length >= 9);
        setListings(data);
      } catch {
        setListings([]);
        setError('Could not load listings right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [location.search]);

  const handleChange = (e) => {
    const { id, value, checked } = e.target;

    if (['all', 'rent', 'sale'].includes(id)) {
      setSidebardata((prev) => ({ ...prev, type: id }));
    } else if (['parking', 'furnished', 'offer'].includes(id)) {
      setSidebardata((prev) => ({ ...prev, [id]: checked }));
    } else if (id === 'searchTerm') {
      setSidebardata((prev) => ({ ...prev, searchTerm: value }));
    } else if (id === 'sort_order') {
      const [sort, order] = value.split('_');
      setSidebardata((prev) => ({ ...prev, sort, order }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams({
      searchTerm: sidebardata.searchTerm,
      type: sidebardata.type,
      parking: sidebardata.parking,
      furnished: sidebardata.furnished,
      offer: sidebardata.offer,
      sort: sidebardata.sort,
      order: sidebardata.order,
    });
    navigate(`/search?${urlParams.toString()}`);
  };

  const onShowMoreClick = async () => {
    try {
      setError('');
      const urlParams = new URLSearchParams(location.search);
      urlParams.set('startIndex', listings.length);
      const res = await fetch(`/api/listing/get?${urlParams.toString()}`);
      const data = await res.json();
      if (!res.ok || !Array.isArray(data)) {
        throw new Error('Could not load more listings.');
      }
      setShowMore(data.length >= 9);
      setListings((prev) => [...prev, ...data]);
    } catch {
      setError('Could not load more listings right now.');
    }
  };

  return (
    <div className='mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-start'>
      <aside className='lg:sticky lg:top-24 lg:w-[320px] lg:shrink-0'>
        <div className='rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 ring-1 ring-slate-900/5'>
          <div className='mb-6'>
            <p className='text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700'>
              Filter listings
            </p>
            <h1 className='mt-2 text-2xl font-semibold text-slate-900'>
              Refine your search
            </h1>
          </div>

          <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
            <div className='space-y-2'>
              <label htmlFor='searchTerm' className='text-sm font-semibold text-slate-700'>
                Search term
              </label>
              <input
                type='text'
                id='searchTerm'
                placeholder='Area, title, or keyword'
                className='w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition focus:border-emerald-600 focus:bg-white'
                value={sidebardata.searchTerm}
                onChange={handleChange}
              />
            </div>

            <fieldset className='space-y-3'>
              <legend className='text-sm font-semibold text-slate-700'>
                Property type
              </legend>
              <div className='grid gap-3 sm:grid-cols-3 lg:grid-cols-1'>
                {[['all', 'Rent & Sale'], ['rent', 'Rent'], ['sale', 'Sale']].map(
                  ([val, label]) => (
                    <FormChip
                      key={val}
                      id={val}
                      name='property-type'
                      type='radio'
                      checked={sidebardata.type === val}
                      onChange={handleChange}
                      label={label}
                      description={
                        val === 'all'
                          ? 'Browse every listing'
                          : val === 'rent'
                            ? 'Only rental homes'
                            : 'Only homes for sale'
                      }
                    />
                  )
                )}
              </div>
            </fieldset>

            <fieldset className='space-y-3'>
              <legend className='text-sm font-semibold text-slate-700'>Extras</legend>
              <div className='grid gap-3 sm:grid-cols-3 lg:grid-cols-1'>
                {[['offer', 'Offers only'], ['parking', 'Parking'], ['furnished', 'Furnished']].map(
                  ([val, label]) => (
                    <FormChip
                      key={val}
                      id={val}
                      name={val}
                      type='checkbox'
                      checked={sidebardata[val]}
                      onChange={handleChange}
                      label={label}
                      description={
                        val === 'offer'
                          ? 'Show discounted listings'
                          : val === 'parking'
                            ? 'Only properties with parking'
                            : 'Only furnished homes'
                      }
                    />
                  )
                )}
              </div>
            </fieldset>

            <div className='space-y-2'>
              <label htmlFor='sort_order' className='text-sm font-semibold text-slate-700'>
                Sort by
              </label>
              <select
                onChange={handleChange}
                value={`${sidebardata.sort}_${sidebardata.order}`}
                id='sort_order'
                className='w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition focus:border-emerald-600 focus:bg-white'
              >
                <option value='regularPrice_desc'>Price high to low</option>
                <option value='regularPrice_asc'>Price low to high</option>
                <option value='createdAt_desc'>Latest</option>
                <option value='createdAt_asc'>Oldest</option>
              </select>
            </div>

            <button className='rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-emerald-700'>
              Search
            </button>
          </form>
        </div>
      </aside>

      <section className='min-w-0 flex-1'>
        <div className='rounded-[30px] border border-white/70 bg-white/90 p-5 shadow-lg shadow-slate-900/5 ring-1 ring-slate-900/5 sm:p-6'>
          <div className='flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.24em] text-slate-400'>
                Search results
              </p>
              <h2 className='mt-1 text-2xl font-semibold text-slate-900'>
                Listings
              </h2>
            </div>

            {!loading && listings.length > 0 && (
              <p className='rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700'>
                {listings.length} result{listings.length > 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className='mt-6'>
            {error && (
              <p className='mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
                {error}
              </p>
            )}
            <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3'>
              {!loading && listings.length === 0 && (
                <p className='col-span-full rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-lg text-slate-600'>
                  No listings found!
                </p>
              )}

              {loading && (
                <p className='col-span-full rounded-[24px] bg-slate-50 px-5 py-10 text-center text-lg text-slate-600'>
                  Loading...
                </p>
              )}

              {!loading &&
                listings.map((listing) => (
                  <ListingItem key={listing._id} listing={listing} />
                ))}
            </div>

            {showMore && (
              <button
                onClick={onShowMoreClick}
                className='mx-auto mt-8 flex rounded-full border border-emerald-600 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700 transition hover:bg-emerald-50'
              >
                Show more
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
