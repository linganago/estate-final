import { useEffect, useMemo, useRef, useState } from 'react';

export default function ListingMap({ address, name }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [status, setStatus] = useState({
    loading: true,
    error: '',
  });

  const mapToken = import.meta.env.VITE_MAPBOX_TOKEN;
  const trimmedAddress = address?.trim() || '';
  const directionsUrl = useMemo(() => {
    if (!trimmedAddress) {
      return '';
    }

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      trimmedAddress
    )}`;
  }, [trimmedAddress]);

  useEffect(() => {
    let isCancelled = false;

    const cleanupMap = () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };

    const loadMap = async () => {
      cleanupMap();

      if (!mapToken || mapToken === 'your_mapbox_token_here') {
        setStatus({
          loading: false,
          error: 'Mapbox is not configured. Add a valid VITE_MAPBOX_TOKEN in client/.env and restart Vite.',
        });
        return;
      }

      if (!trimmedAddress) {
        setStatus({
          loading: false,
          error: 'This listing does not have an address yet.',
        });
        return;
      }

      setStatus({
        loading: true,
        error: '',
      });

      try {
        const [mapboxModule] = await Promise.all([
          import('mapbox-gl'),
          import('mapbox-gl/dist/mapbox-gl.css'),
        ]);
        const mapboxgl = mapboxModule.default ?? mapboxModule;

        if (!mapboxgl || typeof mapboxgl.supported !== 'function' || !mapboxgl.Map) {
          throw new Error('Map library failed to load correctly.');
        }

        if (!mapboxgl.supported()) {
          setStatus({
            loading: false,
            error: 'Your browser could not start the map renderer.',
          });
          return;
        }

        mapboxgl.accessToken = mapToken;

        const geocodeRes = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            trimmedAddress
          )}.json?access_token=${mapToken}&limit=1`
        );
        const geocodeData = await geocodeRes.json();

        if (!geocodeRes.ok) {
          const tokenRejected = geocodeRes.status === 401 || geocodeRes.status === 403;
          throw new Error(
            tokenRejected
              ? 'Mapbox rejected the token. Check the token permissions and allowed site URLs.'
              : geocodeData?.message || 'Mapbox could not geocode this address right now.'
          );
        }

        const feature = geocodeData?.features?.[0];
        if (!feature?.center) {
          throw new Error(
            'This address is too vague to map. Use a fuller street, city, and state when creating the listing.'
          );
        }

        if (isCancelled || !mapContainer.current) {
          return;
        }

        const [lng, lat] = feature.center;

        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [lng, lat],
          zoom: 14,
        });

        mapRef.current = map;

        map.addControl(
          new mapboxgl.NavigationControl({ showCompass: false }),
          'top-right'
        );

        const popup = new mapboxgl.Popup({ offset: 24 }).setHTML(
          `<p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#0f766e;">Pinned location</p><p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#0f172a;">${escapeHtml(
            name || 'Listing'
          )}</p><p style="margin:6px 0 0;font-size:12px;line-height:1.5;color:#475569;">${escapeHtml(
            trimmedAddress
          )}</p>`
        );

        new mapboxgl.Marker({ color: '#0f766e' })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map);

        map.on('load', () => {
          if (!isCancelled) {
            setStatus({
              loading: false,
              error: '',
            });
          }
        });

        map.on('error', () => {
          if (!isCancelled) {
            setStatus({
              loading: false,
              error: 'Map tiles could not be loaded for this listing.',
            });
          }
        });
      } catch (err) {
        if (!isCancelled) {
          setStatus({
            loading: false,
            error: err.message || 'Failed to load map.',
          });
        }
      }
    };

    loadMap();

    return () => {
      isCancelled = true;
      cleanupMap();
    };
  }, [mapToken, name, trimmedAddress]);

  if (status.error) {
    return (
      <div className='rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-5 text-center'>
        <p className='text-sm font-medium text-slate-700'>{status.error}</p>
        {directionsUrl && (
          <a
            href={directionsUrl}
            target='_blank'
            rel='noreferrer'
            className='mt-4 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700'
          >
            Open in Google Maps
          </a>
        )}
      </div>
    );
  }

  return (
    <div className='relative overflow-hidden rounded-[24px] border border-white/70 bg-slate-100 shadow-inner'>
      {status.loading && (
        <div className='absolute inset-0 z-10 flex items-center justify-center bg-white/75 backdrop-blur-sm'>
          <p className='rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm'>
            Loading map...
          </p>
        </div>
      )}
      <div ref={mapContainer} className='h-[320px] w-full sm:h-[360px]' />
    </div>
  );
}

function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}
