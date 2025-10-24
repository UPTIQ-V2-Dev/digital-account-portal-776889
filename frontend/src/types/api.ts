export type PaginatedResponse<T> = {
    results: T[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
};

export type ApiResponse<T> = {
    success: boolean;
    data: T;
    message?: string;
    errors?: string[];
};

export type ErrorResponse = {
    success: false;
    message: string;
    errors?: string[];
    code?: string;
};

// Account Opening API Types
export type ApplicationStatus =
    | 'draft'
    | 'submitted'
    | 'under_review'
    | 'kyc_pending'
    | 'kyc_failed'
    | 'approved'
    | 'rejected'
    | 'completed'
    | 'terminated';

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

export type AccountType = 'consumer' | 'commercial';

export type CustomerType = 'new' | 'existing';

export type IdentificationDocumentType =
    | 'drivers_license'
    | 'state_id'
    | 'passport'
    | 'utility_bill'
    | 'bank_statement'
    | 'articles_incorporation'
    | 'articles_organization'
    | 'certificate_partnership'
    | 'ein_letter'
    | 'business_tax_return';

export type ProductType = 'checking' | 'savings' | 'money_market';

export type KYCStatus = 'pending' | 'passed' | 'failed' | 'needs_review';

export type RiskLevel = 'low' | 'medium' | 'high';

export type FundingMethod = 'ach' | 'wire' | 'check' | 'cash';

export type BusinessEntityType = 'corporation' | 'llc' | 'partnership' | 'sole_proprietorship' | 'nonprofit';

export type EmploymentStatus = 'employed' | 'self_employed' | 'unemployed' | 'retired' | 'student';

export type IncomeSource = 'employment' | 'business' | 'investment' | 'retirement' | 'government' | 'other';

export type SignerRole = 'primary_signer' | 'authorized_signer' | 'beneficial_owner' | 'control_person';

// Configuration and Settings
export type USE_MOCK_DATA = boolean;
