import React from 'react';

interface ChatHeaderProps {
  title: string;
  subtitle: string;
  mode: 'document' | 'image' | 'video';
}

export const ChatHeader = ({ title, subtitle, mode }: ChatHeaderProps) => {
  const getBgColor = () => {
    switch (mode) {
      case 'document':
        return 'bg-[#333333]';
      case 'image':
        return 'bg-[#333333]';
      case 'video':
        return 'bg-[#333333]';
      default:
        return 'bg-[#333333]';
    }
  };

  return (
    <div className={`${getBgColor()} text-white p-4 border-b border-[#3E3D43]`}>
      <div className="flex items-center space-x-3">
        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${mode === 'document' ? 'bg-[#7E69AB]' : mode === 'image' ? 'bg-[#9b87f5]' : 'bg-[#D6BCFA]'}`}>
          {mode === 'document' && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
          )}
          {mode === 'image' && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          )}
          {mode === 'video' && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-gray-300">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};