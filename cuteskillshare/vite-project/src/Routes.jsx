import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import ProtectedRoute from "components/ProtectedRoute";
import NotFound from "pages/NotFound";
import AuthenticationPage from './pages/authentication';
import PersonalUserHub from './pages/personal-user-hub';
import AppLayout from './components/layout/AppLayout';
import SmartMatchesPage from './pages/smart-matches';
import AIAssistantPage from './pages/ai-assistant';
import MySwapsPage from './pages/my-swaps';
import GroupsPage from './pages/groups';
import MarketplacePage from './pages/marketplace';
import WalletPage from './pages/wallet';
import SearchResultsPage from './pages/search';
import OwnProfilePage from './pages/personal-user-hub/OwnProfilePage';
import CoursesPage from './pages/courses';
import JoinSessionPage from './pages/session';
import MessagingPage from './pages/messaging';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Public Routes */}
        <Route path="/auth" element={<AuthenticationPage />} />
        
        {/* Protected Routes with persistent sidebar layout */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<PersonalUserHub />} />
          <Route path="/personal-user-hub" element={<PersonalUserHub />} />
          <Route path="/matches" element={<SmartMatchesPage />} />
          <Route path="/assistant" element={<AIAssistantPage />} />
          <Route path="/swaps" element={<MySwapsPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/profile" element={<OwnProfilePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/session/:sessionId" element={<JoinSessionPage />} />
          <Route path="/messaging" element={<MessagingPage />} />
        </Route>
        
        {/* Catch all - redirect to auth or 404 */}
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
