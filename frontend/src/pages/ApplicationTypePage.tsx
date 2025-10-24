import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { User, Building2, CheckCircle, ArrowRight, AlertTriangle } from 'lucide-react';
import { useApplication } from '@/context/ApplicationContext';
import { accountOpeningService } from '@/services/account-opening';
import { AccountType } from '@/types/api';
import { toast } from 'sonner';

export const ApplicationTypePage = () => {
    const navigate = useNavigate();
    const { setApplication, setCurrentStep, completeStep } = useApplication();
    const [selectedType, setSelectedType] = useState<AccountType | null>(null);

    const createApplicationMutation = useMutation({
        mutationFn: (accountType: AccountType) => accountOpeningService.createApplication({ accountType }),
        onSuccess: response => {
            if (response.success) {
                setApplication(response.data);
                completeStep('account_type');

                // Navigate to next step based on account type
                if (selectedType === 'consumer') {
                    setCurrentStep('personal_info');
                    navigate('/personal-info');
                } else {
                    setCurrentStep('business_profile');
                    navigate('/business-profile');
                }

                toast.success('Application started successfully!');
            } else {
                toast.error(response.message || 'Failed to start application');
            }
        },
        onError: (error: any) => {
            console.error('Application creation failed:', error);
            toast.error('Failed to start application. Please try again.');
        }
    });

    const handleContinue = () => {
        if (!selectedType) {
            toast.error('Please select an account type to continue');
            return;
        }

        createApplicationMutation.mutate(selectedType);
    };

    const accountOptions = [
        {
            type: 'consumer' as AccountType,
            icon: <User className='h-8 w-8' />,
            title: 'Personal Account',
            description: 'Individual checking, savings, and money market accounts',
            features: [
                'Personal checking and savings accounts',
                'Online and mobile banking',
                'Debit card and checks',
                'Direct deposit and bill pay',
                'No monthly fees with minimum balance'
            ],
            requirements: [
                'Valid government-issued ID',
                'Social Security Number',
                'Proof of address',
                'Initial deposit (varies by account type)'
            ]
        },
        {
            type: 'commercial' as AccountType,
            icon: <Building2 className='h-8 w-8' />,
            title: 'Business Account',
            description: 'Commercial accounts for businesses and organizations',
            features: [
                'Business checking and savings accounts',
                'Multiple authorized signers',
                'Business online banking',
                'Merchant services available',
                'Commercial lending options'
            ],
            requirements: [
                'Business registration documents',
                'Federal Tax ID Number (EIN)',
                'Business license (if applicable)',
                'Beneficial ownership information',
                'Operating agreement or bylaws'
            ]
        }
    ];

    return (
        <div className='p-6 md:p-8'>
            {/* Patriot Act Notice */}
            <Alert className='mb-6 border-blue-200 bg-blue-50'>
                <AlertTriangle className='h-4 w-4 text-blue-600' />
                <AlertDescription className='text-blue-800'>
                    <strong>Important Information Regarding the Patriot Act</strong>
                    <br />
                    To help the government fight the funding of terrorism and money laundering activities, Federal law
                    requires all financial institutions to obtain, verify, and record information that identifies each
                    person who opens an account. When you open an account, we will ask for your name, address, date of
                    birth, and other information that will allow us to identify you. We may also ask to see your
                    driver's license or other identifying documents.
                </AlertDescription>
            </Alert>

            {/* Account Type Selection */}
            <div className='space-y-6'>
                <div className='text-center mb-8'>
                    <p className='text-gray-600'>
                        This application is used by customers to request a new bank account. Please submit your
                        application and all appropriate documentation. A representative of the bank will contact you
                        regarding next steps.
                    </p>
                </div>

                <RadioGroup
                    value={selectedType || ''}
                    onValueChange={value => setSelectedType(value as AccountType)}
                    className='grid grid-cols-1 md:grid-cols-2 gap-6'
                >
                    {accountOptions.map(option => (
                        <div key={option.type}>
                            <Label
                                htmlFor={option.type}
                                className='cursor-pointer'
                            >
                                <Card
                                    className={`transition-all hover:shadow-md ${
                                        selectedType === option.type ? 'ring-2 ring-blue-600 border-blue-200' : ''
                                    }`}
                                >
                                    <CardHeader className='pb-4'>
                                        <div className='flex items-start gap-4'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem
                                                    value={option.type}
                                                    id={option.type}
                                                />
                                            </div>
                                            <div className='text-blue-600 mt-1'>{option.icon}</div>
                                            <div className='flex-1'>
                                                <CardTitle className='text-xl mb-2'>{option.title}</CardTitle>
                                                <CardDescription className='text-base'>
                                                    {option.description}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className='space-y-6'>
                                        {/* Features */}
                                        <div>
                                            <h4 className='font-semibold text-gray-900 mb-3 flex items-center gap-2'>
                                                <CheckCircle className='h-4 w-4 text-green-600' />
                                                Account Features
                                            </h4>
                                            <ul className='space-y-2'>
                                                {option.features.map((feature, index) => (
                                                    <li
                                                        key={index}
                                                        className='flex items-start gap-2 text-sm text-gray-600'
                                                    >
                                                        <CheckCircle className='h-4 w-4 text-green-600 mt-0.5 flex-shrink-0' />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Requirements */}
                                        <div>
                                            <h4 className='font-semibold text-gray-900 mb-3'>
                                                Required Documents & Information
                                            </h4>
                                            <div className='grid gap-2'>
                                                {option.requirements.map((requirement, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant='outline'
                                                        className='text-xs justify-start'
                                                    >
                                                        {requirement}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Label>
                        </div>
                    ))}
                </RadioGroup>

                {/* Continue Button */}
                <div className='flex justify-end pt-6'>
                    <Button
                        onClick={handleContinue}
                        disabled={!selectedType || createApplicationMutation.isPending}
                        size='lg'
                        className='min-w-32'
                    >
                        {createApplicationMutation.isPending ? (
                            'Starting...'
                        ) : (
                            <>
                                Continue
                                <ArrowRight className='ml-2 h-4 w-4' />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};
