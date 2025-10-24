import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import httpStatus from 'http-status';
import kycVerificationController from '../kycVerification.controller.ts';
import { kycVerificationService } from '../../services/index.ts';
import ApiError from '../../utils/ApiError.ts';

// Mock the service
vi.mock('../../services/index.ts');

const app = express();
app.use(express.json());

// Mock auth middleware to add user to request
app.use((req: any, res, next) => {
    req.user = { id: 1, email: 'test@example.com' };
    next();
});

// Setup routes
app.post('/applications/:applicationId/kyc/verify', kycVerificationController.initiateKYCVerification);
app.get('/applications/:applicationId/kyc', kycVerificationController.getKYCVerification);

describe('KYC Verification Controller', () => {
    const mockUserId = 1;
    const mockApplicationId = 'test-app-id';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('POST /applications/:applicationId/kyc/verify', () => {
        const mockKYCVerification = {
            id: 'kyc-123',
            applicationId: mockApplicationId,
            status: 'pending',
            provider: 'Mock KYC Provider',
            verificationId: 'kyc_verify_abc123',
            confidence: 0.0,
            verifiedAt: null
        };

        it('should initiate KYC verification successfully', async () => {
            vi.mocked(kycVerificationService.initiateKYCVerification).mockResolvedValue(mockKYCVerification as any);

            const response = await request(app)
                .post(`/applications/${mockApplicationId}/kyc/verify`)
                .expect(httpStatus.ACCEPTED);

            expect(kycVerificationService.initiateKYCVerification).toHaveBeenCalledWith(
                mockApplicationId,
                mockUserId
            );

            expect(response.body).toEqual({
                id: 'kyc-123',
                applicationId: mockApplicationId,
                status: 'pending',
                verificationId: 'kyc_verify_abc123',
                message: 'KYC verification initiated'
            });
        });

        it('should handle service errors', async () => {
            const error = new ApiError(httpStatus.BAD_REQUEST, 'KYC verification already in progress');
            vi.mocked(kycVerificationService.initiateKYCVerification).mockRejectedValue(error);

            await request(app)
                .post(`/applications/${mockApplicationId}/kyc/verify`)
                .expect(httpStatus.BAD_REQUEST);

            expect(kycVerificationService.initiateKYCVerification).toHaveBeenCalledWith(
                mockApplicationId,
                mockUserId
            );
        });

        it('should handle not found errors', async () => {
            const error = new ApiError(httpStatus.NOT_FOUND, 'Application not found');
            vi.mocked(kycVerificationService.initiateKYCVerification).mockRejectedValue(error);

            await request(app)
                .post(`/applications/${mockApplicationId}/kyc/verify`)
                .expect(httpStatus.NOT_FOUND);
        });
    });

    describe('GET /applications/:applicationId/kyc', () => {
        const mockCompletedKYC = {
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

        it('should get completed KYC verification successfully', async () => {
            vi.mocked(kycVerificationService.getKYCVerificationByApplicationId).mockResolvedValue(mockCompletedKYC as any);

            const response = await request(app)
                .get(`/applications/${mockApplicationId}/kyc`)
                .expect(httpStatus.OK);

            expect(kycVerificationService.getKYCVerificationByApplicationId).toHaveBeenCalledWith(
                mockApplicationId,
                mockUserId
            );

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

        it('should get pending KYC verification with empty results', async () => {
            const pendingKYC = {
                id: 'kyc-123',
                applicationId: mockApplicationId,
                status: 'pending',
                provider: 'Mock KYC Provider',
                verificationId: 'kyc_verify_abc123',
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
                ofacMatches: null
            };

            vi.mocked(kycVerificationService.getKYCVerificationByApplicationId).mockResolvedValue(pendingKYC as any);

            const response = await request(app)
                .get(`/applications/${mockApplicationId}/kyc`)
                .expect(httpStatus.OK);

            expect(response.body).toEqual({
                id: 'kyc-123',
                applicationId: mockApplicationId,
                status: 'pending',
                provider: 'Mock KYC Provider',
                verificationId: 'kyc_verify_abc123',
                confidence: 0.0,
                verifiedAt: null,
                results: {}
            });
        });

        it('should get failed KYC verification with OFAC matches', async () => {
            const failedKYC = {
                id: 'kyc-123',
                applicationId: mockApplicationId,
                status: 'failed',
                provider: 'Mock KYC Provider',
                verificationId: 'kyc_verify_abc123',
                confidence: 0.45,
                verifiedAt: new Date('2025-09-13T14:30:45Z'),
                identityPassed: false,
                identityConfidence: 0.3,
                addressPassed: true,
                addressConfidence: 0.8,
                phonePassed: true,
                phoneConfidence: 0.75,
                emailPassed: true,
                emailConfidence: 0.9,
                ofacPassed: false,
                ofacMatches: [
                    {
                        name: 'Test User',
                        matchScore: 0.85,
                        listName: 'Mock Sanctions List',
                        reason: 'Name similarity match'
                    }
                ]
            };

            vi.mocked(kycVerificationService.getKYCVerificationByApplicationId).mockResolvedValue(failedKYC as any);

            const response = await request(app)
                .get(`/applications/${mockApplicationId}/kyc`)
                .expect(httpStatus.OK);

            expect(response.body.status).toBe('failed');
            expect(response.body.results.ofac.passed).toBe(false);
            expect(response.body.results.ofac.matches).toHaveLength(1);
            expect(response.body.results.ofac.matches[0]).toEqual({
                name: 'Test User',
                matchScore: 0.85,
                listName: 'Mock Sanctions List',
                reason: 'Name similarity match'
            });
        });

        it('should handle service errors', async () => {
            const error = new ApiError(httpStatus.NOT_FOUND, 'KYC verification not found');
            vi.mocked(kycVerificationService.getKYCVerificationByApplicationId).mockRejectedValue(error);

            await request(app)
                .get(`/applications/${mockApplicationId}/kyc`)
                .expect(httpStatus.NOT_FOUND);

            expect(kycVerificationService.getKYCVerificationByApplicationId).toHaveBeenCalledWith(
                mockApplicationId,
                mockUserId
            );
        });

        it('should handle application not found', async () => {
            const error = new ApiError(httpStatus.NOT_FOUND, 'Application not found');
            vi.mocked(kycVerificationService.getKYCVerificationByApplicationId).mockRejectedValue(error);

            await request(app)
                .get(`/applications/${mockApplicationId}/kyc`)
                .expect(httpStatus.NOT_FOUND);
        });
    });
});