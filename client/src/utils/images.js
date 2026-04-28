const SVG_FALLBACKS = {
  property: encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f5fbf3" />
          <stop offset="55%" stop-color="#e4f0f7" />
          <stop offset="100%" stop-color="#dfeee4" />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" rx="48" fill="url(#bg)" />
      <rect x="150" y="170" width="900" height="560" rx="36" fill="#ffffff" opacity="0.94" />
      <path d="M310 470L600 250L890 470" fill="none" stroke="#0f766e" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="360" y="450" width="480" height="200" rx="26" fill="#dff4ed" />
      <rect x="420" y="500" width="115" height="80" rx="18" fill="#b8ddd5" />
      <rect x="665" y="500" width="115" height="80" rx="18" fill="#b8ddd5" />
      <rect x="555" y="485" width="90" height="165" rx="20" fill="#0f172a" opacity="0.88" />
      <text x="600" y="780" text-anchor="middle" font-family="Trebuchet MS, Segoe UI, sans-serif" font-size="58" fill="#334155">NestQuest Listing</text>
    </svg>
  `),
  avatar: encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#dff4ed" />
          <stop offset="100%" stop-color="#c9e3f7" />
        </linearGradient>
      </defs>
      <rect width="320" height="320" rx="160" fill="url(#bg)" />
      <circle cx="160" cy="122" r="58" fill="#0f766e" opacity="0.9" />
      <path d="M78 274c18-56 60-84 82-84h0c22 0 64 28 82 84" fill="#0f172a" opacity="0.86" />
    </svg>
  `),
};

export const IMAGE_FALLBACKS = {
  property: `data:image/svg+xml;charset=UTF-8,${SVG_FALLBACKS.property}`,
  avatar: `data:image/svg+xml;charset=UTF-8,${SVG_FALLBACKS.avatar}`,
};

export function getOptimizedImageUrl(
  src,
  { width, height, mode = 'cover', fallback = 'property' } = {}
) {
  if (!src) {
    return IMAGE_FALLBACKS[fallback] || IMAGE_FALLBACKS.property;
  }

  if (src.includes('res.cloudinary.com') && src.includes('/image/upload/')) {
    const transforms = ['f_auto', 'q_auto'];

    if (width) {
      transforms.push(`w_${width}`);
    }

    if (height) {
      transforms.push(`h_${height}`);
    }

    if (width || height) {
      transforms.push(`c_${mode === 'contain' ? 'fit' : 'fill'}`);
    }

    return src.replace(
      '/image/upload/',
      `/image/upload/${transforms.join(',')}/`
    );
  }

  return src;
}
