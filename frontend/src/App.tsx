import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';

import { AuthProvider } from './context/AuthContext';
import { ApplicationProvider } from './context/ApplicationContext';
import { NotificationProvider } from './context/NotificationContext';

// Layout Components
import { AppLayout } from './components/layout/AppLayout';

// Page Components
import { WelcomePage } from './pages/WelcomePage';
import { ApplicationTypePage } from './pages/ApplicationTypePage';
import { PersonalInfoPage } from './pages/PersonalInfoPage';
import { BusinessProfilePage } from './pages/BusinessProfilePage';
import { FinancialProfilePage } from './pages/FinancialProfilePage';
import { ProductSelectionPage } from './pages/ProductSelectionPage';
import { DocumentUploadPage } from './pages/DocumentUploadPage';
import { IdentityVerificationPage } from './pages/IdentityVerificationPage';
import { AdditionalSignersPage } from './pages/AdditionalSignersPage';
import { RiskAssessmentPage } from './pages/RiskAssessmentPage';
import { DisclosuresPage } from './pages/DisclosuresPage';
import { ElectronicSignaturesPage } from './pages/ElectronicSignaturesPage';
import { AccountFundingPage } from './pages/AccountFundingPage';
import { ApplicationReviewPage } from './pages/ApplicationReviewPage';
import { ConfirmationPage } from './pages/ConfirmationPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminApplicationDetailsPage } from './pages/admin/AdminApplicationDetailsPage';

// Protected Route Component
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 3,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000 // 5 minutes
        },
        mutations: {
            retry: 1
        }
    }
});

export const App = () => {
    return (
        <ThemeProvider
            attribute='class'
            defaultTheme='light'
            enableSystem
            disableTransitionOnChange
        >
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <ApplicationProvider>
                        <NotificationProvider>
                            <Router>
                                <div className='min-h-screen bg-background'>
                                    <Routes>
                                        {/* Public Routes */}
                                        <Route
                                            path='/login'
                                            element={<LoginPage />}
                                        />
                                        <Route
                                            path='/register'
                                            element={<RegisterPage />}
                                        />

                                        {/* Protected Application Routes */}
                                        <Route element={<ProtectedRoute />}>
                                            <Route element={<AppLayout />}>
                                                {/* Main Application Flow */}
                                                <Route
                                                    path='/'
                                                    element={<WelcomePage />}
                                                />
                                                <Route
                                                    path='/welcome'
                                                    element={<WelcomePage />}
                                                />
                                                <Route
                                                    path='/application-type'
                                                    element={<ApplicationTypePage />}
                                                />
                                                <Route
                                                    path='/personal-info'
                                                    element={<PersonalInfoPage />}
                                                />
                                                <Route
                                                    path='/business-profile'
                                                    element={<BusinessProfilePage />}
                                                />
                                                <Route
                                                    path='/financial-profile'
                                                    element={<FinancialProfilePage />}
                                                />
                                                <Route
                                                    path='/product-selection'
                                                    element={<ProductSelectionPage />}
                                                />
                                                <Route
                                                    path='/documents'
                                                    element={<DocumentUploadPage />}
                                                />
                                                <Route
                                                    path='/identity-verification'
                                                    element={<IdentityVerificationPage />}
                                                />
                                                <Route
                                                    path='/additional-signers'
                                                    element={<AdditionalSignersPage />}
                                                />
                                                <Route
                                                    path='/risk-assessment'
                                                    element={<RiskAssessmentPage />}
                                                />
                                                <Route
                                                    path='/disclosures'
                                                    element={<DisclosuresPage />}
                                                />
                                                <Route
                                                    path='/signatures'
                                                    element={<ElectronicSignaturesPage />}
                                                />
                                                <Route
                                                    path='/funding'
                                                    element={<AccountFundingPage />}
                                                />
                                                <Route
                                                    path='/review'
                                                    element={<ApplicationReviewPage />}
                                                />
                                                <Route
                                                    path='/confirmation'
                                                    element={<ConfirmationPage />}
                                                />

                                                {/* Admin Routes */}
                                                <Route
                                                    path='/admin'
                                                    element={<AdminDashboardPage />}
                                                />
                                                <Route
                                                    path='/admin/applications/:id'
                                                    element={<AdminApplicationDetailsPage />}
                                                />

                                                {/* Catch-all redirect */}
                                                <Route
                                                    path='*'
                                                    element={
                                                        <Navigate
                                                            to='/'
                                                            replace
                                                        />
                                                    }
                                                />
                                            </Route>
                                        </Route>
                                    </Routes>

                                    {/* Toast Notifications */}
                                    <Toaster
                                        position='top-right'
                                        toastOptions={{
                                            duration: 4000,
                                            classNames: {
                                                error: 'border-destructive text-destructive',
                                                success: 'border-green-500 text-green-700',
                                                warning: 'border-yellow-500 text-yellow-700',
                                                info: 'border-blue-500 text-blue-700'
                                            }
                                        }}
                                    />
                                </div>
                            </Router>
                        </NotificationProvider>
                    </ApplicationProvider>
                </AuthProvider>
            </QueryClientProvider>
        </ThemeProvider>
    );
};
