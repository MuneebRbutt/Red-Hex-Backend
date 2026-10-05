export const SITE = {
  name: 'Tanaura Leather & Safety Gloves',
  phone: '+92 322 2993833',
  phoneHref: 'tel:+923222993833',
  email: '',
  address: {
    line1: '1234 Industrial Ave.',
    line2: 'Lahore, PK 54000',
    full: '1234 Industrial Ave., Lahore, PK 54000',
  },
  whatsapp: {
    number: '923222993833',
    href: 'https://wa.me/923222993833',
  },
  social: {
    twitter: '#',
    facebook: '#',
    instagram: '#',
    tiktok: '#',
    youtube: '#',
  },
  ceo: {
    name: 'Zain Arif',
    title: 'Founder & CEO',
    quote:
      'Every collection we produce is a statement — not just of craftsmanship, but of the belief that every detail matters, from the first stitch to the final fit.',
    image:
      'https://placehold.co/800x1000/111111/333333?text=CEO+PORTRAIT',
  },
} as const;

export const INQUIRY_TYPES = [
  'General',
  'Sample Request',
  'Bulk Order',
  'Custom Design',
] as const;

export type InquiryType = (typeof INQUIRY_TYPES)[number];
