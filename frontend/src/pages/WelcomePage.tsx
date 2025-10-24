import { useNavigate } from 'react-router-dom';
import { Building2, Shield, Clock, CheckCircle, ArrowRight } from 'lucide-react';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

import { useAuth } from '../context/AuthContext';
import { useApplication } from '../context/ApplicationContext';

export const WelcomePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { state, resetApplication } = useApplication();

    const handleGetStarted = () => {
        // Reset any existing application data
        resetApplication();
        navigate('/application-type');
    };

    const handleContinueApplication = () => {
        if (state.application) {
            // Navigate to the current step
            navigate(`/${state.currentStep.replace('_', '-')}`);
        }
    };

    const features = [
        {
            icon: Clock,
            title: 'Quick & Easy',
            description: 'Complete your application in just 10-15 minutes',
            color: 'text-blue-600'
        },
        {
            icon: Shield,
            title: 'Bank-Level Security',
            description: 'Your data is protected with industry-leading encryption',
            color: 'text-green-600'
        },
        {
            icon: CheckCircle,
            title: 'Instant Decisions',
            description: 'Get approved instantly for most applications',
            color: 'text-purple-600'
        }
    ];

    const benefits = [
        'No monthly maintenance fees with minimum balance',
        'Free online and mobile banking',
        'FDIC insured up to $250,000',
        '24/7 customer support',
        'Nationwide ATM network',
        'Mobile check deposit'
    ];

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50'>
            <div className='container mx-auto px-4 py-12'>
                {/* Hero Section */}
                <div className='text-center mb-12'>
                    <div className='flex justify-center mb-6'>
                        <div className='flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg'>
                            <Building2 className='h-8 w-8' />
                        </div>
                    </div>

                    <h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>Welcome to Digital Banking</h1>
                    <p className='text-xl text-gray-600 mb-2'>Open your new account in minutes, not hours</p>
                    <p className='text-lg text-gray-500'>
                        Hello {user?.name || 'there'}! Let's get your banking journey started.
                    </p>
                </div>

                {/* Continue Existing Application */}
                {state.application && (
                    <div className='max-w-2xl mx-auto mb-8'>
                        <Card className='border-blue-200 bg-blue-50'>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>
                                    <Clock className='h-5 w-5 text-blue-600' />
                                    Continue Your Application
                                </CardTitle>
                                <CardDescription>
                                    You have an application in progress (ID: {state.application.id})
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <p className='text-sm text-gray-600 mb-1'>
                                            Current Step:{' '}
                                            <span className='font-medium'>
                                                {state.currentStep
                                                    .replace('_', ' ')
                                                    .replace(/\b\w/g, l => l.toUpperCase())}
                                            </span>
                                        </p>
                                        <Badge
                                            variant='outline'
                                            className='text-blue-600 border-blue-600'
                                        >
                                            {state.application.accountType} Account
                                        </Badge>
                                    </div>
                                    <Button
                                        onClick={handleContinueApplication}
                                        className='ml-4'
                                    >
                                        Continue
                                        <ArrowRight className='ml-2 h-4 w-4' />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Features Grid */}
                <div className='grid md:grid-cols-3 gap-8 mb-12'>
                    {features.map((feature, index) => {
                        const IconComponent = feature.icon;
                        return (
                            <Card
                                key={index}
                                className='text-center hover:shadow-lg transition-shadow'
                            >
                                <CardHeader>
                                    <div
                                        className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-50 ${feature.color}`}
                                    >
                                        <IconComponent className='h-6 w-6' />
                                    </div>
                                    <CardTitle className='text-xl'>{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className='text-base'>{feature.description}</CardDescription>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Account Types Preview */}
                <div className='max-w-4xl mx-auto mb-12'>
                    <h2 className='text-2xl font-bold text-center mb-8'>Choose Your Account Type</h2>
                    <div className='grid md:grid-cols-2 gap-8'>
                        {/* Consumer Account */}
                        <Card className='hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-300'>
                            <CardHeader>
                                <CardTitle className='text-xl text-blue-600'>Personal Banking</CardTitle>
                                <CardDescription>Perfect for individuals and families</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className='space-y-2 text-sm text-gray-600'>
                                    <li className='flex items-center gap-2'>
                                        <CheckCircle className='h-4 w-4 text-green-500' />
                                        Checking & Savings Accounts
                                    </li>
                                    <li className='flex items-center gap-2'>
                                        <CheckCircle className='h-4 w-4 text-green-500' />
                                        Debit Cards & Online Banking
                                    </li>
                                    <li className='flex items-center gap-2'>
                                        <CheckCircle className='h-4 w-4 text-green-500' />
                                        Personal Loans & Credit Cards
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Commercial Account */}
                        <Card className='hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-300'>
                            <CardHeader>
                                <CardTitle className='text-xl text-blue-600'>Business Banking</CardTitle>
                                <CardDescription>Designed for businesses and organizations</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className='space-y-2 text-sm text-gray-600'>
                                    <li className='flex items-center gap-2'>
                                        <CheckCircle className='h-4 w-4 text-green-500' />
                                        Business Checking & Savings
                                    </li>
                                    <li className='flex items-center gap-2'>
                                        <CheckCircle className='h-4 w-4 text-green-500' />
                                        Multiple Authorized Signers
                                    </li>
                                    <li className='flex items-center gap-2'>
                                        <CheckCircle className='h-4 w-4 text-green-500' />
                                        Business Credit Lines
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Benefits Section */}
                <div className='max-w-3xl mx-auto mb-12'>
                    <h2 className='text-2xl font-bold text-center mb-8'>Why Choose Us?</h2>
                    <div className='grid md:grid-cols-2 gap-4'>
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className='flex items-center gap-3'
                            >
                                <CheckCircle className='h-5 w-5 text-green-500 flex-shrink-0' />
                                <span className='text-gray-700'>{benefit}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className='text-center'>
                    <Card className='max-w-2xl mx-auto'>
                        <CardHeader>
                            <CardTitle className='text-2xl'>Ready to Get Started?</CardTitle>
                            <CardDescription className='text-lg'>
                                Open your account today and experience modern banking
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='pt-6'>
                            <Button
                                size='lg'
                                onClick={handleGetStarted}
                                className='px-8 py-3 text-lg'
                            >
                                Start My Application
                                <ArrowRight className='ml-2 h-5 w-5' />
                            </Button>
                            <p className='text-sm text-gray-500 mt-4'>
                                Takes only 10-15 minutes • FDIC Insured • No hidden fees
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Patriot Act Notice */}
                <div className='max-w-4xl mx-auto mt-12'>
                    <Card className='bg-gray-50 border-gray-200'>
                        <CardContent className='pt-6'>
                            <h3 className='text-sm font-semibold text-gray-900 mb-2'>
                                Important Information About Procedures for Opening a New Account
                            </h3>
                            <p className='text-xs text-gray-600 leading-relaxed'>
                                To help the government fight the funding of terrorism and money laundering activities,
                                Federal law requires all financial institutions to obtain, verify, and record
                                information that identifies each person who opens an account. What this means for you:
                                When you open an account, we will ask for your name, address, date of birth, and other
                                information that will allow us to identify you. We may also ask to see your driver's
                                license or other identifying documents.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
