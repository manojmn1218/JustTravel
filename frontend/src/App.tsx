import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { PageLoader } from './components/ui/PageLoader'
import { ThemeProvider } from './components/theme/ThemeProvider'
import { RequireAdmin, RequireAuth } from './features/auth/RequireAuth'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'

const TravelDashboardPage = lazy(() => import('./pages/TravelDashboardPage'))
const ExplorePage = lazy(() => import('./pages/ExplorePage'))
const DealsPage = lazy(() => import('./pages/DealsPage'))
const SupportPage = lazy(() => import('./pages/SupportPage'))
const BookPage = lazy(() => import('./pages/BookPage'))
const PaymentPage = lazy(() => import('./pages/PaymentPage'))
const ConfirmationPage = lazy(() => import('./pages/ConfirmationPage'))

const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const AdminPage = lazy(() => import('./pages/admin/AdminPage'))
const AdminBookingsPage = lazy(() => import('./pages/admin/AdminBookingsPage'))
const AdminFeedbackPage = lazy(() => import('./pages/admin/AdminFeedbackPage'))

export default function App() {
  return (
    <ThemeProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/app"
              element={
                <RequireAuth>
                  <TravelDashboardPage />
                </RequireAuth>
              }
            />
            <Route
              path="/explore"
              element={
                <RequireAuth>
                  <ExplorePage />
                </RequireAuth>
              }
            />
            <Route
              path="/deals"
              element={
                <RequireAuth>
                  <DealsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/support"
              element={
                <RequireAuth>
                  <SupportPage />
                </RequireAuth>
              }
            />
            <Route
              path="/book"
              element={
                <RequireAuth>
                  <BookPage />
                </RequireAuth>
              }
            />
            <Route
              path="/payment"
              element={
                <RequireAuth>
                  <PaymentPage />
                </RequireAuth>
              }
            />
            <Route
              path="/confirmation"
              element={
                <RequireAuth>
                  <ConfirmationPage />
                </RequireAuth>
              }
            />
            <Route path="/bookings" element={<Navigate to="/profile" replace />} />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <ProfilePage />
                </RequireAuth>
              }
            />
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminPage />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <RequireAdmin>
                  <AdminBookingsPage />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/feedback"
              element={
                <RequireAdmin>
                  <AdminFeedbackPage />
                </RequireAdmin>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </ThemeProvider>
  )
}
