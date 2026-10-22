import { ArrowLeft } from 'lucide-react';

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
        <p className="mt-3 text-sm text-[#888888]">Manage your preferences.</p>

        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-[#222222] bg-[#141414] px-5 py-4">
            <div>
              <p className="text-sm font-medium text-white">Notifications</p>
              <p className="mt-0.5 text-xs text-[#888888]">Get updates about new releases</p>
            </div>
            <span className="text-xs text-[#555555]">Coming soon</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-[#222222] bg-[#141414] px-5 py-4">
            <div>
              <p className="text-sm font-medium text-white">Theme</p>
              <p className="mt-0.5 text-xs text-[#888888]">Appearance preference</p>
            </div>
            <span className="text-xs text-[#555555]">Dark</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-[#222222] bg-[#141414] px-5 py-4">
            <div>
              <p className="text-sm font-medium text-white">Language</p>
              <p className="mt-0.5 text-xs text-[#888888]">Display language</p>
            </div>
            <span className="text-xs text-[#555555]">English</span>
          </div>
        </div>
      </div>
    </div>
  );
}
