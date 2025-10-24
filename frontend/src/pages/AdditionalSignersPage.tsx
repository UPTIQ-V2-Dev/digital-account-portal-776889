import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Users } from 'lucide-react';
import { useApplication } from '@/context/ApplicationContext';

export const AdditionalSignersPage = () => {
    const navigate = useNavigate();
    const { state, setCurrentStep, completeStep, getPreviousStep, getNextStep } = useApplication();

    const handleContinue = () => {
        completeStep('additional_signers');
        const nextStep = getNextStep('additional_signers', state.currentApplication?.accountType || 'commercial');
        if (nextStep) {
            setCurrentStep(nextStep);
            navigate(`/${nextStep.replace('_', '-')}`);
        }
    };

    const handleBack = () => {
        const previousStep = getPreviousStep(
            'additional_signers',
            state.currentApplication?.accountType || 'commercial'
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
                        <Users className='h-5 w-5' />
                        Additional Signers
                    </CardTitle>
                </CardHeader>
                <CardContent className='py-12'>
                    <div className='text-center space-y-4'>
                        <div className='text-6xl'>👥</div>
                        <h3 className='text-lg font-semibold'>Additional Account Signers</h3>
                        <p className='text-gray-600 max-w-md mx-auto'>
                            Add additional signers form will be implemented here including the ability to add multiple
                            signers with their personal information, roles, and signing authorities.
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
