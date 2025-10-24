import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Shield, CheckCircle } from 'lucide-react';
import { useApplication } from '@/context/ApplicationContext';
import { accountOpeningService } from '@/services/account-opening';
import { toast } from 'sonner';

export const IdentityVerificationPage = () => {
    const navigate = useNavigate();
    const { state, setCurrentStep, completeStep, getPreviousStep, getNextStep } = useApplication();
    const [verificationStarted, setVerificationStarted] = useState(false);
    const [verificationComplete, setVerificationComplete] = useState(false);

    const initiateKYCMutation = useMutation({
        mutationFn: () => accountOpeningService.initiateKYCVerification(state.currentApplication!.id),
        onSuccess: response => {
            if (response.success) {
                setVerificationComplete(true);
                toast.success('Identity verification completed successfully!');
            } else {
                toast.error(response.message || 'Identity verification failed');
            }
        },
        onError: (error: any) => {
            console.error('KYC verification failed:', error);
            toast.error('Identity verification failed. Please try again.');
        }
    });

    const handleStartVerification = () => {
        setVerificationStarted(true);
        // Simulate verification process
        setTimeout(() => {
            initiateKYCMutation.mutate();
        }, 2000);
    };

    const handleContinue = () => {
        completeStep('identity_verification');
        const nextStep = getNextStep('identity_verification', state.currentApplication?.accountType || 'consumer');
        if (nextStep) {
            setCurrentStep(nextStep);
            navigate(`/${nextStep.replace('_', '-')}`);
        }
    };

    const handleBack = () => {
        const previousStep = getPreviousStep(
            'identity_verification',
            state.currentApplication?.accountType || 'consumer'
        );
        if (previousStep) {
            setCurrentStep(previousStep);
            navigate(`/${previousStep.replace('_', '-')}`);
        }
    };

    if (!state.currentApplication) {
        navigate('/application-type');
        return null;
    }

    return (
        <div className='p-6 md:p-8'>
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Shield className='h-5 w-5' />
                        Identity Verification
                    </CardTitle>
                </CardHeader>
                <CardContent className='py-8'>
                    {!verificationStarted ? (
                        <div className='text-center space-y-6'>
                            <div className='text-6xl'>🛡️</div>
                            <div className='space-y-2'>
                                <h3 className='text-lg font-semibold'>Verify Your Identity</h3>
                                <p className='text-gray-600 max-w-md mx-auto'>
                                    We need to verify your identity to comply with federal regulations and protect your
                                    account. This process is secure and takes just a few moments.
                                </p>
                            </div>

                            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto'>
                                <h4 className='font-medium text-blue-900 mb-2'>What we'll verify:</h4>
                                <ul className='text-sm text-blue-800 space-y-1'>
                                    <li>• Personal information</li>
                                    <li>• Address verification</li>
                                    <li>• Phone number confirmation</li>
                                    <li>• Email verification</li>
                                    <li>• Identity document validation</li>
                                </ul>
                            </div>

                            <Button
                                onClick={handleStartVerification}
                                size='lg'
                                className='min-w-48'
                            >
                                Start Verification
                                <Shield className='ml-2 h-4 w-4' />
                            </Button>
                        </div>
                    ) : !verificationComplete ? (
                        <div className='text-center space-y-6'>
                            <div className='text-6xl'>⏳</div>
                            <div className='space-y-2'>
                                <h3 className='text-lg font-semibold'>Verifying Your Identity...</h3>
                                <p className='text-gray-600'>
                                    Please wait while we verify your information. This may take a few moments.
                                </p>
                            </div>

                            <div className='flex justify-center'>
                                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                            </div>
                        </div>
                    ) : (
                        <div className='text-center space-y-6'>
                            <div className='text-6xl'>✅</div>
                            <div className='space-y-2'>
                                <h3 className='text-lg font-semibold text-green-700'>Verification Complete!</h3>
                                <p className='text-gray-600'>
                                    Your identity has been successfully verified. You can now continue with your
                                    application.
                                </p>
                            </div>

                            <div className='bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto'>
                                <div className='flex items-center gap-2 justify-center mb-3'>
                                    <CheckCircle className='h-5 w-5 text-green-600' />
                                    <span className='font-medium text-green-800'>Verification Results</span>
                                </div>
                                <div className='space-y-2 text-sm'>
                                    <div className='flex justify-between items-center'>
                                        <span className='text-green-700'>Identity Check</span>
                                        <Badge
                                            variant='outline'
                                            className='border-green-300 text-green-700'
                                        >
                                            Passed
                                        </Badge>
                                    </div>
                                    <div className='flex justify-between items-center'>
                                        <span className='text-green-700'>Address Verification</span>
                                        <Badge
                                            variant='outline'
                                            className='border-green-300 text-green-700'
                                        >
                                            Passed
                                        </Badge>
                                    </div>
                                    <div className='flex justify-between items-center'>
                                        <span className='text-green-700'>Phone Verification</span>
                                        <Badge
                                            variant='outline'
                                            className='border-green-300 text-green-700'
                                        >
                                            Passed
                                        </Badge>
                                    </div>
                                    <div className='flex justify-between items-center'>
                                        <span className='text-green-700'>OFAC Check</span>
                                        <Badge
                                            variant='outline'
                                            className='border-green-300 text-green-700'
                                        >
                                            Clear
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className='flex justify-between pt-6'>
                <Button
                    variant='outline'
                    onClick={handleBack}
                    disabled={verificationStarted && !verificationComplete}
                >
                    <ArrowLeft className='mr-2 h-4 w-4' />
                    Back
                </Button>

                <Button
                    onClick={handleContinue}
                    disabled={!verificationComplete}
                >
                    Continue
                    <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
            </div>
        </div>
    );
};
