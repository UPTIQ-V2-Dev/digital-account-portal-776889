import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test/test-utils';
import { ApplicationTypePage } from '../ApplicationTypePage';

// Mock the navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

// Mock the application context
const mockSetApplication = vi.fn();
const mockSetCurrentStep = vi.fn();

vi.mock('../../context/ApplicationContext', () => ({
    useApplication: () => ({
        setApplication: mockSetApplication,
        setCurrentStep: mockSetCurrentStep
    })
}));

// Mock the notification context
const mockShowError = vi.fn();

vi.mock('../../context/NotificationContext', () => ({
    useNotification: () => ({
        showError: mockShowError
    })
}));

describe('ApplicationTypePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders account type selection page', () => {
        render(<ApplicationTypePage />);

        expect(screen.getByText('Choose Your Account Type')).toBeInTheDocument();
        expect(screen.getByText('Select the type of account that best fits your needs')).toBeInTheDocument();
    });

    it('displays both account type options', () => {
        render(<ApplicationTypePage />);

        // Consumer account
        expect(screen.getByText('Personal Banking')).toBeInTheDocument();
        expect(screen.getByText('Perfect for individuals and families')).toBeInTheDocument();
        expect(screen.getByText('Personal checking and savings accounts')).toBeInTheDocument();

        // Commercial account
        expect(screen.getByText('Business Banking')).toBeInTheDocument();
        expect(screen.getByText('Designed for businesses and organizations')).toBeInTheDocument();
        expect(screen.getByText('Business checking and savings accounts')).toBeInTheDocument();
    });

    it('allows selecting consumer account type', async () => {
        const user = userEvent.setup();
        render(<ApplicationTypePage />);

        const consumerCard =
            screen.getByText('Personal Banking').closest('div[role="button"]') ||
            screen.getByText('Personal Banking').closest('.cursor-pointer');

        if (consumerCard) {
            await user.click(consumerCard);
        } else {
            // Fallback: click directly on the card text
            await user.click(screen.getByText('Personal Banking'));
        }

        // Check that the card is selected (has selected styling)
        const cardElement = screen.getByText('Personal Banking').closest('div');
        expect(cardElement).toHaveClass('border-blue-500');
    });

    it('allows selecting commercial account type', async () => {
        const user = userEvent.setup();
        render(<ApplicationTypePage />);

        const commercialCard =
            screen.getByText('Business Banking').closest('div[role="button"]') ||
            screen.getByText('Business Banking').closest('.cursor-pointer');

        if (commercialCard) {
            await user.click(commercialCard);
        } else {
            // Fallback: click directly on the card text
            await user.click(screen.getByText('Business Banking'));
        }

        // Check that the card is selected (has selected styling)
        const cardElement = screen.getByText('Business Banking').closest('div');
        expect(cardElement).toHaveClass('border-blue-500');
    });

    it('disables continue button when no account type selected', () => {
        render(<ApplicationTypePage />);

        const continueButton = screen.getByRole('button', { name: /Continue/i });
        expect(continueButton).toBeDisabled();
    });

    it('enables continue button when account type is selected', async () => {
        const user = userEvent.setup();
        render(<ApplicationTypePage />);

        // Select consumer account
        await user.click(screen.getByText('Personal Banking'));

        const continueButton = screen.getByRole('button', { name: /Continue/i });
        expect(continueButton).not.toBeDisabled();
    });

    it('creates consumer application and navigates to personal info', async () => {
        const user = userEvent.setup();
        render(<ApplicationTypePage />);

        // Select consumer account
        await user.click(screen.getByText('Personal Banking'));

        // Click continue
        const continueButton = screen.getByRole('button', { name: /Continue/i });
        await user.click(continueButton);

        // Wait for the mutation to complete and navigation to happen
        await waitFor(() => {
            expect(mockSetCurrentStep).toHaveBeenCalledWith('personal_info');
            expect(mockNavigate).toHaveBeenCalledWith('/personal-info');
        });
    });

    it('creates commercial application and navigates to business profile', async () => {
        const user = userEvent.setup();
        render(<ApplicationTypePage />);

        // Select commercial account
        await user.click(screen.getByText('Business Banking'));

        // Click continue
        const continueButton = screen.getByRole('button', { name: /Continue/i });
        await user.click(continueButton);

        // Wait for the mutation to complete and navigation to happen
        await waitFor(() => {
            expect(mockSetCurrentStep).toHaveBeenCalledWith('business_profile');
            expect(mockNavigate).toHaveBeenCalledWith('/business-profile');
        });
    });

    it('navigates back to welcome page when back button is clicked', async () => {
        const user = userEvent.setup();
        render(<ApplicationTypePage />);

        const backButton = screen.getByRole('button', { name: /Back to Welcome/i });
        await user.click(backButton);

        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('shows loading state during application creation', async () => {
        const user = userEvent.setup();
        render(<ApplicationTypePage />);

        // Select an account type
        await user.click(screen.getByText('Personal Banking'));

        // Click continue to trigger loading state
        const continueButton = screen.getByRole('button', { name: /Continue/i });
        await user.click(continueButton);

        // The button should show loading spinner briefly
        expect(continueButton).toBeDisabled();
    });

    it('displays regulatory notice', () => {
        render(<ApplicationTypePage />);

        expect(screen.getByText('Important Information')).toBeInTheDocument();
        expect(screen.getByText(/Federal law requires all financial institutions/)).toBeInTheDocument();
    });

    it('handles account type selection via keyboard', async () => {
        const user = userEvent.setup();
        render(<ApplicationTypePage />);

        // Tab to the first card and press Enter
        await user.tab();
        await user.keyboard('{Enter}');

        // Check that consumer account is selected
        const cardElement = screen.getByText('Personal Banking').closest('div');
        expect(cardElement).toHaveClass('border-blue-500');
    });
});
