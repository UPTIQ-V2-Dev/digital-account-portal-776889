import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CreditCard } from 'lucide-react';
import { useApplication } from '@/context/ApplicationContext';

export const AccountFundingPage = () => {
    const navigate = useNavigate();
    const { state, setCurrentStep, completeStep, getPreviousStep, getNextStep } = useApplication();

    const handleContinue = () => {
        completeStep('funding');
        const nextStep = getNextStep('funding', state.currentApplication?.accountType || 'consumer');
        if (nextStep) {
            setCurrentStep(nextStep);
            navigate(`/${nextStep.replace('_', '-')}`);
        }
    };

    const handleBack = () => {
        const previousStep = getPreviousStep('funding', state.currentApplication?.accountType || 'consumer');
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
                        <CreditCard className='h-5 w-5' />
                        Account Funding
                    </CardTitle>
                </CardHeader>
                <CardContent className='py-12'>
                    <div className='text-center space-y-4'>
                        <div className='text-6xl'>💳</div>
                        <h3 className='text-lg font-semibold'>Initial Account Funding</h3>
                        <p className='text-gray-600 max-w-md mx-auto'>
                            Account funding setup will be implemented here including ACH transfers, wire transfers,
                            check deposits, and Plaid integration for bank connections.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className='flex justify-between pt-6'>
                <Button
                    variant='outline'
                    onClick={handleBack}
                >
                    <ArrowLeft className='mr-2 h-4 w-4' />
                    Back
                </Button>
                <Button onClick={handleContinue}>
                    Continue
                    <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
            </div>
        </div>
    );
};
