// client/src/components/admin/LazyComponents.tsx
import { lazy, Suspense } from 'react';
import Loader from '@/components/ui/Loader';

const DonorManagement = lazy(() => import('./DonorManagement'));
const InventoryManagement = lazy(() => import('./InventoryManagement'));
const ActivityLog = lazy(() => import('./ActivityLog'));
const AdminSettings = lazy(() => import('./AdminSettings'));
const AnalyticsModule = lazy(() => import('./AnalyticsModule'));
const EmergencyRequestManagement = lazy(() => import('./EmergencyRequestManagement'));
const ReactivationRequests = lazy(() => import('./ReactivationRequests'));
const VerificationRequests = lazy(() => import('./VerificationRequests'));
const Logout = lazy(() => import('./Logout'));

export const LazyDonorManagement = () => (
  <Suspense fallback={<Loader />}>
    <DonorManagement />
  </Suspense>
);

export const LazyInventoryManagement = () => (
  <Suspense fallback={<Loader />}>
    <InventoryManagement />
  </Suspense>
);

export const LazyActivityLog = () => (
  <Suspense fallback={<Loader />}>
    <ActivityLog />
  </Suspense>
);

export const LazyAdminSettings = () => (
  <Suspense fallback={<Loader />}>
    <AdminSettings />
  </Suspense>
);

export const LazyAnalyticsModule = () => (
  <Suspense fallback={<Loader />}>
    <AnalyticsModule />
  </Suspense>
);

export const LazyEmergencyRequestManagement = () => (
  <Suspense fallback={<Loader />}>
    <EmergencyRequestManagement />
  </Suspense>
);

export const LazyReactivationRequests = () => (
  <Suspense fallback={<Loader />}>
    <ReactivationRequests />
  </Suspense>
);

export const LazyVerificationRequests = () => (
  <Suspense fallback={<Loader />}>
    <VerificationRequests />
  </Suspense>
);

export const LazyLogout = () => (
  <Suspense fallback={<Loader />}>
    <Logout />
  </Suspense>
);