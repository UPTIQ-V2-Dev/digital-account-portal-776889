import cuid from 'cuid';

export interface KYCVerificationResults {
    identity: {
        passed: boolean;
        confidence: number;
        details?: {
            nameMatch: boolean;
            dateOfBirthMatch: boolean;
            ssnMatch: boolean;
            issues?: string[];
        };
    };
    address: {
        passed: boolean;
        confidence: number;
        details?: {
            addressVerified: boolean;
            utilityBillMatch: boolean;
            issues?: string[];
        };
    };
    phone: {
        passed: boolean;
        confidence: number;
        details?: {
            phoneVerified: boolean;
            carrierVerified: boolean;
            issues?: string[];
        };
    };
    email: {
        passed: boolean;
        confidence: number;
        details?: {
            emailVerified: boolean;
            domainVerified: boolean;
            issues?: string[];
        };
    };
    ofac: {
        passed: boolean;
        matches: Array<{
            name: string;
            confidence: number;
            listType: string;
            details: string;
        }>;
    };
}

export interface MockKYCResult {
    provider: string;
    verificationId: string;
    status: 'pending' | 'passed' | 'failed' | 'needs_review';
    confidence: number;
    verifiedAt?: Date;
    results: KYCVerificationResults;
}

/**
 * Mock KYC verification service that simulates real identity verification providers
 * @param personalInfo - Personal information from the application
 * @returns Promise<MockKYCResult> - KYC verification results
 */
export const mockKYCVerification = async (personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    ssn: string;
    phone: string;
    email: string;
    mailingAddress: any;
}): Promise<MockKYCResult> => {
    // Simulate processing time (1-3 seconds)
    const processingTime = 1000 + Math.random() * 2000;

    await new Promise(resolve => setTimeout(resolve, processingTime));

    const verificationId = `kyc_${cuid()}`;
    const provider = 'Mock KYC Provider v1.0';

    // Generate verification results based on data patterns and randomness
    const results = generateKYCResults(personalInfo);

    // Determine overall status and confidence based on individual results
    const { status, confidence } = calculateOverallStatus(results);

    return {
        provider,
        verificationId,
        status,
        confidence,
        verifiedAt: status !== 'pending' ? new Date() : undefined,
        results
    };
};

/**
 * Generate detailed KYC verification results
 */
function generateKYCResults(personalInfo: any): KYCVerificationResults {
    // Identity Verification - check against "known" patterns
    const identityResult = generateIdentityResult(personalInfo);

    // Address Verification
    const addressResult = generateAddressResult(personalInfo);

    // Phone Verification
    const phoneResult = generatePhoneResult(personalInfo);

    // Email Verification
    const emailResult = generateEmailResult(personalInfo);

    // OFAC Screening
    const ofacResult = generateOfacResult(personalInfo);

    return {
        identity: identityResult,
        address: addressResult,
        phone: phoneResult,
        email: emailResult,
        ofac: ofacResult
    };
}

/**
 * Generate identity verification results
 */
function generateIdentityResult(personalInfo: any) {
    const random = Math.random();

    // Simulate different scenarios based on name patterns or random chance
    if (personalInfo.lastName.toLowerCase().includes('test') || random < 0.05) {
        // 5% chance of identity verification failure
        return {
            passed: false,
            confidence: 0.2 + Math.random() * 0.3, // 0.2 - 0.5
            details: {
                nameMatch: false,
                dateOfBirthMatch: Math.random() > 0.5,
                ssnMatch: false,
                issues: ['SSN not found in records', 'Name mismatch with government records']
            }
        };
    } else if (random < 0.15) {
        // 10% chance needs manual review
        return {
            passed: true,
            confidence: 0.6 + Math.random() * 0.2, // 0.6 - 0.8
            details: {
                nameMatch: true,
                dateOfBirthMatch: Math.random() > 0.3,
                ssnMatch: true,
                issues: ['Middle name discrepancy', 'Minor address variation in records']
            }
        };
    } else {
        // 85% chance of successful verification
        return {
            passed: true,
            confidence: 0.85 + Math.random() * 0.15, // 0.85 - 1.0
            details: {
                nameMatch: true,
                dateOfBirthMatch: true,
                ssnMatch: true
            }
        };
    }
}

/**
 * Generate address verification results
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateAddressResult(_personalInfo: any) {
    const random = Math.random();

    if (random < 0.08) {
        return {
            passed: false,
            confidence: 0.3 + Math.random() * 0.3, // 0.3 - 0.6
            details: {
                addressVerified: false,
                utilityBillMatch: false,
                issues: ['Address not found in postal records', 'No utility services found at address']
            }
        };
    } else if (random < 0.2) {
        return {
            passed: true,
            confidence: 0.7 + Math.random() * 0.15, // 0.7 - 0.85
            details: {
                addressVerified: true,
                utilityBillMatch: Math.random() > 0.5,
                issues: ['Address format standardized', 'Minor zip code extension added']
            }
        };
    } else {
        return {
            passed: true,
            confidence: 0.85 + Math.random() * 0.15, // 0.85 - 1.0
            details: {
                addressVerified: true,
                utilityBillMatch: true
            }
        };
    }
}

/**
 * Generate phone verification results
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generatePhoneResult(_personalInfo: any) {
    const random = Math.random();

    if (random < 0.06) {
        return {
            passed: false,
            confidence: 0.2 + Math.random() * 0.4, // 0.2 - 0.6
            details: {
                phoneVerified: false,
                carrierVerified: false,
                issues: ['Phone number not in service', 'Unable to verify carrier']
            }
        };
    } else if (random < 0.15) {
        return {
            passed: true,
            confidence: 0.6 + Math.random() * 0.2, // 0.6 - 0.8
            details: {
                phoneVerified: true,
                carrierVerified: Math.random() > 0.3,
                issues: ['VoIP number detected', 'Recent number port detected']
            }
        };
    } else {
        return {
            passed: true,
            confidence: 0.8 + Math.random() * 0.2, // 0.8 - 1.0
            details: {
                phoneVerified: true,
                carrierVerified: true
            }
        };
    }
}

/**
 * Generate email verification results
 */
function generateEmailResult(personalInfo: any) {
    const random = Math.random();
    const isDisposableEmail = personalInfo.email.includes('tempmail') || personalInfo.email.includes('10min');

    if (isDisposableEmail || random < 0.03) {
        return {
            passed: false,
            confidence: 0.1 + Math.random() * 0.3, // 0.1 - 0.4
            details: {
                emailVerified: false,
                domainVerified: false,
                issues: ['Disposable email detected', 'Domain not verified']
            }
        };
    } else if (random < 0.1) {
        return {
            passed: true,
            confidence: 0.7 + Math.random() * 0.2, // 0.7 - 0.9
            details: {
                emailVerified: true,
                domainVerified: Math.random() > 0.3,
                issues: ['Email recently created', 'Limited email history']
            }
        };
    } else {
        return {
            passed: true,
            confidence: 0.85 + Math.random() * 0.15, // 0.85 - 1.0
            details: {
                emailVerified: true,
                domainVerified: true
            }
        };
    }
}

/**
 * Generate OFAC screening results
 */
function generateOfacResult(personalInfo: any) {
    const random = Math.random();
    const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.toLowerCase();

    // Check for common suspicious patterns (for demo purposes)
    const suspiciousPatterns = ['sanchez', 'mohammed', 'vladimir', 'suspicious'];
    const hasSuspiciousPattern = suspiciousPatterns.some(pattern => fullName.includes(pattern));

    if (hasSuspiciousPattern && random < 0.3) {
        // Higher chance of match if name contains suspicious patterns
        return {
            passed: false,
            matches: [
                {
                    name: `${personalInfo.firstName} ${personalInfo.lastName}`,
                    confidence: 0.7 + Math.random() * 0.25, // 0.7 - 0.95
                    listType: 'SDN List',
                    details: 'Potential match found on OFAC Specially Designated Nationals list'
                }
            ]
        };
    } else if (random < 0.02) {
        // 2% random chance of false positive match
        return {
            passed: false,
            matches: [
                {
                    name: 'Similar Name Found',
                    confidence: 0.4 + Math.random() * 0.3, // 0.4 - 0.7
                    listType: 'Consolidated List',
                    details: 'Low confidence match found - manual review recommended'
                }
            ]
        };
    } else {
        // Clean screening result
        return {
            passed: true,
            matches: []
        };
    }
}

/**
 * Calculate overall KYC status and confidence based on individual results
 */
function calculateOverallStatus(results: KYCVerificationResults): {
    status: 'pending' | 'passed' | 'failed' | 'needs_review';
    confidence: number;
} {
    // Check for hard failures
    if (!results.ofac.passed) {
        return { status: 'failed', confidence: 0.1 };
    }

    if (!results.identity.passed) {
        return { status: 'failed', confidence: 0.2 };
    }

    // Calculate weighted confidence
    const weights = {
        identity: 0.4,
        address: 0.2,
        phone: 0.2,
        email: 0.1,
        ofac: 0.1 // OFAC is pass/fail, but contributes to confidence
    };

    let weightedConfidence = 0;
    weightedConfidence += results.identity.confidence * weights.identity;
    weightedConfidence += results.address.confidence * weights.address;
    weightedConfidence += results.phone.confidence * weights.phone;
    weightedConfidence += results.email.confidence * weights.email;
    weightedConfidence += Number(results.ofac.passed) * weights.ofac;

    // Check if any component needs review
    const hasIssues = [
        results.identity.details?.issues,
        results.address.details?.issues,
        results.phone.details?.issues,
        results.email.details?.issues
    ].some(issues => issues && issues.length > 0);

    // Determine status based on confidence and issues
    if (weightedConfidence < 0.6) {
        return { status: 'failed', confidence: weightedConfidence };
    } else if (weightedConfidence < 0.8 || hasIssues) {
        return { status: 'needs_review', confidence: weightedConfidence };
    } else {
        return { status: 'passed', confidence: weightedConfidence };
    }
}
