import { LogIn, User as UserIcon, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  onSignIn: () => void;
  onProfile: () => void;
  onOpenMenu: () => void;
}

export default function Header({ onSignIn, onProfile, onOpenMenu }: HeaderProps) {
  const { user, profile } = useAuth();

  return (
    <header className="relative z-30 flex items-center justify-between px-6 py-6 sm:px-10 sm:py-7">
      <div className="font-anton text-2xl uppercase tracking-wide text-white select-none">
        ODI<span className="text-[#3B82F6]"> </span>LABS
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <button
            onClick={onProfile}
            className="flex items-center gap-2.5 rounded-full border border-[#222222] bg-[#141414] py-1.5 pl-1.5 pr-4 transition-all hover:border-[#333333]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3B82F6] text-sm font-semibold text-white">
              {profile?.name?.charAt(0).toUpperCase() ?? <UserIcon size={16} />}
            </span>
            <span className="text-sm font-medium text-white">{profile?.name ?? 'Profile'}</span>
          </button>
        ) : (
          <button
            onClick={onSignIn}
            className="group flex items-center gap-2 rounded-full bg-[#3B82F6] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#2563EB] hover:shadow-lg hover:shadow-[#3B82F6]/30"
          >
            <LogIn size={16} strokeWidth={2} className="transition-transform group-hover:translate-x-0.5" />
            Sign In
          </button>
        )}

        <button
          onClick={onOpenMenu}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#222222] bg-[#141414] text-[#888888] transition-all hover:border-[#333333] hover:text-white"
          aria-label="Open menu"
        >
          <Menu size={18} strokeWidth={1.75} />
        </button>
      </div>
    </header>
  );
}
