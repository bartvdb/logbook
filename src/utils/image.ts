// Maximum image dimension (will resize if larger)
const MAX_IMAGE_DIMENSION = 1200;
// JPEG quality for compression
const JPEG_QUALITY = 0.8;

/**
 * Compress and resize an image file to reduce storage size
 */
export const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Resize if too large
        if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
          if (width > height) {
            height = (height / width) * MAX_IMAGE_DIMENSION;
            width = MAX_IMAGE_DIMENSION;
          } else {
            width = (width / height) * MAX_IMAGE_DIMENSION;
            height = MAX_IMAGE_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG for better compression (unless it's a PNG with transparency)
        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const quality = file.type === 'image/png' ? 1 : JPEG_QUALITY;

        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Generate a unique ID for an image
 */
export const generateImageId = (): string => {
  return `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create an image placeholder markdown-like syntax
 */
export const createImagePlaceholder = (imageId: string): string => {
  return `\n![image](${imageId})\n`;
};

/**
 * Extract image IDs from content
 */
export const extractImageIds = (content: string): string[] => {
  const regex = /!\[image\]\((img-[^)]+)\)/g;
  const ids: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    ids.push(match[1]);
  }
  return ids;
};

/**
 * Check if a string is an image data URL
 */
export const isImageDataUrl = (str: string): boolean => {
  return str.startsWith('data:image/');
};
