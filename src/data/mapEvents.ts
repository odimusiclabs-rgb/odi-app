import { Mic, Headphones, Camera, Users, Star, BookOpen, type LucideIcon } from 'lucide-react';

export type EventType = 'perform' | 'studio' | 'shoot' | 'collab' | 'event' | 'learn';

export interface MapEvent {
  id: number;
  title: string;
  type: EventType;
  city: string;
  country: string;
  date: string;
  lat: number;
  lng: number;
  major: boolean;
  description: string;
}

export const typeConfig: Record<EventType, { label: string; icon: LucideIcon }> = {
  perform: { label: 'Perform', icon: Mic },
  studio: { label: 'Studio', icon: Headphones },
  shoot: { label: 'Shoot', icon: Camera },
  collab: { label: 'Collab', icon: Users },
  event: { label: 'Event', icon: Star },
  learn: { label: 'Learn', icon: BookOpen },
};

export const mapEvents: MapEvent[] = [
  {
    id: 1,
    title: 'ODI Showcase Night',
    type: 'perform',
    city: 'Seoul',
    country: 'Korea',
    date: 'Nov 15, 2026',
    lat: 37.5665,
    lng: 126.978,
    major: true,
    description: 'Exclusive performance showcase featuring ODI LABS artists and special guests.',
  },
  {
    id: 2,
    title: 'Studio Session Vol. 3',
    type: 'studio',
    city: 'Moscow',
    country: 'Russia',
    date: 'Nov 22, 2026',
    lat: 55.7558,
    lng: 37.6173,
    major: true,
    description: 'Open recording studio session with live production and mixing.',
  },
  {
    id: 3,
    title: 'Underground Beats',
    type: 'event',
    city: 'Tokyo',
    country: 'Japan',
    date: 'Dec 1, 2026',
    lat: 35.6762,
    lng: 139.6503,
    major: true,
    description: 'A full-day event spotlighting emerging electronic and hip-hop talent.',
  },
  {
    id: 4,
    title: 'Vocal Workshop',
    type: 'learn',
    city: 'Busan',
    country: 'Korea',
    date: 'Dec 8, 2026',
    lat: 35.1796,
    lng: 129.0756,
    major: false,
    description: 'Hands-on vocal training workshop led by industry professionals.',
  },
  {
    id: 5,
    title: 'Producer Meetup',
    type: 'collab',
    city: 'Saint Petersburg',
    country: 'Russia',
    date: 'Dec 14, 2026',
    lat: 59.9311,
    lng: 30.3609,
    major: false,
    description: 'Networking and beat-making session for local producers.',
  },
  {
    id: 6,
    title: 'ODI Arena Live',
    type: 'perform',
    city: 'Los Angeles',
    country: 'USA',
    date: 'Jan 10, 2027',
    lat: 34.0522,
    lng: -118.2437,
    major: true,
    description: 'Large-scale live performance at a premier LA venue.',
  },
  {
    id: 7,
    title: 'Mixing Masterclass',
    type: 'learn',
    city: 'Berlin',
    country: 'Germany',
    date: 'Jan 18, 2027',
    lat: 52.52,
    lng: 13.405,
    major: false,
    description: 'Advanced mixing techniques masterclass with certified engineers.',
  },
  {
    id: 8,
    title: 'Music Video Shoot',
    type: 'shoot',
    city: 'Bangkok',
    country: 'Thailand',
    date: 'Jan 25, 2027',
    lat: 13.7563,
    lng: 100.5018,
    major: false,
    description: 'Professional music video shoot with full production crew.',
  },
];

export const allCountries = Array.from(new Set(mapEvents.map((e) => e.country))).sort();
export const allTypes: { value: EventType; label: string; icon: LucideIcon }[] = (
  Object.entries(typeConfig) as [EventType, { label: string; icon: LucideIcon }][]
).map(([value, cfg]) => ({ value, label: cfg.label, icon: cfg.icon }));
