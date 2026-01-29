import React from 'react';
import { EntryImage } from '@/types';

interface EntryContentProps {
  content: string;
  images?: EntryImage[];
  className?: string;
}

/**
 * Renders entry content with inline images
 * Images are referenced in content as ![image](img-id)
 */
export const EntryContent: React.FC<EntryContentProps> = ({
  content,
  images = [],
  className = '',
}) => {
  // Create a map of image IDs to data URLs
  const imageMap = new Map(images.map(img => [img.id, img.dataUrl]));

  // Split content by image placeholders
  const parts = content.split(/(!\[image\]\([^)]+\))/g);

  return (
    <div className={`whitespace-pre-wrap ${className}`}>
      {parts.map((part, index) => {
        // Check if this part is an image placeholder
        const imageMatch = part.match(/!\[image\]\(([^)]+)\)/);
        if (imageMatch) {
          const imageId = imageMatch[1];
          const dataUrl = imageMap.get(imageId);
          if (dataUrl) {
            return (
              <span key={index} className="block my-3">
                <img
                  src={dataUrl}
                  alt="Entry image"
                  className="max-w-full h-auto rounded-lg"
                  loading="lazy"
                />
              </span>
            );
          }
          // Image not found, show placeholder
          return (
            <span key={index} className="block my-3 p-4 bg-muted rounded-lg text-muted-foreground text-sm">
              Image not found
            </span>
          );
        }
        // Regular text
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
};

export default EntryContent;
