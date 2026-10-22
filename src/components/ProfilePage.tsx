import { useEffect, useState, useCallback } from 'react';
import {
  ArrowLeft,
  Pencil,
  ShieldAlert,
  LogOut,
  Loader2,
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export type RequestStatus = 'pending' | 'approved' | 'resolved' | 'rejected';
export type RequestType = 'event' | 'support' | 'artist' | 'profile_edit';

export interface UserRequest {
  id: string;
  type: RequestType;
  title: string;
  description: string;
  status: RequestStatus;
  target_view: string | null;
  created_at: string;
}

interface ProfilePageProps {
  onBack: () => void;
  onAdminPanel: () => void;
  onNavigate: (view: string) => void;
  onSignOut: () => void;
}

const statusConfig: Record<
  RequestStatus,
  { label: string; color: string; bg: string; border: string; icon: typeof Clock }
> = {
  pending: {
    label: 'PENDING',
    color: '#888888',
    bg: 'rgba(136,136,136,0.1)',
    border: 'rgba(136,136,136,0.3)',
    icon: Clock,
  },
  approved: {
    label: 'APPROVED',
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.1)',
    border: 'rgba(59,130,246,0.3)',
    icon: CheckCircle2,
  },
  resolved: {
    label: 'RESOLVED',
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.1)',
    border: 'rgba(34,197,94,0.3)',
    icon: CheckCircle2,
  },
  rejected: {
    label: 'REJECTED',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.3)',
    icon: XCircle,
  },
};

const typeConfig: Record<RequestType, { label: string; icon: typeof AlertCircle }> = {
  event: { label: 'Event', icon: AlertCircle },
  support: { label: 'Support', icon: AlertCircle },
  artist: { label: 'Artist', icon: AlertCircle },
  profile_edit: { label: 'Profile Edit', icon: AlertCircle },
};

export default function ProfilePage({
  onBack,
  onAdminPanel,
  onNavigate,
  onSignOut,
}: ProfilePageProps) {
  const { profile, isAdmin, user } = useAuth();
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!user) return;
    setLoadingRequests(true);

    const { data, error } = await supabase
      .from('user_requests')
      .select('id, type, title, description, status, target_view, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load requests:', error.message);
      setRequests([]);
    } else {
      setRequests((data ?? []) as UserRequest[]);
    }
    setLoadingRequests(false);
  }, [user]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    if (profile?.id) {
      supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', profile.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.avatar_url) setAvatarUrl(data.avatar_url);
        });
    }
  }, [profile?.id]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  const handleRequestClick = (req: UserRequest) => {
    if (req.status === 'approved' || req.status === 'resolved') {
      showToast('Changes are now live on this page!');
      if (req.target_view) {
        setTimeout(() => onNavigate(req.target_view!), 1500);
      }
    } else if (req.target_view) {
      onNavigate(req.target_view);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const username = profile?.email?.split('@')[0] ?? 'user';
  const initial = profile?.name?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-32">
      {/* Header banner */}
      <div className="relative h-56 w-full overflow-hidden sm:h-64">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.85) 80%, #0A0A0A 100%), url('https://images.pexels.com/photos/8716401/pexels-photo-8716401.jpeg?auto=compress&cs=tinysrgb&h=600&w=1200')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/40 to-transparent" />

        <div className="relative z-10 flex items-center justify-between px-6 pt-8 sm:px-10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
            Back
          </button>

          <button
            onClick={() => onNavigate('edit-profile')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 backdrop-blur-sm transition-all hover:border-white/20 hover:text-white"
            aria-label="Edit profile"
          >
            <Pencil size={15} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Avatar + name section */}
      <div className="relative z-10 -mt-16 px-6 sm:px-10">
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-col items-center text-center">
            <div className="h-28 w-28 overflow-hidden rounded-full border-2 border-[#3B82F6] bg-[#141414] shadow-[0_0_30px_rgba(59,130,246,0.25)]">
              {avatarUrl ? (
                <img src={avatarUrl} alt={profile?.name ?? 'Avatar'} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="font-anton text-4xl uppercase text-white">{initial}</span>
                </div>
              )}
            </div>

            <h1 className="mt-5 font-anton text-3xl uppercase leading-tight text-white sm:text-4xl">
              {profile?.name ?? 'User'}
            </h1>

            <p className="mt-1 text-sm font-medium text-[#3B82F6]">@{username}</p>

            {/* Stats row */}
            <div className="mt-6 flex items-center divide-x divide-[#222222]">
              <div className="flex flex-col items-center px-5">
                <span className="font-anton text-xl text-white">0</span>
                <span className="mt-0.5 text-[10px] uppercase tracking-wider text-[#555555]">Bonuses</span>
              </div>
              <div className="flex flex-col items-center px-5">
                <span className="font-anton text-xl text-white">0</span>
                <span className="mt-0.5 text-[10px] uppercase tracking-wider text-[#555555]">Following</span>
              </div>
              <div className="flex flex-col items-center px-5">
                <span className="font-anton text-xl text-white">0</span>
                <span className="mt-0.5 text-[10px] uppercase tracking-wider text-[#555555]">Followers</span>
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={onAdminPanel}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#3B82F6] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#2563EB] hover:shadow-lg hover:shadow-[#3B82F6]/30"
              >
                <ShieldAlert size={16} strokeWidth={1.75} />
                Admin Panel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* My Requests section */}
      <div className="mt-12 px-6 sm:px-10">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between">
            <h2 className="font-anton text-2xl uppercase text-white">My Requests</h2>
            {requests.length > 0 && (
              <span className="text-xs text-[#555555]">{requests.length} total</span>
            )}
          </div>

          {loadingRequests ? (
            <div className="mt-8 flex justify-center">
              <Loader2 size={24} className="animate-spin text-[#888888]" />
            </div>
          ) : requests.length === 0 ? (
            <div className="mt-8 flex flex-col items-center justify-center rounded-3xl border border-[#1a1a1a] bg-[#111111] px-6 py-16 text-center">
              <Inbox size={32} className="text-[#333333]" strokeWidth={1.5} />
              <p className="mt-4 text-sm text-[#888888]">No requests yet.</p>
              <p className="mt-1 text-xs text-[#555555]">
                Submit a request from any section to see it here.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {requests.map((req) => {
                const status = statusConfig[req.status];
    const type = typeConfig[req.type];
    const StatusIcon = status.icon;
    const TypeIcon = type.icon;
    const isLive = req.status === 'approved' || req.status === 'resolved';

                return (
                  <button
                    key={req.id}
                    onClick={() => handleRequestClick(req)}
                    className="group flex w-full items-center gap-4 rounded-2xl border border-[#222222] bg-[#1A1A1A] px-5 py-4 text-left transition-all hover:border-[#333333] hover:bg-[#222222]"
                  >
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: status.bg, border: `1px solid ${status.border}` }}
                    >
                      <TypeIcon size={18} style={{ color: status.color }} strokeWidth={1.5} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-white">{req.title}</p>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-[#888888]">{req.description}</p>
                      <div className="mt-2 flex items-center gap-3">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
                          style={{
                            color: status.color,
                            backgroundColor: status.bg,
                            border: `1px solid ${status.border}`,
                          }}
                        >
                          <StatusIcon size={11} strokeWidth={2} />
                          {status.label}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-[#555555]">
                          {type.label}
                        </span>
                        <span className="text-[10px] text-[#444444]">{formatDate(req.created_at)}</span>
                      </div>
                    </div>

                    <ChevronRight
                      size={18}
                      className={`shrink-0 transition-colors ${
                        isLive ? 'text-[#3B82F6]' : 'text-[#333333] group-hover:text-[#555555]'
                      }`}
                      strokeWidth={1.5}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sign out */}
      <div className="mt-12 px-6 sm:px-10">
        <div className="mx-auto max-w-2xl">
          <button
            onClick={onSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-[#333333] py-4 text-sm font-medium text-[#888888] transition-colors hover:border-[#555555] hover:text-white"
          >
            <LogOut size={16} strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-28 left-1/2 z-50 -translate-x-1/2 animate-fade-up">
          <div className="flex items-center gap-3 rounded-2xl border border-[#22C55E]/30 bg-[#0A0A0A]/95 px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md">
            <CheckCircle2 size={20} className="text-[#22C55E]" strokeWidth={2} />
            <span className="text-sm font-medium text-white">{toast}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-[#555555] transition-colors hover:text-white"
              aria-label="Dismiss"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
