export interface Artist {
  id: number;
  name: string;
  role: string;
  cover: string;
}

export const artists: Artist[] = [
  {
    id: 1,
    name: 'JET',
    role: 'Producer',
    cover: '/images/IMG_0004.jpeg',
  },
  {
    id: 2,
    name: 'GA-EUL',
    role: 'Vocalist',
    cover:
      'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&h=800&w=600',
  },
  {
    id: 3,
    name: 'KAIRO',
    role: 'DJ',
    cover:
      'https://images.pexels.com/photos/1758144/pexels-photo-1758144.jpeg?auto=compress&cs=tinysrgb&h=800&w=600',
  },
];

export interface Partner {
  id: number;
  name: string;
  subtitle: string;
}

export const partners: Partner[] = [
  { id: 1, name: 'Location', subtitle: 'Tokyo' },
  { id: 2, name: 'Studio', subtitle: 'Seoul' },
  { id: 3, name: 'Label', subtitle: 'Bangkok' },
];
