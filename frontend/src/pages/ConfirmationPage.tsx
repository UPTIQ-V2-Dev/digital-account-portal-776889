import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, CreditCard, Mail, Phone, Home, Calendar } from 'lucide-react';
import { useApplication } from '@/context/ApplicationContext';
import { APP_NAME } from '@/lib/constants';

export const ConfirmationPage = () => {
    const navigate = useNavigate();
    const { state, completeStep, clearApplication } = useApplication();
    const [referenceNumber] = useState(
        () => `REF${Date.now().toString().slice(-8)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    );

    useEffect(() => {
        completeStep('confirmation');
    }, [completeStep]);

    const handleStartNewApplication = () => {
        clearApplication();
        navigate('/');
    };

    if (!state.currentApplication) {
        navigate('/');
        return null;
    }

    return (
        <div className='p-6 md:p-8 max-w-4xl mx-auto'>
            {/* Success Header */}
            <div className='text-center mb-8'>
                <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <CheckCircle className='h-12 w-12 text-green-600' />
                </div>
                <h1 className='text-3xl font-bold text-green-700 mb-2'>Application Submitted Successfully!</h1>
                <p className='text-lg text-gray-600'>
                    Thank you for choosing {APP_NAME}. Your application has been received and is being processed.
                </p>
            </div>

            {/* Reference Information */}
            <Card className='mb-8 border-green-200 bg-green-50'>
                <CardHeader>
                    <CardTitle className='text-green-800'>Application Reference</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                            <span className='text-sm text-green-700'>Reference Number:</span>
                            <div className='font-mono text-lg font-bold text-green-900'>{referenceNumber}</div>
                        </div>
                        <div>
                            <span className='text-sm text-green-700'>Application ID:</span>
                            <div className='font-mono text-lg font-bold text-green-900'>
                                {state.currentApplication.id}
                            </div>
                        </div>
                        <div>
                            <span className='text-sm text-green-700'>Submitted:</span>
                            <div className='font-semibold text-green-900'>
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>
                        <div>
                            <span className='text-sm text-green-700'>Account Type:</span>
                            <Badge
                                variant='outline'
                                className='ml-2 border-green-300 text-green-700'
                            >
                                {state.currentApplication.accountType} Account
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* What Happens Next */}
            <Card className='mb-8'>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Calendar className='h-5 w-5' />
                        What Happens Next
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='space-y-4'>
                        <div className='flex items-start gap-4 p-4 border rounded-lg'>
                            <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600'>
                                1
                            </div>
                            <div>
                                <h4 className='font-semibold text-gray-900'>Application Review</h4>
                                <p className='text-gray-600 text-sm mt-1'>
                                    Our underwriting team will review your application and verify all information. This
                                    process typically takes 1-2 business days.
                                </p>
                            </div>
                        </div>

                        <div className='flex items-start gap-4 p-4 border rounded-lg'>
                            <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600'>
                                2
                            </div>
                            <div>
                                <h4 className='font-semibold text-gray-900'>Decision Notification</h4>
                                <p className='text-gray-600 text-sm mt-1'>
                                    You'll receive an email or phone call with the decision on your application. If
                                    approved, we'll provide your new account details.
                                </p>
                            </div>
                        </div>

                        <div className='flex items-start gap-4 p-4 border rounded-lg'>
                            <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600'>
                                3
                            </div>
                            <div>
                                <h4 className='font-semibold text-gray-900'>Account Setup & Card Delivery</h4>
                                <p className='text-gray-600 text-sm mt-1'>
                                    Once approved, your account will be opened and your debit card will be mailed to
                                    your address within 7-10 business days.
                                </p>
                            </div>
                        </div>

                        <div className='flex items-start gap-4 p-4 border rounded-lg'>
                            <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600'>
                                4
                            </div>
                            <div>
                                <h4 className='font-semibold text-gray-900'>Welcome & Onboarding</h4>
                                <p className='text-gray-600 text-sm mt-1'>
                                    You'll receive welcome materials and instructions for accessing online banking and
                                    mobile app services.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Important Information */}
            <Card className='mb-8 border-blue-200 bg-blue-50'>
                <CardHeader>
                    <CardTitle className='text-blue-800'>Important Information</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3 text-sm text-blue-800'>
                    <div className='flex items-start gap-3'>
                        <Mail className='h-4 w-4 mt-0.5 flex-shrink-0' />
                        <p>
                            <strong>Check your email regularly</strong> - We'll send updates about your application
                            status to the email address you provided.
                        </p>
                    </div>
                    <div className='flex items-start gap-3'>
                        <Phone className='h-4 w-4 mt-0.5 flex-shrink-0' />
                        <p>
                            <strong>Keep your phone available</strong> - We may call you if we need additional
                            information or documentation to complete your application.
                        </p>
                    </div>
                    <div className='flex items-start gap-3'>
                        <Home className='h-4 w-4 mt-0.5 flex-shrink-0' />
                        <p>
                            <strong>Ensure your address is correct</strong> - Your debit card and welcome materials will
                            be sent to the mailing address you provided.
                        </p>
                    </div>
                    <div className='flex items-start gap-3'>
                        <CreditCard className='h-4 w-4 mt-0.5 flex-shrink-0' />
                        <p>
                            <strong>Have your reference number ready</strong> - Use reference number {referenceNumber}{' '}
                            when contacting us about your application.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className='mb-8'>
                <CardHeader>
                    <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                            <h4 className='font-semibold text-gray-900 mb-2'>Customer Service</h4>
                            <div className='space-y-1 text-sm text-gray-600'>
                                <p>Phone: 1-800-BANKING (1-800-226-5464)</p>
                                <p>Email: support@{APP_NAME.toLowerCase()}.com</p>
                                <p>Hours: Monday - Friday, 8 AM - 8 PM EST</p>
                            </div>
                        </div>
                        <div>
                            <h4 className='font-semibold text-gray-900 mb-2'>Application Status</h4>
                            <div className='space-y-1 text-sm text-gray-600'>
                                <p>Check online: www.{APP_NAME.toLowerCase()}.com/status</p>
                                <p>Have your reference number ready</p>
                                <p>Updates available 24/7</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <Button
                    onClick={() => window.print()}
                    variant='outline'
                    size='lg'
                >
                    Print Confirmation
                </Button>

                <Button
                    onClick={handleStartNewApplication}
                    size='lg'
                >
                    Start New Application
                </Button>
            </div>

            {/* Footer Note */}
            <div className='text-center mt-8 p-4 bg-gray-50 rounded-lg'>
                <p className='text-sm text-gray-600'>
                    Thank you for choosing {APP_NAME} for your banking needs. We look forward to serving you!
                </p>
            </div>
        </div>
    );
};
