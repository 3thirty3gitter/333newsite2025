
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProductImageGalleryProps {
  images: string[];
  mainImage?: string;
}

export function ProductImageGallery({ images, mainImage }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(mainImage || images[0]);

  useEffect(() => {
    setSelectedImage(mainImage || images[0]);
  }, [mainImage, images]);

  return (
    <div>
      <div className="aspect-square w-full relative overflow-hidden rounded-lg shadow-lg mb-4">
        <Image
          key={selectedImage}
          src={selectedImage}
          alt="Selected product image"
          fill
          style={{objectFit:"cover"}}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          data-ai-hint="product image"
          priority
        />
      </div>
      <div className="grid grid-cols-5 gap-4">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(image)}
            className={cn(
              "aspect-square relative overflow-hidden rounded-md border-2 transition-all",
              selectedImage === image ? "border-primary shadow-md" : "border-transparent hover:border-primary/50"
            )}
          >
            <Image
              src={image}
              alt={`Product thumbnail ${index + 1}`}
              fill
              style={{objectFit:"cover"}}
              sizes="10vw"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
