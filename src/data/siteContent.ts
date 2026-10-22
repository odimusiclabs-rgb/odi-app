export interface SiteContent {
  id: number;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string;
  jet_image_url: string;
  updated_at: string;
}

export const defaultSiteContent: SiteContent = {
  id: 1,
  hero_title: 'DISCOVER THE SOUND',
  hero_subtitle: 'Studio without walls',
  hero_image_url:
    'https://images.pexels.com/photos/19330423/pexels-photo-19330423.jpeg?auto=compress&cs=tinysrgb&h=1200&w=800',
  jet_image_url: '/images/IMG_0004.jpeg',
  updated_at: '',
};
