import React from 'react';
import { Link } from 'react-router-dom';
import { useTitle, PageHeader } from '../components/ui';
import { SITE } from '../config';

const UPDATED = '25 September 2026';

function LegalPage({ title, crumb, intro, sections }) {
  return (
    <>
      <PageHeader crumb={`Home / ${crumb}`} title={title} subtitle={`Last updated: ${UPDATED}`} />
      <section className="section">
        <div className="container prose">
          <p>{intro}</p>
          {sections.map(([heading, ...paras]) => (
            <React.Fragment key={heading}>
              <h2>{heading}</h2>
              {paras.map((p, i) => (Array.isArray(p) ? <ul key={i}>{p.map((li) => <li key={li}>{li}</li>)}</ul> : <p key={i}>{p}</p>))}
            </React.Fragment>
          ))}
          <h2>Contact us</h2>
          <p>
            {SITE.name}, {SITE.address.line1}, {SITE.address.line2}. Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or call{' '}
            <a href={SITE.phoneHref}>{SITE.phone}</a>. You can also reach us through our <Link to="/contact">contact form</Link>.
          </p>
        </div>
      </section>
    </>
  );
}

export function Privacy() {
  useTitle('Privacy Policy', 'How ShiftEase Movers collects, uses and protects your personal data.');
  return (
    <LegalPage
      title="Privacy Policy"
      crumb="Privacy Policy"
      intro={`This policy explains what personal data ${SITE.name} ("we", "us") collects when you use our website and services, why we collect it and the choices you have. We process personal data in line with the Digital Personal Data Protection Act, 2023 and other applicable Indian law.`}
      sections={[
        ['Information we collect', [
          'Account details: your name, email address, mobile number and a securely hashed password.',
          'Move details: pickup and drop areas and addresses, moving date and time slot, home size, floors, vehicle type and the extras you choose.',
          'Inquiries and quotes: the details and messages you send through our contact and quote forms.',
          'Newsletter: your email address if you subscribe.',
          'Technical data: IP address and basic request logs used for security and rate limiting.',
        ]],
        ['How we use your information', [
          'To give you quotes, confirm and carry out bookings, and send booking confirmations and status updates.',
          'To call or email you about your inquiry, quote or move.',
          'To send our newsletter, only if you subscribed. To unsubscribe, reply to any newsletter or contact us.',
          'To secure our services, prevent fraud and abuse, and meet legal, tax and accounting obligations.',
        ]],
        ['Sharing', 'We do not sell your personal data. We share it only with the crew and drivers assigned to your move, with service providers who help us run our business (such as hosting and email delivery) under confidentiality obligations, and with authorities where the law requires it.'],
        ['Cookies and local storage', 'We do not use advertising or tracking cookies. When you log in, your browser stores a session token in local storage so you stay signed in. Logging out removes it.'],
        ['Data retention', 'We keep booking records for as long as needed for accounting and legal purposes (generally up to 8 years). Inquiries and quotes that did not lead to a booking are deleted within 24 months. You can ask us to delete your account at any time.'],
        ['Security', 'Passwords are hashed and never stored in plain text. Data is sent over encrypted connections, and access to customer data is limited to staff who need it to serve you.'],
        ['Your rights', 'You can ask to access, correct or delete your personal data, withdraw consent for marketing, or raise a grievance. You can update your name and mobile number yourself under My Moves → Profile. For anything else, contact us using the details below and we will respond within 30 days.'],
        ['Changes to this policy', 'If we change this policy we will update the date at the top of this page. Significant changes will be communicated by email to registered customers.'],
      ]}
    />
  );
}

export function Terms() {
  useTitle('Terms of Service', 'Terms for using the ShiftEase Movers website and booking packers & movers services.');
  return (
    <LegalPage
      title="Terms of Service"
      crumb="Terms of Service"
      intro={`These terms apply when you use the ${SITE.name} website or book our packing and moving services. By creating an account, requesting a quote or making a booking you agree to them.`}
      sections={[
        ['Quotes and pricing', 'Online quotes are calculated from the details you enter (areas, home size, vehicle, floors, lift access and extras) and include 18% GST. The price is locked when you book. If the actual move differs from the booking, for example more goods, a larger vehicle or extra floors without a lift, we will tell you the revised price before loading, and you may cancel at no charge if you do not accept it.'],
        ['Bookings', 'A booking is confirmed when you receive a booking ID. You must give accurate addresses and contact details and make sure someone is present at pickup and delivery. Arrival is within the time slot you choose. Delays caused by traffic, weather, road restrictions or building access are not treated as a breach, but we will keep you informed.'],
        ['Payment', 'No advance payment is required to book online. The booking amount is payable on delivery by UPI, card, net-banking or cash. Additional services requested on the day are charged at our published rates.'],
        ['Cancellation', 'You can cancel free of charge from My Moves until the vehicle has picked up your goods. After pickup the booking cannot be cancelled online. We may cancel a booking if the area becomes unserviceable or the details are false. In that case no charge applies.'],
        ['Items we do not carry', [
          'Cash, jewellery, bullion, securities and important documents. Please keep these with you.',
          'Flammable, explosive, corrosive or hazardous goods, including filled gas cylinders.',
          'Perishable food, live animals and anything prohibited by law.',
        ]],
        ['Liability and insurance', 'We take reasonable care of your goods. Without transit insurance, our liability for loss or damage caused by our negligence is limited as provided under the Carriage by Road Act, 2007. With transit insurance, eligible claims are settled up to the declared value. Damage must be noted on the delivery day and a claim raised within 7 days. We are not liable for pre-existing damage, the internal working of electronic items not packed by us, or events beyond our control.'],
        ['Your account', 'Keep your password confidential. You are responsible for activity on your account. We may suspend accounts used for fraud or abuse.'],
        ['Governing law', 'These terms are governed by the laws of India. Courts in Bengaluru, Karnataka have exclusive jurisdiction.'],
      ]}
    />
  );
}
