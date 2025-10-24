import { api } from '../lib/api';
import {
    Application,
    CreateApplicationRequest,
    UpdateApplicationRequest,
    ApplicationSummary,
    PersonalInfo,
    CreatePersonalInfoRequest,
    BusinessProfile,
    CreateBusinessProfileRequest,
    FinancialProfile,
    CreateFinancialProfileRequest
} from '../types/application';
import { ApiResponse, SubmitResponse } from '../types/api';

// Mock data imports
import { mockApplication, mockPersonalInfo, mockBusinessProfile, mockFinancialProfile } from '../data/mockData';

// Application CRUD operations
export const createApplication = async (data: CreateApplicationRequest): Promise<Application> => {
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        // Return mock data
        return {
            ...mockApplication,
            accountType: data.accountType,
            id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            metadata: {
                ...mockApplication.metadata,
                startedAt: new Date().toISOString(),
                lastActivity: new Date().toISOString()
            }
        };
    }

    const response = await api.post<ApiResponse<Application>>('/account-opening/applications', data);
    return response.data.data;
};

export const getApplication = async (applicationId: string): Promise<Application> => {
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        return mockApplication;
    }

    const response = await api.get<ApiResponse<Application>>(`/account-opening/applications/${applicationId}`);
    return response.data.data;
};

export const updateApplication = async (
    applicationId: string,
    data: UpdateApplicationRequest
): Promise<Application> => {
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        return {
            ...mockApplication,
            ...data,
            updatedAt: new Date().toISOString()
        };
    }

    const response = await api.put<ApiResponse<Application>>(`/account-opening/applications/${applicationId}`, data);
    return response.data.data;
};

export const submitApplication = async (
    applicationId: string,
    finalReview: boolean,
    electronicConsent: boolean
): Promise<boolean> => {
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        return true;
    }

    const response = await api.post<SubmitResponse>('/account-opening/applications/submit', {
        applicationId,
        finalReview,
        electronicConsent
    });
    return response.data.submitted;
};

export const getApplicationSummary = async (applicationId: string): Promise<ApplicationSummary> => {
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        return {
            application: mockApplication,
            personalInfo: mockPersonalInfo,
            businessProfile: mockBusinessProfile,
            financialProfile: mockFinancialProfile,
            productSelections: [],
            documents: [],
            additionalSigners: [],
            agreements: [],
            signatures: [],
            kycVerification: undefined,
            riskAssessment: undefined,
            fundingSetup: undefined
        };
    }

    const response = await api.get<ApiResponse<ApplicationSummary>>(
        `/account-opening/applications/${applicationId}/summary`
    );
    return response.data.data;
};

// Personal Information operations
export const savePersonalInfo = async (
    applicationId: string,
    data: CreatePersonalInfoRequest
): Promise<PersonalInfo> => {
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        return {
            ...data,
            middleName: data.middleName || undefined,
            suffix: data.suffix || undefined,
            physicalAddress: data.physicalAddress || undefined,
            workPhone: data.workPhone || undefined
        };
    }

    const response = await api.put<ApiResponse<PersonalInfo>>(
        `/account-opening/applications/${applicationId}/personal-info`,
        data
    );
    return response.data.data;
};

export const getPersonalInfo = async (applicationId: string): Promise<PersonalInfo> => {
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        return mockPersonalInfo;
    }

    const response = await api.get<ApiResponse<PersonalInfo>>(
        `/account-opening/applications/${applicationId}/personal-info`
    );
    return response.data.data;
};

// Business Profile operations
export const saveBusinessProfile = async (
    applicationId: string,
    data: CreateBusinessProfileRequest
): Promise<BusinessProfile> => {
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        return {
            ...data,
            dbaName: data.dbaName || undefined,
            mailingAddress: data.mailingAddress || undefined,
            website: data.website || undefined
        };
    }

    const response = await api.put<ApiResponse<BusinessProfile>>(
        `/account-opening/applications/${applicationId}/business-profile`,
        data
    );
    return response.data.data;
};

export const getBusinessProfile = async (applicationId: string): Promise<BusinessProfile> => {
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        return mockBusinessProfile;
    }

    const response = await api.get<ApiResponse<BusinessProfile>>(
        `/account-opening/applications/${applicationId}/business-profile`
    );
    return response.data.data;
};

// Financial Profile operations
export const saveFinancialProfile = async (
    applicationId: string,
    data: CreateFinancialProfileRequest
): Promise<FinancialProfile> => {
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        return {
            ...data,
            employmentInfo: data.employmentInfo || undefined
        };
    }

    const response = await api.put<ApiResponse<FinancialProfile>>(
        `/account-opening/applications/${applicationId}/financial-profile`,
        data
    );
    return response.data.data;
};

export const getFinancialProfile = async (applicationId: string): Promise<FinancialProfile> => {
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        return mockFinancialProfile;
    }

    const response = await api.get<ApiResponse<FinancialProfile>>(
        `/account-opening/applications/${applicationId}/financial-profile`
    );
    return response.data.data;
};
