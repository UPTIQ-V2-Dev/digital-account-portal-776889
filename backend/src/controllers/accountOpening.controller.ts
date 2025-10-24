import { accountOpeningService } from '../services/index.ts';
import ApiError from '../utils/ApiError.ts';
import catchAsyncWithAuth from '../utils/catchAsyncWithAuth.ts';
import { validateFileSize } from '../utils/fileStorage.ts';
import httpStatus from 'http-status';

const createApplication = catchAsyncWithAuth(async (req, res) => {
    const { accountType, personalInfo, businessProfile } = req.body;

    // Extract metadata from request
    const metadata = {
        userAgent: req.get('User-Agent') || 'unknown',
        ipAddress: req.ip || '0.0.0.0',
        sessionId: 'session_' + Date.now(),
        source: 'api'
    };

    const application = await accountOpeningService.createApplication(
        req.user.id,
        accountType,
        personalInfo,
        businessProfile,
        metadata
    );

    res.status(httpStatus.CREATED).send(application);
});

const getApplication = catchAsyncWithAuth(async (req, res) => {
    const { applicationId } = req.params;

    const application = await accountOpeningService.getApplicationById(applicationId, req.user.id);

    res.send(application);
});

const updateApplication = catchAsyncWithAuth(async (req, res) => {
    const { applicationId } = req.params;

    // Extract metadata from request
    const updateData = {
        ...req.body,
        metadata: {
            userAgent: req.get('User-Agent') || 'unknown',
            ipAddress: req.ip || '0.0.0.0'
        }
    };

    const application = await accountOpeningService.updateApplicationById(applicationId, updateData, req.user.id);

    res.send(application);
});

const submitApplication = catchAsyncWithAuth(async (req, res) => {
    const { applicationId, finalReview, electronicConsent } = req.body;

    const result = await accountOpeningService.submitApplication(
        applicationId,
        req.user.id,
        finalReview,
        electronicConsent
    );

    res.send(result);
});

const getApplicationSummary = catchAsyncWithAuth(async (req, res) => {
    const { applicationId } = req.params;

    const summary = await accountOpeningService.getApplicationSummary(applicationId, req.user.id);

    res.send(summary);
});

const updatePersonalInfo = catchAsyncWithAuth(async (req, res) => {
    const { applicationId } = req.params;

    const personalInfo = await accountOpeningService.updatePersonalInfo(applicationId, req.body, req.user.id);

    res.send(personalInfo);
});

const getPersonalInfo = catchAsyncWithAuth(async (req, res) => {
    const { applicationId } = req.params;

    const personalInfo = await accountOpeningService.getPersonalInfo(applicationId, req.user.id);

    res.send(personalInfo);
});

const updateBusinessProfile = catchAsyncWithAuth(async (req, res) => {
    const { applicationId } = req.params;

    const businessProfile = await accountOpeningService.updateBusinessProfile(applicationId, req.body, req.user.id);

    res.send(businessProfile);
});

const getBusinessProfile = catchAsyncWithAuth(async (req, res) => {
    const { applicationId } = req.params;

    const businessProfile = await accountOpeningService.getBusinessProfile(applicationId, req.user.id);

    res.send(businessProfile);
});

const updateFinancialProfile = catchAsyncWithAuth(async (req, res) => {
    const { applicationId } = req.params;

    const financialProfile = await accountOpeningService.updateFinancialProfile(applicationId, req.body, req.user.id);

    res.send(financialProfile);
});

const getFinancialProfile = catchAsyncWithAuth(async (req, res) => {
    const { applicationId } = req.params;

    const financialProfile = await accountOpeningService.getFinancialProfile(applicationId, req.user.id);

    res.send(financialProfile);
});

const getProducts = catchAsyncWithAuth(async (req, res) => {
    const products = await accountOpeningService.getProducts();

    res.send(products);
});

const getEligibleProducts = catchAsyncWithAuth(async (req, res) => {
    const { applicationId } = req.params;

    const products = await accountOpeningService.getEligibleProducts(applicationId, req.user.id);

    res.send(products);
});

const updateProductSelections = catchAsyncWithAuth(async (req, res) => {
    const { applicationId } = req.params;
    const { selections } = req.body;

    const productSelections = await accountOpeningService.updateProductSelections(
        applicationId,
        selections,
        req.user.id
    );

    res.send(productSelections);
});

const uploadDocument = catchAsyncWithAuth(async (req, res) => {
    const file = req.file as Express.Multer.File | undefined;
    const { documentType, applicationId } = req.body;

    // Check if file exists (Multer might not populate req.file in case of errors)
    if (!file) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'No file uploaded');
    }

    // Validate file size
    validateFileSize(file.size);

    const document = await accountOpeningService.uploadDocument(applicationId, documentType, file, req.user.id);

    res.status(httpStatus.OK).send(document);
});

const getDocuments = catchAsyncWithAuth(async (req, res) => {
    const { applicationId } = req.params;

    const documents = await accountOpeningService.getDocumentsByApplicationId(applicationId, req.user.id);

    res.status(httpStatus.OK).send(documents);
});

const deleteDocument = catchAsyncWithAuth(async (req, res) => {
    const { documentId } = req.params;

    await accountOpeningService.deleteDocumentById(documentId, req.user.id);

    res.status(httpStatus.NO_CONTENT).send();
});

const initiateKYCVerification = catchAsyncWithAuth(async (req, res) => {
    const { applicationId } = req.params;

    const kycVerification = await accountOpeningService.initiateKYCVerification(applicationId, req.user.id);

    res.status(httpStatus.OK).send(kycVerification);
});

const getKYCVerificationStatus = catchAsyncWithAuth(async (req, res) => {
    const { applicationId } = req.params;

    const kycVerification = await accountOpeningService.getKYCVerificationStatus(applicationId, req.user.id);

    res.status(httpStatus.OK).send(kycVerification);
});

const performRiskAssessment = catchAsyncWithAuth(async (req, res) => {
    const { applicationId } = req.params;

    const riskAssessment = await accountOpeningService.performRiskAssessment(applicationId, req.user.id);

    res.status(httpStatus.OK).send(riskAssessment);
});

const getDisclosures = catchAsyncWithAuth(async (req, res) => {
    const { accountType } = req.validatedQuery;

    const disclosures = await accountOpeningService.getDisclosures(accountType);

    res.status(httpStatus.OK).send(disclosures);
});

const acknowledgeAgreement = catchAsyncWithAuth(async (req, res) => {
    const { applicationId, disclosureId } = req.body;

    // Extract metadata from request
    const ipAddress = req.ip || '0.0.0.0';
    const userAgent = req.get('User-Agent') || 'unknown';

    const agreement = await accountOpeningService.acknowledgeAgreement(
        applicationId,
        disclosureId,
        ipAddress,
        userAgent,
        req.user.id
    );

    res.status(httpStatus.OK).send(agreement);
});

const captureElectronicSignature = catchAsyncWithAuth(async (req, res) => {
    const { applicationId, signatureData, documentType, biometric } = req.body;

    // Extract metadata from request
    const ipAddress = req.ip || '0.0.0.0';
    const userAgent = req.get('User-Agent') || 'unknown';

    const signature = await accountOpeningService.captureElectronicSignature(
        applicationId,
        signatureData,
        documentType,
        ipAddress,
        userAgent,
        req.user.id,
        biometric
    );

    res.status(httpStatus.OK).send(signature);
});

const setupAccountFunding = catchAsyncWithAuth(async (req, res) => {
    const { applicationId } = req.params;
    const { method, amount, details } = req.body;

    const fundingSetup = await accountOpeningService.setupAccountFunding(
        applicationId,
        method,
        amount,
        details,
        req.user.id
    );

    res.status(httpStatus.OK).send(fundingSetup);
});

// Admin API Controllers
const getAdminApplications = catchAsyncWithAuth(async (req, res) => {
    const filters = req.validatedQuery;

    const applications = await accountOpeningService.getAdminApplications(filters);

    res.status(httpStatus.OK).send(applications);
});

const updateApplicationStatus = catchAsyncWithAuth(async (req, res) => {
    const { applicationId } = req.params;
    const { status, notes } = req.body;

    // Extract metadata from request
    const ipAddress = req.ip || '0.0.0.0';
    const userAgent = req.get('User-Agent') || 'unknown';

    const updatedApplication = await accountOpeningService.updateApplicationStatus(
        applicationId,
        status,
        notes,
        req.user.id.toString(),
        ipAddress,
        userAgent
    );

    res.status(httpStatus.OK).send(updatedApplication);
});

const getApplicationAudit = catchAsyncWithAuth(async (req, res) => {
    const { applicationId } = req.params;

    const auditTrail = await accountOpeningService.getApplicationAudit(applicationId);

    res.status(httpStatus.OK).send(auditTrail);
});

export default {
    createApplication,
    getApplication,
    updateApplication,
    submitApplication,
    getApplicationSummary,
    updatePersonalInfo,
    getPersonalInfo,
    updateBusinessProfile,
    getBusinessProfile,
    updateFinancialProfile,
    getFinancialProfile,
    getProducts,
    getEligibleProducts,
    updateProductSelections,
    uploadDocument,
    getDocuments,
    deleteDocument,
    initiateKYCVerification,
    getKYCVerificationStatus,
    performRiskAssessment,
    getDisclosures,
    acknowledgeAgreement,
    captureElectronicSignature,
    setupAccountFunding,
    // Admin controllers
    getAdminApplications,
    updateApplicationStatus,
    getApplicationAudit
};
