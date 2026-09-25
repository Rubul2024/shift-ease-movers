import React from 'react';
import Icon from './Icon';
import { SITE, whatsappHref } from '../config';

/** Always-visible call / WhatsApp buttons on phones, where most moving leads come from. */
export default function FloatingContact() {
  const wa = whatsappHref();
  return (
    <div className="fab-wrap">
      {wa && (
        <a href={wa} target="_blank" rel="noopener noreferrer" className="fab fab-wa" aria-label="Chat on WhatsApp">
          <Icon name="whatsapp" size={24} />
        </a>
      )}
      <a href={SITE.phoneHref} className="fab" aria-label={`Call ${SITE.phone}`}>
        <Icon name="phone" size={22} />
      </a>
    </div>
  );
}
