import { useEffect, useState, useCallback } from 'react';
import {
  ArrowLeft,
  Copy,
  Check,
  Trash2,
  Loader2,
  ShieldAlert,
  KeyRound,
  X,
  Save,
  ImagePlus,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth, type Profile } from '@/context/AuthContext';
import { defaultSiteContent, type SiteContent } from '@/data/siteContent';

interface AdminPanelProps {
  onBack: () => void;
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const { session } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [resetResult, setResetResult] = useState<{ email: string; password: string } | null>(null);
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [jetFile, setJetFile] = useState<File | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [savingContent, setSavingContent] = useState(false);
  const [contentSaved, setContentSaved] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? 'Failed to load users');
      setLoading(false);
      return;
    }

    setUsers(data.users as Profile[]);
    setLoading(false);
  }, [session]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    let mounted = true;

    supabase
      .from('site_content')
      .select('id, hero_title, hero_subtitle, hero_image_url, jet_image_url, updated_at')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }) => {
        if (mounted && data) setContent(data as SiteContent);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const uploadContentImage = async (file: File, kind: 'jet' | 'hero') => {
    if (!file.type.startsWith('image/') || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      throw new Error('Please choose a JPG, PNG, or WebP image.');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Images must be smaller than 5 MB.');
    }

    const extension = file.type.split('/')[1].replace('jpeg', 'jpg');
    const path = `${kind}-${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from('site-content').upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) throw error;

    return supabase.storage.from('site-content').getPublicUrl(path).data.publicUrl;
  };

  const handleSaveContent = async () => {
    setSavingContent(true);
    setError(null);
    setContentSaved(false);

    try {
      const jetImageUrl = jetFile ? await uploadContentImage(jetFile, 'jet') : content.jet_image_url;
      const heroImageUrl = heroFile ? await uploadContentImage(heroFile, 'hero') : content.hero_image_url;
      const { data, error: saveError } = await supabase
        .from('site_content')
        .update({
          hero_title: content.hero_title.trim(),
          hero_subtitle: content.hero_subtitle.trim(),
          hero_image_url: heroImageUrl,
          jet_image_url: jetImageUrl,
        })
        .eq('id', 1)
        .select('id, hero_title, hero_subtitle, hero_image_url, jet_image_url, updated_at')
        .maybeSingle();

      if (saveError || !data) throw saveError ?? new Error('Content was not saved.');
      setContent(data as SiteContent);
      setJetFile(null);
      setHeroFile(null);
      setContentSaved(true);
    } catch (cause) {
      console.error('content save failed', cause);
      const message = cause instanceof Error ? cause.message : '';
      setError(
        message === 'Please choose a JPG, PNG, or WebP image.' || message === 'Images must be smaller than 5 MB.'
          ? message
          : 'Could not save homepage content.'
      );
    } finally {
      setSavingContent(false);
    }
  };

  const handleCopy = async (text: string, fieldKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // clipboard not available
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!session) return;
    if (!window.confirm(`Delete user "${userName}"? This cannot be undone.`)) return;

    setDeletingId(userId);
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      }
    );

    const data = await response.json();
    setDeletingId(null);

    if (!response.ok) {
      setError(data.error ?? 'Failed to delete user');
      return;
    }

    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleResetPassword = async (userId: string) => {
    if (!session) return;
    if (!window.confirm('Generate a new temporary password for this user?')) return;

    setResettingId(userId);
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      }
    );

    const data = await response.json();
    setResettingId(null);

    if (!response.ok) {
      setError(data.error ?? 'Failed to reset password');
      return;
    }

    setResetResult({ email: data.email, password: data.tempPassword });
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-6 py-8 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-[#888888] transition-colors hover:text-white"
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
            Back
          </button>
          <span className="flex items-center gap-2 rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-3 py-1 text-xs font-medium text-[#3B82F6]">
            <ShieldAlert size={14} strokeWidth={1.5} />
            Admin
          </span>
        </div>

        <h1 className="font-anton text-4xl uppercase leading-tight text-white sm:text-5xl">
          User
          <br />
          Management
        </h1>
        <p className="mt-3 text-sm text-[#888888]">
          {users.length} registered {users.length === 1 ? 'user' : 'users'}
        </p>

        <section className="mt-10 rounded-3xl border border-[#222222] bg-[#111111] p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-anton text-2xl uppercase text-white">Content Manager</h2>
              <p className="mt-2 text-sm text-[#888888]">Edit the public homepage content.</p>
            </div>
            <ImagePlus size={22} className="text-[#3B82F6]" strokeWidth={1.5} />
          </div>

          <div className="mt-6 grid gap-5">
            <label className="grid gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-[#888888]">Hero Title</span>
              <input
                value={content.hero_title}
                onChange={(event) => setContent((prev) => ({ ...prev, hero_title: event.target.value }))}
                className="rounded-2xl border border-[#333333] bg-[#0A0A0A] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#3B82F6]"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-[#888888]">Hero Subtitle</span>
              <input
                value={content.hero_subtitle}
                onChange={(event) => setContent((prev) => ({ ...prev, hero_subtitle: event.target.value }))}
                className="rounded-2xl border border-[#333333] bg-[#0A0A0A] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#3B82F6]"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid cursor-pointer gap-2">
                <span className="text-xs font-medium uppercase tracking-wider text-[#888888]">JET Photo</span>
                <span className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-[#333333] bg-[#0A0A0A] px-4 text-center text-xs text-[#888888] transition-colors hover:border-[#3B82F6]">
                  {jetFile?.name ?? 'Choose an image'}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => setJetFile(event.target.files?.[0] ?? null)}
                  className="sr-only"
                />
              </label>

              <label className="grid cursor-pointer gap-2">
                <span className="text-xs font-medium uppercase tracking-wider text-[#888888]">Hero Photo</span>
                <span className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-[#333333] bg-[#0A0A0A] px-4 text-center text-xs text-[#888888] transition-colors hover:border-[#3B82F6]">
                  {heroFile?.name ?? 'Choose an image'}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => setHeroFile(event.target.files?.[0] ?? null)}
                  className="sr-only"
                />
              </label>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={handleSaveContent}
              disabled={savingContent || !content.hero_title.trim() || !content.hero_subtitle.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-[#3B82F6] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingContent ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save
            </button>
            {contentSaved && <span className="text-sm text-[#60A5FA]">Saved successfully</span>}
          </div>
        </section>

        {/* Password note */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#333333] bg-[#141414] px-5 py-4">
          <ShieldAlert size={18} className="mt-0.5 shrink-0 text-[#888888]" strokeWidth={1.5} />
          <p className="text-xs leading-relaxed text-[#888888]">
            Passwords are stored as one-way bcrypt hashes for security. The original
            plaintext cannot be recovered. The password column shows the hash status.
          </p>
        </div>

        {error && (
          <p className="mt-6 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        {loading ? (
          <div className="mt-12 flex justify-center">
            <Loader2 size={24} className="animate-spin text-[#888888]" />
          </div>
        ) : users.length === 0 ? (
          <p className="mt-12 text-center text-sm text-[#888888]">No users found.</p>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#222222] text-left">
                  <th className="py-3 pr-4 text-xs font-medium uppercase tracking-wider text-[#888888]">
                    Name
                  </th>
                  <th className="py-3 pr-4 text-xs font-medium uppercase tracking-wider text-[#888888]">
                    Email
                  </th>
                  <th className="py-3 pr-4 text-xs font-medium uppercase tracking-wider text-[#888888]">
                    Password
                  </th>
                  <th className="py-3 pr-4 text-xs font-medium uppercase tracking-wider text-[#888888]">
                    Registered
                  </th>
                  <th className="py-3 pr-2 text-right text-xs font-medium uppercase tracking-wider text-[#888888]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u.email === 'odimusic.office@gmail.com';
                  return (
                    <tr
                      key={u.id}
                      className="border-b border-[#1a1a1a] transition-colors hover:bg-[#111111]"
                    >
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{u.name}</span>
                          {u.role === 'admin' && (
                            <span className="rounded-full bg-[#3B82F6]/15 px-2 py-0.5 text-[10px] font-medium uppercase text-[#3B82F6]">
                              Admin
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#CCCCCC]">{u.email}</span>
                          <button
                            onClick={() => handleCopy(u.email, `email-${u.id}`)}
                            className="text-[#555555] transition-colors hover:text-[#3B82F6]"
                            aria-label="Copy email"
                          >
                            {copiedField === `email-${u.id}` ? (
                              <Check size={14} strokeWidth={2} />
                            ) : (
                              <Copy size={14} strokeWidth={1.5} />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-[#555555]">••••••••••</span>
                          <span className="text-[10px] uppercase text-[#444444]">hashed</span>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-sm text-[#888888]">
                        {formatDate(u.created_at)}
                      </td>
                      <td className="py-4 pr-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleResetPassword(u.id)}
                            disabled={isSelf || resettingId === u.id}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#333333] px-3 py-1.5 text-xs font-medium text-[#888888] transition-all hover:border-[#3B82F6]/50 hover:text-[#3B82F6] disabled:cursor-not-allowed disabled:opacity-30"
                            title={isSelf ? 'Cannot reset your own admin password here' : 'Reset password'}
                          >
                            {resettingId === u.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <KeyRound size={12} strokeWidth={1.5} />
                            )}
                            Reset
                          </button>
                          <button
                            onClick={() => handleDelete(u.id, u.name)}
                            disabled={isSelf || deletingId === u.id}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#333333] px-3 py-1.5 text-xs font-medium text-[#888888] transition-all hover:border-red-500/40 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                            title={isSelf ? 'Cannot delete your own admin account' : 'Delete user'}
                          >
                            {deletingId === u.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Trash2 size={12} strokeWidth={1.5} />
                            )}
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reset password result modal */}
      {resetResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade"
          onClick={() => setResetResult(null)}
        >
          <div
            className="relative w-[min(92vw,440px)] rounded-[32px] border border-[#222222] bg-[#141414] p-8 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setResetResult(null)}
              className="absolute right-5 top-5 text-[#888888] transition-colors hover:text-white"
              aria-label="Close"
            >
              <X size={20} strokeWidth={1.5} />
            </button>

            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#3B82F6]/15 text-[#3B82F6]">
              <KeyRound size={26} strokeWidth={1.5} />
            </div>

            <h2 className="font-anton text-2xl uppercase text-white">Password Reset</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#888888]">
              Temporary password for <span className="text-white">{resetResult.email}</span>.
              Share it with the user and ask them to change it after signing in.
            </p>

            <div className="mt-6 rounded-2xl border border-[#333333] bg-[#0A0A0A] px-5 py-4">
              <p className="text-xs uppercase tracking-wider text-[#555555]">New temporary password</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <code className="font-mono text-lg text-white">{resetResult.password}</code>
                <button
                  onClick={() => handleCopy(resetResult.password, 'temp-password')}
                  className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#3B82F6] px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-[#2563EB]"
                >
                  {copiedField === 'temp-password' ? (
                    <><Check size={14} strokeWidth={2} /> Copied</>
                  ) : (
                    <><Copy size={14} strokeWidth={1.5} /> Copy</>
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={() => setResetResult(null)}
              className="mt-6 w-full rounded-2xl border border-[#333333] py-3.5 text-sm font-medium text-[#888888] transition-colors hover:border-[#555555] hover:text-white"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
