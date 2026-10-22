import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, SlidersHorizontal, X, MapPin, Calendar, Map as MapIcon, Check, Bookmark, CheckCircle2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mapEvents, allCountries, allTypes, type MapEvent, type EventType } from '@/data/mapEvents';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface MapPageProps {
  onBack: () => void;
}

const typeLabels: Record<EventType, string> = {
  kpop: 'K-pop',
  studio: 'Studio',
  festival: 'Festival',
  workshop: 'Workshop',
};

function createPinIcon(major: boolean): L.DivIcon {
  const size = major ? 22 : 16;
  const ringColor = major ? '#3B82F6' : '#666666';
  const bgColor = major ? '#0A0A0A' : '#333333';
  return L.divIcon({
    className: 'odi-map-pin',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${bgColor};border:2px solid ${ringColor};
      box-shadow:0 0 ${major ? '16px' : '8px'} ${major ? 'rgba(59,130,246,0.5)' : 'rgba(0,0,0,0.4)'};
      transition:transform 0.2s;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

interface EventStatus {
  saved: boolean;
  visited: boolean;
}

export default function MapPage({ onBack }: MapPageProps) {
  const { user } = useAuth();
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<Set<string>>(new Set(allCountries));
  const [selectedTypes, setSelectedTypes] = useState<Set<EventType>>(new Set(allTypes.map((t) => t.value)));
  const [pendingCountries, setPendingCountries] = useState<Set<string>>(new Set(allCountries));
  const [pendingTypes, setPendingTypes] = useState<Set<EventType>>(new Set(allTypes.map((t) => t.value)));
  const [selectedEvent, setSelectedEvent] = useState<MapEvent | null>(null);
  const [statusMap, setStatusMap] = useState<Record<number, EventStatus>>({});

  const loadStatuses = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('event_user_status')
      .select('event_id, saved, visited')
      .eq('user_id', user.id);
    if (data) {
      const map: Record<number, EventStatus> = {};
      for (const row of data) {
        map[row.event_id] = { saved: row.saved, visited: row.visited };
      }
      setStatusMap(map);
    }
  }, [user]);

  useEffect(() => {
    loadStatuses();
  }, [loadStatuses]);

  const toggleStatus = async (eventId: number, field: 'saved' | 'visited') => {
    if (!user) return;
    const current = statusMap[eventId] ?? { saved: false, visited: false };
    const newValue = !current[field];
    setStatusMap((prev) => ({
      ...prev,
      [eventId]: { ...current, [field]: newValue },
    }));

    const { error } = await supabase
      .from('event_user_status')
      .upsert({ user_id: user.id, event_id: eventId, [field]: newValue });
    if (error) {
      setStatusMap((prev) => ({
        ...prev,
        [eventId]: { ...current, [field]: !newValue },
      }));
    }
  };

  const filteredEvents = mapEvents.filter(
    (e) => selectedCountries.has(e.country) && selectedTypes.has(e.type)
  );

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = L.map(containerRef.current, {
      center: [40, 60],
      zoom: 2,
      zoomControl: false,
      attributionControl: false,
      worldCopyJump: true,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapRef.current = map;

    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    filteredEvents.forEach((event) => {
      const marker = L.marker([event.lat, event.lng], { icon: createPinIcon(event.major) });
      marker.bindTooltip(event.title, {
        permanent: false,
        direction: 'top',
        offset: [0, -12],
        className: 'odi-map-tooltip',
      });
      marker.on('click', () => {
        setSelectedEvent(event);
        map.flyTo([event.lat, event.lng], 14, { duration: 1.5 });

        const onMoveEnd = () => {
          map.panBy([0, 170], { animate: true, duration: 0.5 });
          map.off('moveend', onMoveEnd);
        };
        map.on('moveend', onMoveEnd);
      });
      marker.addTo(map);
      markersRef.current.push(marker);
    });

    map.invalidateSize();
  }, [filteredEvents]);

  const togglePendingCountry = (country: string) => {
    setPendingCountries((prev) => {
      const next = new Set(prev);
      if (next.has(country)) next.delete(country);
      else next.add(country);
      return next;
    });
  };

  const togglePendingType = (type: EventType) => {
    setPendingTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const openFilters = () => {
    setPendingCountries(new Set(selectedCountries));
    setPendingTypes(new Set(selectedTypes));
    setFiltersOpen(true);
  };

  const applyFilters = () => {
    setSelectedCountries(new Set(pendingCountries));
    setSelectedTypes(new Set(pendingTypes));
    setFiltersOpen(false);
  };

  const activeFilterCount =
    (allCountries.length - selectedCountries.size) + (allTypes.length - selectedTypes.size);

  return (
    <div className="fixed inset-0 bg-[#0A0A0A]">
      {/* Map container */}
      <div ref={containerRef} className="absolute inset-0 h-full w-full" style={{ background: '#0A0A0A', minHeight: '100%' }} />

      {/* Top overlay */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-[1000]">
        <div className="pointer-events-auto flex items-center justify-between px-6 pt-8 sm:px-10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
            Back
          </button>

          <div className="flex items-center gap-4">
            <h1 className="font-anton text-3xl uppercase leading-none text-white sm:text-4xl">MAP</h1>
          </div>

          <button
            onClick={openFilters}
            className="relative flex items-center gap-2 rounded-full bg-[#3B82F6] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#2563EB] hover:shadow-lg hover:shadow-[#3B82F6]/30"
          >
            <SlidersHorizontal size={15} strokeWidth={2} />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[10px] font-bold text-[#3B82F6]">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Leaflet zoom control + pin overrides */}
      <style>{`
        .leaflet-container { background: #0A0A0A !important; }
        .leaflet-tile-pane {
          filter: invert(1) hue-rotate(180deg) brightness(0.7) contrast(1.2);
        }
        .leaflet-control-zoom a {
          background: #1A1A1A !important;
          color: #888888 !important;
          border: 1px solid #222222 !important;
          border-radius: 8px !important;
        }
        .leaflet-control-zoom a:hover {
          color: #3B82F6 !important;
          border-color: #3B82F6 !important;
        }
        .leaflet-control-zoom { margin-bottom: 100px !important; margin-right: 16px !important; box-shadow: none !important; }
        .odi-map-pin { background: transparent !important; border: none !important; }
        .leaflet-marker-icon { transition: transform 0.2s ease; }
        .leaflet-marker-icon:hover { transform: scale(1.3); z-index: 1000 !important; }
        .leaflet-control-attribution {
          background: rgba(10,10,10,0.7) !important;
          color: #444444 !important;
          font-size: 9px !important;
        }
        .leaflet-control-attribution a { color: #555555 !important; }
        .odi-map-tooltip {
          background: #0A0A0A !important;
          color: #FFFFFF !important;
          border: 1px solid #222222 !important;
          border-radius: 8px !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 12px !important;
          padding: 6px 12px !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.5) !important;
        }
        .odi-map-tooltip::before { display: none !important; }
      `}</style>

      {/* Filter panel */}
      {filtersOpen && (
        <div className="absolute inset-0 z-[1100] flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-t-3xl border border-[#222222] bg-[#1A1A1A] px-6 pb-10 pt-6 animate-fade-up">
            <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-[#333333]" />

            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-anton text-xl uppercase text-white">Filters</h2>
              <button
                onClick={() => setFiltersOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#888888] transition-colors hover:text-white"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Countries */}
            <div className="mb-6">
              <p className="mb-3 text-xs uppercase tracking-wider text-[#555555]">Countries</p>
              <div className="flex flex-wrap gap-2">
                {allCountries.map((country) => {
                  const active = pendingCountries.has(country);
                  return (
                    <button
                      key={country}
                      onClick={() => togglePendingCountry(country)}
                      className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
                        active
                          ? 'border border-[#3B82F6] bg-[#3B82F6]/10 text-white'
                          : 'border border-[#222222] bg-[#111111] text-[#888888]'
                      }`}
                    >
                      {active && <Check size={13} strokeWidth={2.5} className="text-[#3B82F6]" />}
                      {country}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Types */}
            <div className="mb-8">
              <p className="mb-3 text-xs uppercase tracking-wider text-[#555555]">Event Types</p>
              <div className="flex flex-wrap gap-2">
                {allTypes.map((type) => {
                  const active = pendingTypes.has(type.value);
                  return (
                    <button
                      key={type.value}
                      onClick={() => togglePendingType(type.value)}
                      className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
                        active
                          ? 'border border-[#3B82F6] bg-[#3B82F6]/10 text-white'
                          : 'border border-[#222222] bg-[#111111] text-[#888888]'
                      }`}
                    >
                      {active && <Check size={13} strokeWidth={2.5} className="text-[#3B82F6]" />}
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Apply */}
            <button
              onClick={applyFilters}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#3B82F6] py-4 text-sm font-semibold text-white transition-all hover:bg-[#2563EB]"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Event bottom sheet */}
      {selectedEvent && (
        <div className="absolute inset-0 z-[1050] flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedEvent(null)}
          />
          <div className="relative w-full max-w-md rounded-t-3xl border border-[#222222] bg-[#1A1A1A] px-6 pb-10 pt-6 animate-fade-up">
            <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-[#333333]" />

            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-[#888888] transition-colors hover:text-white"
            >
              <X size={18} strokeWidth={1.5} />
            </button>

            <div className="mb-2 flex items-center gap-2">
              <span
                className={`flex h-2 w-2 rounded-full ${selectedEvent.major ? 'bg-[#3B82F6]' : 'bg-[#666666]'}`}
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#3B82F6]">
                {typeLabels[selectedEvent.type]}
              </span>
            </div>

            <h2 className="font-anton text-2xl uppercase leading-tight text-white">
              {selectedEvent.title}
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-[#888888]">
              {selectedEvent.description}
            </p>

            <div className="mt-5 flex items-center gap-4 text-sm text-[#888888]">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} strokeWidth={1.5} className="text-[#555555]" />
                {selectedEvent.date}
              </span>
              <span className="flex items-center gap-1.5">
                <MapIcon size={14} strokeWidth={1.5} className="text-[#555555]" />
                {selectedEvent.city}, {selectedEvent.country}
              </span>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => toggleStatus(selectedEvent.id, 'saved')}
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-all ${
                  statusMap[selectedEvent.id]?.saved
                    ? 'border-[#3B82F6] bg-[#3B82F6]/10 text-[#3B82F6]'
                    : 'border-[#222222] bg-[#111111] text-[#888888] hover:text-white'
                }`}
                aria-label="Save event"
              >
                <Bookmark
                  size={18}
                  strokeWidth={1.75}
                  fill={statusMap[selectedEvent.id]?.saved ? 'currentColor' : 'none'}
                />
              </button>
              <button
                onClick={() => toggleStatus(selectedEvent.id, 'visited')}
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-all ${
                  statusMap[selectedEvent.id]?.visited
                    ? 'border-[#3B82F6] bg-[#3B82F6]/10 text-[#3B82F6]'
                    : 'border-[#222222] bg-[#111111] text-[#888888] hover:text-white'
                }`}
                aria-label="Mark as visited"
              >
                <CheckCircle2
                  size={18}
                  strokeWidth={1.75}
                  fill={statusMap[selectedEvent.id]?.visited ? 'currentColor' : 'none'}
                />
              </button>
              <button className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#3B82F6] py-4 text-sm font-semibold text-white transition-all hover:bg-[#2563EB] hover:shadow-lg hover:shadow-[#3B82F6]/30">
                Join Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom navigation */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[1000] pb-6">
        <div className="flex justify-center">
          <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-black/5 bg-white p-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)] animate-float">
            <button className="flex items-center gap-2 rounded-full px-4 py-2.5 text-[#0A0A0A] hover:bg-gray-100" aria-label="Home">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300">Home</span>
            </button>
            <button className="flex items-center gap-2 rounded-full px-4 py-2.5 text-[#0A0A0A] hover:bg-gray-100" aria-label="Cloud">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19a4.5 4.5 0 1 0 0-9h-1.8A7 7 0 1 0 4 15.3"/></svg>
              <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300">Cloud</span>
            </button>
            <button className="flex items-center gap-2 rounded-full px-4 py-2.5 text-[#0A0A0A] hover:bg-gray-100" aria-label="Notes">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
              <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300">Notes</span>
            </button>
            <button className="flex items-center gap-2 rounded-full bg-[#0A0A0A] px-4 py-2.5 text-white" aria-label="Map">
              <MapPin size={20} strokeWidth={1.75} />
              <span className="max-w-[80px] overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300">Map</span>
            </button>
          </div>
          <button
            className="pointer-events-auto ml-3 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#0A0A0A] shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all hover:scale-105 animate-float"
            style={{ animationDelay: '0.5s' }}
            aria-label="Profile"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
