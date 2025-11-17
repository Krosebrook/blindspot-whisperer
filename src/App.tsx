import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, AuthStatus } from './components/AuthProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LandingPage } from './components/landing/LandingPage';
import { AppLayout } from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Results from './pages/Results';
import Index from './pages/Index';
import Share from './pages/Share';
import Security from './pages/Security';
import BotAnalytics from './pages/BotAnalytics';
import RequestPasswordReset from './pages/RequestPasswordReset';
import UpdatePassword from './pages/UpdatePassword';
import ScanFormComponent from './components/ScanFormComponent';
import AuthForm from './components/AuthForm';
import './App.css';

// Auth Page Component

// Auth Page Component
function AuthPage() {
  const { user } = useAuth()
  
  if (user) {
    return <Navigate to="/dashboard" replace />
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <AuthForm 
        onSuccess={() => {
          window.location.href = '/dashboard'
        }}
      />
    </div>
  )
}

// Scan Page Component
function ScanPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
              <h1 className="text-2xl font-bold text-gray-900">Blindspot Whisperer</h1>
            </div>
            <AuthStatus />
          </div>
        </div>
      </header>

      {/* Scan Form */}
      <main className="py-8">
        <ScanFormComponent 
          onSubmit={(data) => {
            // Production scan submission - remove console logging
            alert(`✅ Scan started successfully!\n\nPersona: ${data.persona}\nScan ID: ${data.scanId}\n\nYour business analysis is now processing. You'll receive detailed insights about potential blind spots and opportunities.`)
          }}
        />
      </main>
    </div>
  )
}

// Main App Component
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/security" element={<Security />} />
          
          {/* Protected Routes with Layout */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
          </Route>
          
          <Route 
            path="/scan" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Index />} />
          </Route>
          
          <Route 
            path="/results" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Results />} />
          </Route>
          
          <Route 
            path="/bot-analytics" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<BotAnalytics />} />
          </Route>
          
          {/* Placeholder routes for sidebar navigation */}
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<div className="p-6"><h1>Analytics - Coming Soon</h1></div>} />
          </Route>
          
          <Route 
            path="/probes" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<div className="p-6"><h1>Probes - Coming Soon</h1></div>} />
          </Route>
          
          <Route 
            path="/teams" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<div className="p-6"><h1>Teams - Coming Soon</h1></div>} />
          </Route>
          
          <Route 
            path="/benchmarks" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<div className="p-6"><h1>Benchmarks - Coming Soon</h1></div>} />
          </Route>
          
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<div className="p-6"><h1>Settings - Coming Soon</h1></div>} />
          </Route>
          
          <Route 
            path="/security" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Security />} />
          </Route>

          {/* Public Share Route */}
          <Route path="/share/:slug" element={<Share />} />
          
          {/* Password Reset Routes */}
          <Route path="/reset-password" element={<RequestPasswordReset />} />
          <Route path="/update-password" element={<UpdatePassword />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
    </ErrorBoundary>
  )
}

export default App