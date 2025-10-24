import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { authService } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

const registerSchema = z
    .object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Please enter a valid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
        agreeToTerms: z.boolean().refine(val => val === true, {
            message: 'You must agree to the terms and conditions'
        })
    })
    .refine(data => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword']
    });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema)
    });

    const registerMutation = useMutation({
        mutationFn: authService.register,
        onSuccess: () => {
            toast.success('Account created successfully!');
            navigate('/');
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(errorMessage);
        }
    });

    const onSubmit = (data: RegisterFormData) => {
        registerMutation.mutate({
            name: data.name,
            email: data.email,
            password: data.password
        });
    };

    return (
        <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
            <Card className='w-full max-w-md'>
                <CardHeader className='text-center'>
                    <CardTitle className='text-2xl font-bold'>Create Account</CardTitle>
                    <CardDescription>Sign up to start your account opening process</CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className='space-y-4'
                    >
                        <div className='space-y-2'>
                            <Label htmlFor='name'>Full Name</Label>
                            <div className='relative'>
                                <User className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                                <Input
                                    id='name'
                                    type='text'
                                    placeholder='Enter your full name'
                                    className='pl-10'
                                    {...register('name')}
                                />
                            </div>
                            {errors.name && <p className='text-sm text-red-600'>{errors.name.message}</p>}
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='email'>Email Address</Label>
                            <div className='relative'>
                                <Mail className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                                <Input
                                    id='email'
                                    type='email'
                                    placeholder='Enter your email'
                                    className='pl-10'
                                    {...register('email')}
                                />
                            </div>
                            {errors.email && <p className='text-sm text-red-600'>{errors.email.message}</p>}
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='password'>Password</Label>
                            <div className='relative'>
                                <Lock className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                                <Input
                                    id='password'
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder='Create a password'
                                    className='pl-10 pr-10'
                                    {...register('password')}
                                />
                                <Button
                                    type='button'
                                    variant='ghost'
                                    size='sm'
                                    className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className='h-4 w-4 text-gray-400' />
                                    ) : (
                                        <Eye className='h-4 w-4 text-gray-400' />
                                    )}
                                </Button>
                            </div>
                            {errors.password && <p className='text-sm text-red-600'>{errors.password.message}</p>}
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='confirmPassword'>Confirm Password</Label>
                            <div className='relative'>
                                <Lock className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                                <Input
                                    id='confirmPassword'
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder='Confirm your password'
                                    className='pl-10 pr-10'
                                    {...register('confirmPassword')}
                                />
                                <Button
                                    type='button'
                                    variant='ghost'
                                    size='sm'
                                    className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className='h-4 w-4 text-gray-400' />
                                    ) : (
                                        <Eye className='h-4 w-4 text-gray-400' />
                                    )}
                                </Button>
                            </div>
                            {errors.confirmPassword && (
                                <p className='text-sm text-red-600'>{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <div className='flex items-center space-x-2'>
                            <Checkbox
                                id='agreeToTerms'
                                {...register('agreeToTerms')}
                            />
                            <Label
                                htmlFor='agreeToTerms'
                                className='text-sm'
                            >
                                I agree to the{' '}
                                <Link
                                    to='/terms'
                                    className='text-blue-600 hover:text-blue-800 hover:underline'
                                >
                                    Terms and Conditions
                                </Link>{' '}
                                and{' '}
                                <Link
                                    to='/privacy'
                                    className='text-blue-600 hover:text-blue-800 hover:underline'
                                >
                                    Privacy Policy
                                </Link>
                            </Label>
                        </div>
                        {errors.agreeToTerms && <p className='text-sm text-red-600'>{errors.agreeToTerms.message}</p>}

                        {registerMutation.isError && (
                            <Alert variant='destructive'>
                                <AlertDescription>
                                    {(registerMutation.error as any)?.response?.data?.message ||
                                        'Registration failed. Please check your information and try again.'}
                                </AlertDescription>
                            </Alert>
                        )}

                        <Button
                            type='submit'
                            className='w-full'
                            disabled={registerMutation.isPending}
                        >
                            {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
                        </Button>

                        <div className='text-center'>
                            <p className='text-sm text-gray-600'>
                                Already have an account?{' '}
                                <Link
                                    to='/login'
                                    className='text-blue-600 hover:text-blue-800 hover:underline'
                                >
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
