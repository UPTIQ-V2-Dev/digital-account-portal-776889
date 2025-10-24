// Application-related types for the Digital Account Opening Portal

export type AccountType = 'consumer' | 'commercial';
export type CustomerType = 'new' | 'existing';
export type ApplicationStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'completed';

export type ApplicationStep =
    | 'account_type'
    | 'personal_info'
    | 'business_profile'
    | 'financial_profile'
    | 'product_selection'
    | 'documents'
    | 'identity_verification'
    | 'additional_signers'
    | 'risk_assessment'
    | 'disclosures'
    | 'signatures'
    | 'funding'
    | 'review'
    | 'confirmation';

export interface Application {
    id: string;
    status: ApplicationStatus;
    currentStep: ApplicationStep;
    accountType: AccountType;
    customerType: CustomerType;
    applicantId: string;
    submittedAt?: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
    metadata: ApplicationMetadata;
}

export interface ApplicationMetadata {
    userAgent?: string;
    ipAddress?: string;
    sessionId?: string;
    startedAt?: string;
    lastActivity?: string;
    source?: string;
}

export interface CreateApplicationRequest {
    accountType: AccountType;
    personalInfo?: Partial<PersonalInfo>;
    businessProfile?: Partial<BusinessProfile>;
}

export interface UpdateApplicationRequest {
    currentStep?: ApplicationStep;
    status?: ApplicationStatus;
    accountType?: AccountType;
}

export interface ApplicationSummary {
    application: Application;
    personalInfo?: PersonalInfo;
    businessProfile?: BusinessProfile;
    financialProfile?: FinancialProfile;
    productSelections: ProductSelection[];
    documents: Document[];
    kycVerification?: KYCVerification;
    additionalSigners: AdditionalSigner[];
    riskAssessment?: RiskAssessment;
    agreements: Agreement[];
    signatures: ElectronicSignature[];
    fundingSetup?: FundingSetup;
}

// Personal Information Types
export interface PersonalInfo {
    firstName: string;
    middleName?: string;
    lastName: string;
    suffix?: string;
    dateOfBirth: string;
    ssn: string;
    phone: string;
    email: string;
    mailingAddress: Address;
    physicalAddress?: Address;
    employmentStatus: string;
    occupation?: string;
    employer?: string;
    workPhone?: string;
}

export interface CreatePersonalInfoRequest {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    ssn: string;
    phone: string;
    email: string;
    mailingAddress: Address;
    employmentStatus: string;
    occupation?: string;
    employer?: string;
    middleName?: string;
    suffix?: string;
    physicalAddress?: Address;
    workPhone?: string;
}

// Business Profile Types
export interface BusinessProfile {
    businessName: string;
    dbaName?: string;
    ein: string;
    entityType: string;
    industryType: string;
    dateEstablished: string;
    businessAddress: Address;
    mailingAddress?: Address;
    businessPhone: string;
    businessEmail: string;
    website?: string;
    description: string;
    isCashIntensive: boolean;
    monthlyTransactionVolume: number;
    monthlyTransactionCount: number;
    expectedBalance: number;
}

export interface CreateBusinessProfileRequest {
    businessName: string;
    ein: string;
    entityType: string;
    industryType: string;
    dateEstablished: string;
    businessAddress: Address;
    businessPhone: string;
    businessEmail: string;
    description: string;
    isCashIntensive: boolean;
    monthlyTransactionVolume: number;
    monthlyTransactionCount: number;
    expectedBalance: number;
    dbaName?: string;
    mailingAddress?: Address;
    website?: string;
}

// Financial Profile Types
export interface FinancialProfile {
    annualIncome: number;
    incomeSource: string[];
    employmentInfo?: Record<string, any>;
    assets: number;
    liabilities: number;
    bankingRelationships: BankingRelationship[];
    accountActivities: AccountActivity[];
}

export interface BankingRelationship {
    bankName: string;
    accountTypes: string[];
    yearsWithBank: number;
}

export interface AccountActivity {
    activity: string;
    frequency: string;
    amount: number;
}

export interface CreateFinancialProfileRequest {
    annualIncome: number;
    incomeSource: string[];
    assets: number;
    liabilities: number;
    bankingRelationships: BankingRelationship[];
    accountActivities: AccountActivity[];
    employmentInfo?: Record<string, any>;
}

// Address Type
export interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    apartment?: string;
}

// Product Types
export interface Product {
    id: string;
    name: string;
    type: string;
    description: string;
    features: string[];
    minimumBalance: number;
    monthlyFee: number;
    interestRate?: number;
    isActive: boolean;
    eligibilityRules: EligibilityRule[];
}

export interface EligibilityRule {
    field: string;
    operator: string;
    value: any;
    description: string;
}

export interface ProductSelection {
    id: string;
    productId: string;
    product: Product;
    selectedFeatures: string[];
    initialDeposit?: number;
}

export interface CreateProductSelectionRequest {
    selections: {
        productId: string;
        selectedFeatures: string[];
        initialDeposit?: number;
    }[];
}

// Document Types
export interface Document {
    id: string;
    applicationId: string;
    type: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
    verificationStatus: 'pending' | 'verified' | 'failed' | 'manual_review';
    verificationDetails?: DocumentVerificationDetails;
    signerId?: string;
}

export interface DocumentVerificationDetails {
    provider: string;
    confidence: number;
    extractedData: Record<string, any>;
    verificationId: string;
    verifiedAt: string;
}

// KYC Types
export interface KYCVerification {
    id: string;
    applicationId: string;
    status: 'pending' | 'passed' | 'failed' | 'manual_review';
    provider: string;
    verificationId: string;
    confidence: number;
    verifiedAt?: string;
    results: KYCResults;
}

export interface KYCResults {
    identity: KYCCheck;
    address: KYCCheck;
    phone: KYCCheck;
    email: KYCCheck;
    ofac: OfacCheck;
}

export interface KYCCheck {
    passed: boolean;
    confidence: number;
}

export interface OfacCheck {
    passed: boolean;
    matches: any[];
}

// Additional Signers
export interface AdditionalSigner {
    id: string;
    applicationId: string;
    personalInfo: PersonalInfo;
    role: string;
    relationshipToBusiness?: string;
    beneficialOwnershipPercentage?: number;
    hasSigningAuthority: boolean;
    kycStatus: 'pending' | 'passed' | 'failed' | 'manual_review';
    documents: Document[];
}

export interface CreateAdditionalSignerRequest {
    applicationId: string;
    personalInfo: CreatePersonalInfoRequest;
    role: string;
    relationshipToBusiness?: string;
    beneficialOwnershipPercentage?: number;
    hasSigningAuthority: boolean;
}

// Risk Assessment
export interface RiskAssessment {
    id: string;
    applicationId: string;
    overallRisk: 'low' | 'medium' | 'high';
    riskScore: number;
    factors: RiskFactor[];
    recommendations: string[];
    requiresManualReview: boolean;
    assessedAt: string;
    assessedBy: string;
}

export interface RiskFactor {
    category: string;
    factor: string;
    weight: number;
    score: number;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
}

// Disclosures and Agreements
export interface Disclosure {
    id: string;
    type: string;
    title: string;
    content: string;
    version: string;
    effectiveDate: string;
    required: boolean;
    applicableFor: string[];
}

export interface Agreement {
    id: string;
    applicationId: string;
    disclosureId: string;
    acknowledged: boolean;
    acknowledgedAt?: string;
    ipAddress: string;
    userAgent: string;
}

export interface CreateAgreementRequest {
    applicationId: string;
    disclosureId: string;
}

// Electronic Signatures
export interface ElectronicSignature {
    id: string;
    applicationId: string;
    signerId: string;
    documentType: string;
    signatureData: string;
    signedAt: string;
    ipAddress: string;
    userAgent: string;
    biometric?: Record<string, any>;
}

export interface CreateElectronicSignatureRequest {
    applicationId: string;
    signatureData: string;
    documentType: string;
}

// Funding Setup
export interface FundingSetup {
    id: string;
    applicationId: string;
    method: 'ach' | 'wire' | 'check' | 'plaid';
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    details: FundingDetails;
    createdAt: string;
    processedAt?: string;
}

export interface FundingDetails {
    bankName?: string;
    accountNumber?: string;
    routingNumber?: string;
    accountType?: 'checking' | 'savings';
    plaidAccountId?: string;
    wireInstructions?: WireInstructions;
}

export interface WireInstructions {
    beneficiaryBank: string;
    beneficiaryAccount: string;
    beneficiaryName: string;
    reference: string;
}

export interface CreateFundingSetupRequest {
    method: 'ach' | 'wire' | 'check' | 'plaid';
    amount: number;
    details: FundingDetails;
}
