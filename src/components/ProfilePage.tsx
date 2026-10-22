import { ArrowLeft, ShieldAlert, LogOut, Mail, User as UserIcon, Pencil } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ProfilePageProps {
  onBack: () => void;
  onAdminPanel: () => void;
  onEditProfile: () => void;
}

export default function ProfilePage({ onBack, onAdminPanel, onEditProfile }: ProfilePageProps) {
  const { profile, isAdmin, signOut } = useAuth();

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

        <div className="flex flex-col items-center text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[#222222] bg-[#141414]">
            <span className="font-anton text-3xl uppercase text-white">
              {profile?.name?.charAt(0) ?? '?'}
            </span>
          </div>

          <h1 className="mt-5 font-anton text-3xl uppercase text-white">
            {profile?.name ?? 'User'}
          </h1>

          {isAdmin && (
            <span className="mt-2 flex items-center gap-1.5 rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-3 py-1 text-xs font-medium text-[#3B82F6]">
              <ShieldAlert size={12} strokeWidth={1.5} />
              Administrator
            </span>
          )}

          <div className="mt-8 w-full space-y-4">
            <div className="flex items-center gap-3 rounded-2xl border border-[#222222] bg-[#141414] px-5 py-4">
              <UserIcon size={18} className="text-[#888888]" strokeWidth={1.5} />
              <div className="text-left">
                <p className="text-xs uppercase tracking-wider text-[#555555]">Name</p>
                <p className="text-sm text-white">{profile?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-[#222222] bg-[#141414] px-5 py-4">
              <Mail size={18} className="text-[#888888]" strokeWidth={1.5} />
              <div className="text-left">
                <p className="text-xs uppercase tracking-wider text-[#555555]">Email</p>
                <p className="text-sm text-white">{profile?.email}</p>
              </div>
            </div>
          </div>

          <button
            onClick={onEditProfile}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-[#333333] py-4 text-sm font-medium text-[#888888] transition-colors hover:border-[#555555] hover:text-white"
          >
            <Pencil size={16} strokeWidth={1.75} />
            Edit Profile
          </button>

          {isAdmin && (
            <button
              onClick={onAdminPanel}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#3B82F6] py-4 text-sm font-semibold text-white transition-all hover:bg-[#2563EB] hover:shadow-lg hover:shadow-[#3B82F6]/30"
            >
              <ShieldAlert size={18} strokeWidth={1.75} />
              Admin Panel
            </button>
          )}

          <button
            onClick={signOut}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-[#333333] py-4 text-sm font-medium text-[#888888] transition-colors hover:border-[#555555] hover:text-white"
          >
            <LogOut size={18} strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
