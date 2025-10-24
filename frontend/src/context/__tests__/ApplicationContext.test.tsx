import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { ApplicationProvider, useApplication } from '../ApplicationContext';
import { mockApplication, mockPersonalInfo } from '../../data/mockData';

// Create a wrapper component for the provider
const createWrapper = () => {
    return ({ children }: { children: ReactNode }) => <ApplicationProvider>{children}</ApplicationProvider>;
};

describe('ApplicationContext', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
    });

    it('provides initial state', () => {
        const { result } = renderHook(() => useApplication(), {
            wrapper: createWrapper()
        });

        expect(result.current.state.application).toBeNull();
        expect(result.current.state.personalInfo).toBeNull();
        expect(result.current.state.businessProfile).toBeNull();
        expect(result.current.state.currentStep).toBe('account_type');
        expect(result.current.state.isLoading).toBe(false);
        expect(result.current.state.error).toBeNull();
        expect(result.current.state.hasUnsavedChanges).toBe(false);
        expect(result.current.state.formData).toEqual({});
        expect(result.current.state.validationErrors).toEqual({});
    });

    it('sets application data', () => {
        const { result } = renderHook(() => useApplication(), {
            wrapper: createWrapper()
        });

        act(() => {
            result.current.setApplication(mockApplication);
        });

        expect(result.current.state.application).toEqual(mockApplication);
        expect(result.current.state.currentStep).toBe(mockApplication.currentStep);
        expect(result.current.state.hasUnsavedChanges).toBe(false);
    });

    it('sets personal info data', () => {
        const { result } = renderHook(() => useApplication(), {
            wrapper: createWrapper()
        });

        act(() => {
            result.current.setPersonalInfo(mockPersonalInfo);
        });

        expect(result.current.state.personalInfo).toEqual(mockPersonalInfo);
        expect(result.current.state.hasUnsavedChanges).toBe(true);
    });

    it('updates current step', () => {
        const { result } = renderHook(() => useApplication(), {
            wrapper: createWrapper()
        });

        act(() => {
            result.current.setCurrentStep('personal_info');
        });

        expect(result.current.state.currentStep).toBe('personal_info');
    });

    it('manages loading state', () => {
        const { result } = renderHook(() => useApplication(), {
            wrapper: createWrapper()
        });

        act(() => {
            result.current.setLoading(true);
        });

        expect(result.current.state.isLoading).toBe(true);

        act(() => {
            result.current.setLoading(false);
        });

        expect(result.current.state.isLoading).toBe(false);
    });

    it('manages error state', () => {
        const { result } = renderHook(() => useApplication(), {
            wrapper: createWrapper()
        });

        const errorMessage = 'Something went wrong';

        act(() => {
            result.current.setError(errorMessage);
        });

        expect(result.current.state.error).toBe(errorMessage);
        expect(result.current.state.isLoading).toBe(false);

        act(() => {
            result.current.setError(null);
        });

        expect(result.current.state.error).toBeNull();
    });

    it('updates form data by section', () => {
        const { result } = renderHook(() => useApplication(), {
            wrapper: createWrapper()
        });

        const formData = { firstName: 'John', lastName: 'Doe' };

        act(() => {
            result.current.updateFormData('personalInfo', formData);
        });

        expect(result.current.state.formData.personalInfo).toEqual(formData);
        expect(result.current.state.hasUnsavedChanges).toBe(true);
    });

    it('manages validation errors', () => {
        const { result } = renderHook(() => useApplication(), {
            wrapper: createWrapper()
        });

        const errors = {
            firstName: ['First name is required'],
            email: ['Invalid email format']
        };

        act(() => {
            result.current.setValidationErrors(errors);
        });

        expect(result.current.state.validationErrors).toEqual(errors);

        act(() => {
            result.current.clearValidationErrors('firstName');
        });

        expect(result.current.state.validationErrors).toEqual({
            email: ['Invalid email format']
        });

        act(() => {
            result.current.clearValidationErrors();
        });

        expect(result.current.state.validationErrors).toEqual({});
    });

    it('resets application state', () => {
        const { result } = renderHook(() => useApplication(), {
            wrapper: createWrapper()
        });

        // Set some state first
        act(() => {
            result.current.setApplication(mockApplication);
            result.current.setPersonalInfo(mockPersonalInfo);
            result.current.setCurrentStep('personal_info');
            result.current.setError('Some error');
        });

        // Verify state is set
        expect(result.current.state.application).not.toBeNull();
        expect(result.current.state.personalInfo).not.toBeNull();

        // Reset application
        act(() => {
            result.current.resetApplication();
        });

        // Verify state is reset
        expect(result.current.state.application).toBeNull();
        expect(result.current.state.personalInfo).toBeNull();
        expect(result.current.state.currentStep).toBe('account_type');
        expect(result.current.state.error).toBeNull();
        expect(result.current.state.hasUnsavedChanges).toBe(false);
    });

    it('provides navigation helpers', () => {
        const { result } = renderHook(() => useApplication(), {
            wrapper: createWrapper()
        });

        // Set up application context
        act(() => {
            result.current.setApplication({
                ...mockApplication,
                accountType: 'consumer'
            });
            result.current.setCurrentStep('personal_info');
        });

        // Test navigation helpers
        expect(result.current.canNavigateToStep('account_type')).toBe(true); // Can go back
        expect(result.current.canNavigateToStep('personal_info')).toBe(true); // Current step
        expect(result.current.canNavigateToStep('financial_profile')).toBe(true); // Next step
        expect(result.current.canNavigateToStep('confirmation')).toBe(false); // Too far ahead

        expect(result.current.getPreviousStep()).toBe('account_type');
        expect(result.current.getNextStep()).toBe('financial_profile');
    });

    it('handles step completion checks', () => {
        const { result } = renderHook(() => useApplication(), {
            wrapper: createWrapper()
        });

        // Initially no steps should be completed
        expect(result.current.isStepCompleted('account_type')).toBe(false);
        expect(result.current.isStepCompleted('personal_info')).toBe(false);

        // Set application - account_type should be completed
        act(() => {
            result.current.setApplication(mockApplication);
        });

        expect(result.current.isStepCompleted('account_type')).toBe(true);

        // Set personal info - personal_info should be completed
        act(() => {
            result.current.setPersonalInfo(mockPersonalInfo);
        });

        expect(result.current.isStepCompleted('personal_info')).toBe(true);
    });

    it('persists state to localStorage', () => {
        const { result } = renderHook(() => useApplication(), {
            wrapper: createWrapper()
        });

        act(() => {
            result.current.setApplication(mockApplication);
        });

        // Wait for the debounced localStorage save
        setTimeout(() => {
            const storedData = localStorage.getItem('digital_account_opening_application');
            expect(storedData).toBeTruthy();

            if (storedData) {
                const parsedData = JSON.parse(storedData);
                expect(parsedData.application).toEqual(mockApplication);
            }
        }, 1100); // Wait longer than the debounce timeout
    });

    it('throws error when used outside provider', () => {
        // This should throw an error when useApplication is used without ApplicationProvider
        expect(() => {
            renderHook(() => useApplication());
        }).toThrow('useApplication must be used within an ApplicationProvider');
    });
});
