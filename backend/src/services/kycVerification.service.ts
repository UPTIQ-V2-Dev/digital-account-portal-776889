import prisma from '../client.ts';
import { KYCVerification } from '../generated/prisma/index.js';
import ApiError from '../utils/ApiError.ts';
import httpStatus from 'http-status';
import { v4 as uuidv4 } from 'uuid';

/**
 * Initiate KYC verification process for application
 * @param {string} applicationId - Application ID
 * @param {number} userId - User ID (for ownership validation)
 * @returns {Promise<KYCVerification>}
 */
const initiateKYCVerification = async (
    applicationId: string,
    userId: number
): Promise<KYCVerification> => {
    // First verify that the application exists and belongs to the user
    const application = await prisma.application.findFirst({
        where: {
            id: applicationId,
            userId: userId
        },
        include: {
            personalInfo: true,
            businessProfile: true,
            kycVerification: true
        }
    });

    if (!application) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Application not found');
    }

    // Check if KYC verification already exists and is in progress
    if (application.kycVerification && application.kycVerification.status === 'pending') {
        throw new ApiError(httpStatus.BAD_REQUEST, 'KYC verification already in progress');
    }

    // Check if KYC verification already exists and is completed
    if (application.kycVerification && ['passed', 'failed'].includes(application.kycVerification.status)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'KYC verification already completed');
    }

    // Validate that we have sufficient information to perform KYC
    if (!application.personalInfo && !application.businessProfile) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Personal information or business profile required for KYC verification');
    }

    const provider = 'Mock KYC Provider';
    const verificationId = `kyc_verify_${uuidv4()}`;

    try {
        // Create or update KYC verification record
        const kycVerification = await prisma.kYCVerification.upsert({
            where: {
                applicationId: applicationId
            },
            create: {
                status: 'pending',
                provider: provider,
                verificationId: verificationId,
                confidence: 0.0,
                applicationId: applicationId
            },
            update: {
                status: 'pending',
                provider: provider,
                verificationId: verificationId,
                confidence: 0.0,
                verifiedAt: null,
                identityPassed: null,
                identityConfidence: null,
                addressPassed: null,
                addressConfidence: null,
                phonePassed: null,
                phoneConfidence: null,
                emailPassed: null,
                emailConfidence: null,
                ofacPassed: null,
                ofacMatches: null as any
            }
        });

        // Start mock verification process (simulate async processing)
        performMockKYCVerification(kycVerification.id, application);

        return kycVerification;
    } catch (error: any) {
        if (error instanceof ApiError) {
            throw error;
        }
        console.error('KYC verification initiation error:', error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to initiate KYC verification');
    }
};

/**
 * Get KYC verification status and results
 * @param {string} applicationId - Application ID
 * @param {number} userId - User ID (for ownership validation)
 * @returns {Promise<KYCVerification>}
 */
const getKYCVerificationByApplicationId = async (
    applicationId: string,
    userId: number
): Promise<KYCVerification> => {
    // First verify that the application exists and belongs to the user
    const application = await prisma.application.findFirst({
        where: {
            id: applicationId,
            userId: userId
        }
    });

    if (!application) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Application not found');
    }

    // Get KYC verification record
    const kycVerification = await prisma.kYCVerification.findUnique({
        where: {
            applicationId: applicationId
        }
    });

    if (!kycVerification) {
        throw new ApiError(httpStatus.NOT_FOUND, 'KYC verification not found');
    }

    return kycVerification;
};

/**
 * Perform mock KYC verification (simulates real KYC provider)
 * @param {string} kycVerificationId - KYC verification ID
 * @param {any} application - Application data with related info
 * @returns {Promise<void>}
 */
const performMockKYCVerification = async (
    kycVerificationId: string,
    application: any
): Promise<void> => {
    try {
        // Simulate processing delay
        setTimeout(async () => {
            try {
                const personalInfo = application.personalInfo;
                const businessProfile = application.businessProfile;

                // Mock verification components
                const verificationResults = {
                    identity: await mockIdentityVerification(personalInfo),
                    address: await mockAddressVerification(personalInfo, businessProfile),
                    phone: await mockPhoneVerification(personalInfo, businessProfile),
                    email: await mockEmailVerification(personalInfo, businessProfile),
                    ofac: await mockOFACScreening(personalInfo, businessProfile)
                };

                // Calculate overall confidence (weighted average)
                const weights = {
                    identity: 0.3,
                    address: 0.25,
                    phone: 0.15,
                    email: 0.15,
                    ofac: 0.15
                };

                let overallConfidence = 0;
                let totalWeight = 0;
                
                Object.entries(verificationResults).forEach(([key, result]) => {
                    if (result.confidence > 0) {
                        overallConfidence += result.confidence * weights[key as keyof typeof weights];
                        totalWeight += weights[key as keyof typeof weights];
                    }
                });

                if (totalWeight > 0) {
                    overallConfidence = overallConfidence / totalWeight;
                }

                // Determine overall status
                let status = 'passed';
                const allPassed = Object.values(verificationResults).every(r => r.passed);
                const anyFailed = Object.values(verificationResults).some(r => r.passed === false);
                
                if (anyFailed) {
                    status = 'failed';
                } else if (!allPassed || overallConfidence < 0.7) {
                    status = 'review_required';
                }

                // Update KYC verification record
                await prisma.kYCVerification.update({
                    where: { id: kycVerificationId },
                    data: {
                        status: status,
                        confidence: overallConfidence,
                        verifiedAt: status !== 'pending' ? new Date() : null,
                        identityPassed: verificationResults.identity.passed,
                        identityConfidence: verificationResults.identity.confidence,
                        addressPassed: verificationResults.address.passed,
                        addressConfidence: verificationResults.address.confidence,
                        phonePassed: verificationResults.phone.passed,
                        phoneConfidence: verificationResults.phone.confidence,
                        emailPassed: verificationResults.email.passed,
                        emailConfidence: verificationResults.email.confidence,
                        ofacPassed: verificationResults.ofac.passed,
                        ofacMatches: verificationResults.ofac.matches
                    }
                });
            } catch (error) {
                console.error('Mock KYC verification failed:', error);
                // Update status to failed
                await prisma.kYCVerification.update({
                    where: { id: kycVerificationId },
                    data: {
                        status: 'failed',
                        verifiedAt: new Date()
                    }
                });
            }
        }, 3000); // 3 second delay to simulate processing
    } catch (error) {
        console.error('Failed to initiate mock KYC verification:', error);
    }
};

/**
 * Mock identity verification
 */
const mockIdentityVerification = async (personalInfo: any): Promise<{ passed: boolean; confidence: number }> => {
    if (!personalInfo) {
        return { passed: false, confidence: 0.0 };
    }

    // Mock identity verification logic
    const hasRequiredFields = personalInfo.firstName && personalInfo.lastName && personalInfo.dateOfBirth && personalInfo.ssn;
    
    if (!hasRequiredFields) {
        return { passed: false, confidence: 0.3 };
    }

    // Simulate age verification (must be 18+)
    const birthDate = new Date(personalInfo.dateOfBirth);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    
    if (age < 18) {
        return { passed: false, confidence: 0.5 };
    }

    // Mock confidence based on name quality and SSN format
    let confidence = 0.8;
    
    if (personalInfo.firstName.length < 2 || personalInfo.lastName.length < 2) {
        confidence -= 0.2;
    }
    
    // Simple SSN format validation
    const ssnPattern = /^\d{3}-\d{2}-\d{4}$/;
    if (!ssnPattern.test(personalInfo.ssn)) {
        confidence -= 0.1;
    }

    // Add some randomness to simulate real-world variations
    confidence += (Math.random() - 0.5) * 0.1;
    confidence = Math.max(0, Math.min(1, confidence));

    return { 
        passed: confidence > 0.6, 
        confidence: Math.round(confidence * 100) / 100 
    };
};

/**
 * Mock address verification
 */
const mockAddressVerification = async (personalInfo: any, businessProfile: any): Promise<{ passed: boolean; confidence: number }> => {
    const address = personalInfo?.mailingStreet || businessProfile?.businessStreet;
    const city = personalInfo?.mailingCity || businessProfile?.businessCity;
    const state = personalInfo?.mailingState || businessProfile?.businessState;
    const zipCode = personalInfo?.mailingZipCode || businessProfile?.businessZipCode;

    if (!address || !city || !state || !zipCode) {
        return { passed: false, confidence: 0.2 };
    }

    // Mock address validation
    let confidence = 0.7;
    
    // Check zip code format
    const zipPattern = /^\d{5}(-\d{4})?$/;
    if (zipPattern.test(zipCode)) {
        confidence += 0.1;
    } else {
        confidence -= 0.2;
    }
    
    // Check state format (2 letters)
    if (state.length === 2) {
        confidence += 0.1;
    } else {
        confidence -= 0.1;
    }

    // Add randomness
    confidence += (Math.random() - 0.5) * 0.2;
    confidence = Math.max(0, Math.min(1, confidence));

    return { 
        passed: confidence > 0.5, 
        confidence: Math.round(confidence * 100) / 100 
    };
};

/**
 * Mock phone verification
 */
const mockPhoneVerification = async (personalInfo: any, businessProfile: any): Promise<{ passed: boolean; confidence: number }> => {
    const phone = personalInfo?.phone || businessProfile?.businessPhone;
    
    if (!phone) {
        return { passed: false, confidence: 0.0 };
    }

    // Mock phone validation
    let confidence = 0.8;
    
    // Simple phone format check
    const phonePattern = /^\d{3}-\d{3}-\d{4}$/;
    if (phonePattern.test(phone)) {
        confidence += 0.1;
    } else {
        confidence -= 0.2;
    }

    // Add randomness
    confidence += (Math.random() - 0.5) * 0.1;
    confidence = Math.max(0, Math.min(1, confidence));

    return { 
        passed: confidence > 0.6, 
        confidence: Math.round(confidence * 100) / 100 
    };
};

/**
 * Mock email verification
 */
const mockEmailVerification = async (personalInfo: any, businessProfile: any): Promise<{ passed: boolean; confidence: number }> => {
    const email = personalInfo?.email || businessProfile?.businessEmail;
    
    if (!email) {
        return { passed: false, confidence: 0.0 };
    }

    // Mock email validation
    let confidence = 0.9;
    
    // Email format validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        return { passed: false, confidence: 0.3 };
    }

    // Check for common domains (simulate domain reputation check)
    const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
    const domain = email.split('@')[1].toLowerCase();
    
    if (commonDomains.includes(domain)) {
        confidence += 0.05;
    }

    // Add randomness
    confidence += (Math.random() - 0.5) * 0.1;
    confidence = Math.max(0, Math.min(1, confidence));

    return { 
        passed: confidence > 0.7, 
        confidence: Math.round(confidence * 100) / 100 
    };
};

/**
 * Mock OFAC screening
 */
const mockOFACScreening = async (personalInfo: any, businessProfile: any): Promise<{ passed: boolean; confidence: number; matches?: any }> => {
    const name = personalInfo ? `${personalInfo.firstName} ${personalInfo.lastName}` : businessProfile?.businessName;
    
    if (!name) {
        return { passed: false, confidence: 0.0 };
    }

    // Mock OFAC screening - simulate potential matches based on names
    const suspiciousNames = ['John Doe', 'Jane Smith', 'Test User', 'Sample Name'];
    const matches: any[] = [];
    
    let confidence = 0.95;
    let passed = true;
    
    // Check for suspicious patterns
    suspiciousNames.forEach(suspiciousName => {
        if (name.toLowerCase().includes(suspiciousName.toLowerCase())) {
            matches.push({
                name: suspiciousName,
                matchScore: Math.random() * 0.5 + 0.5,
                listName: 'Mock Sanctions List',
                reason: 'Name similarity match'
            });
            confidence -= 0.3;
            if (confidence < 0.8) {
                passed = false;
            }
        }
    });

    // Add some randomness to simulate edge cases
    if (Math.random() < 0.05) { // 5% chance of random match
        matches.push({
            name: name,
            matchScore: Math.random() * 0.4 + 0.1,
            listName: 'Mock Watch List',
            reason: 'Fuzzy name match'
        });
        confidence -= 0.1;
    }

    confidence = Math.max(0, Math.min(1, confidence));

    return { 
        passed: passed && confidence > 0.8, 
        confidence: Math.round(confidence * 100) / 100,
        matches: matches.length > 0 ? matches : null
    };
};

export default {
    initiateKYCVerification,
    getKYCVerificationByApplicationId
};