import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
    Application,
    ApplicationStep,
    PersonalInfo,
    BusinessProfile,
    FinancialProfile,
    ProductSelection,
    Document,
    AdditionalSigner
} from '../types/application';

// State interface
export interface ApplicationState {
    // Current application data
    application: Application | null;
    personalInfo: PersonalInfo | null;
    businessProfile: BusinessProfile | null;
    financialProfile: FinancialProfile | null;
    productSelections: ProductSelection[];
    documents: Document[];
    additionalSigners: AdditionalSigner[];

    // UI state
    currentStep: ApplicationStep;
    isLoading: boolean;
    error: string | null;
    hasUnsavedChanges: boolean;

    // Form state
    formData: Record<string, any>;
    validationErrors: Record<string, string[]>;
}

// Actions
export type ApplicationAction =
    | { type: 'SET_APPLICATION'; payload: Application }
    | { type: 'SET_PERSONAL_INFO'; payload: PersonalInfo }
    | { type: 'SET_BUSINESS_PROFILE'; payload: BusinessProfile }
    | { type: 'SET_FINANCIAL_PROFILE'; payload: FinancialProfile }
    | { type: 'SET_PRODUCT_SELECTIONS'; payload: ProductSelection[] }
    | { type: 'SET_DOCUMENTS'; payload: Document[] }
    | { type: 'ADD_DOCUMENT'; payload: Document }
    | { type: 'UPDATE_DOCUMENT'; payload: { id: string; updates: Partial<Document> } }
    | { type: 'SET_ADDITIONAL_SIGNERS'; payload: AdditionalSigner[] }
    | { type: 'ADD_ADDITIONAL_SIGNER'; payload: AdditionalSigner }
    | { type: 'UPDATE_ADDITIONAL_SIGNER'; payload: { id: string; updates: Partial<AdditionalSigner> } }
    | { type: 'SET_CURRENT_STEP'; payload: ApplicationStep }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_UNSAVED_CHANGES'; payload: boolean }
    | { type: 'UPDATE_FORM_DATA'; payload: { section: string; data: any } }
    | { type: 'SET_VALIDATION_ERRORS'; payload: Record<string, string[]> }
    | { type: 'CLEAR_VALIDATION_ERRORS'; payload?: string }
    | { type: 'RESET_APPLICATION' }
    | { type: 'LOAD_FROM_STORAGE'; payload: ApplicationState };

// Initial state
const initialState: ApplicationState = {
    application: null,
    personalInfo: null,
    businessProfile: null,
    financialProfile: null,
    productSelections: [],
    documents: [],
    additionalSigners: [],
    currentStep: 'account_type',
    isLoading: false,
    error: null,
    hasUnsavedChanges: false,
    formData: {},
    validationErrors: {}
};

// Reducer
const applicationReducer = (state: ApplicationState, action: ApplicationAction): ApplicationState => {
    switch (action.type) {
        case 'SET_APPLICATION':
            return {
                ...state,
                application: action.payload,
                currentStep: action.payload.currentStep,
                hasUnsavedChanges: false
            };

        case 'SET_PERSONAL_INFO':
            return {
                ...state,
                personalInfo: action.payload,
                hasUnsavedChanges: true
            };

        case 'SET_BUSINESS_PROFILE':
            return {
                ...state,
                businessProfile: action.payload,
                hasUnsavedChanges: true
            };

        case 'SET_FINANCIAL_PROFILE':
            return {
                ...state,
                financialProfile: action.payload,
                hasUnsavedChanges: true
            };

        case 'SET_PRODUCT_SELECTIONS':
            return {
                ...state,
                productSelections: action.payload,
                hasUnsavedChanges: true
            };

        case 'SET_DOCUMENTS':
            return {
                ...state,
                documents: action.payload
            };

        case 'ADD_DOCUMENT':
            return {
                ...state,
                documents: [...state.documents, action.payload]
            };

        case 'UPDATE_DOCUMENT':
            return {
                ...state,
                documents: state.documents.map(doc =>
                    doc.id === action.payload.id ? { ...doc, ...action.payload.updates } : doc
                )
            };

        case 'SET_ADDITIONAL_SIGNERS':
            return {
                ...state,
                additionalSigners: action.payload,
                hasUnsavedChanges: true
            };

        case 'ADD_ADDITIONAL_SIGNER':
            return {
                ...state,
                additionalSigners: [...state.additionalSigners, action.payload],
                hasUnsavedChanges: true
            };

        case 'UPDATE_ADDITIONAL_SIGNER':
            return {
                ...state,
                additionalSigners: state.additionalSigners.map(signer =>
                    signer.id === action.payload.id ? { ...signer, ...action.payload.updates } : signer
                ),
                hasUnsavedChanges: true
            };

        case 'SET_CURRENT_STEP':
            return {
                ...state,
                currentStep: action.payload
            };

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

        case 'SET_UNSAVED_CHANGES':
            return {
                ...state,
                hasUnsavedChanges: action.payload
            };

        case 'UPDATE_FORM_DATA':
            return {
                ...state,
                formData: {
                    ...state.formData,
                    [action.payload.section]: action.payload.data
                },
                hasUnsavedChanges: true
            };

        case 'SET_VALIDATION_ERRORS':
            return {
                ...state,
                validationErrors: action.payload
            };

        case 'CLEAR_VALIDATION_ERRORS': {
            const newErrors = { ...state.validationErrors };
            if (action.payload) {
                delete newErrors[action.payload];
            } else {
                Object.keys(newErrors).forEach(key => delete newErrors[key]);
            }
            return {
                ...state,
                validationErrors: newErrors
            };
        }

        case 'RESET_APPLICATION':
            return {
                ...initialState
            };

        case 'LOAD_FROM_STORAGE':
            return {
                ...action.payload
            };

        default:
            return state;
    }
};

// Context
interface ApplicationContextType {
    state: ApplicationState;
    dispatch: React.Dispatch<ApplicationAction>;
    // Helper methods
    setApplication: (application: Application) => void;
    setPersonalInfo: (personalInfo: PersonalInfo) => void;
    setBusinessProfile: (businessProfile: BusinessProfile) => void;
    setFinancialProfile: (financialProfile: FinancialProfile) => void;
    setProductSelections: (selections: ProductSelection[]) => void;
    addDocument: (document: Document) => void;
    updateDocument: (id: string, updates: Partial<Document>) => void;
    addAdditionalSigner: (signer: AdditionalSigner) => void;
    updateAdditionalSigner: (id: string, updates: Partial<AdditionalSigner>) => void;
    setCurrentStep: (step: ApplicationStep) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    updateFormData: (section: string, data: any) => void;
    setValidationErrors: (errors: Record<string, string[]>) => void;
    clearValidationErrors: (section?: string) => void;
    resetApplication: () => void;
    // Navigation helpers
    canNavigateToStep: (step: ApplicationStep) => boolean;
    getNextStep: () => ApplicationStep | null;
    getPreviousStep: () => ApplicationStep | null;
    isStepCompleted: (step: ApplicationStep) => boolean;
}

const ApplicationContext = createContext<ApplicationContextType | null>(null);

// Storage key
const STORAGE_KEY = 'digital_account_opening_application';

// Provider component
interface ApplicationProviderProps {
    children: ReactNode;
}

export const ApplicationProvider = ({ children }: ApplicationProviderProps) => {
    const [state, dispatch] = useReducer(applicationReducer, initialState);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsedState = JSON.parse(saved);
                dispatch({ type: 'LOAD_FROM_STORAGE', payload: parsedState });
            }
        } catch (error) {
            console.warn('Failed to load application state from storage:', error);
        }
    }, []);

    // Save to localStorage whenever state changes (debounced)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            } catch (error) {
                console.warn('Failed to save application state to storage:', error);
            }
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [state]);

    // Helper methods
    const setApplication = (application: Application) => {
        dispatch({ type: 'SET_APPLICATION', payload: application });
    };

    const setPersonalInfo = (personalInfo: PersonalInfo) => {
        dispatch({ type: 'SET_PERSONAL_INFO', payload: personalInfo });
    };

    const setBusinessProfile = (businessProfile: BusinessProfile) => {
        dispatch({ type: 'SET_BUSINESS_PROFILE', payload: businessProfile });
    };

    const setFinancialProfile = (financialProfile: FinancialProfile) => {
        dispatch({ type: 'SET_FINANCIAL_PROFILE', payload: financialProfile });
    };

    const setProductSelections = (selections: ProductSelection[]) => {
        dispatch({ type: 'SET_PRODUCT_SELECTIONS', payload: selections });
    };

    const addDocument = (document: Document) => {
        dispatch({ type: 'ADD_DOCUMENT', payload: document });
    };

    const updateDocument = (id: string, updates: Partial<Document>) => {
        dispatch({ type: 'UPDATE_DOCUMENT', payload: { id, updates } });
    };

    const addAdditionalSigner = (signer: AdditionalSigner) => {
        dispatch({ type: 'ADD_ADDITIONAL_SIGNER', payload: signer });
    };

    const updateAdditionalSigner = (id: string, updates: Partial<AdditionalSigner>) => {
        dispatch({ type: 'UPDATE_ADDITIONAL_SIGNER', payload: { id, updates } });
    };

    const setCurrentStep = (step: ApplicationStep) => {
        dispatch({ type: 'SET_CURRENT_STEP', payload: step });
    };

    const setLoading = (loading: boolean) => {
        dispatch({ type: 'SET_LOADING', payload: loading });
    };

    const setError = (error: string | null) => {
        dispatch({ type: 'SET_ERROR', payload: error });
    };

    const updateFormData = (section: string, data: any) => {
        dispatch({ type: 'UPDATE_FORM_DATA', payload: { section, data } });
    };

    const setValidationErrors = (errors: Record<string, string[]>) => {
        dispatch({ type: 'SET_VALIDATION_ERRORS', payload: errors });
    };

    const clearValidationErrors = (section?: string) => {
        dispatch({ type: 'CLEAR_VALIDATION_ERRORS', payload: section });
    };

    const resetApplication = () => {
        dispatch({ type: 'RESET_APPLICATION' });
        localStorage.removeItem(STORAGE_KEY);
    };

    // Navigation helpers
    const stepOrder: ApplicationStep[] = [
        'account_type',
        'personal_info',
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

    const canNavigateToStep = (step: ApplicationStep): boolean => {
        const currentIndex = stepOrder.indexOf(state.currentStep);
        const targetIndex = stepOrder.indexOf(step);

        // Can navigate backwards
        if (targetIndex < currentIndex) return true;

        // Can navigate to next step only
        if (targetIndex === currentIndex + 1) return true;

        // Can navigate to current step
        if (targetIndex === currentIndex) return true;

        return false;
    };

    const getNextStep = (): ApplicationStep | null => {
        const currentIndex = stepOrder.indexOf(state.currentStep);

        // Skip business_profile for consumer applications
        if (state.application?.accountType === 'consumer' && state.currentStep === 'personal_info') {
            return 'financial_profile';
        }

        // Skip personal_info for commercial applications
        if (state.application?.accountType === 'commercial' && state.currentStep === 'account_type') {
            return 'business_profile';
        }

        // Skip additional_signers for consumer applications
        if (state.application?.accountType === 'consumer' && state.currentStep === 'identity_verification') {
            return 'risk_assessment';
        }

        if (currentIndex < stepOrder.length - 1) {
            return stepOrder[currentIndex + 1];
        }

        return null;
    };

    const getPreviousStep = (): ApplicationStep | null => {
        const currentIndex = stepOrder.indexOf(state.currentStep);

        // Skip business_profile for consumer applications going back
        if (state.application?.accountType === 'consumer' && state.currentStep === 'financial_profile') {
            return 'personal_info';
        }

        // Skip personal_info for commercial applications going back
        if (state.application?.accountType === 'commercial' && state.currentStep === 'business_profile') {
            return 'account_type';
        }

        // Skip additional_signers for consumer applications going back
        if (state.application?.accountType === 'consumer' && state.currentStep === 'risk_assessment') {
            return 'identity_verification';
        }

        if (currentIndex > 0) {
            return stepOrder[currentIndex - 1];
        }

        return null;
    };

    const isStepCompleted = (step: ApplicationStep): boolean => {
        switch (step) {
            case 'account_type':
                return !!state.application;
            case 'personal_info':
                return !!state.personalInfo;
            case 'business_profile':
                return !!state.businessProfile;
            case 'financial_profile':
                return !!state.financialProfile;
            case 'product_selection':
                return state.productSelections.length > 0;
            case 'documents':
                return state.documents.length > 0;
            case 'additional_signers':
                return state.application?.accountType === 'consumer' || state.additionalSigners.length > 0;
            default:
                return false;
        }
    };

    const contextValue: ApplicationContextType = {
        state,
        dispatch,
        setApplication,
        setPersonalInfo,
        setBusinessProfile,
        setFinancialProfile,
        setProductSelections,
        addDocument,
        updateDocument,
        addAdditionalSigner,
        updateAdditionalSigner,
        setCurrentStep,
        setLoading,
        setError,
        updateFormData,
        setValidationErrors,
        clearValidationErrors,
        resetApplication,
        canNavigateToStep,
        getNextStep,
        getPreviousStep,
        isStepCompleted
    };

    return <ApplicationContext.Provider value={contextValue}>{children}</ApplicationContext.Provider>;
};

// Custom hook
export const useApplication = (): ApplicationContextType => {
    const context = useContext(ApplicationContext);
    if (!context) {
        throw new Error('useApplication must be used within an ApplicationProvider');
    }
    return context;
};
