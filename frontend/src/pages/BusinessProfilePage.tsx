import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, Building2 } from 'lucide-react';
import { useApplication } from '@/context/ApplicationContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { accountOpeningService } from '@/services/account-opening';
import { useState, useEffect } from 'react';
import { BusinessProfile } from '@/types/account-opening';
import { toast } from 'sonner';

const businessProfileSchema = z.object({
    businessName: z.string().min(1, 'Business name is required'),
    dbaName: z.string().optional(),
    ein: z.string().regex(/^\d{2}-?\d{7}$/, 'Invalid EIN format (XX-XXXXXXX)'),
    entityType: z.enum(['corporation', 'llc', 'partnership', 'sole_proprietorship', 'nonprofit']),
    industryType: z.string().min(1, 'Industry type is required'),
    dateEstablished: z.string().min(1, 'Date established is required'),
    businessAddress: z.object({
        street: z.string().min(1, 'Street address is required'),
        street2: z.string().optional(),
        city: z.string().min(1, 'City is required'),
        state: z.string().min(2, 'State is required').max(2, 'State must be 2 characters'),
        zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid zip code'),
        country: z.string().default('US')
    }),
    mailingAddress: z
        .object({
            street: z.string().optional(),
            street2: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            zipCode: z.string().optional(),
            country: z.string().optional()
        })
        .optional(),
    businessPhone: z.string().regex(/^\+?1?[-.(]?\d{3}[-.)\s]?\d{3}[-.]?\d{4}$/, 'Invalid phone number'),
    businessEmail: z.string().email('Invalid email address'),
    website: z.string().url('Invalid website URL').optional().or(z.literal('')),
    description: z.string().min(1, 'Business description is required'),
    isCashIntensive: z.boolean(),
    monthlyTransactionVolume: z.number().min(0, 'Must be a positive number'),
    monthlyTransactionCount: z.number().min(0, 'Must be a positive number'),
    expectedBalance: z.number().min(0, 'Must be a positive number')
});

type BusinessProfileForm = z.infer<typeof businessProfileSchema>;

export const BusinessProfilePage = () => {
    const navigate = useNavigate();
    const { state, setCurrentStep, completeStep, getPreviousStep, getNextStep } = useApplication();
    const [sameAsBusinessAddress, setSameAsBusinessAddress] = useState(true);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset
    } = useForm({
        resolver: zodResolver(businessProfileSchema),
        defaultValues: {
            businessAddress: { country: 'US' },
            entityType: 'llc',
            isCashIntensive: false,
            monthlyTransactionVolume: 0,
            monthlyTransactionCount: 0,
            expectedBalance: 0
        }
    });

    const businessAddress = watch('businessAddress');

    // Load existing business profile
    const { data: existingBusinessProfile } = useQuery({
        queryKey: ['business-profile', state.currentApplication?.id],
        queryFn: () => accountOpeningService.getBusinessProfile(state.currentApplication!.id),
        enabled: !!state.currentApplication?.id
    });

    // Update business profile mutation
    const updateBusinessProfileMutation = useMutation({
        mutationFn: (data: BusinessProfile) =>
            accountOpeningService.updateBusinessProfile(state.currentApplication!.id, data),
        onSuccess: () => {
            toast.success('Business profile saved successfully');
            completeStep('business_profile');
            const nextStep = getNextStep('business_profile', state.currentApplication!.accountType);
            if (nextStep) {
                setCurrentStep(nextStep);
                navigate(`/${nextStep.replace('_', '-')}`);
            }
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to save business profile');
        }
    });

    // Load existing data when available
    useEffect(() => {
        if (existingBusinessProfile?.success && existingBusinessProfile.data) {
            const data = existingBusinessProfile.data;
            reset({
                businessName: data.businessName,
                dbaName: data.dbaName || '',
                ein: data.ein,
                entityType: data.entityType,
                industryType: data.industryType,
                dateEstablished: data.dateEstablished,
                businessAddress: data.businessAddress,
                mailingAddress: data.mailingAddress,
                businessPhone: data.businessPhone,
                businessEmail: data.businessEmail,
                website: data.website || '',
                description: data.description,
                isCashIntensive: data.isCashIntensive,
                monthlyTransactionVolume: data.monthlyTransactionVolume,
                monthlyTransactionCount: data.monthlyTransactionCount,
                expectedBalance: data.expectedBalance
            });
        }
    }, [existingBusinessProfile, reset]);

    // Handle same as business address
    useEffect(() => {
        if (sameAsBusinessAddress && businessAddress) {
            setValue('mailingAddress', businessAddress);
        }
    }, [sameAsBusinessAddress, businessAddress, setValue]);

    const onSubmit = (data: BusinessProfileForm) => {
        const mailingAddress = sameAsBusinessAddress
            ? data.businessAddress
            : data.mailingAddress && data.mailingAddress.street
              ? (data.mailingAddress as any)
              : undefined;

        const businessProfile: BusinessProfile = {
            ...data,
            mailingAddress,
            website: data.website || undefined
        };
        updateBusinessProfileMutation.mutate(businessProfile);
    };

    const handleBack = () => {
        const previousStep = getPreviousStep('business_profile', state.currentApplication!.accountType);
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
                        <Building2 className='h-5 w-5' />
                        Business Profile
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className='space-y-6'
                    >
                        {/* Business Information */}
                        <div className='space-y-4'>
                            <h3 className='text-lg font-semibold'>Business Information</h3>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <Label htmlFor='businessName'>Legal Business Name *</Label>
                                    <Input
                                        id='businessName'
                                        {...register('businessName')}
                                        className={errors.businessName ? 'border-red-500' : ''}
                                    />
                                    {errors.businessName && (
                                        <p className='text-red-500 text-sm'>{errors.businessName.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor='dbaName'>DBA Name (if applicable)</Label>
                                    <Input
                                        id='dbaName'
                                        {...register('dbaName')}
                                    />
                                </div>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <Label htmlFor='ein'>Federal Tax ID (EIN) *</Label>
                                    <Input
                                        id='ein'
                                        placeholder='XX-XXXXXXX'
                                        {...register('ein')}
                                        className={errors.ein ? 'border-red-500' : ''}
                                    />
                                    {errors.ein && <p className='text-red-500 text-sm'>{errors.ein.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor='entityType'>Entity Type *</Label>
                                    <Select onValueChange={value => setValue('entityType', value as any)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select entity type' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='corporation'>Corporation</SelectItem>
                                            <SelectItem value='llc'>LLC</SelectItem>
                                            <SelectItem value='partnership'>Partnership</SelectItem>
                                            <SelectItem value='sole_proprietorship'>Sole Proprietorship</SelectItem>
                                            <SelectItem value='nonprofit'>Non-Profit</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <Label htmlFor='industryType'>Industry *</Label>
                                    <Select onValueChange={value => setValue('industryType', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select industry' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='Technology'>Technology</SelectItem>
                                            <SelectItem value='Healthcare'>Healthcare</SelectItem>
                                            <SelectItem value='Manufacturing'>Manufacturing</SelectItem>
                                            <SelectItem value='Retail'>Retail</SelectItem>
                                            <SelectItem value='Construction'>Construction</SelectItem>
                                            <SelectItem value='Professional Services'>Professional Services</SelectItem>
                                            <SelectItem value='Financial Services'>Financial Services</SelectItem>
                                            <SelectItem value='Real Estate'>Real Estate</SelectItem>
                                            <SelectItem value='Education'>Education</SelectItem>
                                            <SelectItem value='Other'>Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.industryType && (
                                        <p className='text-red-500 text-sm'>{errors.industryType.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor='dateEstablished'>Date Established *</Label>
                                    <Input
                                        id='dateEstablished'
                                        type='date'
                                        {...register('dateEstablished')}
                                        className={errors.dateEstablished ? 'border-red-500' : ''}
                                    />
                                    {errors.dateEstablished && (
                                        <p className='text-red-500 text-sm'>{errors.dateEstablished.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Business Address */}
                        <div className='space-y-4'>
                            <h3 className='text-lg font-semibold'>Business Address</h3>
                            <div>
                                <Label htmlFor='street'>Street Address *</Label>
                                <Input
                                    id='street'
                                    {...register('businessAddress.street')}
                                    className={errors.businessAddress?.street ? 'border-red-500' : ''}
                                />
                                {errors.businessAddress?.street && (
                                    <p className='text-red-500 text-sm'>{errors.businessAddress.street.message}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor='street2'>Suite/Unit (Optional)</Label>
                                <Input
                                    id='street2'
                                    {...register('businessAddress.street2')}
                                />
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                <div className='md:col-span-2'>
                                    <Label htmlFor='city'>City *</Label>
                                    <Input
                                        id='city'
                                        {...register('businessAddress.city')}
                                        className={errors.businessAddress?.city ? 'border-red-500' : ''}
                                    />
                                    {errors.businessAddress?.city && (
                                        <p className='text-red-500 text-sm'>{errors.businessAddress.city.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor='state'>State *</Label>
                                    <Input
                                        id='state'
                                        placeholder='CA'
                                        maxLength={2}
                                        {...register('businessAddress.state')}
                                        className={errors.businessAddress?.state ? 'border-red-500' : ''}
                                    />
                                    {errors.businessAddress?.state && (
                                        <p className='text-red-500 text-sm'>{errors.businessAddress.state.message}</p>
                                    )}
                                </div>
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <Label htmlFor='zipCode'>ZIP Code *</Label>
                                    <Input
                                        id='zipCode'
                                        placeholder='12345'
                                        {...register('businessAddress.zipCode')}
                                        className={errors.businessAddress?.zipCode ? 'border-red-500' : ''}
                                    />
                                    {errors.businessAddress?.zipCode && (
                                        <p className='text-red-500 text-sm'>{errors.businessAddress.zipCode.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Mailing Address */}
                        <div className='space-y-4'>
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='sameAddress'
                                    checked={sameAsBusinessAddress}
                                    onCheckedChange={checked => setSameAsBusinessAddress(checked as boolean)}
                                />
                                <Label htmlFor='sameAddress'>Mailing address is the same as business address</Label>
                            </div>

                            {!sameAsBusinessAddress && (
                                <div className='space-y-4'>
                                    <h3 className='text-lg font-semibold'>Mailing Address</h3>
                                    <div>
                                        <Label>Street Address</Label>
                                        <Input {...register('mailingAddress.street')} />
                                    </div>
                                    <div>
                                        <Label>Suite/Unit</Label>
                                        <Input {...register('mailingAddress.street2')} />
                                    </div>
                                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                        <div className='md:col-span-2'>
                                            <Label>City</Label>
                                            <Input {...register('mailingAddress.city')} />
                                        </div>
                                        <div>
                                            <Label>State</Label>
                                            <Input
                                                placeholder='CA'
                                                maxLength={2}
                                                {...register('mailingAddress.state')}
                                            />
                                        </div>
                                    </div>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                        <div>
                                            <Label>ZIP Code</Label>
                                            <Input
                                                placeholder='12345'
                                                {...register('mailingAddress.zipCode')}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Contact Information */}
                        <div className='space-y-4'>
                            <h3 className='text-lg font-semibold'>Contact Information</h3>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <Label htmlFor='businessPhone'>Business Phone *</Label>
                                    <Input
                                        id='businessPhone'
                                        placeholder='(555) 123-4567'
                                        {...register('businessPhone')}
                                        className={errors.businessPhone ? 'border-red-500' : ''}
                                    />
                                    {errors.businessPhone && (
                                        <p className='text-red-500 text-sm'>{errors.businessPhone.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor='businessEmail'>Business Email *</Label>
                                    <Input
                                        id='businessEmail'
                                        type='email'
                                        {...register('businessEmail')}
                                        className={errors.businessEmail ? 'border-red-500' : ''}
                                    />
                                    {errors.businessEmail && (
                                        <p className='text-red-500 text-sm'>{errors.businessEmail.message}</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <Label htmlFor='website'>Website (Optional)</Label>
                                <Input
                                    id='website'
                                    placeholder='https://www.example.com'
                                    {...register('website')}
                                    className={errors.website ? 'border-red-500' : ''}
                                />
                                {errors.website && <p className='text-red-500 text-sm'>{errors.website.message}</p>}
                            </div>
                        </div>

                        {/* Business Description */}
                        <div className='space-y-4'>
                            <h3 className='text-lg font-semibold'>Business Description</h3>
                            <div>
                                <Label htmlFor='description'>Describe your business activities *</Label>
                                <Textarea
                                    id='description'
                                    placeholder='Provide a detailed description of your business activities, products, and services...'
                                    {...register('description')}
                                    className={errors.description ? 'border-red-500' : ''}
                                    rows={4}
                                />
                                {errors.description && (
                                    <p className='text-red-500 text-sm'>{errors.description.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Business Activity Information */}
                        <div className='space-y-4'>
                            <h3 className='text-lg font-semibold'>Business Activity</h3>
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='isCashIntensive'
                                    {...register('isCashIntensive')}
                                />
                                <Label htmlFor='isCashIntensive'>
                                    This business deals heavily with cash transactions
                                </Label>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                <div>
                                    <Label htmlFor='monthlyTransactionVolume'>Monthly Transaction Volume ($) *</Label>
                                    <Input
                                        id='monthlyTransactionVolume'
                                        type='number'
                                        placeholder='50000'
                                        {...register('monthlyTransactionVolume', { valueAsNumber: true })}
                                        className={errors.monthlyTransactionVolume ? 'border-red-500' : ''}
                                    />
                                    {errors.monthlyTransactionVolume && (
                                        <p className='text-red-500 text-sm'>
                                            {errors.monthlyTransactionVolume.message}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor='monthlyTransactionCount'>Monthly Transaction Count *</Label>
                                    <Input
                                        id='monthlyTransactionCount'
                                        type='number'
                                        placeholder='100'
                                        {...register('monthlyTransactionCount', { valueAsNumber: true })}
                                        className={errors.monthlyTransactionCount ? 'border-red-500' : ''}
                                    />
                                    {errors.monthlyTransactionCount && (
                                        <p className='text-red-500 text-sm'>{errors.monthlyTransactionCount.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor='expectedBalance'>Expected Average Balance ($) *</Label>
                                    <Input
                                        id='expectedBalance'
                                        type='number'
                                        placeholder='25000'
                                        {...register('expectedBalance', { valueAsNumber: true })}
                                        className={errors.expectedBalance ? 'border-red-500' : ''}
                                    />
                                    {errors.expectedBalance && (
                                        <p className='text-red-500 text-sm'>{errors.expectedBalance.message}</p>
                                    )}
                                </div>
                            </div>
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
                                disabled={updateBusinessProfileMutation.isPending}
                            >
                                {updateBusinessProfileMutation.isPending ? 'Saving...' : 'Continue'}
                                <ArrowRight className='ml-2 h-4 w-4' />
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
