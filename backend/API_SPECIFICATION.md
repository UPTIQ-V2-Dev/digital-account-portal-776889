# API Specification

This document specifies the complete API for the banking application with account opening functionality.

## Database Models (Prisma Schema)

```prisma
model User {
  id                    Int                    @id @default(autoincrement())
  email                 String                 @unique
  name                  String?
  password              String
  role                  String                 @default("user")
  isEmailVerified       Boolean                @default(false)
  createdAt             DateTime               @default(now())
  updatedAt             DateTime               @updatedAt
  tokens                Token[]
  applications          Application[]
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
  id                    String                 @id @default(cuid())
  status                String                 @default("draft")
  currentStep           String                 @default("account_type")
  accountType           String
  customerType          String                 @default("new")
  applicantId           String
  submittedAt           DateTime?
  completedAt           DateTime?
  createdAt             DateTime               @default(now())
  updatedAt             DateTime               @updatedAt
  personalInfo          PersonalInfo?
  businessProfile       BusinessProfile?
  financialProfile      FinancialProfile?
  productSelections     ProductSelection[]
  documents             Document[]
  additionalSigners     AdditionalSigner[]
  kycVerification       KYCVerification?
  riskAssessment        RiskAssessment?
  agreements            Agreement[]
  signatures            ElectronicSignature[]
  fundingSetup          FundingSetup?
  metadata              Json
  user                  User                   @relation(fields: [userId], references: [id])
  userId                Int
  auditTrail            AuditTrailEntry[]
}

model PersonalInfo {
  id                    String                 @id @default(cuid())
  firstName             String
  middleName            String?
  lastName              String
  suffix                String?
  dateOfBirth           String
  ssn                   String
  phone                 String
  email                 String
  mailingAddress        Json
  physicalAddress       Json?
  employmentStatus      String
  occupation            String?
  employer              String?
  workPhone             String?
  application           Application            @relation(fields: [applicationId], references: [id])
  applicationId         String                 @unique
}

model BusinessProfile {
  id                           String                 @id @default(cuid())
  businessName                 String
  dbaName                      String?
  ein                          String
  entityType                   String
  industryType                 String
  dateEstablished              String
  businessAddress              Json
  mailingAddress               Json?
  businessPhone                String
  businessEmail                String
  website                      String?
  description                  String
  isCashIntensive              Boolean                @default(false)
  monthlyTransactionVolume     Float
  monthlyTransactionCount      Int
  expectedBalance              Float
  application                  Application            @relation(fields: [applicationId], references: [id])
  applicationId                String                 @unique
}

model FinancialProfile {
  id                    String                 @id @default(cuid())
  annualIncome          Float
  incomeSource          String[]
  employmentInfo        Json?
  assets                Float
  liabilities           Float
  bankingRelationships  Json[]
  accountActivities     Json[]
  application           Application            @relation(fields: [applicationId], references: [id])
  applicationId         String                 @unique
}

model Product {
  id                    String                 @id @default(cuid())
  name                  String                 @unique
  type                  String
  description           String
  features              String[]
  minimumBalance        Float
  monthlyFee            Float
  interestRate          Float?
  isActive              Boolean                @default(true)
  eligibilityRules      Json[]
  productSelections     ProductSelection[]
}

model ProductSelection {
  id                    String                 @id @default(cuid())
  selectedFeatures      String[]
  initialDeposit        Float?
  application           Application            @relation(fields: [applicationId], references: [id])
  applicationId         String
  product               Product                @relation(fields: [productId], references: [id])
  productId             String
}

model Document {
  id                    String                 @id @default(cuid())
  type                  String
  fileName              String
  fileSize              Int
  mimeType              String
  uploadedAt            DateTime               @default(now())
  verificationStatus    String                 @default("pending")
  verificationDetails   Json?
  application           Application            @relation(fields: [applicationId], references: [id])
  applicationId         String
  signer                AdditionalSigner?      @relation(fields: [signerId], references: [id])
  signerId              String?
}

model KYCVerification {
  id                    String                 @id @default(cuid())
  status                String                 @default("pending")
  provider              String
  verificationId        String
  confidence            Float
  verifiedAt            DateTime?
  results               Json
  application           Application            @relation(fields: [applicationId], references: [id])
  applicationId         String                 @unique
}

model AdditionalSigner {
  id                           String                 @id @default(cuid())
  personalInfo                 Json
  role                         String
  relationshipToBusiness       String?
  beneficialOwnershipPercentage Float?
  hasSigningAuthority          Boolean
  kycStatus                    String                 @default("pending")
  documents                    Document[]
  application                  Application            @relation(fields: [applicationId], references: [id])
  applicationId                String
}

model RiskAssessment {
  id                    String                 @id @default(cuid())
  overallRisk           String
  riskScore             Int
  factors               Json[]
  recommendations       String[]
  requiresManualReview  Boolean                @default(false)
  assessedAt            DateTime               @default(now())
  assessedBy            String
  application           Application            @relation(fields: [applicationId], references: [id])
  applicationId         String                 @unique
}

model Disclosure {
  id                    String                 @id @default(cuid())
  type                  String
  title                 String
  content               String
  version               String
  effectiveDate         String
  required              Boolean                @default(false)
  applicableFor         String[]
  agreements            Agreement[]
}

model Agreement {
  id                    String                 @id @default(cuid())
  acknowledged          Boolean                @default(false)
  acknowledgedAt        DateTime?
  ipAddress             String
  userAgent             String
  application           Application            @relation(fields: [applicationId], references: [id])
  applicationId         String
  disclosure            Disclosure             @relation(fields: [disclosureId], references: [id])
  disclosureId          String
}

model ElectronicSignature {
  id                    String                 @id @default(cuid())
  signerId              String
  documentType          String
  signatureData         String
  signedAt              DateTime               @default(now())
  ipAddress             String
  userAgent             String
  biometric             Json?
  application           Application            @relation(fields: [applicationId], references: [id])
  applicationId         String
}

model FundingSetup {
  id                    String                 @id @default(cuid())
  method                String
  amount                Float
  status                String                 @default("pending")
  details               Json
  createdAt             DateTime               @default(now())
  processedAt           DateTime?
  application           Application            @relation(fields: [applicationId], references: [id])
  applicationId         String                 @unique
}

model AuditTrailEntry {
  id                    String                 @id @default(cuid())
  action                String
  description           String
  performedBy           String
  performedAt           DateTime               @default(now())
  ipAddress             String
  userAgent             String
  changes               Json?
  application           Application            @relation(fields: [applicationId], references: [id])
  applicationId         String
}
```

---

## Authentication APIs

EP: POST /auth/register
DESC: Register a new user account.
IN: body:{name:str!, email:str!, password:str!}
OUT: 201:{user:obj{id:int, email:str, name:str, role:str, isEmailVerified:bool, createdAt:str, updatedAt:str}, tokens:obj{access:obj{token:str, expires:str}, refresh:obj{token:str, expires:str}}}
ERR: {"400":"Invalid input data or email already exists", "500":"Internal server error"}
EX_REQ: curl -X POST /auth/register -H "Content-Type: application/json" -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
EX_RES_201: {"user":{"id":1,"email":"john@example.com","name":"John Doe","role":"user","isEmailVerified":false,"createdAt":"2025-01-01T00:00:00Z","updatedAt":"2025-01-01T00:00:00Z"},"tokens":{"access":{"token":"eyJ...","expires":"2025-01-01T01:00:00Z"},"refresh":{"token":"eyJ...","expires":"2025-01-08T00:00:00Z"}}}

---

EP: POST /auth/login
DESC: Authenticate user and return tokens.
IN: body:{email:str!, password:str!}
OUT: 200:{user:obj{id:int, email:str, name:str, role:str, isEmailVerified:bool, createdAt:str, updatedAt:str}, tokens:obj{access:obj{token:str, expires:str}, refresh:obj{token:str, expires:str}}}
ERR: {"401":"Invalid email or password", "500":"Internal server error"}
EX_REQ: curl -X POST /auth/login -H "Content-Type: application/json" -d '{"email":"john@example.com","password":"password123"}'
EX_RES_200: {"user":{"id":1,"email":"john@example.com","name":"John Doe","role":"user","isEmailVerified":true,"createdAt":"2025-01-01T00:00:00Z","updatedAt":"2025-01-01T00:00:00Z"},"tokens":{"access":{"token":"eyJ...","expires":"2025-01-01T01:00:00Z"},"refresh":{"token":"eyJ...","expires":"2025-01-08T00:00:00Z"}}}

---

EP: POST /auth/logout
DESC: Logout user and blacklist refresh token.
IN: body:{refreshToken:str!}
OUT: 204:{}
ERR: {"404":"Refresh token not found", "500":"Internal server error"}
EX_REQ: curl -X POST /auth/logout -H "Content-Type: application/json" -d '{"refreshToken":"eyJ..."}'
EX_RES_204: {}

---

EP: POST /auth/refresh-tokens
DESC: Refresh access token using refresh token.
IN: body:{refreshToken:str!}
OUT: 200:{access:obj{token:str, expires:str}, refresh:obj{token:str, expires:str}}
ERR: {"401":"Invalid refresh token", "500":"Internal server error"}
EX_REQ: curl -X POST /auth/refresh-tokens -H "Content-Type: application/json" -d '{"refreshToken":"eyJ..."}'
EX_RES_200: {"access":{"token":"eyJ...","expires":"2025-01-01T01:00:00Z"},"refresh":{"token":"eyJ...","expires":"2025-01-08T00:00:00Z"}}

---

EP: POST /auth/forgot-password
DESC: Send password reset email to user.
IN: body:{email:str!}
OUT: 204:{}
ERR: {"404":"User not found", "500":"Internal server error"}
EX_REQ: curl -X POST /auth/forgot-password -H "Content-Type: application/json" -d '{"email":"john@example.com"}'
EX_RES_204: {}

---

EP: POST /auth/reset-password
DESC: Reset user password using reset token.
IN: query:{token:str!}, body:{password:str!}
OUT: 204:{}
ERR: {"401":"Invalid or expired reset token", "500":"Internal server error"}
EX_REQ: curl -X POST /auth/reset-password?token=reset123 -H "Content-Type: application/json" -d '{"password":"newpassword123"}'
EX_RES_204: {}

---

EP: POST /auth/verify-email
DESC: Verify user email address.
IN: query:{token:str!}
OUT: 204:{}
ERR: {"401":"Invalid or expired verification token", "500":"Internal server error"}
EX_REQ: curl -X POST /auth/verify-email?token=verify123
EX_RES_204: {}

---

EP: POST /auth/send-verification-email
DESC: Send email verification link to authenticated user.
IN: headers:{Authorization:str!}
OUT: 204:{}
ERR: {"401":"Unauthorized", "500":"Internal server error"}
EX_REQ: curl -X POST /auth/send-verification-email -H "Authorization: Bearer eyJ..."
EX_RES_204: {}

---

## User Management APIs

EP: POST /users
DESC: Create a new user (admin only).
IN: headers:{Authorization:str!}, body:{name:str!, email:str!, password:str!, role:str!}
OUT: 201:{id:int, email:str, name:str, role:str, isEmailVerified:bool, createdAt:str, updatedAt:str}
ERR: {"400":"Invalid input or duplicate email", "401":"Unauthorized", "403":"Forbidden", "500":"Internal server error"}
EX_REQ: curl -X POST /users -H "Authorization: Bearer eyJ..." -H "Content-Type: application/json" -d '{"name":"Jane Doe","email":"jane@example.com","password":"password123","role":"user"}'
EX_RES_201: {"id":2,"email":"jane@example.com","name":"Jane Doe","role":"user","isEmailVerified":false,"createdAt":"2025-01-01T00:00:00Z","updatedAt":"2025-01-01T00:00:00Z"}

---

EP: GET /users
DESC: Get all users with pagination and filtering (admin only).
IN: headers:{Authorization:str!}, query:{name:str, role:str, sortBy:str, limit:int, page:int}
OUT: 200:{results:arr[obj{id:int, email:str, name:str, role:str, isEmailVerified:bool, createdAt:str, updatedAt:str}], page:int, limit:int, totalPages:int, totalResults:int}
ERR: {"401":"Unauthorized", "403":"Forbidden", "500":"Internal server error"}
EX_REQ: curl -X GET "/users?page=1&limit=10&role=user" -H "Authorization: Bearer eyJ..."
EX_RES_200: {"results":[{"id":1,"email":"john@example.com","name":"John Doe","role":"user","isEmailVerified":true,"createdAt":"2025-01-01T00:00:00Z","updatedAt":"2025-01-01T00:00:00Z"}],"page":1,"limit":10,"totalPages":1,"totalResults":1}

---

EP: GET /users/{userId}
DESC: Get specific user by ID.
IN: headers:{Authorization:str!}, params:{userId:int!}
OUT: 200:{id:int, email:str, name:str, role:str, isEmailVerified:bool, createdAt:str, updatedAt:str}
ERR: {"401":"Unauthorized", "403":"Forbidden", "404":"User not found", "500":"Internal server error"}
EX_REQ: curl -X GET /users/1 -H "Authorization: Bearer eyJ..."
EX_RES_200: {"id":1,"email":"john@example.com","name":"John Doe","role":"user","isEmailVerified":true,"createdAt":"2025-01-01T00:00:00Z","updatedAt":"2025-01-01T00:00:00Z"}

---

EP: PATCH /users/{userId}
DESC: Update user information.
IN: headers:{Authorization:str!}, params:{userId:int!}, body:{name:str, email:str, password:str}
OUT: 200:{id:int, email:str, name:str, role:str, isEmailVerified:bool, createdAt:str, updatedAt:str}
ERR: {"400":"Invalid input or duplicate email", "401":"Unauthorized", "403":"Forbidden", "404":"User not found", "500":"Internal server error"}
EX_REQ: curl -X PATCH /users/1 -H "Authorization: Bearer eyJ..." -H "Content-Type: application/json" -d '{"name":"John Smith"}'
EX_RES_200: {"id":1,"email":"john@example.com","name":"John Smith","role":"user","isEmailVerified":true,"createdAt":"2025-01-01T00:00:00Z","updatedAt":"2025-01-01T00:00:00Z"}

---

EP: DELETE /users/{userId}
DESC: Delete user account.
IN: headers:{Authorization:str!}, params:{userId:int!}
OUT: 204:{}
ERR: {"401":"Unauthorized", "403":"Forbidden", "404":"User not found", "500":"Internal server error"}
EX_REQ: curl -X DELETE /users/1 -H "Authorization: Bearer eyJ..."
EX_RES_204: {}

---

## Account Opening APIs

EP: POST /account-opening/applications
DESC: Create a new account opening application.
IN: headers:{Authorization:str!}, body:{accountType:str!, personalInfo:obj, businessProfile:obj}
OUT: 201:{id:str, status:str, currentStep:str, accountType:str, customerType:str, applicantId:str, createdAt:str, updatedAt:str, metadata:obj}
ERR: {"400":"Invalid input data", "401":"Unauthorized", "500":"Internal server error"}
EX_REQ: curl -X POST /account-opening/applications -H "Authorization: Bearer eyJ..." -H "Content-Type: application/json" -d '{"accountType":"consumer"}'
EX_RES_201: {"id":"app_123","status":"draft","currentStep":"account_type","accountType":"consumer","customerType":"new","applicantId":"applicant_123","createdAt":"2025-01-01T00:00:00Z","updatedAt":"2025-01-01T00:00:00Z","metadata":{"userAgent":"curl/7.68.0","ipAddress":"127.0.0.1","sessionId":"session_123","startedAt":"2025-01-01T00:00:00Z","lastActivity":"2025-01-01T00:00:00Z","source":"api"}}

---

EP: GET /account-opening/applications/{applicationId}
DESC: Get application details by ID.
IN: headers:{Authorization:str!}, params:{applicationId:str!}
OUT: 200:{id:str, status:str, currentStep:str, accountType:str, customerType:str, applicantId:str, submittedAt:str, completedAt:str, createdAt:str, updatedAt:str, metadata:obj}
ERR: {"401":"Unauthorized", "404":"Application not found", "500":"Internal server error"}
EX_REQ: curl -X GET /account-opening/applications/app_123 -H "Authorization: Bearer eyJ..."
EX_RES_200: {"id":"app_123","status":"draft","currentStep":"personal_info","accountType":"consumer","customerType":"new","applicantId":"applicant_123","createdAt":"2025-01-01T00:00:00Z","updatedAt":"2025-01-01T00:00:00Z","metadata":{"userAgent":"curl/7.68.0","ipAddress":"127.0.0.1","sessionId":"session_123","startedAt":"2025-01-01T00:00:00Z","lastActivity":"2025-01-01T00:00:00Z","source":"api"}}

---

EP: PUT /account-opening/applications/{applicationId}
DESC: Update application information.
IN: headers:{Authorization:str!}, params:{applicationId:str!}, body:{currentStep:str, status:str, accountType:str}
OUT: 200:{id:str, status:str, currentStep:str, accountType:str, customerType:str, applicantId:str, submittedAt:str, completedAt:str, createdAt:str, updatedAt:str, metadata:obj}
ERR: {"400":"Invalid input data", "401":"Unauthorized", "404":"Application not found", "500":"Internal server error"}
EX_REQ: curl -X PUT /account-opening/applications/app_123 -H "Authorization: Bearer eyJ..." -H "Content-Type: application/json" -d '{"currentStep":"personal_info"}'
EX_RES_200: {"id":"app_123","status":"draft","currentStep":"personal_info","accountType":"consumer","customerType":"new","applicantId":"applicant_123","createdAt":"2025-01-01T00:00:00Z","updatedAt":"2025-01-01T00:00:00Z","metadata":{"userAgent":"curl/7.68.0","ipAddress":"127.0.0.1","sessionId":"session_123","startedAt":"2025-01-01T00:00:00Z","lastActivity":"2025-01-01T00:00:00Z","source":"api"}}

---

EP: POST /account-opening/applications/submit
DESC: Submit application for review.
IN: headers:{Authorization:str!}, body:{applicationId:str!, finalReview:bool!, electronicConsent:bool!}
OUT: 200:{submitted:bool}
ERR: {"400":"Invalid input or application not ready", "401":"Unauthorized", "404":"Application not found", "500":"Internal server error"}
EX_REQ: curl -X POST /account-opening/applications/submit -H "Authorization: Bearer eyJ..." -H "Content-Type: application/json" -d '{"applicationId":"app_123","finalReview":true,"electronicConsent":true}'
EX_RES_200: {"submitted":true}

---

EP: PUT /account-opening/applications/{applicationId}/personal-info
DESC: Update personal information for application.
IN: headers:{Authorization:str!}, params:{applicationId:str!}, body:{firstName:str!, lastName:str!, dateOfBirth:str!, ssn:str!, phone:str!, email:str!, mailingAddress:obj!, employmentStatus:str!, occupation:str, employer:str}
OUT: 200:{firstName:str, lastName:str, dateOfBirth:str, ssn:str, phone:str, email:str, mailingAddress:obj, employmentStatus:str, occupation:str, employer:str}
ERR: {"400":"Invalid input data", "401":"Unauthorized", "404":"Application not found", "500":"Internal server error"}
EX_REQ: curl -X PUT /account-opening/applications/app_123/personal-info -H "Authorization: Bearer eyJ..." -H "Content-Type: application/json" -d '{"firstName":"John","lastName":"Doe","dateOfBirth":"1990-01-15","ssn":"123-45-6789","phone":"555-123-4567","email":"john.doe@example.com","mailingAddress":{"street":"123 Main St","city":"Anytown","state":"CA","zipCode":"12345","country":"US"},"employmentStatus":"employed","occupation":"Software Engineer","employer":"Tech Corp"}'
EX_RES_200: {"firstName":"John","lastName":"Doe","dateOfBirth":"1990-01-15","ssn":"123-45-6789","phone":"555-123-4567","email":"john.doe@example.com","mailingAddress":{"street":"123 Main St","city":"Anytown","state":"CA","zipCode":"12345","country":"US"},"employmentStatus":"employed","occupation":"Software Engineer","employer":"Tech Corp"}

---

EP: GET /account-opening/applications/{applicationId}/personal-info
DESC: Get personal information for application.
IN: headers:{Authorization:str!}, params:{applicationId:str!}
OUT: 200:{firstName:str, lastName:str, dateOfBirth:str, ssn:str, phone:str, email:str, mailingAddress:obj, employmentStatus:str, occupation:str, employer:str}
ERR: {"401":"Unauthorized", "404":"Application or personal info not found", "500":"Internal server error"}
EX_REQ: curl -X GET /account-opening/applications/app_123/personal-info -H "Authorization: Bearer eyJ..."
EX_RES_200: {"firstName":"John","lastName":"Doe","dateOfBirth":"1990-01-15","ssn":"123-45-6789","phone":"555-123-4567","email":"john.doe@example.com","mailingAddress":{"street":"123 Main St","city":"Anytown","state":"CA","zipCode":"12345","country":"US"},"employmentStatus":"employed","occupation":"Software Engineer","employer":"Tech Corp"}

---

EP: PUT /account-opening/applications/{applicationId}/business-profile
DESC: Update business profile for commercial applications.
IN: headers:{Authorization:str!}, params:{applicationId:str!}, body:{businessName:str!, ein:str!, entityType:str!, industryType:str!, dateEstablished:str!, businessAddress:obj!, businessPhone:str!, businessEmail:str!, description:str!, isCashIntensive:bool!, monthlyTransactionVolume:float!, monthlyTransactionCount:int!, expectedBalance:float!}
OUT: 200:{businessName:str, ein:str, entityType:str, industryType:str, dateEstablished:str, businessAddress:obj, businessPhone:str, businessEmail:str, description:str, isCashIntensive:bool, monthlyTransactionVolume:float, monthlyTransactionCount:int, expectedBalance:float}
ERR: {"400":"Invalid input data", "401":"Unauthorized", "404":"Application not found", "500":"Internal server error"}
EX_REQ: curl -X PUT /account-opening/applications/app_123/business-profile -H "Authorization: Bearer eyJ..." -H "Content-Type: application/json" -d '{"businessName":"Acme Corp","ein":"12-3456789","entityType":"corporation","industryType":"Technology","dateEstablished":"2020-01-01","businessAddress":{"street":"456 Business Blvd","city":"Business City","state":"CA","zipCode":"54321","country":"US"},"businessPhone":"555-987-6543","businessEmail":"info@acmecorp.com","description":"Technology consulting services","isCashIntensive":false,"monthlyTransactionVolume":50000,"monthlyTransactionCount":100,"expectedBalance":25000}'
EX_RES_200: {"businessName":"Acme Corp","ein":"12-3456789","entityType":"corporation","industryType":"Technology","dateEstablished":"2020-01-01","businessAddress":{"street":"456 Business Blvd","city":"Business City","state":"CA","zipCode":"54321","country":"US"},"businessPhone":"555-987-6543","businessEmail":"info@acmecorp.com","description":"Technology consulting services","isCashIntensive":false,"monthlyTransactionVolume":50000,"monthlyTransactionCount":100,"expectedBalance":25000}

---

EP: GET /account-opening/applications/{applicationId}/business-profile
DESC: Get business profile for application.
IN: headers:{Authorization:str!}, params:{applicationId:str!}
OUT: 200:{businessName:str, ein:str, entityType:str, industryType:str, dateEstablished:str, businessAddress:obj, businessPhone:str, businessEmail:str, description:str, isCashIntensive:bool, monthlyTransactionVolume:float, monthlyTransactionCount:int, expectedBalance:float}
ERR: {"401":"Unauthorized", "404":"Application or business profile not found", "500":"Internal server error"}
EX_REQ: curl -X GET /account-opening/applications/app_123/business-profile -H "Authorization: Bearer eyJ..."
EX_RES_200: {"businessName":"Acme Corp","ein":"12-3456789","entityType":"corporation","industryType":"Technology","dateEstablished":"2020-01-01","businessAddress":{"street":"456 Business Blvd","city":"Business City","state":"CA","zipCode":"54321","country":"US"},"businessPhone":"555-987-6543","businessEmail":"info@acmecorp.com","description":"Technology consulting services","isCashIntensive":false,"monthlyTransactionVolume":50000,"monthlyTransactionCount":100,"expectedBalance":25000}

---

EP: PUT /account-opening/applications/{applicationId}/financial-profile
DESC: Update financial profile information.
IN: headers:{Authorization:str!}, params:{applicationId:str!}, body:{annualIncome:float!, incomeSource:arr[str]!, assets:float!, liabilities:float!, bankingRelationships:arr[obj]!, accountActivities:arr[obj]!, employmentInfo:obj}
OUT: 200:{annualIncome:float, incomeSource:arr[str], assets:float, liabilities:float, bankingRelationships:arr[obj], accountActivities:arr[obj], employmentInfo:obj}
ERR: {"400":"Invalid input data", "401":"Unauthorized", "404":"Application not found", "500":"Internal server error"}
EX_REQ: curl -X PUT /account-opening/applications/app_123/financial-profile -H "Authorization: Bearer eyJ..." -H "Content-Type: application/json" -d '{"annualIncome":75000,"incomeSource":["employment"],"assets":50000,"liabilities":15000,"bankingRelationships":[{"bankName":"Big Bank","accountTypes":["Checking","Savings"],"yearsWithBank":5}],"accountActivities":[{"activity":"Direct Deposit","frequency":"Monthly","amount":6250}]}'
EX_RES_200: {"annualIncome":75000,"incomeSource":["employment"],"assets":50000,"liabilities":15000,"bankingRelationships":[{"bankName":"Big Bank","accountTypes":["Checking","Savings"],"yearsWithBank":5}],"accountActivities":[{"activity":"Direct Deposit","frequency":"Monthly","amount":6250}]}

---

EP: GET /account-opening/applications/{applicationId}/financial-profile
DESC: Get financial profile for application.
IN: headers:{Authorization:str!}, params:{applicationId:str!}
OUT: 200:{annualIncome:float, incomeSource:arr[str], assets:float, liabilities:float, bankingRelationships:arr[obj], accountActivities:arr[obj], employmentInfo:obj}
ERR: {"401":"Unauthorized", "404":"Application or financial profile not found", "500":"Internal server error"}
EX_REQ: curl -X GET /account-opening/applications/app_123/financial-profile -H "Authorization: Bearer eyJ..."
EX_RES_200: {"annualIncome":75000,"incomeSource":["employment"],"assets":50000,"liabilities":15000,"bankingRelationships":[{"bankName":"Big Bank","accountTypes":["Checking","Savings"],"yearsWithBank":5}],"accountActivities":[{"activity":"Direct Deposit","frequency":"Monthly","amount":6250}]}

---

## Product Management APIs

EP: GET /account-opening/products
DESC: Get available products for account opening.
IN: headers:{Authorization:str!}, query:{accountType:str}
OUT: 200:arr[obj{id:str, name:str, type:str, description:str, features:arr[str], minimumBalance:float, monthlyFee:float, interestRate:float, isActive:bool, eligibilityRules:arr[obj]}]
ERR: {"401":"Unauthorized", "500":"Internal server error"}
EX_REQ: curl -X GET "/account-opening/products?accountType=consumer" -H "Authorization: Bearer eyJ..."
EX_RES_200: [{"id":"prod_simple_checking","name":"Simple Checking","type":"checking","description":"Online Banking & Bill Pay • Mobile Deposits & Electronic Statements • Monthly Fee of $10 • Minimum Balance of $100","features":["Online Banking","Bill Pay","Mobile Deposits","Electronic Statements"],"minimumBalance":100,"monthlyFee":10,"isActive":true,"eligibilityRules":[]}]

---

EP: GET /account-opening/applications/{applicationId}/eligible-products
DESC: Get products eligible for specific application.
IN: headers:{Authorization:str!}, params:{applicationId:str!}
OUT: 200:arr[obj{id:str, name:str, type:str, description:str, features:arr[str], minimumBalance:float, monthlyFee:float, interestRate:float, isActive:bool, eligibilityRules:arr[obj]}]
ERR: {"401":"Unauthorized", "404":"Application not found", "500":"Internal server error"}
EX_REQ: curl -X GET /account-opening/applications/app_123/eligible-products -H "Authorization: Bearer eyJ..."
EX_RES_200: [{"id":"prod_simple_checking","name":"Simple Checking","type":"checking","description":"Online Banking & Bill Pay • Mobile Deposits & Electronic Statements • Monthly Fee of $10 • Minimum Balance of $100","features":["Online Banking","Bill Pay","Mobile Deposits","Electronic Statements"],"minimumBalance":100,"monthlyFee":10,"isActive":true,"eligibilityRules":[]}]

---

EP: PUT /account-opening/applications/{applicationId}/product-selections
DESC: Update product selections for application.
IN: headers:{Authorization:str!}, params:{applicationId:str!}, body:{selections:arr[obj{productId:str!, selectedFeatures:arr[str], initialDeposit:float}]!}
OUT: 200:arr[obj{productId:str, product:obj, selectedFeatures:arr[str], initialDeposit:float}]
ERR: {"400":"Invalid product selections", "401":"Unauthorized", "404":"Application not found", "500":"Internal server error"}
EX_REQ: curl -X PUT /account-opening/applications/app_123/product-selections -H "Authorization: Bearer eyJ..." -H "Content-Type: application/json" -d '{"selections":[{"productId":"prod_simple_checking","selectedFeatures":["Online Banking","Mobile Deposits"],"initialDeposit":500}]}'
EX_RES_200: [{"productId":"prod_simple_checking","product":{"id":"prod_simple_checking","name":"Simple Checking","type":"checking"},"selectedFeatures":["Online Banking","Mobile Deposits"],"initialDeposit":500}]

---

## Document Management APIs

EP: POST /account-opening/documents/upload
DESC: Upload document for application.
IN: headers:{Authorization:str!, Content-Type:multipart/form-data}, body:{file:file!, documentType:str!, applicationId:str!}
OUT: 200:{id:str, applicationId:str, type:str, fileName:str, fileSize:int, mimeType:str, uploadedAt:str, verificationStatus:str}
ERR: {"400":"Invalid file or document type", "401":"Unauthorized", "413":"File too large", "500":"Internal server error"}
EX_REQ: curl -X POST /account-opening/documents/upload -H "Authorization: Bearer eyJ..." -F "file=@license.pdf" -F "documentType=drivers_license" -F "applicationId=app_123"
EX_RES_200: {"id":"doc_123","applicationId":"app_123","type":"drivers_license","fileName":"license.pdf","fileSize":1024576,"mimeType":"application/pdf","uploadedAt":"2025-01-01T00:00:00Z","verificationStatus":"pending"}

---

EP: GET /account-opening/applications/{applicationId}/documents
DESC: Get all documents for application.
IN: headers:{Authorization:str!}, params:{applicationId:str!}
OUT: 200:arr[obj{id:str, applicationId:str, type:str, fileName:str, fileSize:int, mimeType:str, uploadedAt:str, verificationStatus:str, verificationDetails:obj}]
ERR: {"401":"Unauthorized", "404":"Application not found", "500":"Internal server error"}
EX_REQ: curl -X GET /account-opening/applications/app_123/documents -H "Authorization: Bearer eyJ..."
EX_RES_200: [{"id":"doc_123","applicationId":"app_123","type":"drivers_license","fileName":"license.pdf","fileSize":1024576,"mimeType":"application/pdf","uploadedAt":"2025-01-01T00:00:00Z","verificationStatus":"verified","verificationDetails":{"provider":"Mock Provider","confidence":0.95,"extractedData":{"name":"John Doe","license_number":"D123456789"},"verificationId":"verify_123","verifiedAt":"2025-01-01T00:01:00Z"}}]

---

## KYC/Identity Verification APIs

EP: POST /account-opening/applications/{applicationId}/kyc/initiate
DESC: Initiate KYC verification for application.
IN: headers:{Authorization:str!}, params:{applicationId:str!}
OUT: 200:{id:str, applicationId:str, status:str, provider:str, verificationId:str, confidence:float, results:obj{identity:obj, address:obj, phone:obj, email:obj, ofac:obj}}
ERR: {"400":"KYC already initiated or application not ready", "401":"Unauthorized", "404":"Application not found", "500":"Internal server error"}
EX_REQ: curl -X POST /account-opening/applications/app_123/kyc/initiate -H "Authorization: Bearer eyJ..."
EX_RES_200: {"id":"kyc_123","applicationId":"app_123","status":"pending","provider":"Mock Provider","verificationId":"verify_123","confidence":0.95,"results":{"identity":{"passed":true,"confidence":0.95},"address":{"passed":true,"confidence":0.9},"phone":{"passed":true,"confidence":0.88},"email":{"passed":true,"confidence":0.92},"ofac":{"passed":true,"matches":[]}}}

---

EP: GET /account-opening/applications/{applicationId}/kyc/status
DESC: Get KYC verification status for application.
IN: headers:{Authorization:str!}, params:{applicationId:str!}
OUT: 200:{id:str, applicationId:str, status:str, provider:str, verificationId:str, confidence:float, verifiedAt:str, results:obj{identity:obj, address:obj, phone:obj, email:obj, ofac:obj}}
ERR: {"401":"Unauthorized", "404":"Application or KYC verification not found", "500":"Internal server error"}
EX_REQ: curl -X GET /account-opening/applications/app_123/kyc/status -H "Authorization: Bearer eyJ..."
EX_RES_200: {"id":"kyc_123","applicationId":"app_123","status":"passed","provider":"Mock Provider","verificationId":"verify_123","confidence":0.95,"verifiedAt":"2025-01-01T00:05:00Z","results":{"identity":{"passed":true,"confidence":0.95},"address":{"passed":true,"confidence":0.9},"phone":{"passed":true,"confidence":0.88},"email":{"passed":true,"confidence":0.92},"ofac":{"passed":true,"matches":[]}}}

---

## Additional Signers APIs

EP: POST /account-opening/signers
DESC: Add additional signer to application.
IN: headers:{Authorization:str!}, body:{applicationId:str!, personalInfo:obj!, role:str!, relationshipToBusiness:str, beneficialOwnershipPercentage:float, hasSigningAuthority:bool!}
OUT: 201:{id:str, applicationId:str, personalInfo:obj, role:str, relationshipToBusiness:str, beneficialOwnershipPercentage:float, hasSigningAuthority:bool, kycStatus:str, documents:arr[obj]}
ERR: {"400":"Invalid signer information", "401":"Unauthorized", "404":"Application not found", "500":"Internal server error"}
EX_REQ: curl -X POST /account-opening/signers -H "Authorization: Bearer eyJ..." -H "Content-Type: application/json" -d '{"applicationId":"app_123","personalInfo":{"firstName":"Jane","lastName":"Smith","dateOfBirth":"1985-05-20","ssn":"987-65-4321","phone":"555-987-6543","email":"jane.smith@example.com","mailingAddress":{"street":"456 Oak Ave","city":"Another City","state":"NY","zipCode":"67890","country":"US"},"employmentStatus":"employed"},"role":"authorized_signer","hasSigningAuthority":true}'
EX_RES_201: {"id":"signer_123","applicationId":"app_123","personalInfo":{"firstName":"Jane","lastName":"Smith","dateOfBirth":"1985-05-20","ssn":"987-65-4321","phone":"555-987-6543","email":"jane.smith@example.com","mailingAddress":{"street":"456 Oak Ave","city":"Another City","state":"NY","zipCode":"67890","country":"US"},"employmentStatus":"employed"},"role":"authorized_signer","hasSigningAuthority":true,"kycStatus":"pending","documents":[]}

---

EP: PUT /account-opening/signers/{signerId}
DESC: Update additional signer information.
IN: headers:{Authorization:str!}, params:{signerId:str!}, body:{personalInfo:obj, role:str, relationshipToBusiness:str, beneficialOwnershipPercentage:float, hasSigningAuthority:bool}
OUT: 200:{id:str, applicationId:str, personalInfo:obj, role:str, relationshipToBusiness:str, beneficialOwnershipPercentage:float, hasSigningAuthority:bool, kycStatus:str, documents:arr[obj]}
ERR: {"400":"Invalid signer information", "401":"Unauthorized", "404":"Signer not found", "500":"Internal server error"}
EX_REQ: curl -X PUT /account-opening/signers/signer_123 -H "Authorization: Bearer eyJ..." -H "Content-Type: application/json" -d '{"role":"beneficial_owner","beneficialOwnershipPercentage":25}'
EX_RES_200: {"id":"signer_123","applicationId":"app_123","personalInfo":{"firstName":"Jane","lastName":"Smith"},"role":"beneficial_owner","beneficialOwnershipPercentage":25,"hasSigningAuthority":true,"kycStatus":"pending","documents":[]}

---

EP: GET /account-opening/applications/{applicationId}/signers
DESC: Get all additional signers for application.
IN: headers:{Authorization:str!}, params:{applicationId:str!}
OUT: 200:arr[obj{id:str, applicationId:str, personalInfo:obj, role:str, relationshipToBusiness:str, beneficialOwnershipPercentage:float, hasSigningAuthority:bool, kycStatus:str, documents:arr[obj]}]
ERR: {"401":"Unauthorized", "404":"Application not found", "500":"Internal server error"}
EX_REQ: curl -X GET /account-opening/applications/app_123/signers -H "Authorization: Bearer eyJ..."
EX_RES_200: [{"id":"signer_123","applicationId":"app_123","personalInfo":{"firstName":"Jane","lastName":"Smith"},"role":"authorized_signer","hasSigningAuthority":true,"kycStatus":"passed","documents":[]}]

---

## Risk Assessment APIs

EP: POST /account-opening/applications/{applicationId}/risk-assessment
DESC: Perform risk assessment for application.
IN: headers:{Authorization:str!}, params:{applicationId:str!}
OUT: 200:{id:str, applicationId:str, overallRisk:str, riskScore:int, factors:arr[obj{category:str, factor:str, weight:float, score:int, impact:str, description:str}], recommendations:arr[str], requiresManualReview:bool, assessedAt:str, assessedBy:str}
ERR: {"400":"Risk assessment already performed or application not ready", "401":"Unauthorized", "404":"Application not found", "500":"Internal server error"}
EX_REQ: curl -X POST /account-opening/applications/app_123/risk-assessment -H "Authorization: Bearer eyJ..."
EX_RES_200: {"id":"risk_123","applicationId":"app_123","overallRisk":"low","riskScore":25,"factors":[{"category":"Identity","factor":"Strong identity verification","weight":0.3,"score":10,"impact":"positive","description":"Identity verification passed with high confidence"}],"recommendations":["Proceed with standard approval process"],"requiresManualReview":false,"assessedAt":"2025-01-01T00:10:00Z","assessedBy":"system"}

---

## Disclosures and Agreements APIs

EP: GET /account-opening/disclosures
DESC: Get required disclosures for account type.
IN: headers:{Authorization:str!}, query:{accountType:str!}
OUT: 200:arr[obj{id:str, type:str, title:str, content:str, version:str, effectiveDate:str, required:bool, applicableFor:arr[str]}]
ERR: {"401":"Unauthorized", "400":"Invalid account type", "500":"Internal server error"}
EX_REQ: curl -X GET "/account-opening/disclosures?accountType=consumer" -H "Authorization: Bearer eyJ..."
EX_RES_200: [{"id":"disc_consumer_account_agreement","type":"consumer_account_agreement","title":"Consumer Deposit Account Agreement","content":"This agreement governs your consumer deposit account...","version":"1.0","effectiveDate":"2024-01-01","required":true,"applicableFor":["consumer"]}]

---

EP: POST /account-opening/agreements
DESC: Acknowledge agreement/disclosure.
IN: headers:{Authorization:str!}, body:{applicationId:str!, disclosureId:str!}
OUT: 200:{id:str, applicationId:str, disclosureId:str, acknowledged:bool, acknowledgedAt:str, ipAddress:str, userAgent:str}
ERR: {"400":"Agreement already acknowledged", "401":"Unauthorized", "404":"Application or disclosure not found", "500":"Internal server error"}
EX_REQ: curl -X POST /account-opening/agreements -H "Authorization: Bearer eyJ..." -H "Content-Type: application/json" -d '{"applicationId":"app_123","disclosureId":"disc_consumer_account_agreement"}'
EX_RES_200: {"id":"agreement_123","applicationId":"app_123","disclosureId":"disc_consumer_account_agreement","acknowledged":true,"acknowledgedAt":"2025-01-01T00:15:00Z","ipAddress":"127.0.0.1","userAgent":"curl/7.68.0"}

---

## Electronic Signatures APIs

EP: POST /account-opening/signatures
DESC: Capture electronic signature.
IN: headers:{Authorization:str!}, body:{applicationId:str!, signatureData:str!, documentType:str!}
OUT: 200:{id:str, applicationId:str, signerId:str, documentType:str, signatureData:str, signedAt:str, ipAddress:str, userAgent:str}
ERR: {"400":"Invalid signature data", "401":"Unauthorized", "404":"Application not found", "500":"Internal server error"}
EX_REQ: curl -X POST /account-opening/signatures -H "Authorization: Bearer eyJ..." -H "Content-Type: application/json" -d '{"applicationId":"app_123","signatureData":"data:image/png;base64,iVBOR...","documentType":"consumer_account_agreement"}'
EX_RES_200: {"id":"sig_123","applicationId":"app_123","signerId":"primary_signer","documentType":"consumer_account_agreement","signatureData":"data:image/png;base64,iVBOR...","signedAt":"2025-01-01T00:20:00Z","ipAddress":"127.0.0.1","userAgent":"curl/7.68.0"}

---

## Account Funding APIs

EP: POST /account-opening/applications/{applicationId}/funding
DESC: Setup account funding method.
IN: headers:{Authorization:str!}, params:{applicationId:str!}, body:{method:str!, amount:float!, details:obj!}
OUT: 200:{id:str, applicationId:str, method:str, amount:float, status:str, details:obj, createdAt:str}
ERR: {"400":"Invalid funding information", "401":"Unauthorized", "404":"Application not found", "500":"Internal server error"}
EX_REQ: curl -X POST /account-opening/applications/app_123/funding -H "Authorization: Bearer eyJ..." -H "Content-Type: application/json" -d '{"method":"ach","amount":1000,"details":{"bankName":"Test Bank","accountNumber":"1234567890","routingNumber":"021000021","accountType":"checking"}}'
EX_RES_200: {"id":"funding_123","applicationId":"app_123","method":"ach","amount":1000,"status":"pending","details":{"bankName":"Test Bank","accountNumber":"1234567890","routingNumber":"021000021","accountType":"checking"},"createdAt":"2025-01-01T00:25:00Z"}

---

## Application Summary APIs

EP: GET /account-opening/applications/{applicationId}/summary
DESC: Get complete application summary for review.
IN: headers:{Authorization:str!}, params:{applicationId:str!}
OUT: 200:{application:obj, personalInfo:obj, businessProfile:obj, financialProfile:obj, productSelections:arr[obj], documents:arr[obj], kycVerification:obj, additionalSigners:arr[obj], riskAssessment:obj, agreements:arr[obj], signatures:arr[obj], fundingSetup:obj}
ERR: {"401":"Unauthorized", "404":"Application not found", "500":"Internal server error"}
EX_REQ: curl -X GET /account-opening/applications/app_123/summary -H "Authorization: Bearer eyJ..."
EX_RES_200: {"application":{"id":"app_123","status":"submitted","currentStep":"review","accountType":"consumer","customerType":"new","applicantId":"applicant_123","submittedAt":"2025-01-01T00:30:00Z","createdAt":"2025-01-01T00:00:00Z","updatedAt":"2025-01-01T00:30:00Z","metadata":{}},"personalInfo":{"firstName":"John","lastName":"Doe"},"productSelections":[],"documents":[],"additionalSigners":[],"agreements":[],"signatures":[]}

---

## Admin/Staff Portal APIs

EP: GET /account-opening/admin/applications
DESC: Get all applications for admin review with filtering.
IN: headers:{Authorization:str!}, query:{status:arr[str], accountType:arr[str], riskLevel:arr[str], dateFrom:str, dateTo:str, search:str}
OUT: 200:arr[obj{id:str, applicantName:str, accountType:str, status:str, currentStep:str, riskLevel:str, submittedAt:str, lastActivity:str, assignedTo:str}]
ERR: {"401":"Unauthorized", "403":"Forbidden - admin access required", "500":"Internal server error"}
EX_REQ: curl -X GET "/account-opening/admin/applications?status=submitted&accountType=consumer" -H "Authorization: Bearer eyJ..."
EX_RES_200: [{"id":"app_123","applicantName":"John Doe","accountType":"consumer","status":"submitted","currentStep":"review","riskLevel":"low","submittedAt":"2025-01-01T00:30:00Z","lastActivity":"2025-01-01T00:30:00Z","assignedTo":"admin_user"}]

---

EP: PUT /account-opening/admin/applications/{applicationId}/status
DESC: Update application status (admin only).
IN: headers:{Authorization:str!}, params:{applicationId:str!}, body:{status:str!, notes:str}
OUT: 200:{id:str, status:str, currentStep:str, accountType:str, customerType:str, applicantId:str, submittedAt:str, completedAt:str, createdAt:str, updatedAt:str, metadata:obj}
ERR: {"400":"Invalid status transition", "401":"Unauthorized", "403":"Forbidden - admin access required", "404":"Application not found", "500":"Internal server error"}
EX_REQ: curl -X PUT /account-opening/admin/applications/app_123/status -H "Authorization: Bearer eyJ..." -H "Content-Type: application/json" -d '{"status":"approved","notes":"Application approved after review"}'
EX_RES_200: {"id":"app_123","status":"approved","currentStep":"confirmation","accountType":"consumer","customerType":"new","applicantId":"applicant_123","submittedAt":"2025-01-01T00:30:00Z","completedAt":"2025-01-01T01:00:00Z","createdAt":"2025-01-01T00:00:00Z","updatedAt":"2025-01-01T01:00:00Z","metadata":{}}

---

EP: GET /account-opening/admin/applications/{applicationId}/audit
DESC: Get audit trail for application (admin only).
IN: headers:{Authorization:str!}, params:{applicationId:str!}
OUT: 200:arr[obj{id:str, applicationId:str, action:str, description:str, performedBy:str, performedAt:str, ipAddress:str, userAgent:str, changes:obj}]
ERR: {"401":"Unauthorized", "403":"Forbidden - admin access required", "404":"Application not found", "500":"Internal server error"}
EX_REQ: curl -X GET /account-opening/admin/applications/app_123/audit -H "Authorization: Bearer eyJ..."
EX_RES_200: [{"id":"audit_1","applicationId":"app_123","action":"application_created","description":"Application created","performedBy":"system","performedAt":"2025-01-01T00:00:00Z","ipAddress":"127.0.0.1","userAgent":"curl/7.68.0","changes":{"status":{"from":null,"to":"draft"}}}]
