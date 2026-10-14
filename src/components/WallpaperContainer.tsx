import React from 'react';
import { WallpaperConfig } from '../types';

interface Props {
  wallpaper: WallpaperConfig;
  children: React.ReactNode;
}

export const WallpaperContainer: React.FC<Props> = ({ wallpaper, children }) => {
  if (!wallpaper.imageUrl || !wallpaper.isCustom) {
    return <div className="relative min-h-screen w-full">{children}</div>;
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Background image layer */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-300 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${wallpaper.imageUrl})`,
          filter: `brightness(${wallpaper.brightness}%) blur(${wallpaper.blur}px)`,
          transform: 'scale(1.05)', // prevent blur edge bleed
        }}
      />

      {/* Dark overlay to guarantee 100% contrast & legibility */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-300 z-0 bg-black"
        style={{
          opacity: wallpaper.overlayOpacity / 100,
        }}
      />

      {/* App Content */}
      <div className="relative z-10 min-h-screen flex flex-col">{children}</div>
    </div>
  );
};
