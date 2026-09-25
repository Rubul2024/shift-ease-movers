import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BookingForm from '../../components/BookingForm';
import { useTitle } from '../../components/ui';
import { useDashboard } from './CustomerLayout';

export default function BookMove() {
  useTitle('Book a move');
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { bookings } = useDashboard();

  return (
    <BookingForm
      initial={{ ...Object.fromEntries(params), from: params.get('pickup') || params.get('from') || '' }}
      onBooked={(b) => {
        bookings.reload();
        navigate(`/dashboard/bookings/${b._id}`, { state: { justBooked: true } });
      }}
    />
  );
}
