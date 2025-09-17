import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './Providers/AuthProvider';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Home } from './pages/Home';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { BookList } from './pages/books/BookList';
import { Dashboard } from './pages/Dashboard';
import { UserRole } from './types';
import './i18n';
import { BookDetail } from './pages/books/BookDetail';
import { ProfilePage } from './pages/Profile/ProfilePage'; // Import de la page de profil
import { LoanRequests } from './pages/Loans/LoanRequests';
import { LoansPage } from './pages/Loans/LoansPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/books" element={<BookList />} />
              
              {/* Route BookDetail protégée */}
              <Route
                path="/books/:id"
                element={
                  <ProtectedRoute>
                    <BookDetail />
                  </ProtectedRoute>
                }
              />
              
              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/requests"
                element={
                  <ProtectedRoute>
                    <LoanRequests/>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/loans"
                element={
                  <ProtectedRoute>
                    <LoansPage/>
                  </ProtectedRoute>
                }
              />
              
              {/* Route Profile utilisant le composant ProfilePage */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              
              {/* Secretary Routes */}
              <Route
                path="/secretary/*"
                element={
                  <ProtectedRoute roles={[UserRole.SECRETARY, UserRole.ADMIN]}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                      <h1 className="text-3xl font-bold text-gray-900">Interface Secrétaire</h1>
                      <p className="text-gray-600 mt-2">Cette section sera bientôt disponible</p>
                    </div>
                  </ProtectedRoute>
                }
              />
              
              {/* Admin Routes */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute roles={[UserRole.ADMIN]}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                      <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
                      <p className="text-gray-600 mt-2">Cette section sera bientôt disponible</p>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route 
                path="*" 
                element={
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600">Page non trouvée</p>
                  </div>
                } 
              />
            </Routes>
          </Layout>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#059669',
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: '#DC2626',
                },
              },
            }}
          />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;