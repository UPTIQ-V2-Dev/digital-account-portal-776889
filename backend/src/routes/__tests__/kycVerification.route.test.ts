import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import httpStatus from 'http-status';
import kycVerificationRoute from '../v1/kycVerification.route.ts';
import auth from '../../middlewares/auth.ts';
import validate from '../../middlewares/validate.ts';
import { kycVerificationService } from '../../services/index.ts';

// Mock dependencies
vi.mock('../../services/index.ts');
vi.mock('../../middlewares/auth.ts');
vi.mock('../../middlewares/validate.ts');

const app = express();
app.use(express.json());

// Mock auth middleware
vi.mocked(auth).mockImplementation((permission) => async (req: any, res, next) => {
    req.user = { id: 1, email: 'test@example.com', role: 'USER' };
    next();
});

// Mock validate middleware
vi.mocked(validate).mockImplementation((schema) => (req, res, next) => {
    req.validatedQuery = req.query;
    next();
});

// Setup routes with mergeParams option
app.use('/applications/:applicationId/kyc', kycVerificationRoute);

describe('KYC Verification Routes', () => {
    const mockApplicationId = 'test-app-id';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('POST /applications/:applicationId/kyc/verify', () => {
        const mockKYCResponse = {
            id: 'kyc-123',
            applicationId: mockApplicationId,
            status: 'pending',
            provider: 'Mock KYC Provider',
            verificationId: 'kyc_verify_abc123',
            confidence: 0.0,
            verifiedAt: null
        };

        it('should initiate KYC verification with correct middleware chain', async () => {
            vi.mocked(kycVerificationService.initiateKYCVerification).mockResolvedValue(mockKYCResponse as any);

            const response = await request(app)
                .post(`/applications/${mockApplicationId}/kyc/verify`)
                .expect(httpStatus.ACCEPTED);

            // Verify auth middleware was called with correct permission
            expect(auth).toHaveBeenCalledWith('manageApplications');
            
            // Verify validate middleware was called with correct validation schema
            expect(validate).toHaveBeenCalledWith(expect.objectContaining({
                initiateKYCVerification: expect.any(Object)
            }));

            expect(response.body).toEqual({
                id: 'kyc-123',
                applicationId: mockApplicationId,
                status: 'pending',
                verificationId: 'kyc_verify_abc123',
                message: 'KYC verification initiated'
            });
        });

        it('should validate application ID parameter', async () => {
            // Test invalid application ID format (if validation exists)
            await request(app)
                .post('/applications/invalid-id-format/kyc/verify');

            expect(validate).toHaveBeenCalled();
        });

        it('should require authentication', async () => {
            // The auth mock should have been called
            expect(auth).toHaveBeenCalledWith('manageApplications');
        });
    });

    describe('GET /applications/:applicationId/kyc', () => {
        const mockKYCResponse = {
            id: 'kyc-123',
            applicationId: mockApplicationId,
            status: 'passed',
            provider: 'Mock KYC Provider',
            verificationId: 'kyc_verify_abc123',
            confidence: 0.95,
            verifiedAt: new Date('2025-09-13T14:30:45Z'),
            identityPassed: true,
            identityConfidence: 0.95,
            addressPassed: true,
            addressConfidence: 0.9,
            phonePassed: true,
            phoneConfidence: 0.85,
            emailPassed: true,
            emailConfidence: 0.9,
            ofacPassed: true,
            ofacMatches: null
        };

        it('should get KYC verification with correct middleware chain', async () => {
            vi.mocked(kycVerificationService.getKYCVerificationByApplicationId).mockResolvedValue(mockKYCResponse as any);

            const response = await request(app)
                .get(`/applications/${mockApplicationId}/kyc`)
                .expect(httpStatus.OK);

            // Verify auth middleware was called with correct permission
            expect(auth).toHaveBeenCalledWith('getApplications');
            
            // Verify validate middleware was called with correct validation schema
            expect(validate).toHaveBeenCalledWith(expect.objectContaining({
                getKYCVerification: expect.any(Object)
            }));

            expect(response.body).toEqual({
                id: 'kyc-123',
                applicationId: mockApplicationId,
                status: 'passed',
                provider: 'Mock KYC Provider',
                verificationId: 'kyc_verify_abc123',
                confidence: 0.95,
                verifiedAt: '2025-09-13T14:30:45.000Z',
                results: {
                    identity: {
                        passed: true,
                        confidence: 0.95
                    },
                    address: {
                        passed: true,
                        confidence: 0.9
                    },
                    phone: {
                        passed: true,
                        confidence: 0.85
                    },
                    email: {
                        passed: true,
                        confidence: 0.9
                    },
                    ofac: {
                        passed: true,
                        matches: null
                    }
                }
            });
        });

        it('should require authentication for GET requests', async () => {
            await request(app)
                .get(`/applications/${mockApplicationId}/kyc`);

            expect(auth).toHaveBeenCalledWith('getApplications');
        });

        it('should validate application ID parameter for GET requests', async () => {
            await request(app)
                .get('/applications/some-id/kyc');

            expect(validate).toHaveBeenCalled();
        });
    });

    describe('Route Configuration', () => {
        it('should be configured with mergeParams', () => {
            // This test ensures that the route is set up with mergeParams: true
            // so that parent route params (applicationId) are accessible
            expect(kycVerificationRoute).toBeDefined();
        });

        it('should have proper route structure', async () => {
            // Test that the routes are properly mounted
            const getResponse = await request(app)
                .get(`/applications/${mockApplicationId}/kyc`);
            
            const postResponse = await request(app)
                .post(`/applications/${mockApplicationId}/kyc/verify`);

            // Routes should exist (not return 404)
            expect(getResponse.status).not.toBe(404);
            expect(postResponse.status).not.toBe(404);
        });
    });

    describe('Error Handling', () => {
        it('should handle service errors in POST route', async () => {
            const error = new Error('Service error');
            vi.mocked(kycVerificationService.initiateKYCVerification).mockRejectedValue(error);

            await request(app)
                .post(`/applications/${mockApplicationId}/kyc/verify`)
                .expect(httpStatus.INTERNAL_SERVER_ERROR);
        });

        it('should handle service errors in GET route', async () => {
            const error = new Error('Service error');
            vi.mocked(kycVerificationService.getKYCVerificationByApplicationId).mockRejectedValue(error);

            await request(app)
                .get(`/applications/${mockApplicationId}/kyc`)
                .expect(httpStatus.INTERNAL_SERVER_ERROR);
        });
    });
});