import { ArrowLeft, Globe2, Star, Play } from 'lucide-react';

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

        {/* Global Artists */}
        <div className="mt-12">
          <div className="mb-5 flex items-center gap-3">
            <Globe2 size={22} className="text-[#3B82F6]" strokeWidth={1.75} />
            <h2 className="font-anton text-2xl uppercase text-white">Global Artists</h2>
          </div>
          <div className="flex flex-col items-center justify-center rounded-3xl border border-[#1a1a1a] bg-[#111111] px-6 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#222222] bg-[#141414]">
              <Globe2 size={28} className="text-[#555555]" strokeWidth={1.5} />
            </div>
            <p className="mt-5 font-anton text-lg uppercase text-white">Coming Soon</p>
            <p className="mt-2 text-sm text-[#888888]">Global artist roster is being curated.</p>
          </div>
        </div>

        {/* ODI A */}
        <div className="mt-10">
          <div className="mb-5 flex items-center gap-3">
            <Star size={22} className="text-[#3B82F6]" strokeWidth={1.75} />
            <h2 className="font-anton text-2xl uppercase text-white">ODI A</h2>
          </div>
          <div className="flex flex-col items-center justify-center rounded-3xl border border-[#1a1a1a] bg-[#111111] px-6 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#222222] bg-[#141414]">
              <Star size={28} className="text-[#555555]" strokeWidth={1.5} />
            </div>
            <p className="mt-5 font-anton text-lg uppercase text-white">Coming Soon</p>
            <p className="mt-2 text-sm text-[#888888]">ODI A artists will be revealed soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
