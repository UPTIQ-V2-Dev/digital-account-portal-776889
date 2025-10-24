import {
    ApplicationStatus,
    ApplicationStep,
    AccountType,
    CustomerType,
    IdentificationDocumentType,
    ProductType,
    KYCStatus,
    RiskLevel,
    FundingMethod,
    BusinessEntityType,
    EmploymentStatus,
    IncomeSource,
    SignerRole
} from './api';

// Re-export the types for easier access
export type {
    ApplicationStatus,
    ApplicationStep,
    AccountType,
    CustomerType,
    IdentificationDocumentType,
    ProductType,
    KYCStatus,
    RiskLevel,
    FundingMethod,
    BusinessEntityType,
    EmploymentStatus,
    IncomeSource,
    SignerRole
};

// Core Application Types
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
    userAgent: string;
    ipAddress: string;
    sessionId: string;
    startedAt: string;
    lastActivity: string;
    source: string; // web, mobile, etc.
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
    employmentStatus: EmploymentStatus;
    occupation?: string;
    employer?: string;
    workPhone?: string;
}

export interface Address {
    street: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

// Business Profile Types
export interface BusinessProfile {
    businessName: string;
    dbaName?: string;
    ein: string;
    entityType: BusinessEntityType;
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

// Financial Profile Types
export interface FinancialProfile {
    annualIncome: number;
    incomeSource: IncomeSource[];
    employmentInfo?: EmploymentInfo;
    assets: number;
    liabilities: number;
    bankingRelationships: BankingRelationship[];
    accountActivities: AccountActivity[];
}

export interface EmploymentInfo {
    employer: string;
    position: string;
    workAddress: Address;
    workPhone: string;
    yearsEmployed: number;
    monthlyIncome: number;
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

// Product Types
export interface Product {
    id: string;
    name: string;
    type: ProductType;
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
    operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in';
    value: string | number | string[];
    description: string;
}

export interface ProductSelection {
    productId: string;
    product: Product;
    selectedFeatures?: string[];
    initialDeposit?: number;
}

// Document Types
export interface Document {
    id: string;
    applicationId: string;
    type: IdentificationDocumentType;
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
    verificationStatus: 'pending' | 'verified' | 'failed';
    verificationDetails?: DocumentVerification;
}

export interface DocumentVerification {
    provider: string;
    confidence: number;
    extractedData: Record<string, string>;
    verificationId: string;
    verifiedAt: string;
    issues?: string[];
}

export interface DocumentUploadRequest {
    applicationId: string;
    documentType: IdentificationDocumentType;
    file: File;
}

// Identity Verification Types
export interface KYCVerification {
    id: string;
    applicationId: string;
    status: KYCStatus;
    provider: string;
    verificationId: string;
    confidence: number;
    verifiedAt?: string;
    results: KYCResults;
}

export interface KYCResults {
    identity: IdentityCheck;
    address: AddressCheck;
    phone: PhoneCheck;
    email: EmailCheck;
    liveness?: LivenessCheck;
    ofac: OFACCheck;
    chexSystems?: ChexSystemsCheck;
}

export interface IdentityCheck {
    passed: boolean;
    confidence: number;
    issues?: string[];
}

export interface AddressCheck {
    passed: boolean;
    confidence: number;
    issues?: string[];
}

export interface PhoneCheck {
    passed: boolean;
    confidence: number;
    issues?: string[];
}

export interface EmailCheck {
    passed: boolean;
    confidence: number;
    issues?: string[];
}

export interface LivenessCheck {
    passed: boolean;
    confidence: number;
    imageUrl?: string;
    issues?: string[];
}

export interface OFACCheck {
    passed: boolean;
    matches: OFACMatch[];
}

export interface OFACMatch {
    name: string;
    type: string;
    confidence: number;
}

export interface ChexSystemsCheck {
    passed: boolean;
    riskScore: number;
    riskLevel: RiskLevel;
    reportId: string;
    issues?: ChexSystemsIssue[];
}

export interface ChexSystemsIssue {
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
}

// Additional Signers Types
export interface AdditionalSigner {
    id: string;
    applicationId: string;
    personalInfo: PersonalInfo;
    role: SignerRole;
    relationshipToBusiness?: string;
    beneficialOwnershipPercentage?: number;
    hasSigningAuthority: boolean;
    kycStatus?: KYCStatus;
    documents?: Document[];
}

export interface CreateAdditionalSignerInput {
    applicationId: string;
    personalInfo: Omit<PersonalInfo, 'id'>;
    role: SignerRole;
    relationshipToBusiness?: string;
    beneficialOwnershipPercentage?: number;
    hasSigningAuthority: boolean;
}

export interface UpdateAdditionalSignerInput extends Partial<CreateAdditionalSignerInput> {
    id: string;
}

// Risk Assessment Types
export interface RiskAssessment {
    id: string;
    applicationId: string;
    overallRisk: RiskLevel;
    riskScore: number;
    factors: RiskFactor[];
    recommendations: string[];
    requiresManualReview: boolean;
    assessedAt: string;
    assessedBy: string; // system or user ID
}

export interface RiskFactor {
    category: string;
    factor: string;
    weight: number;
    score: number;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
}

// Disclosures and Agreements Types
export interface Disclosure {
    id: string;
    type: string;
    title: string;
    content: string;
    version: string;
    effectiveDate: string;
    required: boolean;
    applicableFor: AccountType[];
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

// Electronic Signature Types
export interface ElectronicSignature {
    id: string;
    applicationId: string;
    signerId: string;
    documentType: string;
    signatureData: string;
    signedAt: string;
    ipAddress: string;
    userAgent: string;
    biometric?: BiometricData;
}

export interface BiometricData {
    strokeData: SignatureStroke[];
    duration: number;
    pressure: number[];
}

export interface SignatureStroke {
    x: number;
    y: number;
    time: number;
}

// Account Funding Types
export interface FundingSetup {
    id: string;
    applicationId: string;
    method: FundingMethod;
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    details: FundingDetails;
    createdAt: string;
    processedAt?: string;
}

export interface FundingDetails {
    ach?: ACHDetails;
    wire?: WireDetails;
    check?: CheckDetails;
    plaid?: PlaidDetails;
}

export interface ACHDetails {
    bankName: string;
    accountNumber: string;
    routingNumber: string;
    accountType: 'checking' | 'savings';
}

export interface WireDetails {
    bankName: string;
    accountNumber: string;
    routingNumber: string;
    swiftCode?: string;
    intermediaryBank?: string;
}

export interface CheckDetails {
    payableToName: string;
    mailingAddress: Address;
    memo?: string;
}

export interface PlaidDetails {
    accessToken: string;
    accountId: string;
    institutionId: string;
    institutionName: string;
}

// Application Summary Types
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

// API Request/Response Types
export interface CreateApplicationInput {
    accountType: AccountType;
    personalInfo?: Partial<PersonalInfo>;
    businessProfile?: Partial<BusinessProfile>;
}

export interface UpdateApplicationInput extends Partial<CreateApplicationInput> {
    currentStep?: ApplicationStep;
    status?: ApplicationStatus;
}

export interface SubmitApplicationInput {
    applicationId: string;
    finalReview: boolean;
    electronicConsent: boolean;
}

// Admin Dashboard Types
export interface ApplicationListItem {
    id: string;
    applicantName: string;
    accountType: AccountType;
    status: ApplicationStatus;
    currentStep: ApplicationStep;
    riskLevel?: RiskLevel;
    submittedAt?: string;
    lastActivity: string;
    assignedTo?: string;
}

export interface ApplicationFilters {
    status?: ApplicationStatus[];
    accountType?: AccountType[];
    riskLevel?: RiskLevel[];
    dateFrom?: string;
    dateTo?: string;
    search?: string;
}

export interface AuditTrailEntry {
    id: string;
    applicationId: string;
    action: string;
    description: string;
    performedBy: string;
    performedAt: string;
    ipAddress: string;
    userAgent: string;
    changes?: Record<string, { from: string; to: string }>;
}
