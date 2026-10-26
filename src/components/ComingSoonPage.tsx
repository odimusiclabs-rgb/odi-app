import { ArrowLeft } from 'lucide-react';

interface ComingSoonPageProps {
  title: string;
  onBack: () => void;
}

export default function ComingSoonPage({ title, onBack }: ComingSoonPageProps) {
  return (
    <div className="relative min-h-screen bg-[#0A0A0A] px-6 pb-28 pt-8 sm:px-10">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={onBack}
          className="mb-10 flex items-center gap-2 text-sm text-[#888888] transition-colors hover:text-white"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
          Back
        </button>

        <h1 className="font-anton text-5xl uppercase leading-none text-white sm:text-6xl">
          {title}
        </h1>

        <div className="mt-20 flex flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-[24px] border border-[#222222] bg-[#141414]">
            <span className="font-anton text-3xl uppercase text-[#3B82F6]">?</span>
          </div>
          <p className="mt-6 font-anton text-xl uppercase text-white">Coming Soon</p>
          <p className="mt-2 text-sm text-[#888888]">We're working on this section. Stay tuned.</p>
        </div>
      </div>
    </div>
  );
}
