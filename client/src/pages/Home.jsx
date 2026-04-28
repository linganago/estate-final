import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowRight,
  FaChartLine,
  FaHome,
  FaKey,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import AppImage from '../components/AppImage';
import ListingItem from '../components/ListingItem.jsx';

export default function Home() {
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);

  useEffect(() => {
    const fetchOfferListings = async () => {
      try {
        const res = await fetch('/api/listing/get?offer=true&limit=4');
        const data = await res.json();
        setOfferListings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.log(error);
      }
    };

    const fetchRentListings = async () => {
      try {
        const res = await fetch('/api/listing/get?type=rent&limit=4');
        const data = await res.json();
        setRentListings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.log(error);
      }
    };

    const fetchSaleListings = async () => {
      try {
        const res = await fetch('/api/listing/get?type=sale&limit=4');
        const data = await res.json();
        setSaleListings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.log(error);
      }
    };

    fetchOfferListings();
    fetchRentListings();
    fetchSaleListings();
  }, []);

  const previewListings = useMemo(() => {
    const seen = new Set();

    return [...offerListings, ...saleListings, ...rentListings].filter((listing) => {
      if (!listing?._id || seen.has(listing._id)) {
        return false;
      }

      seen.add(listing._id);
      return true;
    });
  }, [offerListings, rentListings, saleListings]);

  const spotlightListing = previewListings[0] || null;
  const sideSpotlights = previewListings.slice(1, 3);
  const statItems = [
    {
      icon: FaHome,
      label: 'Live offers',
      value: offerListings.length || 0,
    },
    {
      icon: FaKey,
      label: 'Rentals',
      value: rentListings.length || 0,
    },
    {
      icon: FaChartLine,
      label: 'Homes for sale',
      value: saleListings.length || 0,
    },
  ];

  return (
    <main className='pb-16'>
      <section className='mx-auto max-w-7xl px-4 pb-8 pt-8 sm:px-6 lg:pt-12'>
        <div className='grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]'>
          <div className='relative overflow-hidden rounded-[38px] bg-[linear-gradient(135deg,#fdfdf8_0%,#eef6ef_48%,#ddeaf6_100%)] p-7 shadow-xl shadow-emerald-950/8 ring-1 ring-white/80 sm:p-10'>
            <div className='absolute right-0 top-0 h-48 w-48 rounded-full bg-emerald-200/45 blur-3xl' />
            <div className='absolute bottom-0 left-0 h-40 w-40 rounded-full bg-blue-200/40 blur-3xl' />

            <div className='relative max-w-2xl'>
              <p className='text-xs font-semibold uppercase tracking-[0.34em] text-emerald-700'>
                Find with clarity
              </p>
              <h1 className='mt-5 text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl lg:text-6xl'>
                Homes that feel
                <span className='block text-emerald-700'>worth visiting</span>
              </h1>
              <p className='mt-5 max-w-xl text-base leading-8 text-slate-600 sm:text-lg'>
                Browse clean listings, compare prices quickly, and move from
                discovery to contacting the landlord without digging through a
                cluttered screen.
              </p>

              <div className='mt-8 flex flex-wrap gap-3'>
                <Link
                  to='/search'
                  className='inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-emerald-700'
                >
                  Start exploring
                  <FaArrowRight className='text-xs' />
                </Link>
                <Link
                  to='/search?offer=true'
                  className='inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/75 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-700 transition hover:border-emerald-600 hover:text-emerald-700'
                >
                  View offers
                </Link>
              </div>

              <div className='mt-8 grid gap-3 sm:grid-cols-3'>
                {statItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className='rounded-[26px] border border-white/80 bg-white/70 px-4 py-4 shadow-sm backdrop-blur'
                    >
                      <Icon className='text-lg text-emerald-700' />
                      <p className='mt-3 text-2xl font-semibold text-slate-900'>
                        {item.value}
                      </p>
                      <p className='text-sm text-slate-500'>{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2'>
            {spotlightListing ? (
              <Link
                to={`/listing/${spotlightListing._id}`}
                className='group relative overflow-hidden rounded-[34px] bg-slate-900 shadow-xl shadow-slate-900/15 ring-1 ring-slate-900/5 sm:col-span-2 xl:col-span-2'
              >
                <AppImage
                  src={spotlightListing.imageUrls?.[0]}
                  alt={spotlightListing.name}
                  className='h-[340px] w-full object-cover transition duration-500 group-hover:scale-105 sm:h-[360px]'
                  width={1200}
                  height={720}
                  fallback='property'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent' />
                <div className='absolute inset-x-0 bottom-0 p-6 text-white'>
                  <div className='flex flex-wrap gap-2'>
                    <span className='rounded-full bg-white/18 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] backdrop-blur'>
                      Featured now
                    </span>
                    <span className='rounded-full bg-emerald-500/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white'>
                      {spotlightListing.type === 'rent' ? 'For rent' : 'For sale'}
                    </span>
                  </div>
                  <h2 className='mt-4 text-3xl font-semibold'>
                    {spotlightListing.name}
                  </h2>
                  <p className='mt-3 flex items-center gap-2 text-sm text-slate-200'>
                    <FaMapMarkerAlt className='text-emerald-300' />
                    <span className='truncate'>{spotlightListing.address}</span>
                  </p>
                  <p className='mt-4 max-w-lg text-sm leading-6 text-slate-200'>
                    {spotlightListing.description}
                  </p>
                </div>
              </Link>
            ) : (
              <EmptyPreviewCard className='sm:col-span-2 xl:col-span-2' />
            )}

            {sideSpotlights.map((listing) => (
              <PreviewCard key={listing._id} listing={listing} />
            ))}

            {sideSpotlights.length < 2 &&
              Array.from({ length: 2 - sideSpotlights.length }).map((_, index) => (
                <EmptyPreviewCard key={`empty-${index}`} />
              ))}
          </div>
        </div>
      </section>

      <section className='mx-auto max-w-7xl px-4 sm:px-6'>
        <div className='grid gap-4 md:grid-cols-3'>
          <ValueCard
            icon={FaHome}
            title='Cleaner browsing'
            description='The landing page now prioritizes discovery and keeps listing imagery in better-proportioned cards.'
          />
          <ValueCard
            icon={FaMapMarkerAlt}
            title='Faster decisions'
            description='Key details like pricing, address context, and property type stay visible without oversized banners.'
          />
          <ValueCard
            icon={FaKey}
            title='Quicker contact'
            description='Once you open a listing, the landlord contact flow is easier to reach and more reliable.'
          />
        </div>
      </section>

      <div className='mx-auto mt-12 max-w-7xl space-y-12 px-4 sm:px-6'>
        <ListingSection
          title='Recent Offers'
          description='Highlighted deals with the best current discounts.'
          link='/search?offer=true'
          linkLabel='View all offers'
          listings={offerListings}
        />
        <ListingSection
          title='Places for Rent'
          description='Fresh rental listings ready for quick comparison.'
          link='/search?type=rent'
          linkLabel='View all rentals'
          listings={rentListings}
        />
        <ListingSection
          title='Places for Sale'
          description='Homes and properties currently available to buy.'
          link='/search?type=sale'
          linkLabel='View all sales'
          listings={saleListings}
        />
      </div>
    </main>
  );
}

function ListingSection({ title, description, link, linkLabel, listings }) {
  if (!listings.length) {
    return null;
  }

  return (
    <section className='rounded-[34px] border border-white/70 bg-white/85 p-5 shadow-lg shadow-slate-900/5 ring-1 ring-slate-900/5 sm:p-7'>
      <div className='mb-6 flex flex-wrap items-end justify-between gap-4'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.24em] text-slate-400'>
            Curated collection
          </p>
          <h2 className='mt-2 text-3xl font-semibold text-slate-900'>{title}</h2>
          <p className='mt-2 text-sm text-slate-500'>{description}</p>
        </div>
        <Link
          to={link}
          className='rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-600 hover:text-emerald-700'
        >
          {linkLabel}
        </Link>
      </div>

      <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4'>
        {listings.map((listing) => (
          <ListingItem key={listing._id} listing={listing} />
        ))}
      </div>
    </section>
  );
}

function PreviewCard({ listing }) {
  return (
    <Link
      to={`/listing/${listing._id}`}
      className='group relative overflow-hidden rounded-[28px] bg-slate-900 shadow-lg shadow-slate-900/10 ring-1 ring-slate-900/5'
    >
      <AppImage
        src={listing.imageUrls?.[0]}
        alt={listing.name}
        className='h-52 w-full object-cover transition duration-500 group-hover:scale-105'
        width={720}
        height={420}
        fallback='property'
      />
      <div className='absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent' />
      <div className='absolute inset-x-0 bottom-0 p-4 text-white'>
        <p className='text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300'>
          {listing.type === 'rent' ? 'Rental' : 'Sale'}
        </p>
        <h3 className='mt-2 text-xl font-semibold'>{listing.name}</h3>
        <p className='mt-2 truncate text-sm text-slate-200'>{listing.address}</p>
      </div>
    </Link>
  );
}

function ValueCard({ icon, title, description }) {
  const Icon = icon;

  return (
    <div className='rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-900/5 ring-1 ring-slate-900/5'>
      <Icon className='text-xl text-emerald-700' />
      <h3 className='mt-4 text-xl font-semibold text-slate-900'>{title}</h3>
      <p className='mt-2 text-sm leading-6 text-slate-600'>{description}</p>
    </div>
  );
}

function EmptyPreviewCard({ className = '' }) {
  return (
    <div
      className={`rounded-[28px] border border-dashed border-slate-300 bg-white/70 p-6 shadow-sm ${className}`}
    >
      <p className='text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'>
        Coming in next
      </p>
      <h3 className='mt-3 text-xl font-semibold text-slate-800'>
        More listings will appear here
      </h3>
      <p className='mt-2 text-sm leading-6 text-slate-500'>
        Create a few polished listings and the landing page will automatically
        fill these featured slots.
      </p>
    </div>
  );
}
