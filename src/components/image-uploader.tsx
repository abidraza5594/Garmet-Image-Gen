'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImageUpload: (dataUrl: string) => void;
  className?: string;
}

export default function ImageUploader({ onImageUpload, className }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setIsDragging(false);
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageUpload(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
    multiple: false,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors h-full',
        'hover:border-primary hover:bg-secondary',
        (isDragActive || isDragging) && 'border-primary bg-secondary',
        className
      )}
    >
      <input {...getInputProps()} />
      <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="font-headline text-lg">Drag & drop your garment image here</p>
      <p className="text-muted-foreground">or click to browse</p>
    </div>
  );
}
