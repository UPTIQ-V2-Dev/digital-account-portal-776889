import { PrismaClient, Role, ProductType, EligibilityOperator } from '../generated/prisma/index.js';
import bcrypt from 'bcrypt';

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

    // Create regular user
    const userPassword = await bcrypt.hash('user123', 12);
    const user = await prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: {},
        create: {
            email: 'user@example.com',
            name: 'John Doe',
            password: userPassword,
            role: Role.USER,
            isEmailVerified: true
        }
    });

    console.log('✅ Created regular user:', user.email);

    // Create sample applications
    const now = new Date();
    const sampleApplication = await prisma.application.upsert({
        where: { id: 'app_sample_123' },
        update: {},
        create: {
            id: 'app_sample_123',
            status: 'draft',
            currentStep: 'account_type',
            accountType: 'consumer',
            customerType: 'new',
            applicantId: 'applicant_sample_123',
            userId: user.id,
            userAgent: 'Mozilla/5.0 (Sample Browser)',
            ipAddress: '127.0.0.1',
            sessionId: 'session_sample_123',
            source: 'web_portal',
            startedAt: now,
            lastActivity: now
        }
    });

    console.log('✅ Created sample application:', sampleApplication.id);

    // Create sample personal information for the application
    const samplePersonalInfo = await prisma.personalInfo.upsert({
        where: { applicationId: 'app_sample_123' },
        update: {},
        create: {
            applicationId: 'app_sample_123',
            firstName: 'John',
            middleName: 'Michael',
            lastName: 'Doe',
            dateOfBirth: '1990-01-15',
            ssn: '123-45-6789',
            phone: '555-123-4567',
            email: 'john@example.com',
            employmentStatus: 'employed',
            occupation: 'Software Engineer',
            employer: 'Tech Corp',
            workPhone: '555-999-8888',
            mailingStreet: '123 Main St',
            mailingCity: 'Anytown',
            mailingState: 'CA',
            mailingZipCode: '12345',
            mailingCountry: 'US',
            mailingApartment: 'Apt 2B',
            physicalStreet: '123 Main St',
            physicalCity: 'Anytown',
            physicalState: 'CA',
            physicalZipCode: '12345',
            physicalCountry: 'US',
            physicalApartment: 'Apt 2B'
        }
    });

    console.log('✅ Created sample personal info for application:', samplePersonalInfo.applicationId);

    // Create comprehensive banking products
    const products = [
        {
            id: 'prod_simple_checking',
            name: 'Simple Checking',
            type: ProductType.CHECKING,
            description: 'Perfect for everyday banking needs with essential features',
            features: ['Online Banking', 'Mobile Banking', 'Bill Pay', 'Debit Card', 'ATM Access'],
            minimumBalance: 100.0,
            monthlyFee: 10.0,
            interestRate: 0.01,
            isActive: true,
            eligibilityRules: [
                {
                    field: 'age',
                    operator: EligibilityOperator.GREATER_THAN_OR_EQUAL,
                    value: 18,
                    description: 'Must be 18 years or older'
                }
            ]
        },
        {
            id: 'prod_premium_checking',
            name: 'Premium Checking',
            type: ProductType.CHECKING,
            description: 'Premium checking account with enhanced benefits and no monthly fees',
            features: ['Online Banking', 'Mobile Banking', 'Bill Pay', 'Premium Debit Card', 'ATM Fee Reimbursement', 'Overdraft Protection'],
            minimumBalance: 2500.0,
            monthlyFee: 0.0,
            interestRate: 0.5,
            isActive: true,
            eligibilityRules: [
                {
                    field: 'age',
                    operator: EligibilityOperator.GREATER_THAN_OR_EQUAL,
                    value: 18,
                    description: 'Must be 18 years or older'
                },
                {
                    field: 'annualIncome',
                    operator: EligibilityOperator.GREATER_THAN_OR_EQUAL,
                    value: 50000,
                    description: 'Minimum annual income of $50,000'
                }
            ]
        },
        {
            id: 'prod_high_yield_savings',
            name: 'High Yield Savings',
            type: ProductType.SAVINGS,
            description: 'Earn competitive interest rates on your savings',
            features: ['Online Banking', 'Mobile Banking', 'High Interest Rate', 'No Monthly Fees'],
            minimumBalance: 500.0,
            monthlyFee: 0.0,
            interestRate: 4.5,
            isActive: true,
            eligibilityRules: [
                {
                    field: 'age',
                    operator: EligibilityOperator.GREATER_THAN_OR_EQUAL,
                    value: 18,
                    description: 'Must be 18 years or older'
                }
            ]
        },
        {
            id: 'prod_youth_savings',
            name: 'Youth Savings',
            type: ProductType.SAVINGS,
            description: 'Savings account designed for young savers',
            features: ['Online Banking', 'Mobile Banking', 'Financial Education Resources', 'No Monthly Fees'],
            minimumBalance: 25.0,
            monthlyFee: 0.0,
            interestRate: 2.0,
            isActive: true,
            eligibilityRules: [
                {
                    field: 'age',
                    operator: EligibilityOperator.LESS_THAN_OR_EQUAL,
                    value: 17,
                    description: 'Must be 17 years or younger'
                }
            ]
        },
        {
            id: 'prod_money_market',
            name: 'Money Market Account',
            type: ProductType.MONEY_MARKET,
            description: 'Higher interest rates with limited monthly transactions',
            features: ['Online Banking', 'Mobile Banking', 'Check Writing', 'Debit Card', 'Tiered Interest Rates'],
            minimumBalance: 2500.0,
            monthlyFee: 12.0,
            interestRate: 3.5,
            isActive: true,
            eligibilityRules: [
                {
                    field: 'age',
                    operator: EligibilityOperator.GREATER_THAN_OR_EQUAL,
                    value: 18,
                    description: 'Must be 18 years or older'
                },
                {
                    field: 'initialDeposit',
                    operator: EligibilityOperator.GREATER_THAN_OR_EQUAL,
                    value: 2500,
                    description: 'Minimum initial deposit of $2,500'
                }
            ]
        },
        {
            id: 'prod_12_month_cd',
            name: '12-Month Certificate of Deposit',
            type: ProductType.CERTIFICATE_DEPOSIT,
            description: 'Lock in a guaranteed rate for 12 months',
            features: ['Guaranteed Interest Rate', 'FDIC Insured', 'Automatic Renewal Option'],
            minimumBalance: 1000.0,
            monthlyFee: 0.0,
            interestRate: 5.0,
            isActive: true,
            eligibilityRules: [
                {
                    field: 'age',
                    operator: EligibilityOperator.GREATER_THAN_OR_EQUAL,
                    value: 18,
                    description: 'Must be 18 years or older'
                }
            ]
        },
        {
            id: 'prod_rewards_credit_card',
            name: 'Rewards Credit Card',
            type: ProductType.CREDIT_CARD,
            description: 'Earn cash back on everyday purchases',
            features: ['2% Cash Back on Gas and Groceries', '1% Cash Back on All Purchases', 'No Annual Fee', 'Fraud Protection'],
            minimumBalance: 0.0,
            monthlyFee: 0.0,
            interestRate: 18.99,
            isActive: true,
            eligibilityRules: [
                {
                    field: 'age',
                    operator: EligibilityOperator.GREATER_THAN_OR_EQUAL,
                    value: 18,
                    description: 'Must be 18 years or older'
                },
                {
                    field: 'creditScore',
                    operator: EligibilityOperator.GREATER_THAN_OR_EQUAL,
                    value: 650,
                    description: 'Minimum credit score of 650'
                },
                {
                    field: 'annualIncome',
                    operator: EligibilityOperator.GREATER_THAN_OR_EQUAL,
                    value: 25000,
                    description: 'Minimum annual income of $25,000'
                }
            ]
        },
        {
            id: 'prod_personal_loan',
            name: 'Personal Loan',
            type: ProductType.LOAN,
            description: 'Flexible personal loan for various needs',
            features: ['Fixed Interest Rate', 'No Collateral Required', 'Flexible Terms', 'Quick Approval'],
            minimumBalance: 0.0,
            monthlyFee: 0.0,
            interestRate: 8.99,
            isActive: true,
            eligibilityRules: [
                {
                    field: 'age',
                    operator: EligibilityOperator.GREATER_THAN_OR_EQUAL,
                    value: 21,
                    description: 'Must be 21 years or older'
                },
                {
                    field: 'creditScore',
                    operator: EligibilityOperator.GREATER_THAN_OR_EQUAL,
                    value: 600,
                    description: 'Minimum credit score of 600'
                },
                {
                    field: 'annualIncome',
                    operator: EligibilityOperator.GREATER_THAN_OR_EQUAL,
                    value: 30000,
                    description: 'Minimum annual income of $30,000'
                },
                {
                    field: 'employmentStatus',
                    operator: EligibilityOperator.IN,
                    value: ['employed', 'self_employed'],
                    description: 'Must be employed or self-employed'
                }
            ]
        },
        {
            id: 'prod_home_mortgage',
            name: 'Home Mortgage',
            type: ProductType.MORTGAGE,
            description: 'Competitive rates for home purchases and refinancing',
            features: ['Competitive Rates', 'Multiple Term Options', 'Online Application', 'Local Underwriting'],
            minimumBalance: 0.0,
            monthlyFee: 0.0,
            interestRate: 6.5,
            isActive: true,
            eligibilityRules: [
                {
                    field: 'age',
                    operator: EligibilityOperator.GREATER_THAN_OR_EQUAL,
                    value: 18,
                    description: 'Must be 18 years or older'
                },
                {
                    field: 'creditScore',
                    operator: EligibilityOperator.GREATER_THAN_OR_EQUAL,
                    value: 620,
                    description: 'Minimum credit score of 620'
                },
                {
                    field: 'annualIncome',
                    operator: EligibilityOperator.GREATER_THAN_OR_EQUAL,
                    value: 40000,
                    description: 'Minimum annual income of $40,000'
                }
            ]
        },
        {
            id: 'prod_ira_traditional',
            name: 'Traditional IRA',
            type: ProductType.RETIREMENT,
            description: 'Tax-deferred retirement savings account',
            features: ['Tax-Deferred Growth', 'Investment Options', 'Contribution Flexibility', 'Rollover Options'],
            minimumBalance: 500.0,
            monthlyFee: 0.0,
            interestRate: 0.0, // Variable based on investments
            isActive: true,
            eligibilityRules: [
                {
                    field: 'age',
                    operator: EligibilityOperator.GREATER_THAN_OR_EQUAL,
                    value: 18,
                    description: 'Must be 18 years or older'
                },
                {
                    field: 'age',
                    operator: EligibilityOperator.LESS_THAN_OR_EQUAL,
                    value: 72,
                    description: 'Must be 72 years or younger'
                }
            ]
        }
    ];

    console.log('🌱 Creating comprehensive banking products...');

    for (const productData of products) {
        const { eligibilityRules, ...product } = productData;
        
        await prisma.product.upsert({
            where: { id: product.id },
            update: {},
            create: {
                ...product,
                eligibilityRules: {
                    create: eligibilityRules
                }
            }
        });
        
        console.log(`✅ Created product: ${product.name}`);
    }

    console.log(`✅ Created ${products.length} banking products with eligibility rules`);
}

main()
    .catch(e => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
