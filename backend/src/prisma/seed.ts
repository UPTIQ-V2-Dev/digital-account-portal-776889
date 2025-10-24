import { PrismaClient, Role } from '../generated/prisma/index.js';
import bcrypt from 'bcrypt';
import cuid from 'cuid';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Admin',
            password: adminPassword,
            role: Role.ADMIN,
            isEmailVerified: true
        }
    });

    console.log('✅ Created admin user:', admin.email);

    // Create test user
    const testPassword = await bcrypt.hash('password123', 12);
    const testUser = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
            email: 'test@example.com',
            name: 'Test User',
            password: testPassword,
            role: Role.USER,
            isEmailVerified: true
        }
    });

    console.log('✅ Created test user:', testUser.email);

    // Create sample application
    const sampleApplication = await prisma.application.upsert({
        where: { id: 'app_sample_123' },
        update: {},
        create: {
            id: 'app_sample_123',
            accountType: 'consumer',
            applicantId: cuid(),
            userId: testUser.id,
            metadata: {
                userAgent: 'Mozilla/5.0 (Test Browser)',
                ipAddress: '192.168.1.1',
                sessionId: 'session_' + Date.now(),
                startedAt: new Date().toISOString(),
                lastActivity: new Date().toISOString(),
                source: 'seed'
            }
        }
    });

    console.log('✅ Created sample application:', sampleApplication.id);

    // Create sample products
    const products = [
        {
            id: 'prod_simple_checking',
            name: 'Simple Checking',
            type: 'checking',
            description:
                'Online Banking & Bill Pay • Mobile Deposits & Electronic Statements • Monthly Fee of $10 • Minimum Balance of $100',
            features: ['Online Banking', 'Bill Pay', 'Mobile Deposits', 'Electronic Statements'],
            minimumBalance: 100,
            monthlyFee: 10,
            interestRate: 0,
            eligibilityRules: [{ accountTypes: ['consumer'], conditions: [] }]
        },
        {
            id: 'prod_premium_checking',
            name: 'Premium Checking',
            type: 'checking',
            description:
                'All Simple Checking features plus • No Monthly Fee with $2,500 minimum balance • Free checks • ATM fee reimbursement',
            features: [
                'Online Banking',
                'Bill Pay',
                'Mobile Deposits',
                'Electronic Statements',
                'Free Checks',
                'ATM Fee Reimbursement'
            ],
            minimumBalance: 2500,
            monthlyFee: 0,
            interestRate: 0.01,
            eligibilityRules: [{ accountTypes: ['consumer'], conditions: [{ type: 'minimumBalance', value: 2500 }] }]
        },
        {
            id: 'prod_business_checking',
            name: 'Business Checking',
            type: 'checking',
            description:
                'Designed for small businesses • 200 free transactions monthly • Online Banking & Bill Pay • Mobile Deposits • Monthly Fee of $15',
            features: ['Online Banking', 'Bill Pay', 'Mobile Deposits', 'Business Banking', '200 Free Transactions'],
            minimumBalance: 500,
            monthlyFee: 15,
            interestRate: 0,
            eligibilityRules: [{ accountTypes: ['commercial', 'business'], conditions: [] }]
        },
        {
            id: 'prod_commercial_checking',
            name: 'Commercial Checking',
            type: 'checking',
            description:
                'For established businesses • Unlimited transactions • Wire transfer services • Dedicated relationship manager • Monthly Fee of $25',
            features: [
                'Online Banking',
                'Bill Pay',
                'Mobile Deposits',
                'Business Banking',
                'Unlimited Transactions',
                'Wire Transfers',
                'Relationship Manager'
            ],
            minimumBalance: 2500,
            monthlyFee: 25,
            interestRate: 0.005,
            eligibilityRules: [
                { accountTypes: ['commercial', 'business'], conditions: [{ type: 'minimumBalance', value: 2500 }] }
            ]
        },
        {
            id: 'prod_savings_account',
            name: 'High Yield Savings',
            type: 'savings',
            description:
                'Competitive interest rate • No monthly fee with $500 minimum balance • Online Banking • Limited transactions',
            features: ['Online Banking', 'High Interest Rate', 'Mobile Deposits'],
            minimumBalance: 500,
            monthlyFee: 0,
            interestRate: 0.045,
            eligibilityRules: [{ accountTypes: ['consumer', 'commercial', 'business'], conditions: [] }]
        }
    ];

    for (const product of products) {
        const createdProduct = await prisma.product.upsert({
            where: { id: product.id },
            update: {},
            create: product
        });
        console.log('✅ Created product:', createdProduct.name);
    }

    // Create sample additional signer for business application
    const businessApplication = await prisma.application.upsert({
        where: { id: 'app_business_sample_123' },
        update: {},
        create: {
            id: 'app_business_sample_123',
            accountType: 'business',
            applicantId: cuid(),
            userId: testUser.id,
            metadata: {
                userAgent: 'Mozilla/5.0 (Test Browser)',
                ipAddress: '192.168.1.1',
                sessionId: 'session_' + Date.now(),
                startedAt: new Date().toISOString(),
                lastActivity: new Date().toISOString(),
                source: 'seed'
            }
        }
    });

    console.log('✅ Created sample business application:', businessApplication.id);

    // Create sample additional signers
    const sampleSigner1 = await prisma.additionalSigner.upsert({
        where: { id: 'signer_sample_123' },
        update: {},
        create: {
            id: 'signer_sample_123',
            applicationId: businessApplication.id,
            personalInfo: {
                firstName: 'Jane',
                middleName: 'M',
                lastName: 'Smith',
                dateOfBirth: '1985-05-20',
                ssn: '987-65-4321',
                phone: '555-987-6543',
                email: 'jane.smith@example.com',
                mailingAddress: {
                    street: '456 Oak Avenue',
                    city: 'Business City',
                    state: 'NY',
                    zipCode: '67890',
                    country: 'US'
                },
                employmentStatus: 'employed',
                occupation: 'Chief Financial Officer',
                employer: 'Sample Business Corp'
            },
            role: 'authorized_signer',
            relationshipToBusiness: 'Chief Financial Officer',
            hasSigningAuthority: true,
            kycStatus: 'pending'
        }
    });

    console.log('✅ Created sample signer:', sampleSigner1.id);

    const sampleSigner2 = await prisma.additionalSigner.upsert({
        where: { id: 'signer_sample_456' },
        update: {},
        create: {
            id: 'signer_sample_456',
            applicationId: businessApplication.id,
            personalInfo: {
                firstName: 'Michael',
                lastName: 'Johnson',
                dateOfBirth: '1978-11-15',
                ssn: '555-12-9876',
                phone: '555-456-7890',
                email: 'michael.johnson@example.com',
                mailingAddress: {
                    street: '789 Business Boulevard',
                    city: 'Corporate City',
                    state: 'CA',
                    zipCode: '54321',
                    country: 'US'
                },
                employmentStatus: 'self_employed',
                occupation: 'Business Owner'
            },
            role: 'beneficial_owner',
            relationshipToBusiness: 'Managing Partner',
            beneficialOwnershipPercentage: 35.0,
            hasSigningAuthority: true,
            kycStatus: 'passed'
        }
    });

    console.log('✅ Created sample beneficial owner signer:', sampleSigner2.id);

    // Create sample disclosures for different account types
    const disclosures = [
        // Consumer Disclosures
        {
            id: 'disc_consumer_account_agreement',
            type: 'consumer_account_agreement',
            title: 'Consumer Deposit Account Agreement',
            content: `CONSUMER DEPOSIT ACCOUNT AGREEMENT

This agreement governs your consumer deposit account with our bank. By opening and using your account, you agree to the following terms and conditions:

1. ACCOUNT OPENING
- You must be at least 18 years old to open an account
- Valid identification and Social Security Number required
- Minimum opening deposit may apply

2. DEPOSITS AND WITHDRAWALS
- Deposits are subject to verification and collection
- Withdrawals may be limited by federal regulation
- Electronic transactions are subject to daily limits

3. FEES AND CHARGES
- Monthly maintenance fees may apply
- Overdraft fees apply when account is overdrawn
- ATM fees may apply for out-of-network transactions

4. ACCOUNT STATEMENTS
- Monthly statements will be provided electronically
- Paper statements available for additional fee
- Review statements promptly and report discrepancies

5. LIABILITY AND SECURITY
- Report lost or stolen cards immediately
- You are liable for authorized transactions
- Bank liability is limited as permitted by law

By acknowledging this agreement, you confirm you have read, understood, and agree to be bound by these terms.`,
            version: '1.0',
            effectiveDate: '2024-01-01',
            required: true,
            applicableFor: ['consumer']
        },
        {
            id: 'disc_privacy_notice',
            type: 'privacy_notice',
            title: 'Privacy Notice',
            content: `PRIVACY NOTICE

We respect your privacy and are committed to protecting your personal information. This notice explains:

INFORMATION WE COLLECT:
- Personal information you provide on applications
- Information about your transactions with us
- Information we receive from credit reporting agencies

HOW WE USE INFORMATION:
- To process your transactions and maintain your account
- To comply with federal, state, and local laws
- To offer additional products and services that may benefit you

INFORMATION WE SHARE:
- We do not sell customer information to third parties
- We may share information with service providers who assist us
- We may share information as permitted or required by law

YOUR CHOICES:
- You may limit some sharing of your information
- You may opt out of marketing communications
- You have the right to access and correct your information

SECURITY:
- We maintain physical, electronic, and procedural safeguards
- We restrict access to your information to authorized personnel
- We regularly review and update our security practices

For questions about our privacy practices, please contact us at privacy@bank.com.`,
            version: '1.2',
            effectiveDate: '2024-01-01',
            required: true,
            applicableFor: ['consumer', 'business', 'commercial']
        },
        {
            id: 'disc_electronic_communications',
            type: 'electronic_communications',
            title: 'Electronic Communications Disclosure',
            content: `ELECTRONIC COMMUNICATIONS DISCLOSURE

By choosing electronic delivery of account documents, you agree to the following:

CONSENT TO ELECTRONIC DELIVERY:
- Account statements, notices, and disclosures may be delivered electronically
- Electronic documents have the same legal effect as paper documents
- You may withdraw consent at any time by contacting us

SYSTEM REQUIREMENTS:
- Computer or mobile device with internet access
- Current web browser with 128-bit encryption
- Email account capable of receiving messages from us
- Ability to download and save PDF files

ACCESS TO DOCUMENTS:
- Electronic documents will be available for at least 12 months
- You should save or print important documents for your records
- We will notify you by email when new documents are available

UPDATING CONTACT INFORMATION:
- You must promptly update your email address with us
- Failure to maintain current contact information may result in account closure
- We are not responsible for delivery to outdated email addresses

PAPER DELIVERY OPTION:
- You may request paper delivery of any document
- Paper delivery fees may apply
- Contact us to change your delivery preferences`,
            version: '1.0',
            effectiveDate: '2024-01-01',
            required: false,
            applicableFor: ['consumer', 'business', 'commercial']
        },

        // Business/Commercial Disclosures
        {
            id: 'disc_business_account_agreement',
            type: 'business_account_agreement',
            title: 'Business Deposit Account Agreement',
            content: `BUSINESS DEPOSIT ACCOUNT AGREEMENT

This agreement governs your business deposit account. By opening and using your account, you agree to these terms:

1. ACCOUNT AUTHORIZATION
- Account signers must be authorized by business resolution
- We may require proof of authority for any signer
- Changes to signers require written notification

2. BUSINESS VERIFICATION
- Business information must be current and accurate
- We may verify business status and good standing
- Changes to business structure must be reported

3. TRANSACTION LIMITS
- Daily transaction limits apply
- Large cash transactions may require advance notice
- International wires subject to additional requirements

4. REGULATORY COMPLIANCE
- Account subject to BSA/AML requirements
- Beneficial ownership information required for legal entities
- Suspicious activity may be reported to authorities

5. FEES AND SERVICES
- Business fee schedule applies
- Analysis statements available
- Treasury management services may be added

6. LIABILITY
- Business is liable for all authorized transactions
- Dual control procedures recommended for large transactions
- Promptly review and reconcile account statements

This agreement supplements our general account terms and conditions.`,
            version: '1.1',
            effectiveDate: '2024-01-01',
            required: true,
            applicableFor: ['business', 'commercial']
        },
        {
            id: 'disc_beneficial_ownership',
            type: 'beneficial_ownership',
            title: 'Beneficial Ownership Disclosure',
            content: `BENEFICIAL OWNERSHIP DISCLOSURE

Federal regulations require us to obtain information about the beneficial owners of legal entity customers.

WHAT IS A BENEFICIAL OWNER?
A beneficial owner is:
- Any individual who owns 25% or more of the equity interests of the legal entity
- An individual with significant responsibility for managing the legal entity

INFORMATION REQUIRED:
For each beneficial owner, we need:
- Full legal name
- Date of birth
- Residential or business address
- Social Security Number or Individual Taxpayer Identification Number

CONTROL PERSON:
We must identify one individual who has significant responsibility for managing the legal entity, such as:
- Chief Executive Officer
- Chief Financial Officer
- Chief Operating Officer
- Managing Member
- General Partner

VERIFICATION:
We will verify the identity of each beneficial owner and control person using documents such as:
- Driver's license or passport
- Other government-issued identification

UPDATES:
You must notify us of changes to beneficial ownership information within 30 days.

This information is required by the Customer Due Diligence Rule and helps us verify the identity of our business customers.`,
            version: '1.0',
            effectiveDate: '2024-01-01',
            required: true,
            applicableFor: ['business', 'commercial']
        },
        {
            id: 'disc_wire_transfer_agreement',
            type: 'wire_transfer_agreement',
            title: 'Wire Transfer Agreement',
            content: `WIRE TRANSFER AGREEMENT

This agreement governs wire transfers sent from your account:

1. AUTHORIZATION
- Wire transfer instructions are irrevocable once sent
- Dual authorization may be required for large amounts
- We may refuse any wire transfer request

2. PROCESSING
- Wire transfers are processed on business days only
- Cut-off times apply for same-day processing
- International wires may take additional time

3. FEES
- Wire transfer fees are disclosed separately
- Fees may be deducted from transfer amount
- Correspondent bank fees may apply

4. LIABILITY
- We are not liable for delays in correspondent banks
- Beneficiary bank errors are not our responsibility
- You must verify all wire instructions carefully

5. SECURITY
- Use secure methods to transmit instructions
- Never send wire instructions by email
- Report unauthorized transfers immediately

6. COMPLIANCE
- Transfers subject to OFAC screening
- Additional documentation may be required
- Some countries and individuals are restricted

Wire transfers cannot be cancelled once sent. Verify all information carefully before submitting instructions.`,
            version: '1.0',
            effectiveDate: '2024-01-01',
            required: false,
            applicableFor: ['business', 'commercial']
        }
    ];

    for (const disclosure of disclosures) {
        const createdDisclosure = await prisma.disclosure.upsert({
            where: { id: disclosure.id },
            update: {},
            create: disclosure
        });
        console.log('✅ Created disclosure:', createdDisclosure.title);
    }

    // Create sample agreements for the consumer application
    const sampleAgreement1 = await prisma.agreement.upsert({
        where: { id: 'agreement_sample_123' },
        update: {},
        create: {
            id: 'agreement_sample_123',
            applicationId: sampleApplication.id,
            disclosureId: 'disc_privacy_notice',
            acknowledged: true,
            acknowledgedAt: new Date(),
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0 (Test Browser)'
        }
    });

    console.log('✅ Created sample agreement:', sampleAgreement1.id);
}

main()
    .catch(e => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
