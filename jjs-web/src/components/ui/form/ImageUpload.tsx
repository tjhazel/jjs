import { forwardRef, useImperativeHandle, useRef } from 'react';

export interface ImageUploadHandle {
  open: () => void;
}

interface ImageUploadProps {
  onUpload: (file: File) => void;
}

const ImageUpload = forwardRef<ImageUploadHandle, ImageUploadProps>(
  ({ onUpload }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      open: () => inputRef.current?.click(),
    }));

    return (
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = '';
        }}
      />
    );
  },
);

ImageUpload.displayName = 'ImageUpload';
export default ImageUpload;
