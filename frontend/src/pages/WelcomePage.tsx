import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Building2, Zap, Shield, Star, LogOut } from 'lucide-react';

export const WelcomePage = () => {
    const navigate = useNavigate();

    const handleAccountTypeSelect = () => {
        navigate('/application-type');
    };

    return (
        <div className='min-h-screen bg-white bubble-background'>
            {/* Header */}
            <header className='bg-white/80 backdrop-blur-sm border-b border-gray-100'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='flex justify-between items-center h-16'>
                        <div className='flex items-center'>
                            <span className='text-2xl font-bold text-blue-600'>DAO Agent</span>
                        </div>
                        <div className='flex items-center gap-4'>
                            <Button
                                variant='ghost'
                                size='sm'
                                className='text-gray-500 hover:text-gray-700 text-sm font-medium'
                            >
                                Admin Dashboard
                            </Button>
                            <Button
                                variant='ghost'
                                size='sm'
                                className='text-gray-500 hover:text-gray-700 text-sm font-medium'
                            >
                                Compliance
                            </Button>
                            <Button
                                variant='ghost'
                                size='sm'
                                className='p-2'
                            >
                                <LogOut className='w-4 h-4 text-gray-500' />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className='flex-1'>
                {/* Trust Indicator */}
                <div className='text-center pt-8 pb-4'>
                    <Badge
                        variant='outline'
                        className='bg-orange-50 text-orange-600 border-orange-200 font-medium px-4 py-1 rounded-full'
                    >
                        <Star className='w-4 h-4 mr-1 fill-current' />
                        Trusted by 10,000+ customers
                    </Badge>
                </div>

                {/* Hero Section */}
                <section className='py-8 px-4 sm:px-6 lg:px-8'>
                    <div className='max-w-4xl mx-auto text-center'>
                        <h1 className='text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-2 leading-tight tracking-tight'>
                            Open Your Account
                        </h1>
                        <h2 className='text-5xl md:text-6xl lg:text-7xl font-bold text-blue-600 mb-8 leading-tight tracking-tight'>
                            In Minutes
                        </h2>
                        <p className='text-lg text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed'>
                            Our AI-powered digital agent streamlines the account opening process with advanced
                            verification, risk assessment, and instant approvals.
                        </p>

                        {/* Account Type Selection */}
                        <div className='mb-16'>
                            <h3 className='text-2xl font-semibold text-gray-900 mb-8'>
                                What type of account would you like to open?
                            </h3>

                            <div className='grid md:grid-cols-2 gap-6 max-w-4xl mx-auto'>
                                <Card
                                    className='cursor-pointer transition-all duration-200 hover:shadow-lg bg-gray-50 border-gray-200'
                                    onClick={() => handleAccountTypeSelect()}
                                >
                                    <CardContent className='p-8 text-center'>
                                        <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                                            <User className='w-8 h-8 text-blue-600' />
                                        </div>
                                        <h4 className='text-xl font-semibold text-gray-900 mb-3'>Personal Account</h4>
                                        <p className='text-sm text-gray-600 leading-relaxed'>
                                            Checking, savings, and money market accounts for individuals with
                                            competitive rates and no hidden fees.
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card
                                    className='cursor-pointer transition-all duration-200 hover:shadow-lg bg-gray-50 border-gray-200'
                                    onClick={() => handleAccountTypeSelect()}
                                >
                                    <CardContent className='p-8 text-center'>
                                        <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                                            <Building2 className='w-8 h-8 text-blue-600' />
                                        </div>
                                        <h4 className='text-xl font-semibold text-gray-900 mb-3'>Business Account</h4>
                                        <p className='text-sm text-gray-600 leading-relaxed'>
                                            Commercial checking, savings, and money market accounts with advanced cash
                                            management tools.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Features */}
                        <div className='grid md:grid-cols-3 gap-6 max-w-5xl mx-auto'>
                            <Card className='border border-gray-200 bg-gray-100/50'>
                                <CardContent className='p-6 text-center'>
                                    <div className='w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4'>
                                        <Zap className='w-6 h-6 text-white' />
                                    </div>
                                    <h4 className='text-lg font-semibold text-gray-900 mb-2'>Lightning Fast</h4>
                                    <p className='text-sm text-gray-600 leading-relaxed'>
                                        Complete account opening in under 5 minutes with our AI-powered system.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className='border border-gray-200 bg-gray-100/50'>
                                <CardContent className='p-6 text-center'>
                                    <div className='w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4'>
                                        <Shield className='w-6 h-6 text-white' />
                                    </div>
                                    <h4 className='text-lg font-semibold text-gray-900 mb-2'>Bank-Grade Security</h4>
                                    <p className='text-sm text-gray-600 leading-relaxed'>
                                        Advanced KYC/KYB verification and fraud protection with 99.9% accuracy.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className='border border-gray-200 bg-gray-100/50'>
                                <CardContent className='p-6 text-center'>
                                    <div className='w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4'>
                                        <Zap className='w-6 h-6 text-white' />
                                    </div>
                                    <h4 className='text-lg font-semibold text-gray-900 mb-2'>Smart Approval</h4>
                                    <p className='text-sm text-gray-600 leading-relaxed'>
                                        95%+ applications approved automatically with intelligent risk assessment.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};
