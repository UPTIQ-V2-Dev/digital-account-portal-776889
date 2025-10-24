import { financialProfileService } from '../services/index.ts';
import ApiError from '../utils/ApiError.ts';
import catchAsyncWithAuth from '../utils/catchAsyncWithAuth.ts';
import httpStatus from 'http-status';

/**
 * Create or update financial profile for an application
 */
const createOrUpdateFinancialProfile = catchAsyncWithAuth(async (req, res) => {
    const { applicationId } = req.params;
    const userId = req.user.id;
    
    const result = await financialProfileService.createOrUpdateFinancialProfile(
        applicationId,
        userId,
        req.body
    );
    
    // Transform the response to match the API specification format
    const response = {
        annualIncome: result.annualIncome,
        incomeSource: result.incomeSource,
        employmentInfo: result.employmentInfo,
        assets: result.assets,
        liabilities: result.liabilities,
        bankingRelationships: result.bankingRelationships.map(br => ({
            bankName: br.bankName,
            accountTypes: br.accountTypes,
            yearsWithBank: br.yearsWithBank
        })),
        accountActivities: result.accountActivities.map(aa => ({
            activity: aa.activity,
            frequency: aa.frequency,
            amount: aa.amount
        }))
    };
    
    res.status(httpStatus.OK).send(response);
});

/**
 * Get financial profile for an application
 */
const getFinancialProfile = catchAsyncWithAuth(async (req, res) => {
    const { applicationId } = req.params;
    const userId = req.user.id;
    
    const result = await financialProfileService.getFinancialProfileByApplicationId(
        applicationId,
        userId
    );
    
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Financial profile not found');
    }
    
    // Transform the response to match the API specification format
    const response = {
        annualIncome: result.annualIncome,
        incomeSource: result.incomeSource,
        employmentInfo: result.employmentInfo,
        assets: result.assets,
        liabilities: result.liabilities,
        bankingRelationships: result.bankingRelationships.map(br => ({
            bankName: br.bankName,
            accountTypes: br.accountTypes,
            yearsWithBank: br.yearsWithBank
        })),
        accountActivities: result.accountActivities.map(aa => ({
            activity: aa.activity,
            frequency: aa.frequency,
            amount: aa.amount
        }))
    };
    
    res.status(httpStatus.OK).send(response);
});

/**
 * Delete financial profile for an application
 */
const deleteFinancialProfile = catchAsyncWithAuth(async (req, res) => {
    const { applicationId } = req.params;
    const userId = req.user.id;
    
    await financialProfileService.deleteFinancialProfileByApplicationId(
        applicationId,
        userId
    );
    
    res.status(httpStatus.NO_CONTENT).send();
});

export default {
    createOrUpdateFinancialProfile,
    getFinancialProfile,
    deleteFinancialProfile
};