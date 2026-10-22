import { useRef, useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { artists, partners } from '@/data/artists';
import { supabase } from '@/lib/supabase';

const ROSTER_WIDTH = 280;
const ROSTER_HEIGHT = 350;

export default function RosterSection() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<number>(artists[0].id);
  const [jetImage, setJetImage] = useState(artists[0].cover);

  useEffect(() => {
    let mounted = true;

    supabase
      .from('site_content')
      .select('jet_image_url')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }) => {
        if (mounted && data?.jet_image_url) setJetImage(data.jet_image_url);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const handler = () => {
      const cards = Array.from(el.querySelectorAll('[data-artist-id]')) as HTMLElement[];
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
      const id = Number(closest.dataset.artistId);
      if (id) setActiveId(id);
    };
    el.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => el.removeEventListener('scroll', handler);
  }, []);

  const handleCardClick = (id: number) => {
    const el = scrollerRef.current;
    const card = el?.querySelector(`[data-artist-id="${id}"]`) as HTMLElement;
    if (card && el) {
      el.scrollTo({
        left: card.offsetLeft - el.clientWidth / 2 + card.offsetWidth / 2,
        behavior: 'smooth',
      });
    }
  };

  return (
    <>
      {/* THE ROSTER */}
      <section className="px-6 sm:px-10" style={{ marginTop: '60px' }}>
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-anton text-xl uppercase tracking-wide text-white">
            The Roster
          </h2>
          <span className="text-xs text-[#555555]">Swipe to explore</span>
        </div>

        <div
          ref={scrollerRef}
          className="no-scrollbar snap-carousel flex items-stretch gap-5 overflow-x-auto overscroll-x-contain pb-4 touch-pan-x"
        >
          <div className="shrink-0" style={{ width: 'calc(50vw - 150px)' }} />

          {artists.map((artist) => {
            const displayArtist = artist.id === 1 ? { ...artist, cover: jetImage } : artist;
            const isActive = artist.id === activeId;
            return (
              <div
                key={artist.id}
                data-artist-id={artist.id}
                onClick={() => handleCardClick(artist.id)}
                className="snap-item group relative shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-[#3B82F6] transition-all duration-500 ease-out"
                style={{
                  width: ROSTER_WIDTH,
                  height: ROSTER_HEIGHT,
                  transform: isActive ? 'scale(1.03)' : 'scale(1)',
                  boxShadow: isActive
                    ? '0 0 36px rgba(59,130,246,0.35), 0 0 0 1px rgba(59,130,246,0.6)'
                    : '0 0 0 1px rgba(59,130,246,0.18)',
                }}
              >
                {/* Black & white photo */}
                <div className="absolute inset-0 overflow-hidden bg-[#111111]">
                  <img
                    src={displayArtist.cover}
                    alt={artist.name}
                    className="h-full w-full object-cover grayscale transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>

                {/* Bottom black overlay */}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black px-5 py-5">
                  <div className="flex flex-col">
                    <span className="font-anton text-2xl uppercase leading-tight text-white">
                      {artist.name}
                    </span>
                    <span className="mt-0.5 text-xs font-medium text-[#3B82F6]">
                      {artist.role}
                    </span>
                  </div>
                  <button
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#3B82F6] text-white shadow-lg transition-all hover:scale-110 hover:bg-[#2563EB]"
                    aria-label={`Play ${artist.name}`}
                  >
                    <Play size={18} fill="white" strokeWidth={0} />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="shrink-0" style={{ width: 'calc(50vw - 150px)' }} />
        </div>
      </section>

      {/* PARTNERS */}
      <section
        className="mb-[80px] px-6 pb-[120px] pt-10 sm:px-10"
        style={{ marginTop: '40px' }}
      >
        <h2 className="mb-4 font-anton text-lg uppercase tracking-[0.2em] text-[#D4D4D4]">
          Partners
        </h2>

        <div className="no-scrollbar flex items-center gap-3 overflow-x-auto overscroll-x-contain pb-2 touch-pan-x">
          {partners.map((p) => (
            <div
              key={p.id}
              className="flex shrink-0 items-center gap-3 rounded-full bg-white px-5 py-3 shadow-[0_0_18px_rgba(59,130,246,0.28)]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0A0A0A] text-xs font-bold text-white">
                {p.name.charAt(0)}
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-[#0A0A0A]">{p.name}</span>
                <span className="text-xs text-[#888888]">{p.subtitle}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
