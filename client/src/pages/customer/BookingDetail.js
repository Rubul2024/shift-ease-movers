import React, { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import BookingView from '../../components/BookingView';
import { useTitle } from '../../components/ui';
import { useDashboard } from './CustomerLayout';

export default function BookingDetail() {
  const { id } = useParams();
  const { state } = useLocation();
  const { bookings } = useDashboard();
  useTitle('Booking details');

  // Keep the sidebar badge and lists in sync after a cancel on this page.
  useEffect(() => {
    return () => {
      bookings.reload();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <BookingView id={id} justBooked={!!state?.justBooked} backTo="/dashboard/bookings" />;
}
