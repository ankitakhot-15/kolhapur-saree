import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { storeService } from '../services/storeService.ts';

export const AnnouncementBar: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const update = () => {
      const settings = storeService.getSettings();
      setMessages(settings.announcementMessages || []);
    };
    update();
    return storeService.subscribe(update);
  }, []);

  useEffect(() => {
    if (messages.length <= 1 || isPaused || isDismissed) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [messages, isPaused, isDismissed]);

  if (isDismissed || messages.length === 0) return null;

  return (
    <div 
      className="bg-[#641D32] text-[#FAF7F0] text-xs font-medium py-2 px-4 transition-colors relative z-40"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Promotions and Announcements"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <button
          onClick={() => setCurrentIndex((prev) => (prev - 1 + messages.length) % messages.length)}
          className="p-1 hover:text-[#C7A66A] transition-colors rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C7A66A]"
          aria-label="Previous announcement"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <div className="text-center truncate px-2 tracking-wide font-sans">
          <span>{messages[currentIndex]}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % messages.length)}
            className="p-1 hover:text-[#C7A66A] transition-colors rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C7A66A]"
            aria-label="Next announcement"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 hover:text-[#C7A66A] transition-colors rounded ml-1"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
