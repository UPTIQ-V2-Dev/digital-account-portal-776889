import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Response, NextFunction } from 'express';
import applicationController from '../application.controller.ts';
import { applicationService } from '../../services/index.ts';
import ApiError from '../../utils/ApiError.ts';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '../../utils/types.ts';

// Mock the application service
vi.mock('../../services/index.ts', () => ({
    applicationService: {
        createApplication: vi.fn(),
        queryApplications: vi.fn(),
        getApplicationById: vi.fn(),
        getApplicationSummary: vi.fn(),
        updateApplicationById: vi.fn(),
        submitApplication: vi.fn(),
        deleteApplicationById: vi.fn(),
    },
}));

// Mock catchAsyncWithAuth utility
vi.mock('../../utils/catchAsyncWithAuth.ts', () => ({
    default: (fn: any) => fn,
}));

const mockApplicationService = applicationService as any;

describe('Application Controller', () => {
    let mockRequest: Partial<AuthenticatedRequest>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        vi.clearAllMocks();

        mockRequest = {
            body: {},
            params: {},
            validatedQuery: {},
            user: { id: 1, role: 'USER' } as any,
            get: vi.fn(),
            ip: '127.0.0.1',
            connection: {} as any,
        };

        mockResponse = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        };

        mockNext = vi.fn();
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
        it('should create application successfully', async () => {
            mockRequest.body = { accountType: 'consumer' };
            mockRequest.get = vi.fn().mockReturnValue('Mozilla/5.0');
            mockApplicationService.createApplication.mockResolvedValue(mockApplication);

            await applicationController.createApplication(mockRequest as any, mockResponse as any, mockNext);

            expect(mockApplicationService.createApplication).toHaveBeenCalledWith(
                1,
                'consumer',
                {
                    userAgent: 'Mozilla/5.0',
                    ipAddress: '127.0.0.1',
                    sessionId: undefined,
                    source: 'web_portal',
                }
            );
            expect(mockResponse.status).toHaveBeenCalledWith(httpStatus.CREATED);
            expect(mockResponse.send).toHaveBeenCalledWith({
                id: mockApplication.id,
                status: mockApplication.status,
                currentStep: mockApplication.currentStep,
                accountType: mockApplication.accountType,
                customerType: mockApplication.customerType,
                applicantId: mockApplication.applicantId,
                createdAt: mockApplication.createdAt.toISOString(),
                updatedAt: mockApplication.updatedAt.toISOString(),
                metadata: {
                    userAgent: mockApplication.userAgent,
                    ipAddress: mockApplication.ipAddress,
                    sessionId: mockApplication.sessionId,
                    startedAt: mockApplication.startedAt.toISOString(),
                    lastActivity: mockApplication.lastActivity.toISOString(),
                    source: mockApplication.source,
                },
            });
        });
    });

    describe('getApplications', () => {
        it('should get applications for regular user', async () => {
            const mockApplications = [mockApplication];
            mockRequest.validatedQuery = { status: 'draft', limit: 10 };
            mockApplicationService.queryApplications.mockResolvedValue(mockApplications);

            await applicationController.getApplications(mockRequest as any, mockResponse as any, mockNext);

            expect(mockApplicationService.queryApplications).toHaveBeenCalledWith(
                { status: 'draft', userId: 1 },
                { limit: 10 }
            );
            expect(mockResponse.send).toHaveBeenCalledWith(mockApplications);
        });

        it('should get all applications for admin user', async () => {
            const mockApplications = [mockApplication];
            mockRequest.user = { id: 1, role: 'ADMIN' } as any;
            mockRequest.validatedQuery = { status: 'draft', limit: 10 };
            mockApplicationService.queryApplications.mockResolvedValue(mockApplications);

            await applicationController.getApplications(mockRequest as any, mockResponse as any, mockNext);

            expect(mockApplicationService.queryApplications).toHaveBeenCalledWith(
                { status: 'draft' },
                { limit: 10 }
            );
        });
    });

    describe('getApplication', () => {
        it('should get application by ID for regular user', async () => {
            mockRequest.params = { applicationId: 'app_test_123' };
            mockApplicationService.getApplicationById.mockResolvedValue(mockApplication);

            await applicationController.getApplication(mockRequest as any, mockResponse as any, mockNext);

            expect(mockApplicationService.getApplicationById).toHaveBeenCalledWith(
                'app_test_123',
                1
            );
            expect(mockResponse.send).toHaveBeenCalledWith({
                id: mockApplication.id,
                status: mockApplication.status,
                currentStep: mockApplication.currentStep,
                accountType: mockApplication.accountType,
                customerType: mockApplication.customerType,
                applicantId: mockApplication.applicantId,
                submittedAt: undefined,
                completedAt: undefined,
                createdAt: mockApplication.createdAt.toISOString(),
                updatedAt: mockApplication.updatedAt.toISOString(),
                metadata: {
                    userAgent: mockApplication.userAgent,
                    ipAddress: mockApplication.ipAddress,
                    sessionId: mockApplication.sessionId,
                    startedAt: mockApplication.startedAt.toISOString(),
                    lastActivity: mockApplication.lastActivity.toISOString(),
                    source: mockApplication.source,
                },
            });
        });

        it('should get application by ID for admin user', async () => {
            mockRequest.params = { applicationId: 'app_test_123' };
            mockRequest.user = { id: 1, role: 'ADMIN' } as any;
            mockApplicationService.getApplicationById.mockResolvedValue(mockApplication);

            await applicationController.getApplication(mockRequest as any, mockResponse as any, mockNext);

            expect(mockApplicationService.getApplicationById).toHaveBeenCalledWith(
                'app_test_123',
                undefined
            );
        });

        it('should throw error if application not found', async () => {
            mockRequest.params = { applicationId: 'nonexistent' };
            mockApplicationService.getApplicationById.mockResolvedValue(null);

            await expect(
                applicationController.getApplication(mockRequest as any, mockResponse as any, mockNext)
            ).rejects.toThrow(ApiError);
        });
    });

    describe('updateApplication', () => {
        it('should update application successfully', async () => {
            mockRequest.params = { applicationId: 'app_test_123' };
            mockRequest.body = { status: 'in_progress', currentStep: 'personal_info' };
            const updatedApplication = { ...mockApplication, status: 'in_progress' };
            mockApplicationService.updateApplicationById.mockResolvedValue(updatedApplication);

            await applicationController.updateApplication(mockRequest as any, mockResponse as any, mockNext);

            expect(mockApplicationService.updateApplicationById).toHaveBeenCalledWith(
                'app_test_123',
                1,
                { status: 'in_progress', currentStep: 'personal_info' }
            );
            expect(mockResponse.send).toHaveBeenCalledWith({
                id: updatedApplication.id,
                status: updatedApplication.status,
                currentStep: updatedApplication.currentStep,
                accountType: updatedApplication.accountType,
                customerType: updatedApplication.customerType,
                applicantId: updatedApplication.applicantId,
                submittedAt: undefined,
                completedAt: undefined,
                createdAt: updatedApplication.createdAt.toISOString(),
                updatedAt: updatedApplication.updatedAt.toISOString(),
                metadata: expect.any(Object),
            });
        });
    });

    describe('submitApplication', () => {
        it('should submit application successfully', async () => {
            mockRequest.body = {
                applicationId: 'app_test_123',
                finalReview: true,
                electronicConsent: true,
            };
            const submitResult = {
                submitted: true,
                applicationId: 'app_test_123',
                message: 'Application submitted successfully',
            };
            mockApplicationService.submitApplication.mockResolvedValue(submitResult);

            await applicationController.submitApplication(mockRequest as any, mockResponse as any, mockNext);

            expect(mockApplicationService.submitApplication).toHaveBeenCalledWith(
                'app_test_123',
                1,
                { finalReview: true, electronicConsent: true }
            );
            expect(mockResponse.send).toHaveBeenCalledWith(submitResult);
        });
    });

    describe('getApplicationSummary', () => {
        it('should get application summary successfully', async () => {
            mockRequest.params = { applicationId: 'app_test_123' };
            const mockSummary = {
                application: mockApplication,
                personalInfo: null,
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
            mockApplicationService.getApplicationSummary.mockResolvedValue(mockSummary);

            await applicationController.getApplicationSummary(mockRequest as any, mockResponse as any, mockNext);

            expect(mockApplicationService.getApplicationSummary).toHaveBeenCalledWith(
                'app_test_123',
                1
            );
            expect(mockResponse.send).toHaveBeenCalledWith(mockSummary);
        });

        it('should throw error if application summary not found', async () => {
            mockRequest.params = { applicationId: 'nonexistent' };
            mockApplicationService.getApplicationSummary.mockResolvedValue(null);

            await expect(
                applicationController.getApplicationSummary(mockRequest as any, mockResponse as any, mockNext)
            ).rejects.toThrow(ApiError);
        });
    });

    describe('deleteApplication', () => {
        it('should delete application successfully', async () => {
            mockRequest.params = { applicationId: 'app_test_123' };
            mockApplicationService.deleteApplicationById.mockResolvedValue(mockApplication);

            await applicationController.deleteApplication(mockRequest as any, mockResponse as any, mockNext);

            expect(mockApplicationService.deleteApplicationById).toHaveBeenCalledWith(
                'app_test_123',
                1
            );
            expect(mockResponse.status).toHaveBeenCalledWith(httpStatus.NO_CONTENT);
            expect(mockResponse.send).toHaveBeenCalled();
        });
    });
});