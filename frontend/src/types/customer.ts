// Customer-related types for the Digital Account Opening Portal

import { Address } from './application';

export interface Customer {
    id: string;
    type: 'consumer' | 'business';
    status: 'active' | 'inactive' | 'suspended';
    createdAt: string;
    updatedAt: string;
}

export interface ConsumerCustomer extends Customer {
    type: 'consumer';
    personalInfo: PersonalInfo;
    identityVerification?: IdentityVerificationStatus;
}

export interface BusinessCustomer extends Customer {
    type: 'business';
    businessInfo: BusinessInfo;
    verificationStatus?: BusinessVerificationStatus;
    beneficialOwners: BeneficialOwner[];
    authorizedSigners: AuthorizedSigner[];
}

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
    citizenship: 'us_citizen' | 'permanent_resident' | 'visa_holder' | 'other';
    countryOfBirth?: string;
    employment: EmploymentInfo;
}

export interface EmploymentInfo {
    status: 'employed' | 'self_employed' | 'unemployed' | 'retired' | 'student';
    occupation?: string;
    employer?: string;
    workAddress?: Address;
    workPhone?: string;
    annualIncome?: number;
    employmentLength?: number; // in months
}

export interface BusinessInfo {
    legalName: string;
    dbaName?: string;
    ein: string;
    entityType: BusinessEntityType;
    stateOfIncorporation: string;
    dateOfIncorporation: string;
    businessAddress: Address;
    mailingAddress?: Address;
    phone: string;
    email: string;
    website?: string;
    description: string;
    naicsCode?: string;
    industry: string;
    isPubliclyTraded: boolean;
    stockSymbol?: string;
    businessLicense?: BusinessLicense;
}

export type BusinessEntityType = 'corporation' | 'llc' | 'partnership' | 'sole_proprietorship' | 'trust' | 'non_profit';

export interface BusinessLicense {
    number: string;
    issuingState: string;
    expirationDate: string;
}

export interface BeneficialOwner {
    id: string;
    personalInfo: PersonalInfo;
    ownershipPercentage: number;
    hasControl: boolean;
    relationship: string;
    identityVerified: boolean;
    createdAt: string;
}

export interface AuthorizedSigner {
    id: string;
    personalInfo: PersonalInfo;
    title: string;
    authority: SigningAuthority[];
    isActive: boolean;
    addedAt: string;
}

export type SigningAuthority = 'check_signing' | 'wire_transfers' | 'account_management' | 'all_transactions';

export interface IdentityVerificationStatus {
    status: 'pending' | 'verified' | 'failed' | 'manual_review';
    provider: string;
    verificationId: string;
    verifiedAt?: string;
    confidence?: number;
    failureReason?: string;
    documents: IdentityDocument[];
}

export interface BusinessVerificationStatus {
    status: 'pending' | 'verified' | 'failed' | 'manual_review';
    kybProvider: string;
    verificationId: string;
    verifiedAt?: string;
    confidence?: number;
    failureReason?: string;
    documents: BusinessDocument[];
    beneficialOwnersVerified: boolean;
}

export interface IdentityDocument {
    type: IdentityDocumentType;
    documentId: string;
    status: 'pending' | 'verified' | 'rejected';
    uploadedAt: string;
    verifiedAt?: string;
    extractedData?: Record<string, any>;
}

export type IdentityDocumentType = 'drivers_license' | 'passport' | 'state_id' | 'military_id' | 'tribal_id';

export interface BusinessDocument {
    type: BusinessDocumentType;
    documentId: string;
    status: 'pending' | 'verified' | 'rejected';
    required: boolean;
    uploadedAt: string;
    verifiedAt?: string;
    extractedData?: Record<string, any>;
}

export type BusinessDocumentType =
    | 'articles_of_incorporation'
    | 'operating_agreement'
    | 'partnership_agreement'
    | 'trust_agreement'
    | 'business_license'
    | 'ein_letter'
    | 'certificate_good_standing'
    | 'financial_statements';

export interface CustomerLookupRequest {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    ssn?: string;
    businessName?: string;
    ein?: string;
}

export interface CustomerLookupResponse {
    found: boolean;
    customerId?: string;
    type?: 'consumer' | 'business';
    matchConfidence?: number;
    conflictDetails?: string[];
}

export interface CustomerValidationRequest {
    personalInfo?: Partial<PersonalInfo>;
    businessInfo?: Partial<BusinessInfo>;
}

export interface CustomerValidationResponse {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}

export interface ValidationError {
    field: string;
    message: string;
    code: string;
}

export interface ValidationWarning {
    field: string;
    message: string;
    suggestion?: string;
}

// Risk-related customer types
export interface CustomerRiskProfile {
    customerId: string;
    overallRisk: 'low' | 'medium' | 'high';
    riskScore: number;
    lastAssessment: string;
    factors: CustomerRiskFactor[];
}

export interface CustomerRiskFactor {
    category: 'geographic' | 'identity' | 'financial' | 'behavioral' | 'regulatory';
    factor: string;
    score: number;
    weight: number;
    description: string;
}

// Compliance-related types
export interface ComplianceCheck {
    customerId: string;
    checkType: ComplianceCheckType;
    status: 'pending' | 'passed' | 'failed' | 'manual_review';
    performedAt: string;
    results: Record<string, any>;
    provider?: string;
}

export type ComplianceCheckType = 'ofac' | 'pep' | 'sanctions' | 'adverse_media' | 'chexsystems' | 'credit_check';

export interface ChexSystemsResult {
    score: number;
    reason: string[];
    accountClosed: boolean;
    outstandingBalance: boolean;
    returnedChecks: number;
    inquiries: ChexSystemsInquiry[];
}

export interface ChexSystemsInquiry {
    date: string;
    institution: string;
    purpose: string;
}
