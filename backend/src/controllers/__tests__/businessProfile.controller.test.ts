import { describe, it, expect, beforeEach, vi } from 'vitest';
import businessProfileController from '../businessProfile.controller.ts';
import { businessProfileService } from '../../services/index.ts';
import ApiError from '../../utils/ApiError.ts';
import httpStatus from 'http-status';

// Mock services
vi.mock('../../services/index.ts', () => ({
    businessProfileService: {
        createOrUpdateBusinessProfile: vi.fn(),
        getBusinessProfileByApplicationId: vi.fn(),
        deleteBusinessProfileByApplicationId: vi.fn(),
    },
}));

// Mock catchAsyncWithAuth utility
vi.mock('../../utils/catchAsyncWithAuth.ts', () => ({
    default: (fn: any) => fn,
}));

const mockBusinessProfileService = businessProfileService as any;

describe('Business Profile Controller', () => {
    let mockRequest: any;
    let mockResponse: any;
    let mockNext: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockRequest = {
            params: { applicationId: 'app_test_123' },
            body: {},
            user: { id: 1, role: 'USER' }
        };

        mockResponse = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn().mockReturnThis(),
        };

        mockNext = vi.fn();
    });

    const mockBusinessProfile = {
        id: 'bp_test_123',
        applicationId: 'app_test_123',
        businessName: 'Test Corp',
        dbaName: 'Test Solutions',
        ein: '12-3456789',
        entityType: 'corporation',
        industryType: 'Technology',
        dateEstablished: '2020-01-01',
        businessPhone: '555-987-6543',
        businessEmail: 'info@testcorp.com',
        website: 'https://testcorp.com',
        description: 'Technology consulting services',
        isCashIntensive: false,
        monthlyTransactionVolume: 50000,
        monthlyTransactionCount: 100,
        expectedBalance: 25000,
        businessStreet: '456 Business Blvd',
        businessCity: 'Business City',
        businessState: 'CA',
        businessZipCode: '54321',
        businessCountry: 'US',
        businessApartment: 'Suite 100',
        mailingStreet: '789 Mail St',
        mailingCity: 'Mail City',
        mailingState: 'NY',
        mailingZipCode: '12345',
        mailingCountry: 'US',
        mailingApartment: 'Box 1'
    };

    const expectedResponse = {
        businessName: 'Test Corp',
        dbaName: 'Test Solutions',
        ein: '12-3456789',
        entityType: 'corporation',
        industryType: 'Technology',
        dateEstablished: '2020-01-01',
        businessPhone: '555-987-6543',
        businessEmail: 'info@testcorp.com',
        website: 'https://testcorp.com',
        description: 'Technology consulting services',
        isCashIntensive: false,
        monthlyTransactionVolume: 50000,
        monthlyTransactionCount: 100,
        expectedBalance: 25000,
        businessAddress: {
            street: '456 Business Blvd',
            city: 'Business City',
            state: 'CA',
            zipCode: '54321',
            country: 'US',
            apartment: 'Suite 100'
        },
        mailingAddress: {
            street: '789 Mail St',
            city: 'Mail City',
            state: 'NY',
            zipCode: '12345',
            country: 'US',
            apartment: 'Box 1'
        }
    };

    const validBusinessData = {
        businessName: 'Test Corp',
        dbaName: 'Test Solutions',
        ein: '12-3456789',
        entityType: 'corporation',
        industryType: 'Technology',
        dateEstablished: '2020-01-01',
        businessPhone: '555-987-6543',
        businessEmail: 'info@testcorp.com',
        website: 'https://testcorp.com',
        description: 'Technology consulting services',
        isCashIntensive: false,
        monthlyTransactionVolume: 50000,
        monthlyTransactionCount: 100,
        expectedBalance: 25000,
        businessAddress: {
            street: '456 Business Blvd',
            city: 'Business City',
            state: 'CA',
            zipCode: '54321',
            country: 'US',
            apartment: 'Suite 100'
        },
        mailingAddress: {
            street: '789 Mail St',
            city: 'Mail City',
            state: 'NY',
            zipCode: '12345',
            country: 'US',
            apartment: 'Box 1'
        }
    };

    describe('createOrUpdateBusinessProfile', () => {
        it('should create business profile successfully', async () => {
            mockRequest.body = validBusinessData;
            mockBusinessProfileService.createOrUpdateBusinessProfile.mockResolvedValue(mockBusinessProfile);

            await businessProfileController.createOrUpdateBusinessProfile(mockRequest, mockResponse, mockNext);

            expect(mockBusinessProfileService.createOrUpdateBusinessProfile).toHaveBeenCalledWith(
                'app_test_123',
                1,
                validBusinessData
            );
            expect(mockResponse.status).toHaveBeenCalledWith(httpStatus.OK);
            expect(mockResponse.send).toHaveBeenCalledWith(expectedResponse);
        });

        it('should handle business profile without mailing address', async () => {
            const profileWithoutMailing = { ...mockBusinessProfile, mailingStreet: null };
            const expectedWithoutMailing = { ...expectedResponse, mailingAddress: null };

            mockRequest.body = validBusinessData;
            mockBusinessProfileService.createOrUpdateBusinessProfile.mockResolvedValue(profileWithoutMailing);

            await businessProfileController.createOrUpdateBusinessProfile(mockRequest, mockResponse, mockNext);

            expect(mockResponse.send).toHaveBeenCalledWith(expectedWithoutMailing);
        });

        it('should handle service errors', async () => {
            mockRequest.body = validBusinessData;
            const error = new ApiError(httpStatus.BAD_REQUEST, 'Invalid EIN format');
            mockBusinessProfileService.createOrUpdateBusinessProfile.mockRejectedValue(error);

            await expect(
                businessProfileController.createOrUpdateBusinessProfile(mockRequest, mockResponse, mockNext)
            ).rejects.toThrow(error);
        });
    });

    describe('getBusinessProfile', () => {
        it('should get business profile successfully', async () => {
            mockBusinessProfileService.getBusinessProfileByApplicationId.mockResolvedValue(mockBusinessProfile);

            await businessProfileController.getBusinessProfile(mockRequest, mockResponse, mockNext);

            expect(mockBusinessProfileService.getBusinessProfileByApplicationId).toHaveBeenCalledWith(
                'app_test_123',
                1
            );
            expect(mockResponse.send).toHaveBeenCalledWith(expectedResponse);
        });

        it('should handle business profile without mailing address', async () => {
            const profileWithoutMailing = { ...mockBusinessProfile, mailingStreet: null };
            const expectedWithoutMailing = { ...expectedResponse, mailingAddress: null };

            mockBusinessProfileService.getBusinessProfileByApplicationId.mockResolvedValue(profileWithoutMailing);

            await businessProfileController.getBusinessProfile(mockRequest, mockResponse, mockNext);

            expect(mockResponse.send).toHaveBeenCalledWith(expectedWithoutMailing);
        });

        it('should throw error when business profile not found', async () => {
            mockBusinessProfileService.getBusinessProfileByApplicationId.mockResolvedValue(null);

            await expect(
                businessProfileController.getBusinessProfile(mockRequest, mockResponse, mockNext)
            ).rejects.toThrow(new ApiError(httpStatus.NOT_FOUND, 'Business profile not found'));
        });

        it('should handle service errors', async () => {
            const error = new ApiError(httpStatus.NOT_FOUND, 'Application not found');
            mockBusinessProfileService.getBusinessProfileByApplicationId.mockRejectedValue(error);

            await expect(
                businessProfileController.getBusinessProfile(mockRequest, mockResponse, mockNext)
            ).rejects.toThrow(error);
        });
    });

    describe('deleteBusinessProfile', () => {
        it('should delete business profile successfully', async () => {
            mockBusinessProfileService.deleteBusinessProfileByApplicationId.mockResolvedValue(mockBusinessProfile);

            await businessProfileController.deleteBusinessProfile(mockRequest, mockResponse, mockNext);

            expect(mockBusinessProfileService.deleteBusinessProfileByApplicationId).toHaveBeenCalledWith(
                'app_test_123',
                1
            );
            expect(mockResponse.status).toHaveBeenCalledWith(httpStatus.NO_CONTENT);
            expect(mockResponse.send).toHaveBeenCalledWith();
        });

        it('should handle service errors', async () => {
            const error = new ApiError(httpStatus.NOT_FOUND, 'Business profile not found');
            mockBusinessProfileService.deleteBusinessProfileByApplicationId.mockRejectedValue(error);

            await expect(
                businessProfileController.deleteBusinessProfile(mockRequest, mockResponse, mockNext)
            ).rejects.toThrow(error);
        });
    });
});