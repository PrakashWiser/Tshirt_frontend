import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import ToastContainer from '../components/ToastContainer';
import AdminLayout from '../components/AdminLayout';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { getProfile } from '../store/slice/authSlice';
import SessionExpiredPopup from '../components/SessionExpiredPopup';
import ScrollToTop from '../components/Common/ScrollToTop';
import VendorDetails from '../pages/VendorsSection/VendorDetails';

const Login = React.lazy(() => import('../pages/Login/Login'));
const DashboardHome = React.lazy(() => import('../pages/DashboardHome/DashboardHome'));
const AdminNotFound = React.lazy(() => import('../pages/AdminNotFound/AdminNotFoundt'));
const Bookings = React.lazy(() => import('../pages/Bookings/Bookings'));
const LocationSection = React.lazy(() => import('../pages/Locations/LocationSection'));
const RoomSection = React.lazy(() => import('../pages/RoomSection/RoomSection'));
const VillaSection = React.lazy(() => import('../pages/PropertySection/PropertySection'));
const UserSection = React.lazy(() => import('../pages/UserSection/UserSection'));
const PaymentSection = React.lazy(() => import('../pages/PaymentSection/PaymentSection'));
const PricingRuleSection = React.lazy(() => import('../pages/Pricingrulesection/Pricingrulesection'));
const OffersPromotionSection = React.lazy(() => import('../pages/OffersPromotionSection/OffersPromotionSection'));
const ReviewsSentimentSection = React.lazy(() => import('../pages/ReviewsSentimentSection/ReviewsSentimentSection'));
const AuditLogs = React.lazy(() => import('../pages/AuditLogs/AuditLogs'));
const Roles = React.lazy(() => import('../pages/Roles/Roles'));
const RedisCachePage = React.lazy(() => import('../pages/RoomSection/RedisCachePage'));
const RoomView = React.lazy(() => import('../pages/RoomSection/RoomView'));
const PropertyView = React.lazy(() => import('../pages/PropertySection/PropertyView'));
const ProfileSection = React.lazy(() => import('../pages/Profile/Profile'));
const BookingDetails = React.lazy(() => import('../pages/Bookings/BookingDetails'));
const VendorsSection = React.lazy(() => import('../pages/VendorsSection/VendorsSection'));

function ViewportSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
    </div>
  );
}

function AuthenticatedLayoutWrapper() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}

export default function AppRoutes() {

  const dispatch = useAppDispatch();
  const { accessToken } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (accessToken) {
      dispatch(getProfile());
    }
  }, [accessToken, dispatch]);


  return (
    <BrowserRouter>
      <ToastContainer />
      <SessionExpiredPopup />
      <ScrollToTop />
      <Suspense fallback={<ViewportSpinner />}>
        <Routes>
          <Route>
            <Route path="/login" element={<Login />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route element={<AuthenticatedLayoutWrapper />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardHome />} />
              <Route path="/rooms" element={<RoomSection />} />
              <Route path="/rooms/view/:id" element={<RoomView />} />
              <Route path="/rooms/cache" element={<RedisCachePage />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/bookings/:id" element={<BookingDetails />} />
              <Route path="/properties" element={<VillaSection />} />
              <Route path="/properties/view/:id" element={<PropertyView />} />
              <Route path="/locations" element={<LocationSection />} />
              <Route path="/payments" element={<PaymentSection />} />
              <Route path="/offers" element={<OffersPromotionSection />} />
              <Route path="/reviews" element={<ReviewsSentimentSection />} />
              <Route path="/roles" element={<Roles />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
              <Route path="/profile" element={<ProfileSection />} />
              <Route path="/pricing-management" element={<PricingRuleSection />} />
              <Route path="/users" element={<UserSection />} />
              <Route path="/vendors" element={<VendorsSection />} />
              <Route path="/vendor/:id" element={<VendorDetails />} />
            </Route>
            <Route path="*" element={<AdminNotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}