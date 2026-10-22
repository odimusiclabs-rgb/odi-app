import { useRef, useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { releases, type Release } from '@/data/releases';

interface CarouselProps {
  onLockedAction: () => void;
}

const CARD_SIZE = 180;

export default function Carousel({ onLockedAction }: CarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<number>(releases[0].id);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const handler = () => {
      const cards = Array.from(el.children) as HTMLElement[];
      const center = el.scrollLeft + el.clientWidth / 2;
      let closest = cards[0];
      let minDist = Infinity;
      cards.forEach((card) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const dist = Math.abs(cardCenter - center);
        if (dist < minDist) {
          minDist = dist;
          closest = card;
        }
      });
      const id = Number(closest.dataset.id);
      if (id) setActiveId(id);
    };
    el.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => el.removeEventListener('scroll', handler);
  }, []);

  const handleCardClick = (release: Release) => {
    if (release.id === activeId) {
      onLockedAction();
    } else {
      const el = scrollerRef.current;
      const card = el?.querySelector(`[data-id="${release.id}"]`) as HTMLElement;
      if (card) {
        el?.scrollTo({
          left: card.offsetLeft - el.clientWidth / 2 + card.offsetWidth / 2,
          behavior: 'smooth',
        });
      }
    }
  };

  return (
    <section className="relative z-20 px-6 pb-4 pt-2 sm:px-10">
      <div className="mb-5 flex items-end justify-between">
        <h2 className="font-anton text-xl uppercase tracking-wide text-white">
          New Releases
        </h2>
        <span className="text-xs text-[#555555]">Swipe to explore</span>
      </div>

      <div
        ref={scrollerRef}
        className="no-scrollbar snap-carousel flex items-center gap-6 overflow-x-auto pb-4"
      >
        <div className="shrink-0" style={{ width: 'calc(50vw - 130px)' }} />

        {releases.map((release) => {
          const isActive = release.id === activeId;
          return (
            <div
              key={release.id}
              data-id={release.id}
              onClick={() => handleCardClick(release)}
              className="snap-item group flex shrink-0 cursor-pointer flex-col items-center"
              style={{ width: CARD_SIZE }}
              aria-label={`${release.title} by ${release.artist}`}
            >
              {/* Vinyl record */}
              <div
                className="relative transition-all duration-500 ease-out"
                style={{
                  width: isActive ? CARD_SIZE : CARD_SIZE - 28,
                  height: isActive ? CARD_SIZE : CARD_SIZE - 28,
                }}
              >
                {/* Outer ring — blue glow when active, grey otherwise */}
                <div
                  className={`absolute inset-0 rounded-full p-[3px] transition-all duration-500 ${
                    isActive
                      ? 'bg-[#3B82F6] shadow-[0_0_32px_rgba(59,130,246,0.45)]'
                      : 'bg-[#2a2a2a]'
                  }`}
                >
                  {/* Vinyl body */}
                  <div className="relative h-full w-full overflow-hidden rounded-full bg-[#111111]">
                    {/* Concentric grooves */}
                    <div className="absolute inset-0 rounded-full border border-[#1c1c1c]" />
                    <div className="absolute inset-[8px] rounded-full border border-[#1a1a1a]" />
                    <div className="absolute inset-[18px] rounded-full border border-[#1c1c1c]" />
                    <div className="absolute inset-[28px] rounded-full border border-[#1a1a1a]" />

                    {/* Center label — circular cover art */}
                    <div className="absolute inset-[38px] overflow-hidden rounded-full">
                      <img
                        src={release.cover}
                        alt={release.title}
                        className={`h-full w-full object-cover grayscale transition-transform duration-[6s] ease-out group-hover:scale-110 ${
                          isActive ? 'animate-spin-vinyl' : ''
                        }`}
                      />
                    </div>

                    {/* Center hole */}
                    <div className="absolute left-1/2 top-1/2 z-10 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0A0A0A]" />

                    {/* Play indicator on active vinyl */}
                    {isActive && (
                      <div className="absolute left-1/2 top-1/2 z-20 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#3B82F6] text-white shadow-lg animate-scale-in">
                        <Play size={14} fill="white" strokeWidth={0} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Text below */}
              <div className="mt-4 text-center">
                <p className="truncate font-anton text-base uppercase leading-tight text-white">
                  {release.title}
                </p>
                <p className="mt-0.5 truncate text-xs text-[#888888]">
                  {release.artist}
                </p>
              </div>
            </div>
          );
        })}

        <div className="shrink-0" style={{ width: 'calc(50vw - 130px)' }} />
      </div>
    </section>
  );
}
