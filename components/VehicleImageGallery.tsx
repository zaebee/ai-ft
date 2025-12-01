import React, { useState, useMemo } from 'react';
import { Picture, ImagePreviews } from '../types';
import { MOCK_IMAGES } from '../constants';
import { resolveImageUrl } from '../utils/image';

interface VehicleImageGalleryProps {
  picture?: Picture;
  altText: string;
}

/**
 * Generates a srcSet string from the previews object.
 * Mapping assumptions: xs=320w, s=640w, m=1024w, l=1280w
 */
const generateSrcSet = (previews?: ImagePreviews): string | undefined => {
  if (!previews) return undefined;
  
  const sources: string[] = [];
  if (previews.xs) sources.push(`${resolveImageUrl(previews.xs)} 320w`);
  if (previews.s) sources.push(`${resolveImageUrl(previews.s)} 640w`);
  if (previews.m) sources.push(`${resolveImageUrl(previews.m)} 1024w`);
  if (previews.l) sources.push(`${resolveImageUrl(previews.l)} 1280w`);
  
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
          src={resolveImageUrl(currentImage.src)}
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
                src={resolveImageUrl(img.previews?.xs || img.previews?.s || img.src)}
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