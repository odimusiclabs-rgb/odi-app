import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';

interface SettingsPageProps {
  onBack: () => void;
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] px-6 py-8 sm:px-10">
      <div className="mx-auto max-w-md">
        <button
          onClick={onBack}
          className="mb-10 flex items-center gap-2 text-sm text-[#888888] transition-colors hover:text-white"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
          Back
        </button>

        <h1 className="font-anton text-4xl uppercase text-white sm:text-5xl">Settings</h1>

        <div className="mt-16 flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-[24px] border border-[#222222] bg-[#141414]">
            <SettingsIcon size={32} className="text-[#555555]" strokeWidth={1.5} />
          </div>
          <p className="mt-6 font-anton text-xl uppercase text-white">Settings coming soon</p>
          <p className="mt-2 text-sm text-[#888888]">We're working on it.</p>
        </div>
      </div>
    </div>
  );
}
