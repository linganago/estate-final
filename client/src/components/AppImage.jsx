import { useEffect, useMemo, useState } from 'react';
import { getOptimizedImageUrl, IMAGE_FALLBACKS } from '../utils/images';

export default function AppImage({
  src,
  alt,
  className = '',
  width,
  height,
  mode = 'cover',
  fallback = 'property',
  loading = 'lazy',
  ...props
}) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const resolvedSrc = useMemo(() => {
    if (hasError) {
      return IMAGE_FALLBACKS[fallback] || IMAGE_FALLBACKS.property;
    }

    return getOptimizedImageUrl(src, { width, height, mode, fallback });
  }, [fallback, hasError, height, mode, src, width]);

  return (
    <img
      {...props}
      src={resolvedSrc}
      alt={alt}
      className={className}
      loading={loading}
      decoding='async'
      onError={() => setHasError(true)}
    />
  );
}
