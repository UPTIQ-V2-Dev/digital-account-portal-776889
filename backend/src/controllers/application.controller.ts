import { applicationService } from '../services/index.ts';
import ApiError from '../utils/ApiError.ts';
import catchAsyncWithAuth from '../utils/catchAsyncWithAuth.ts';
import pick from '../utils/pick.ts';
import httpStatus from 'http-status';

const createApplication = catchAsyncWithAuth(async (req, res) => {
    const { accountType } = req.body;
    const userId = req.user.id;

    // Extract metadata from request
    const metadata = {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip || req.connection?.remoteAddress,
        sessionId: (req as any).sessionID,
        source: req.body.source || 'web_portal'
    };

    const application = await applicationService.createApplication(userId, accountType, metadata);

    // Format response to match API specification
    const response = {
        id: application.id,
        status: application.status,
        currentStep: application.currentStep,
        accountType: application.accountType,
        customerType: application.customerType,
        applicantId: application.applicantId,
        createdAt: application.createdAt.toISOString(),
        updatedAt: application.updatedAt.toISOString(),
        metadata: {
            userAgent: application.userAgent,
            ipAddress: application.ipAddress,
            sessionId: application.sessionId,
            startedAt: application.startedAt?.toISOString(),
            lastActivity: application.lastActivity?.toISOString(),
            source: application.source
        }
    };

    res.status(httpStatus.CREATED).send(response);
});

const getApplications = catchAsyncWithAuth(async (req, res) => {
    // For regular users, only show their own applications
    const filter = req.user.role === 'ADMIN' 
        ? pick(req.validatedQuery, ['status', 'accountType', 'customerType'])
        : { ...pick(req.validatedQuery, ['status', 'accountType', 'customerType']), userId: req.user.id };

    const options = pick(req.validatedQuery, ['sortBy', 'sortType', 'limit', 'page']);
    const applications = await applicationService.queryApplications(filter, options);

    res.send(applications);
});

const getApplication = catchAsyncWithAuth(async (req, res) => {
    const applicationId = req.params.applicationId;
    const userId = req.user.role === 'ADMIN' ? undefined : req.user.id;

    const application = await applicationService.getApplicationById(applicationId, userId);
    if (!application) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Application not found');
    }

    // Format response to match API specification
    const response = {
        id: application.id,
        status: application.status,
        currentStep: application.currentStep,
        accountType: application.accountType,
        customerType: application.customerType,
        applicantId: application.applicantId,
        submittedAt: (application as any).submittedAt?.toISOString(),
        completedAt: (application as any).completedAt?.toISOString(),
        createdAt: application.createdAt.toISOString(),
        updatedAt: application.updatedAt.toISOString(),
        metadata: {
            userAgent: (application as any).userAgent,
            ipAddress: (application as any).ipAddress,
            sessionId: (application as any).sessionId,
            startedAt: (application as any).startedAt?.toISOString(),
            lastActivity: (application as any).lastActivity?.toISOString(),
            source: (application as any).source
        }
    };

    res.send(response);
});

const updateApplication = catchAsyncWithAuth(async (req, res) => {
    const applicationId = req.params.applicationId;
    const userId = req.user.id;
    const updateData = pick(req.body, ['currentStep', 'status', 'accountType', 'customerType']);

    const application = await applicationService.updateApplicationById(applicationId, userId, updateData);

    // Format response to match API specification
    const response = {
        id: application.id,
        status: application.status,
        currentStep: application.currentStep,
        accountType: application.accountType,
        customerType: application.customerType,
        applicantId: application.applicantId,
        submittedAt: application.submittedAt?.toISOString(),
        completedAt: application.completedAt?.toISOString(),
        createdAt: application.createdAt.toISOString(),
        updatedAt: application.updatedAt.toISOString(),
        metadata: {
            userAgent: application.userAgent,
            ipAddress: application.ipAddress,
            sessionId: application.sessionId,
            startedAt: application.startedAt?.toISOString(),
            lastActivity: application.lastActivity?.toISOString(),
            source: application.source
        }
    };

    res.send(response);
});

const submitApplication = catchAsyncWithAuth(async (req, res) => {
    const { applicationId, finalReview, electronicConsent } = req.body;
    const userId = req.user.id;

    const result = await applicationService.submitApplication(applicationId, userId, {
        finalReview,
        electronicConsent
    });

    res.send(result);
});

const getApplicationSummary = catchAsyncWithAuth(async (req, res) => {
    const applicationId = req.params.applicationId;
    const userId = req.user.role === 'ADMIN' ? undefined : req.user.id;

    const summary = await applicationService.getApplicationSummary(applicationId, userId);
    if (!summary) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Application not found');
    }

    res.send(summary);
});

const deleteApplication = catchAsyncWithAuth(async (req, res) => {
    const applicationId = req.params.applicationId;
    const userId = req.user.id;

    await applicationService.deleteApplicationById(applicationId, userId);
    res.status(httpStatus.NO_CONTENT).send();
});

export default {
    createApplication,
    getApplications,
    getApplication,
    updateApplication,
    submitApplication,
    getApplicationSummary,
    deleteApplication
};