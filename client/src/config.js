// Company details shown across the site. Override any value at build time with REACT_APP_* env vars.
const env = process.env;

const phone = env.REACT_APP_PHONE || '1800 123 4567';

export const SITE = {
  name: 'ShiftEase Movers',
  phone,
  phoneHref: `tel:${(env.REACT_APP_PHONE_E164 || phone).replace(/[^\d+]/g, '')}`,
  phoneNote: 'Toll free · 7 AM – 10 PM, all days',
  email: env.REACT_APP_EMAIL || 'hello@shiftease.in',
  // Digits only incl. country code, e.g. 919876543210. The WhatsApp button is hidden when empty.
  whatsapp: env.REACT_APP_WHATSAPP || '',
  address: {
    line1: '4th Floor, 80 Feet Road',
    line2: 'Koramangala, Bengaluru 560034',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=80+Feet+Road+Koramangala+Bengaluru+560034',
  },
  hours: '7 AM – 10 PM, all days',
  // Shown on receipts only when set.
  gstin: env.REACT_APP_GSTIN || '',
  // Social icons are shown only for the profiles that are set.
  social: {
    facebook: env.REACT_APP_FACEBOOK_URL || '',
    instagram: env.REACT_APP_INSTAGRAM_URL || '',
    linkedin: env.REACT_APP_LINKEDIN_URL || '',
  },
  founded: 2011,
};

export const whatsappHref = (text = 'Hi ShiftEase, I need help with a move.') =>
  SITE.whatsapp ? `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}` : '';
