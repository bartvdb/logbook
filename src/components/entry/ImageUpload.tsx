import React, { useRef } from 'react';
import { ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { compressImage, generateImageId } from '@/utils/image';
import { EntryImage } from '@/types';

interface ImageUploadProps {
  onImageAdd: (image: EntryImage, placeholder: string) => void;
  disabled?: boolean;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'icon';
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageAdd,
  disabled = false,
  variant = 'ghost',
  size = 'icon',
  className,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;

      try {
        const dataUrl = await compressImage(file);
        const imageId = generateImageId();
        const image: EntryImage = {
          id: imageId,
          dataUrl,
          createdAt: new Date(),
        };
        const placeholder = `\n![image](${imageId})\n`;
        onImageAdd(image, placeholder);
      } catch (error) {
        console.error('Failed to process image:', error);
      }
    }

    // Reset input so same file can be selected again
    e.target.value = '';
  };

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={disabled}
        className={className}
        title="Add photo"
      >
        <ImagePlus className="w-5 h-5" />
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
};

export default ImageUpload;
