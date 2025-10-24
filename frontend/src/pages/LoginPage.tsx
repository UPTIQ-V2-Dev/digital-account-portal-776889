import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { authService } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    rememberMe: z.boolean().optional()
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema)
    });

    const loginMutation = useMutation({
        mutationFn: authService.login,
        onSuccess: () => {
            toast.success('Login successful!');
            navigate('/');
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
            toast.error(errorMessage);
        }
    });

    const onSubmit = (data: LoginFormData) => {
        loginMutation.mutate({
            email: data.email,
            password: data.password
        });
    };

    return (
        <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
            <Card className='w-full max-w-md'>
                <CardHeader className='text-center'>
                    <CardTitle className='text-2xl font-bold'>Welcome Back</CardTitle>
                    <CardDescription>Sign in to your account to continue with your application</CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className='space-y-4'
                    >
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
                                    placeholder='Enter your password'
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

                        <div className='flex items-center justify-between'>
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='rememberMe'
                                    {...register('rememberMe')}
                                />
                                <Label
                                    htmlFor='rememberMe'
                                    className='text-sm'
                                >
                                    Remember me
                                </Label>
                            </div>
                            <Link
                                to='/forgot-password'
                                className='text-sm text-blue-600 hover:text-blue-800 hover:underline'
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {loginMutation.isError && (
                            <Alert variant='destructive'>
                                <AlertDescription>
                                    {(loginMutation.error as any)?.response?.data?.message ||
                                        'Login failed. Please check your credentials and try again.'}
                                </AlertDescription>
                            </Alert>
                        )}

                        <Button
                            type='submit'
                            className='w-full'
                            disabled={loginMutation.isPending}
                        >
                            {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
                        </Button>

                        <div className='text-center'>
                            <p className='text-sm text-gray-600'>
                                Don't have an account?{' '}
                                <Link
                                    to='/register'
                                    className='text-blue-600 hover:text-blue-800 hover:underline'
                                >
                                    Create one here
                                </Link>
                            </p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
