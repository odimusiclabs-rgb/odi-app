import { Home, Cloud, Music2, Map, User } from 'lucide-react';

export type NavId = 'home' | 'cloud' | 'notes' | 'map';

interface BottomNavProps {
  active: NavId;
  onNavigate: (id: NavId) => void;
  onProfileClick: () => void;
  profileActive?: boolean;
}

const navItems: { id: NavId; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'cloud', label: 'Cloud', icon: Cloud },
  { id: 'notes', label: 'Notes', icon: Music2 },
  { id: 'map', label: 'Map', icon: Map },
];

export default function BottomNav({
  active,
  onNavigate,
  onProfileClick,
  profileActive,
}: BottomNavProps) {
  return (
    <nav className="pointer-events-none fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-black/5 bg-white p-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)] animate-float">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`group flex items-center gap-2 rounded-full px-4 py-2.5 transition-all ${
                isActive
                  ? 'bg-[#0A0A0A] text-white'
                  : 'text-[#0A0A0A] hover:bg-gray-100'
              }`}
              aria-label={item.label}
            >
              <Icon size={20} strokeWidth={1.75} />
              <span
                className={`max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300 group-hover:max-w-[80px] ${
                  isActive ? 'max-w-[80px]' : ''
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={onProfileClick}
        className={`pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all hover:scale-105 animate-float ${
          profileActive
            ? 'bg-[#3B82F6] text-white'
            : 'bg-white text-[#0A0A0A]'
        }`}
        style={{ animationDelay: '0.5s' }}
        aria-label="Profile"
      >
        <User size={20} strokeWidth={1.75} />
      </button>
    </nav>
  );
}
