import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Building2, User, ArrowRight, ArrowLeft } from 'lucide-react';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { LoadingSpinner } from '../components/ui/loading-spinner';

import { useApplication } from '../context/ApplicationContext';
import { useNotification } from '../context/NotificationContext';
import { createApplication } from '../services/application';
import { AccountType } from '../types/application';

export const ApplicationTypePage = () => {
    const navigate = useNavigate();
    const { setApplication, setCurrentStep } = useApplication();
    const { showError } = useNotification();
    const [selectedType, setSelectedType] = useState<AccountType | null>(null);

    const createApplicationMutation = useMutation({
        mutationFn: createApplication,
        onSuccess: application => {
            setApplication(application);
            setCurrentStep(application.accountType === 'consumer' ? 'personal_info' : 'business_profile');
            navigate(application.accountType === 'consumer' ? '/personal-info' : '/business-profile');
        },
        onError: (error: any) => {
            showError(error.message || 'Failed to create application. Please try again.');
        }
    });

    const handleAccountTypeSelect = (accountType: AccountType) => {
        setSelectedType(accountType);
    };

    const handleContinue = () => {
        if (!selectedType) return;

        createApplicationMutation.mutate({
            accountType: selectedType
        });
    };

    const handleBack = () => {
        navigate('/');
    };

    return (
        <div className='container mx-auto px-4 py-8 max-w-4xl'>
            <div className='text-center mb-8'>
                <h1 className='text-3xl font-bold text-gray-900 mb-2'>Choose Your Account Type</h1>
                <p className='text-gray-600'>Select the type of account that best fits your needs</p>
            </div>

            <div className='grid md:grid-cols-2 gap-8 mb-8'>
                {/* Consumer Account */}
                <Card
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        selectedType === 'consumer'
                            ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => handleAccountTypeSelect('consumer')}
                >
                    <CardHeader className='text-center pb-4'>
                        <div
                            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                                selectedType === 'consumer' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
                            }`}
                        >
                            <User className='h-8 w-8' />
                        </div>
                        <CardTitle className='text-xl'>Personal Banking</CardTitle>
                        <CardDescription>Perfect for individuals and families</CardDescription>
                    </CardHeader>
                    <CardContent className='pt-0'>
                        <div className='space-y-3'>
                            <div className='text-sm font-medium text-gray-900'>Account Features:</div>
                            <ul className='space-y-2 text-sm text-gray-600'>
                                <li className='flex items-start gap-2'>
                                    <span className='text-green-500 mt-0.5'>•</span>
                                    Personal checking and savings accounts
                                </li>
                                <li className='flex items-start gap-2'>
                                    <span className='text-green-500 mt-0.5'>•</span>
                                    Debit card and online banking
                                </li>
                                <li className='flex items-start gap-2'>
                                    <span className='text-green-500 mt-0.5'>•</span>
                                    Mobile check deposit and transfers
                                </li>
                                <li className='flex items-start gap-2'>
                                    <span className='text-green-500 mt-0.5'>•</span>
                                    Personal financial management tools
                                </li>
                            </ul>
                            <div className='pt-2 text-xs text-gray-500'>Minimum age: 18 years</div>
                        </div>
                    </CardContent>
                </Card>

                {/* Commercial Account */}
                <Card
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        selectedType === 'commercial'
                            ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => handleAccountTypeSelect('commercial')}
                >
                    <CardHeader className='text-center pb-4'>
                        <div
                            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                                selectedType === 'commercial' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
                            }`}
                        >
                            <Building2 className='h-8 w-8' />
                        </div>
                        <CardTitle className='text-xl'>Business Banking</CardTitle>
                        <CardDescription>Designed for businesses and organizations</CardDescription>
                    </CardHeader>
                    <CardContent className='pt-0'>
                        <div className='space-y-3'>
                            <div className='text-sm font-medium text-gray-900'>Account Features:</div>
                            <ul className='space-y-2 text-sm text-gray-600'>
                                <li className='flex items-start gap-2'>
                                    <span className='text-green-500 mt-0.5'>•</span>
                                    Business checking and savings accounts
                                </li>
                                <li className='flex items-start gap-2'>
                                    <span className='text-green-500 mt-0.5'>•</span>
                                    Multiple authorized signers
                                </li>
                                <li className='flex items-start gap-2'>
                                    <span className='text-green-500 mt-0.5'>•</span>
                                    Business debit cards and online banking
                                </li>
                                <li className='flex items-start gap-2'>
                                    <span className='text-green-500 mt-0.5'>•</span>
                                    Cash management and payroll services
                                </li>
                            </ul>
                            <div className='pt-2 text-xs text-gray-500'>Requires business documentation</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Action Buttons */}
            <div className='flex justify-between'>
                <Button
                    variant='outline'
                    onClick={handleBack}
                    className='flex items-center gap-2'
                >
                    <ArrowLeft className='h-4 w-4' />
                    Back to Welcome
                </Button>

                <Button
                    onClick={handleContinue}
                    disabled={!selectedType || createApplicationMutation.isPending}
                    className='flex items-center gap-2 min-w-32'
                >
                    {createApplicationMutation.isPending ? (
                        <LoadingSpinner size='sm' />
                    ) : (
                        <>
                            Continue
                            <ArrowRight className='h-4 w-4' />
                        </>
                    )}
                </Button>
            </div>

            {/* Regulatory Notice */}
            <div className='mt-12'>
                <Card className='bg-gray-50 border-gray-200'>
                    <CardHeader>
                        <CardTitle className='text-sm'>Important Information</CardTitle>
                    </CardHeader>
                    <CardContent className='pt-0'>
                        <p className='text-xs text-gray-600 leading-relaxed'>
                            To help the government fight the funding of terrorism and money laundering activities,
                            Federal law requires all financial institutions to obtain, verify, and record information
                            that identifies each person who opens an account. We will ask for your name, address, date
                            of birth, and other information that will allow us to identify you. We may also ask to see
                            your driver's license or other identifying documents.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
