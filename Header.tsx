import { ArrowLeft, Play } from 'lucide-react';
import { artists } from '@/data/artists';

interface ArtistsPageProps {
  onBack: () => void;
}

export default function ArtistsPage({ onBack }: ArtistsPageProps) {
  return (
    <div className="relative min-h-screen bg-[#0A0A0A] px-6 pb-28 pt-8 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={onBack}
          className="mb-10 flex items-center gap-2 text-sm text-[#888888] transition-colors hover:text-white"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
          Back
        </button>

        <h1 className="font-anton text-5xl uppercase leading-none text-white sm:text-6xl">
          Artists
        </h1>
        <p className="mt-3 text-sm text-[#888888]">Discover the sound of ODI LABS.</p>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {artists.map((artist, index) => (
            <div
              key={artist.id}
              className="group animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-[24px] border border-[#222222]">
                <img
                  src={artist.cover}
                  alt={artist.name}
                  className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h2 className="font-anton text-3xl uppercase text-white">{artist.name}</h2>
                  <button className="mt-4 flex items-center gap-2 rounded-full bg-[#3B82F6] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#2563EB]">
                    <Play size={14} fill="white" strokeWidth={0} />
                    Listen
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
