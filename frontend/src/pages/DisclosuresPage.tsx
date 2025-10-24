import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, ArrowRight, FileText, ExternalLink } from 'lucide-react';
import { useApplication } from '@/context/ApplicationContext';
import { accountOpeningService } from '@/services/account-opening';
import { toast } from 'sonner';

export const DisclosuresPage = () => {
    const navigate = useNavigate();
    const { state, setCurrentStep, completeStep, getPreviousStep, getNextStep } = useApplication();
    const [acknowledgedDisclosures, setAcknowledgedDisclosures] = useState<Set<string>>(new Set());

    // Fetch disclosures for the account type
    const { data: disclosuresData, isLoading } = useQuery({
        queryKey: ['disclosures', state.currentApplication?.accountType],
        queryFn: () => accountOpeningService.getDisclosures(state.currentApplication?.accountType || 'consumer'),
        enabled: !!state.currentApplication
    });

    const acknowledgeAgreementMutation = useMutation({
        mutationFn: ({ disclosureId }: { disclosureId: string }) =>
            accountOpeningService.acknowledgeAgreement(state.currentApplication!.id, disclosureId),
        onSuccess: (response, variables) => {
            if (response.success) {
                setAcknowledgedDisclosures(prev => new Set([...prev, variables.disclosureId]));
            }
        }
    });

    const handleDisclosureAcknowledge = (disclosureId: string, acknowledged: boolean) => {
        if (acknowledged) {
            acknowledgeAgreementMutation.mutate({ disclosureId });
        } else {
            setAcknowledgedDisclosures(prev => {
                const newSet = new Set(prev);
                newSet.delete(disclosureId);
                return newSet;
            });
        }
    };

    const handleContinue = () => {
        const disclosures = disclosuresData?.success ? disclosuresData.data : [];
        const requiredDisclosures = disclosures.filter(d => d.required);

        if (requiredDisclosures.some(d => !acknowledgedDisclosures.has(d.id))) {
            toast.error('Please acknowledge all required disclosures before continuing');
            return;
        }

        completeStep('disclosures');
        const nextStep = getNextStep('disclosures', state.currentApplication?.accountType || 'consumer');
        if (nextStep) {
            setCurrentStep(nextStep);
            navigate(`/${nextStep.replace('_', '-')}`);
        }
    };

    const handleBack = () => {
        const previousStep = getPreviousStep('disclosures', state.currentApplication?.accountType || 'consumer');
        if (previousStep) {
            setCurrentStep(previousStep);
            navigate(`/${previousStep.replace('_', '-')}`);
        }
    };

    if (!state.currentApplication) {
        navigate('/application-type');
        return null;
    }

    const disclosures = disclosuresData?.success ? disclosuresData.data : [];

    return (
        <div className='p-6 md:p-8'>
            <div className='mb-6'>
                <h3 className='text-lg font-semibold mb-2'>Disclosures and Authorization</h3>
                <p className='text-gray-600'>Please review and acknowledge the following disclosures and agreements.</p>
            </div>

            {isLoading ? (
                <div className='text-center py-8'>
                    <div className='text-gray-600'>Loading disclosures...</div>
                </div>
            ) : (
                <div className='space-y-6'>
                    {disclosures.map(disclosure => (
                        <Card
                            key={disclosure.id}
                            className='border'
                        >
                            <CardHeader className='pb-4'>
                                <CardTitle className='flex items-start justify-between'>
                                    <div className='flex items-center gap-2'>
                                        <FileText className='h-5 w-5' />
                                        <div>
                                            <span>{disclosure.title}</span>
                                            {disclosure.required && <span className='text-red-600 ml-1'>*</span>}
                                        </div>
                                    </div>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        className='ml-4'
                                    >
                                        View Full Document
                                        <ExternalLink className='ml-2 h-4 w-4' />
                                    </Button>
                                </CardTitle>
                            </CardHeader>

                            <CardContent className='space-y-4'>
                                {/* Document Preview/Content */}
                                <ScrollArea className='h-32 w-full border rounded-md p-3'>
                                    <div className='text-sm text-gray-700'>
                                        {disclosure.content}
                                        {disclosure.content.length < 200 && (
                                            <>
                                                <br />
                                                <br />
                                                <em>
                                                    This is a preview of the document. Click "View Full Document" above
                                                    to read the complete terms and conditions.
                                                </em>
                                            </>
                                        )}
                                    </div>
                                </ScrollArea>

                                {/* Electronic Communications Checkbox */}
                                {disclosure.type === 'electronic_signature_disclosure' && (
                                    <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                                        <div className='flex items-start space-x-3'>
                                            <Checkbox
                                                id='electronic-communications'
                                                checked={acknowledgedDisclosures.has(disclosure.id)}
                                                onCheckedChange={checked =>
                                                    handleDisclosureAcknowledge(disclosure.id, !!checked)
                                                }
                                                className='mt-0.5'
                                            />
                                            <div className='text-sm'>
                                                <label
                                                    htmlFor='electronic-communications'
                                                    className='font-medium text-blue-900 cursor-pointer'
                                                >
                                                    ELECTRONIC COMMUNICATIONS
                                                </label>
                                                <p className='text-blue-800 mt-1'>
                                                    I have reviewed and agree to the terms of the Electronic
                                                    Communications Disclosure. I confirm that I will receive
                                                    communications regarding bank account eligibility by electronic
                                                    means only. I confirm that I have the ability to save or print web
                                                    pages.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Credit Authorization Checkbox */}
                                {disclosure.type === 'credit_authorization' && (
                                    <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
                                        <div className='flex items-start space-x-3'>
                                            <Checkbox
                                                id='credit-authorization'
                                                checked={acknowledgedDisclosures.has(disclosure.id)}
                                                onCheckedChange={checked =>
                                                    handleDisclosureAcknowledge(disclosure.id, !!checked)
                                                }
                                                className='mt-0.5'
                                            />
                                            <div className='text-sm'>
                                                <label
                                                    htmlFor='credit-authorization'
                                                    className='font-medium text-yellow-900 cursor-pointer'
                                                >
                                                    CREDIT AUTHORIZATION
                                                </label>
                                                <p className='text-yellow-800 mt-1'>
                                                    By checking this box, I am providing written instructions to Bank
                                                    under the federal Fair Credit Reporting Act and applicable state
                                                    law, authorizing Bank to obtain information about me today from
                                                    consumer reporting agencies to determine if I am eligible for a bank
                                                    account today and in the future.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Standard Agreement Checkbox */}
                                {!['electronic_signature_disclosure', 'credit_authorization'].includes(
                                    disclosure.type
                                ) && (
                                    <div className='flex items-start space-x-3'>
                                        <Checkbox
                                            id={`disclosure-${disclosure.id}`}
                                            checked={acknowledgedDisclosures.has(disclosure.id)}
                                            onCheckedChange={checked =>
                                                handleDisclosureAcknowledge(disclosure.id, !!checked)
                                            }
                                            className='mt-0.5'
                                        />
                                        <label
                                            htmlFor={`disclosure-${disclosure.id}`}
                                            className='text-sm cursor-pointer'
                                        >
                                            I have read and acknowledge the {disclosure.title}
                                            {disclosure.required && <span className='text-red-600'> *</span>}
                                        </label>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}

                    {disclosures.length === 0 && (
                        <Card>
                            <CardContent className='py-12'>
                                <div className='text-center space-y-4'>
                                    <div className='text-6xl'>📄</div>
                                    <h3 className='text-lg font-semibold'>No Disclosures Required</h3>
                                    <p className='text-gray-600'>
                                        No additional disclosures are required for your account type.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Progress Summary */}
            {disclosures.length > 0 && (
                <Card className='mt-6 bg-gray-50'>
                    <CardContent className='py-4'>
                        <div className='flex items-center justify-between text-sm'>
                            <span>
                                Progress: {acknowledgedDisclosures.size} of {disclosures.filter(d => d.required).length}{' '}
                                required disclosures acknowledged
                            </span>
                            <span className='text-gray-500'>* Required disclosures</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Navigation Buttons */}
            <div className='flex justify-between pt-6'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={handleBack}
                >
                    <ArrowLeft className='mr-2 h-4 w-4' />
                    Back
                </Button>

                <Button
                    type='button'
                    onClick={handleContinue}
                    disabled={disclosures.filter(d => d.required).some(d => !acknowledgedDisclosures.has(d.id))}
                >
                    Continue
                    <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
            </div>
        </div>
    );
};
