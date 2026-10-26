import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, Cloud, Upload, Pencil, X, Star, Play, Pause, Plus,
  Music2, Share2, Clock, Save,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface CloudPageProps {
  onBack: () => void;
}

type TrackStatus = 'demo' | 'master' | 'released';

interface Track {
  id: string;
  user_id: string;
  title: string;
  artist: string;
  bpm: number | null;
  key_signature: string | null;
  status: TrackStatus;
  starred: boolean;
  lyrics: string | null;
  cover_url: string | null;
  audio_url: string | null;
  duration: number | null;
  created_at: string;
}

interface TrackNote {
  id: string;
  track_id: string;
  timecode: number;
  text: string;
  created_at: string;
}

type FilterTab = 'all' | 'demo' | 'master' | 'released' | 'radar';

const filterTabs: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'demo', label: 'Demos' },
  { id: 'master', label: 'Masters' },
  { id: 'released', label: 'Released' },
  { id: 'radar', label: 'Release Radar' },
];

const statusLabels: Record<TrackStatus, string> = {
  demo: 'Demo',
  master: 'Master',
  released: 'Released',
};

const statusColors: Record<TrackStatus, string> = {
  demo: 'text-[#888888] bg-[#1A1A1A] border-[#333333]',
  master: 'text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/30',
  released: 'text-white bg-[#3B82F6] border-[#3B82F6]',
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function CloudPage({ onBack }: CloudPageProps) {
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [trackNotes, setTrackNotes] = useState<Record<string, TrackNote[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [editForm, setEditForm] = useState({ title: '', artist: '', bpm: '', key_signature: '', status: 'demo' as TrackStatus });
  const [savingEdit, setSavingEdit] = useState(false);
  const [noteInputFor, setNoteInputFor] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [lyricsFor, setLyricsFor] = useState<string | null>(null);
  const [lyricsText, setLyricsText] = useState('');
  const [shareLink, setShareLink] = useState<string | null>(null);

  const loadTracks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('tracks')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setTracks(data as Track[]);
    setLoading(false);
  }, [user]);

  const loadTrackNotes = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('track_notes')
      .select('*')
      .order('timecode', { ascending: true });
    if (data) {
      const map: Record<string, TrackNote[]> = {};
      for (const note of data as TrackNote[]) {
        if (!map[note.track_id]) map[note.track_id] = [];
        map[note.track_id].push(note);
      }
      setTrackNotes(map);
    }
  }, [user]);

  useEffect(() => {
    loadTracks();
    loadTrackNotes();
  }, [loadTracks, loadTrackNotes]);

  const filteredTracks = tracks.filter((t) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'radar') return t.starred;
    return t.status === activeFilter;
  });

  const togglePlay = (track: Track) => {
    if (!audioRef.current) return;
    if (playingId === track.id) {
      audioRef.current.pause();
      setPlayingId(null);
    } else {
      if (track.audio_url) {
        audioRef.current.src = track.audio_url;
        audioRef.current.play();
        setPlayingId(track.id);
      } else {
        setPlayingId(track.id);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const seekTo = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      if (audioRef.current.paused) {
        audioRef.current.play();
      }
    }
  };

  const toggleStar = async (track: Track) => {
    const newVal = !track.starred;
    setTracks((prev) => prev.map((t) => (t.id === track.id ? { ...t, starred: newVal } : t)));
    await supabase.from('tracks').update({ starred: newVal }).eq('id', track.id);
  };

  const openEditModal = (track: Track) => {
    setEditingTrack(track);
    setEditForm({
      title: track.title,
      artist: track.artist,
      bpm: track.bpm?.toString() ?? '',
      key_signature: track.key_signature ?? '',
      status: track.status,
    });
  };

  const saveEdit = async () => {
    if (!editingTrack) return;
    setSavingEdit(true);
    const updates = {
      title: editForm.title,
      artist: editForm.artist,
      bpm: editForm.bpm ? parseInt(editForm.bpm) : null,
      key_signature: editForm.key_signature || null,
      status: editForm.status,
    };
    const { data } = await supabase
      .from('tracks')
      .update(updates)
      .eq('id', editingTrack.id)
      .select()
      .single();
    if (data) {
      setTracks((prev) => prev.map((t) => (t.id === editingTrack.id ? (data as Track) : t)));
    }
    setSavingEdit(false);
    setEditingTrack(null);
  };

  const addNote = async (trackId: string) => {
    if (!noteText.trim() || !audioRef.current) return;
    const tc = Math.floor(audioRef.current.currentTime);
    const { data } = await supabase
      .from('track_notes')
      .insert({ track_id: trackId, timecode: tc, text: noteText.trim() })
      .select()
      .single();
    if (data) {
      const newNote = data as TrackNote;
      setTrackNotes((prev) => ({
        ...prev,
        [trackId]: [...(prev[trackId] ?? []), newNote].sort((a, b) => a.timecode - b.timecode),
      }));
    }
    setNoteText('');
    setNoteInputFor(null);
  };

  const deleteNote = async (trackId: string, noteId: string) => {
    await supabase.from('track_notes').delete().eq('id', noteId);
    setTrackNotes((prev) => ({
      ...prev,
      [trackId]: (prev[trackId] ?? []).filter((n) => n.id !== noteId),
    }));
  };

  const openLyrics = (track: Track) => {
    setLyricsFor(track.id);
    setLyricsText(track.lyrics ?? '');
  };

  const saveLyrics = async () => {
    if (!lyricsFor) return;
    await supabase.from('tracks').update({ lyrics: lyricsText }).eq('id', lyricsFor);
    setTracks((prev) => prev.map((t) => (t.id === lyricsFor ? { ...t, lyrics: lyricsText } : t)));
    setLyricsFor(null);
  };

  const shareTrack = (track: Track) => {
    const link = `${window.location.origin}?track=${track.id}`;
    setShareLink(link);
    navigator.clipboard.writeText(link).catch(() => {});
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] px-6 pb-28 pt-8 sm:px-10">
      <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onEnded={() => setPlayingId(null)} />

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

        {loading ? (
          <div className="mt-24 flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-[24px] border border-[#222222] bg-[#141414]">
              <Cloud size={32} className="text-[#555555]" strokeWidth={1.5} />
            </div>
            <p className="mt-6 text-sm text-[#888888]">Loading your tracks...</p>
          </div>
        ) : tracks.length === 0 ? (
          <div className="mt-24 flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-[24px] border border-[#222222] bg-[#141414]">
              <Cloud size={32} className="text-[#555555]" strokeWidth={1.5} />
            </div>
            <p className="mt-6 font-anton text-xl uppercase text-white">Your sound archive is empty</p>
            <p className="mt-2 text-sm text-[#888888]">Upload your first track to get started.</p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="mt-8 flex flex-wrap gap-2">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    activeFilter === tab.id
                      ? 'bg-[#3B82F6] text-white'
                      : 'border border-[#222222] bg-[#111111] text-[#888888] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Track list */}
            <div className="mt-6 space-y-3">
              {filteredTracks.length === 0 ? (
                <p className="py-16 text-center text-sm text-[#888888]">No tracks in this category.</p>
              ) : (
                filteredTracks.map((track) => {
                  const notes = trackNotes[track.id] ?? [];
                  const isPlaying = playingId === track.id;
                  return (
                    <div
                      key={track.id}
                      className="rounded-2xl border border-[#222222] bg-[#141414] p-5 transition-colors hover:border-[#333333]"
                    >
                      <div className="flex items-start gap-4">
                        {/* Cover / Play button */}
                        <div className="relative shrink-0">
                          {track.cover_url ? (
                            <img
                              src={track.cover_url}
                              alt={track.title}
                              className="h-16 w-16 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-[#222222] bg-[#0A0A0A]">
                              <Music2 size={22} className="text-[#555555]" strokeWidth={1.5} />
                            </div>
                          )}
                          <button
                            onClick={() => togglePlay(track)}
                            className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 opacity-0 transition-opacity hover:opacity-100"
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                          >
                            {isPlaying ? (
                              <Pause size={20} className="text-white" fill="white" />
                            ) : (
                              <Play size={20} className="text-white" fill="white" />
                            )}
                          </button>
                        </div>

                        {/* Track info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate font-anton text-lg uppercase text-white">
                              {track.title}
                            </h3>
                            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusColors[track.status]}`}>
                              {statusLabels[track.status]}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate text-sm text-[#888888]">{track.artist}</p>
                          <div className="mt-1.5 flex items-center gap-3 text-xs text-[#555555]">
                            {track.bpm && <span>{track.bpm} BPM</span>}
                            {track.key_signature && <span>Key: {track.key_signature}</span>}
                            {track.duration && <span>{formatTime(track.duration)}</span>}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex shrink-0 items-center gap-1.5">
                          <button
                            onClick={() => toggleStar(track)}
                            className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all ${
                              track.starred
                                ? 'border-[#3B82F6] bg-[#3B82F6]/10 text-[#3B82F6]'
                                : 'border-[#222222] bg-[#111111] text-[#888888] hover:text-white'
                            }`}
                            aria-label="Star track"
                          >
                            <Star size={16} strokeWidth={1.75} fill={track.starred ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            onClick={() => openEditModal(track)}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#222222] bg-[#111111] text-[#888888] transition-all hover:text-white"
                            aria-label="Edit track"
                          >
                            <Pencil size={15} strokeWidth={1.75} />
                          </button>
                          <button
                            onClick={() => shareTrack(track)}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#222222] bg-[#111111] text-[#888888] transition-all hover:text-white"
                            aria-label="Share track"
                          >
                            <Share2 size={15} strokeWidth={1.75} />
                          </button>
                        </div>
                      </div>

                      {/* Player bar + actions */}
                      <div className="mt-4 flex items-center gap-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#222222]">
                          <div
                            className="h-full rounded-full bg-[#3B82F6] transition-all"
                            style={{ width: isPlaying && track.duration ? `${(currentTime / track.duration) * 100}%` : '0%' }}
                          />
                        </div>
                        <span className="text-xs tabular-nums text-[#555555]">
                          {isPlaying ? formatTime(currentTime) : '0:00'}
                        </span>
                      </div>

                      {/* Secondary actions row */}
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => setNoteInputFor(noteInputFor === track.id ? null : track.id)}
                          className="flex items-center gap-1.5 rounded-full border border-[#222222] bg-[#111111] px-3 py-2 text-xs font-medium text-[#888888] transition-all hover:text-white"
                        >
                          <Plus size={13} strokeWidth={2} />
                          Note
                        </button>
                        <button
                          onClick={() => openLyrics(track)}
                          className="flex items-center gap-1.5 rounded-full border border-[#222222] bg-[#111111] px-3 py-2 text-xs font-medium text-[#888888] transition-all hover:text-white"
                        >
                          <Music2 size={13} strokeWidth={2} />
                          Lyrics/Notes
                        </button>
                      </div>

                      {/* Note input */}
                      {noteInputFor === track.id && (
                        <div className="mt-3 flex items-center gap-2">
                          <span className="flex items-center gap-1 text-xs font-semibold text-[#3B82F6]">
                            <Clock size={12} strokeWidth={2} />
                            {formatTime(currentTime)}
                          </span>
                          <input
                            type="text"
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') addNote(track.id);
                              if (e.key === 'Escape') { setNoteInputFor(null); setNoteText(''); }
                            }}
                            placeholder="Add a note at this timecode..."
                            autoFocus
                            className="flex-1 rounded-lg border border-[#222222] bg-[#0A0A0A] px-3 py-2 text-sm text-white placeholder:text-[#444444] focus:border-[#3B82F6] focus:outline-none"
                          />
                          <button
                            onClick={() => addNote(track.id)}
                            className="rounded-lg bg-[#3B82F6] px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-[#2563EB]"
                          >
                            Add
                          </button>
                        </div>
                      )}

                      {/* Timecoded notes list */}
                      {notes.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          {notes.map((note) => (
                            <div
                              key={note.id}
                              className="flex items-center gap-2 rounded-lg border border-[#222222] bg-[#0A0A0A] px-3 py-2"
                            >
                              <button
                                onClick={() => seekTo(note.timecode)}
                                className="shrink-0 rounded bg-[#3B82F6]/10 px-2 py-0.5 text-xs font-semibold text-[#3B82F6] transition-colors hover:bg-[#3B82F6]/20"
                              >
                                {formatTime(note.timecode)}
                              </button>
                              <span className="min-w-0 flex-1 truncate text-sm text-[#999999]">{note.text}</span>
                              <button
                                onClick={() => deleteNote(track.id, note.id)}
                                className="shrink-0 text-[#555555] transition-colors hover:text-white"
                                aria-label="Delete note"
                              >
                                <X size={13} strokeWidth={1.75} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      {/* Edit modal */}
      {editingTrack && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setEditingTrack(null)}
          />
          <div className="relative w-full max-w-md rounded-3xl border border-[#222222] bg-[#1A1A1A] p-6 animate-fade-up">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-anton text-xl uppercase text-white">Edit Track</h2>
              <button
                onClick={() => setEditingTrack(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#888888] transition-colors hover:text-white"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-[#555555]">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full rounded-xl border border-[#222222] bg-[#0A0A0A] px-4 py-3 text-sm text-white placeholder:text-[#444444] focus:border-[#3B82F6] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-[#555555]">Artist</label>
                <input
                  type="text"
                  value={editForm.artist}
                  onChange={(e) => setEditForm({ ...editForm, artist: e.target.value })}
                  className="w-full rounded-xl border border-[#222222] bg-[#0A0A0A] px-4 py-3 text-sm text-white placeholder:text-[#444444] focus:border-[#3B82F6] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-wider text-[#555555]">BPM</label>
                  <input
                    type="number"
                    value={editForm.bpm}
                    onChange={(e) => setEditForm({ ...editForm, bpm: e.target.value })}
                    className="w-full rounded-xl border border-[#222222] bg-[#0A0A0A] px-4 py-3 text-sm text-white placeholder:text-[#444444] focus:border-[#3B82F6] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-wider text-[#555555]">Key</label>
                  <input
                    type="text"
                    value={editForm.key_signature}
                    onChange={(e) => setEditForm({ ...editForm, key_signature: e.target.value })}
                    placeholder="e.g. C minor"
                    className="w-full rounded-xl border border-[#222222] bg-[#0A0A0A] px-4 py-3 text-sm text-white placeholder:text-[#444444] focus:border-[#3B82F6] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-[#555555]">Status</label>
                <div className="flex gap-2">
                  {(['demo', 'master', 'released'] as TrackStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setEditForm({ ...editForm, status: s })}
                      className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                        editForm.status === s
                          ? 'border-[#3B82F6] bg-[#3B82F6]/10 text-white'
                          : 'border-[#222222] bg-[#111111] text-[#888888]'
                      }`}
                    >
                      {statusLabels[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={saveEdit}
              disabled={savingEdit}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#3B82F6] py-4 text-sm font-semibold text-white transition-all hover:bg-[#2563EB] disabled:opacity-50"
            >
              <Save size={16} strokeWidth={2} />
              {savingEdit ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Lyrics modal */}
      {lyricsFor && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setLyricsFor(null)}
          />
          <div className="relative w-full max-w-md rounded-3xl border border-[#222222] bg-[#1A1A1A] p-6 animate-fade-up">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-anton text-xl uppercase text-white">Lyrics / Notes</h2>
              <button
                onClick={() => setLyricsFor(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#888888] transition-colors hover:text-white"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            <textarea
              value={lyricsText}
              onChange={(e) => setLyricsText(e.target.value)}
              rows={10}
              placeholder="Write lyrics or notes for this track..."
              className="w-full rounded-xl border border-[#222222] bg-[#0A0A0A] px-4 py-3 text-sm leading-relaxed text-white placeholder:text-[#444444] focus:border-[#3B82F6] focus:outline-none"
            />
            <button
              onClick={saveLyrics}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#3B82F6] py-4 text-sm font-semibold text-white transition-all hover:bg-[#2563EB]"
            >
              <Save size={16} strokeWidth={2} />
              Save
            </button>
          </div>
        </div>
      )}

      {/* Share toast */}
      {shareLink && (
        <div className="fixed bottom-24 left-1/2 z-[2000] -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-full border border-[#222222] bg-[#1A1A1A] px-5 py-3 shadow-xl">
            <Share2 size={16} className="text-[#3B82F6]" strokeWidth={2} />
            <span className="text-sm text-white">Link copied to clipboard</span>
            <button
              onClick={() => setShareLink(null)}
              className="text-[#888888] transition-colors hover:text-white"
            >
              <X size={16} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
