import { businessProfileService } from '../services/index.ts';
import ApiError from '../utils/ApiError.ts';
import catchAsyncWithAuth from '../utils/catchAsyncWithAuth.ts';
import httpStatus from 'http-status';

const createOrUpdateBusinessProfile = catchAsyncWithAuth(async (req, res) => {
    const applicationId = req.params.applicationId;
    const userId = req.user.id;
    const businessData = req.body;

    const businessProfile = await businessProfileService.createOrUpdateBusinessProfile(
        applicationId,
        userId,
        businessData
    );

    // Format response to match API specification
    const response = {
        businessName: businessProfile.businessName,
        dbaName: businessProfile.dbaName,
        ein: businessProfile.ein,
        entityType: businessProfile.entityType,
        industryType: businessProfile.industryType,
        dateEstablished: businessProfile.dateEstablished,
        businessPhone: businessProfile.businessPhone,
        businessEmail: businessProfile.businessEmail,
        website: businessProfile.website,
        description: businessProfile.description,
        isCashIntensive: businessProfile.isCashIntensive,
        monthlyTransactionVolume: businessProfile.monthlyTransactionVolume,
        monthlyTransactionCount: businessProfile.monthlyTransactionCount,
        expectedBalance: businessProfile.expectedBalance,
        businessAddress: {
            street: businessProfile.businessStreet,
            city: businessProfile.businessCity,
            state: businessProfile.businessState,
            zipCode: businessProfile.businessZipCode,
            country: businessProfile.businessCountry,
            apartment: businessProfile.businessApartment
        },
        mailingAddress: businessProfile.mailingStreet ? {
            street: businessProfile.mailingStreet,
            city: businessProfile.mailingCity,
            state: businessProfile.mailingState,
            zipCode: businessProfile.mailingZipCode,
            country: businessProfile.mailingCountry,
            apartment: businessProfile.mailingApartment
        } : null
    };

    res.status(httpStatus.OK).send(response);
});

const getBusinessProfile = catchAsyncWithAuth(async (req, res) => {
    const applicationId = req.params.applicationId;
    const userId = req.user.id;

    const businessProfile = await businessProfileService.getBusinessProfileByApplicationId(
        applicationId,
        userId
    );

    if (!businessProfile) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Business profile not found');
    }

    // Format response to match API specification
    const response = {
        businessName: businessProfile.businessName,
        dbaName: businessProfile.dbaName,
        ein: businessProfile.ein,
        entityType: businessProfile.entityType,
        industryType: businessProfile.industryType,
        dateEstablished: businessProfile.dateEstablished,
        businessPhone: businessProfile.businessPhone,
        businessEmail: businessProfile.businessEmail,
        website: businessProfile.website,
        description: businessProfile.description,
        isCashIntensive: businessProfile.isCashIntensive,
        monthlyTransactionVolume: businessProfile.monthlyTransactionVolume,
        monthlyTransactionCount: businessProfile.monthlyTransactionCount,
        expectedBalance: businessProfile.expectedBalance,
        businessAddress: {
            street: businessProfile.businessStreet,
            city: businessProfile.businessCity,
            state: businessProfile.businessState,
            zipCode: businessProfile.businessZipCode,
            country: businessProfile.businessCountry,
            apartment: businessProfile.businessApartment
        },
        mailingAddress: businessProfile.mailingStreet ? {
            street: businessProfile.mailingStreet,
            city: businessProfile.mailingCity,
            state: businessProfile.mailingState,
            zipCode: businessProfile.mailingZipCode,
            country: businessProfile.mailingCountry,
            apartment: businessProfile.mailingApartment
        } : null
    };

    res.send(response);
});

const deleteBusinessProfile = catchAsyncWithAuth(async (req, res) => {
    const applicationId = req.params.applicationId;
    const userId = req.user.id;

    await businessProfileService.deleteBusinessProfileByApplicationId(applicationId, userId);
    res.status(httpStatus.NO_CONTENT).send();
});

export default {
    createOrUpdateBusinessProfile,
    getBusinessProfile,
    deleteBusinessProfile
};