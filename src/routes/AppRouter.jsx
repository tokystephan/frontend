// src/routes/AppRouter.jsx
import React, { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from '../store/slices/authSlice';
import usePermissions from '../hooks/usePermissions';

// Pages publiques
import Home from '../pages/Home'; 
import Login from '../pages/auth/Login';
import GoogleCallback from '../pages/auth/GoogleCallback';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Pages protégées - Dashboard
import Dashboard from '../pages/dashboard/Dashboard';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import AssistantDashboard from '../pages/dashboard/AssistantDashboard';
import ConsultantDashboard from '../pages/dashboard/ConsultantDashboard';
import DirectionDashboard from '../pages/dashboard/DirectionDashboard';

// Pages protégées - Postes
import PostList from '../pages/posts/PostList';
import PostForm from '../pages/posts/PostForm';
import PostDetail from '../pages/posts/PostDetail';

// Pages protégées - Candidats
import CandidateList from '../pages/candidates/CandidateList';
import CandidateForm from '../pages/candidates/CandidateForm';
import CandidateDetail from '../pages/candidates/CandidateDetail';

// Pages protégées - Candidatures
import ApplicationList from '../pages/applications/ApplicationList';
import ApplicationForm from '../pages/applications/ApplicationForm';
import ApplicationDetail from '../pages/applications/ApplicationDetail';

//  Module Gestion des entretiens (vrais composants)
import InterviewsDashboard from "../pages/events/InterviewsDashboard";
import InterviewDetail from "../pages/events/InterviewDetail";
import InterviewCreate from "../pages/events/InterviewCreate";
import InterviewForm from "../components/events/Forms/InterviewForm";


// Pages protégées - Profil
import Profile from '../pages/profile/Profile';
import AppLayout from '../components/Layout/AppLayout';

// Pages protégées - Notifications
import Notifications from '../pages/notifications/Notifications';

// Pages protégées - Admin
import StatisticsDashboard from '../pages/statistics/StatisticsDashboard';
import UserManagement from '../pages/admin/UserManagement';

const AppRouter = () => {
  const dispatch = useDispatch();
  const { initialized, isAuthenticated, user } = useSelector((state) => state.auth);
  const { roleName, canManagePosts, canManageCandidates, canManageApplications } = usePermissions();

  // Vérifier l'authentification au chargement
  useEffect(() => {
    if (!initialized) {
      dispatch(checkAuth());
    }
  }, [dispatch, initialized]);

  // Attendre que checkAuth soit terminé
  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Initialisation...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* ============================================ */}
      {/* ROUTES PUBLIQUES */}
      {/* ============================================ */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/auth/google/success" element={<GoogleCallback />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* ============================================ */}
      {/* ROUTES PROTÉGÉES - DASHBOARDS */}
      {/* ============================================ */}

      {/* Dashboard principal (redirige selon le rôle) */}
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
        }
      />

      {/* Admin Dashboard */}
      <Route
        path="/dashboard/admin"
        element={
          isAuthenticated && user?.role === 'admin' ? (
            <AdminDashboard />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />

      {/* Assistant Dashboard */}
      <Route
        path="/dashboard/assistant"
        element={
          isAuthenticated && user?.role === 'assistant' ? (
            <AssistantDashboard />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />

      {/* Consultant Dashboard */}
      <Route
        path="/dashboard/consultant"
        element={
          isAuthenticated && user?.role === 'consultant' ? (
            <ConsultantDashboard />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />

      <Route
        path="/dashboard/manager"
        element={
          isAuthenticated && user?.role === 'manager' ? (
            <ConsultantDashboard />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />

      {/* Direction Dashboard */}
      <Route
        path="/dashboard/direction"
        element={
          isAuthenticated && user?.role === 'direction' ? (
            <DirectionDashboard />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />

      {/* ========== POSTES ========== */}
      <Route
        path="/posts"
        element={
          isAuthenticated && (canManagePosts || roleName === 'consultant' || roleName === 'manager' || roleName === 'direction') ? <PostList /> : <Navigate to="/dashboard" replace />
        }
      />
      <Route
        path="/posts/new"
        element={
          isAuthenticated && canManagePosts ? <PostForm /> : <Navigate to="/dashboard" replace />
        }
      />
      <Route
        path="/posts/:id"
        element={
          isAuthenticated && (canManagePosts || roleName === 'consultant' || roleName === 'manager' || roleName === 'direction') ? <PostDetail /> : <Navigate to="/dashboard" replace />
        }
      />
      <Route
        path="/posts/:id/edit"
        element={
          isAuthenticated && canManagePosts ? <PostForm /> : <Navigate to="/dashboard" replace />
        }
      />

      {/* ========== CANDIDATS ========== */}
      <Route
        path="/candidates"
        element={
          isAuthenticated && canManageCandidates ? <CandidateList /> : <Navigate to="/dashboard" replace />
        }
      />
      <Route
        path="/candidates/new"
        element={
          isAuthenticated && canManageCandidates ? <CandidateForm /> : <Navigate to="/dashboard" replace />
        }
      />
      <Route
        path="/candidates/:id"
        element={
          isAuthenticated && canManageCandidates ? <CandidateDetail /> : <Navigate to="/dashboard" replace />
        }
      />
      <Route
        path="/candidates/:id/edit"
        element={
          isAuthenticated && canManageCandidates ? <CandidateForm /> : <Navigate to="/dashboard" replace />
        }
      />

      {/* ========== CANDIDATURES ========== */}
      <Route
        path="/applications"
        element={
          isAuthenticated ? <ApplicationList /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/applications/new"
        element={
          isAuthenticated && canManageApplications && roleName !== 'consultant' ? <ApplicationForm /> : <Navigate to="/dashboard" replace />
        }
      />
      <Route
        path="/applications/:id"
        element={
          isAuthenticated ? <ApplicationDetail /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/applications/:id/edit"
        element={
          isAuthenticated && canManageApplications && roleName !== 'consultant' ? <ApplicationForm /> : <Navigate to="/dashboard" replace />
        }
      />

      {/* ========== GESTION DES ENTRETIENS (vrais composants) ========== */}
      <Route
        path="/interviews"
        element={
          initialized ? (
            isAuthenticated ? <InterviewsDashboard /> : <Navigate to="/login" replace />
          ) : (
            <div className="min-h-screen bg-gray-900 text-gray-100 p-6">Chargement...</div>
          )
        }
      />
      <Route
        path="/interviews/create"
        element={
          isAuthenticated && roleName !== 'consultant' && roleName !== 'direction' ? (
            <InterviewCreate />
          ) : isAuthenticated ? (
            <Navigate to="/interviews" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/interviews/:id"
        element={
          isAuthenticated ? <InterviewDetail /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/interviews/:id/edit"
        element={
          isAuthenticated && roleName !== 'consultant' && roleName !== 'direction' ? (
            <InterviewForm />
          ) : isAuthenticated ? (
            <Navigate to="/interviews" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* ========== ÉVÉNEMENTS (fallback gracieux) ========== */}
      {/* Si vous n'avez pas encore de EventCalendar, cette route reste simple */}
      <Route
        path="/events"
        element={
          isAuthenticated ? <Navigate to="/interviews" replace /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/events/new"
        element={
          isAuthenticated ? <Navigate to="/interviews/create" replace /> : <Navigate to="/login" replace />
        }
      />

      {/* ========== PROFIL ========== */}
      <Route
        path="/profile"
        element={
          isAuthenticated ? (
            <AppLayout>
              <Profile />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* ========== NOTIFICATIONS ========== */}
      <Route
        path="/notifications"
        element={
          isAuthenticated ? (
            <AppLayout>
              <Notifications />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* ========== ADMIN ONLY ========== */}
      <Route
        path="/admin/users"
        element={
          isAuthenticated && user?.role === 'admin' ? (
            <UserManagement />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />

      {/* ========== ADMIN & DIRECTION ONLY ========== */}
      <Route
        path="/statistics"
        element={
          isAuthenticated && (user?.role === 'admin' || user?.role === 'direction') ? (
            <StatisticsDashboard />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />

      {/* ============================================ */}
      {/* ROUTE PAR DÉFAUT (FALLBACK) */}
      {/* ============================================ */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRouter;
