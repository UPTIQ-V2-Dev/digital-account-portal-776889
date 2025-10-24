# Digital Account Opening Portal - Frontend Implementation Plan

## Overview

React 19 + Vite + ShadCN UI + Tailwind v4 application for automated deposit account opening with AI-powered conversational interface.

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **UI Library**: ShadCN UI components
- **Styling**: Tailwind CSS v4
- **State Management**: React Context + useReducer
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **File Upload**: React Dropzone

## Application Architecture

### Core Features

- Consumer & Commercial account opening
- Multi-step wizard with progress tracking
- Document upload & verification
- KYC/AML integration
- Real-time validation
- E-signature capability
- Mobile-responsive design

## Page-by-Page Implementation Plan

### 0. Authentication

**Path**: `/login`
**Files**: `src/pages/LoginPage.tsx`

**Components**:

- Login form with email/password fields
- Remember me functionality
- Forgot password link
- Registration link
- Loading and error states

**Utils**:

- Uses existing `authService` for authentication
- Form validation with React Hook Form + Zod

**APIs**:

- `POST /api/auth/login` - User authentication
- Uses existing auth service in `src/services/auth.ts`

### 1. Layout & Navigation

**Files**: `src/components/layout/`

- `AppLayout.tsx` - Main application wrapper
- `Header.tsx` - Application header with progress indicator
- `Sidebar.tsx` - Navigation sidebar (if needed)
- `Footer.tsx` - Footer component

**Components**:

- Progress stepper component
- Responsive navigation

**APIs**: None

### 2. Welcome/Landing Page

**Path**: `/`
**Files**: `src/pages/Welcome.tsx`

**Components**:

- Welcome hero section
- Account type selector (Consumer/Commercial)
- Getting started information
- Legal disclaimers

**Utils**:

- `src/utils/analytics.ts` - Track user interactions

**APIs**: None

### 3. Application Type Selection

**Path**: `/application-type`
**Files**: `src/pages/ApplicationType.tsx`

**Components**:

- `AccountTypeCard.tsx` - Consumer vs Commercial selection
- `PatriotActNotice.tsx` - Patriot Act information display

**Types**:

- `src/types/application.ts` - Application type definitions

**APIs**: None

### 4. Personal Information (Consumer) / Business Profile (Commercial)

**Path**: `/personal-info` or `/business-profile`
**Files**:

- `src/pages/PersonalInfo.tsx`
- `src/pages/BusinessProfile.tsx`

**Components**:

- `PersonalInfoForm.tsx` - Consumer personal details
- `BusinessInfoForm.tsx` - Business entity information
- `AddressLookup.tsx` - Google Places integration for addresses
- `FormField.tsx` - Reusable form field component

**Utils**:

- `src/utils/validation.ts` - Form validation schemas
- `src/utils/addressLookup.ts` - Address autocomplete

**Types**:

- `src/types/customer.ts` - Customer data models

**APIs**:

- `GET /api/customer/lookup` - Check existing customer
- `POST /api/customer/validate` - Validate customer data

### 5. Financial Profile

**Path**: `/financial-profile`
**Files**: `src/pages/FinancialProfile.tsx`

**Components**:

- `FinancialInfoForm.tsx` - Income, assets, employment
- `ProductRecommendations.tsx` - Dynamic product suggestions

**Utils**:

- `src/utils/productEligibility.ts` - Product qualification logic

**APIs**:

- `POST /api/products/eligible` - Get eligible products based on profile

### 6. Product Selection

**Path**: `/product-selection`
**Files**: `src/pages/ProductSelection.tsx`

**Components**:

- `ProductCard.tsx` - Individual product display
- `ProductComparison.tsx` - Side-by-side comparison
- `FeesSchedule.tsx` - Fee information display

**APIs**:

- `GET /api/products` - Fetch available products
- `GET /api/products/{id}/details` - Product details and fees

### 7. Document Upload

**Path**: `/documents`
**Files**: `src/pages/DocumentUpload.tsx`

**Components**:

- `DocumentUploader.tsx` - Drag & drop file upload
- `DocumentTypeSelector.tsx` - Document type selection
- `CameraCapture.tsx` - Mobile camera integration
- `DocumentPreview.tsx` - Uploaded document preview

**Utils**:

- `src/utils/fileUpload.ts` - File upload handling
- `src/utils/documentValidation.ts` - Client-side validation

**APIs**:

- `POST /api/documents/upload` - Upload documents
- `POST /api/documents/verify` - Verify document authenticity

### 8. Identity Verification

**Path**: `/identity-verification`
**Files**: `src/pages/IdentityVerification.tsx`

**Components**:

- `LivenessCheck.tsx` - Selfie verification component
- `KYCStatus.tsx` - Verification status display
- `VerificationSteps.tsx` - Multi-step verification process

**APIs**:

- `POST /api/kyc/verify` - KYC/KYB verification
- `POST /api/kyc/liveness` - Liveness check
- `GET /api/kyc/status` - Verification status

### 9. Additional Signers

**Path**: `/additional-signers`
**Files**: `src/pages/AdditionalSigners.tsx`

**Components**:

- `SignerForm.tsx` - Individual signer information
- `SignersList.tsx` - Manage multiple signers
- `RelationshipSelector.tsx` - Business relationship selector

**Utils**:

- `src/utils/signerValidation.ts` - Signer-specific validation

**APIs**:

- `POST /api/signers/add` - Add additional signer
- `PUT /api/signers/{id}` - Update signer information

### 10. Risk Assessment & ChexSystems

**Path**: `/risk-assessment`
**Files**: `src/pages/RiskAssessment.tsx`

**Components**:

- `RiskScoreDisplay.tsx` - Risk assessment results
- `ChexSystemsStatus.tsx` - ChexSystems check status
- `ManualReviewNotice.tsx` - Manual review notification

**APIs**:

- `POST /api/risk/assess` - Risk assessment
- `POST /api/chexsystems/check` - ChexSystems verification

### 11. Disclosures & Agreements

**Path**: `/disclosures`
**Files**: `src/pages/Disclosures.tsx`

**Components**:

- `DisclosureViewer.tsx` - PDF/document viewer
- `AgreementsList.tsx` - List of required agreements
- `ElectronicConsent.tsx` - E-signature consent

**Utils**:

- `src/utils/pdfViewer.ts` - PDF handling utilities

**APIs**:

- `GET /api/disclosures/{type}` - Fetch disclosure documents
- `POST /api/agreements/acknowledge` - Record agreement acknowledgment

### 12. Electronic Signatures

**Path**: `/signatures`
**Files**: `src/pages/ElectronicSignatures.tsx`

**Components**:

- `SignaturePad.tsx` - Digital signature capture
- `SignatureReview.tsx` - Review and confirm signatures
- `W9Form.tsx` - W-9 certification for interest-bearing accounts

**Utils**:

- `src/utils/signatureCapture.ts` - Signature handling

**APIs**:

- `POST /api/signatures/capture` - Save signatures
- `POST /api/signatures/finalize` - Finalize signature process

### 13. Account Funding

**Path**: `/funding`
**Files**: `src/pages/AccountFunding.tsx`

**Components**:

- `FundingMethodSelector.tsx` - ACH, wire, check options
- `PlaidConnection.tsx` - Plaid integration for bank connection
- `FundingConfirmation.tsx` - Funding setup confirmation

**APIs**:

- `POST /api/funding/setup` - Setup account funding
- `POST /api/plaid/link` - Plaid integration

### 14. Review & Submit

**Path**: `/review`
**Files**: `src/pages/ApplicationReview.tsx`

**Components**:

- `ApplicationSummary.tsx` - Complete application review
- `EditSection.tsx` - Allow editing of previous sections
- `SubmitConfirmation.tsx` - Final submission confirmation

**APIs**:

- `GET /api/application/summary` - Get application summary
- `POST /api/application/submit` - Submit completed application

### 15. Confirmation & Next Steps

**Path**: `/confirmation`
**Files**: `src/pages/Confirmation.tsx`

**Components**:

- `SuccessMessage.tsx` - Application submitted confirmation
- `NextSteps.tsx` - What happens next information
- `ContactInfo.tsx` - Support contact information

**APIs**:

- `POST /api/cards/order` - Initiate debit card order
- `POST /api/notifications/welcome` - Send welcome communications

### 16. Admin Dashboard (Staff Portal)

**Path**: `/admin/*`
**Files**: `src/pages/admin/`

- `Dashboard.tsx` - Application monitoring dashboard
- `ApplicationDetails.tsx` - Individual application review
- `ComplianceAudit.tsx` - Audit trail and compliance view

**Components**:

- `ApplicationTable.tsx` - Sortable/filterable application list
- `StatusUpdater.tsx` - Update application status
- `AuditTrail.tsx` - View application history

**APIs**:

- `GET /api/admin/applications` - List all applications
- `GET /api/admin/applications/{id}` - Application details
- `PUT /api/admin/applications/{id}/status` - Update status
- `GET /api/admin/audit/{id}` - Audit trail

## Common Components & Utilities

### Core Components (`src/components/ui/`)

- Button, Input, Card, Dialog, Tooltip (ShadCN UI)
- LoadingSpinner, ErrorBoundary, ProgressBar
- Modal, Notification, DataTable

### Utils (`src/utils/`)

- `api.ts` - Axios configuration and interceptors
- `auth.ts` - Authentication utilities
- `storage.ts` - Local storage management
- `formatters.ts` - Data formatting utilities
- `constants.ts` - Application constants

### Hooks (`src/hooks/`)

- `useApplicationState.ts` - Application state management
- `useFormPersistence.ts` - Auto-save form data
- `useDocumentUpload.ts` - Document upload logic
- `useApiError.ts` - API error handling

### Context (`src/context/`)

- `ApplicationContext.tsx` - Global application state
- `AuthContext.tsx` - Authentication state
- `ThemeContext.tsx` - Theme management

### Types (`src/types/`)

- `api.ts` - API response/request types
- `application.ts` - Application data models
- `customer.ts` - Customer-related types
- `documents.ts` - Document types
- `products.ts` - Product and account types

## Key Integration Points

### External Services

- **KYC/KYB Provider** (Alloy, Persona, GBG)
- **ChexSystems** API
- **Core Banking** (Jack Henry, FIS, Finxact)
- **Plaid** for account funding
- **Google Places** for address lookup
- **Document verification** services

### Security Considerations

- PII data encryption
- Secure file upload handling
- HTTPS enforcement
- Input sanitization
- CSRF protection
- Session management

## Development Phases

### Phase 1: Core Infrastructure

- Setup Vite + React 19 project
- Configure ShadCN UI + Tailwind v4
- Implement routing and layout
- Create base components and utilities

### Phase 2: Consumer Flow

- Personal information collection
- Document upload functionality
- Basic KYC integration
- Product selection and agreements

### Phase 3: Commercial Flow

- Business profile collection
- Additional signers management
- Beneficial ownership certification
- Commercial-specific documents

### Phase 4: Advanced Features

- Admin dashboard
- Real-time validation
- Mobile optimization
- Performance optimization

### Phase 5: Integration & Testing

- Full API integration
- End-to-end testing
- Security audit
- Performance testing

## Performance Considerations

- Code splitting by route
- Lazy loading of heavy components
- Image optimization for document previews
- Debounced API calls for validation
- Caching for product information
- Progressive web app features for mobile
