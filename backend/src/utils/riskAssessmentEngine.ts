import cuid from 'cuid';

export interface RiskFactor {
    category: string;
    factor: string;
    weight: number;
    score: number;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
}

export interface RiskAssessmentData {
    personalInfo?: {
        firstName: string;
        lastName: string;
        dateOfBirth: string;
        ssn: string;
        phone: string;
        email: string;
        mailingAddress: any;
        physicalAddress?: any;
        employmentStatus: string;
        occupation?: string | null;
        employer?: string | null;
    };
    businessProfile?: {
        businessName: string;
        ein: string;
        entityType: string;
        industryType: string;
        dateEstablished: string;
        businessAddress: any;
        isCashIntensive: boolean;
        monthlyTransactionVolume: number;
        monthlyTransactionCount: number;
        expectedBalance: number;
    };
    financialProfile?: {
        annualIncome: number;
        incomeSource: string[];
        assets: number;
        liabilities: number;
        bankingRelationships: any[];
        accountActivities: any[];
    };
    kycVerification?: {
        status: string;
        confidence: number;
        results: any;
    };
    documents?: Array<{
        type: string;
        verificationStatus: string;
        verificationDetails?: any;
    }>;
    additionalSigners?: Array<{
        personalInfo: any;
        role: string;
        kycStatus: string;
    }>;
    accountType: string;
}

export interface RiskAssessmentResult {
    id: string;
    applicationId: string;
    overallRisk: 'low' | 'medium' | 'high';
    riskScore: number;
    factors: RiskFactor[];
    recommendations: string[];
    requiresManualReview: boolean;
    assessedAt: string;
    assessedBy: string;
}

/**
 * Comprehensive risk assessment engine for account opening applications
 */
export class RiskAssessmentEngine {
    /**
     * Perform risk assessment for an account opening application
     */
    static assessRisk(
        applicationId: string,
        data: RiskAssessmentData,
        assessedBy: string = 'system'
    ): RiskAssessmentResult {
        const factors: RiskFactor[] = [];

        // Identity & KYC Risk Assessment
        if (data.personalInfo && data.kycVerification) {
            factors.push(...this.assessIdentityRisk(data.personalInfo, data.kycVerification));
        }

        // Financial Risk Assessment
        if (data.financialProfile) {
            factors.push(...this.assessFinancialRisk(data.financialProfile, data.accountType));
        }

        // Business Risk Assessment (for commercial accounts)
        if (data.businessProfile && data.accountType !== 'consumer') {
            factors.push(...this.assessBusinessRisk(data.businessProfile));
        }

        // Document Verification Risk Assessment
        if (data.documents) {
            factors.push(...this.assessDocumentRisk(data.documents));
        }

        // Geographic Risk Assessment
        if (data.personalInfo?.mailingAddress || data.businessProfile?.businessAddress) {
            factors.push(
                ...this.assessGeographicRisk(data.personalInfo?.mailingAddress || data.businessProfile?.businessAddress)
            );
        }

        // Behavioral/Pattern Risk Assessment
        factors.push(...this.assessBehavioralRisk(data));

        // Additional Signers Risk Assessment
        if (data.additionalSigners && data.additionalSigners.length > 0) {
            factors.push(...this.assessSignersRisk(data.additionalSigners));
        }

        // Calculate overall risk score and level
        const { riskScore, overallRisk } = this.calculateOverallRisk(factors);

        // Generate recommendations based on risk factors
        const recommendations = this.generateRecommendations(factors, overallRisk);

        // Determine if manual review is required
        const requiresManualReview = this.requiresManualReview(factors, overallRisk);

        return {
            id: cuid(),
            applicationId,
            overallRisk,
            riskScore,
            factors,
            recommendations,
            requiresManualReview,
            assessedAt: new Date().toISOString(),
            assessedBy
        };
    }

    /**
     * Assess identity and KYC verification risks
     */
    private static assessIdentityRisk(personalInfo: any, kycVerification: any): RiskFactor[] {
        const factors: RiskFactor[] = [];

        // KYC Verification Status Risk
        if (kycVerification.status === 'passed' && kycVerification.confidence >= 0.9) {
            factors.push({
                category: 'Identity',
                factor: 'Strong identity verification',
                weight: 0.3,
                score: 10,
                impact: 'positive',
                description: 'Identity verification passed with high confidence'
            });
        } else if (kycVerification.status === 'passed' && kycVerification.confidence >= 0.7) {
            factors.push({
                category: 'Identity',
                factor: 'Moderate identity verification',
                weight: 0.3,
                score: 30,
                impact: 'neutral',
                description: 'Identity verification passed but with moderate confidence'
            });
        } else if (kycVerification.status === 'needs_review') {
            factors.push({
                category: 'Identity',
                factor: 'Identity verification requires review',
                weight: 0.3,
                score: 60,
                impact: 'negative',
                description: 'Identity verification flagged for manual review'
            });
        } else if (kycVerification.status === 'failed') {
            factors.push({
                category: 'Identity',
                factor: 'Failed identity verification',
                weight: 0.3,
                score: 90,
                impact: 'negative',
                description: 'Identity verification failed'
            });
        }

        // OFAC Screening Risk
        if (kycVerification.results?.ofac?.passed === false) {
            factors.push({
                category: 'Identity',
                factor: 'OFAC screening match',
                weight: 0.4,
                score: 95,
                impact: 'negative',
                description: 'Applicant matched against sanctions lists'
            });
        } else {
            factors.push({
                category: 'Identity',
                factor: 'Clean OFAC screening',
                weight: 0.2,
                score: 5,
                impact: 'positive',
                description: 'No matches found in sanctions screening'
            });
        }

        // Age-based Risk Assessment
        const age = this.calculateAge(personalInfo.dateOfBirth);
        if (age < 21) {
            factors.push({
                category: 'Identity',
                factor: 'Young applicant age',
                weight: 0.1,
                score: 40,
                impact: 'negative',
                description: 'Applicant under 21 years old - higher risk profile'
            });
        } else if (age > 80) {
            factors.push({
                category: 'Identity',
                factor: 'Elderly applicant age',
                weight: 0.1,
                score: 25,
                impact: 'negative',
                description: 'Elderly applicant - potential vulnerability concerns'
            });
        } else {
            factors.push({
                category: 'Identity',
                factor: 'Standard applicant age',
                weight: 0.1,
                score: 10,
                impact: 'positive',
                description: 'Applicant age within standard range'
            });
        }

        return factors;
    }

    /**
     * Assess financial profile risks
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private static assessFinancialRisk(financialProfile: any, _accountType: string): RiskFactor[] {
        const factors: RiskFactor[] = [];

        // Income vs Debt Ratio
        const debtToIncomeRatio = financialProfile.liabilities / financialProfile.annualIncome;
        if (debtToIncomeRatio > 0.5) {
            factors.push({
                category: 'Financial',
                factor: 'High debt-to-income ratio',
                weight: 0.25,
                score: 70,
                impact: 'negative',
                description: `Debt-to-income ratio of ${(debtToIncomeRatio * 100).toFixed(1)}% exceeds prudent limits`
            });
        } else if (debtToIncomeRatio > 0.3) {
            factors.push({
                category: 'Financial',
                factor: 'Moderate debt-to-income ratio',
                weight: 0.15,
                score: 35,
                impact: 'neutral',
                description: `Debt-to-income ratio of ${(debtToIncomeRatio * 100).toFixed(1)}% is manageable`
            });
        } else {
            factors.push({
                category: 'Financial',
                factor: 'Low debt-to-income ratio',
                weight: 0.15,
                score: 15,
                impact: 'positive',
                description: `Healthy debt-to-income ratio of ${(debtToIncomeRatio * 100).toFixed(1)}%`
            });
        }

        // Income Source Diversification
        if (financialProfile.incomeSource.length === 1 && financialProfile.incomeSource[0] === 'employment') {
            factors.push({
                category: 'Financial',
                factor: 'Single income source',
                weight: 0.1,
                score: 25,
                impact: 'neutral',
                description: 'Relies solely on employment income'
            });
        } else if (financialProfile.incomeSource.length > 1) {
            factors.push({
                category: 'Financial',
                factor: 'Diversified income sources',
                weight: 0.1,
                score: 15,
                impact: 'positive',
                description: 'Multiple income sources provide stability'
            });
        }

        // Asset-to-Income Ratio
        const assetToIncomeRatio = financialProfile.assets / financialProfile.annualIncome;
        if (assetToIncomeRatio > 2.0) {
            factors.push({
                category: 'Financial',
                factor: 'Strong asset base',
                weight: 0.2,
                score: 10,
                impact: 'positive',
                description: 'Strong asset-to-income ratio indicates financial stability'
            });
        } else if (assetToIncomeRatio < 0.5) {
            factors.push({
                category: 'Financial',
                factor: 'Limited asset base',
                weight: 0.15,
                score: 45,
                impact: 'negative',
                description: 'Low asset-to-income ratio may indicate financial instability'
            });
        }

        // Banking Relationship History
        const avgBankingYears =
            financialProfile.bankingRelationships.reduce((sum: number, rel: any) => sum + (rel.yearsWithBank || 0), 0) /
            financialProfile.bankingRelationships.length;

        if (avgBankingYears >= 5) {
            factors.push({
                category: 'Financial',
                factor: 'Established banking relationships',
                weight: 0.15,
                score: 10,
                impact: 'positive',
                description: `Average ${avgBankingYears.toFixed(1)} years with existing banks`
            });
        } else if (avgBankingYears < 1) {
            factors.push({
                category: 'Financial',
                factor: 'Limited banking history',
                weight: 0.15,
                score: 50,
                impact: 'negative',
                description: 'Minimal banking relationship history'
            });
        }

        // Income Level Risk Assessment
        if (financialProfile.annualIncome < 25000) {
            factors.push({
                category: 'Financial',
                factor: 'Low income level',
                weight: 0.1,
                score: 40,
                impact: 'negative',
                description: 'Income below $25,000 increases default risk'
            });
        } else if (financialProfile.annualIncome > 150000) {
            factors.push({
                category: 'Financial',
                factor: 'High income level',
                weight: 0.1,
                score: 5,
                impact: 'positive',
                description: 'High income level reduces default risk'
            });
        }

        return factors;
    }

    /**
     * Assess business profile risks (for commercial accounts)
     */
    private static assessBusinessRisk(businessProfile: any): RiskFactor[] {
        const factors: RiskFactor[] = [];

        // Cash-Intensive Business Risk
        if (businessProfile.isCashIntensive) {
            factors.push({
                category: 'Business',
                factor: 'Cash-intensive business model',
                weight: 0.3,
                score: 75,
                impact: 'negative',
                description: 'Cash-intensive businesses have higher money laundering risk'
            });
        } else {
            factors.push({
                category: 'Business',
                factor: 'Non-cash-intensive business model',
                weight: 0.15,
                score: 15,
                impact: 'positive',
                description: 'Business model has lower cash handling risk'
            });
        }

        // Business Age Risk Assessment
        const businessAge = this.calculateBusinessAge(businessProfile.dateEstablished);
        if (businessAge < 1) {
            factors.push({
                category: 'Business',
                factor: 'New business entity',
                weight: 0.2,
                score: 60,
                impact: 'negative',
                description: 'Business established less than 1 year ago'
            });
        } else if (businessAge >= 5) {
            factors.push({
                category: 'Business',
                factor: 'Established business',
                weight: 0.15,
                score: 10,
                impact: 'positive',
                description: `Business operating for ${businessAge.toFixed(1)} years`
            });
        } else {
            factors.push({
                category: 'Business',
                factor: 'Developing business',
                weight: 0.1,
                score: 25,
                impact: 'neutral',
                description: `Business operating for ${businessAge.toFixed(1)} years`
            });
        }

        // Industry Risk Assessment
        const highRiskIndustries = [
            'cannabis',
            'cryptocurrency',
            'gambling',
            'adult entertainment',
            'pawn shops',
            'check cashing',
            'money services',
            'firearms'
        ];

        const industryLower = businessProfile.industryType.toLowerCase();
        if (highRiskIndustries.some(industry => industryLower.includes(industry))) {
            factors.push({
                category: 'Business',
                factor: 'High-risk industry',
                weight: 0.35,
                score: 80,
                impact: 'negative',
                description: `${businessProfile.industryType} is classified as high-risk industry`
            });
        } else {
            factors.push({
                category: 'Business',
                factor: 'Standard industry risk',
                weight: 0.1,
                score: 20,
                impact: 'neutral',
                description: `${businessProfile.industryType} has standard industry risk profile`
            });
        }

        // Transaction Volume Risk
        const monthlyVolume = businessProfile.monthlyTransactionVolume;
        if (monthlyVolume > 500000) {
            factors.push({
                category: 'Business',
                factor: 'High transaction volume',
                weight: 0.2,
                score: 45,
                impact: 'negative',
                description: `Monthly transaction volume of $${monthlyVolume.toLocaleString()} requires enhanced monitoring`
            });
        } else if (monthlyVolume < 10000) {
            factors.push({
                category: 'Business',
                factor: 'Low transaction volume',
                weight: 0.1,
                score: 15,
                impact: 'positive',
                description: `Low monthly transaction volume of $${monthlyVolume.toLocaleString()}`
            });
        }

        // Expected Balance vs Transaction Volume Ratio
        const balanceToVolumeRatio = businessProfile.expectedBalance / businessProfile.monthlyTransactionVolume;
        if (balanceToVolumeRatio < 0.1) {
            factors.push({
                category: 'Business',
                factor: 'Low balance-to-volume ratio',
                weight: 0.15,
                score: 40,
                impact: 'negative',
                description: 'Expected balance is low relative to transaction volume'
            });
        } else if (balanceToVolumeRatio > 1.0) {
            factors.push({
                category: 'Business',
                factor: 'High balance-to-volume ratio',
                weight: 0.1,
                score: 10,
                impact: 'positive',
                description: 'Expected balance is healthy relative to transaction volume'
            });
        }

        return factors;
    }

    /**
     * Assess document verification risks
     */
    private static assessDocumentRisk(documents: any[]): RiskFactor[] {
        const factors: RiskFactor[] = [];

        const verifiedDocs = documents.filter(doc => doc.verificationStatus === 'verified').length;
        const pendingDocs = documents.filter(doc => doc.verificationStatus === 'pending').length;
        const failedDocs = documents.filter(
            doc => doc.verificationStatus === 'failed' || doc.verificationStatus === 'rejected'
        ).length;
        const totalDocs = documents.length;

        if (totalDocs === 0) {
            factors.push({
                category: 'Documentation',
                factor: 'No documents uploaded',
                weight: 0.3,
                score: 80,
                impact: 'negative',
                description: 'No supporting documents have been uploaded'
            });
        } else {
            const verificationRate = verifiedDocs / totalDocs;

            if (verificationRate >= 0.9) {
                factors.push({
                    category: 'Documentation',
                    factor: 'Excellent document verification',
                    weight: 0.2,
                    score: 5,
                    impact: 'positive',
                    description: `${verifiedDocs}/${totalDocs} documents successfully verified`
                });
            } else if (verificationRate >= 0.7) {
                factors.push({
                    category: 'Documentation',
                    factor: 'Good document verification',
                    weight: 0.15,
                    score: 20,
                    impact: 'positive',
                    description: `${verifiedDocs}/${totalDocs} documents successfully verified`
                });
            } else if (failedDocs > 0) {
                factors.push({
                    category: 'Documentation',
                    factor: 'Document verification issues',
                    weight: 0.25,
                    score: 65,
                    impact: 'negative',
                    description: `${failedDocs} document(s) failed verification`
                });
            }

            if (pendingDocs > 0) {
                factors.push({
                    category: 'Documentation',
                    factor: 'Pending document verification',
                    weight: 0.1,
                    score: 30,
                    impact: 'neutral',
                    description: `${pendingDocs} document(s) still pending verification`
                });
            }
        }

        // Check for document quality issues
        const docsWithIssues = documents.filter(
            doc => doc.verificationDetails?.issues && doc.verificationDetails.issues.length > 0
        );

        if (docsWithIssues.length > 0) {
            factors.push({
                category: 'Documentation',
                factor: 'Document quality concerns',
                weight: 0.15,
                score: 45,
                impact: 'negative',
                description: `${docsWithIssues.length} document(s) have quality or authenticity concerns`
            });
        }

        return factors;
    }

    /**
     * Assess geographic risks based on address
     */
    private static assessGeographicRisk(address: any): RiskFactor[] {
        const factors: RiskFactor[] = [];

        if (!address || !address.state || !address.country) {
            factors.push({
                category: 'Geographic',
                factor: 'Incomplete address information',
                weight: 0.15,
                score: 50,
                impact: 'negative',
                description: 'Address information is incomplete or missing'
            });
            return factors;
        }

        // High-risk states (for demo purposes)
        const highRiskStates = ['FL', 'NV', 'DE', 'MT', 'WY'];
        if (highRiskStates.includes(address.state)) {
            factors.push({
                category: 'Geographic',
                factor: 'High-risk state location',
                weight: 0.2,
                score: 40,
                impact: 'negative',
                description: `Located in ${address.state}, which has elevated financial crime risk`
            });
        } else {
            factors.push({
                category: 'Geographic',
                factor: 'Standard geographic risk',
                weight: 0.1,
                score: 15,
                impact: 'positive',
                description: 'Located in low-risk geographic area'
            });
        }

        // International address risk
        if (address.country !== 'US' && address.country !== 'USA') {
            const highRiskCountries = ['RU', 'CN', 'KP', 'IR', 'CU', 'SY'];
            if (highRiskCountries.includes(address.country)) {
                factors.push({
                    category: 'Geographic',
                    factor: 'High-risk country',
                    weight: 0.4,
                    score: 85,
                    impact: 'negative',
                    description: `Address in ${address.country} poses significant compliance risk`
                });
            } else {
                factors.push({
                    category: 'Geographic',
                    factor: 'International address',
                    weight: 0.2,
                    score: 35,
                    impact: 'negative',
                    description: `International address in ${address.country} requires enhanced due diligence`
                });
            }
        }

        return factors;
    }

    /**
     * Assess behavioral and pattern risks
     */
    private static assessBehavioralRisk(data: RiskAssessmentData): RiskFactor[] {
        const factors: RiskFactor[] = [];

        // Email domain risk assessment
        if (data.personalInfo?.email) {
            const email = data.personalInfo.email.toLowerCase();
            const domain = email.split('@')[1];

            const disposableDomains = ['tempmail', '10minutemail', 'guerrillamail', 'mailinator'];
            if (disposableDomains.some(d => domain.includes(d))) {
                factors.push({
                    category: 'Behavioral',
                    factor: 'Disposable email address',
                    weight: 0.25,
                    score: 70,
                    impact: 'negative',
                    description: 'Using temporary or disposable email service'
                });
            } else if (['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'].includes(domain)) {
                factors.push({
                    category: 'Behavioral',
                    factor: 'Personal email domain',
                    weight: 0.05,
                    score: 10,
                    impact: 'neutral',
                    description: 'Using standard personal email provider'
                });
            } else {
                factors.push({
                    category: 'Behavioral',
                    factor: 'Professional email domain',
                    weight: 0.05,
                    score: 5,
                    impact: 'positive',
                    description: 'Using professional or organizational email domain'
                });
            }
        }

        // Phone number patterns
        if (data.personalInfo?.phone) {
            const phone = data.personalInfo.phone.replace(/\D/g, '');
            // Check for sequential or repeated numbers (simple pattern detection)
            if (/(\d)\1{3,}/.test(phone) || /1234|2345|3456|4567|5678|6789/.test(phone)) {
                factors.push({
                    category: 'Behavioral',
                    factor: 'Suspicious phone pattern',
                    weight: 0.15,
                    score: 55,
                    impact: 'negative',
                    description: 'Phone number contains suspicious patterns'
                });
            }
        }

        // Address consistency check
        if (data.personalInfo?.mailingAddress && data.personalInfo.physicalAddress) {
            const sameAddress =
                JSON.stringify(data.personalInfo.mailingAddress) === JSON.stringify(data.personalInfo.physicalAddress);
            if (!sameAddress) {
                factors.push({
                    category: 'Behavioral',
                    factor: 'Different mailing and physical addresses',
                    weight: 0.1,
                    score: 25,
                    impact: 'neutral',
                    description: 'Mailing address differs from physical address'
                });
            }
        }

        // Business entity consistency check could be added here in the future
        // when business email is available in the business profile

        return factors;
    }

    /**
     * Assess additional signers risks
     */
    private static assessSignersRisk(additionalSigners: any[]): RiskFactor[] {
        const factors: RiskFactor[] = [];

        if (additionalSigners.length > 5) {
            factors.push({
                category: 'Signers',
                factor: 'Excessive number of signers',
                weight: 0.2,
                score: 50,
                impact: 'negative',
                description: `${additionalSigners.length} signers may complicate account management`
            });
        }

        // Check KYC status of additional signers
        const failedKycSigners = additionalSigners.filter(s => s.kycStatus === 'failed').length;
        const pendingKycSigners = additionalSigners.filter(s => s.kycStatus === 'pending').length;

        if (failedKycSigners > 0) {
            factors.push({
                category: 'Signers',
                factor: 'Additional signers with KYC failures',
                weight: 0.3,
                score: 75,
                impact: 'negative',
                description: `${failedKycSigners} additional signer(s) failed KYC verification`
            });
        }

        if (pendingKycSigners > 0) {
            factors.push({
                category: 'Signers',
                factor: 'Additional signers with pending KYC',
                weight: 0.15,
                score: 35,
                impact: 'neutral',
                description: `${pendingKycSigners} additional signer(s) have pending KYC verification`
            });
        }

        // Check for beneficial owners
        const beneficialOwners = additionalSigners.filter(s => s.role === 'beneficial_owner');
        const totalOwnership = beneficialOwners.reduce(
            (sum, owner) => sum + (owner.beneficialOwnershipPercentage || 0),
            0
        );

        if (totalOwnership > 100) {
            factors.push({
                category: 'Signers',
                factor: 'Ownership percentage exceeds 100%',
                weight: 0.25,
                score: 60,
                impact: 'negative',
                description: 'Total beneficial ownership percentages exceed 100%'
            });
        } else if (totalOwnership < 25 && beneficialOwners.length > 0) {
            factors.push({
                category: 'Signers',
                factor: 'Low disclosed ownership percentage',
                weight: 0.2,
                score: 45,
                impact: 'negative',
                description: 'Total disclosed beneficial ownership is suspiciously low'
            });
        }

        return factors;
    }

    /**
     * Calculate overall risk score and level
     */
    private static calculateOverallRisk(factors: RiskFactor[]): {
        riskScore: number;
        overallRisk: 'low' | 'medium' | 'high';
    } {
        if (factors.length === 0) {
            return { riskScore: 50, overallRisk: 'medium' };
        }

        // Calculate weighted risk score
        const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0);
        const weightedScore = factors.reduce((sum, factor) => sum + factor.score * factor.weight, 0);

        // Normalize score to 0-100 scale
        const riskScore = Math.round(totalWeight > 0 ? weightedScore / totalWeight : 50);

        // Determine risk level
        let overallRisk: 'low' | 'medium' | 'high';
        if (riskScore <= 30) {
            overallRisk = 'low';
        } else if (riskScore <= 65) {
            overallRisk = 'medium';
        } else {
            overallRisk = 'high';
        }

        return { riskScore: Math.min(100, Math.max(0, riskScore)), overallRisk };
    }

    /**
     * Generate recommendations based on risk factors
     */
    private static generateRecommendations(factors: RiskFactor[], overallRisk: string): string[] {
        const recommendations: string[] = [];

        // Overall risk-based recommendations
        if (overallRisk === 'low') {
            recommendations.push('Proceed with standard approval process');
            recommendations.push('Standard monitoring procedures apply');
        } else if (overallRisk === 'medium') {
            recommendations.push('Enhanced due diligence recommended');
            recommendations.push('Consider additional documentation requirements');
            recommendations.push('Implement enhanced transaction monitoring');
        } else {
            recommendations.push('Manual review required before approval');
            recommendations.push('Senior management approval needed');
            recommendations.push('Enhanced ongoing monitoring required');
            recommendations.push('Consider risk-based account restrictions');
        }

        // Factor-specific recommendations
        const highRiskFactors = factors.filter(f => f.score > 70);

        highRiskFactors.forEach(factor => {
            switch (factor.category) {
                case 'Identity':
                    if (factor.factor.includes('OFAC')) {
                        recommendations.push('Compliance team review required for sanctions screening match');
                    } else if (factor.factor.includes('failed')) {
                        recommendations.push('Additional identity verification documents required');
                    }
                    break;

                case 'Business':
                    if (factor.factor.includes('cash-intensive')) {
                        recommendations.push('Implement cash transaction reporting and monitoring');
                    } else if (factor.factor.includes('high-risk industry')) {
                        recommendations.push('Industry-specific compliance procedures required');
                    }
                    break;

                case 'Documentation':
                    if (factor.factor.includes('No documents')) {
                        recommendations.push(
                            'Require submission of standard identity and address verification documents'
                        );
                    } else if (factor.factor.includes('verification issues')) {
                        recommendations.push('Request alternative or additional verification documents');
                    }
                    break;

                case 'Geographic':
                    if (factor.factor.includes('High-risk country')) {
                        recommendations.push('Enhanced CDD and source of funds documentation required');
                    }
                    break;

                case 'Financial':
                    if (factor.factor.includes('debt-to-income')) {
                        recommendations.push('Review financial capacity and consider lower account limits');
                    }
                    break;
            }
        });

        return Array.from(new Set(recommendations)); // Remove duplicates
    }

    /**
     * Determine if manual review is required
     */
    private static requiresManualReview(factors: RiskFactor[], overallRisk: string): boolean {
        // Always require manual review for high risk
        if (overallRisk === 'high') {
            return true;
        }

        // Check for specific high-risk factors that always require review
        const criticalFactors = factors.filter(
            f =>
                f.factor.includes('OFAC') ||
                f.factor.includes('sanctions') ||
                f.factor.includes('High-risk country') ||
                f.score >= 90
        );

        if (criticalFactors.length > 0) {
            return true;
        }

        // Check for multiple medium-high risk factors
        const highRiskFactors = factors.filter(f => f.score > 60);
        if (highRiskFactors.length >= 3) {
            return true;
        }

        return false;
    }

    /**
     * Calculate age from date of birth string
     */
    private static calculateAge(dateOfBirth: string): number {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    }

    /**
     * Calculate business age from establishment date
     */
    private static calculateBusinessAge(dateEstablished: string): number {
        const today = new Date();
        const establishedDate = new Date(dateEstablished);
        return (today.getTime() - establishedDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    }
}
