import { ArrowLeft, MapPin } from 'lucide-react';

interface MapPageProps {
  onBack: () => void;
}

export default function MapPage({ onBack }: MapPageProps) {
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
          Map
        </h1>

        {/* Map placeholder */}
        <div className="mt-8 flex h-[60vh] items-center justify-center rounded-[32px] border border-[#222222] bg-[#141414]">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#3B82F6]/10 text-[#3B82F6]">
              <MapPin size={28} strokeWidth={1.5} />
            </div>
            <p className="mt-5 font-anton text-xl uppercase text-white">Map is loading...</p>
            <p className="mt-2 text-sm text-[#888888]">Discover artists and studios near you.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
