import { Outlet, useLocation } from 'react-router-dom';
import { useApplication } from '@/context/ApplicationContext';
import { ProgressStepper } from '@/components/ui/progress-stepper';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { ApplicationStep } from '@/types/api';

// Step configuration for display
const STEP_CONFIG: Record<ApplicationStep, { label: string; description: string }> = {
    account_type: { label: 'Account Type', description: 'Choose your account type' },
    personal_info: { label: 'Personal Info', description: 'Your personal information' },
    business_profile: { label: 'Business Profile', description: 'Business information' },
    financial_profile: { label: 'Financial Profile', description: 'Financial information' },
    product_selection: { label: 'Products', description: 'Select account products' },
    documents: { label: 'Documents', description: 'Upload required documents' },
    identity_verification: { label: 'Identity Check', description: 'Verify your identity' },
    additional_signers: { label: 'Signers', description: 'Additional account signers' },
    risk_assessment: { label: 'Risk Review', description: 'Risk assessment' },
    disclosures: { label: 'Disclosures', description: 'Review agreements' },
    signatures: { label: 'Signatures', description: 'Electronic signatures' },
    funding: { label: 'Funding', description: 'Account funding setup' },
    review: { label: 'Review', description: 'Review your application' },
    confirmation: { label: 'Complete', description: 'Application submitted' }
};

const CONSUMER_STEPS: ApplicationStep[] = [
    'account_type',
    'personal_info',
    'financial_profile',
    'product_selection',
    'documents',
    'identity_verification',
    'risk_assessment',
    'disclosures',
    'signatures',
    'funding',
    'review',
    'confirmation'
];

const COMMERCIAL_STEPS: ApplicationStep[] = [
    'account_type',
    'business_profile',
    'financial_profile',
    'product_selection',
    'documents',
    'identity_verification',
    'additional_signers',
    'risk_assessment',
    'disclosures',
    'signatures',
    'funding',
    'review',
    'confirmation'
];

export const ApplicationLayout = () => {
    const location = useLocation();
    const { state } = useApplication();

    // Get current step from URL path
    const getCurrentStepFromPath = (): ApplicationStep | null => {
        const pathToStepMap: Record<string, ApplicationStep> = {
            '/application-type': 'account_type',
            '/personal-info': 'personal_info',
            '/business-profile': 'business_profile',
            '/financial-profile': 'financial_profile',
            '/product-selection': 'product_selection',
            '/documents': 'documents',
            '/identity-verification': 'identity_verification',
            '/additional-signers': 'additional_signers',
            '/risk-assessment': 'risk_assessment',
            '/disclosures': 'disclosures',
            '/signatures': 'signatures',
            '/funding': 'funding',
            '/review': 'review',
            '/confirmation': 'confirmation'
        };

        return pathToStepMap[location.pathname] || null;
    };

    const currentStep = getCurrentStepFromPath();
    const accountType = state.currentApplication?.accountType || 'consumer';
    const steps = accountType === 'consumer' ? CONSUMER_STEPS : COMMERCIAL_STEPS;

    // Get step information for progress stepper
    const stepItems = steps.map((step, index) => ({
        id: step,
        label: STEP_CONFIG[step].label,
        description: STEP_CONFIG[step].description,
        status: state.completedSteps.includes(step)
            ? ('completed' as const)
            : step === currentStep
              ? ('current' as const)
              : ('pending' as const)
    }));

    const handleGoHome = () => {
        window.location.href = '/';
    };

    return (
        <div className='min-h-screen bg-gray-50'>
            {/* Header */}
            <header className='bg-white shadow-sm border-b'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='flex justify-between items-center h-16'>
                        {/* Logo and Title */}
                        <div className='flex items-center gap-4'>
                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={handleGoHome}
                                className='text-gray-600 hover:text-gray-900'
                            >
                                <Home className='h-4 w-4 mr-2' />
                                {APP_NAME}
                            </Button>
                            <div className='hidden sm:block h-6 w-px bg-gray-300' />
                            <h1 className='hidden sm:block text-lg font-semibold text-gray-900'>Account Opening</h1>
                        </div>

                        {/* Application Info */}
                        <div className='flex items-center gap-4 text-sm text-gray-600'>
                            {state.currentApplication && (
                                <>
                                    <span className='capitalize'>{accountType} Account</span>
                                    <div className='h-4 w-px bg-gray-300' />
                                    <span className='text-xs'>ID: {state.currentApplication.id.slice(-8)}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Progress Stepper */}
            {steps.length > 0 && currentStep && (
                <div className='bg-white border-b'>
                    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
                        <ProgressStepper
                            steps={stepItems}
                            orientation='horizontal'
                            showDescriptions={false}
                            className='w-full'
                        />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className='flex-1'>
                <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    {/* Current Step Info */}
                    {currentStep && (
                        <div className='mb-6'>
                            <h2 className='text-2xl font-bold text-gray-900'>{STEP_CONFIG[currentStep].label}</h2>
                            <p className='mt-1 text-gray-600'>{STEP_CONFIG[currentStep].description}</p>
                        </div>
                    )}

                    {/* Page Content */}
                    <div className='bg-white rounded-lg shadow-sm'>
                        <Outlet />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className='bg-white border-t mt-auto'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
                    <div className='flex justify-between items-center text-sm text-gray-600'>
                        <p>© 2024 {APP_NAME}. All rights reserved.</p>
                        <div className='flex gap-4'>
                            <a
                                href='#'
                                className='hover:text-gray-900'
                            >
                                Privacy Policy
                            </a>
                            <a
                                href='#'
                                className='hover:text-gray-900'
                            >
                                Terms of Service
                            </a>
                            <a
                                href='#'
                                className='hover:text-gray-900'
                            >
                                Support
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
