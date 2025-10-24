import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { WelcomePage } from '@/pages/WelcomePage';
import { ApplicationTypePage } from '@/pages/ApplicationTypePage';
import { PersonalInfoPage } from '@/pages/PersonalInfoPage';
import { BusinessProfilePage } from '@/pages/BusinessProfilePage';
import { FinancialProfilePage } from '@/pages/FinancialProfilePage';
import { ProductSelectionPage } from '@/pages/ProductSelectionPage';
import { DocumentUploadPage } from '@/pages/DocumentUploadPage';
import { IdentityVerificationPage } from '@/pages/IdentityVerificationPage';
import { AdditionalSignersPage } from '@/pages/AdditionalSignersPage';
import { RiskAssessmentPage } from '@/pages/RiskAssessmentPage';
import { DisclosuresPage } from '@/pages/DisclosuresPage';
import { ElectronicSignaturesPage } from '@/pages/ElectronicSignaturesPage';
import { AccountFundingPage } from '@/pages/AccountFundingPage';
import { ApplicationReviewPage } from '@/pages/ApplicationReviewPage';
import { ConfirmationPage } from '@/pages/ConfirmationPage';
import { ApplicationLayout } from '@/components/layout/ApplicationLayout';
import { ApplicationProvider } from '@/context/ApplicationContext';

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false
        }
    }
});

export const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <ApplicationProvider>
                <Router>
                    <div className='min-h-screen bg-gray-50'>
                        <Routes>
                            {/* Authentication Routes */}
                            <Route
                                path='/login'
                                element={<LoginPage />}
                            />
                            <Route
                                path='/register'
                                element={<RegisterPage />}
                            />

                            {/* Welcome/Landing Route */}
                            <Route
                                path='/'
                                element={<WelcomePage />}
                            />

                            {/* Application Flow Routes */}
                            <Route element={<ApplicationLayout />}>
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
                            </Route>
                        </Routes>
                        <Toaster />
                    </div>
                </Router>
            </ApplicationProvider>
        </QueryClientProvider>
    );
};
