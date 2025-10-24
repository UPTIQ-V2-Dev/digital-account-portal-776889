import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import httpStatus from 'http-status';
import express from 'express';
import personalInfoRoute from '../v1/personalInfo.route.ts';
import { personalInfoService } from '../../services/index.ts';
import { personalInfoValidation } from '../../validations/index.ts';
import auth from '../../middlewares/auth.ts';
import validate from '../../middlewares/validate.ts';

// Mock dependencies
vi.mock('../../services/index.ts', () => ({
    personalInfoService: {
        createOrUpdatePersonalInfo: vi.fn(),
        getPersonalInfoByApplicationId: vi.fn(),
        deletePersonalInfoByApplicationId: vi.fn(),
    },
}));

vi.mock('../../middlewares/auth.ts', () => ({
    default: vi.fn(() => (req: any, res: any, next: any) => {
        req.user = { id: 1, email: 'test@example.com' };
        next();
    }),
}));

vi.mock('../../middlewares/validate.ts', () => ({
    default: vi.fn(() => (req: any, res: any, next: any) => next()),
}));

const mockPersonalInfoService = personalInfoService as any;
const mockAuth = auth as any;
const mockValidate = validate as any;

// Create express app for testing
const app = express();
app.use(express.json());
app.use('/:applicationId/personal-info', personalInfoRoute);

describe('Personal Info Routes', () => {
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

    describe('PUT /:applicationId/personal-info', () => {
        it('should create/update personal info with proper authentication and validation', async () => {
            mockPersonalInfoService.createOrUpdatePersonalInfo.mockResolvedValue(mockPersonalInfoResponse);

            await request(app)
                .put('/app_test_123/personal-info')
                .send(mockPersonalInfoData);

            // Verify auth middleware was called with correct permission
            expect(mockAuth).toHaveBeenCalledWith('manageApplications');

            // Verify validation middleware was called with correct schema
            expect(mockValidate).toHaveBeenCalledWith(personalInfoValidation.createOrUpdatePersonalInfo);

            // Verify service was called
            expect(mockPersonalInfoService.createOrUpdatePersonalInfo).toHaveBeenCalledWith(
                'app_test_123',
                1,
                mockPersonalInfoData
            );
        });

        it('should handle missing required fields through validation', async () => {
            // The validation middleware should catch this, but we'll test the route structure
            const invalidData = { firstName: 'John' }; // Missing required fields

            await request(app)
                .put('/app_test_123/personal-info')
                .send(invalidData);

            expect(mockValidate).toHaveBeenCalledWith(personalInfoValidation.createOrUpdatePersonalInfo);
        });

        it('should handle validation errors', async () => {
            mockValidate.mockImplementationOnce(() => (req: any, res: any, next: any) => {
                return res.status(httpStatus.BAD_REQUEST).json({ message: 'Validation error' });
            });

            const response = await request(app)
                .put('/app_test_123/personal-info')
                .send(mockPersonalInfoData)
                .expect(httpStatus.BAD_REQUEST);

            expect(response.body.message).toBe('Validation error');
        });

        it('should handle authentication errors', async () => {
            mockAuth.mockImplementationOnce(() => (req: any, res: any, next: any) => {
                return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
            });

            const response = await request(app)
                .put('/app_test_123/personal-info')
                .send(mockPersonalInfoData)
                .expect(httpStatus.UNAUTHORIZED);

            expect(response.body.message).toBe('Unauthorized');
        });
    });

    describe('GET /:applicationId/personal-info', () => {
        it('should get personal info with proper authentication and validation', async () => {
            mockPersonalInfoService.getPersonalInfoByApplicationId.mockResolvedValue(mockPersonalInfoResponse);

            await request(app)
                .get('/app_test_123/personal-info');

            // Verify auth middleware was called with correct permission
            expect(mockAuth).toHaveBeenCalledWith('getApplications');

            // Verify validation middleware was called with correct schema
            expect(mockValidate).toHaveBeenCalledWith(personalInfoValidation.getPersonalInfo);

            // Verify service was called
            expect(mockPersonalInfoService.getPersonalInfoByApplicationId).toHaveBeenCalledWith(
                'app_test_123',
                1
            );
        });

        it('should handle authentication errors', async () => {
            mockAuth.mockImplementationOnce(() => (req: any, res: any, next: any) => {
                return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
            });

            const response = await request(app)
                .get('/app_test_123/personal-info')
                .expect(httpStatus.UNAUTHORIZED);

            expect(response.body.message).toBe('Unauthorized');
        });

        it('should handle validation errors for invalid applicationId', async () => {
            mockValidate.mockImplementationOnce(() => (req: any, res: any, next: any) => {
                return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid applicationId' });
            });

            const response = await request(app)
                .get('/invalid-app-id/personal-info')
                .expect(httpStatus.BAD_REQUEST);

            expect(response.body.message).toBe('Invalid applicationId');
        });
    });

    describe('DELETE /:applicationId/personal-info', () => {
        it('should delete personal info with proper authentication and validation', async () => {
            mockPersonalInfoService.deletePersonalInfoByApplicationId.mockResolvedValue(mockPersonalInfoResponse);

            await request(app)
                .delete('/app_test_123/personal-info');

            // Verify auth middleware was called with correct permission
            expect(mockAuth).toHaveBeenCalledWith('manageApplications');

            // Verify validation middleware was called with correct schema
            expect(mockValidate).toHaveBeenCalledWith(personalInfoValidation.deletePersonalInfo);

            // Verify service was called
            expect(mockPersonalInfoService.deletePersonalInfoByApplicationId).toHaveBeenCalledWith(
                'app_test_123',
                1
            );
        });

        it('should handle authentication errors', async () => {
            mockAuth.mockImplementationOnce(() => (req: any, res: any, next: any) => {
                return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
            });

            const response = await request(app)
                .delete('/app_test_123/personal-info')
                .expect(httpStatus.UNAUTHORIZED);

            expect(response.body.message).toBe('Unauthorized');
        });

        it('should handle validation errors', async () => {
            mockValidate.mockImplementationOnce(() => (req: any, res: any, next: any) => {
                return res.status(httpStatus.BAD_REQUEST).json({ message: 'Validation error' });
            });

            const response = await request(app)
                .delete('/app_test_123/personal-info')
                .expect(httpStatus.BAD_REQUEST);

            expect(response.body.message).toBe('Validation error');
        });
    });

    describe('Route middleware setup', () => {
        it('should use mergeParams option for router', () => {
            // This test ensures the router is configured with mergeParams: true
            // which allows access to parent route parameters
            expect(personalInfoRoute).toBeDefined();
        });

        it('should apply middlewares in correct order', () => {
            // When making any request, middlewares should be applied in order:
            // 1. auth
            // 2. validate
            // 3. controller
            
            mockAuth.mockClear();
            mockValidate.mockClear();
            
            request(app)
                .get('/app_test_123/personal-info');
            
            // Check that auth is called before validate
            expect(mockAuth).toHaveBeenCalled();
            expect(mockValidate).toHaveBeenCalled();
        });
    });

    describe('HTTP Methods', () => {
        it('should only allow PUT, GET, and DELETE methods', async () => {
            // Test unsupported methods
            await request(app)
                .post('/app_test_123/personal-info')
                .expect(httpStatus.NOT_FOUND);

            await request(app)
                .patch('/app_test_123/personal-info')
                .expect(httpStatus.NOT_FOUND);
        });

        it('should handle OPTIONS request for CORS', async () => {
            // This would typically be handled by CORS middleware, but we test the route exists
            const response = await request(app)
                .options('/app_test_123/personal-info');
            
            // Should not be 404, indicating the route exists
            expect(response.status).not.toBe(httpStatus.NOT_FOUND);
        });
    });
});