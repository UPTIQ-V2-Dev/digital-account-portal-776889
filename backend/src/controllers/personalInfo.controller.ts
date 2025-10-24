import { personalInfoService } from '../services/index.ts';
import ApiError from '../utils/ApiError.ts';
import catchAsyncWithAuth from '../utils/catchAsyncWithAuth.ts';
import httpStatus from 'http-status';

const createOrUpdatePersonalInfo = catchAsyncWithAuth(async (req, res) => {
    const applicationId = req.params.applicationId;
    const userId = req.user.id;
    const personalData = req.body;

    const personalInfo = await personalInfoService.createOrUpdatePersonalInfo(
        applicationId,
        userId,
        personalData
    );

    // Format response to match API specification
    const response = {
        firstName: personalInfo.firstName,
        middleName: personalInfo.middleName,
        lastName: personalInfo.lastName,
        suffix: personalInfo.suffix,
        dateOfBirth: personalInfo.dateOfBirth,
        ssn: personalInfo.ssn,
        phone: personalInfo.phone,
        email: personalInfo.email,
        employmentStatus: personalInfo.employmentStatus,
        occupation: personalInfo.occupation,
        employer: personalInfo.employer,
        workPhone: personalInfo.workPhone,
        mailingAddress: {
            street: personalInfo.mailingStreet,
            city: personalInfo.mailingCity,
            state: personalInfo.mailingState,
            zipCode: personalInfo.mailingZipCode,
            country: personalInfo.mailingCountry,
            apartment: personalInfo.mailingApartment
        },
        physicalAddress: personalInfo.physicalStreet ? {
            street: personalInfo.physicalStreet,
            city: personalInfo.physicalCity!,
            state: personalInfo.physicalState!,
            zipCode: personalInfo.physicalZipCode!,
            country: personalInfo.physicalCountry!,
            apartment: personalInfo.physicalApartment
        } : null
    };

    res.status(httpStatus.OK).send(response);
});

const getPersonalInfo = catchAsyncWithAuth(async (req, res) => {
    const applicationId = req.params.applicationId;
    const userId = req.user.id;

    const personalInfo = await personalInfoService.getPersonalInfoByApplicationId(
        applicationId,
        userId
    );

    if (!personalInfo) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Personal information not found');
    }

    // Format response to match API specification
    const response = {
        firstName: personalInfo.firstName,
        middleName: personalInfo.middleName,
        lastName: personalInfo.lastName,
        suffix: personalInfo.suffix,
        dateOfBirth: personalInfo.dateOfBirth,
        ssn: personalInfo.ssn,
        phone: personalInfo.phone,
        email: personalInfo.email,
        employmentStatus: personalInfo.employmentStatus,
        occupation: personalInfo.occupation,
        employer: personalInfo.employer,
        workPhone: personalInfo.workPhone,
        mailingAddress: {
            street: personalInfo.mailingStreet,
            city: personalInfo.mailingCity,
            state: personalInfo.mailingState,
            zipCode: personalInfo.mailingZipCode,
            country: personalInfo.mailingCountry,
            apartment: personalInfo.mailingApartment
        },
        physicalAddress: personalInfo.physicalStreet ? {
            street: personalInfo.physicalStreet,
            city: personalInfo.physicalCity!,
            state: personalInfo.physicalState!,
            zipCode: personalInfo.physicalZipCode!,
            country: personalInfo.physicalCountry!,
            apartment: personalInfo.physicalApartment
        } : null
    };

    res.send(response);
});

const deletePersonalInfo = catchAsyncWithAuth(async (req, res) => {
    const applicationId = req.params.applicationId;
    const userId = req.user.id;

    await personalInfoService.deletePersonalInfoByApplicationId(applicationId, userId);
    res.status(httpStatus.NO_CONTENT).send();
});

export default {
    createOrUpdatePersonalInfo,
    getPersonalInfo,
    deletePersonalInfo
};