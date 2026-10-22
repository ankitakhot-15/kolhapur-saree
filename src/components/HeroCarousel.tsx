import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { storeService } from '../services/storeService.ts';
import { PromotionalBanner } from '../types/index.ts';

interface HeroCarouselProps {
  onNavigate: (view: string, param?: string) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onNavigate }) => {
  const [banners, setBanners] = useState<PromotionalBanner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const update = () => {
      const list = storeService.getBanners(true);
      setBanners(list);
    };
    update();
    return storeService.subscribe(update);
  }, []);

  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [banners, isPaused]);

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  const handleCtaClick = () => {
    if (currentBanner.ctaLink.includes('category=')) {
      const match = currentBanner.ctaLink.match(/category=([^&]+)/);
      if (match) {
        onNavigate('catalog', decodeURIComponent(match[1]));
        return;
      }
    }
    onNavigate('catalog');
  };

  return (
    <div 
      className="relative w-full overflow-hidden bg-[#292522]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Promotional Hero Banners"
    >
      <div className="relative h-[480px] sm:h-[560px] lg:h-[620px] w-full">
        {/* Background Editorial Image */}
        <img
          src={currentBanner.imageUrl}
          alt={currentBanner.heading}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out"
        />

        {/* Measured Scrim Gradient for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />

        {/* Content Container */}
        <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
          <div className="max-w-xl text-[#FAF7F0] space-y-4">
            
            {/* Subtle editorial kicker without pills */}
            {currentBanner.badgeText && (
              <div className="flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-[#C7A66A]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{currentBanner.badgeText}</span>
                <span aria-hidden="true">·</span>
                <span>Kolhapur Heritage</span>
              </div>
            )}

            {/* Headline */}
            <h1 
              className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-white leading-tight"
              style={{ textWrap: 'balance' }}
            >
              {currentBanner.heading}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-[#FAF7F0]/85 font-sans leading-relaxed max-w-lg">
              {currentBanner.subtitle}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={handleCtaClick}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#641D32] text-[#FAF7F0] hover:bg-[#7E2841] text-sm font-semibold rounded-md shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C7A66A] whitespace-nowrap"
              >
                <span>{currentBanner.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('catalog')}
                className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-md border border-white/20 transition-all whitespace-nowrap"
              >
                <span>Explore All Sarees</span>
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Controls */}
        {banners.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-colors"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-colors"
              aria-label="Next banner"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 transition-all rounded-full ${
                    idx === currentIndex ? 'w-8 bg-[#C7A66A]' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
