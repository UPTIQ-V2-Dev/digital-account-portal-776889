import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, DollarSign, Plus, X } from 'lucide-react';
import { useApplication } from '@/context/ApplicationContext';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { accountOpeningService } from '@/services/account-opening';
import { useEffect } from 'react';
import { FinancialProfile } from '@/types/account-opening';
import { toast } from 'sonner';

const addressSchema = z.object({
    street: z.string().min(1, 'Street address is required'),
    street2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(2, 'State is required').max(2, 'State must be 2 characters'),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid zip code'),
    country: z.string().default('US')
});

const employmentInfoSchema = z.object({
    employer: z.string().min(1, 'Employer is required'),
    position: z.string().min(1, 'Position is required'),
    workAddress: addressSchema,
    workPhone: z.string().regex(/^\+?1?[-.(]?\d{3}[-.)\s]?\d{3}[-.]?\d{4}$/, 'Invalid phone number'),
    yearsEmployed: z.number().min(0, 'Must be a positive number'),
    monthlyIncome: z.number().min(0, 'Must be a positive number')
});

const bankingRelationshipSchema = z.object({
    bankName: z.string().min(1, 'Bank name is required'),
    accountTypes: z.array(z.string()).min(1, 'At least one account type is required'),
    yearsWithBank: z.number().min(0, 'Must be a positive number')
});

const accountActivitySchema = z.object({
    activity: z.string().min(1, 'Activity is required'),
    frequency: z.string().min(1, 'Frequency is required'),
    amount: z.number().min(0, 'Must be a positive number')
});

const financialProfileSchema = z.object({
    annualIncome: z.number().min(0, 'Must be a positive number'),
    incomeSource: z
        .array(z.enum(['employment', 'business', 'investment', 'retirement', 'government', 'other']))
        .min(1, 'At least one income source is required'),
    employmentInfo: employmentInfoSchema.optional(),
    assets: z.number().min(0, 'Must be a positive number'),
    liabilities: z.number().min(0, 'Must be a positive number'),
    bankingRelationships: z.array(bankingRelationshipSchema),
    accountActivities: z.array(accountActivitySchema)
});

type FinancialProfileForm = z.infer<typeof financialProfileSchema>;

export const FinancialProfilePage = () => {
    const navigate = useNavigate();
    const { state, setCurrentStep, completeStep, getPreviousStep, getNextStep } = useApplication();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
        control
    } = useForm({
        resolver: zodResolver(financialProfileSchema),
        defaultValues: {
            annualIncome: 0,
            incomeSource: [],
            assets: 0,
            liabilities: 0,
            bankingRelationships: [],
            accountActivities: []
        }
    });

    const {
        fields: bankingFields,
        append: appendBanking,
        remove: removeBanking
    } = useFieldArray({
        control,
        name: 'bankingRelationships'
    });

    const {
        fields: activityFields,
        append: appendActivity,
        remove: removeActivity
    } = useFieldArray({
        control,
        name: 'accountActivities'
    });

    const incomeSource = watch('incomeSource');

    // Load existing financial profile
    const { data: existingFinancialProfile } = useQuery({
        queryKey: ['financial-profile', state.currentApplication?.id],
        queryFn: () => accountOpeningService.getFinancialProfile(state.currentApplication!.id),
        enabled: !!state.currentApplication?.id
    });

    // Update financial profile mutation
    const updateFinancialProfileMutation = useMutation({
        mutationFn: (data: FinancialProfile) =>
            accountOpeningService.updateFinancialProfile(state.currentApplication!.id, data),
        onSuccess: () => {
            toast.success('Financial profile saved successfully');
            completeStep('financial_profile');
            const nextStep = getNextStep('financial_profile', state.currentApplication!.accountType);
            if (nextStep) {
                setCurrentStep(nextStep);
                navigate(`/${nextStep.replace('_', '-')}`);
            }
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to save financial profile');
        }
    });

    // Load existing data when available
    useEffect(() => {
        if (existingFinancialProfile?.success && existingFinancialProfile.data) {
            const data = existingFinancialProfile.data;
            reset({
                annualIncome: data.annualIncome,
                incomeSource: data.incomeSource,
                employmentInfo: data.employmentInfo,
                assets: data.assets,
                liabilities: data.liabilities,
                bankingRelationships: data.bankingRelationships,
                accountActivities: data.accountActivities
            });
        }
    }, [existingFinancialProfile, reset]);

    const onSubmit = (data: FinancialProfileForm) => {
        updateFinancialProfileMutation.mutate(data);
    };

    const handleBack = () => {
        const previousStep = getPreviousStep('financial_profile', state.currentApplication!.accountType);
        if (previousStep) {
            setCurrentStep(previousStep);
            navigate(`/${previousStep.replace('_', '-')}`);
        }
    };

    const handleIncomeSourceChange = (value: string, checked: boolean) => {
        const currentSources = incomeSource || [];
        if (checked) {
            setValue('incomeSource', [...currentSources, value as any]);
        } else {
            setValue(
                'incomeSource',
                currentSources.filter(source => source !== value)
            );
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
                        <DollarSign className='h-5 w-5' />
                        Financial Profile
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className='space-y-6'
                    >
                        {/* Income Information */}
                        <div className='space-y-4'>
                            <h3 className='text-lg font-semibold'>Income Information</h3>
                            <div>
                                <Label htmlFor='annualIncome'>Annual Income ($) *</Label>
                                <Input
                                    id='annualIncome'
                                    type='number'
                                    placeholder='75000'
                                    {...register('annualIncome', { valueAsNumber: true })}
                                    className={errors.annualIncome ? 'border-red-500' : ''}
                                />
                                {errors.annualIncome && (
                                    <p className='text-red-500 text-sm'>{errors.annualIncome.message}</p>
                                )}
                            </div>

                            <div>
                                <Label>Income Sources * (Select all that apply)</Label>
                                <div className='grid grid-cols-2 md:grid-cols-3 gap-4 mt-2'>
                                    {[
                                        { value: 'employment', label: 'Employment' },
                                        { value: 'business', label: 'Business' },
                                        { value: 'investment', label: 'Investments' },
                                        { value: 'retirement', label: 'Retirement' },
                                        { value: 'government', label: 'Government Benefits' },
                                        { value: 'other', label: 'Other' }
                                    ].map(option => (
                                        <div
                                            key={option.value}
                                            className='flex items-center space-x-2'
                                        >
                                            <Checkbox
                                                id={option.value}
                                                checked={incomeSource?.includes(option.value as any)}
                                                onCheckedChange={checked =>
                                                    handleIncomeSourceChange(option.value, checked as boolean)
                                                }
                                            />
                                            <Label htmlFor={option.value}>{option.label}</Label>
                                        </div>
                                    ))}
                                </div>
                                {errors.incomeSource && (
                                    <p className='text-red-500 text-sm'>{errors.incomeSource.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Employment Information (if employment is selected) */}
                        {incomeSource?.includes('employment') && (
                            <div className='space-y-4'>
                                <h3 className='text-lg font-semibold'>Employment Information</h3>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div>
                                        <Label htmlFor='employer'>Employer *</Label>
                                        <Input
                                            id='employer'
                                            {...register('employmentInfo.employer')}
                                            className={errors.employmentInfo?.employer ? 'border-red-500' : ''}
                                        />
                                        {errors.employmentInfo?.employer && (
                                            <p className='text-red-500 text-sm'>
                                                {errors.employmentInfo.employer.message}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor='position'>Position *</Label>
                                        <Input
                                            id='position'
                                            {...register('employmentInfo.position')}
                                            className={errors.employmentInfo?.position ? 'border-red-500' : ''}
                                        />
                                        {errors.employmentInfo?.position && (
                                            <p className='text-red-500 text-sm'>
                                                {errors.employmentInfo.position.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div>
                                        <Label htmlFor='yearsEmployed'>Years Employed *</Label>
                                        <Input
                                            id='yearsEmployed'
                                            type='number'
                                            placeholder='3'
                                            {...register('employmentInfo.yearsEmployed', { valueAsNumber: true })}
                                            className={errors.employmentInfo?.yearsEmployed ? 'border-red-500' : ''}
                                        />
                                        {errors.employmentInfo?.yearsEmployed && (
                                            <p className='text-red-500 text-sm'>
                                                {errors.employmentInfo.yearsEmployed.message}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor='monthlyIncome'>Monthly Income ($) *</Label>
                                        <Input
                                            id='monthlyIncome'
                                            type='number'
                                            placeholder='6250'
                                            {...register('employmentInfo.monthlyIncome', { valueAsNumber: true })}
                                            className={errors.employmentInfo?.monthlyIncome ? 'border-red-500' : ''}
                                        />
                                        {errors.employmentInfo?.monthlyIncome && (
                                            <p className='text-red-500 text-sm'>
                                                {errors.employmentInfo.monthlyIncome.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor='workPhone'>Work Phone *</Label>
                                    <Input
                                        id='workPhone'
                                        placeholder='(555) 123-4567'
                                        {...register('employmentInfo.workPhone')}
                                        className={errors.employmentInfo?.workPhone ? 'border-red-500' : ''}
                                    />
                                    {errors.employmentInfo?.workPhone && (
                                        <p className='text-red-500 text-sm'>
                                            {errors.employmentInfo.workPhone.message}
                                        </p>
                                    )}
                                </div>

                                {/* Work Address */}
                                <div className='space-y-4'>
                                    <h4 className='font-semibold'>Work Address</h4>
                                    <div>
                                        <Label htmlFor='workStreet'>Street Address *</Label>
                                        <Input
                                            id='workStreet'
                                            {...register('employmentInfo.workAddress.street')}
                                            className={
                                                errors.employmentInfo?.workAddress?.street ? 'border-red-500' : ''
                                            }
                                        />
                                        {errors.employmentInfo?.workAddress?.street && (
                                            <p className='text-red-500 text-sm'>
                                                {errors.employmentInfo.workAddress.street.message}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor='workStreet2'>Suite/Unit (Optional)</Label>
                                        <Input
                                            id='workStreet2'
                                            {...register('employmentInfo.workAddress.street2')}
                                        />
                                    </div>
                                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                        <div className='md:col-span-2'>
                                            <Label htmlFor='workCity'>City *</Label>
                                            <Input
                                                id='workCity'
                                                {...register('employmentInfo.workAddress.city')}
                                                className={
                                                    errors.employmentInfo?.workAddress?.city ? 'border-red-500' : ''
                                                }
                                            />
                                            {errors.employmentInfo?.workAddress?.city && (
                                                <p className='text-red-500 text-sm'>
                                                    {errors.employmentInfo.workAddress.city.message}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor='workState'>State *</Label>
                                            <Input
                                                id='workState'
                                                placeholder='CA'
                                                maxLength={2}
                                                {...register('employmentInfo.workAddress.state')}
                                                className={
                                                    errors.employmentInfo?.workAddress?.state ? 'border-red-500' : ''
                                                }
                                            />
                                            {errors.employmentInfo?.workAddress?.state && (
                                                <p className='text-red-500 text-sm'>
                                                    {errors.employmentInfo.workAddress.state.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                        <div>
                                            <Label htmlFor='workZip'>ZIP Code *</Label>
                                            <Input
                                                id='workZip'
                                                placeholder='12345'
                                                {...register('employmentInfo.workAddress.zipCode')}
                                                className={
                                                    errors.employmentInfo?.workAddress?.zipCode ? 'border-red-500' : ''
                                                }
                                            />
                                            {errors.employmentInfo?.workAddress?.zipCode && (
                                                <p className='text-red-500 text-sm'>
                                                    {errors.employmentInfo.workAddress.zipCode.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Financial Information */}
                        <div className='space-y-4'>
                            <h3 className='text-lg font-semibold'>Financial Information</h3>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <Label htmlFor='assets'>Total Assets ($) *</Label>
                                    <Input
                                        id='assets'
                                        type='number'
                                        placeholder='50000'
                                        {...register('assets', { valueAsNumber: true })}
                                        className={errors.assets ? 'border-red-500' : ''}
                                    />
                                    {errors.assets && <p className='text-red-500 text-sm'>{errors.assets.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor='liabilities'>Total Liabilities ($) *</Label>
                                    <Input
                                        id='liabilities'
                                        type='number'
                                        placeholder='15000'
                                        {...register('liabilities', { valueAsNumber: true })}
                                        className={errors.liabilities ? 'border-red-500' : ''}
                                    />
                                    {errors.liabilities && (
                                        <p className='text-red-500 text-sm'>{errors.liabilities.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Banking Relationships */}
                        <div className='space-y-4'>
                            <div className='flex items-center justify-between'>
                                <h3 className='text-lg font-semibold'>Current Banking Relationships</h3>
                                <Button
                                    type='button'
                                    variant='outline'
                                    size='sm'
                                    onClick={() => appendBanking({ bankName: '', accountTypes: [], yearsWithBank: 0 })}
                                >
                                    <Plus className='mr-2 h-4 w-4' />
                                    Add Bank
                                </Button>
                            </div>

                            {bankingFields.map((field, index) => (
                                <Card key={field.id}>
                                    <CardContent className='pt-4'>
                                        <div className='flex justify-between items-center mb-4'>
                                            <h4 className='font-medium'>Bank #{index + 1}</h4>
                                            <Button
                                                type='button'
                                                variant='outline'
                                                size='sm'
                                                onClick={() => removeBanking(index)}
                                            >
                                                <X className='h-4 w-4' />
                                            </Button>
                                        </div>
                                        <div className='space-y-4'>
                                            <div>
                                                <Label>Bank Name *</Label>
                                                <Input {...register(`bankingRelationships.${index}.bankName`)} />
                                            </div>
                                            <div>
                                                <Label>Account Types *</Label>
                                                <div className='grid grid-cols-2 gap-2 mt-2'>
                                                    {['Checking', 'Savings', 'Credit Card', 'Mortgage', 'Loan'].map(
                                                        accountType => (
                                                            <div
                                                                key={accountType}
                                                                className='flex items-center space-x-2'
                                                            >
                                                                <Checkbox
                                                                    id={`bank-${index}-${accountType}`}
                                                                    onCheckedChange={checked => {
                                                                        const currentTypes =
                                                                            watch(
                                                                                `bankingRelationships.${index}.accountTypes`
                                                                            ) || [];
                                                                        if (checked) {
                                                                            setValue(
                                                                                `bankingRelationships.${index}.accountTypes`,
                                                                                [...currentTypes, accountType]
                                                                            );
                                                                        } else {
                                                                            setValue(
                                                                                `bankingRelationships.${index}.accountTypes`,
                                                                                currentTypes.filter(
                                                                                    t => t !== accountType
                                                                                )
                                                                            );
                                                                        }
                                                                    }}
                                                                />
                                                                <Label htmlFor={`bank-${index}-${accountType}`}>
                                                                    {accountType}
                                                                </Label>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <Label>Years with Bank *</Label>
                                                <Input
                                                    type='number'
                                                    {...register(`bankingRelationships.${index}.yearsWithBank`, {
                                                        valueAsNumber: true
                                                    })}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Account Activities */}
                        <div className='space-y-4'>
                            <div className='flex items-center justify-between'>
                                <h3 className='text-lg font-semibold'>Expected Account Activities</h3>
                                <Button
                                    type='button'
                                    variant='outline'
                                    size='sm'
                                    onClick={() => appendActivity({ activity: '', frequency: '', amount: 0 })}
                                >
                                    <Plus className='mr-2 h-4 w-4' />
                                    Add Activity
                                </Button>
                            </div>

                            {activityFields.map((field, index) => (
                                <Card key={field.id}>
                                    <CardContent className='pt-4'>
                                        <div className='flex justify-between items-center mb-4'>
                                            <h4 className='font-medium'>Activity #{index + 1}</h4>
                                            <Button
                                                type='button'
                                                variant='outline'
                                                size='sm'
                                                onClick={() => removeActivity(index)}
                                            >
                                                <X className='h-4 w-4' />
                                            </Button>
                                        </div>
                                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                            <div>
                                                <Label>Activity *</Label>
                                                <Select
                                                    onValueChange={value =>
                                                        setValue(`accountActivities.${index}.activity`, value)
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select activity' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value='Direct Deposit'>Direct Deposit</SelectItem>
                                                        <SelectItem value='Bill Pay'>Bill Pay</SelectItem>
                                                        <SelectItem value='Wire Transfer'>Wire Transfer</SelectItem>
                                                        <SelectItem value='ACH Transfer'>ACH Transfer</SelectItem>
                                                        <SelectItem value='Debit Card'>Debit Card</SelectItem>
                                                        <SelectItem value='Check Writing'>Check Writing</SelectItem>
                                                        <SelectItem value='Cash Deposits'>Cash Deposits</SelectItem>
                                                        <SelectItem value='Other'>Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label>Frequency *</Label>
                                                <Select
                                                    onValueChange={value =>
                                                        setValue(`accountActivities.${index}.frequency`, value)
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select frequency' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value='Daily'>Daily</SelectItem>
                                                        <SelectItem value='Weekly'>Weekly</SelectItem>
                                                        <SelectItem value='Monthly'>Monthly</SelectItem>
                                                        <SelectItem value='Quarterly'>Quarterly</SelectItem>
                                                        <SelectItem value='Annually'>Annually</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label>Amount ($) *</Label>
                                                <Input
                                                    type='number'
                                                    {...register(`accountActivities.${index}.amount`, {
                                                        valueAsNumber: true
                                                    })}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

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
                                type='submit'
                                disabled={updateFinancialProfileMutation.isPending}
                            >
                                {updateFinancialProfileMutation.isPending ? 'Saving...' : 'Continue'}
                                <ArrowRight className='ml-2 h-4 w-4' />
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
