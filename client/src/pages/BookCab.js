import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTitle, PageHeader } from '../components/ui';
import BookingForm from '../components/BookingForm';
import BookingView from '../components/BookingView';

// Customers book a moving cab instantly — confirmation and booking ID are returned immediately.
export default function BookCab() {
  const [params] = useSearchParams();
  const [booked, setBooked] = useState(null);
  useTitle(booked ? `Booked ${booked.bookingId}` : 'Book a moving cab');
  const initial = { ...Object.fromEntries(params), from: params.get('pickup') || params.get('from') || '' };

  if (booked) {
    return (
      <>
        <PageHeader crumb="Home / Book" title="Your cab is booked!" subtitle="This page updates live. You can also follow the move any time from My Moves." />
        <section className="section">
          <div className="container" style={{ maxWidth: 960 }}>
            <BookingView id={booked._id} justBooked />
            <div className="center" style={{ marginTop: 20 }}>
              <Link to="/dashboard" className="btn btn-primary">Go to My Moves</Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader crumb="Home / Book a Cab" title="Book a moving cab instantly" subtitle="Pick your areas, choose a vehicle and a live time slot, then confirm. You'll get a booking ID right away and pay after delivery." />
      <section className="section">
        <div className="container">
          <BookingForm
            initial={initial}
            onBooked={(b) => {
              setBooked(b);
              window.scrollTo(0, 0);
            }}
          />
        </div>
      </section>
    </>
  );
}
