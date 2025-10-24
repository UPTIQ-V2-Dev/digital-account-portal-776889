import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authService } from '@/services/auth';
import type { LoginRequest } from '@/types/user';

const loginSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters')
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema)
    });

    const loginMutation = useMutation({
        mutationFn: async (credentials: LoginRequest) => {
            const response = await authService.login(credentials);
            return response;
        },
        onSuccess: data => {
            toast.success('Successfully logged in!');
            navigate(from, { replace: true });
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || 'Login failed. Please try again.';
            toast.error(errorMessage);
        }
    });

    const onSubmit = (data: LoginFormData) => {
        loginMutation.mutate(data);
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-md w-full space-y-8'>
                <div className='text-center'>
                    <h2 className='text-3xl font-bold text-gray-900 mb-2'>Welcome Back</h2>
                    <p className='text-gray-600'>Sign in to your Digital Banking Portal</p>
                </div>

                <Card className='w-full'>
                    <CardHeader className='space-y-1'>
                        <CardTitle className='text-2xl font-bold text-center'>Sign In</CardTitle>
                        <CardDescription className='text-center'>
                            Enter your email and password to access your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className='space-y-4'
                        >
                            <div className='space-y-2'>
                                <Label htmlFor='email'>Email Address</Label>
                                <Input
                                    id='email'
                                    type='email'
                                    placeholder='Enter your email'
                                    autoComplete='email'
                                    {...register('email')}
                                    className={errors.email ? 'border-red-500' : ''}
                                />
                                {errors.email && <p className='text-sm text-red-600'>{errors.email.message}</p>}
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='password'>Password</Label>
                                <div className='relative'>
                                    <Input
                                        id='password'
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder='Enter your password'
                                        autoComplete='current-password'
                                        {...register('password')}
                                        className={errors.password ? 'border-red-500' : ''}
                                    />
                                    <Button
                                        type='button'
                                        variant='ghost'
                                        size='sm'
                                        className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className='h-4 w-4 text-gray-500' />
                                        ) : (
                                            <Eye className='h-4 w-4 text-gray-500' />
                                        )}
                                    </Button>
                                </div>
                                {errors.password && <p className='text-sm text-red-600'>{errors.password.message}</p>}
                            </div>

                            {loginMutation.error && (
                                <Alert variant='destructive'>
                                    <AlertDescription>
                                        {loginMutation.error?.response?.data?.message ||
                                            'Login failed. Please check your credentials and try again.'}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Button
                                type='submit'
                                className='w-full'
                                disabled={loginMutation.isPending}
                            >
                                {loginMutation.isPending ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        Signing In...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>

                        <div className='mt-6'>
                            <div className='relative'>
                                <div className='absolute inset-0 flex items-center'>
                                    <div className='w-full border-t border-gray-300' />
                                </div>
                                <div className='relative flex justify-center text-sm'>
                                    <span className='px-2 bg-white text-gray-500'>New to our platform?</span>
                                </div>
                            </div>

                            <div className='mt-6'>
                                <Link
                                    to='/register'
                                    className='w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
                                >
                                    Create New Account
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
