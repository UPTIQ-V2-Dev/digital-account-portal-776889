import { describe, it, expect, beforeEach, vi, afterAll } from 'vitest';
import kycVerificationService from '../kycVerification.service.ts';
import prisma from '../../client.ts';
import ApiError from '../../utils/ApiError.ts';
import httpStatus from 'http-status';

describe('KYC Verification Service', () => {
    const mockUserId = 1;
    const mockApplicationId = 'test-app-id';
    const mockKYCId = 'test-kyc-id';

    const mockApplication = {
        id: mockApplicationId,
        userId: mockUserId,
        status: 'draft',
        currentStep: 'kyc_verification',
        accountType: 'consumer',
        customerType: 'new',
        applicantId: 'applicant-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        personalInfo: {
            id: 'personal-info-id',
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: '1990-01-15',
            ssn: '123-45-6789',
            phone: '555-123-4567',
            email: 'john@example.com',
            mailingStreet: '123 Main St',
            mailingCity: 'Anytown',
            mailingState: 'CA',
            mailingZipCode: '12345',
            mailingCountry: 'US',
            employmentStatus: 'employed',
            applicationId: mockApplicationId
        },
        businessProfile: null,
        kycVerification: null
    };

    const mockKYCVerification = {
        id: mockKYCId,
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
        ofacMatches: null,
        applicationId: mockApplicationId
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterAll(() => {
        vi.useRealTimers();
    });

    describe('initiateKYCVerification', () => {
        it('should successfully initiate KYC verification for consumer application', async () => {
            // Mock Prisma calls
            prisma.application.findFirst = vi.fn().mockResolvedValue(mockApplication);
            prisma.kYCVerification.upsert = vi.fn().mockResolvedValue(mockKYCVerification);

            const result = await kycVerificationService.initiateKYCVerification(
                mockApplicationId,
                mockUserId
            );

            expect(prisma.application.findFirst).toHaveBeenCalledWith({
                where: {
                    id: mockApplicationId,
                    userId: mockUserId
                },
                include: {
                    personalInfo: true,
                    businessProfile: true,
                    kycVerification: true
                }
            });

            expect(prisma.kYCVerification.upsert).toHaveBeenCalledWith({
                where: {
                    applicationId: mockApplicationId
                },
                create: expect.objectContaining({
                    status: 'pending',
                    provider: 'Mock KYC Provider',
                    confidence: 0.0,
                    applicationId: mockApplicationId
                }),
                update: expect.objectContaining({
                    status: 'pending',
                    provider: 'Mock KYC Provider',
                    confidence: 0.0
                })
            });

            expect(result).toEqual(mockKYCVerification);
        });

        it('should successfully initiate KYC verification for business application', async () => {
            const businessApplication = {
                ...mockApplication,
                personalInfo: null,
                businessProfile: {
                    id: 'business-profile-id',
                    businessName: 'Acme Corp',
                    ein: '12-3456789',
                    entityType: 'corporation',
                    industryType: 'Technology',
                    businessPhone: '555-987-6543',
                    businessEmail: 'info@acmecorp.com',
                    businessStreet: '456 Business Blvd',
                    businessCity: 'Business City',
                    businessState: 'CA',
                    businessZipCode: '54321',
                    businessCountry: 'US',
                    applicationId: mockApplicationId
                }
            };

            prisma.application.findFirst = vi.fn().mockResolvedValue(businessApplication);
            prisma.kYCVerification.upsert = vi.fn().mockResolvedValue(mockKYCVerification);

            const result = await kycVerificationService.initiateKYCVerification(
                mockApplicationId,
                mockUserId
            );

            expect(result).toEqual(mockKYCVerification);
        });

        it('should throw error if application not found', async () => {
            prisma.application.findFirst = vi.fn().mockResolvedValue(null);

            await expect(
                kycVerificationService.initiateKYCVerification(mockApplicationId, mockUserId)
            ).rejects.toThrow(new ApiError(httpStatus.NOT_FOUND, 'Application not found'));
        });

        it('should throw error if KYC verification already in progress', async () => {
            const appWithPendingKYC = {
                ...mockApplication,
                kycVerification: { ...mockKYCVerification, status: 'pending' }
            };

            prisma.application.findFirst = vi.fn().mockResolvedValue(appWithPendingKYC);

            await expect(
                kycVerificationService.initiateKYCVerification(mockApplicationId, mockUserId)
            ).rejects.toThrow(new ApiError(httpStatus.BAD_REQUEST, 'KYC verification already in progress'));
        });

        it('should throw error if KYC verification already completed', async () => {
            const appWithCompletedKYC = {
                ...mockApplication,
                kycVerification: { ...mockKYCVerification, status: 'passed' }
            };

            prisma.application.findFirst = vi.fn().mockResolvedValue(appWithCompletedKYC);

            await expect(
                kycVerificationService.initiateKYCVerification(mockApplicationId, mockUserId)
            ).rejects.toThrow(new ApiError(httpStatus.BAD_REQUEST, 'KYC verification already completed'));
        });

        it('should throw error if no personal info or business profile', async () => {
            const appWithoutInfo = {
                ...mockApplication,
                personalInfo: null,
                businessProfile: null
            };

            prisma.application.findFirst = vi.fn().mockResolvedValue(appWithoutInfo);

            await expect(
                kycVerificationService.initiateKYCVerification(mockApplicationId, mockUserId)
            ).rejects.toThrow(new ApiError(httpStatus.BAD_REQUEST, 'Personal information or business profile required for KYC verification'));
        });

        it('should handle prisma errors', async () => {
            prisma.application.findFirst = vi.fn().mockResolvedValue(mockApplication);
            prisma.kYCVerification.upsert = vi.fn().mockRejectedValue(new Error('Database error'));

            await expect(
                kycVerificationService.initiateKYCVerification(mockApplicationId, mockUserId)
            ).rejects.toThrow(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to initiate KYC verification'));
        });
    });

    describe('getKYCVerificationByApplicationId', () => {
        it('should successfully get KYC verification', async () => {
            prisma.application.findFirst = vi.fn().mockResolvedValue(mockApplication);
            prisma.kYCVerification.findUnique = vi.fn().mockResolvedValue(mockKYCVerification);

            const result = await kycVerificationService.getKYCVerificationByApplicationId(
                mockApplicationId,
                mockUserId
            );

            expect(prisma.application.findFirst).toHaveBeenCalledWith({
                where: {
                    id: mockApplicationId,
                    userId: mockUserId
                }
            });

            expect(prisma.kYCVerification.findUnique).toHaveBeenCalledWith({
                where: {
                    applicationId: mockApplicationId
                }
            });

            expect(result).toEqual(mockKYCVerification);
        });

        it('should throw error if application not found', async () => {
            prisma.application.findFirst = vi.fn().mockResolvedValue(null);

            await expect(
                kycVerificationService.getKYCVerificationByApplicationId(mockApplicationId, mockUserId)
            ).rejects.toThrow(new ApiError(httpStatus.NOT_FOUND, 'Application not found'));
        });

        it('should throw error if KYC verification not found', async () => {
            prisma.application.findFirst = vi.fn().mockResolvedValue(mockApplication);
            prisma.kYCVerification.findUnique = vi.fn().mockResolvedValue(null);

            await expect(
                kycVerificationService.getKYCVerificationByApplicationId(mockApplicationId, mockUserId)
            ).rejects.toThrow(new ApiError(httpStatus.NOT_FOUND, 'KYC verification not found'));
        });
    });

    describe('Mock Verification Components', () => {
        // Test the mock verification logic by checking the results after timeout
        it('should process mock verification with valid personal info', async () => {
            const completedKYC = {
                ...mockKYCVerification,
                status: 'passed',
                confidence: 0.85,
                verifiedAt: new Date(),
                identityPassed: true,
                identityConfidence: 0.8,
                addressPassed: true,
                addressConfidence: 0.7,
                phonePassed: true,
                phoneConfidence: 0.8,
                emailPassed: true,
                emailConfidence: 0.9,
                ofacPassed: true,
                ofacMatches: null
            };

            prisma.application.findFirst = vi.fn().mockResolvedValue(mockApplication);
            prisma.kYCVerification.upsert = vi.fn().mockResolvedValue(mockKYCVerification);
            prisma.kYCVerification.update = vi.fn().mockResolvedValue(completedKYC);

            // Initiate verification
            await kycVerificationService.initiateKYCVerification(mockApplicationId, mockUserId);

            // Fast-forward time to trigger mock verification
            vi.advanceTimersByTime(3000);

            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 100));

            expect(prisma.kYCVerification.update).toHaveBeenCalledWith({
                where: { id: mockKYCId },
                data: expect.objectContaining({
                    status: expect.any(String),
                    confidence: expect.any(Number),
                    verifiedAt: expect.any(Date),
                    identityPassed: expect.any(Boolean),
                    identityConfidence: expect.any(Number),
                    addressPassed: expect.any(Boolean),
                    addressConfidence: expect.any(Number),
                    phonePassed: expect.any(Boolean),
                    phoneConfidence: expect.any(Number),
                    emailPassed: expect.any(Boolean),
                    emailConfidence: expect.any(Number),
                    ofacPassed: expect.any(Boolean)
                })
            });
        });

        it('should handle mock verification failure', async () => {
            prisma.application.findFirst = vi.fn().mockResolvedValue(mockApplication);
            prisma.kYCVerification.upsert = vi.fn().mockResolvedValue(mockKYCVerification);
            prisma.kYCVerification.update = vi.fn().mockRejectedValue(new Error('Update failed'));

            // Initiate verification
            await kycVerificationService.initiateKYCVerification(mockApplicationId, mockUserId);

            // Fast-forward time to trigger mock verification
            vi.advanceTimersByTime(3000);

            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 100));

            // Should attempt to set status to failed
            expect(prisma.kYCVerification.update).toHaveBeenCalledWith({
                where: { id: mockKYCId },
                data: {
                    status: 'failed',
                    verifiedAt: expect.any(Date)
                }
            });
        });
    });
});