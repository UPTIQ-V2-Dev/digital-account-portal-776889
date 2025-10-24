import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useApplication } from '@/context/ApplicationContext';
import { accountOpeningService } from '@/services/account-opening';
import { toast } from 'sonner';

export const RiskAssessmentPage = () => {
    const navigate = useNavigate();
    const { state, setCurrentStep, completeStep, getPreviousStep, getNextStep } = useApplication();
    const [assessmentStarted, setAssessmentStarted] = useState(false);
    const [assessmentComplete, setAssessmentComplete] = useState(false);
    const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('low');

    const performRiskAssessmentMutation = useMutation({
        mutationFn: () => accountOpeningService.performRiskAssessment(state.currentApplication!.id),
        onSuccess: response => {
            if (response.success) {
                setRiskLevel(response.data.overallRisk);
                setAssessmentComplete(true);
                toast.success('Risk assessment completed successfully!');
            } else {
                toast.error(response.message || 'Risk assessment failed');
            }
        },
        onError: (error: any) => {
            console.error('Risk assessment failed:', error);
            toast.error('Risk assessment failed. Please try again.');
        }
    });

    const handleStartAssessment = () => {
        setAssessmentStarted(true);
        // Simulate assessment process
        setTimeout(() => {
            performRiskAssessmentMutation.mutate();
        }, 1500);
    };

    const handleContinue = () => {
        completeStep('risk_assessment');
        const nextStep = getNextStep('risk_assessment', state.currentApplication?.accountType || 'consumer');
        if (nextStep) {
            setCurrentStep(nextStep);
            navigate(`/${nextStep.replace('_', '-')}`);
        }
    };

    const handleBack = () => {
        const previousStep = getPreviousStep('risk_assessment', state.currentApplication?.accountType || 'consumer');
        if (previousStep) {
            setCurrentStep(previousStep);
            navigate(`/${previousStep.replace('_', '-')}`);
        }
    };

    if (!state.currentApplication) {
        navigate('/application-type');
        return null;
    }

    const getRiskLevelColor = (level: string) => {
        switch (level) {
            case 'low':
                return 'text-green-700 bg-green-100 border-green-300';
            case 'medium':
                return 'text-yellow-700 bg-yellow-100 border-yellow-300';
            case 'high':
                return 'text-red-700 bg-red-100 border-red-300';
            default:
                return 'text-gray-700 bg-gray-100 border-gray-300';
        }
    };

    const getRiskIcon = (level: string) => {
        switch (level) {
            case 'low':
                return <CheckCircle className='h-5 w-5 text-green-600' />;
            case 'medium':
                return <AlertTriangle className='h-5 w-5 text-yellow-600' />;
            case 'high':
                return <AlertTriangle className='h-5 w-5 text-red-600' />;
            default:
                return <Shield className='h-5 w-5' />;
        }
    };

    return (
        <div className='p-6 md:p-8'>
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Shield className='h-5 w-5' />
                        Risk Assessment
                    </CardTitle>
                </CardHeader>
                <CardContent className='py-8'>
                    {!assessmentStarted ? (
                        <div className='text-center space-y-6'>
                            <div className='text-6xl'>📊</div>
                            <div className='space-y-2'>
                                <h3 className='text-lg font-semibold'>Risk Assessment Review</h3>
                                <p className='text-gray-600 max-w-md mx-auto'>
                                    We'll now perform a comprehensive risk assessment based on your application
                                    information, identity verification, and banking history.
                                </p>
                            </div>

                            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto'>
                                <h4 className='font-medium text-blue-900 mb-2'>Assessment includes:</h4>
                                <ul className='text-sm text-blue-800 space-y-1'>
                                    <li>• Identity verification results</li>
                                    <li>• ChexSystems banking history</li>
                                    <li>• OFAC and sanctions screening</li>
                                    <li>• Application completeness review</li>
                                    <li>• Fraud risk evaluation</li>
                                </ul>
                            </div>

                            <Button
                                onClick={handleStartAssessment}
                                size='lg'
                                className='min-w-48'
                            >
                                Start Assessment
                                <Shield className='ml-2 h-4 w-4' />
                            </Button>
                        </div>
                    ) : !assessmentComplete ? (
                        <div className='text-center space-y-6'>
                            <div className='text-6xl'>⚖️</div>
                            <div className='space-y-2'>
                                <h3 className='text-lg font-semibold'>Performing Risk Assessment...</h3>
                                <p className='text-gray-600'>
                                    Analyzing your application and running security checks. This may take a moment.
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
                                <h3 className='text-lg font-semibold text-green-700'>Assessment Complete!</h3>
                                <p className='text-gray-600'>Your risk assessment has been completed successfully.</p>
                            </div>

                            <div className='bg-white border rounded-lg p-6 max-w-md mx-auto'>
                                <div className='flex items-center justify-center gap-2 mb-4'>
                                    {getRiskIcon(riskLevel)}
                                    <span className='font-medium'>Overall Risk Level</span>
                                </div>

                                <Badge
                                    variant='outline'
                                    className={`text-lg px-4 py-2 ${getRiskLevelColor(riskLevel)}`}
                                >
                                    {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
                                </Badge>

                                <div className='mt-4 text-sm text-gray-600'>
                                    <p>
                                        {riskLevel === 'low' &&
                                            'Your application presents low risk and can proceed with standard processing.'}
                                        {riskLevel === 'medium' &&
                                            'Your application requires additional review but is likely to be approved.'}
                                        {riskLevel === 'high' &&
                                            'Your application requires manual review by our compliance team.'}
                                    </p>
                                </div>
                            </div>

                            <div className='bg-gray-50 border rounded-lg p-4 max-w-md mx-auto'>
                                <h4 className='font-medium mb-2'>Assessment Factors</h4>
                                <div className='space-y-2 text-sm'>
                                    <div className='flex justify-between items-center'>
                                        <span>Identity Verification</span>
                                        <Badge
                                            variant='outline'
                                            className='border-green-300 text-green-700'
                                        >
                                            Strong
                                        </Badge>
                                    </div>
                                    <div className='flex justify-between items-center'>
                                        <span>Banking History</span>
                                        <Badge
                                            variant='outline'
                                            className='border-green-300 text-green-700'
                                        >
                                            Clear
                                        </Badge>
                                    </div>
                                    <div className='flex justify-between items-center'>
                                        <span>Application Completeness</span>
                                        <Badge
                                            variant='outline'
                                            className='border-green-300 text-green-700'
                                        >
                                            Complete
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
                    disabled={assessmentStarted && !assessmentComplete}
                >
                    <ArrowLeft className='mr-2 h-4 w-4' />
                    Back
                </Button>

                <Button
                    onClick={handleContinue}
                    disabled={!assessmentComplete}
                >
                    Continue
                    <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
            </div>
        </div>
    );
};
