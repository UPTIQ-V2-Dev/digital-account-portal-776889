import { api } from '@/lib/api';
import { USE_MOCK_DATA } from '@/lib/constants';
import { mockApiDelay } from '@/lib/utils';
import type { ApiResponse } from '@/types/api';
import type {
    Application,
    ApplicationSummary,
    ApplicationListItem,
    ApplicationFilters,
    CreateApplicationInput,
    UpdateApplicationInput,
    SubmitApplicationInput,
    PersonalInfo,
    BusinessProfile,
    FinancialProfile,
    Product,
    ProductSelection,
    Document,
    DocumentUploadRequest,
    KYCVerification,
    AdditionalSigner,
    CreateAdditionalSignerInput,
    UpdateAdditionalSignerInput,
    RiskAssessment,
    Disclosure,
    Agreement,
    ElectronicSignature,
    FundingSetup,
    AuditTrailEntry
} from '@/types/account-opening';

// Mock data for development
const mockApplication: Application = {
    id: 'app_123456789',
    status: 'draft',
    currentStep: 'account_type',
    accountType: 'consumer',
    customerType: 'new',
    applicantId: 'applicant_123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
        userAgent: navigator.userAgent,
        ipAddress: '192.168.1.1',
        sessionId: 'session_123',
        startedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        source: 'web'
    }
};

const mockProducts: Product[] = [
    {
        id: 'prod_simple_checking',
        name: 'Simple Checking',
        type: 'checking',
        description:
            'Online Banking & Bill Pay • Mobile Deposits & Electronic Statements • Monthly Fee of $10 • Minimum Balance of $100',
        features: ['Online Banking', 'Bill Pay', 'Mobile Deposits', 'Electronic Statements'],
        minimumBalance: 100,
        monthlyFee: 10,
        isActive: true,
        eligibilityRules: []
    },
    {
        id: 'prod_simple_savings',
        name: 'Simple Savings',
        type: 'savings',
        description:
            'Online Banking & Bill Pay • Mobile Deposits & Electronic Statements • Monthly Fee of $50 • Minimum Balance of $100,000',
        features: ['Online Banking', 'Bill Pay', 'Mobile Deposits', 'Electronic Statements'],
        minimumBalance: 100000,
        monthlyFee: 50,
        interestRate: 0.05,
        isActive: true,
        eligibilityRules: []
    },
    {
        id: 'prod_community_checking',
        name: 'Community Checking',
        type: 'checking',
        description:
            'Online Banking & Bill Pay • Mobile Deposits & Electronic Statements • Monthly Fee of $10 • Minimum Balance of $100',
        features: ['Online Banking', 'Bill Pay', 'Mobile Deposits', 'Electronic Statements'],
        minimumBalance: 100,
        monthlyFee: 10,
        isActive: true,
        eligibilityRules: []
    },
    {
        id: 'prod_community_money_market',
        name: 'Community Money Market',
        type: 'money_market',
        description:
            'Online Banking & Bill Pay • Mobile Deposits & Electronic Statements • Monthly Fee of $50 • Minimum Balance of $100,000',
        features: ['Online Banking', 'Bill Pay', 'Mobile Deposits', 'Electronic Statements'],
        minimumBalance: 100000,
        monthlyFee: 50,
        interestRate: 0.75,
        isActive: true,
        eligibilityRules: []
    },
    {
        id: 'prod_private_banking_checking',
        name: 'Private Banking Checking',
        type: 'checking',
        description:
            'Online Banking & Bill Pay • Mobile Deposits & Electronic Statements • Monthly Fee of $10 • Minimum Balance of $100',
        features: ['Online Banking', 'Bill Pay', 'Mobile Deposits', 'Electronic Statements'],
        minimumBalance: 100,
        monthlyFee: 10,
        isActive: true,
        eligibilityRules: []
    }
];

const mockDisclosures: Disclosure[] = [
    {
        id: 'disc_consumer_account_agreement',
        type: 'consumer_account_agreement',
        title: 'Consumer Deposit Account Agreement',
        content: 'This agreement governs your consumer deposit account...',
        version: '1.0',
        effectiveDate: '2024-01-01',
        required: true,
        applicableFor: ['consumer']
    },
    {
        id: 'disc_consumer_fee_schedule',
        type: 'consumer_fee_schedule',
        title: 'Consumer Fee Schedule',
        content: 'The following fees apply to your consumer account...',
        version: '1.0',
        effectiveDate: '2024-01-01',
        required: true,
        applicableFor: ['consumer']
    },
    {
        id: 'disc_electronic_signature',
        type: 'electronic_signature_disclosure',
        title: 'Electronic Signature Disclosure',
        content: 'By providing an electronic signature...',
        version: '1.0',
        effectiveDate: '2024-01-01',
        required: true,
        applicableFor: ['consumer', 'commercial']
    }
];

export const accountOpeningService = {
    // Application Management
    createApplication: async (input: CreateApplicationInput): Promise<ApiResponse<Application>> => {
        if (USE_MOCK_DATA) {
            console.log('--- MOCK API: createApplication ---', input);
            await mockApiDelay();
            return {
                success: true,
                data: {
                    ...mockApplication,
                    accountType: input.accountType,
                    id: `app_${Date.now()}`
                }
            };
        }
        const response = await api.post('/account-opening/applications', input);
        return response.data;
    },

    getApplication: async (applicationId: string): Promise<ApiResponse<Application>> => {
        if (USE_MOCK_DATA) {
            console.log('--- MOCK API: getApplication ---', applicationId);
            await mockApiDelay();
            return {
                success: true,
                data: { ...mockApplication, id: applicationId }
            };
        }
        const response = await api.get(`/account-opening/applications/${applicationId}`);
        return response.data;
    },

    updateApplication: async (
        applicationId: string,
        input: UpdateApplicationInput
    ): Promise<ApiResponse<Application>> => {
        if (USE_MOCK_DATA) {
            console.log('--- MOCK API: updateApplication ---', applicationId, input);
            await mockApiDelay();
            return {
                success: true,
                data: {
                    ...mockApplication,
                    id: applicationId,
                    ...input,
                    updatedAt: new Date().toISOString()
                }
            };
        }
        const response = await api.put(`/account-opening/applications/${applicationId}`, input);
        return response.data;
    },

    submitApplication: async (input: SubmitApplicationInput): Promise<ApiResponse<{ submitted: boolean }>> => {
        if (USE_MOCK_DATA) {
            console.log('--- MOCK API: submitApplication ---', input);
            await mockApiDelay();
            return {
                success: true,
                data: { submitted: true }
            };
        }
        const response = await api.post('/account-opening/applications/submit', input);
        return response.data;
    },

    // Personal Information
    updatePersonalInfo: async (
        applicationId: string,
        personalInfo: PersonalInfo
    ): Promise<ApiResponse<PersonalInfo>> => {
        if (USE_MOCK_DATA) {
            console.log('--- MOCK API: updatePersonalInfo ---', applicationId, personalInfo);
            await mockApiDelay();
            return {
                success: true,
                data: personalInfo
            };
        }
        const response = await api.put(`/account-opening/applications/${applicationId}/personal-info`, personalInfo);
        return response.data;
    },

    getPersonalInfo: async (applicationId: string): Promise<ApiResponse<PersonalInfo>> => {
        if (USE_MOCK_DATA) {
            console.log('--- MOCK API: getPersonalInfo ---', applicationId);
            await mockApiDelay();
            return {
                success: true,
                data: {
                    firstName: 'John',
                    lastName: 'Doe',
                    dateOfBirth: '1990-01-15',
                    ssn: '123-45-6789',
                    phone: '555-123-4567',
                    email: 'john.doe@example.com',
                    mailingAddress: {
                        street: '123 Main St',
                        city: 'Anytown',
                        state: 'CA',
                        zipCode: '12345',
                        country: 'US'
                    },
                    employmentStatus: 'employed',
                    occupation: 'Software Engineer',
                    employer: 'Tech Corp'
                }
            };
        }
        const response = await api.get(`/account-opening/applications/${applicationId}/personal-info`);
        return response.data;
    },

    // Business Profile
    updateBusinessProfile: async (
        applicationId: string,
        businessProfile: BusinessProfile
    ): Promise<ApiResponse<BusinessProfile>> => {
        if (USE_MOCK_DATA) {
            console.log('--- MOCK API: updateBusinessProfile ---', applicationId, businessProfile);
            await mockApiDelay();
            return {
                success: true,
                data: businessProfile
            };
        }
        const response = await api.put(
            `/account-opening/applications/${applicationId}/business-profile`,
            businessProfile
        );
        return response.data;
    },

    getBusinessProfile: async (applicationId: string): Promise<ApiResponse<BusinessProfile>> => {
        if (USE_MOCK_DATA) {
            console.log('--- MOCK API: getBusinessProfile ---', applicationId);
            await mockApiDelay();
            return {
                success: true,
                data: {
                    businessName: 'Acme Corp',
                    ein: '12-3456789',
                    entityType: 'corporation',
                    industryType: 'Technology',
                    dateEstablished: '2020-01-01',
                    businessAddress: {
                        street: '456 Business Blvd',
                        city: 'Business City',
                        state: 'CA',
                        zipCode: '54321',
                        country: 'US'
                    },
                    businessPhone: '555-987-6543',
                    businessEmail: 'info@acmecorp.com',
                    description: 'Technology consulting services',
                    isCashIntensive: false,
                    monthlyTransactionVolume: 50000,
                    monthlyTransactionCount: 100,
                    expectedBalance: 25000
                }
            };
        }
        const response = await api.get(`/account-opening/applications/${applicationId}/business-profile`);
        return response.data;
    },

    // Financial Profile
    updateFinancialProfile: async (
        applicationId: string,
        financialProfile: FinancialProfile
    ): Promise<ApiResponse<FinancialProfile>> => {
        if (USE_MOCK_DATA) {
            console.log('--- MOCK API: updateFinancialProfile ---', applicationId, financialProfile);
            await mockApiDelay();
            return {
                success: true,
                data: financialProfile
            };
        }
        const response = await api.put(
            `/account-opening/applications/${applicationId}/financial-profile`,
            financialProfile
        );
        return response.data;
    },

    getFinancialProfile: async (applicationId: string): Promise<ApiResponse<FinancialProfile>> => {
        if (USE_MOCK_DATA) {
            console.log('--- MOCK API: getFinancialProfile ---', applicationId);
            await mockApiDelay();
            return {
                success: true,
                data: {
                    annualIncome: 75000,
                    incomeSource: ['employment'],
                    employmentInfo: {
                        employer: 'Tech Corp',
                        position: 'Software Developer',
                        workAddress: {
                            street: '100 Tech Way',
                            city: 'San Francisco',
                            state: 'CA',
                            zipCode: '94105',
                            country: 'US'
                        },
                        workPhone: '555-123-4567',
                        yearsEmployed: 3,
                        monthlyIncome: 6250
                    },
                    assets: 50000,
                    liabilities: 15000,
                    bankingRelationships: [
                        {
                            bankName: 'Big Bank',
                            accountTypes: ['Checking', 'Savings'],
                            yearsWithBank: 5
                        }
                    ],
                    accountActivities: [
                        {
                            activity: 'Direct Deposit',
                            frequency: 'Monthly',
                            amount: 6250
                        },
                        {
                            activity: 'Bill Pay',
                            frequency: 'Monthly',
                            amount: 2500
                        }
                    ]
                }
            };
        }
        const response = await api.get(`/account-opening/applications/${applicationId}/financial-profile`);
        return response.data;
    },

    // Products
    getProducts: async (accountType?: string): Promise<ApiResponse<Product[]>> => {
        if (USE_MOCK_DATA) {
            console.log('--- MOCK API: getProducts ---', accountType);
            await mockApiDelay();
            return {
                success: true,
                data: mockProducts
            };
        }
        const response = await api.get('/account-opening/products', {
            params: { accountType }
        });
        return response.data;
    },

    getEligibleProducts: async (applicationId: string): Promise<ApiResponse<Product[]>> => {
        if (USE_MOCK_DATA) {
            console.log('--- MOCK API: getEligibleProducts ---', applicationId);
            await mockApiDelay();
            return {
                success: true,
                data: mockProducts
            };
        }
        const response = await api.get(`/account-opening/applications/${applicationId}/eligible-products`);
        return response.data;
    },

    updateProductSelections: async (
        applicationId: string,
        selections: ProductSelection[]
    ): Promise<ApiResponse<ProductSelection[]>> => {
        if (USE_MOCK_DATA) {
            console.log('--- MOCK API: updateProductSelections ---', applicationId, selections);
            await mockApiDelay();
            return {
                success: true,
                data: selections
            };
        }
        const response = await api.put(`/account-opening/applications/${applicationId}/product-selections`, {
            selections
        });
        return response.data;
    },

    // Documents
    uploadDocument: async (request: DocumentUploadRequest): Promise<ApiResponse<Document>> => {
        if (USE_MOCK_DATA) {
            console.log('--- MOCK API: uploadDocument ---', request);
            await mockApiDelay();
            return {
                success: true,
                data: {
                    id: `doc_${Date.now()}`,
                    applicationId: request.applicationId,
                    type: request.documentType,
                    fileName: request.file.name,
                    fileSize: request.file.size,
                    mimeType: request.file.type,
                    uploadedAt: new Date().toISOString(),
                    verificationStatus: 'pending'
                }
            };
        }
        const formData = new FormData();
        formData.append('file', request.file);
        formData.append('documentType', request.documentType);
        formData.append('applicationId', request.applicationId);

        const response = await api.post('/account-opening/documents/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    getDocuments: async (applicationId: string): Promise<ApiResponse<Document[]>> => {
        if (USE_MOCK_DATA) {
            console.log('--- MOCK API: getDocuments ---', applicationId);
            await mockApiDelay();
            return {
                success: true,
                data: []
            };
        }
        const response = await api.get(`/account-opening/applications/${applicationId}/documents`);
        return response.data;
    },

    // KYC/KYB Verification
    initiateKYCVerification: async (applicationId: string): Promise<ApiResponse<KYCVerification>> => {
        if (USE_MOCK_DATA) {
            console.log('--- MOCK API: initiateKYCVerification ---', applicationId);
            await mockApiDelay();
            return {
                success: true,
                data: {
                    id: `kyc_${Date.now()}`,
                    applicationId,
                    status: 'pending',
                    provider: 'Mock Provider',
                    verificationId: `verify_${Date.now()}`,
                    confidence: 0.95,
                    results: {
                        identity: { passed: true, confidence: 0.95 },
                        address: { passed: true, confidence: 0.9 },
                        phone: { passed: true, confidence: 0.88 },
                        email: { passed: true, confidence: 0.92 },
                        ofac: { passed: true, matches: [] }
                    }
                }
            };
        }
        const response = await api.post(`/account-opening/applications/${applicationId}/kyc/initiate`);
        return response.data;
    },

    getKYCStatus: async (applicationId: string): Promise<ApiResponse<KYCVerification>> => {
        if (USE_MOCK_DATA) {
            console.log('--- MOCK API: getKYCStatus ---', applicationId);
            await mockApiDelay();
            return {
                success: true,
                data: {
                    id: `kyc_${Date.now()}`,
                    applicationId,
                    status: 'passed',
                    provider: 'Mock Provider',
                    verificationId: `verify_${Date.now()}`,
                    confidence: 0.95,
                    verifiedAt: new Date().toISOString(),
                    results: {
                        identity: { passed: true, confidence: 0.95 },
                        address: { passed: true, confidence: 0.9 },
                        phone: { passed: true, confidence: 0.88 },
                        email: { passed: true, confidence: 0.92 },
                        ofac: { passed: true, matches: [] }
                    }
                }
            };
        }
        const response = await api.get(`/account-opening/applications/${applicationId}/kyc/status`);
        return response.data;
    },

    // Additional Signers
    addAdditionalSigner: async (input: CreateAdditionalSignerInput): Promise<ApiResponse<AdditionalSigner>> => {
        if (USE_MOCK_DATA) {
            console.log('--- MOCK API: addAdditionalSigner ---', input);
            await mockApiDelay();
            return {
                success: true,
                data: {
                    id: `signer_${Date.now()}`,
                    applicationId: input.applicationId,
                    personalInfo: input.personalInfo,
                    role: input.role,
                    relationshipToBusiness: input.relationshipToBusiness,
                    beneficialOwnershipPercentage: input.beneficialOwnershipPercentage,
                    hasSigningAuthority: input.hasSigningAuthority,
                    kycStatus: 'pending',
                    documents: []
                }
            };
        }
        const response = await api.post('/account-opening/signers', input);
        return response.data;
    },

    updateAdditionalSigner: async (input: UpdateAdditionalSignerInput): Promise<ApiResponse<AdditionalSigner>> => {
        if (USE_MOCK_DATA) {
            console.log('--- MOCK API: updateAdditionalSigner ---', input);
            await mockApiDelay();
            return {
                success: true,
                data: {
                    id: input.id,
                    applicationId: input.applicationId!,
                    personalInfo: input.personalInfo!,
                    role: input.role!,
                    relationshipToBusiness: input.relationshipToBusiness,
                    beneficialOwnershipPercentage: input.beneficialOwnershipPercentage,
                    hasSigningAuthority: input.hasSigningAuthority!,
                    kycStatus: 'pending',
                    documents: []
                }
            };
        }
        const response = await api.put(`/account-opening/signers/${input.id}`, input);
        return response.data;
    },

    getAdditionalSigners: async (applicationId: string): Promise<ApiResponse<AdditionalSigner[]>> => {
        if (USE_MOCK_DATA) {
            console.log('--- MOCK API: getAdditionalSigners ---', applicationId);
            await mockApiDelay();
            return {
                success: true,
                data: []
            };
        }
        const response = await api.get(`/account-opening/applications/${applicationId}/signers`);
        return response.data;
    },

    // Risk Assessment
    performRiskAssessment: async (applicationId: string): Promise<ApiResponse<RiskAssessment>> => {
        if (USE_MOCK_DATA) {
            console.log('--- MOCK API: performRiskAssessment ---', applicationId);
            await mockApiDelay();
            return {
                success: true,
                data: {
                    id: `risk_${Date.now()}`,
                    applicationId,
                    overallRisk: 'low',
                    riskScore: 25,
                    factors: [
                        {
                            category: 'Identity',
                            factor: 'Strong identity verification',
                            weight: 0.3,
                            score: 10,
                            impact: 'positive',
                            description: 'Identity verification passed with high confidence'
                        }
                    ],
                    recommendations: ['Proceed with standard approval process'],
                    requiresManualReview: false,
                    assessedAt: new Date().toISOString(),
                    assessedBy: 'system'
                }
            };
        }
        const response = await api.post(`/account-opening/applications/${applicationId}/risk-assessment`);
        return response.data;
    },

    // Disclosures and Agreements
    getDisclosures: async (accountType: string): Promise<ApiResponse<Disclosure[]>> => {
        if (USE_MOCK_DATA) {
            console.log('--- MOCK API: getDisclosures ---', accountType);
            await mockApiDelay();
            return {
                success: true,
                data: mockDisclosures.filter(d => d.applicableFor.includes(accountType as 'consumer' | 'commercial'))
            };
        }
        const response = await api.get('/account-opening/disclosures', {
            params: { accountType }
        });
        return response.data;
    },

    acknowledgeAgreement: async (applicationId: string, disclosureId: string): Promise<ApiResponse<Agreement>> => {
        if (USE_MOCK_DATA) {
            console.log('--- MOCK API: acknowledgeAgreement ---', applicationId, disclosureId);
            await mockApiDelay();
            return {
                success: true,
                data: {
                    id: `agreement_${Date.now()}`,
                    applicationId,
                    disclosureId,
                    acknowledged: true,
                    acknowledgedAt: new Date().toISOString(),
                    ipAddress: '192.168.1.1',
                    userAgent: navigator.userAgent
                }
            };
        }
        const response = await api.post('/account-opening/agreements', {
            applicationId,
            disclosureId
        });
        return response.data;
    },

    // Electronic Signatures
    captureSignature: async (
        applicationId: string,
        signatureData: string,
        documentType: string
    ): Promise<ApiResponse<ElectronicSignature>> => {
        if (USE_MOCK_DATA) {
            console.log('--- MOCK API: captureSignature ---', applicationId, documentType);
            await mockApiDelay();
            return {
                success: true,
                data: {
                    id: `sig_${Date.now()}`,
                    applicationId,
                    signerId: 'primary_signer',
                    documentType,
                    signatureData,
                    signedAt: new Date().toISOString(),
                    ipAddress: '192.168.1.1',
                    userAgent: navigator.userAgent
                }
            };
        }
        const response = await api.post('/account-opening/signatures', {
            applicationId,
            signatureData,
            documentType
        });
        return response.data;
    },

    // Account Funding
    setupFunding: async (applicationId: string, fundingData: any): Promise<ApiResponse<FundingSetup>> => {
        if (USE_MOCK_DATA) {
            console.log('--- MOCK API: setupFunding ---', applicationId, fundingData);
            await mockApiDelay();
            return {
                success: true,
                data: {
                    id: `funding_${Date.now()}`,
                    applicationId,
                    method: fundingData.method,
                    amount: fundingData.amount,
                    status: 'pending',
                    details: fundingData.details,
                    createdAt: new Date().toISOString()
                }
            };
        }
        const response = await api.post(`/account-opening/applications/${applicationId}/funding`, fundingData);
        return response.data;
    },

    // Application Summary and Review
    getApplicationSummary: async (applicationId: string): Promise<ApiResponse<ApplicationSummary>> => {
        if (USE_MOCK_DATA) {
            console.log('--- MOCK API: getApplicationSummary ---', applicationId);
            await mockApiDelay();
            return {
                success: true,
                data: {
                    application: { ...mockApplication, id: applicationId },
                    productSelections: [],
                    documents: [],
                    additionalSigners: [],
                    agreements: [],
                    signatures: []
                }
            };
        }
        const response = await api.get(`/account-opening/applications/${applicationId}/summary`);
        return response.data;
    },

    // Admin/Staff Portal APIs
    getApplications: async (filters?: ApplicationFilters): Promise<ApiResponse<ApplicationListItem[]>> => {
        if (USE_MOCK_DATA) {
            console.log('--- MOCK API: getApplications ---', filters);
            await mockApiDelay();
            return {
                success: true,
                data: [
                    {
                        id: 'app_123',
                        applicantName: 'John Doe',
                        accountType: 'consumer',
                        status: 'submitted',
                        currentStep: 'identity_verification',
                        riskLevel: 'low',
                        submittedAt: new Date().toISOString(),
                        lastActivity: new Date().toISOString()
                    }
                ]
            };
        }
        const response = await api.get('/account-opening/admin/applications', {
            params: filters
        });
        return response.data;
    },

    updateApplicationStatus: async (
        applicationId: string,
        status: string,
        notes?: string
    ): Promise<ApiResponse<Application>> => {
        if (USE_MOCK_DATA) {
            console.log('--- MOCK API: updateApplicationStatus ---', applicationId, status, notes);
            await mockApiDelay();
            return {
                success: true,
                data: { ...mockApplication, id: applicationId, status: status as any }
            };
        }
        const response = await api.put(`/account-opening/admin/applications/${applicationId}/status`, {
            status,
            notes
        });
        return response.data;
    },

    getAuditTrail: async (applicationId: string): Promise<ApiResponse<AuditTrailEntry[]>> => {
        if (USE_MOCK_DATA) {
            console.log('--- MOCK API: getAuditTrail ---', applicationId);
            await mockApiDelay();
            return {
                success: true,
                data: [
                    {
                        id: 'audit_1',
                        applicationId,
                        action: 'application_created',
                        description: 'Application created',
                        performedBy: 'system',
                        performedAt: new Date().toISOString(),
                        ipAddress: '192.168.1.1',
                        userAgent: navigator.userAgent
                    }
                ]
            };
        }
        const response = await api.get(`/account-opening/admin/applications/${applicationId}/audit`);
        return response.data;
    }
};
