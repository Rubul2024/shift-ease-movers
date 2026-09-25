import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingContact from './components/FloatingContact';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Areas from './pages/Areas';
import Quote from './pages/Quote';
import BookCab from './pages/BookCab';
import Track from './pages/Track';
import Contact from './pages/Contact';
import Faq from './pages/Faq';
import { Privacy, Terms } from './pages/Legal';
import Login from './pages/Login';
import Register from './pages/Register';
import { ForgotPassword, ResetPassword } from './pages/ForgotPassword';
import Receipt from './pages/Receipt';
import NotFound from './pages/NotFound';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminAreas from './pages/admin/AdminAreas';
import AdminContacts from './pages/admin/AdminContacts';
import AdminBookings from './pages/admin/AdminBookings';
import AdminQuotes from './pages/admin/AdminQuotes';
import AdminServices from './pages/admin/AdminServices';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminSubscribers from './pages/admin/AdminSubscribers';

const AUTH_PAGES = ['/login', '/register', '/forgot-password'];

function ScrollToTop() {
  const { pathname } = useLocation();
  // Braces matter: newer browsers return a Promise from scrollTo, and an effect may only return a cleanup function.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const { pathname } = useLocation();
  const inApp =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/receipt') ||
    pathname.startsWith('/reset-password') ||
    AUTH_PAGES.includes(pathname);

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        {/* Keyed by route: an error on one page keeps the navbar usable and clears when you navigate away. */}
        <ErrorBoundary key={pathname}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/areas" element={<Areas />} />
            <Route path="/quote" element={<Quote />} />
            <Route path="/track" element={<Track />} />
            <Route path="/track/:bookingId" element={<Track />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route
              path="/book"
              element={
                <ProtectedRoute role="customer">
                  <BookCab />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute role="customer">
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/receipt/:id"
              element={
                <ProtectedRoute>
                  <Receipt />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminOverview />} />
              <Route path="areas" element={<AdminAreas />} />
              <Route path="contacts" element={<AdminContacts />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="quotes" element={<AdminQuotes />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="subscribers" element={<AdminSubscribers />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </main>
      {!inApp && <Footer />}
      {!inApp && <FloatingContact />}
    </>
  );
}
