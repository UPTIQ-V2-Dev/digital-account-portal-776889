# Digital Account Opening Portal - Implementation & Testing Plan

## Overview

A React 19 + Vite + ShadCN UI + Tailwind v4 application for digital account opening supporting both consumer and commercial banking accounts with comprehensive KYC, document verification, and multi-step form workflows.

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6.x
- **UI Library**: ShadCN UI components
- **Styling**: Tailwind CSS v4
- **State Management**: React Context + useReducer
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors
- **File Upload**: React Dropzone
- **Testing**: Vitest + React Testing Library + MSW

## Page-by-Page Implementation Plan

### 1. Authentication & Layout

**Path**: `/login`, `/register`
**Files**:

- `src/pages/auth/LoginPage.tsx`
- `src/pages/auth/RegisterPage.tsx`
- `src/components/layout/AppLayout.tsx`
- `src/components/layout/Header.tsx`

**Components**:

- `LoginForm` - Email/password with validation
- `RegisterForm` - User registration form
- `ProgressStepper` - Application progress indicator
- `AppHeader` - Navigation with user context

**Utils**:

- `src/utils/auth.ts` - Authentication helpers
- `src/services/auth.ts` - API authentication service

**Types**:

- `src/types/auth.ts` - Auth interfaces

**APIs**:

- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration
- `POST /auth/refresh-tokens` - Token refresh

### 2. Welcome/Application Start

**Path**: `/`, `/welcome`
**Files**: `src/pages/WelcomePage.tsx`

**Components**:

- `WelcomeHero` - Welcome banner and information
- `AccountTypeSelector` - Consumer vs Commercial selection
- `PatriotActNotice` - Regulatory notice display
- `GetStartedButton` - CTA to begin application

**Utils**:

- `src/utils/analytics.ts` - User interaction tracking

**APIs**: None (static content)

### 3. Account Type Selection

**Path**: `/application-type`
**Files**: `src/pages/ApplicationTypePage.tsx`

**Components**:

- `AccountTypeCard` - Consumer/Commercial option cards
- `AccountTypeComparison` - Feature comparison table
- `RegulatoryNotices` - Required disclosures

**Types**:

- `src/types/application.ts` - Application type definitions

**APIs**:

- `POST /account-opening/applications` - Create new application

### 4. Personal Information (Consumer)

**Path**: `/personal-info`
**Files**: `src/pages/PersonalInfoPage.tsx`

**Components**:

- `PersonalInfoForm` - Name, DOB, SSN, contact details
- `AddressForm` - Mailing and physical addresses
- `EmploymentForm` - Employment information
- `AddressLookup` - Google Places autocomplete

**Utils**:

- `src/utils/validation.ts` - Form validation schemas
- `src/utils/addressLookup.ts` - Address services
- `src/utils/formatters.ts` - SSN, phone formatting

**Types**:

- `src/types/customer.ts` - Customer data models

**APIs**:

- `PUT /account-opening/applications/{id}/personal-info` - Save personal info
- `GET /account-opening/applications/{id}/personal-info` - Load saved data

### 5. Business Profile (Commercial)

**Path**: `/business-profile`
**Files**: `src/pages/BusinessProfilePage.tsx`

**Components**:

- `BusinessInfoForm` - Business details, EIN, entity type
- `BusinessAddressForm` - Business address information
- `BusinessMetricsForm` - Transaction volumes, cash intensity
- `EntityTypeSelector` - Corporation, LLC, Partnership, etc.

**Utils**:

- `src/utils/businessValidation.ts` - Business-specific validation
- `src/utils/einFormatter.ts` - EIN formatting utilities

**APIs**:

- `PUT /account-opening/applications/{id}/business-profile` - Save business info
- `GET /account-opening/applications/{id}/business-profile` - Load saved data

### 6. Financial Profile

**Path**: `/financial-profile`
**Files**: `src/pages/FinancialProfilePage.tsx`

**Components**:

- `IncomeForm` - Annual income and sources
- `AssetLiabilityForm` - Assets and liabilities
- `BankingHistoryForm` - Existing banking relationships
- `AccountActivityForm` - Expected account usage

**Utils**:

- `src/utils/financialCalculations.ts` - Financial calculations
- `src/utils/currencyFormatter.ts` - Currency formatting

**APIs**:

- `PUT /account-opening/applications/{id}/financial-profile` - Save financial info
- `GET /account-opening/applications/{id}/financial-profile` - Load saved data

### 7. Product Selection

**Path**: `/product-selection`
**Files**: `src/pages/ProductSelectionPage.tsx`

**Components**:

- `ProductGrid` - Available products display
- `ProductCard` - Individual product details
- `ProductComparison` - Side-by-side comparison
- `FeatureSelector` - Optional features selection
- `InitialDepositForm` - Initial deposit amount

**Utils**:

- `src/utils/productEligibility.ts` - Product qualification logic

**APIs**:

- `GET /account-opening/products` - Available products
- `GET /account-opening/applications/{id}/eligible-products` - Eligible products
- `PUT /account-opening/applications/{id}/product-selections` - Save selections

### 8. Document Upload

**Path**: `/documents`
**Files**: `src/pages/DocumentUploadPage.tsx`

**Components**:

- `DocumentUploader` - Drag & drop file upload
- `DocumentTypeSelector` - Required document types
- `CameraCapture` - Mobile camera integration
- `DocumentPreview` - Uploaded document preview
- `DocumentRequirements` - Upload requirements display

**Utils**:

- `src/utils/fileUpload.ts` - File upload handling
- `src/utils/documentValidation.ts` - Client-side validation
- `src/utils/imageProcessing.ts` - Image compression

**Types**:

- `src/types/documents.ts` - Document types and statuses

**APIs**:

- `POST /account-opening/documents/upload` - Upload documents
- `GET /account-opening/applications/{id}/documents` - Get uploaded docs

### 9. Identity Verification (KYC/KYB)

**Path**: `/identity-verification`
**Files**: `src/pages/IdentityVerificationPage.tsx`

**Components**:

- `KYCInitiator` - Start verification process
- `VerificationStatus` - Real-time status display
- `LivenessCheck` - Selfie verification (if required)
- `VerificationResults` - Verification outcome display

**APIs**:

- `POST /account-opening/applications/{id}/kyc/initiate` - Start KYC
- `GET /account-opening/applications/{id}/kyc/status` - Check status

### 10. Additional Signers (Commercial)

**Path**: `/additional-signers`
**Files**: `src/pages/AdditionalSignersPage.tsx`

**Components**:

- `SignersList` - Manage multiple signers
- `SignerForm` - Individual signer information
- `SignerRoleSelector` - Business relationship roles
- `BeneficialOwnershipForm` - Ownership percentage

**Utils**:

- `src/utils/signerValidation.ts` - Signer-specific validation

**APIs**:

- `POST /account-opening/signers` - Add signer
- `PUT /account-opening/signers/{id}` - Update signer
- `GET /account-opening/applications/{id}/signers` - Get all signers

### 11. Risk Assessment Display

**Path**: `/risk-assessment`
**Files**: `src/pages/RiskAssessmentPage.tsx`

**Components**:

- `RiskScoreDisplay` - Risk assessment results
- `RiskFactors` - Contributing risk factors
- `ManualReviewNotice` - Manual review notification
- `NextStepsGuide` - What happens next

**APIs**:

- `POST /account-opening/applications/{id}/risk-assessment` - Perform assessment

### 12. Disclosures & Agreements

**Path**: `/disclosures`
**Files**: `src/pages/DisclosuresPage.tsx`

**Components**:

- `DisclosuresList` - Required disclosures
- `DisclosureViewer` - PDF/document viewer
- `AgreementCheckbox` - Acknowledgment checkboxes
- `ElectronicConsentForm` - E-signature consent

**Utils**:

- `src/utils/pdfViewer.ts` - PDF handling utilities

**APIs**:

- `GET /account-opening/disclosures` - Fetch disclosures
- `POST /account-opening/agreements` - Acknowledge agreements

### 13. Electronic Signatures

**Path**: `/signatures`
**Files**: `src/pages/ElectronicSignaturesPage.tsx`

**Components**:

- `SignaturePad` - Digital signature capture
- `SignaturePreview` - Review captured signatures
- `DocumentSigningList` - Documents to sign
- `W9Form` - W-9 tax certification

**Utils**:

- `src/utils/signatureCapture.ts` - Signature handling
- `src/utils/signatureValidation.ts` - Signature validation

**APIs**:

- `POST /account-opening/signatures` - Save signatures

### 14. Account Funding

**Path**: `/funding`
**Files**: `src/pages/AccountFundingPage.tsx`

**Components**:

- `FundingMethodSelector` - ACH, wire, check options
- `PlaidIntegration` - Bank account connection
- `ACHForm` - Manual ACH setup
- `FundingConfirmation` - Setup confirmation

**Utils**:

- `src/utils/plaidIntegration.ts` - Plaid SDK integration

**APIs**:

- `POST /account-opening/applications/{id}/funding` - Setup funding

### 15. Application Review

**Path**: `/review`
**Files**: `src/pages/ApplicationReviewPage.tsx`

**Components**:

- `ApplicationSummary` - Complete application review
- `EditableSection` - Allow editing previous sections
- `ReviewChecklist` - Completion checklist
- `SubmitConfirmation` - Final submission dialog

**APIs**:

- `GET /account-opening/applications/{id}/summary` - Get summary
- `POST /account-opening/applications/submit` - Submit application

### 16. Confirmation & Next Steps

**Path**: `/confirmation`
**Files**: `src/pages/ConfirmationPage.tsx`

**Components**:

- `SuccessMessage` - Application submitted confirmation
- `ApplicationStatus` - Current status display
- `NextStepsTimeline` - Process timeline
- `ContactInformation` - Support contact details
- `DocumentDownloads` - Download application copies

**APIs**: None (display only)

### 17. Admin Dashboard (Staff Portal)

**Path**: `/admin/*`
**Files**: `src/pages/admin/`

**Components**:

- `AdminDashboard` - Application overview dashboard
- `ApplicationTable` - Sortable/filterable applications
- `ApplicationDetails` - Detailed application view
- `StatusUpdater` - Update application status
- `AuditTrail` - Application history view
- `ComplianceReports` - Compliance reporting

**Utils**:

- `src/utils/adminFilters.ts` - Filtering utilities
- `src/utils/exportData.ts` - Data export functionality

**APIs**:

- `GET /account-opening/admin/applications` - List applications
- `PUT /account-opening/admin/applications/{id}/status` - Update status
- `GET /account-opening/admin/applications/{id}/audit` - Audit trail

## Common Components & Utilities

### Core UI Components (`src/components/ui/`)

- ShadCN UI components (Button, Input, Card, Dialog, etc.)
- `LoadingSpinner` - Loading state indicator
- `ErrorBoundary` - Error boundary wrapper
- `ProgressBar` - Progress indication
- `DataTable` - Sortable/filterable table
- `FormField` - Reusable form field wrapper
- `FileUpload` - File upload component
- `Modal` - Modal dialog wrapper

### Business Components (`src/components/business/`)

- `ApplicationProvider` - Application state context
- `FormPersistence` - Auto-save form data
- `ValidationSummary` - Form validation errors
- `StepNavigation` - Multi-step navigation
- `DocumentViewer` - Document preview component

### Hooks (`src/hooks/`)

- `useApplicationState` - Application state management
- `useFormPersistence` - Auto-save form data
- `useDocumentUpload` - Document upload logic
- `useApiError` - API error handling
- `useStepValidation` - Step validation logic
- `useLocalStorage` - Local storage persistence

### Services (`src/services/`)

- `api.ts` - Axios configuration and interceptors
- `auth.ts` - Authentication service
- `application.ts` - Application API calls
- `documents.ts` - Document upload service
- `kyc.ts` - KYC verification service

### Utils (`src/utils/`)

- `validation.ts` - Zod validation schemas
- `formatters.ts` - Data formatting utilities
- `constants.ts` - Application constants
- `storage.ts` - Local storage management
- `errorHandling.ts` - Error handling utilities

### Context Providers (`src/context/`)

- `ApplicationContext` - Global application state
- `AuthContext` - Authentication state
- `NotificationContext` - Toast notifications

### Types (`src/types/`)

- `api.ts` - API response/request types
- `application.ts` - Application data models
- `customer.ts` - Customer-related types
- `documents.ts` - Document types and statuses
- `products.ts` - Product and account types
- `common.ts` - Shared interfaces

## Testing Strategy

### Test Framework Setup

- **Unit/Component Tests**: Vitest + React Testing Library
- **API Mocking**: MSW (Mock Service Worker)
- **Test Utilities**: Custom render functions with providers
- **Coverage**: 80%+ code coverage target

### Test File Organization

```
src/
├── components/
│   ├── __tests__/
│   │   ├── Button.test.tsx
│   │   └── FormField.test.tsx
├── pages/
│   ├── __tests__/
│   │   ├── LoginPage.test.tsx
│   │   └── PersonalInfoPage.test.tsx
├── hooks/
│   ├── __tests__/
│   │   └── useApplicationState.test.tsx
├── services/
│   ├── __tests__/
│   │   └── auth.test.ts
└── utils/
    ├── __tests__/
    │   └── validation.test.ts
```

### Test Setup Files

- `src/test/setup.ts` - Vitest configuration
- `src/test/test-utils.tsx` - Custom render with providers
- `src/test/mocks/` - MSW mock handlers
- `src/test/fixtures/` - Test data fixtures

### Component Testing Approach

**Form Components**:

```typescript
// Example: PersonalInfoForm.test.tsx
describe('PersonalInfoForm', () => {
  it('validates required fields', async () => {
    render(<PersonalInfoForm />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    expect(screen.getByText('First name is required')).toBeInTheDocument();
    expect(screen.getByText('Last name is required')).toBeInTheDocument();
  });

  it('formats SSN input correctly', async () => {
    render(<PersonalInfoForm />);

    const ssnInput = screen.getByLabelText(/social security/i);
    await user.type(ssnInput, '123456789');

    expect(ssnInput).toHaveValue('123-45-6789');
  });

  it('saves form data on valid submission', async () => {
    const mockSave = vi.fn();
    render(<PersonalInfoForm onSave={mockSave} />);

    await fillOutValidForm();
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(mockSave).toHaveBeenCalledWith(validFormData);
  });
});
```

**Page Testing**:

```typescript
// Example: PersonalInfoPage.test.tsx
describe('PersonalInfoPage', () => {
  it('renders all required form sections', () => {
    render(<PersonalInfoPage />);

    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('Contact Information')).toBeInTheDocument();
    expect(screen.getByText('Employment Information')).toBeInTheDocument();
  });

  it('navigates to next step on valid submission', async () => {
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    render(<PersonalInfoPage />);
    await fillOutValidForm();
    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/financial-profile');
  });

  it('shows error message on API failure', async () => {
    server.use(
      rest.put('/api/account-opening/applications/:id/personal-info',
        (req, res, ctx) => res(ctx.status(500))
      )
    );

    render(<PersonalInfoPage />);
    await fillOutValidForm();
    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(screen.getByText('Failed to save information')).toBeInTheDocument();
  });
});
```

### Service/API Testing

```typescript
// Example: auth.test.ts
describe('AuthService', () => {
    it('stores tokens on successful login', async () => {
        server.use(
            rest.post('/api/auth/login', (req, res, ctx) => res(ctx.json({ tokens: mockTokens, user: mockUser })))
        );

        const result = await authService.login('user@test.com', 'password');

        expect(result.success).toBe(true);
        expect(localStorage.getItem('accessToken')).toBe(mockTokens.access.token);
    });

    it('handles login failure correctly', async () => {
        server.use(
            rest.post('/api/auth/login', (req, res, ctx) =>
                res(ctx.status(401), ctx.json({ message: 'Invalid credentials' }))
            )
        );

        const result = await authService.login('user@test.com', 'wrongpassword');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid credentials');
    });
});
```

### Hook Testing

```typescript
// Example: useApplicationState.test.tsx
describe('useApplicationState', () => {
    it('updates current step correctly', () => {
        const { result } = renderHook(() => useApplicationState(), {
            wrapper: ApplicationProvider
        });

        act(() => {
            result.current.setCurrentStep('personal-info');
        });

        expect(result.current.currentStep).toBe('personal-info');
    });

    it('persists application data to localStorage', () => {
        const { result } = renderHook(() => useApplicationState(), {
            wrapper: ApplicationProvider
        });

        act(() => {
            result.current.updatePersonalInfo(mockPersonalInfo);
        });

        expect(localStorage.getItem('applicationData')).toContain(mockPersonalInfo.firstName);
    });
});
```

### MSW Mock Handlers

```typescript
// src/test/mocks/handlers.ts
export const handlers = [
    rest.post('/api/auth/login', (req, res, ctx) => {
        const { email, password } = req.body as LoginRequest;

        if (email === 'test@example.com' && password === 'password') {
            return res(ctx.json({ tokens: mockTokens, user: mockUser }));
        }

        return res(ctx.status(401), ctx.json({ message: 'Invalid credentials' }));
    }),

    rest.get('/api/account-opening/applications/:id', (req, res, ctx) => {
        const { id } = req.params;
        return res(ctx.json(mockApplications[id as string] || null));
    }),

    rest.put('/api/account-opening/applications/:id/personal-info', (req, res, ctx) => {
        return res(ctx.json({ success: true }));
    })
];
```

### Test Utilities

```typescript
// src/test/test-utils.tsx
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: RenderOptions
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <AuthProvider>
        <ApplicationProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </ApplicationProvider>
      </AuthProvider>
    </BrowserRouter>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

export const createMockApplication = (overrides = {}): Application => ({
  id: 'app_123',
  status: 'draft',
  currentStep: 'account-type',
  accountType: 'consumer',
  ...overrides,
});
```

### Key Test Scenarios

**Form Validation Tests**:

- Required field validation
- Format validation (SSN, phone, email)
- Cross-field validation (confirm email)
- Real-time validation feedback

**State Management Tests**:

- Application state persistence
- Step navigation logic
- Form auto-save functionality
- Error state handling

**Integration Tests**:

- Complete user flow (happy path)
- Error handling scenarios
- Authentication flows
- Document upload workflows

**Accessibility Tests**:

- Screen reader compatibility
- Keyboard navigation
- Focus management
- ARIA labels and roles

### Performance Testing

- Bundle size analysis
- Component rendering performance
- Large form handling
- File upload performance

### E2E Test Strategy (Optional)

- Playwright for critical user journeys
- Cross-browser compatibility testing
- Mobile responsive testing
- Performance monitoring

## Development Phases

### Phase 1: Foundation (Weeks 1-2)

- Project setup (Vite, React 19, TypeScript)
- ShadCN UI + Tailwind v4 configuration
- Authentication system
- Basic routing and layout
- Core utilities and hooks

### Phase 2: Consumer Flow (Weeks 3-5)

- Personal information collection
- Financial profile management
- Product selection
- Document upload
- Basic testing setup

### Phase 3: KYC & Verification (Weeks 6-7)

- Identity verification integration
- Risk assessment display
- Disclosures and agreements
- Electronic signatures

### Phase 4: Commercial Flow (Weeks 8-10)

- Business profile management
- Additional signers
- Enhanced document requirements
- Commercial-specific validations

### Phase 5: Admin & Final Features (Weeks 11-12)

- Admin dashboard
- Application review and approval
- Audit trail functionality
- Account funding setup

### Phase 6: Testing & Polish (Weeks 13-14)

- Comprehensive test suite
- Performance optimization
- Security audit
- Accessibility compliance
- Bug fixes and refinements

## Security Considerations

- PII data encryption in transit and at rest
- Secure file upload handling with virus scanning
- Input sanitization and validation
- CSRF protection
- Secure session management
- Audit logging for all actions
- Rate limiting for API calls
- Content Security Policy implementation

## Performance Optimizations

- Code splitting by route
- Lazy loading of heavy components
- Image optimization for document previews
- Debounced API calls for real-time validation
- Virtual scrolling for large lists
- Memoization of expensive calculations
- Service worker for offline capabilities
- Progressive Web App features

This implementation plan provides a comprehensive roadmap for building a robust, secure, and well-tested Digital Account Opening Portal that meets banking regulatory requirements while delivering excellent user experience.
