import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import httpStatus from 'http-status';
import express from 'express';
import personalInfoController from '../personalInfo.controller.ts';
import { personalInfoService } from '../../services/index.ts';
import ApiError from '../../utils/ApiError.ts';

// Mock the service
vi.mock('../../services/index.ts', () => ({
    personalInfoService: {
        createOrUpdatePersonalInfo: vi.fn(),
        getPersonalInfoByApplicationId: vi.fn(),
        deletePersonalInfoByApplicationId: vi.fn(),
    },
}));

const mockPersonalInfoService = personalInfoService as any;

// Create express app for testing
const app = express();
app.use(express.json());

// Mock auth middleware - adds user to req
const mockAuth = (req: any, res: any, next: any) => {
    req.user = { id: 1, email: 'test@example.com' };
    next();
};

app.use(mockAuth);

// Setup routes
app.put('/personal-info/:applicationId', personalInfoController.createOrUpdatePersonalInfo);
app.get('/personal-info/:applicationId', personalInfoController.getPersonalInfo);
app.delete('/personal-info/:applicationId', personalInfoController.deletePersonalInfo);

describe('Personal Info Controller', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockPersonalInfoData = {
        firstName: 'John',
        middleName: 'Michael',
        lastName: 'Doe',
        suffix: 'Jr.',
        dateOfBirth: '1990-01-15',
        ssn: '123-45-6789',
        phone: '555-123-4567',
        email: 'john@example.com',
        employmentStatus: 'employed',
        occupation: 'Software Engineer',
        employer: 'Tech Corp',
        workPhone: '555-999-8888',
        mailingAddress: {
            street: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            zipCode: '12345',
            country: 'US',
            apartment: 'Apt 2B'
        },
        physicalAddress: {
            street: '456 Oak Ave',
            city: 'Other City',
            state: 'NY',
            zipCode: '54321',
            country: 'US'
        }
    };

    const mockPersonalInfoResponse = {
        id: 'pi_test_123',
        applicationId: 'app_test_123',
        firstName: 'John',
        middleName: 'Michael',
        lastName: 'Doe',
        suffix: 'Jr.',
        dateOfBirth: '1990-01-15',
        ssn: '123-45-6789',
        phone: '555-123-4567',
        email: 'john@example.com',
        employmentStatus: 'employed',
        occupation: 'Software Engineer',
        employer: 'Tech Corp',
        workPhone: '555-999-8888',
        mailingStreet: '123 Main St',
        mailingCity: 'Anytown',
        mailingState: 'CA',
        mailingZipCode: '12345',
        mailingCountry: 'US',
        mailingApartment: 'Apt 2B',
        physicalStreet: '456 Oak Ave',
        physicalCity: 'Other City',
        physicalState: 'NY',
        physicalZipCode: '54321',
        physicalCountry: 'US',
        physicalApartment: null
    };

    const expectedFormattedResponse = {
        firstName: 'John',
        middleName: 'Michael',
        lastName: 'Doe',
        suffix: 'Jr.',
        dateOfBirth: '1990-01-15',
        ssn: '123-45-6789',
        phone: '555-123-4567',
        email: 'john@example.com',
        employmentStatus: 'employed',
        occupation: 'Software Engineer',
        employer: 'Tech Corp',
        workPhone: '555-999-8888',
        mailingAddress: {
            street: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            zipCode: '12345',
            country: 'US',
            apartment: 'Apt 2B'
        },
        physicalAddress: {
            street: '456 Oak Ave',
            city: 'Other City',
            state: 'NY',
            zipCode: '54321',
            country: 'US',
            apartment: null
        }
    };

    describe('PUT /personal-info/:applicationId', () => {
        it('should create personal info successfully', async () => {
            mockPersonalInfoService.createOrUpdatePersonalInfo.mockResolvedValue(mockPersonalInfoResponse);

            const response = await request(app)
                .put('/personal-info/app_test_123')
                .send(mockPersonalInfoData)
                .expect(httpStatus.OK);

            expect(response.body).toEqual(expectedFormattedResponse);
            expect(mockPersonalInfoService.createOrUpdatePersonalInfo).toHaveBeenCalledWith(
                'app_test_123',
                1,
                mockPersonalInfoData
            );
        });

        it('should update existing personal info successfully', async () => {
            const updatedResponse = { ...mockPersonalInfoResponse, firstName: 'Jane' };
            const updatedData = { ...mockPersonalInfoData, firstName: 'Jane' };

            mockPersonalInfoService.createOrUpdatePersonalInfo.mockResolvedValue(updatedResponse);

            const response = await request(app)
                .put('/personal-info/app_test_123')
                .send(updatedData)
                .expect(httpStatus.OK);

            expect(response.body.firstName).toBe('Jane');
            expect(mockPersonalInfoService.createOrUpdatePersonalInfo).toHaveBeenCalledWith(
                'app_test_123',
                1,
                updatedData
            );
        });

        it('should format response correctly without physical address', async () => {
            const responseWithoutPhysical = { ...mockPersonalInfoResponse };
            (responseWithoutPhysical as any).physicalStreet = null;
            (responseWithoutPhysical as any).physicalCity = null;
            (responseWithoutPhysical as any).physicalState = null;
            (responseWithoutPhysical as any).physicalZipCode = null;
            (responseWithoutPhysical as any).physicalCountry = null;
            responseWithoutPhysical.physicalApartment = null;

            mockPersonalInfoService.createOrUpdatePersonalInfo.mockResolvedValue(responseWithoutPhysical);

            const response = await request(app)
                .put('/personal-info/app_test_123')
                .send(mockPersonalInfoData)
                .expect(httpStatus.OK);

            expect(response.body.physicalAddress).toBeNull();
        });

        it('should handle service errors', async () => {
            mockPersonalInfoService.createOrUpdatePersonalInfo.mockRejectedValue(
                new ApiError(httpStatus.BAD_REQUEST, 'Invalid SSN format')
            );

            await request(app)
                .put('/personal-info/app_test_123')
                .send(mockPersonalInfoData)
                .expect(httpStatus.BAD_REQUEST);
        });

        it('should handle application not found error', async () => {
            mockPersonalInfoService.createOrUpdatePersonalInfo.mockRejectedValue(
                new ApiError(httpStatus.NOT_FOUND, 'Application not found')
            );

            await request(app)
                .put('/personal-info/app_test_123')
                .send(mockPersonalInfoData)
                .expect(httpStatus.NOT_FOUND);
        });
    });

    describe('GET /personal-info/:applicationId', () => {
        it('should get personal info successfully', async () => {
            mockPersonalInfoService.getPersonalInfoByApplicationId.mockResolvedValue(mockPersonalInfoResponse);

            const response = await request(app)
                .get('/personal-info/app_test_123')
                .expect(httpStatus.OK);

            expect(response.body).toEqual(expectedFormattedResponse);
            expect(mockPersonalInfoService.getPersonalInfoByApplicationId).toHaveBeenCalledWith(
                'app_test_123',
                1
            );
        });

        it('should handle personal info not found', async () => {
            mockPersonalInfoService.getPersonalInfoByApplicationId.mockResolvedValue(null);

            await request(app)
                .get('/personal-info/app_test_123')
                .expect(httpStatus.NOT_FOUND);

            expect(mockPersonalInfoService.getPersonalInfoByApplicationId).toHaveBeenCalledWith(
                'app_test_123',
                1
            );
        });

        it('should format response correctly without physical address', async () => {
            const responseWithoutPhysical = { ...mockPersonalInfoResponse };
            (responseWithoutPhysical as any).physicalStreet = null;
            (responseWithoutPhysical as any).physicalCity = null;
            (responseWithoutPhysical as any).physicalState = null;
            (responseWithoutPhysical as any).physicalZipCode = null;
            (responseWithoutPhysical as any).physicalCountry = null;

            mockPersonalInfoService.getPersonalInfoByApplicationId.mockResolvedValue(responseWithoutPhysical);

            const response = await request(app)
                .get('/personal-info/app_test_123')
                .expect(httpStatus.OK);

            expect(response.body.physicalAddress).toBeNull();
        });

        it('should handle service errors', async () => {
            mockPersonalInfoService.getPersonalInfoByApplicationId.mockRejectedValue(
                new ApiError(httpStatus.NOT_FOUND, 'Application not found')
            );

            await request(app)
                .get('/personal-info/app_test_123')
                .expect(httpStatus.NOT_FOUND);
        });
    });

    describe('DELETE /personal-info/:applicationId', () => {
        it('should delete personal info successfully', async () => {
            mockPersonalInfoService.deletePersonalInfoByApplicationId.mockResolvedValue(mockPersonalInfoResponse);

            await request(app)
                .delete('/personal-info/app_test_123')
                .expect(httpStatus.NO_CONTENT);

            expect(mockPersonalInfoService.deletePersonalInfoByApplicationId).toHaveBeenCalledWith(
                'app_test_123',
                1
            );
        });

        it('should handle service errors', async () => {
            mockPersonalInfoService.deletePersonalInfoByApplicationId.mockRejectedValue(
                new ApiError(httpStatus.NOT_FOUND, 'Personal information not found')
            );

            await request(app)
                .delete('/personal-info/app_test_123')
                .expect(httpStatus.NOT_FOUND);
        });

        it('should handle application not found error', async () => {
            mockPersonalInfoService.deletePersonalInfoByApplicationId.mockRejectedValue(
                new ApiError(httpStatus.NOT_FOUND, 'Application not found')
            );

            await request(app)
                .delete('/personal-info/app_test_123')
                .expect(httpStatus.NOT_FOUND);
        });
    });
});