import React from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
  color?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isActive, color = 'bg-amber-500' }) => {
  return (
    <div className="flex items-center justify-center gap-1 h-6 px-2">
      <span
        className={`w-1 rounded-full transition-all duration-300 ${color} ${
          isActive ? 'h-5 animate-pulse' : 'h-1.5 opacity-40'
        }`}
        style={{ animationDelay: '0ms' }}
      />
      <span
        className={`w-1 rounded-full transition-all duration-300 ${color} ${
          isActive ? 'h-6 animate-pulse' : 'h-2 opacity-40'
        }`}
        style={{ animationDelay: '150ms' }}
      />
      <span
        className={`w-1 rounded-full transition-all duration-300 ${color} ${
          isActive ? 'h-4 animate-pulse' : 'h-1.5 opacity-40'
        }`}
        style={{ animationDelay: '300ms' }}
      />
      <span
        className={`w-1 rounded-full transition-all duration-300 ${color} ${
          isActive ? 'h-6 animate-pulse' : 'h-2 opacity-40'
        }`}
        style={{ animationDelay: '75ms' }}
      />
      <span
        className={`w-1 rounded-full transition-all duration-300 ${color} ${
          isActive ? 'h-3 animate-pulse' : 'h-1 opacity-40'
        }`}
        style={{ animationDelay: '225ms' }}
      />
    </div>
  );
};
