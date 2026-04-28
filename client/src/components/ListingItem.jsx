import { Link } from 'react-router-dom';
import { MdLocationOn } from 'react-icons/md';
import AppImage from './AppImage';

export default function ListingItem({ listing }) {
  const hasOffer = listing.offer && listing.discountPrice < listing.regularPrice;
  const discountAmount = hasOffer
    ? listing.regularPrice - listing.discountPrice
    : 0;
  const displayPrice = hasOffer
    ? listing.discountPrice
    : listing.regularPrice;

  return (
    <article className='group h-full overflow-hidden rounded-[26px] border border-white/70 bg-white/90 shadow-sm shadow-slate-900/5 ring-1 ring-slate-900/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl'>
      <Link to={`/listing/${listing._id}`} className='flex h-full flex-col'>
        <div className='relative overflow-hidden'>
          <AppImage
            src={listing.imageUrls[0]}
            alt='listing cover'
            className='h-60 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-52'
            width={640}
            height={520}
            fallback='property'
          />
          <div className='absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-slate-950/70 via-slate-950/25 to-transparent p-4'>
            <span className='rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 shadow-sm'>
              {listing.type === 'rent' ? 'For Rent' : 'For Sale'}
            </span>
            {hasOffer && (
              <span className='rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm'>
                Save ${discountAmount.toLocaleString('en-US')}
              </span>
            )}
          </div>
        </div>

        <div className='flex flex-1 flex-col gap-3 p-4 sm:p-5'>
          <div>
            <p className='truncate text-lg font-semibold text-slate-800'>
              {listing.name}
            </p>
            <div className='mt-2 flex items-center gap-2 text-sm text-slate-500'>
              <MdLocationOn className='h-4 w-4 shrink-0 text-emerald-700' />
              <p className='truncate'>{listing.address}</p>
            </div>
          </div>

          <p className='line-clamp-2 text-sm leading-6 text-slate-600'>
            {listing.description}
          </p>

          <div className='mt-auto flex flex-col gap-4'>
            <div className='flex items-end justify-between gap-3'>
              <div>
                {hasOffer && (
                  <p className='text-sm text-slate-400 line-through'>
                    ${listing.regularPrice.toLocaleString('en-US')}
                  </p>
                )}
                <p className='text-xl font-semibold text-slate-900'>
                  ${displayPrice.toLocaleString('en-US')}
                  {listing.type === 'rent' && (
                    <span className='text-sm font-medium text-slate-500'>
                      {' '}
                      / month
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className='flex flex-wrap gap-2 text-xs font-semibold text-slate-600'>
              <span className='rounded-full bg-slate-100 px-3 py-1.5'>
                {listing.bedrooms > 1
                  ? `${listing.bedrooms} beds`
                  : `${listing.bedrooms} bed`}
              </span>
              <span className='rounded-full bg-slate-100 px-3 py-1.5'>
                {listing.bathrooms > 1
                  ? `${listing.bathrooms} baths`
                  : `${listing.bathrooms} bath`}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
