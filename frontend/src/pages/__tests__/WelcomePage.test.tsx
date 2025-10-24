import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test/test-utils';
import { WelcomePage } from '../WelcomePage';

// Mock the navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

// Mock the auth context
const mockAuth = {
    user: { id: 1, name: 'John Doe', email: 'john@example.com', role: 'USER' },
    isAuthenticated: true,
    isLoading: false,
    error: null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    clearError: vi.fn(),
    refreshToken: vi.fn()
};

// Mock the application context
const mockApplication = {
    state: {
        application: null,
        personalInfo: null,
        businessProfile: null,
        financialProfile: null,
        productSelections: [],
        documents: [],
        additionalSigners: [],
        currentStep: 'account_type' as const,
        isLoading: false,
        error: null,
        hasUnsavedChanges: false,
        formData: {},
        validationErrors: {}
    },
    dispatch: vi.fn(),
    setApplication: vi.fn(),
    setPersonalInfo: vi.fn(),
    setBusinessProfile: vi.fn(),
    setFinancialProfile: vi.fn(),
    setProductSelections: vi.fn(),
    addDocument: vi.fn(),
    updateDocument: vi.fn(),
    addAdditionalSigner: vi.fn(),
    updateAdditionalSigner: vi.fn(),
    setCurrentStep: vi.fn(),
    setLoading: vi.fn(),
    setError: vi.fn(),
    updateFormData: vi.fn(),
    setValidationErrors: vi.fn(),
    clearValidationErrors: vi.fn(),
    resetApplication: vi.fn(),
    canNavigateToStep: vi.fn(),
    getNextStep: vi.fn(),
    getPreviousStep: vi.fn(),
    isStepCompleted: vi.fn()
};

vi.mock('../../context/AuthContext', () => ({
    useAuth: () => mockAuth
}));

vi.mock('../../context/ApplicationContext', () => ({
    useApplication: () => mockApplication
}));

describe('WelcomePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders welcome page with user name', () => {
        render(<WelcomePage />);

        expect(screen.getByText('Welcome to Digital Banking')).toBeInTheDocument();
        expect(screen.getByText(/Hello John Doe/)).toBeInTheDocument();
        expect(screen.getByText(/Open your new account in minutes, not hours/)).toBeInTheDocument();
    });

    it('displays key features', () => {
        render(<WelcomePage />);

        expect(screen.getByText('Quick & Easy')).toBeInTheDocument();
        expect(screen.getByText('Bank-Level Security')).toBeInTheDocument();
        expect(screen.getByText('Instant Decisions')).toBeInTheDocument();
    });

    it('shows account type preview cards', () => {
        render(<WelcomePage />);

        expect(screen.getByText('Personal Banking')).toBeInTheDocument();
        expect(screen.getByText('Perfect for individuals and families')).toBeInTheDocument();
        expect(screen.getByText('Business Banking')).toBeInTheDocument();
        expect(screen.getByText('Designed for businesses and organizations')).toBeInTheDocument();
    });

    it('displays benefits list', () => {
        render(<WelcomePage />);

        expect(screen.getByText('No monthly maintenance fees with minimum balance')).toBeInTheDocument();
        expect(screen.getByText('Free online and mobile banking')).toBeInTheDocument();
        expect(screen.getByText('FDIC insured up to $250,000')).toBeInTheDocument();
        expect(screen.getByText('24/7 customer support')).toBeInTheDocument();
    });

    it('shows Patriot Act notice', () => {
        render(<WelcomePage />);

        expect(
            screen.getByText(/Important Information About Procedures for Opening a New Account/)
        ).toBeInTheDocument();
        expect(screen.getByText(/Federal law requires all financial institutions/)).toBeInTheDocument();
    });

    it('navigates to application type when Start My Application is clicked', async () => {
        const user = userEvent.setup();
        render(<WelcomePage />);

        const startButton = screen.getByRole('button', { name: /Start My Application/i });
        await user.click(startButton);

        await waitFor(() => {
            expect(mockApplication.resetApplication).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/application-type');
        });
    });

    it('shows continue application section when application exists', () => {
        const mockApplicationWithExisting = {
            ...mockApplication,
            state: {
                ...mockApplication.state,
                application: {
                    id: 'app_123',
                    status: 'draft' as const,
                    currentStep: 'personal_info' as const,
                    accountType: 'consumer' as const,
                    customerType: 'new' as const,
                    applicantId: 'applicant_123',
                    createdAt: '2023-01-01T00:00:00Z',
                    updatedAt: '2023-01-01T00:00:00Z',
                    metadata: {}
                },
                currentStep: 'personal_info' as const
            }
        };

        vi.mocked(vi.importMock('../../context/ApplicationContext')).useApplication = () => mockApplicationWithExisting;

        render(<WelcomePage />);

        expect(screen.getByText('Continue Your Application')).toBeInTheDocument();
        expect(screen.getByText(/You have an application in progress/)).toBeInTheDocument();
        expect(screen.getByText(/app_123/)).toBeInTheDocument();
    });

    it('continues existing application when continue button is clicked', async () => {
        const user = userEvent.setup();

        const mockApplicationWithExisting = {
            ...mockApplication,
            state: {
                ...mockApplication.state,
                application: {
                    id: 'app_123',
                    status: 'draft' as const,
                    currentStep: 'personal_info' as const,
                    accountType: 'consumer' as const,
                    customerType: 'new' as const,
                    applicantId: 'applicant_123',
                    createdAt: '2023-01-01T00:00:00Z',
                    updatedAt: '2023-01-01T00:00:00Z',
                    metadata: {}
                },
                currentStep: 'personal_info' as const
            }
        };

        vi.mocked(vi.importMock('../../context/ApplicationContext')).useApplication = () => mockApplicationWithExisting;

        render(<WelcomePage />);

        const continueButton = screen.getByRole('button', { name: /Continue/i });
        await user.click(continueButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/personal-info');
        });
    });

    it('handles user without name gracefully', () => {
        const mockAuthWithoutName = {
            ...mockAuth,
            user: { id: 1, name: null, email: 'john@example.com', role: 'USER' }
        };

        vi.mocked(vi.importMock('../../context/AuthContext')).useAuth = () => mockAuthWithoutName;

        render(<WelcomePage />);

        expect(screen.getByText(/Hello there!/)).toBeInTheDocument();
    });
});
