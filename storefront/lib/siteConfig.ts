export const SITE = {
  name: 'RED HEX INDUSTRIES',
  phone: '+92 311 4903270',
  phoneHref: 'tel:+923114903270',
  email: 'info@zeynindustry.com',
  address: {
    line1: '1234 Industrial Ave.',
    line2: 'Lahore, PK 54000',
    full: '1234 Industrial Ave., Lahore, PK 54000',
  },
  whatsapp: {
    number: '923114903270',
    href: 'https://wa.me/923114903270',
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
      'Every collection we produce is a statement — not just of craftsmanship, but of the belief that what you wear defines how you perform.',
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
