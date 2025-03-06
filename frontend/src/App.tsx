
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { lazy, Suspense } from "react";

// Lazy-loaded components
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Survey = lazy(() => import("./pages/Survey"));
const Home = lazy(() => import("./pages/Home"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Authenticated Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('apomind_user') !== null;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Redirect if already authenticated
const RedirectIfAuthenticated = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('apomind_user') !== null;
  const user = isAuthenticated ? JSON.parse(localStorage.getItem('apomind_user') || '{}') : null;
  
  if (isAuthenticated) {
    return <Navigate to={user?.completedSurvey ? "/home" : "/survey"} />;
  }
  
  return <>{children}</>;
};

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-16 h-16 border-t-4 border-b-4 border-apomind-blue rounded-full animate-spin"></div>
      <p className="text-lg font-medium text-apomind-dark">Loading Apomind...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<RedirectIfAuthenticated><Login /></RedirectIfAuthenticated>} />
              <Route path="/register" element={<RedirectIfAuthenticated><Register /></RedirectIfAuthenticated>} />
              
              {/* Protected routes */}
              <Route path="/survey" element={<ProtectedRoute><Survey /></ProtectedRoute>} />
              <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
