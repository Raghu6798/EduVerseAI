import React from 'react';
import { Button } from '@/components/ui/button';
import { PaperclipIcon } from 'lucide-react';

interface FileUploadButtonProps {
  onClick: () => void;
  label: string;
}

export const FileUploadButton = ({ onClick, label }: FileUploadButtonProps) => {
  return (
    <Button 
      onClick={onClick}
      className="flex items-center gap-2 bg-[#7E69AB] hover:bg-[#9b87f5] text-white"
    >
      <PaperclipIcon className="h-4 w-4" />
      {label}
    </Button>
  );
};
