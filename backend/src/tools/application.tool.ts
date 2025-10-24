import { applicationService } from '../services/index.ts';
import { MCPTool } from '../types/mcp.ts';
import pick from '../utils/pick.ts';
import { z } from 'zod';

const applicationSchema = z.object({
    id: z.string(),
    status: z.string(),
    currentStep: z.string(),
    accountType: z.string(),
    customerType: z.string(),
    applicantId: z.string(),
    submittedAt: z.string().nullable(),
    completedAt: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    userAgent: z.string().nullable(),
    ipAddress: z.string().nullable(),
    sessionId: z.string().nullable(),
    startedAt: z.string().nullable(),
    lastActivity: z.string().nullable(),
    source: z.string().nullable(),
    userId: z.number()
});

const createApplicationTool: MCPTool = {
    id: 'application_create',
    name: 'Create Application',
    description: 'Create a new account opening application',
    inputSchema: z.object({
        userId: z.number().int(),
        accountType: z.enum(['consumer', 'business']),
        metadata: z.object({
            userAgent: z.string().optional(),
            ipAddress: z.string().optional(),
            sessionId: z.string().optional(),
            source: z.string().optional()
        }).optional()
    }),
    outputSchema: applicationSchema.omit({ 
        userAgent: true, 
        ipAddress: true, 
        sessionId: true, 
        startedAt: true, 
        lastActivity: true, 
        source: true, 
        userId: true 
    }),
    fn: async (inputs: { 
        userId: number; 
        accountType: 'consumer' | 'business'; 
        metadata?: {
            userAgent?: string;
            ipAddress?: string;
            sessionId?: string;
            source?: string;
        }
    }) => {
        const application = await applicationService.createApplication(
            inputs.userId, 
            inputs.accountType, 
            inputs.metadata || {}
        );
        return {
            id: application.id,
            status: application.status,
            currentStep: application.currentStep,
            accountType: application.accountType,
            customerType: application.customerType,
            applicantId: application.applicantId,
            submittedAt: application.submittedAt?.toISOString() || null,
            completedAt: application.completedAt?.toISOString() || null,
            createdAt: application.createdAt.toISOString(),
            updatedAt: application.updatedAt.toISOString()
        };
    }
};

const getApplicationsTool: MCPTool = {
    id: 'application_get_all',
    name: 'Get All Applications',
    description: 'Get all applications with optional filters and pagination',
    inputSchema: z.object({
        status: z.enum(['draft', 'in_progress', 'submitted', 'approved', 'rejected', 'completed']).optional(),
        accountType: z.enum(['consumer', 'business']).optional(),
        customerType: z.enum(['new', 'existing']).optional(),
        userId: z.number().int().optional(),
        sortBy: z.string().optional(),
        sortType: z.enum(['asc', 'desc']).optional(),
        limit: z.number().int().min(1).max(100).optional(),
        page: z.number().int().min(1).optional()
    }),
    outputSchema: z.object({
        applications: z.array(applicationSchema.omit({ 
            userAgent: true, 
            ipAddress: true, 
            sessionId: true, 
            startedAt: true, 
            lastActivity: true, 
            source: true, 
            userId: true 
        }))
    }),
    fn: async (inputs: { 
        status?: 'draft' | 'in_progress' | 'submitted' | 'approved' | 'rejected' | 'completed';
        accountType?: 'consumer' | 'business';
        customerType?: 'new' | 'existing';
        userId?: number;
        sortBy?: string; 
        sortType?: 'asc' | 'desc';
        limit?: number; 
        page?: number;
    }) => {
        const filter = pick(inputs, ['status', 'accountType', 'customerType', 'userId']);
        const options = pick(inputs, ['sortBy', 'sortType', 'limit', 'page']);
        const applications = await applicationService.queryApplications(filter, options);
        
        return {
            applications: applications.map(app => ({
                id: app.id,
                status: app.status,
                currentStep: app.currentStep,
                accountType: app.accountType,
                customerType: app.customerType,
                applicantId: app.applicantId,
                submittedAt: (app as any).submittedAt?.toISOString() || null,
                completedAt: (app as any).completedAt?.toISOString() || null,
                createdAt: app.createdAt.toISOString(),
                updatedAt: app.updatedAt.toISOString()
            }))
        };
    }
};

const getApplicationTool: MCPTool = {
    id: 'application_get_by_id',
    name: 'Get Application By ID',
    description: 'Get a single application by its ID',
    inputSchema: z.object({
        applicationId: z.string(),
        userId: z.number().int().optional()
    }),
    outputSchema: applicationSchema.omit({ 
        userAgent: true, 
        ipAddress: true, 
        sessionId: true, 
        startedAt: true, 
        lastActivity: true, 
        source: true, 
        userId: true 
    }),
    fn: async (inputs: { applicationId: string; userId?: number }) => {
        const application = await applicationService.getApplicationById(inputs.applicationId, inputs.userId);
        if (!application) {
            throw new Error('Application not found');
        }
        return {
            id: application.id,
            status: application.status,
            currentStep: application.currentStep,
            accountType: application.accountType,
            customerType: application.customerType,
            applicantId: application.applicantId,
            submittedAt: (application as any).submittedAt?.toISOString() || null,
            completedAt: (application as any).completedAt?.toISOString() || null,
            createdAt: application.createdAt.toISOString(),
            updatedAt: application.updatedAt.toISOString()
        };
    }
};

const getApplicationSummaryTool: MCPTool = {
    id: 'application_get_summary',
    name: 'Get Application Summary',
    description: 'Get comprehensive application summary with all related data',
    inputSchema: z.object({
        applicationId: z.string(),
        userId: z.number().int().optional()
    }),
    outputSchema: z.object({
        application: z.object({
            id: z.string(),
            status: z.string(),
            currentStep: z.string(),
            accountType: z.string(),
            customerType: z.string(),
            applicantId: z.string(),
            submittedAt: z.string().nullable(),
            completedAt: z.string().nullable(),
            createdAt: z.string(),
            updatedAt: z.string()
        }),
        personalInfo: z.any().nullable(),
        businessProfile: z.any().nullable(),
        financialProfile: z.any().nullable(),
        productSelections: z.array(z.any()),
        documents: z.array(z.any()),
        kycVerification: z.any().nullable(),
        additionalSigners: z.array(z.any()),
        riskAssessment: z.any().nullable(),
        agreements: z.array(z.any()),
        signatures: z.array(z.any()),
        fundingSetup: z.any().nullable()
    }),
    fn: async (inputs: { applicationId: string; userId?: number }) => {
        const summary = await applicationService.getApplicationSummary(inputs.applicationId, inputs.userId);
        if (!summary) {
            throw new Error('Application not found');
        }
        return {
            ...summary,
            application: {
                ...summary.application,
                submittedAt: summary.application.submittedAt?.toISOString() || null,
                completedAt: summary.application.completedAt?.toISOString() || null,
                createdAt: summary.application.createdAt.toISOString(),
                updatedAt: summary.application.updatedAt.toISOString()
            }
        };
    }
};

const updateApplicationTool: MCPTool = {
    id: 'application_update',
    name: 'Update Application',
    description: 'Update application information by ID',
    inputSchema: z.object({
        applicationId: z.string(),
        userId: z.number().int(),
        currentStep: z.enum([
            'account_type',
            'personal_info',
            'business_profile',
            'financial_profile',
            'product_selection',
            'document_upload',
            'kyc_verification',
            'risk_assessment',
            'agreements',
            'funding_setup',
            'review'
        ]).optional(),
        status: z.enum(['draft', 'in_progress', 'submitted', 'approved', 'rejected', 'completed']).optional(),
        accountType: z.enum(['consumer', 'business']).optional(),
        customerType: z.enum(['new', 'existing']).optional()
    }),
    outputSchema: applicationSchema.omit({ 
        userAgent: true, 
        ipAddress: true, 
        sessionId: true, 
        startedAt: true, 
        lastActivity: true, 
        source: true, 
        userId: true 
    }),
    fn: async (inputs: { 
        applicationId: string; 
        userId: number;
        currentStep?: string;
        status?: string;
        accountType?: string;
        customerType?: string;
    }) => {
        const updateData = pick(inputs, ['currentStep', 'status', 'accountType', 'customerType']);
        const application = await applicationService.updateApplicationById(
            inputs.applicationId, 
            inputs.userId, 
            updateData
        );
        return {
            id: application.id,
            status: application.status,
            currentStep: application.currentStep,
            accountType: application.accountType,
            customerType: application.customerType,
            applicantId: application.applicantId,
            submittedAt: application.submittedAt?.toISOString() || null,
            completedAt: application.completedAt?.toISOString() || null,
            createdAt: application.createdAt.toISOString(),
            updatedAt: application.updatedAt.toISOString()
        };
    }
};

const submitApplicationTool: MCPTool = {
    id: 'application_submit',
    name: 'Submit Application',
    description: 'Submit an application for review',
    inputSchema: z.object({
        applicationId: z.string(),
        userId: z.number().int(),
        finalReview: z.boolean(),
        electronicConsent: z.boolean()
    }),
    outputSchema: z.object({
        submitted: z.boolean(),
        applicationId: z.string(),
        message: z.string()
    }),
    fn: async (inputs: { 
        applicationId: string; 
        userId: number; 
        finalReview: boolean; 
        electronicConsent: boolean; 
    }) => {
        return await applicationService.submitApplication(inputs.applicationId, inputs.userId, {
            finalReview: inputs.finalReview,
            electronicConsent: inputs.electronicConsent
        });
    }
};

const deleteApplicationTool: MCPTool = {
    id: 'application_delete',
    name: 'Delete Application',
    description: 'Delete an application by its ID (draft only)',
    inputSchema: z.object({
        applicationId: z.string(),
        userId: z.number().int()
    }),
    outputSchema: z.object({
        success: z.boolean()
    }),
    fn: async (inputs: { applicationId: string; userId: number }) => {
        await applicationService.deleteApplicationById(inputs.applicationId, inputs.userId);
        return { success: true };
    }
};

export const applicationTools: MCPTool[] = [
    createApplicationTool,
    getApplicationsTool,
    getApplicationTool,
    getApplicationSummaryTool,
    updateApplicationTool,
    submitApplicationTool,
    deleteApplicationTool
];