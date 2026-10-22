import { ArrowLeft, Cloud, Upload } from 'lucide-react';

interface CloudPageProps {
  onBack: () => void;
}

export default function CloudPage({ onBack }: CloudPageProps) {
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

        <div className="flex items-end justify-between">
          <h1 className="font-anton text-5xl uppercase leading-none text-white sm:text-6xl">
            Cloud
          </h1>
          <button className="mb-1 flex items-center gap-2 rounded-full bg-[#3B82F6] px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-[#2563EB] hover:shadow-lg hover:shadow-[#3B82F6]/30">
            <Upload size={16} strokeWidth={2} />
            Upload Track
          </button>
        </div>

        <div className="mt-24 flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-[24px] border border-[#222222] bg-[#141414]">
            <Cloud size={32} className="text-[#555555]" strokeWidth={1.5} />
          </div>
          <p className="mt-6 font-anton text-xl uppercase text-white">Your sound archive is empty</p>
          <p className="mt-2 text-sm text-[#888888]">Upload your first track to get started.</p>
        </div>
      </div>
    </div>
  );
}
