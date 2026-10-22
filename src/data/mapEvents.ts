export type EventType = 'kpop' | 'studio' | 'festival' | 'workshop';

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

export const mapEvents: MapEvent[] = [
  {
    id: 1,
    title: 'ODI Showcase Night',
    type: 'kpop',
    city: 'Seoul',
    country: 'Korea',
    date: 'Nov 15, 2026',
    lat: 37.5665,
    lng: 126.978,
    major: true,
    description: 'Exclusive K-pop showcase featuring ODI LABS artists and special guests.',
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
    type: 'festival',
    city: 'Tokyo',
    country: 'Japan',
    date: 'Dec 1, 2026',
    lat: 35.6762,
    lng: 139.6503,
    major: true,
    description: 'A full-day festival spotlighting emerging electronic and hip-hop talent.',
  },
  {
    id: 4,
    title: 'Vocal Workshop',
    type: 'workshop',
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
    type: 'studio',
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
    type: 'kpop',
    city: 'Los Angeles',
    country: 'USA',
    date: 'Jan 10, 2027',
    lat: 34.0522,
    lng: -118.2437,
    major: true,
    description: 'Large-scale K-pop concert at a premier LA venue.',
  },
  {
    id: 7,
    title: 'Mixing Masterclass',
    type: 'workshop',
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
    title: 'Night Market Festival',
    type: 'festival',
    city: 'Bangkok',
    country: 'Thailand',
    date: 'Jan 25, 2027',
    lat: 13.7563,
    lng: 100.5018,
    major: false,
    description: 'Outdoor festival blending music, food, and street culture.',
  },
];

export const allCountries = Array.from(new Set(mapEvents.map((e) => e.country))).sort();
export const allTypes: { value: EventType; label: string }[] = [
  { value: 'kpop', label: 'K-pop' },
  { value: 'studio', label: 'Studio' },
  { value: 'festival', label: 'Festival' },
  { value: 'workshop', label: 'Workshop' },
];
