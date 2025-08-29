import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth, AuthStatus } from './components/AuthProvider'
import ScanFormComponent from './components/ScanFormComponent'
import AuthForm from './components/AuthForm'
import { Button } from './components/ui/button'
import './App.css'

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />
  }
  
  return <>{children}</>
}

// Landing Page Component
function LandingPage() {
  const { user } = useAuth()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
              <h1 className="text-2xl font-bold text-gray-900">Blindspot Whisperer</h1>
            </div>
            <div className="flex items-center space-x-4">
              <AuthStatus />
              {!user && (
                <Button 
                  onClick={() => window.location.href = '/auth'}
                  variant="outline"
                >
                  Sign In
                </Button>
              )}
              {user && (
                <Button 
                  onClick={() => window.location.href = '/scan'}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  Start Scan
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-8">
          <h2 className="text-5xl font-bold text-gray-900 leading-tight">
            Discover Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Business Blind Spots</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get AI-powered insights into potential risks and opportunities you might be missing. 
            Analyze your business through the lens of different personas and uncover actionable recommendations.
          </p>
          
          <div className="flex justify-center space-x-4">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-lg px-8 py-3"
              onClick={() => window.location.href = user ? '/scan' : '/auth'}
            >
              {user ? 'Start Your Scan' : 'Get Started Free'}
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-3"
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Smart AI Analysis</h3>
            <p className="text-gray-600">
              Advanced AI algorithms analyze your business from multiple angles to identify hidden risks and opportunities.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">7 Business Personas</h3>
            <p className="text-gray-600">
              Tailored analysis for SaaS founders, e-commerce, content creators, and more business types.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Actionable Reports</h3>
            <p className="text-gray-600">
              Get detailed recommendations with specific steps, resources, and timelines to address blind spots.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

// Auth Page Component
function AuthPage() {
  const { user } = useAuth()
  
  if (user) {
    return <Navigate to="/scan" replace />
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <AuthForm 
        onSuccess={() => {
          window.location.href = '/scan'
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
            console.log('Scan started:', data)
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
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route 
            path="/scan" 
            element={
              <ProtectedRoute>
                <ScanPage />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App