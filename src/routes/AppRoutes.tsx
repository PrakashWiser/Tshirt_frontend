import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import ToastContainer from '../components/ToastContainer';
import AdminLayout from '../components/AdminLayout';
import RoomSection from '../pages/RoomSection/RoomSection';
import VillaSection from '../pages/PropertySection/PropertySection';
import UserSection from '../pages/UserSection/UserSection';
import PaymentSection from '../pages/PaymentSection/PaymentSection';
import PricingRuleSection from '../pages/Pricingrulesection/Pricingrulesection';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { getProfile } from '../store/slice/authSlice';
import OffersPromotionSection from '../pages/OffersPromotionSection/OffersPromotionSection';
import ReviewsSentimentSection from '../pages/ReviewsSentimentSection/ReviewsSentimentSection';
import AuditLogs from '../pages/AuditLogs/AuditLogs';
import Roles from '../pages/Roles/Roles';
import RedisCachePage from '../pages/RoomSection/RedisCachePage';
import RoomView from '../pages/RoomSection/RoomView';
import PropertyView from '../pages/PropertySection/PropertyView';
import ProfileSection from '../pages/Profile/Profile';
import SessionExpiredPopup from '../components/SessionExpiredPopup';

const Login = React.lazy(() => import('../pages/Login/Login'));
const DashboardHome = React.lazy(() => import('../pages/DashboardHome/DashboardHome'));
const AdminNotFound = React.lazy(() => import('../pages/AdminNotFound/AdminNotFoundt'));
const Bookings = React.lazy(() => import('../pages/Bookings/Bookings'));
const LocationSection = React.lazy(() => import('../pages/Locations/LocationSection'));

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
            </Route>
            <Route path="*" element={<AdminNotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}