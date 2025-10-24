/**
 * Simple test script to validate the Risk Assessment Engine
 * This can be run with `tsx src/utils/testRiskEngine.ts`
 */
import { RiskAssessmentEngine } from './riskAssessmentEngine.ts';

function testRiskAssessmentEngine() {
    console.log('🧪 Testing Risk Assessment Engine...\n');

    // Test data for a low-risk consumer application
    const lowRiskData = {
        personalInfo: {
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: '1985-03-15',
            ssn: '123-45-6789',
            phone: '555-123-4567',
            email: 'john.doe@gmail.com',
            mailingAddress: {
                street: '123 Main St',
                city: 'Sacramento',
                state: 'CA',
                zipCode: '95814',
                country: 'US'
            },
            employmentStatus: 'employed',
            occupation: 'Software Engineer',
            employer: 'Tech Corp'
        },
        financialProfile: {
            annualIncome: 95000,
            incomeSource: ['employment'],
            assets: 150000,
            liabilities: 35000,
            bankingRelationships: [
                {
                    bankName: 'Chase Bank',
                    accountTypes: ['Checking', 'Savings'],
                    yearsWithBank: 7
                }
            ],
            accountActivities: [
                {
                    activity: 'Direct Deposit',
                    frequency: 'Monthly',
                    amount: 7916
                }
            ]
        },
        kycVerification: {
            status: 'passed',
            confidence: 0.95,
            results: {
                identity: { passed: true, confidence: 0.95 },
                address: { passed: true, confidence: 0.91 },
                phone: { passed: true, confidence: 0.89 },
                email: { passed: true, confidence: 0.93 },
                ofac: { passed: true, matches: [] }
            }
        },
        documents: [
            {
                type: 'drivers_license',
                verificationStatus: 'verified',
                verificationDetails: {
                    provider: 'Mock Provider',
                    confidence: 0.95
                }
            }
        ],
        additionalSigners: [],
        accountType: 'consumer'
    };

    try {
        const result = RiskAssessmentEngine.assessRisk('test_app_123', lowRiskData, 'test_system');

        console.log('✅ Low Risk Assessment Result:');
        console.log(`   Risk Level: ${result.overallRisk}`);
        console.log(`   Risk Score: ${result.riskScore}`);
        console.log(`   Requires Manual Review: ${result.requiresManualReview}`);
        console.log(`   Risk Factors: ${result.factors.length}`);
        console.log(`   Recommendations: ${result.recommendations.length}\n`);

        // Show top 3 risk factors
        const sortedFactors = result.factors.sort((a, b) => b.score - a.score);
        console.log('🔍 Top Risk Factors:');
        sortedFactors.slice(0, 3).forEach((factor, i) => {
            console.log(
                `   ${i + 1}. ${factor.category}: ${factor.factor} (Score: ${factor.score}, Impact: ${factor.impact})`
            );
        });
        console.log('');

        console.log('💡 Recommendations:');
        result.recommendations.forEach((rec, i) => {
            console.log(`   ${i + 1}. ${rec}`);
        });
        console.log('');
    } catch (error) {
        console.error('❌ Error testing low risk assessment:', error);
    }

    // Test data for a high-risk business application
    const highRiskData = {
        personalInfo: {
            firstName: 'Vladimir',
            lastName: 'Testovich',
            dateOfBirth: '2003-01-01', // Very young applicant
            ssn: '000-00-0000',
            phone: '555-1234567', // Sequential pattern
            email: 'vladimir@tempmail.com', // Disposable email
            mailingAddress: {
                street: '123 Main St',
                city: 'Miami',
                state: 'FL', // High-risk state
                zipCode: '33101',
                country: 'US'
            },
            employmentStatus: 'self-employed',
            occupation: 'Consultant',
            employer: null
        },
        businessProfile: {
            businessName: 'Cash Services LLC',
            ein: '12-3456789',
            entityType: 'LLC',
            industryType: 'Money Services', // High-risk industry
            dateEstablished: '2024-11-01', // Very new business
            businessAddress: {
                street: '456 Business St',
                city: 'Miami',
                state: 'FL',
                zipCode: '33101',
                country: 'US'
            },
            isCashIntensive: true, // High-risk
            monthlyTransactionVolume: 1000000, // Very high volume
            monthlyTransactionCount: 5000,
            expectedBalance: 25000 // Low relative to volume
        },
        financialProfile: {
            annualIncome: 30000, // Low income
            incomeSource: ['self-employment'],
            assets: 5000, // Very low assets
            liabilities: 75000, // High debt
            bankingRelationships: [
                {
                    bankName: 'Local Credit Union',
                    accountTypes: ['Checking'],
                    yearsWithBank: 0.5 // Very short history
                }
            ],
            accountActivities: [
                {
                    activity: 'Cash Deposits',
                    frequency: 'Daily',
                    amount: 3333
                }
            ]
        },
        kycVerification: {
            status: 'needs_review',
            confidence: 0.65,
            results: {
                identity: { passed: true, confidence: 0.65 },
                address: { passed: false, confidence: 0.45 },
                phone: { passed: true, confidence: 0.55 },
                email: { passed: false, confidence: 0.25 },
                ofac: { passed: false, matches: [{ name: 'Vladimir Testovich', confidence: 0.75 }] }
            }
        },
        documents: [
            {
                type: 'drivers_license',
                verificationStatus: 'needs_review',
                verificationDetails: {
                    provider: 'Mock Provider',
                    confidence: 0.55,
                    issues: ['Document quality concerns', 'Potential tampering detected']
                }
            }
        ],
        additionalSigners: [],
        accountType: 'commercial'
    };

    try {
        const result = RiskAssessmentEngine.assessRisk('test_app_456', highRiskData, 'test_system');

        console.log('🚨 High Risk Assessment Result:');
        console.log(`   Risk Level: ${result.overallRisk}`);
        console.log(`   Risk Score: ${result.riskScore}`);
        console.log(`   Requires Manual Review: ${result.requiresManualReview}`);
        console.log(`   Risk Factors: ${result.factors.length}`);
        console.log(`   Recommendations: ${result.recommendations.length}\n`);

        // Show top 5 risk factors
        const sortedFactors = result.factors.sort((a, b) => b.score - a.score);
        console.log('🚩 Top Risk Factors:');
        sortedFactors.slice(0, 5).forEach((factor, i) => {
            console.log(
                `   ${i + 1}. ${factor.category}: ${factor.factor} (Score: ${factor.score}, Impact: ${factor.impact})`
            );
        });
        console.log('');

        console.log('⚠️  Recommendations:');
        result.recommendations.forEach((rec, i) => {
            console.log(`   ${i + 1}. ${rec}`);
        });
        console.log('');
    } catch (error) {
        console.error('❌ Error testing high risk assessment:', error);
    }

    console.log('✨ Risk Assessment Engine testing complete!');
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    try {
        testRiskAssessmentEngine();
    } catch (error) {
        console.error(error);
    }
}

export { testRiskAssessmentEngine };
