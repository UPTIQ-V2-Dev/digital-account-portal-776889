import { Check, Circle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useApplication } from '../../context/ApplicationContext';
import { ApplicationStep } from '../../types/application';

interface Step {
    id: ApplicationStep;
    title: string;
    description: string;
    isOptional?: boolean;
}

const getStepsForAccountType = (accountType: string): Step[] => {
    const commonSteps: Step[] = [
        {
            id: 'account_type',
            title: 'Account Type',
            description: 'Choose account type'
        },
        {
            id: 'financial_profile',
            title: 'Financial Profile',
            description: 'Financial information'
        },
        {
            id: 'product_selection',
            title: 'Products',
            description: 'Select account products'
        },
        {
            id: 'documents',
            title: 'Documents',
            description: 'Upload required documents'
        },
        {
            id: 'identity_verification',
            title: 'Verification',
            description: 'Identity verification'
        },
        {
            id: 'risk_assessment',
            title: 'Risk Assessment',
            description: 'Risk evaluation'
        },
        {
            id: 'disclosures',
            title: 'Disclosures',
            description: 'Review agreements'
        },
        {
            id: 'signatures',
            title: 'Signatures',
            description: 'Electronic signatures'
        },
        {
            id: 'funding',
            title: 'Funding',
            description: 'Setup account funding'
        },
        {
            id: 'review',
            title: 'Review',
            description: 'Review application'
        },
        {
            id: 'confirmation',
            title: 'Complete',
            description: 'Application submitted'
        }
    ];

    if (accountType === 'consumer') {
        return [
            commonSteps[0], // account_type
            {
                id: 'personal_info',
                title: 'Personal Info',
                description: 'Your personal information'
            },
            ...commonSteps.slice(1, 5), // financial_profile to identity_verification
            ...commonSteps.slice(5) // risk_assessment to confirmation
        ];
    } else {
        return [
            commonSteps[0], // account_type
            {
                id: 'business_profile',
                title: 'Business Info',
                description: 'Business information'
            },
            ...commonSteps.slice(1, 5), // financial_profile to identity_verification
            {
                id: 'additional_signers',
                title: 'Signers',
                description: 'Additional signers'
            },
            ...commonSteps.slice(5) // risk_assessment to confirmation
        ];
    }
};

export const ProgressStepper = () => {
    const { state, canNavigateToStep, isStepCompleted } = useApplication();

    if (!state.application) return null;

    const steps = getStepsForAccountType(state.application.accountType);
    const currentStepIndex = steps.findIndex(step => step.id === state.currentStep);

    return (
        <div className='w-full'>
            <div className='flex items-center justify-between'>
                {steps.map((step, index) => {
                    const isCompleted = isStepCompleted(step.id);
                    const isCurrent = step.id === state.currentStep;
                    const canNavigate = canNavigateToStep(step.id);
                    const isActive = index <= currentStepIndex;

                    return (
                        <div
                            key={step.id}
                            className='flex flex-col items-center relative flex-1'
                        >
                            {/* Connection Line */}
                            {index < steps.length - 1 && (
                                <div
                                    className={cn(
                                        'absolute top-5 left-1/2 h-0.5 w-full z-0',
                                        'transition-colors duration-200',
                                        isActive && index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-300'
                                    )}
                                />
                            )}

                            {/* Step Circle */}
                            <div className='relative z-10 flex flex-col items-center'>
                                <button
                                    className={cn(
                                        'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200',
                                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                                        isCompleted
                                            ? 'bg-blue-600 border-blue-600 text-white'
                                            : isCurrent
                                              ? 'bg-white border-blue-600 text-blue-600'
                                              : isActive
                                                ? 'bg-white border-gray-400 text-gray-400'
                                                : 'bg-white border-gray-300 text-gray-300',
                                        canNavigate &&
                                            !isCurrent &&
                                            'hover:border-blue-500 hover:text-blue-500 cursor-pointer',
                                        !canNavigate && 'cursor-not-allowed'
                                    )}
                                    disabled={!canNavigate}
                                    aria-label={`${step.title} - ${isCompleted ? 'Completed' : isCurrent ? 'Current' : 'Upcoming'}`}
                                >
                                    {isCompleted ? (
                                        <Check className='h-5 w-5' />
                                    ) : (
                                        <Circle className={cn('h-5 w-5', isCurrent && 'fill-current')} />
                                    )}
                                </button>

                                {/* Step Labels */}
                                <div className='mt-2 text-center'>
                                    <p
                                        className={cn(
                                            'text-xs font-medium',
                                            isCurrent ? 'text-blue-600' : isActive ? 'text-gray-900' : 'text-gray-400'
                                        )}
                                    >
                                        {step.title}
                                    </p>
                                    <p
                                        className={cn(
                                            'text-xs mt-0.5 hidden sm:block',
                                            isCurrent ? 'text-blue-500' : isActive ? 'text-gray-600' : 'text-gray-400'
                                        )}
                                    >
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Progress Bar */}
            <div className='mt-6 w-full bg-gray-200 rounded-full h-2'>
                <div
                    className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                    style={{
                        width: `${((currentStepIndex + 1) / steps.length) * 100}%`
                    }}
                />
            </div>

            {/* Progress Text */}
            <div className='mt-2 text-center'>
                <p className='text-sm text-gray-600'>
                    Step {currentStepIndex + 1} of {steps.length}
                </p>
            </div>
        </div>
    );
};
