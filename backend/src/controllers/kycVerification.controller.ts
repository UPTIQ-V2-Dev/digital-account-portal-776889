import { kycVerificationService } from '../services/index.ts';
import catchAsyncWithAuth from '../utils/catchAsyncWithAuth.ts';
import httpStatus from 'http-status';

const initiateKYCVerification = catchAsyncWithAuth(async (req, res) => {
    const { applicationId } = req.params;
    const userId = req.user.id;

    const kycVerification = await kycVerificationService.initiateKYCVerification(
        applicationId,
        userId
    );

    // Format response to match API specification
    const response = {
        id: kycVerification.id,
        applicationId: kycVerification.applicationId,
        status: kycVerification.status,
        verificationId: kycVerification.verificationId,
        message: 'KYC verification initiated'
    };

    res.status(httpStatus.ACCEPTED).send(response);
});

const getKYCVerification = catchAsyncWithAuth(async (req, res) => {
    const { applicationId } = req.params;
    const userId = req.user.id;

    const kycVerification = await kycVerificationService.getKYCVerificationByApplicationId(
        applicationId,
        userId
    );

    // Format verification results
    const results: any = {};
    
    if (kycVerification.identityPassed !== null) {
        results.identity = {
            passed: kycVerification.identityPassed,
            confidence: kycVerification.identityConfidence
        };
    }
    
    if (kycVerification.addressPassed !== null) {
        results.address = {
            passed: kycVerification.addressPassed,
            confidence: kycVerification.addressConfidence
        };
    }
    
    if (kycVerification.phonePassed !== null) {
        results.phone = {
            passed: kycVerification.phonePassed,
            confidence: kycVerification.phoneConfidence
        };
    }
    
    if (kycVerification.emailPassed !== null) {
        results.email = {
            passed: kycVerification.emailPassed,
            confidence: kycVerification.emailConfidence
        };
    }
    
    if (kycVerification.ofacPassed !== null) {
        results.ofac = {
            passed: kycVerification.ofacPassed,
            matches: kycVerification.ofacMatches
        };
    }

    // Format response to match API specification
    const response = {
        id: kycVerification.id,
        applicationId: kycVerification.applicationId,
        status: kycVerification.status,
        provider: kycVerification.provider,
        verificationId: kycVerification.verificationId,
        confidence: kycVerification.confidence,
        verifiedAt: kycVerification.verifiedAt?.toISOString() || null,
        results: Object.keys(results).length > 0 ? results : {}
    };

    res.send(response);
});

export default {
    initiateKYCVerification,
    getKYCVerification
};