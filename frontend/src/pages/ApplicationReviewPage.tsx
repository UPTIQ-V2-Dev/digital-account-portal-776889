import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, FileCheck, AlertTriangle } from 'lucide-react';
import { useApplication } from '@/context/ApplicationContext';
import { accountOpeningService } from '@/services/account-opening';
import { toast } from 'sonner';

export const ApplicationReviewPage = () => {
    const navigate = useNavigate();
    const { state, setCurrentStep, completeStep, getPreviousStep, getNextStep } = useApplication();
    const [finalReview, setFinalReview] = useState(false);
    const [electronicConsent, setElectronicConsent] = useState(false);

    const submitApplicationMutation = useMutation({
        mutationFn: () =>
            accountOpeningService.submitApplication({
                applicationId: state.currentApplication!.id,
                finalReview,
                electronicConsent
            }),
        onSuccess: response => {
            if (response.success) {
                completeStep('review');
                const nextStep = getNextStep('review', state.currentApplication?.accountType || 'consumer');
                if (nextStep) {
                    setCurrentStep(nextStep);
                    navigate(`/${nextStep.replace('_', '-')}`);
                }
                toast.success('Application submitted successfully!');
            } else {
                toast.error(response.message || 'Failed to submit application');
            }
        },
        onError: (error: any) => {
            console.error('Application submission failed:', error);
            toast.error('Failed to submit application. Please try again.');
        }
    });

    const handleSubmit = () => {
        if (!finalReview || !electronicConsent) {
            toast.error('Please complete all required confirmations before submitting');
            return;
        }

        submitApplicationMutation.mutate();
    };

    const handleBack = () => {
        const previousStep = getPreviousStep('review', state.currentApplication?.accountType || 'consumer');
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
            <div className='mb-6'>
                <h3 className='text-lg font-semibold mb-2'>Review Your Application</h3>
                <p className='text-gray-600'>
                    Please review your application details below and confirm your submission.
                </p>
            </div>

            {/* Application Summary */}
            <Card className='mb-6'>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <FileCheck className='h-5 w-5' />
                        Application Summary
                    </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                            <h4 className='font-medium text-gray-900 mb-2'>Application Details</h4>
                            <div className='space-y-2 text-sm'>
                                <div className='flex justify-between'>
                                    <span className='text-gray-600'>Application ID:</span>
                                    <span className='font-medium'>{state.currentApplication.id}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-gray-600'>Account Type:</span>
                                    <span className='font-medium capitalize'>
                                        {state.currentApplication.accountType}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-gray-600'>Customer Type:</span>
                                    <span className='font-medium capitalize'>
                                        {state.currentApplication.customerType}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-gray-600'>Current Status:</span>
                                    <span className='font-medium capitalize'>{state.currentApplication.status}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className='font-medium text-gray-900 mb-2'>Completed Steps</h4>
                            <div className='space-y-1 text-sm'>
                                {state.completedSteps.map((step, index) => (
                                    <div
                                        key={index}
                                        className='flex items-center gap-2'
                                    >
                                        <div className='w-2 h-2 bg-green-500 rounded-full' />
                                        <span className='text-gray-700 capitalize'>{step.replace('_', ' ')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Important Notice */}
            <Card className='mb-6 border-yellow-200 bg-yellow-50'>
                <CardContent className='py-4'>
                    <div className='flex items-start gap-3'>
                        <AlertTriangle className='h-5 w-5 text-yellow-600 mt-0.5' />
                        <div className='text-sm text-yellow-800'>
                            <p className='font-medium mb-1'>Important Notice</p>
                            <p>
                                By submitting this application, you acknowledge that all information provided is
                                accurate and complete. False or misleading information may result in application denial
                                or account closure. Your application will be reviewed by our underwriting team and you
                                will be notified of the decision within 1-2 business days.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Final Confirmations */}
            <Card className='mb-6'>
                <CardHeader>
                    <CardTitle>Final Confirmations</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='flex items-start space-x-3'>
                        <Checkbox
                            id='final-review'
                            checked={finalReview}
                            onCheckedChange={checked => setFinalReview(!!checked)}
                            className='mt-0.5'
                        />
                        <div>
                            <label
                                htmlFor='final-review'
                                className='text-sm font-medium cursor-pointer'
                            >
                                I have reviewed my application and confirm all information is accurate
                            </label>
                            <p className='text-xs text-gray-600 mt-1'>
                                Required: Please review your application details above before submitting
                            </p>
                        </div>
                    </div>

                    <div className='flex items-start space-x-3'>
                        <Checkbox
                            id='electronic-consent'
                            checked={electronicConsent}
                            onCheckedChange={checked => setElectronicConsent(!!checked)}
                            className='mt-0.5'
                        />
                        <div>
                            <label
                                htmlFor='electronic-consent'
                                className='text-sm font-medium cursor-pointer'
                            >
                                Electronic Consent and Authorization
                            </label>
                            <p className='text-xs text-gray-600 mt-1'>
                                I consent to receive all communications related to this application electronically. I
                                understand that I may print or save electronic documents for my records.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Application Placeholder Details */}
            <Card>
                <CardContent className='py-12'>
                    <div className='text-center space-y-4'>
                        <div className='text-6xl'>📋</div>
                        <h3 className='text-lg font-semibold'>Complete Application Summary</h3>
                        <p className='text-gray-600 max-w-md mx-auto'>
                            Detailed application summary with all collected information will be displayed here including
                            personal/business info, financial profile, selected products, documents, verification
                            results, and signatures.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className='flex justify-between pt-6'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={handleBack}
                    disabled={submitApplicationMutation.isPending}
                >
                    <ArrowLeft className='mr-2 h-4 w-4' />
                    Back
                </Button>

                <Button
                    type='button'
                    onClick={handleSubmit}
                    disabled={!finalReview || !electronicConsent || submitApplicationMutation.isPending}
                    className='min-w-32'
                >
                    {submitApplicationMutation.isPending ? (
                        'Submitting...'
                    ) : (
                        <>
                            Submit Application
                            <ArrowRight className='ml-2 h-4 w-4' />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};
