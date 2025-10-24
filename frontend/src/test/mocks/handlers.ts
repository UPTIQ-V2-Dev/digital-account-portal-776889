import { http, HttpResponse } from 'msw';
import {
    mockAuthResponse,
    mockApplication,
    mockPersonalInfo,
    mockBusinessProfile,
    mockFinancialProfile,
    mockProducts
} from '../../data/mockData';
import { LoginRequest, RegisterRequest } from '../../types/user';
import { CreateApplicationRequest } from '../../types/application';

export const handlers = [
    // Auth handlers
    http.post('/api/v1/auth/login', async ({ request }) => {
        const loginData = (await request.json()) as LoginRequest;

        if (loginData.email === 'test@example.com' && loginData.password === 'password') {
            return HttpResponse.json(mockAuthResponse);
        }

        return HttpResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }),

    // Alternative auth handlers without v1 prefix for testing
    http.post('/api/auth/login', async ({ request }) => {
        const loginData = (await request.json()) as LoginRequest;

        if (loginData.email === 'test@example.com' && loginData.password === 'password') {
            return HttpResponse.json(mockAuthResponse);
        }

        return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }),

    http.post('/api/v1/auth/register', async ({ request }) => {
        const registerData = (await request.json()) as RegisterRequest;

        if (registerData.email && registerData.password && registerData.name) {
            return HttpResponse.json({
                ...mockAuthResponse,
                user: {
                    ...mockAuthResponse.user,
                    name: registerData.name,
                    email: registerData.email
                }
            });
        }

        return HttpResponse.json({ message: 'Invalid registration data' }, { status: 400 });
    }),

    http.post('/api/v1/auth/refresh-tokens', async ({ request }) => {
        const { refreshToken } = (await request.json()) as { refreshToken: string };

        if (refreshToken === 'mock-refresh-token') {
            return HttpResponse.json({
                access: {
                    token: 'new-mock-access-token',
                    expires: new Date(Date.now() + 15 * 60 * 1000).toISOString()
                },
                refresh: {
                    token: 'new-mock-refresh-token',
                    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                }
            });
        }

        return HttpResponse.json({ message: 'Invalid refresh token' }, { status: 401 });
    }),

    http.post('/api/v1/auth/logout', async () => {
        return new HttpResponse(null, { status: 204 });
    }),

    // Application handlers
    http.post('/api/v1/account-opening/applications', async ({ request }) => {
        const applicationData = (await request.json()) as CreateApplicationRequest;

        const newApplication = {
            ...mockApplication,
            id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            accountType: applicationData.accountType,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        return HttpResponse.json({ data: newApplication, success: true });
    }),

    http.get('/api/v1/account-opening/applications/:id', ({ params }) => {
        const { id } = params;
        return HttpResponse.json({
            data: { ...mockApplication, id: id as string },
            success: true
        });
    }),

    http.put('/api/v1/account-opening/applications/:id', async ({ params, request }) => {
        const { id } = params;
        const updateData = await request.json();

        return HttpResponse.json({
            data: {
                ...mockApplication,
                id: id as string,
                ...updateData,
                updatedAt: new Date().toISOString()
            },
            success: true
        });
    }),

    // Personal Info handlers
    http.put('/api/v1/account-opening/applications/:id/personal-info', async ({ params, request }) => {
        const personalInfoData = await request.json();
        return HttpResponse.json({
            data: { ...mockPersonalInfo, ...personalInfoData },
            success: true
        });
    }),

    http.get('/api/v1/account-opening/applications/:id/personal-info', () => {
        return HttpResponse.json({
            data: mockPersonalInfo,
            success: true
        });
    }),

    // Business Profile handlers
    http.put('/api/v1/account-opening/applications/:id/business-profile', async ({ params, request }) => {
        const businessProfileData = await request.json();
        return HttpResponse.json({
            data: { ...mockBusinessProfile, ...businessProfileData },
            success: true
        });
    }),

    http.get('/api/v1/account-opening/applications/:id/business-profile', () => {
        return HttpResponse.json({
            data: mockBusinessProfile,
            success: true
        });
    }),

    // Financial Profile handlers
    http.put('/api/v1/account-opening/applications/:id/financial-profile', async ({ params, request }) => {
        const financialProfileData = await request.json();
        return HttpResponse.json({
            data: { ...mockFinancialProfile, ...financialProfileData },
            success: true
        });
    }),

    http.get('/api/v1/account-opening/applications/:id/financial-profile', () => {
        return HttpResponse.json({
            data: mockFinancialProfile,
            success: true
        });
    }),

    // Products handlers
    http.get('/api/v1/account-opening/products', ({ request }) => {
        const url = new URL(request.url);
        const accountType = url.searchParams.get('accountType');

        let filteredProducts = mockProducts;
        if (accountType) {
            // Filter products based on account type if needed
            filteredProducts = mockProducts;
        }

        return HttpResponse.json(filteredProducts);
    }),

    // Application Summary handler
    http.get('/api/v1/account-opening/applications/:id/summary', ({ params }) => {
        const { id } = params;

        return HttpResponse.json({
            data: {
                application: { ...mockApplication, id: id as string },
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
            },
            success: true
        });
    }),

    // Default error handler for unmatched requests
    http.all('*', ({ request }) => {
        console.warn(`Unhandled ${request.method} request to ${request.url}`);
        return HttpResponse.json({ message: 'API endpoint not implemented in mock' }, { status: 404 });
    })
];
