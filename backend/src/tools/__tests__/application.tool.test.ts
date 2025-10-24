import { describe, it, expect, beforeEach, vi } from 'vitest';
import { applicationTools } from '../application.tool.ts';
import { applicationService } from '../../services/index.ts';

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

const mockApplicationService = applicationService as any;

describe('Application MCP Tools', () => {
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

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('application_create tool', () => {
        it('should have correct tool configuration', () => {
            const createTool = applicationTools.find(tool => tool.id === 'application_create');
            
            expect(createTool).toBeDefined();
            expect(createTool?.name).toBe('Create Application');
            expect(createTool?.description).toBe('Create a new account opening application');
        });

        it('should create application successfully', async () => {
            mockApplicationService.createApplication.mockResolvedValue(mockApplication);
            const createTool = applicationTools.find(tool => tool.id === 'application_create')!;

            const result = await createTool.fn({
                userId: 1,
                accountType: 'consumer',
                metadata: {
                    userAgent: 'Mozilla/5.0',
                    ipAddress: '127.0.0.1',
                    source: 'web_portal',
                },
            });

            expect(result).toEqual({
                id: 'app_test_123',
                status: 'draft',
                currentStep: 'account_type',
                accountType: 'consumer',
                customerType: 'new',
                applicantId: 'applicant_ABC123DEF',
                submittedAt: null,
                completedAt: null,
                createdAt: '2023-01-01T00:00:00.000Z',
                updatedAt: '2023-01-01T00:00:00.000Z',
            });
            expect(mockApplicationService.createApplication).toHaveBeenCalledWith(
                1,
                'consumer',
                {
                    userAgent: 'Mozilla/5.0',
                    ipAddress: '127.0.0.1',
                    source: 'web_portal',
                }
            );
        });
    });

    describe('application_get_all tool', () => {
        it('should have correct tool configuration', () => {
            const getAllTool = applicationTools.find(tool => tool.id === 'application_get_all');
            
            expect(getAllTool).toBeDefined();
            expect(getAllTool?.name).toBe('Get All Applications');
            expect(getAllTool?.description).toBe('Get all applications with optional filters and pagination');
        });

        it('should get all applications successfully', async () => {
            const mockApplications = [mockApplication];
            mockApplicationService.queryApplications.mockResolvedValue(mockApplications);
            const getAllTool = applicationTools.find(tool => tool.id === 'application_get_all')!;

            const result = await getAllTool.fn({
                status: 'draft',
                userId: 1,
                limit: 10,
                page: 1,
            });

            expect(result.applications).toHaveLength(1);
            expect(result.applications[0]).toEqual({
                id: 'app_test_123',
                status: 'draft',
                currentStep: 'account_type',
                accountType: 'consumer',
                customerType: 'new',
                applicantId: 'applicant_ABC123DEF',
                submittedAt: null,
                completedAt: null,
                createdAt: '2023-01-01T00:00:00.000Z',
                updatedAt: '2023-01-01T00:00:00.000Z',
            });
        });
    });

    describe('application_get_by_id tool', () => {
        it('should have correct tool configuration', () => {
            const getByIdTool = applicationTools.find(tool => tool.id === 'application_get_by_id');
            
            expect(getByIdTool).toBeDefined();
            expect(getByIdTool?.name).toBe('Get Application By ID');
            expect(getByIdTool?.description).toBe('Get a single application by its ID');
        });

        it('should get application by ID successfully', async () => {
            mockApplicationService.getApplicationById.mockResolvedValue(mockApplication);
            const getByIdTool = applicationTools.find(tool => tool.id === 'application_get_by_id')!;

            const result = await getByIdTool.fn({
                applicationId: 'app_test_123',
                userId: 1,
            });

            expect(result).toEqual({
                id: 'app_test_123',
                status: 'draft',
                currentStep: 'account_type',
                accountType: 'consumer',
                customerType: 'new',
                applicantId: 'applicant_ABC123DEF',
                submittedAt: null,
                completedAt: null,
                createdAt: '2023-01-01T00:00:00.000Z',
                updatedAt: '2023-01-01T00:00:00.000Z',
            });
        });

        it('should throw error if application not found', async () => {
            mockApplicationService.getApplicationById.mockResolvedValue(null);
            const getByIdTool = applicationTools.find(tool => tool.id === 'application_get_by_id')!;

            await expect(
                getByIdTool.fn({
                    applicationId: 'nonexistent',
                    userId: 1,
                })
            ).rejects.toThrow('Application not found');
        });
    });

    describe('application_get_summary tool', () => {
        it('should have correct tool configuration', () => {
            const getSummaryTool = applicationTools.find(tool => tool.id === 'application_get_summary');
            
            expect(getSummaryTool).toBeDefined();
            expect(getSummaryTool?.name).toBe('Get Application Summary');
            expect(getSummaryTool?.description).toBe('Get comprehensive application summary with all related data');
        });

        it('should get application summary successfully', async () => {
            const mockSummary = {
                application: {
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
                },
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
            const getSummaryTool = applicationTools.find(tool => tool.id === 'application_get_summary')!;

            const result = await getSummaryTool.fn({
                applicationId: 'app_test_123',
                userId: 1,
            });

            expect(result.application.id).toBe('app_test_123');
            expect(result.personalInfo).toBeNull();
            expect(result.productSelections).toEqual([]);
        });
    });

    describe('application_update tool', () => {
        it('should have correct tool configuration', () => {
            const updateTool = applicationTools.find(tool => tool.id === 'application_update');
            
            expect(updateTool).toBeDefined();
            expect(updateTool?.name).toBe('Update Application');
            expect(updateTool?.description).toBe('Update application information by ID');
        });

        it('should update application successfully', async () => {
            const updatedApplication = { ...mockApplication, status: 'in_progress' };
            mockApplicationService.updateApplicationById.mockResolvedValue(updatedApplication);
            const updateTool = applicationTools.find(tool => tool.id === 'application_update')!;

            const result = await updateTool.fn({
                applicationId: 'app_test_123',
                userId: 1,
                status: 'in_progress',
                currentStep: 'personal_info',
            });

            expect(result.status).toBe('in_progress');
            expect(mockApplicationService.updateApplicationById).toHaveBeenCalledWith(
                'app_test_123',
                1,
                { status: 'in_progress', currentStep: 'personal_info' }
            );
        });
    });

    describe('application_submit tool', () => {
        it('should have correct tool configuration', () => {
            const submitTool = applicationTools.find(tool => tool.id === 'application_submit');
            
            expect(submitTool).toBeDefined();
            expect(submitTool?.name).toBe('Submit Application');
            expect(submitTool?.description).toBe('Submit an application for review');
        });

        it('should submit application successfully', async () => {
            const submitResult = {
                submitted: true,
                applicationId: 'app_test_123',
                message: 'Application submitted successfully',
            };
            mockApplicationService.submitApplication.mockResolvedValue(submitResult);
            const submitTool = applicationTools.find(tool => tool.id === 'application_submit')!;

            const result = await submitTool.fn({
                applicationId: 'app_test_123',
                userId: 1,
                finalReview: true,
                electronicConsent: true,
            });

            expect(result).toEqual(submitResult);
            expect(mockApplicationService.submitApplication).toHaveBeenCalledWith(
                'app_test_123',
                1,
                { finalReview: true, electronicConsent: true }
            );
        });
    });

    describe('application_delete tool', () => {
        it('should have correct tool configuration', () => {
            const deleteTool = applicationTools.find(tool => tool.id === 'application_delete');
            
            expect(deleteTool).toBeDefined();
            expect(deleteTool?.name).toBe('Delete Application');
            expect(deleteTool?.description).toBe('Delete an application by its ID (draft only)');
        });

        it('should delete application successfully', async () => {
            mockApplicationService.deleteApplicationById.mockResolvedValue(mockApplication);
            const deleteTool = applicationTools.find(tool => tool.id === 'application_delete')!;

            const result = await deleteTool.fn({
                applicationId: 'app_test_123',
                userId: 1,
            });

            expect(result).toEqual({ success: true });
            expect(mockApplicationService.deleteApplicationById).toHaveBeenCalledWith(
                'app_test_123',
                1
            );
        });
    });

    describe('Tool count and completeness', () => {
        it('should have all expected tools', () => {
            const expectedToolIds = [
                'application_create',
                'application_get_all',
                'application_get_by_id',
                'application_get_summary',
                'application_update',
                'application_submit',
                'application_delete',
            ];

            expect(applicationTools).toHaveLength(expectedToolIds.length);
            
            expectedToolIds.forEach(toolId => {
                const tool = applicationTools.find(t => t.id === toolId);
                expect(tool).toBeDefined();
                expect(tool?.name).toBeTruthy();
                expect(tool?.description).toBeTruthy();
                expect(tool?.inputSchema).toBeDefined();
                expect(tool?.outputSchema).toBeDefined();
                expect(typeof tool?.fn).toBe('function');
            });
        });
    });
});