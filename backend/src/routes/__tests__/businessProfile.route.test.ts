import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import businessProfileRoute from '../v1/businessProfile.route.ts';
import { businessProfileService } from '../../services/index.ts';
import httpStatus from 'http-status';

// Mock middlewares first
vi.mock('../../middlewares/auth.ts', () => ({
    default: vi.fn(() => (req: any, res: any, next: any) => {
        req.user = { id: 1, role: 'USER' };
        next();
    })
}));

vi.mock('../../middlewares/validate.ts', () => ({
    default: vi.fn(() => (req: any, res: any, next: any) => {
        req.params.applicationId = 'app_test_123';
        next();
    })
}));

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

// Create test app
const app = express();
app.use(express.json());

// Set up routes with applicationId parameter
app.use('/:applicationId/business-profile', businessProfileRoute);

describe('Business Profile Routes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
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

    describe('PUT /:applicationId/business-profile', () => {
        it('should create/update business profile successfully', async () => {
            mockBusinessProfileService.createOrUpdateBusinessProfile.mockResolvedValue(mockBusinessProfile);

            const response = await request(app)
                .put('/app_test_123/business-profile')
                .send(validBusinessData)
                .expect(httpStatus.OK);

            expect(response.body).toEqual(expectedResponse);
        });

        it('should handle service errors', async () => {
            mockBusinessProfileService.createOrUpdateBusinessProfile.mockRejectedValue(
                new Error('Service error')
            );

            await request(app)
                .put('/app_test_123/business-profile')
                .send(validBusinessData)
                .expect(httpStatus.INTERNAL_SERVER_ERROR);
        });

        it('should handle business profile without mailing address', async () => {
            const profileWithoutMailing = { ...mockBusinessProfile, mailingStreet: null };
            const expectedWithoutMailing = { ...expectedResponse, mailingAddress: null };

            mockBusinessProfileService.createOrUpdateBusinessProfile.mockResolvedValue(profileWithoutMailing);

            const response = await request(app)
                .put('/app_test_123/business-profile')
                .send(validBusinessData)
                .expect(httpStatus.OK);

            expect(response.body).toEqual(expectedWithoutMailing);
        });
    });

    describe('GET /:applicationId/business-profile', () => {
        it('should get business profile successfully', async () => {
            mockBusinessProfileService.getBusinessProfileByApplicationId.mockResolvedValue(mockBusinessProfile);

            const response = await request(app)
                .get('/app_test_123/business-profile')
                .expect(httpStatus.OK);

            expect(response.body).toEqual(expectedResponse);
        });

        it('should return 404 when business profile not found', async () => {
            mockBusinessProfileService.getBusinessProfileByApplicationId.mockResolvedValue(null);

            await request(app)
                .get('/app_test_123/business-profile')
                .expect(httpStatus.NOT_FOUND);
        });

        it('should handle business profile without mailing address', async () => {
            const profileWithoutMailing = { ...mockBusinessProfile, mailingStreet: null };
            const expectedWithoutMailing = { ...expectedResponse, mailingAddress: null };

            mockBusinessProfileService.getBusinessProfileByApplicationId.mockResolvedValue(profileWithoutMailing);

            const response = await request(app)
                .get('/app_test_123/business-profile')
                .expect(httpStatus.OK);

            expect(response.body).toEqual(expectedWithoutMailing);
        });

        it('should handle service errors', async () => {
            mockBusinessProfileService.getBusinessProfileByApplicationId.mockRejectedValue(
                new Error('Service error')
            );

            await request(app)
                .get('/app_test_123/business-profile')
                .expect(httpStatus.INTERNAL_SERVER_ERROR);
        });
    });

    describe('DELETE /:applicationId/business-profile', () => {
        it('should delete business profile successfully', async () => {
            mockBusinessProfileService.deleteBusinessProfileByApplicationId.mockResolvedValue(mockBusinessProfile);

            await request(app)
                .delete('/app_test_123/business-profile')
                .expect(httpStatus.NO_CONTENT);
        });

        it('should handle service errors', async () => {
            mockBusinessProfileService.deleteBusinessProfileByApplicationId.mockRejectedValue(
                new Error('Service error')
            );

            await request(app)
                .delete('/app_test_123/business-profile')
                .expect(httpStatus.INTERNAL_SERVER_ERROR);
        });
    });
});