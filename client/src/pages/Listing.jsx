import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useSelector } from 'react-redux';
import { Navigation } from 'swiper/modules';
import 'swiper/css/bundle';
import {
  FaBath,
  FaBed,
  FaChair,
  FaMapMarkerAlt,
  FaParking,
  FaShare,
} from 'react-icons/fa';
import Contact from '../components/Contact';
import ListingMap from '../components/ListingMap';

export default function Listing() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);
  const params = useParams();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/listing/get/${params.listingId}`);
        const data = await res.json();
        if (!res.ok || data.success === false) {
          setError(true);
          return;
        }
        setListing(data.listing);
        setError(false);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [params.listingId]);

  const hasOffer = Boolean(
    listing?.offer && listing?.discountPrice < listing?.regularPrice
  );
  const displayPrice = listing
    ? hasOffer
      ? listing.discountPrice
      : listing.regularPrice
    : 0;
  const savings = hasOffer
    ? listing.regularPrice - listing.discountPrice
    : 0;
  const directionsUrl = listing?.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        listing.address
      )}`
    : '';
  const featureItems = listing
    ? [
        {
          icon: FaBed,
          label:
            listing.bedrooms > 1
              ? `${listing.bedrooms} bedrooms`
              : `${listing.bedrooms} bedroom`,
        },
        {
          icon: FaBath,
          label:
            listing.bathrooms > 1
              ? `${listing.bathrooms} bathrooms`
              : `${listing.bathrooms} bathroom`,
        },
        {
          icon: FaParking,
          label: listing.parking ? 'Parking available' : 'No dedicated parking',
        },
        {
          icon: FaChair,
          label: listing.furnished ? 'Fully furnished' : 'Unfurnished',
        },
      ]
    : [];
  const isOwner = Boolean(currentUser && listing?.userRef === currentUser._id);

  return (
    <main className='pb-16'>
      {loading && <p className='my-10 text-center text-2xl text-slate-700'>Loading...</p>}
      {error && (
        <p className='my-10 text-center text-2xl text-red-600'>Something went wrong!</p>
      )}
      {listing && !loading && !error && (
        <>
          <section className='mx-auto mt-4 max-w-6xl px-4 sm:mt-6 sm:px-6'>
            <div className='relative overflow-hidden rounded-[34px] bg-slate-200 shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5'>
              <Swiper modules={[Navigation]} navigation>
                {listing.imageUrls.map((url) => (
                  <SwiperSlide key={url}>
                    <div
                      className='relative h-[280px] sm:h-[420px] lg:h-[520px]'
                      style={{
                        background: `linear-gradient(180deg, rgba(15, 23, 42, 0.08), rgba(15, 23, 42, 0.32)), url(${url}) center no-repeat`,
                        backgroundSize: 'cover',
                      }}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>

              <button
                type='button'
                aria-label='Share listing'
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className='absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/60 bg-white/90 text-slate-600 shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:text-emerald-700 sm:right-6 sm:top-6'
              >
                <FaShare className='text-lg' />
              </button>

              {copied && (
                <p className='absolute left-4 top-4 z-10 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg sm:left-6 sm:top-6'>
                  Link copied!
                </p>
              )}
            </div>
          </section>

          <section className='mx-auto mt-6 grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.9fr)]'>
            <div className='space-y-6'>
              <div className='rounded-[30px] bg-white/90 p-5 shadow-lg shadow-slate-900/5 ring-1 ring-slate-900/5 sm:p-8'>
                <div className='flex flex-col gap-5 border-b border-slate-200/80 pb-6'>
                  <div className='flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between'>
                    <div>
                      <p className='text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700'>
                        Curated Listing
                      </p>
                      <h1 className='mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl'>
                        {listing.name}
                      </h1>
                      <p className='mt-4 flex items-start gap-2 text-sm leading-6 text-slate-600 sm:text-base'>
                        <FaMapMarkerAlt className='mt-1 shrink-0 text-emerald-700' />
                        <span>{listing.address}</span>
                      </p>
                    </div>

                    <div className='rounded-[24px] bg-emerald-50 px-5 py-4 shadow-inner shadow-emerald-900/5'>
                      <p className='text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700'>
                        Price
                      </p>
                      <p className='mt-2 text-3xl font-semibold text-slate-900'>
                        ${displayPrice.toLocaleString('en-US')}
                        {listing.type === 'rent' && (
                          <span className='text-base font-medium text-slate-500'>
                            {' '}
                            / month
                          </span>
                        )}
                      </p>
                      {hasOffer && (
                        <p className='mt-1 text-sm text-slate-500 line-through'>
                          ${listing.regularPrice.toLocaleString('en-US')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className='flex flex-wrap gap-3'>
                    <span className='rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white'>
                      {listing.type === 'rent' ? 'For Rent' : 'For Sale'}
                    </span>
                    {hasOffer && (
                      <span className='rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800'>
                        Save ${savings.toLocaleString('en-US')}
                      </span>
                    )}
                  </div>
                </div>

                <div className='mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
                  {featureItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className='rounded-[24px] border border-slate-200/80 bg-slate-50 px-4 py-4'
                      >
                        <Icon className='text-xl text-emerald-700' />
                        <p className='mt-3 text-sm font-semibold text-slate-800'>
                          {item.label}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className='mt-6 rounded-[28px] bg-slate-50 p-5 sm:p-6'>
                  <p className='text-xs font-semibold uppercase tracking-[0.24em] text-slate-400'>
                    Description
                  </p>
                  <p className='mt-3 text-sm leading-7 text-slate-600 sm:text-base'>
                    {listing.description}
                  </p>
                </div>
              </div>
            </div>

            <aside className='space-y-6 lg:sticky lg:top-24 lg:self-start'>
              <div className='rounded-[30px] bg-white/90 p-4 shadow-lg shadow-slate-900/5 ring-1 ring-slate-900/5 sm:p-6'>
                <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
                  <div>
                    <p className='text-xs font-semibold uppercase tracking-[0.24em] text-slate-400'>
                      Neighborhood
                    </p>
                    <h2 className='mt-1 text-xl font-semibold text-slate-900'>
                      Map & directions
                    </h2>
                  </div>

                  {directionsUrl && (
                    <a
                      href={directionsUrl}
                      target='_blank'
                      rel='noreferrer'
                      className='rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-600 hover:text-emerald-700'
                    >
                      Open in Maps
                    </a>
                  )}
                </div>

                <ListingMap address={listing.address} name={listing.name} />
              </div>

              <div className='rounded-[30px] bg-white/90 p-5 shadow-lg shadow-slate-900/5 ring-1 ring-slate-900/5 sm:p-6'>
                <p className='text-xs font-semibold uppercase tracking-[0.24em] text-slate-400'>
                  Next step
                </p>
                <h2 className='mt-1 text-xl font-semibold text-slate-900'>
                  Talk to the landlord
                </h2>
                <p className='mt-3 text-sm leading-6 text-slate-600'>
                  Ask about availability, scheduling a visit, or anything else
                  you need before deciding.
                </p>

                {!currentUser && (
                  <Link
                    to='/sign-in'
                    className='mt-5 inline-flex w-full justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-700 transition hover:border-emerald-600 hover:text-emerald-700'
                  >
                    Sign in to contact
                  </Link>
                )}
                {isOwner && (
                  <div className='mt-5 rounded-[22px] bg-emerald-50 px-4 py-4 text-sm font-medium text-emerald-800'>
                    This is your listing. You can edit or manage it from your
                    profile.
                  </div>
                )}
                {currentUser && !isOwner && !contact && (
                  <button
                    onClick={() => setContact(true)}
                    className='mt-5 w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-emerald-700'
                  >
                    Contact landlord
                  </button>
                )}
                {contact && !isOwner && (
                  <div className='mt-5'>
                    <Contact listing={listing} />
                  </div>
                )}
              </div>
            </aside>
          </section>
        </>
      )}
    </main>
  );
}
