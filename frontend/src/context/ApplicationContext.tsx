import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Application, ApplicationStep } from '@/types/account-opening';
import { AccountType } from '@/types/api';

// Application State
interface ApplicationState {
    currentApplication: Application | null;
    currentStep: ApplicationStep | null;
    completedSteps: ApplicationStep[];
    isLoading: boolean;
    error: string | null;
}

// Action Types
type ApplicationAction =
    | { type: 'SET_APPLICATION'; payload: Application }
    | { type: 'UPDATE_APPLICATION'; payload: Partial<Application> }
    | { type: 'SET_CURRENT_STEP'; payload: ApplicationStep }
    | { type: 'COMPLETE_STEP'; payload: ApplicationStep }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'CLEAR_APPLICATION' };

// Initial State
const initialState: ApplicationState = {
    currentApplication: null,
    currentStep: null,
    completedSteps: [],
    isLoading: false,
    error: null
};

// Reducer
const applicationReducer = (state: ApplicationState, action: ApplicationAction): ApplicationState => {
    switch (action.type) {
        case 'SET_APPLICATION':
            return {
                ...state,
                currentApplication: action.payload,
                currentStep: action.payload.currentStep,
                error: null
            };

        case 'UPDATE_APPLICATION':
            return {
                ...state,
                currentApplication: state.currentApplication ? { ...state.currentApplication, ...action.payload } : null
            };

        case 'SET_CURRENT_STEP':
            return {
                ...state,
                currentStep: action.payload,
                currentApplication: state.currentApplication
                    ? { ...state.currentApplication, currentStep: action.payload }
                    : null
            };

        case 'COMPLETE_STEP':
            if (!state.completedSteps.includes(action.payload)) {
                return {
                    ...state,
                    completedSteps: [...state.completedSteps, action.payload]
                };
            }
            return state;

        case 'SET_LOADING':
            return {
                ...state,
                isLoading: action.payload
            };

        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
                isLoading: false
            };

        case 'CLEAR_APPLICATION':
            return initialState;

        default:
            return state;
    }
};

// Context
interface ApplicationContextType {
    state: ApplicationState;
    setApplication: (application: Application) => void;
    updateApplication: (updates: Partial<Application>) => void;
    setCurrentStep: (step: ApplicationStep) => void;
    completeStep: (step: ApplicationStep) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearApplication: () => void;
    isStepCompleted: (step: ApplicationStep) => boolean;
    getNextStep: (currentStep: ApplicationStep, accountType: AccountType) => ApplicationStep | null;
    getPreviousStep: (currentStep: ApplicationStep, accountType: AccountType) => ApplicationStep | null;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

// Step Flow Configuration
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

// Provider Component
export const ApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(applicationReducer, initialState);

    // Load application from localStorage on mount
    useEffect(() => {
        const savedApplication = localStorage.getItem('currentApplication');
        const savedCompletedSteps = localStorage.getItem('completedSteps');

        if (savedApplication) {
            try {
                const application = JSON.parse(savedApplication);
                dispatch({ type: 'SET_APPLICATION', payload: application });
            } catch (error) {
                console.error('Failed to parse saved application:', error);
            }
        }

        if (savedCompletedSteps) {
            try {
                const completedSteps = JSON.parse(savedCompletedSteps);
                completedSteps.forEach((step: ApplicationStep) => {
                    dispatch({ type: 'COMPLETE_STEP', payload: step });
                });
            } catch (error) {
                console.error('Failed to parse completed steps:', error);
            }
        }
    }, []);

    // Save to localStorage when application changes
    useEffect(() => {
        if (state.currentApplication) {
            localStorage.setItem('currentApplication', JSON.stringify(state.currentApplication));
        }
    }, [state.currentApplication]);

    // Save completed steps to localStorage
    useEffect(() => {
        localStorage.setItem('completedSteps', JSON.stringify(state.completedSteps));
    }, [state.completedSteps]);

    const setApplication = (application: Application) => {
        dispatch({ type: 'SET_APPLICATION', payload: application });
    };

    const updateApplication = (updates: Partial<Application>) => {
        dispatch({ type: 'UPDATE_APPLICATION', payload: updates });
    };

    const setCurrentStep = (step: ApplicationStep) => {
        dispatch({ type: 'SET_CURRENT_STEP', payload: step });
    };

    const completeStep = (step: ApplicationStep) => {
        dispatch({ type: 'COMPLETE_STEP', payload: step });
    };

    const setLoading = (loading: boolean) => {
        dispatch({ type: 'SET_LOADING', payload: loading });
    };

    const setError = (error: string | null) => {
        dispatch({ type: 'SET_ERROR', payload: error });
    };

    const clearApplication = () => {
        localStorage.removeItem('currentApplication');
        localStorage.removeItem('completedSteps');
        dispatch({ type: 'CLEAR_APPLICATION' });
    };

    const isStepCompleted = (step: ApplicationStep): boolean => {
        return state.completedSteps.includes(step);
    };

    const getStepFlow = (accountType: AccountType): ApplicationStep[] => {
        return accountType === 'consumer' ? CONSUMER_STEPS : COMMERCIAL_STEPS;
    };

    const getNextStep = (currentStep: ApplicationStep, accountType: AccountType): ApplicationStep | null => {
        const steps = getStepFlow(accountType);
        const currentIndex = steps.indexOf(currentStep);
        return currentIndex >= 0 && currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null;
    };

    const getPreviousStep = (currentStep: ApplicationStep, accountType: AccountType): ApplicationStep | null => {
        const steps = getStepFlow(accountType);
        const currentIndex = steps.indexOf(currentStep);
        return currentIndex > 0 ? steps[currentIndex - 1] : null;
    };

    const value: ApplicationContextType = {
        state,
        setApplication,
        updateApplication,
        setCurrentStep,
        completeStep,
        setLoading,
        setError,
        clearApplication,
        isStepCompleted,
        getNextStep,
        getPreviousStep
    };

    return <ApplicationContext.Provider value={value}>{children}</ApplicationContext.Provider>;
};

// Hook to use the Application Context
export const useApplication = (): ApplicationContextType => {
    const context = useContext(ApplicationContext);
    if (context === undefined) {
        throw new Error('useApplication must be used within an ApplicationProvider');
    }
    return context;
};
