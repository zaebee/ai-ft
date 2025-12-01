import React, { useState, useMemo } from 'react';
import { Picture, ImagePreviews } from '../types';
import { API_BASE_URL, MOCK_IMAGES } from '../constants';

interface VehicleImageGalleryProps {
  picture?: Picture;
  altText: string;
}

/**
 * Helper to resolve absolute URL from relative paths.
 * If the path starts with http/blob/data, it is returned as is.
 * Otherwise, it resolves against the API base URL's origin.
 */
const resolveUrl = (path?: string): string => {
  if (!path) return MOCK_IMAGES.CAR_PLACEHOLDER;
  
  // Check for absolute URLs or special protocols
  if (/^(http|https|blob|data):/.test(path)) {
    return path;
  }

  // Ensure path starts with / for consistent appending
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  try {
    // Attempt to extract the origin (protocol + domain) from API_BASE_URL
    // e.g. "http://localhost:8000/api/v1" -> "http://localhost:8000"
    // This assumes static files are served from the root of the domain provided in API_BASE_URL
    const urlObj = new URL(API_BASE_URL);
    return `${urlObj.origin}${normalizedPath}`;
  } catch (e) {
    // Fallback if API_BASE_URL is relative (e.g. "/api/v1") or invalid URL
    // We prepend the base URL directly, ensuring no double slashes
    const cleanBase = API_BASE_URL.replace(/\/+$/, '');
    return `${cleanBase}${normalizedPath}`;
  }
};

/**
 * Generates a srcSet string from the previews object.
 * Mapping assumptions: xs=320w, s=640w, m=1024w, l=1280w
 */
const generateSrcSet = (previews?: ImagePreviews): string | undefined => {
  if (!previews) return undefined;
  
  const sources: string[] = [];
  if (previews.xs) sources.push(`${resolveUrl(previews.xs)} 320w`);
  if (previews.s) sources.push(`${resolveUrl(previews.s)} 640w`);
  if (previews.m) sources.push(`${resolveUrl(previews.m)} 1024w`);
  if (previews.l) sources.push(`${resolveUrl(previews.l)} 1280w`);
  
  return sources.length > 0 ? sources.join(', ') : undefined;
};

export const VehicleImageGallery: React.FC<VehicleImageGalleryProps> = ({ picture, altText }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Flatten images into a consistent array for the gallery state
  const images = useMemo(() => {
    if (!picture) return [{ src: MOCK_IMAGES.CAR_PLACEHOLDER, previews: undefined }];

    const items = [];
    
    // Add Cover
    if (picture.cover) {
      items.push({
        src: picture.cover,
        previews: picture.cover_previews
      });
    }

    // Add Extras
    if (picture.extra && Array.isArray(picture.extra)) {
      picture.extra.forEach(extraSrc => {
        const extraPreviewData = picture.extra_previews?.[extraSrc];
        items.push({
          src: extraSrc,
          previews: extraPreviewData?.previews
        });
      });
    }

    // Fallback if empty
    if (items.length === 0) {
      items.push({ src: MOCK_IMAGES.CAR_PLACEHOLDER, previews: undefined });
    }

    return items;
  }, [picture]);

  // Ensure selection index is valid (in case props change)
  const safeIndex = selectedImageIndex < images.length ? selectedImageIndex : 0;
  const currentImage = images[safeIndex];

  return (
    <div className="space-y-4">
      {/* Main Feature Image */}
      <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200 relative group">
        <img
          src={resolveUrl(currentImage.src)}
          srcSet={generateSrcSet(currentImage.previews)}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
          alt={`${altText} - View ${safeIndex + 1}`}
          className="h-full w-full object-cover transition-opacity duration-300"
        />
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, idx) => (
            <button
              key={`${img.src}-${idx}`}
              type="button"
              onClick={() => setSelectedImageIndex(idx)}
              className={`relative h-20 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
                safeIndex === idx 
                  ? 'border-blue-600 ring-2 ring-blue-100' 
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={resolveUrl(img.previews?.xs || img.previews?.s || img.src)}
                alt={`Thumbnail ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};