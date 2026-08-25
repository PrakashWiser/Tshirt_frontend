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
import AmenitySection from '../pages/AmenitySection/AmenitySection';
import PropertyActionList from '../pages/PropertyAction/PropertyActionList';
import PropertyList from '../pages/Property/PropertyList';
import EnquiryList from '../pages/Enquiry/EnquiryList';
import LifestyleList from '../pages/Lifestyle/LifestyleList';
import PropertyView from '../pages/Property/PropertyView';

const Login = React.lazy(() => import('../pages/Login/Login'));
const DashboardHome = React.lazy(() => import('../pages/DashboardHome/DashboardHome'));
const AdminNotFound = React.lazy(() => import('../pages/AdminNotFound/AdminNotFoundt'));
const PropertySection = React.lazy(() => import('../pages/PropertyTypeSection/PropertySectionType'));
const BhkSection = React.lazy(() => import('../pages/BHK/BhkSection'));
const UserSection = React.lazy(() => import('../pages/UserSection/UserSection'));
const PaymentSection = React.lazy(() => import('../pages/PaymentSection/PaymentSection'));
const OffersPromotionSection = React.lazy(() => import('../pages/OffersPromotionSection/OffersPromotionSection'));
const ReviewsSentimentSection = React.lazy(() => import('../pages/ReviewsSentimentSection/ReviewsSentimentSection'));
const AuditLogs = React.lazy(() => import('../pages/AuditLogs/AuditLogs'));
const Roles = React.lazy(() => import('../pages/Roles/Roles'));
const ProfileSection = React.lazy(() => import('../pages/Profile/Profile'));
const ScheduleVisitList = React.lazy(() => import('../pages/Schedule/ScheduleVisitList'));
const Contact = React.lazy(() => import('../pages/Contact/Contact'));

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

  useEffect(() => {
    const enableInteraction = () => {
      (window as Window & {
        __USER_INTERACTED__?: boolean;
      }).__USER_INTERACTED__ = true;
    };

    window.addEventListener("click", enableInteraction);
    window.addEventListener("keydown", enableInteraction);

    return () => {
      window.removeEventListener("click", enableInteraction);
      window.removeEventListener("keydown", enableInteraction);
    };
  }, []);


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
              <Route path="/properties-types" element={<PropertySection />} />
              <Route path="/properties" element={<PropertyList />} />
              <Route path="/bhk" element={<BhkSection />} />
              <Route path="/properties-action" element={<PropertyActionList />} />
              <Route
                path="/properties/:id"
                element={<PropertyView />}
              />
              <Route path="/amenity" element={<AmenitySection />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/life-style" element={<LifestyleList />} />
              <Route path="/enquiries" element={<EnquiryList />} />
              <Route path="/payments" element={<PaymentSection />} />
              <Route path="/offers" element={<OffersPromotionSection />} />
              <Route path="/reviews" element={<ReviewsSentimentSection />} />
              <Route path="/roles" element={<Roles />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
              <Route path="/profile" element={<ProfileSection />} />
              <Route path="/schedule-visits" element={<ScheduleVisitList />} />
              <Route path="/users" element={<UserSection />} />
              <Route path="/vendor/:id" element={<VendorDetails />} />
            </Route>
            <Route path="*" element={<AdminNotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}