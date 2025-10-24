import { describe, it, expect, beforeEach, vi } from 'vitest';
import applicationService from '../application.service.ts';
import prisma from '../../client.ts';
import ApiError from '../../utils/ApiError.ts';

// Mock Prisma client
vi.mock('../../client.ts', () => ({
    default: {
        application: {
            create: vi.fn(),
            findMany: vi.fn(),
            findFirst: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
    },
}));

// Mock utils
vi.mock('../../utils/string.ts', () => ({
    getRandomString: vi.fn().mockReturnValue('ABC123DEF'),
}));

const mockPrisma = prisma as any;

describe('Application Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockApplication = {
        id: 'app_test_123',
        status: 'draft',
        currentStep: 'account_type',
        accountType: 'consumer',
        customerType: 'new',
        applicantId: 'applicant_ABC123DEF',
        submittedAt: null,
        completedAt: null,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
        userAgent: 'Mozilla/5.0',
        ipAddress: '127.0.0.1',
        sessionId: 'session_123',
        startedAt: new Date('2023-01-01T00:00:00Z'),
        lastActivity: new Date('2023-01-01T00:00:00Z'),
        source: 'web_portal',
        userId: 1,
    };

    describe('createApplication', () => {
        it('should create a new application successfully', async () => {
            mockPrisma.application.create.mockResolvedValue(mockApplication);

            const result = await applicationService.createApplication(
                1,
                'consumer',
                {
                    userAgent: 'Mozilla/5.0',
                    ipAddress: '127.0.0.1',
                    sessionId: 'session_123',
                    source: 'web_portal',
                }
            );

            expect(result).toEqual(mockApplication);
            expect(mockPrisma.application.create).toHaveBeenCalledWith({
                data: {
                    accountType: 'consumer',
                    applicantId: 'applicant_ABC123DEF',
                    userId: 1,
                    userAgent: 'Mozilla/5.0',
                    ipAddress: '127.0.0.1',
                    sessionId: 'session_123',
                    source: 'web_portal',
                    startedAt: expect.any(Date),
                    lastActivity: expect.any(Date),
                },
            });
        });

        it('should create application with default metadata', async () => {
            mockPrisma.application.create.mockResolvedValue(mockApplication);

            await applicationService.createApplication(1, 'consumer');

            expect(mockPrisma.application.create).toHaveBeenCalledWith({
                data: {
                    accountType: 'consumer',
                    applicantId: 'applicant_ABC123DEF',
                    userId: 1,
                    userAgent: undefined,
                    ipAddress: undefined,
                    sessionId: undefined,
                    source: 'web_portal',
                    startedAt: expect.any(Date),
                    lastActivity: expect.any(Date),
                },
            });
        });
    });

    describe('queryApplications', () => {
        it('should return paginated applications', async () => {
            const mockApplications = [mockApplication];
            mockPrisma.application.findMany.mockResolvedValue(mockApplications);

            const result = await applicationService.queryApplications(
                { status: 'draft' },
                { page: 1, limit: 10, sortBy: 'createdAt', sortType: 'desc' }
            );

            expect(result).toEqual(mockApplications);
            expect(mockPrisma.application.findMany).toHaveBeenCalledWith({
                where: { status: 'draft' },
                select: expect.any(Object),
                skip: 0,
                take: 10,
                orderBy: { createdAt: 'desc' },
            });
        });

        it('should use default pagination parameters', async () => {
            mockPrisma.application.findMany.mockResolvedValue([]);

            await applicationService.queryApplications({}, {});

            expect(mockPrisma.application.findMany).toHaveBeenCalledWith({
                where: {},
                select: expect.any(Object),
                skip: 0,
                take: 10,
                orderBy: { createdAt: 'desc' },
            });
        });
    });

    describe('getApplicationById', () => {
        it('should return application for admin (no userId filtering)', async () => {
            mockPrisma.application.findUnique.mockResolvedValue(mockApplication);

            const result = await applicationService.getApplicationById('app_test_123');

            expect(result).toEqual(mockApplication);
            expect(mockPrisma.application.findUnique).toHaveBeenCalledWith({
                where: { id: 'app_test_123' },
                select: expect.any(Object),
            });
        });

        it('should return application for specific user', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(mockApplication);

            const result = await applicationService.getApplicationById('app_test_123', 1);

            expect(result).toEqual(mockApplication);
            expect(mockPrisma.application.findFirst).toHaveBeenCalledWith({
                where: { id: 'app_test_123', userId: 1 },
                select: expect.any(Object),
            });
        });

        it('should return null if application not found', async () => {
            mockPrisma.application.findUnique.mockResolvedValue(null);

            const result = await applicationService.getApplicationById('nonexistent');

            expect(result).toBeNull();
        });
    });

    describe('getApplicationSummary', () => {
        const mockSummaryApplication = {
            ...mockApplication,
            personalInfo: { firstName: 'John', lastName: 'Doe' },
            businessProfile: null,
            financialProfile: null,
            productSelections: [],
            documents: [],
            kycVerification: null,
            additionalSigners: [],
            riskAssessment: null,
            agreements: [],
            signatures: [],
            fundingSetup: null,
        };

        it('should return comprehensive application summary', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(mockSummaryApplication);

            const result = await applicationService.getApplicationSummary('app_test_123', 1);

            expect(result).toEqual({
                application: {
                    id: mockApplication.id,
                    status: mockApplication.status,
                    currentStep: mockApplication.currentStep,
                    accountType: mockApplication.accountType,
                    customerType: mockApplication.customerType,
                    applicantId: mockApplication.applicantId,
                    submittedAt: mockApplication.submittedAt,
                    completedAt: mockApplication.completedAt,
                    createdAt: mockApplication.createdAt,
                    updatedAt: mockApplication.updatedAt,
                },
                personalInfo: { firstName: 'John', lastName: 'Doe' },
                businessProfile: null,
                financialProfile: null,
                productSelections: [],
                documents: [],
                kycVerification: null,
                additionalSigners: [],
                riskAssessment: null,
                agreements: [],
                signatures: [],
                fundingSetup: null,
            });
        });

        it('should return null if application not found', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(null);

            const result = await applicationService.getApplicationSummary('nonexistent', 1);

            expect(result).toBeNull();
        });
    });

    describe('updateApplicationById', () => {
        it('should update application successfully', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(mockApplication);
            const updatedApplication = { ...mockApplication, status: 'in_progress' };
            mockPrisma.application.update.mockResolvedValue(updatedApplication);

            const result = await applicationService.updateApplicationById(
                'app_test_123',
                1,
                { status: 'in_progress' }
            );

            expect(result).toEqual(updatedApplication);
            expect(mockPrisma.application.update).toHaveBeenCalledWith({
                where: { id: 'app_test_123' },
                data: {
                    status: 'in_progress',
                    lastActivity: expect.any(Date),
                },
            });
        });

        it('should throw error if application not found', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(null);

            await expect(
                applicationService.updateApplicationById('nonexistent', 1, { status: 'in_progress' })
            ).rejects.toThrow(ApiError);
        });
    });

    describe('submitApplication', () => {
        it('should submit application successfully', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(mockApplication);
            mockPrisma.application.update.mockResolvedValue({
                ...mockApplication,
                status: 'submitted',
                submittedAt: new Date(),
            });

            const result = await applicationService.submitApplication('app_test_123', 1, {
                finalReview: true,
                electronicConsent: true,
            });

            expect(result).toEqual({
                submitted: true,
                applicationId: 'app_test_123',
                message: 'Application submitted successfully',
            });
        });

        it('should throw error if final review is false', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(mockApplication);

            await expect(
                applicationService.submitApplication('app_test_123', 1, {
                    finalReview: false,
                    electronicConsent: true,
                })
            ).rejects.toThrow(ApiError);
        });

        it('should throw error if electronic consent is false', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(mockApplication);

            await expect(
                applicationService.submitApplication('app_test_123', 1, {
                    finalReview: true,
                    electronicConsent: false,
                })
            ).rejects.toThrow(ApiError);
        });

        it('should throw error if application already submitted', async () => {
            mockPrisma.application.findFirst.mockResolvedValue({
                ...mockApplication,
                status: 'submitted',
            });

            await expect(
                applicationService.submitApplication('app_test_123', 1, {
                    finalReview: true,
                    electronicConsent: true,
                })
            ).rejects.toThrow(ApiError);
        });
    });

    describe('deleteApplicationById', () => {
        it('should delete draft application successfully', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(mockApplication);
            mockPrisma.application.delete.mockResolvedValue(mockApplication);

            const result = await applicationService.deleteApplicationById('app_test_123', 1);

            expect(result).toEqual(mockApplication);
            expect(mockPrisma.application.delete).toHaveBeenCalledWith({
                where: { id: 'app_test_123' },
            });
        });

        it('should throw error if application not found', async () => {
            mockPrisma.application.findFirst.mockResolvedValue(null);

            await expect(
                applicationService.deleteApplicationById('nonexistent', 1)
            ).rejects.toThrow(ApiError);
        });

        it('should throw error if application is not draft', async () => {
            mockPrisma.application.findFirst.mockResolvedValue({
                ...mockApplication,
                status: 'submitted',
            });

            await expect(
                applicationService.deleteApplicationById('app_test_123', 1)
            ).rejects.toThrow(ApiError);
        });
    });
});