import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import ToastContainer from '../components/ToastContainer';
import AdminLayout from '../components/AdminLayout';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { getProfile } from '../store/slice/authSlice';
import SessionExpiredPopup from '../components/SessionExpiredPopup';
import ScrollToTop from '../components/Common/ScrollToTop';
import EnquiryList from '../pages/Enquiry/EnquiryList';

const Login = React.lazy(() => import('../pages/Login/Login'));
const DashboardHome = React.lazy(() => import('../pages/DashboardHome/DashboardHome'));
const AdminNotFound = React.lazy(() => import('../pages/AdminNotFound/AdminNotFoundt'));
const UserSection = React.lazy(() => import('../pages/UserSection/UserSection'));
const OffersPromotionSection = React.lazy(() => import('../pages/OffersPromotionSection/OffersPromotionSection'));
const Contact = React.lazy(() => import('../pages/Contact/Contact'));
const CategoryPage = React.lazy(() => import('../pages/Category/CategoryPage'));
const ProductPage = React.lazy(() => import('../pages/Product/ProductPage'));
const BannerPage = React.lazy(() => import('../pages/Banner/BannerPage'));
const PaymentSection = React.lazy(() => import('../pages/PaymentSection/PaymentSection'));
const ProfilePage = React.lazy(() => import('../pages/Profile/ProfilePage'));

function ViewportSpinner() {
  return (
    <div className="flex items-center justify-center min-h-100">
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
              <Route path="/contact" element={<Contact />} />
              <Route path="/enquiries" element={<EnquiryList />} />
              <Route path="/offers" element={<OffersPromotionSection />} />
              <Route path="/users" element={<UserSection />} />
              <Route path="/products" element={<ProductPage />} />
              <Route path="/categories" element={<CategoryPage />} />
              <Route path="/banners" element={<BannerPage />} />
              <Route path="/payments" element={<PaymentSection />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<AdminNotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}