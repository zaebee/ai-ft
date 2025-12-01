import { API_BASE_URL, MOCK_IMAGES } from '../constants';

/**
 * Helper to resolve absolute URL from relative paths.
 * If the path starts with http/blob/data, it is returned as is.
 * Otherwise, it resolves against the API base URL's origin.
 */
export const resolveImageUrl = (path?: string): string => {
  if (!path) return MOCK_IMAGES.CAR_PLACEHOLDER;
  
  // Check for absolute URLs or special protocols
  if (/^(http|https|blob|data):/.test(path)) {
    return path;
  }

  // Ensure path starts with / for consistent appending
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  try {
    // Attempt to extract the origin (protocol + domain) from API_BASE_URL
    // e.g. "https://stage.ownima.com/api/v1" -> "https://stage.ownima.com"
    // This assumes static files are served from the root of the domain provided in API_BASE_URL
    const urlObj = new URL(API_BASE_URL);
    return `${urlObj.origin}${normalizedPath}`;
  } catch (e) {
    // Fallback if API_BASE_URL is relative or invalid. 
    // In a real staging scenario, we want to force the known staging domain if local config fails.
    if (API_BASE_URL.startsWith('http')) {
        const cleanBase = API_BASE_URL.replace(/\/+$/, '');
        return `${cleanBase}${normalizedPath}`;
    }
    // Final fallback to staging if all else fails to avoid localhost 404s on Vercel
    return `https://stage.ownima.com${normalizedPath}`;
  }
};
