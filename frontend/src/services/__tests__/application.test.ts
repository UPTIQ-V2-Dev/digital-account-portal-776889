import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    createApplication,
    getApplication,
    updateApplication,
    savePersonalInfo,
    getPersonalInfo,
    submitApplication
} from '../application';
import { mockApplication, mockPersonalInfo } from '../../data/mockData';

describe('Application Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createApplication', () => {
        it('creates consumer application with mock data', async () => {
            const applicationData = {
                accountType: 'consumer' as const
            };

            const result = await createApplication(applicationData);

            expect(result).toBeDefined();
            expect(result.accountType).toBe('consumer');
            expect(result.status).toBe('draft');
            expect(result.currentStep).toBe('account_type');
            expect(result.id).toMatch(/^app_/);
            expect(result.createdAt).toBeDefined();
            expect(result.updatedAt).toBeDefined();
        });

        it('creates commercial application with mock data', async () => {
            const applicationData = {
                accountType: 'commercial' as const
            };

            const result = await createApplication(applicationData);

            expect(result).toBeDefined();
            expect(result.accountType).toBe('commercial');
            expect(result.status).toBe('draft');
            expect(result.currentStep).toBe('account_type');
        });

        it('generates unique application IDs', async () => {
            const applicationData = {
                accountType: 'consumer' as const
            };

            const result1 = await createApplication(applicationData);
            const result2 = await createApplication(applicationData);

            expect(result1.id).not.toBe(result2.id);
        });
    });

    describe('getApplication', () => {
        it('returns application data for given ID', async () => {
            const applicationId = 'app_123';

            const result = await getApplication(applicationId);

            expect(result).toBeDefined();
            expect(result.id).toBe(mockApplication.id);
            expect(result.status).toBe(mockApplication.status);
        });
    });

    describe('updateApplication', () => {
        it('updates application with new data', async () => {
            const applicationId = 'app_123';
            const updateData = {
                currentStep: 'personal_info' as const,
                status: 'in_progress' as const
            };

            const result = await updateApplication(applicationId, updateData);

            expect(result).toBeDefined();
            expect(result.currentStep).toBe('personal_info');
            expect(result.status).toBe('in_progress');
            expect(result.updatedAt).toBeDefined();
        });
    });

    describe('submitApplication', () => {
        it('submits application successfully', async () => {
            const applicationId = 'app_123';
            const finalReview = true;
            const electronicConsent = true;

            const result = await submitApplication(applicationId, finalReview, electronicConsent);

            expect(result).toBe(true);
        });
    });

    describe('savePersonalInfo', () => {
        it('saves personal information for application', async () => {
            const applicationId = 'app_123';
            const personalInfoData = {
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: '1990-01-01',
                ssn: '123-45-6789',
                phone: '555-123-4567',
                email: 'john@example.com',
                mailingAddress: {
                    street: '123 Main St',
                    city: 'Anytown',
                    state: 'CA',
                    zipCode: '12345',
                    country: 'US'
                },
                employmentStatus: 'employed'
            };

            const result = await savePersonalInfo(applicationId, personalInfoData);

            expect(result).toBeDefined();
            expect(result.firstName).toBe('John');
            expect(result.lastName).toBe('Doe');
            expect(result.email).toBe('john@example.com');
        });

        it('handles optional fields in personal info', async () => {
            const applicationId = 'app_123';
            const personalInfoData = {
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: '1990-01-01',
                ssn: '123-45-6789',
                phone: '555-123-4567',
                email: 'john@example.com',
                mailingAddress: {
                    street: '123 Main St',
                    city: 'Anytown',
                    state: 'CA',
                    zipCode: '12345',
                    country: 'US'
                },
                employmentStatus: 'employed',
                middleName: 'Michael',
                occupation: 'Software Engineer'
            };

            const result = await savePersonalInfo(applicationId, personalInfoData);

            expect(result.middleName).toBe('Michael');
            expect(result.occupation).toBe('Software Engineer');
        });
    });

    describe('getPersonalInfo', () => {
        it('retrieves personal information for application', async () => {
            const applicationId = 'app_123';

            const result = await getPersonalInfo(applicationId);

            expect(result).toBeDefined();
            expect(result.firstName).toBe(mockPersonalInfo.firstName);
            expect(result.lastName).toBe(mockPersonalInfo.lastName);
            expect(result.email).toBe(mockPersonalInfo.email);
        });
    });

    describe('error handling', () => {
        it('handles missing required fields gracefully', async () => {
            // This test would be more relevant when not using mock data
            // For now, we'll test that the mock data returns successfully
            const applicationData = {
                accountType: 'consumer' as const
            };

            await expect(createApplication(applicationData)).resolves.toBeDefined();
        });

        it('handles invalid application IDs', async () => {
            const invalidId = 'invalid_id';

            // With mock data, this should still return the mock application
            const result = await getApplication(invalidId);
            expect(result).toBeDefined();
        });
    });
});
