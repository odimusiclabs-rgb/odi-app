import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { ArrowLeft, Loader2, Check, Camera } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface EditProfilePageProps {
  onBack: () => void;
}

export default function EditProfilePage({ onBack }: EditProfilePageProps) {
  const { profile, user } = useAuth();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(profile?.name ?? '');
    setBio(profile?.bio ?? '');
    setAvatarUrl(profile?.avatar_url ?? null);
  }, [profile]);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2 MB.');
      return;
    }
    setAvatarFile(file);
    setAvatarUrl(URL.createObjectURL(file));
    setError(null);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let finalAvatarUrl = profile?.avatar_url ?? null;

      if (avatarFile) {
        const filePath = `${user.id}/avatar-${Date.now()}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        finalAvatarUrl = urlData.publicUrl;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ name: name.trim(), bio: bio.trim() || null, avatar_url: finalAvatarUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onBack();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const initial = name.charAt(0).toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-32">
      {/* Header */}
      <div className="px-6 pt-8 sm:px-10">
        <div className="mx-auto max-w-md">
          <button
            onClick={onBack}
            className="mb-10 flex items-center gap-2 text-sm text-[#888888] transition-colors hover:text-white"
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
            Back to Profile
          </button>

          <h1 className="font-anton text-2xl uppercase text-white">Edit Profile</h1>
        </div>
      </div>

      {/* Form */}
      <div className="mt-10 px-6 sm:px-10">
        <div className="mx-auto max-w-md space-y-8">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="h-28 w-28 overflow-hidden rounded-full border-2 border-[#3B82F6] bg-[#141414] shadow-[0_0_30px_rgba(59,130,246,0.25)]">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="font-anton text-4xl uppercase text-white">{initial}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border border-[#222222] bg-[#1A1A1A] text-[#888888] transition-all hover:border-[#3B82F6] hover:text-[#3B82F6]"
                aria-label="Change avatar"
              >
                <Camera size={16} strokeWidth={1.5} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <p className="mt-3 text-xs text-[#555555]">Tap the camera icon to upload</p>
          </div>

          {/* Name */}
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wider text-[#555555]">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              placeholder="Your name"
              className="w-full rounded-xl border border-[#222222] bg-[#111111] px-4 py-3.5 text-sm text-white placeholder:text-[#444444] transition-colors focus:border-[#3B82F6] focus:outline-none"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wider text-[#555555]">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
              rows={4}
              placeholder="Tell people about yourself..."
              className="w-full resize-none rounded-xl border border-[#222222] bg-[#111111] px-4 py-3.5 text-sm text-white placeholder:text-[#444444] transition-colors focus:border-[#3B82F6] focus:outline-none"
            />
            <p className="mt-1.5 text-right text-[10px] text-[#444444]">{bio.length}/200</p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-3 text-sm text-[#EF4444]">
              {error}
            </div>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#3B82F6] py-4 text-sm font-semibold text-white transition-all hover:bg-[#2563EB] disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Check size={16} strokeWidth={2} />
                Saved!
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
