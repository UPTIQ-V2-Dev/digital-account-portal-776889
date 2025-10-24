import React from 'react';
import { cn } from '@/lib/utils';
import { Check, Circle } from 'lucide-react';

export interface StepItem {
    id: string;
    label: string;
    description?: string;
    status: 'completed' | 'current' | 'pending';
}

interface ProgressStepperProps {
    steps: StepItem[];
    orientation?: 'horizontal' | 'vertical';
    showDescriptions?: boolean;
    className?: string;
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
    steps,
    orientation = 'horizontal',
    showDescriptions = true,
    className
}) => {
    const isHorizontal = orientation === 'horizontal';

    return (
        <div
            className={cn(
                'flex',
                isHorizontal ? 'flex-row items-center justify-between' : 'flex-col space-y-8',
                className
            )}
        >
            {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                    {/* Step Item */}
                    <div className={cn('flex items-center', isHorizontal ? 'flex-col text-center' : 'flex-row')}>
                        {/* Step Icon */}
                        <div
                            className={cn(
                                'flex items-center justify-center rounded-full border-2 flex-shrink-0',
                                isHorizontal ? 'w-8 h-8 mb-2' : 'w-10 h-10 mr-4',
                                step.status === 'completed'
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : step.status === 'current'
                                      ? 'bg-blue-50 border-blue-600 text-blue-600'
                                      : 'bg-white border-gray-300 text-gray-400'
                            )}
                        >
                            {step.status === 'completed' ? (
                                <Check className={cn(isHorizontal ? 'h-4 w-4' : 'h-5 w-5')} />
                            ) : (
                                <Circle
                                    className={cn(
                                        isHorizontal ? 'h-4 w-4' : 'h-5 w-5',
                                        step.status === 'current' ? 'fill-current' : ''
                                    )}
                                />
                            )}
                        </div>

                        {/* Step Content */}
                        <div className={cn(isHorizontal ? 'text-center' : 'flex-1')}>
                            <div
                                className={cn(
                                    'text-sm font-medium',
                                    step.status === 'completed' || step.status === 'current'
                                        ? 'text-gray-900'
                                        : 'text-gray-400'
                                )}
                            >
                                {step.label}
                            </div>
                            {showDescriptions && step.description && (
                                <div
                                    className={cn(
                                        'text-xs mt-1',
                                        step.status === 'completed' || step.status === 'current'
                                            ? 'text-gray-600'
                                            : 'text-gray-400'
                                    )}
                                >
                                    {step.description}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Connector Line */}
                    {index < steps.length - 1 && (
                        <div
                            className={cn(
                                isHorizontal ? 'flex-1 h-px bg-gray-300 mx-4 mt-4' : 'ml-5 w-px h-8 bg-gray-300'
                            )}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};
