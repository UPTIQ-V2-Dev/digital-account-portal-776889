# API Specification - Digital Account Opening Portal

## Database Models (Prisma Schema)

```prisma
model User {
  id              Int      @id @default(autoincrement())
  email           String   @unique
  name            String?
  password        String
  role            String   @default("USER")
  isEmailVerified Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  tokens          Token[]
  applications    Application[]
}

model Token {
  id          Int       @id @default(autoincrement())
  token       String
  type        String
  expires     DateTime
  blacklisted Boolean
  createdAt   DateTime  @default(now())
  user        User      @relation(fields: [userId], references: [id])
  userId      Int
}

model Application {
  id                  String      @id @default(cuid())
  status              String      @default("draft")
  currentStep         String      @default("account_type")
  accountType         String
  customerType        String      @default("new")
  applicantId         String
  submittedAt         DateTime?
  completedAt         DateTime?
  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt
  userAgent           String?
  ipAddress           String?
  sessionId           String?
  startedAt           DateTime?
  lastActivity        DateTime?
  source              String?
  user                User        @relation(fields: [userId], references: [id])
  userId              Int
  personalInfo        PersonalInfo?
  businessProfile     BusinessProfile?
  financialProfile    FinancialProfile?
  productSelections   ProductSelection[]
  documents           Document[]
  kycVerification     KYCVerification?
  additionalSigners   AdditionalSigner[]
  riskAssessment      RiskAssessment?
  agreements          Agreement[]
  signatures          ElectronicSignature[]
  fundingSetup        FundingSetup?
}

model PersonalInfo {
  id                String      @id @default(cuid())
  firstName         String
  middleName        String?
  lastName          String
  suffix            String?
  dateOfBirth       String
  ssn               String
  phone             String
  email             String
  employmentStatus  String
  occupation        String?
  employer          String?
  workPhone         String?
  mailingStreet     String
  mailingCity       String
  mailingState      String
  mailingZipCode    String
  mailingCountry    String
  mailingApartment  String?
  physicalStreet    String?
  physicalCity      String?
  physicalState     String?
  physicalZipCode   String?
  physicalCountry   String?
  physicalApartment String?
  application       Application @relation(fields: [applicationId], references: [id])
  applicationId     String      @unique
}

model BusinessProfile {
  id                        String      @id @default(cuid())
  businessName              String
  dbaName                   String?
  ein                       String
  entityType                String
  industryType              String
  dateEstablished           String
  businessPhone             String
  businessEmail             String
  website                   String?
  description               String
  isCashIntensive           Boolean
  monthlyTransactionVolume  Float
  monthlyTransactionCount   Int
  expectedBalance           Float
  businessStreet            String
  businessCity              String
  businessState             String
  businessZipCode           String
  businessCountry           String
  businessApartment         String?
  mailingStreet             String?
  mailingCity               String?
  mailingState              String?
  mailingZipCode            String?
  mailingCountry            String?
  mailingApartment          String?
  application               Application @relation(fields: [applicationId], references: [id])
  applicationId             String      @unique
}

model FinancialProfile {
  id                    String                @id @default(cuid())
  annualIncome          Float
  incomeSource          String[]
  employmentInfo        Json?
  assets                Float
  liabilities           Float
  application           Application           @relation(fields: [applicationId], references: [id])
  applicationId         String                @unique
  bankingRelationships  BankingRelationship[]
  accountActivities     AccountActivity[]
}

model BankingRelationship {
  id                String           @id @default(cuid())
  bankName          String
  accountTypes      String[]
  yearsWithBank     Int
  financialProfile  FinancialProfile @relation(fields: [financialProfileId], references: [id])
  financialProfileId String
}

model AccountActivity {
  id                String           @id @default(cuid())
  activity          String
  frequency         String
  amount            Float
  financialProfile  FinancialProfile @relation(fields: [financialProfileId], references: [id])
  financialProfileId String
}

model Product {
  id              String             @id @default(cuid())
  name            String
  type            String
  description     String
  features        String[]
  minimumBalance  Float
  monthlyFee      Float
  interestRate    Float?
  isActive        Boolean            @default(true)
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt
  selections      ProductSelection[]
  eligibilityRules EligibilityRule[]
}

model EligibilityRule {
  id          String  @id @default(cuid())
  field       String
  operator    String
  value       Json
  description String
  product     Product @relation(fields: [productId], references: [id])
  productId   String
}

model ProductSelection {
  id               String      @id @default(cuid())
  selectedFeatures String[]
  initialDeposit   Float?
  application      Application @relation(fields: [applicationId], references: [id])
  applicationId    String
  product          Product     @relation(fields: [productId], references: [id])
  productId        String
}

model Document {
  id                    String      @id @default(cuid())
  type                  String
  fileName              String
  fileSize              Int
  mimeType              String
  uploadedAt            DateTime    @default(now())
  verificationStatus    String      @default("pending")
  verificationProvider  String?
  verificationConfidence Float?
  extractedData         Json?
  verificationId        String?
  verifiedAt            DateTime?
  signerId              String?
  application           Application @relation(fields: [applicationId], references: [id])
  applicationId         String
}

model KYCVerification {
  id                String      @id @default(cuid())
  status            String      @default("pending")
  provider          String
  verificationId    String
  confidence        Float
  verifiedAt        DateTime?
  identityPassed    Boolean?
  identityConfidence Float?
  addressPassed     Boolean?
  addressConfidence Float?
  phonePassed       Boolean?
  phoneConfidence   Float?
  emailPassed       Boolean?
  emailConfidence   Float?
  ofacPassed        Boolean?
  ofacMatches       Json?
  application       Application @relation(fields: [applicationId], references: [id])
  applicationId     String      @unique
}

model AdditionalSigner {
  id                           String      @id @default(cuid())
  role                         String
  relationshipToBusiness       String?
  beneficialOwnershipPercentage Float?
  hasSigningAuthority          Boolean
  kycStatus                    String      @default("pending")
  firstName                    String
  lastName                     String
  dateOfBirth                  String
  ssn                          String
  phone                        String
  email                        String
  application                  Application @relation(fields: [applicationId], references: [id])
  applicationId                String
}

model RiskAssessment {
  id                    String       @id @default(cuid())
  overallRisk           String
  riskScore             Int
  recommendations       String[]
  requiresManualReview  Boolean
  assessedAt            DateTime     @default(now())
  assessedBy            String
  application           Application  @relation(fields: [applicationId], references: [id])
  applicationId         String       @unique
  factors               RiskFactor[]
}

model RiskFactor {
  id              String         @id @default(cuid())
  category        String
  factor          String
  weight          Float
  score           Int
  impact          String
  description     String
  riskAssessment  RiskAssessment @relation(fields: [riskAssessmentId], references: [id])
  riskAssessmentId String
}

model Disclosure {
  id            String      @id @default(cuid())
  type          String
  title         String
  content       String
  version       String
  effectiveDate DateTime
  required      Boolean
  applicableFor String[]
  agreements    Agreement[]
}

model Agreement {
  id             String      @id @default(cuid())
  acknowledged   Boolean     @default(false)
  acknowledgedAt DateTime?
  ipAddress      String
  userAgent      String
  application    Application @relation(fields: [applicationId], references: [id])
  applicationId  String
  disclosure     Disclosure  @relation(fields: [disclosureId], references: [id])
  disclosureId   String
}

model ElectronicSignature {
  id            String      @id @default(cuid())
  signerId      String
  documentType  String
  signatureData String
  signedAt      DateTime    @default(now())
  ipAddress     String
  userAgent     String
  biometric     Json?
  application   Application @relation(fields: [applicationId], references: [id])
  applicationId String
}

model FundingSetup {
  id             String      @id @default(cuid())
  method         String
  amount         Float
  status         String      @default("pending")
  bankName       String?
  accountNumber  String?
  routingNumber  String?
  accountType    String?
  plaidAccountId String?
  wireInstructions Json?
  createdAt      DateTime    @default(now())
  processedAt    DateTime?
  application    Application @relation(fields: [applicationId], references: [id])
  applicationId  String      @unique
}
```

---

## Authentication Endpoints

EP: POST /auth/register
DESC: Register a new user account.
IN: body:{name:str!, email:str!, password:str!}
OUT: 201:{user:{id:int, email:str, name:str, role:str, isEmailVerified:bool, createdAt:str, updatedAt:str}, tokens:{access:{token:str, expires:str}, refresh:{token:str, expires:str}}}
ERR: {"400":"Email already exists or invalid input", "500":"Internal server error"}
EX_REQ: curl -X POST /auth/register -H "Content-Type: application/json" -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
EX_RES_201: {"user":{"id":1,"email":"john@example.com","name":"John Doe","role":"USER","isEmailVerified":false,"createdAt":"2025-09-13T14:30:45Z","updatedAt":"2025-09-13T14:30:45Z"},"tokens":{"access":{"token":"jwt-token","expires":"2025-09-13T15:30:45Z"},"refresh":{"token":"refresh-token","expires":"2025-09-20T14:30:45Z"}}}

---

EP: POST /auth/login
DESC: Authenticate user and return access tokens.
IN: body:{email:str!, password:str!}
OUT: 200:{user:{id:int, email:str, name:str, role:str, isEmailVerified:bool, createdAt:str, updatedAt:str}, tokens:{access:{token:str, expires:str}, refresh:{token:str, expires:str}}}
ERR: {"401":"Invalid email or password", "500":"Internal server error"}
EX_REQ: curl -X POST /auth/login -H "Content-Type: application/json" -d '{"email":"john@example.com","password":"password123"}'
EX_RES_200: {"user":{"id":1,"email":"john@example.com","name":"John Doe","role":"USER","isEmailVerified":false,"createdAt":"2025-09-13T14:30:45Z","updatedAt":"2025-09-13T14:30:45Z"},"tokens":{"access":{"token":"jwt-token","expires":"2025-09-13T15:30:45Z"},"refresh":{"token":"refresh-token","expires":"2025-09-20T14:30:45Z"}}}

---

EP: POST /auth/logout
DESC: Logout user and invalidate refresh token.
IN: body:{refreshToken:str!}
OUT: 204:{}
ERR: {"404":"Refresh token not found", "500":"Internal server error"}
EX_REQ: curl -X POST /auth/logout -H "Content-Type: application/json" -d '{"refreshToken":"refresh-token"}'
EX_RES_204: {}

---

EP: POST /auth/refresh-tokens
DESC: Refresh access and refresh tokens.
IN: body:{refreshToken:str!}
OUT: 200:{access:{token:str, expires:str}, refresh:{token:str, expires:str}}
ERR: {"401":"Invalid refresh token", "500":"Internal server error"}
EX_REQ: curl -X POST /auth/refresh-tokens -H "Content-Type: application/json" -d '{"refreshToken":"refresh-token"}'
EX_RES_200: {"access":{"token":"new-jwt-token","expires":"2025-09-13T15:30:45Z"},"refresh":{"token":"new-refresh-token","expires":"2025-09-20T14:30:45Z"}}

---

EP: POST /auth/forgot-password
DESC: Send password reset email to user.
IN: body:{email:str!}
OUT: 204:{}
ERR: {"404":"Email not found", "500":"Internal server error"}
EX_REQ: curl -X POST /auth/forgot-password -H "Content-Type: application/json" -d '{"email":"john@example.com"}'
EX_RES_204: {}

---

EP: POST /auth/reset-password
DESC: Reset user password using reset token.
IN: query:{token:str!}, body:{password:str!}
OUT: 204:{}
ERR: {"401":"Invalid or expired token", "400":"Invalid password format", "500":"Internal server error"}
EX_REQ: curl -X POST "/auth/reset-password?token=reset-token" -H "Content-Type: application/json" -d '{"password":"newpassword123"}'
EX_RES_204: {}

---

EP: POST /auth/verify-email
DESC: Verify user email using verification token.
IN: query:{token:str!}
OUT: 204:{}
ERR: {"401":"Invalid or expired token", "500":"Internal server error"}
EX_REQ: curl -X POST "/auth/verify-email?token=verify-token"
EX_RES_204: {}

---

EP: POST /auth/send-verification-email
DESC: Send verification email to authenticated user.
IN: headers:{Authorization:str!}
OUT: 204:{}
ERR: {"401":"Unauthorized", "500":"Internal server error"}
EX_REQ: curl -X POST /auth/send-verification-email -H "Authorization: Bearer jwt-token"
EX_RES_204: {}

---

## User Management Endpoints

EP: POST /users
DESC: Create a new user (admin only).
IN: headers:{Authorization:str!}, body:{name:str!, email:str!, password:str!, role:str!}
OUT: 201:{id:int, email:str, name:str, role:str, isEmailVerified:bool, createdAt:str, updatedAt:str}
ERR: {"400":"Email already exists or invalid input", "401":"Unauthorized", "403":"Forbidden", "500":"Internal server error"}
EX_REQ: curl -X POST /users -H "Authorization: Bearer admin-jwt-token" -H "Content-Type: application/json" -d '{"name":"Jane Doe","email":"jane@example.com","password":"password123","role":"USER"}'
EX_RES_201: {"id":2,"email":"jane@example.com","name":"Jane Doe","role":"USER","isEmailVerified":false,"createdAt":"2025-09-13T14:30:45Z","updatedAt":"2025-09-13T14:30:45Z"}

---

EP: GET /users
DESC: Get all users with pagination and filtering (admin only).
IN: headers:{Authorization:str!}, query:{name:str, role:str, sortBy:str, limit:int, page:int}
OUT: 200:{results:arr[obj], page:int, limit:int, totalPages:int, totalResults:int}
ERR: {"401":"Unauthorized", "403":"Forbidden", "500":"Internal server error"}
EX_REQ: curl -X GET "/users?page=1&limit=10&role=USER" -H "Authorization: Bearer admin-jwt-token"
EX_RES_200: {"results":[{"id":1,"email":"john@example.com","name":"John Doe","role":"USER","isEmailVerified":false,"createdAt":"2025-09-13T14:30:45Z","updatedAt":"2025-09-13T14:30:45Z"}],"page":1,"limit":10,"totalPages":1,"totalResults":1}

---

EP: GET /users/{userId}
DESC: Get user by ID (users can get own info, admins can get any).
IN: headers:{Authorization:str!}, params:{userId:int!}
OUT: 200:{id:int, email:str, name:str, role:str, isEmailVerified:bool, createdAt:str, updatedAt:str}
ERR: {"401":"Unauthorized", "403":"Forbidden", "404":"User not found", "500":"Internal server error"}
EX_REQ: curl -X GET /users/1 -H "Authorization: Bearer jwt-token"
EX_RES_200: {"id":1,"email":"john@example.com","name":"John Doe","role":"USER","isEmailVerified":false,"createdAt":"2025-09-13T14:30:45Z","updatedAt":"2025-09-13T14:30:45Z"}

---

EP: PATCH /users/{userId}
DESC: Update user information (users can update own info, admins can update any).
IN: headers:{Authorization:str!}, params:{userId:int!}, body:{name:str, email:str, password:str}
OUT: 200:{id:int, email:str, name:str, role:str, isEmailVerified:bool, createdAt:str, updatedAt:str}
ERR: {"400":"Invalid input or email already exists", "401":"Unauthorized", "403":"Forbidden", "404":"User not found", "500":"Internal server error"}
EX_REQ: curl -X PATCH /users/1 -H "Authorization: Bearer jwt-token" -H "Content-Type: application/json" -d '{"name":"John Smith"}'
EX_RES_200: {"id":1,"email":"john@example.com","name":"John Smith","role":"USER","isEmailVerified":false,"createdAt":"2025-09-13T14:30:45Z","updatedAt":"2025-09-13T14:30:45Z"}

---

EP: DELETE /users/{userId}
DESC: Delete user (users can delete themselves, admins can delete any).
IN: headers:{Authorization:str!}, params:{userId:int!}
OUT: 204:{}
ERR: {"401":"Unauthorized", "403":"Forbidden", "404":"User not found", "500":"Internal server error"}
EX_REQ: curl -X DELETE /users/1 -H "Authorization: Bearer jwt-token"
EX_RES_204: {}

---

## Application Management Endpoints

EP: POST /account-opening/applications
DESC: Create a new account opening application.
IN: headers:{Authorization:str!}, body:{accountType:str!}
OUT: 201:{id:str, status:str, currentStep:str, accountType:str, customerType:str, applicantId:str, createdAt:str, updatedAt:str, metadata:obj}
ERR: {"400":"Invalid input", "401":"Unauthorized", "500":"Internal server error"}
EX_REQ: curl -X POST /account-opening/applications -H "Authorization: Bearer jwt-token" -H "Content-Type: application/json" -d '{"accountType":"consumer"}'
EX_RES_201: {"id":"app_123456","status":"draft","currentStep":"account_type","accountType":"consumer","customerType":"new","applicantId":"applicant_123","createdAt":"2025-09-13T14:30:45Z","updatedAt":"2025-09-13T14:30:45Z","metadata":{"userAgent":"Mozilla/5.0","ipAddress":"127.0.0.1","sessionId":"session_123","startedAt":"2025-09-13T14:30:45Z","lastActivity":"2025-09-13T14:30:45Z","source":"web_portal"}}

---

EP: GET /account-opening/applications/{applicationId}
DESC: Get application details by ID.
IN: headers:{Authorization:str!}, params:{applicationId:str!}
OUT: 200:{id:str, status:str, currentStep:str, accountType:str, customerType:str, applicantId:str, submittedAt:str, completedAt:str, createdAt:str, updatedAt:str, metadata:obj}
ERR: {"401":"Unauthorized", "404":"Application not found", "500":"Internal server error"}
EX_REQ: curl -X GET /account-opening/applications/app_123456 -H "Authorization: Bearer jwt-token"
EX_RES_200: {"id":"app_123456","status":"draft","currentStep":"personal_info","accountType":"consumer","customerType":"new","applicantId":"applicant_123","createdAt":"2025-09-13T14:30:45Z","updatedAt":"2025-09-13T14:30:45Z","metadata":{"userAgent":"Mozilla/5.0","ipAddress":"127.0.0.1","sessionId":"session_123","startedAt":"2025-09-13T14:30:45Z","lastActivity":"2025-09-13T14:30:45Z","source":"web_portal"}}

---

EP: PUT /account-opening/applications/{applicationId}
DESC: Update application status and current step.
IN: headers:{Authorization:str!}, params:{applicationId:str!}, body:{currentStep:str, status:str, accountType:str}
OUT: 200:{id:str, status:str, currentStep:str, accountType:str, customerType:str, applicantId:str, submittedAt:str, completedAt:str, createdAt:str, updatedAt:str, metadata:obj}
ERR: {"400":"Invalid input", "401":"Unauthorized", "404":"Application not found", "500":"Internal server error"}
EX_REQ: curl -X PUT /account-opening/applications/app_123456 -H "Authorization: Bearer jwt-token" -H "Content-Type: application/json" -d '{"currentStep":"personal_info","status":"in_progress"}'
EX_RES_200: {"id":"app_123456","status":"in_progress","currentStep":"personal_info","accountType":"consumer","customerType":"new","applicantId":"applicant_123","createdAt":"2025-09-13T14:30:45Z","updatedAt":"2025-09-13T14:30:45Z","metadata":{"userAgent":"Mozilla/5.0","ipAddress":"127.0.0.1","sessionId":"session_123","startedAt":"2025-09-13T14:30:45Z","lastActivity":"2025-09-13T14:30:45Z","source":"web_portal"}}

---

EP: POST /account-opening/applications/submit
DESC: Submit completed application for review.
IN: headers:{Authorization:str!}, body:{applicationId:str!, finalReview:bool!, electronicConsent:bool!}
OUT: 200:{submitted:bool, applicationId:str, message:str}
ERR: {"400":"Invalid input or application not ready for submission", "401":"Unauthorized", "404":"Application not found", "500":"Internal server error"}
EX_REQ: curl -X POST /account-opening/applications/submit -H "Authorization: Bearer jwt-token" -H "Content-Type: application/json" -d '{"applicationId":"app_123456","finalReview":true,"electronicConsent":true}'
EX_RES_200: {"submitted":true,"applicationId":"app_123456","message":"Application submitted successfully"}

---

EP: GET /account-opening/applications/{applicationId}/summary
DESC: Get comprehensive application summary with all related data.
IN: headers:{Authorization:str!}, params:{applicationId:str!}
OUT: 200:{application:obj, personalInfo:obj, businessProfile:obj, financialProfile:obj, productSelections:arr[obj], documents:arr[obj], kycVerification:obj, additionalSigners:arr[obj], riskAssessment:obj, agreements:arr[obj], signatures:arr[obj], fundingSetup:obj}
ERR: {"401":"Unauthorized", "404":"Application not found", "500":"Internal server error"}
EX_REQ: curl -X GET /account-opening/applications/app_123456/summary -H "Authorization: Bearer jwt-token"
EX_RES_200: {"application":{"id":"app_123456","status":"draft","currentStep":"personal_info"},"personalInfo":{"firstName":"John","lastName":"Doe","email":"john@example.com"},"businessProfile":null,"financialProfile":null,"productSelections":[],"documents":[],"kycVerification":null,"additionalSigners":[],"riskAssessment":null,"agreements":[],"signatures":[],"fundingSetup":null}

---

## Personal Information Endpoints

EP: PUT /account-opening/applications/{applicationId}/personal-info
DESC: Save or update personal information for application.
IN: headers:{Authorization:str!}, params:{applicationId:str!}, body:{firstName:str!, lastName:str!, dateOfBirth:str!, ssn:str!, phone:str!, email:str!, mailingAddress:obj!, employmentStatus:str!, occupation:str, employer:str, middleName:str, suffix:str, physicalAddress:obj, workPhone:str}
OUT: 200:{firstName:str, middleName:str, lastName:str, suffix:str, dateOfBirth:str, ssn:str, phone:str, email:str, mailingAddress:obj, physicalAddress:obj, employmentStatus:str, occupation:str, employer:str, workPhone:str}
ERR: {"400":"Invalid input data", "401":"Unauthorized", "404":"Application not found", "500":"Internal server error"}
EX_REQ: curl -X PUT /account-opening/applications/app_123456/personal-info -H "Authorization: Bearer jwt-token" -H "Content-Type: application/json" -d '{"firstName":"John","lastName":"Doe","dateOfBirth":"1990-01-15","ssn":"123-45-6789","phone":"555-123-4567","email":"john@example.com","mailingAddress":{"street":"123 Main St","city":"Anytown","state":"CA","zipCode":"12345","country":"US"},"employmentStatus":"employed","occupation":"Software Engineer","employer":"Tech Corp"}'
EX_RES_200: {"firstName":"John","lastName":"Doe","dateOfBirth":"1990-01-15","ssn":"123-45-6789","phone":"555-123-4567","email":"john@example.com","mailingAddress":{"street":"123 Main St","city":"Anytown","state":"CA","zipCode":"12345","country":"US"},"employmentStatus":"employed","occupation":"Software Engineer","employer":"Tech Corp"}

---

EP: GET /account-opening/applications/{applicationId}/personal-info
DESC: Get personal information for application.
IN: headers:{Authorization:str!}, params:{applicationId:str!}
OUT: 200:{firstName:str, middleName:str, lastName:str, suffix:str, dateOfBirth:str, ssn:str, phone:str, email:str, mailingAddress:obj, physicalAddress:obj, employmentStatus:str, occupation:str, employer:str, workPhone:str}
ERR: {"401":"Unauthorized", "404":"Application or personal info not found", "500":"Internal server error"}
EX_REQ: curl -X GET /account-opening/applications/app_123456/personal-info -H "Authorization: Bearer jwt-token"
EX_RES_200: {"firstName":"John","lastName":"Doe","dateOfBirth":"1990-01-15","ssn":"123-45-6789","phone":"555-123-4567","email":"john@example.com","mailingAddress":{"street":"123 Main St","city":"Anytown","state":"CA","zipCode":"12345","country":"US"},"employmentStatus":"employed","occupation":"Software Engineer","employer":"Tech Corp"}

---

## Business Profile Endpoints

EP: PUT /account-opening/applications/{applicationId}/business-profile
DESC: Save or update business profile for commercial applications.
IN: headers:{Authorization:str!}, params:{applicationId:str!}, body:{businessName:str!, ein:str!, entityType:str!, industryType:str!, dateEstablished:str!, businessAddress:obj!, businessPhone:str!, businessEmail:str!, description:str!, isCashIntensive:bool!, monthlyTransactionVolume:float!, monthlyTransactionCount:int!, expectedBalance:float!, dbaName:str, mailingAddress:obj, website:str}
OUT: 200:{businessName:str, dbaName:str, ein:str, entityType:str, industryType:str, dateEstablished:str, businessAddress:obj, mailingAddress:obj, businessPhone:str, businessEmail:str, website:str, description:str, isCashIntensive:bool, monthlyTransactionVolume:float, monthlyTransactionCount:int, expectedBalance:float}
ERR: {"400":"Invalid input data", "401":"Unauthorized", "404":"Application not found", "500":"Internal server error"}
EX_REQ: curl -X PUT /account-opening/applications/app_123456/business-profile -H "Authorization: Bearer jwt-token" -H "Content-Type: application/json" -d '{"businessName":"Acme Corp","ein":"12-3456789","entityType":"corporation","industryType":"Technology","dateEstablished":"2020-01-01","businessAddress":{"street":"456 Business Blvd","city":"Business City","state":"CA","zipCode":"54321","country":"US"},"businessPhone":"555-987-6543","businessEmail":"info@acmecorp.com","description":"Technology consulting services","isCashIntensive":false,"monthlyTransactionVolume":50000,"monthlyTransactionCount":100,"expectedBalance":25000}'
EX_RES_200: {"businessName":"Acme Corp","ein":"12-3456789","entityType":"corporation","industryType":"Technology","dateEstablished":"2020-01-01","businessAddress":{"street":"456 Business Blvd","city":"Business City","state":"CA","zipCode":"54321","country":"US"},"businessPhone":"555-987-6543","businessEmail":"info@acmecorp.com","description":"Technology consulting services","isCashIntensive":false,"monthlyTransactionVolume":50000,"monthlyTransactionCount":100,"expectedBalance":25000}

---

EP: GET /account-opening/applications/{applicationId}/business-profile
DESC: Get business profile for application.
IN: headers:{Authorization:str!}, params:{applicationId:str!}
OUT: 200:{businessName:str, dbaName:str, ein:str, entityType:str, industryType:str, dateEstablished:str, businessAddress:obj, mailingAddress:obj, businessPhone:str, businessEmail:str, website:str, description:str, isCashIntensive:bool, monthlyTransactionVolume:float, monthlyTransactionCount:int, expectedBalance:float}
ERR: {"401":"Unauthorized", "404":"Application or business profile not found", "500":"Internal server error"}
EX_REQ: curl -X GET /account-opening/applications/app_123456/business-profile -H "Authorization: Bearer jwt-token"
EX_RES_200: {"businessName":"Acme Corp","ein":"12-3456789","entityType":"corporation","industryType":"Technology","dateEstablished":"2020-01-01","businessAddress":{"street":"456 Business Blvd","city":"Business City","state":"CA","zipCode":"54321","country":"US"},"businessPhone":"555-987-6543","businessEmail":"info@acmecorp.com","description":"Technology consulting services","isCashIntensive":false,"monthlyTransactionVolume":50000,"monthlyTransactionCount":100,"expectedBalance":25000}

---

## Financial Profile Endpoints

EP: PUT /account-opening/applications/{applicationId}/financial-profile
DESC: Save or update financial profile for application.
IN: headers:{Authorization:str!}, params:{applicationId:str!}, body:{annualIncome:float!, incomeSource:arr[str]!, assets:float!, liabilities:float!, bankingRelationships:arr[obj]!, accountActivities:arr[obj]!, employmentInfo:obj}
OUT: 200:{annualIncome:float, incomeSource:arr[str], employmentInfo:obj, assets:float, liabilities:float, bankingRelationships:arr[obj], accountActivities:arr[obj]}
ERR: {"400":"Invalid input data", "401":"Unauthorized", "404":"Application not found", "500":"Internal server error"}
EX_REQ: curl -X PUT /account-opening/applications/app_123456/financial-profile -H "Authorization: Bearer jwt-token" -H "Content-Type: application/json" -d '{"annualIncome":75000,"incomeSource":["employment"],"assets":50000,"liabilities":15000,"bankingRelationships":[{"bankName":"First National Bank","accountTypes":["Checking","Savings"],"yearsWithBank":5}],"accountActivities":[{"activity":"Direct Deposit","frequency":"Monthly","amount":6250}]}'
EX_RES_200: {"annualIncome":75000,"incomeSource":["employment"],"assets":50000,"liabilities":15000,"bankingRelationships":[{"bankName":"First National Bank","accountTypes":["Checking","Savings"],"yearsWithBank":5}],"accountActivities":[{"activity":"Direct Deposit","frequency":"Monthly","amount":6250}]}

---

EP: GET /account-opening/applications/{applicationId}/financial-profile
DESC: Get financial profile for application.
IN: headers:{Authorization:str!}, params:{applicationId:str!}
OUT: 200:{annualIncome:float, incomeSource:arr[str], employmentInfo:obj, assets:float, liabilities:float, bankingRelationships:arr[obj], accountActivities:arr[obj]}
ERR: {"401":"Unauthorized", "404":"Application or financial profile not found", "500":"Internal server error"}
EX_REQ: curl -X GET /account-opening/applications/app_123456/financial-profile -H "Authorization: Bearer jwt-token"
EX_RES_200: {"annualIncome":75000,"incomeSource":["employment"],"assets":50000,"liabilities":15000,"bankingRelationships":[{"bankName":"First National Bank","accountTypes":["Checking","Savings"],"yearsWithBank":5}],"accountActivities":[{"activity":"Direct Deposit","frequency":"Monthly","amount":6250}]}

---

## Product Management Endpoints

EP: GET /products
DESC: Get all available banking products with eligibility rules.
IN: query:{type:str, isActive:bool}
OUT: 200:arr[obj]
ERR: {"500":"Internal server error"}
EX_REQ: curl -X GET "/products?type=checking&isActive=true"
EX_RES_200: [{"id":"prod_simple_checking","name":"Simple Checking","type":"checking","description":"Perfect for everyday banking needs","features":["Online Banking","Mobile Banking","Bill Pay"],"minimumBalance":100,"monthlyFee":10,"isActive":true,"eligibilityRules":[{"field":"age","operator":">=","value":18,"description":"Must be 18 years or older"}]}]

---

EP: GET /products/{productId}
DESC: Get specific product details by ID.
IN: params:{productId:str!}
OUT: 200:{id:str, name:str, type:str, description:str, features:arr[str], minimumBalance:float, monthlyFee:float, interestRate:float, isActive:bool, eligibilityRules:arr[obj]}
ERR: {"404":"Product not found", "500":"Internal server error"}
EX_REQ: curl -X GET /products/prod_simple_checking
EX_RES_200: {"id":"prod_simple_checking","name":"Simple Checking","type":"checking","description":"Perfect for everyday banking needs","features":["Online Banking","Mobile Banking","Bill Pay"],"minimumBalance":100,"monthlyFee":10,"isActive":true,"eligibilityRules":[{"field":"age","operator":">=","value":18,"description":"Must be 18 years or older"}]}

---

## Product Selection Endpoints

EP: POST /account-opening/applications/{applicationId}/product-selections
DESC: Save product selections for application.
IN: headers:{Authorization:str!}, params:{applicationId:str!}, body:{selections:arr[obj]!}
OUT: 201:arr[obj]
ERR: {"400":"Invalid product selections", "401":"Unauthorized", "404":"Application not found", "500":"Internal server error"}
EX_REQ: curl -X POST /account-opening/applications/app_123456/product-selections -H "Authorization: Bearer jwt-token" -H "Content-Type: application/json" -d '{"selections":[{"productId":"prod_simple_checking","selectedFeatures":["Online Banking","Mobile Banking"],"initialDeposit":500}]}'
EX_RES_201: [{"id":"sel_123","productId":"prod_simple_checking","product":{"id":"prod_simple_checking","name":"Simple Checking","type":"checking"},"selectedFeatures":["Online Banking","Mobile Banking"],"initialDeposit":500}]

---

EP: GET /account-opening/applications/{applicationId}/product-selections
DESC: Get product selections for application.
IN: headers:{Authorization:str!}, params:{applicationId:str!}
OUT: 200:arr[obj]
ERR: {"401":"Unauthorized", "404":"Application not found", "500":"Internal server error"}
EX_REQ: curl -X GET /account-opening/applications/app_123456/product-selections -H "Authorization: Bearer jwt-token"
EX_RES_200: [{"id":"sel_123","productId":"prod_simple_checking","product":{"id":"prod_simple_checking","name":"Simple Checking","type":"checking"},"selectedFeatures":["Online Banking","Mobile Banking"],"initialDeposit":500}]

---

## Document Management Endpoints

EP: POST /account-opening/applications/{applicationId}/documents
DESC: Upload document for application.
IN: headers:{Authorization:str!}, params:{applicationId:str!}, body:{type:str!, file:file!, signerId:str}
OUT: 201:{id:str, applicationId:str, type:str, fileName:str, fileSize:int, mimeType:str, uploadedAt:str, verificationStatus:str}
ERR: {"400":"Invalid file or document type", "401":"Unauthorized", "404":"Application not found", "413":"File too large", "500":"Internal server error"}
EX_REQ: curl -X POST /account-opening/applications/app_123456/documents -H "Authorization: Bearer jwt-token" -F "type=drivers_license" -F "file=@document.pdf"
EX_RES_201: {"id":"doc_123","applicationId":"app_123456","type":"drivers_license","fileName":"document.pdf","fileSize":1024576,"mimeType":"application/pdf","uploadedAt":"2025-09-13T14:30:45Z","verificationStatus":"pending"}

---

EP: GET /account-opening/applications/{applicationId}/documents
DESC: Get all documents for application.
IN: headers:{Authorization:str!}, params:{applicationId:str!}
OUT: 200:arr[obj]
ERR: {"401":"Unauthorized", "404":"Application not found", "500":"Internal server error"}
EX_REQ: curl -X GET /account-opening/applications/app_123456/documents -H "Authorization: Bearer jwt-token"
EX_RES_200: [{"id":"doc_123","applicationId":"app_123456","type":"drivers_license","fileName":"document.pdf","fileSize":1024576,"mimeType":"application/pdf","uploadedAt":"2025-09-13T14:30:45Z","verificationStatus":"verified"}]

---

EP: GET /account-opening/applications/{applicationId}/documents/{documentId}
DESC: Download or get document details.
IN: headers:{Authorization:str!}, params:{applicationId:str!, documentId:str!}, query:{download:bool}
OUT: 200:{id:str, applicationId:str, type:str, fileName:str, fileSize:int, mimeType:str, uploadedAt:str, verificationStatus:str, verificationDetails:obj}
ERR: {"401":"Unauthorized", "404":"Document not found", "500":"Internal server error"}
EX_REQ: curl -X GET /account-opening/applications/app_123456/documents/doc_123 -H "Authorization: Bearer jwt-token"
EX_RES_200: {"id":"doc_123","applicationId":"app_123456","type":"drivers_license","fileName":"document.pdf","fileSize":1024576,"mimeType":"application/pdf","uploadedAt":"2025-09-13T14:30:45Z","verificationStatus":"verified","verificationDetails":{"provider":"Mock Provider","confidence":0.95,"extractedData":{"name":"John Doe"}}}

---

## KYC Verification Endpoints

EP: POST /account-opening/applications/{applicationId}/kyc/verify
DESC: Initiate KYC verification process for application.
IN: headers:{Authorization:str!}, params:{applicationId:str!}
OUT: 202:{id:str, applicationId:str, status:str, verificationId:str, message:str}
ERR: {"400":"KYC verification already in progress", "401":"Unauthorized", "404":"Application not found", "500":"Internal server error"}
EX_REQ: curl -X POST /account-opening/applications/app_123456/kyc/verify -H "Authorization: Bearer jwt-token"
EX_RES_202: {"id":"kyc_123","applicationId":"app_123456","status":"pending","verificationId":"verify_123","message":"KYC verification initiated"}

---

EP: GET /account-opening/applications/{applicationId}/kyc
DESC: Get KYC verification status and results.
IN: headers:{Authorization:str!}, params:{applicationId:str!}
OUT: 200:{id:str, applicationId:str, status:str, provider:str, verificationId:str, confidence:float, verifiedAt:str, results:obj}
ERR: {"401":"Unauthorized", "404":"KYC verification not found", "500":"Internal server error"}
EX_REQ: curl -X GET /account-opening/applications/app_123456/kyc -H "Authorization: Bearer jwt-token"
EX_RES_200: {"id":"kyc_123","applicationId":"app_123456","status":"passed","provider":"Mock Provider","verificationId":"verify_123","confidence":0.95,"verifiedAt":"2025-09-13T14:30:45Z","results":{"identity":{"passed":true,"confidence":0.95},"address":{"passed":true,"confidence":0.9}}}

---

## Risk Assessment Endpoints

EP: POST /account-opening/applications/{applicationId}/risk-assessment
DESC: Perform risk assessment on application.
IN: headers:{Authorization:str!}, params:{applicationId:str!}
OUT: 201:{id:str, applicationId:str, overallRisk:str, riskScore:int, factors:arr[obj], recommendations:arr[str], requiresManualReview:bool, assessedAt:str, assessedBy:str}
ERR: {"400":"Risk assessment already exists", "401":"Unauthorized", "404":"Application not found", "500":"Internal server error"}
EX_REQ: curl -X POST /account-opening/applications/app_123456/risk-assessment -H "Authorization: Bearer jwt-token"
EX_RES_201: {"id":"risk_123","applicationId":"app_123456","overallRisk":"low","riskScore":25,"factors":[{"category":"Identity","factor":"Strong identity verification","score":10,"impact":"positive"}],"recommendations":["Proceed with standard approval"],"requiresManualReview":false,"assessedAt":"2025-09-13T14:30:45Z","assessedBy":"system"}

---

EP: GET /account-opening/applications/{applicationId}/risk-assessment
DESC: Get risk assessment results for application.
IN: headers:{Authorization:str!}, params:{applicationId:str!}
OUT: 200:{id:str, applicationId:str, overallRisk:str, riskScore:int, factors:arr[obj], recommendations:arr[str], requiresManualReview:bool, assessedAt:str, assessedBy:str}
ERR: {"401":"Unauthorized", "404":"Risk assessment not found", "500":"Internal server error"}
EX_REQ: curl -X GET /account-opening/applications/app_123456/risk-assessment -H "Authorization: Bearer jwt-token"
EX_RES_200: {"id":"risk_123","applicationId":"app_123456","overallRisk":"low","riskScore":25,"factors":[{"category":"Identity","factor":"Strong identity verification","score":10,"impact":"positive"}],"recommendations":["Proceed with standard approval"],"requiresManualReview":false,"assessedAt":"2025-09-13T14:30:45Z","assessedBy":"system"}

---

## Funding Setup Endpoints

EP: POST /account-opening/applications/{applicationId}/funding-setup
DESC: Set up initial funding method for account.
IN: headers:{Authorization:str!}, params:{applicationId:str!}, body:{method:str!, amount:float!, details:obj!}
OUT: 201:{id:str, applicationId:str, method:str, amount:float, status:str, details:obj, createdAt:str}
ERR: {"400":"Invalid funding method or details", "401":"Unauthorized", "404":"Application not found", "500":"Internal server error"}
EX_REQ: curl -X POST /account-opening/applications/app_123456/funding-setup -H "Authorization: Bearer jwt-token" -H "Content-Type: application/json" -d '{"method":"ach","amount":1000,"details":{"bankName":"First National","accountNumber":"123456789","routingNumber":"987654321","accountType":"checking"}}'
EX_RES_201: {"id":"fund_123","applicationId":"app_123456","method":"ach","amount":1000,"status":"pending","details":{"bankName":"First National","accountType":"checking"},"createdAt":"2025-09-13T14:30:45Z"}

---

EP: GET /account-opening/applications/{applicationId}/funding-setup
DESC: Get funding setup details for application.
IN: headers:{Authorization:str!}, params:{applicationId:str!}
OUT: 200:{id:str, applicationId:str, method:str, amount:float, status:str, details:obj, createdAt:str, processedAt:str}
ERR: {"401":"Unauthorized", "404":"Funding setup not found", "500":"Internal server error"}
EX_REQ: curl -X GET /account-opening/applications/app_123456/funding-setup -H "Authorization: Bearer jwt-token"
EX_RES_200: {"id":"fund_123","applicationId":"app_123456","method":"ach","amount":1000,"status":"completed","details":{"bankName":"First National","accountType":"checking"},"createdAt":"2025-09-13T14:30:45Z","processedAt":"2025-09-13T15:30:45Z"}

---

## Admin Endpoints

EP: GET /admin/applications
DESC: Get all applications with admin filters and pagination.
IN: headers:{Authorization:str!}, query:{status:str, accountType:str, riskLevel:str, page:int, limit:int, sortBy:str, dateFrom:str, dateTo:str}
OUT: 200:{results:arr[obj], page:int, limit:int, totalPages:int, totalResults:int, filters:obj}
ERR: {"401":"Unauthorized", "403":"Admin access required", "500":"Internal server error"}
EX_REQ: curl -X GET "/admin/applications?status=submitted&page=1&limit=10" -H "Authorization: Bearer admin-jwt-token"
EX_RES_200: {"results":[{"id":"app_123456","applicantName":"John Doe","accountType":"consumer","status":"submitted","currentStep":"review","riskLevel":"low","submittedAt":"2025-09-13T14:30:45Z","lastActivity":"2025-09-13T15:30:45Z"}],"page":1,"limit":10,"totalPages":1,"totalResults":1}

---

EP: GET /admin/applications/{applicationId}
DESC: Get detailed application information for admin review.
IN: headers:{Authorization:str!}, params:{applicationId:str!}
OUT: 200:{application:obj, personalInfo:obj, businessProfile:obj, financialProfile:obj, productSelections:arr[obj], documents:arr[obj], kycVerification:obj, additionalSigners:arr[obj], riskAssessment:obj, agreements:arr[obj], signatures:arr[obj], fundingSetup:obj, auditTrail:arr[obj]}
ERR: {"401":"Unauthorized", "403":"Admin access required", "404":"Application not found", "500":"Internal server error"}
EX_REQ: curl -X GET /admin/applications/app_123456 -H "Authorization: Bearer admin-jwt-token"
EX_RES_200: {"application":{"id":"app_123456","status":"submitted","currentStep":"review"},"personalInfo":{"firstName":"John","lastName":"Doe"},"riskAssessment":{"overallRisk":"low","riskScore":25},"auditTrail":[{"action":"application_created","performedBy":"user","performedAt":"2025-09-13T14:30:45Z"}]}

---

EP: PATCH /admin/applications/{applicationId}/status
DESC: Update application status (admin only).
IN: headers:{Authorization:str!}, params:{applicationId:str!}, body:{status:str!, reason:str, assignedTo:str}
OUT: 200:{id:str, status:str, updatedAt:str, updatedBy:str, reason:str}
ERR: {"400":"Invalid status transition", "401":"Unauthorized", "403":"Admin access required", "404":"Application not found", "500":"Internal server error"}
EX_REQ: curl -X PATCH /admin/applications/app_123456/status -H "Authorization: Bearer admin-jwt-token" -H "Content-Type: application/json" -d '{"status":"approved","reason":"All requirements met"}'
EX_RES_200: {"id":"app_123456","status":"approved","updatedAt":"2025-09-13T16:30:45Z","updatedBy":"admin_user","reason":"All requirements met"}