import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, User } from 'lucide-react';
import { useApplication } from '@/context/ApplicationContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { accountOpeningService } from '@/services/account-opening';
import { useState, useEffect } from 'react';
import { PersonalInfo } from '@/types/account-opening';
import { toast } from 'sonner';

const personalInfoSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    middleName: z.string().optional(),
    lastName: z.string().min(1, 'Last name is required'),
    suffix: z.string().optional(),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    ssn: z.string().regex(/^\d{3}-?\d{2}-?\d{4}$/, 'Invalid SSN format'),
    phone: z.string().regex(/^\+?1?[-.(]?\d{3}[-.)\s]?\d{3}[-.]?\d{4}$/, 'Invalid phone number'),
    email: z.string().email('Invalid email address'),
    mailingAddress: z.object({
        street: z.string().min(1, 'Street address is required'),
        street2: z.string().optional(),
        city: z.string().min(1, 'City is required'),
        state: z.string().min(2, 'State is required').max(2, 'State must be 2 characters'),
        zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid zip code'),
        country: z.string().default('US')
    }),
    physicalAddress: z
        .object({
            street: z.string().optional(),
            street2: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            zipCode: z.string().optional(),
            country: z.string().optional()
        })
        .optional(),
    employmentStatus: z.enum(['employed', 'unemployed', 'self_employed', 'retired', 'student']),
    occupation: z.string().optional(),
    employer: z.string().optional(),
    workPhone: z.string().optional()
});

type PersonalInfoForm = z.infer<typeof personalInfoSchema>;

export const PersonalInfoPage = () => {
    const navigate = useNavigate();
    const { state, setCurrentStep, completeStep, getPreviousStep, getNextStep } = useApplication();
    const [sameAsMailingAddress, setSameAsMailingAddress] = useState(true);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset
    } = useForm({
        resolver: zodResolver(personalInfoSchema),
        defaultValues: {
            mailingAddress: { country: 'US' },
            employmentStatus: 'employed'
        }
    });

    const mailingAddress = watch('mailingAddress');

    // Load existing personal info
    const { data: existingPersonalInfo } = useQuery({
        queryKey: ['personal-info', state.currentApplication?.id],
        queryFn: () => accountOpeningService.getPersonalInfo(state.currentApplication!.id),
        enabled: !!state.currentApplication?.id
    });

    // Update personal info mutation
    const updatePersonalInfoMutation = useMutation({
        mutationFn: (data: PersonalInfo) =>
            accountOpeningService.updatePersonalInfo(state.currentApplication!.id, data),
        onSuccess: () => {
            toast.success('Personal information saved successfully');
            completeStep('personal_info');
            const nextStep = getNextStep('personal_info', state.currentApplication!.accountType);
            if (nextStep) {
                setCurrentStep(nextStep);
                navigate(`/${nextStep.replace('_', '-')}`);
            }
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to save personal information');
        }
    });

    // Load existing data when available
    useEffect(() => {
        if (existingPersonalInfo?.success && existingPersonalInfo.data) {
            const data = existingPersonalInfo.data;
            reset({
                firstName: data.firstName,
                middleName: data.middleName || '',
                lastName: data.lastName,
                suffix: data.suffix || '',
                dateOfBirth: data.dateOfBirth,
                ssn: data.ssn,
                phone: data.phone,
                email: data.email,
                mailingAddress: data.mailingAddress,
                physicalAddress: data.physicalAddress,
                employmentStatus: data.employmentStatus,
                occupation: data.occupation || '',
                employer: data.employer || '',
                workPhone: data.workPhone || ''
            });
        }
    }, [existingPersonalInfo, reset]);

    // Handle same as mailing address
    useEffect(() => {
        if (sameAsMailingAddress && mailingAddress) {
            setValue('physicalAddress', mailingAddress);
        }
    }, [sameAsMailingAddress, mailingAddress, setValue]);

    const onSubmit = (data: PersonalInfoForm) => {
        const physicalAddress = sameAsMailingAddress
            ? data.mailingAddress
            : data.physicalAddress && data.physicalAddress.street
              ? (data.physicalAddress as any)
              : undefined;

        const personalInfo: PersonalInfo = {
            ...data,
            physicalAddress
        };
        updatePersonalInfoMutation.mutate(personalInfo);
    };

    const handleBack = () => {
        const previousStep = getPreviousStep('personal_info', state.currentApplication!.accountType);
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
                        <User className='h-5 w-5' />
                        Personal Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className='space-y-6'
                    >
                        {/* Personal Details */}
                        <div className='space-y-4'>
                            <h3 className='text-lg font-semibold'>Personal Details</h3>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <Label htmlFor='firstName'>First Name *</Label>
                                    <Input
                                        id='firstName'
                                        {...register('firstName')}
                                        className={errors.firstName ? 'border-red-500' : ''}
                                    />
                                    {errors.firstName && (
                                        <p className='text-red-500 text-sm'>{errors.firstName.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor='middleName'>Middle Name</Label>
                                    <Input
                                        id='middleName'
                                        {...register('middleName')}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor='lastName'>Last Name *</Label>
                                    <Input
                                        id='lastName'
                                        {...register('lastName')}
                                        className={errors.lastName ? 'border-red-500' : ''}
                                    />
                                    {errors.lastName && (
                                        <p className='text-red-500 text-sm'>{errors.lastName.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor='suffix'>Suffix</Label>
                                    <Select onValueChange={value => setValue('suffix', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select suffix' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='Jr'>Jr.</SelectItem>
                                            <SelectItem value='Sr'>Sr.</SelectItem>
                                            <SelectItem value='II'>II</SelectItem>
                                            <SelectItem value='III'>III</SelectItem>
                                            <SelectItem value='IV'>IV</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <Label htmlFor='dateOfBirth'>Date of Birth *</Label>
                                    <Input
                                        id='dateOfBirth'
                                        type='date'
                                        {...register('dateOfBirth')}
                                        className={errors.dateOfBirth ? 'border-red-500' : ''}
                                    />
                                    {errors.dateOfBirth && (
                                        <p className='text-red-500 text-sm'>{errors.dateOfBirth.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor='ssn'>Social Security Number *</Label>
                                    <Input
                                        id='ssn'
                                        placeholder='XXX-XX-XXXX'
                                        {...register('ssn')}
                                        className={errors.ssn ? 'border-red-500' : ''}
                                    />
                                    {errors.ssn && <p className='text-red-500 text-sm'>{errors.ssn.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className='space-y-4'>
                            <h3 className='text-lg font-semibold'>Contact Information</h3>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <Label htmlFor='phone'>Phone Number *</Label>
                                    <Input
                                        id='phone'
                                        placeholder='(555) 123-4567'
                                        {...register('phone')}
                                        className={errors.phone ? 'border-red-500' : ''}
                                    />
                                    {errors.phone && <p className='text-red-500 text-sm'>{errors.phone.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor='email'>Email Address *</Label>
                                    <Input
                                        id='email'
                                        type='email'
                                        {...register('email')}
                                        className={errors.email ? 'border-red-500' : ''}
                                    />
                                    {errors.email && <p className='text-red-500 text-sm'>{errors.email.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Mailing Address */}
                        <div className='space-y-4'>
                            <h3 className='text-lg font-semibold'>Mailing Address</h3>
                            <div>
                                <Label htmlFor='street'>Street Address *</Label>
                                <Input
                                    id='street'
                                    {...register('mailingAddress.street')}
                                    className={errors.mailingAddress?.street ? 'border-red-500' : ''}
                                />
                                {errors.mailingAddress?.street && (
                                    <p className='text-red-500 text-sm'>{errors.mailingAddress.street.message}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor='street2'>Apartment/Unit (Optional)</Label>
                                <Input
                                    id='street2'
                                    {...register('mailingAddress.street2')}
                                />
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                <div className='md:col-span-2'>
                                    <Label htmlFor='city'>City *</Label>
                                    <Input
                                        id='city'
                                        {...register('mailingAddress.city')}
                                        className={errors.mailingAddress?.city ? 'border-red-500' : ''}
                                    />
                                    {errors.mailingAddress?.city && (
                                        <p className='text-red-500 text-sm'>{errors.mailingAddress.city.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor='state'>State *</Label>
                                    <Input
                                        id='state'
                                        placeholder='CA'
                                        maxLength={2}
                                        {...register('mailingAddress.state')}
                                        className={errors.mailingAddress?.state ? 'border-red-500' : ''}
                                    />
                                    {errors.mailingAddress?.state && (
                                        <p className='text-red-500 text-sm'>{errors.mailingAddress.state.message}</p>
                                    )}
                                </div>
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <Label htmlFor='zipCode'>ZIP Code *</Label>
                                    <Input
                                        id='zipCode'
                                        placeholder='12345'
                                        {...register('mailingAddress.zipCode')}
                                        className={errors.mailingAddress?.zipCode ? 'border-red-500' : ''}
                                    />
                                    {errors.mailingAddress?.zipCode && (
                                        <p className='text-red-500 text-sm'>{errors.mailingAddress.zipCode.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Physical Address */}
                        <div className='space-y-4'>
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='sameAddress'
                                    checked={sameAsMailingAddress}
                                    onCheckedChange={checked => setSameAsMailingAddress(checked as boolean)}
                                />
                                <Label htmlFor='sameAddress'>Physical address is the same as mailing address</Label>
                            </div>

                            {!sameAsMailingAddress && (
                                <div className='space-y-4'>
                                    <h3 className='text-lg font-semibold'>Physical Address</h3>
                                    <div>
                                        <Label>Street Address</Label>
                                        <Input {...register('physicalAddress.street')} />
                                    </div>
                                    <div>
                                        <Label>Apartment/Unit</Label>
                                        <Input {...register('physicalAddress.street2')} />
                                    </div>
                                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                        <div className='md:col-span-2'>
                                            <Label>City</Label>
                                            <Input {...register('physicalAddress.city')} />
                                        </div>
                                        <div>
                                            <Label>State</Label>
                                            <Input
                                                placeholder='CA'
                                                maxLength={2}
                                                {...register('physicalAddress.state')}
                                            />
                                        </div>
                                    </div>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                        <div>
                                            <Label>ZIP Code</Label>
                                            <Input
                                                placeholder='12345'
                                                {...register('physicalAddress.zipCode')}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Employment Information */}
                        <div className='space-y-4'>
                            <h3 className='text-lg font-semibold'>Employment Information</h3>
                            <div>
                                <Label htmlFor='employmentStatus'>Employment Status *</Label>
                                <Select onValueChange={value => setValue('employmentStatus', value as any)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select employment status' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='employed'>Employed</SelectItem>
                                        <SelectItem value='self_employed'>Self-Employed</SelectItem>
                                        <SelectItem value='unemployed'>Unemployed</SelectItem>
                                        <SelectItem value='retired'>Retired</SelectItem>
                                        <SelectItem value='student'>Student</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <Label htmlFor='occupation'>Occupation</Label>
                                    <Input
                                        id='occupation'
                                        {...register('occupation')}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor='employer'>Employer</Label>
                                    <Input
                                        id='employer'
                                        {...register('employer')}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor='workPhone'>Work Phone</Label>
                                <Input
                                    id='workPhone'
                                    placeholder='(555) 123-4567'
                                    {...register('workPhone')}
                                />
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
                                disabled={updatePersonalInfoMutation.isPending}
                            >
                                {updatePersonalInfoMutation.isPending ? 'Saving...' : 'Continue'}
                                <ArrowRight className='ml-2 h-4 w-4' />
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
