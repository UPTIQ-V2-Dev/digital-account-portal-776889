import type { PaginatedResponse } from '../types/api';
import type { AuthResponse, User } from '../types/user';
import type {
    Application,
    Product,
    PersonalInfo,
    BusinessProfile,
    FinancialProfile,
    Document,
    KYCVerification,
    RiskAssessment
} from '../types/application';

// User Mock Data
export const mockUser: User = {
    id: 1,
    email: 'user@example.com',
    name: 'John Doe',
    role: 'USER',
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

export const mockAdminUser: User = {
    id: 2,
    email: 'admin@example.com',
    name: 'Jane Smith',
    role: 'ADMIN',
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

export const mockUsers: User[] = [mockUser, mockAdminUser];

export const mockAuthResponse: AuthResponse = {
    user: mockUser,
    tokens: {
        access: {
            token: 'mock-access-token',
            expires: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        },
        refresh: {
            token: 'mock-refresh-token',
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
    }
};

export const mockPaginatedUsers: PaginatedResponse<User> = {
    results: mockUsers,
    page: 1,
    limit: 10,
    totalPages: 1,
    totalResults: 2
};

// Application Mock Data
export const mockApplication: Application = {
    id: 'app_mock_123456',
    status: 'draft',
    currentStep: 'account_type',
    accountType: 'consumer',
    customerType: 'new',
    applicantId: 'applicant_123456',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
        userAgent: 'Mozilla/5.0',
        ipAddress: '127.0.0.1',
        sessionId: 'session_123456',
        startedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        source: 'web_portal'
    }
};

// Product Mock Data
export const mockProducts: Product[] = [
    {
        id: 'prod_simple_checking',
        name: 'Simple Checking',
        type: 'checking',
        description:
            'Perfect for everyday banking needs with no monthly maintenance fee when you maintain a $100 minimum daily balance.',
        features: [
            'Online & Mobile Banking',
            'Bill Pay',
            'Mobile Check Deposit',
            'Electronic Statements',
            'Debit Card',
            'ATM Fee Reimbursements'
        ],
        minimumBalance: 100,
        monthlyFee: 10,
        isActive: true,
        eligibilityRules: [
            {
                field: 'age',
                operator: '>=',
                value: 18,
                description: 'Must be 18 years or older'
            }
        ]
    },
    {
        id: 'prod_premium_checking',
        name: 'Premium Checking',
        type: 'checking',
        description: 'Enhanced checking account with premium benefits and higher interest rates.',
        features: [
            'Online & Mobile Banking',
            'Bill Pay',
            'Mobile Check Deposit',
            'Electronic Statements',
            'Debit Card',
            'ATM Fee Reimbursements',
            'Interest Earning',
            'Premium Customer Service',
            'Investment Account Access'
        ],
        minimumBalance: 2500,
        monthlyFee: 25,
        interestRate: 0.5,
        isActive: true,
        eligibilityRules: [
            {
                field: 'age',
                operator: '>=',
                value: 18,
                description: 'Must be 18 years or older'
            },
            {
                field: 'minimum_opening_deposit',
                operator: '>=',
                value: 2500,
                description: 'Minimum opening deposit of $2,500'
            }
        ]
    },
    {
        id: 'prod_savings',
        name: 'High-Yield Savings',
        type: 'savings',
        description: 'Grow your money with competitive interest rates and easy access to funds.',
        features: [
            'Online & Mobile Banking',
            'High Interest Rate',
            'Electronic Statements',
            'No Minimum Balance',
            'FDIC Insured'
        ],
        minimumBalance: 0,
        monthlyFee: 0,
        interestRate: 2.5,
        isActive: true,
        eligibilityRules: [
            {
                field: 'age',
                operator: '>=',
                value: 18,
                description: 'Must be 18 years or older'
            }
        ]
    }
];

// Personal Info Mock Data
export const mockPersonalInfo: PersonalInfo = {
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
};

// Business Profile Mock Data
export const mockBusinessProfile: BusinessProfile = {
    businessName: 'Acme Corporation',
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
    description: 'Technology consulting and software development services',
    isCashIntensive: false,
    monthlyTransactionVolume: 50000,
    monthlyTransactionCount: 100,
    expectedBalance: 25000
};

// Financial Profile Mock Data
export const mockFinancialProfile: FinancialProfile = {
    annualIncome: 75000,
    incomeSource: ['employment'],
    assets: 50000,
    liabilities: 15000,
    bankingRelationships: [
        {
            bankName: 'First National Bank',
            accountTypes: ['Checking', 'Savings'],
            yearsWithBank: 5
        }
    ],
    accountActivities: [
        {
            activity: 'Direct Deposit',
            frequency: 'Monthly',
            amount: 6250
        }
    ]
};

// Document Mock Data
export const mockDocuments: Document[] = [
    {
        id: 'doc_123',
        applicationId: 'app_mock_123456',
        type: 'drivers_license',
        fileName: 'drivers_license.pdf',
        fileSize: 1024576,
        mimeType: 'application/pdf',
        uploadedAt: new Date().toISOString(),
        verificationStatus: 'verified',
        verificationDetails: {
            provider: 'Mock Provider',
            confidence: 0.95,
            extractedData: {
                name: 'John Doe',
                license_number: 'D123456789'
            },
            verificationId: 'verify_123',
            verifiedAt: new Date().toISOString()
        }
    }
];

// KYC Verification Mock Data
export const mockKYCVerification: KYCVerification = {
    id: 'kyc_123',
    applicationId: 'app_mock_123456',
    status: 'passed',
    provider: 'Mock Provider',
    verificationId: 'verify_123',
    confidence: 0.95,
    verifiedAt: new Date().toISOString(),
    results: {
        identity: { passed: true, confidence: 0.95 },
        address: { passed: true, confidence: 0.9 },
        phone: { passed: true, confidence: 0.88 },
        email: { passed: true, confidence: 0.92 },
        ofac: { passed: true, matches: [] }
    }
};

// Risk Assessment Mock Data
export const mockRiskAssessment: RiskAssessment = {
    id: 'risk_123',
    applicationId: 'app_mock_123456',
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
};
