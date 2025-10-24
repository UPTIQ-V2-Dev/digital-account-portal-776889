import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, CreditCard, CheckCircle, DollarSign, Percent } from 'lucide-react';
import { useApplication } from '@/context/ApplicationContext';
import { accountOpeningService } from '@/services/account-opening';
import { Product, ProductSelection } from '@/types/account-opening';
import { toast } from 'sonner';

export const ProductSelectionPage = () => {
    const navigate = useNavigate();
    const { state, setCurrentStep, completeStep, getPreviousStep, getNextStep } = useApplication();
    const [selectedProducts, setSelectedProducts] = useState<ProductSelection[]>([]);

    // Fetch available products
    const { data: productsData, isLoading } = useQuery({
        queryKey: ['products', state.currentApplication?.accountType],
        queryFn: () => accountOpeningService.getProducts(state.currentApplication?.accountType),
        enabled: !!state.currentApplication
    });

    const updateProductSelectionsMutation = useMutation({
        mutationFn: (selections: ProductSelection[]) =>
            accountOpeningService.updateProductSelections(state.currentApplication!.id, selections),
        onSuccess: response => {
            if (response.success) {
                completeStep('product_selection');
                const nextStep = getNextStep('product_selection', state.currentApplication?.accountType || 'consumer');
                if (nextStep) {
                    setCurrentStep(nextStep);
                    navigate(`/${nextStep.replace('_', '-')}`);
                }
                toast.success('Product selections saved successfully!');
            } else {
                toast.error(response.message || 'Failed to save product selections');
            }
        },
        onError: (error: any) => {
            console.error('Product selection update failed:', error);
            toast.error('Failed to save product selections. Please try again.');
        }
    });

    const handleProductToggle = (product: Product, selected: boolean) => {
        if (selected) {
            const newSelection: ProductSelection = {
                productId: product.id,
                product: product
            };
            setSelectedProducts([...selectedProducts, newSelection]);
        } else {
            setSelectedProducts(selectedProducts.filter(p => p.productId !== product.id));
        }
    };

    const handleContinue = () => {
        if (selectedProducts.length === 0) {
            toast.error('Please select at least one product to continue');
            return;
        }

        updateProductSelectionsMutation.mutate(selectedProducts);
    };

    const handleBack = () => {
        const previousStep = getPreviousStep('product_selection', state.currentApplication?.accountType || 'consumer');
        if (previousStep) {
            setCurrentStep(previousStep);
            navigate(`/${previousStep.replace('_', '-')}`);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatPercent = (rate: number) => {
        return `${(rate * 100).toFixed(2)}%`;
    };

    if (!state.currentApplication) {
        navigate('/application-type');
        return null;
    }

    const products = productsData?.success ? productsData.data : [];

    return (
        <div className='p-6 md:p-8'>
            <div className='mb-6'>
                <h3 className='text-lg font-semibold mb-2'>Available Account Products</h3>
                <p className='text-gray-600'>
                    Based on your answers to the questions presented, you have qualified for one or more bank accounts.
                    Please select one and continue.
                </p>
            </div>

            {isLoading ? (
                <div className='text-center py-8'>
                    <div className='text-gray-600'>Loading available products...</div>
                </div>
            ) : (
                <div className='space-y-6'>
                    {products.map(product => {
                        const isSelected = selectedProducts.some(p => p.productId === product.id);

                        return (
                            <Card
                                key={product.id}
                                className={`transition-all cursor-pointer hover:shadow-md ${
                                    isSelected ? 'ring-2 ring-blue-600 border-blue-200 bg-blue-50' : ''
                                }`}
                                onClick={() => handleProductToggle(product, !isSelected)}
                            >
                                <CardHeader className='pb-4'>
                                    <div className='flex items-start justify-between'>
                                        <div className='flex items-start gap-3 flex-1'>
                                            <Checkbox
                                                checked={isSelected}
                                                onChange={e => e.stopPropagation()}
                                                className='mt-1'
                                            />
                                            <div className='flex-1'>
                                                <div className='flex items-center gap-2 mb-2'>
                                                    <CardTitle className='text-xl'>{product.name}</CardTitle>
                                                    <Badge
                                                        variant={
                                                            product.type === 'checking'
                                                                ? 'default'
                                                                : product.type === 'savings'
                                                                  ? 'secondary'
                                                                  : 'outline'
                                                        }
                                                    >
                                                        {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
                                                    </Badge>
                                                </div>
                                                <CardDescription className='text-base'>
                                                    {product.description}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        {isSelected && <CheckCircle className='h-6 w-6 text-blue-600' />}
                                    </div>
                                </CardHeader>

                                <CardContent className='space-y-4'>
                                    {/* Key Details */}
                                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                                        <div className='flex items-center gap-2'>
                                            <DollarSign className='h-4 w-4 text-green-600' />
                                            <div className='text-sm'>
                                                <div className='font-medium'>Monthly Fee</div>
                                                <div className='text-gray-600'>
                                                    {formatCurrency(product.monthlyFee)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className='flex items-center gap-2'>
                                            <CreditCard className='h-4 w-4 text-blue-600' />
                                            <div className='text-sm'>
                                                <div className='font-medium'>Minimum Balance</div>
                                                <div className='text-gray-600'>
                                                    {formatCurrency(product.minimumBalance)}
                                                </div>
                                            </div>
                                        </div>

                                        {product.interestRate && (
                                            <div className='flex items-center gap-2'>
                                                <Percent className='h-4 w-4 text-purple-600' />
                                                <div className='text-sm'>
                                                    <div className='font-medium'>Interest Rate</div>
                                                    <div className='text-gray-600'>
                                                        {formatPercent(product.interestRate)}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Features */}
                                    <div>
                                        <h4 className='font-medium mb-2'>Features</h4>
                                        <div className='flex flex-wrap gap-2'>
                                            {product.features.map((feature, index) => (
                                                <Badge
                                                    key={index}
                                                    variant='outline'
                                                    className='text-xs'
                                                >
                                                    {feature}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}

                    {products.length === 0 && (
                        <Card>
                            <CardContent className='py-12'>
                                <div className='text-center space-y-4'>
                                    <div className='text-6xl'>📦</div>
                                    <h3 className='text-lg font-semibold'>No Products Available</h3>
                                    <p className='text-gray-600'>
                                        No qualifying products found based on your profile. Please contact customer
                                        service for assistance.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Selection Summary */}
            {selectedProducts.length > 0 && (
                <Card className='mt-6 bg-green-50 border-green-200'>
                    <CardHeader className='pb-3'>
                        <CardTitle className='text-green-800 text-lg'>Selected Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-2'>
                            {selectedProducts.map(selection => (
                                <div
                                    key={selection.productId}
                                    className='flex items-center justify-between'
                                >
                                    <span className='font-medium text-green-800'>{selection.product.name}</span>
                                    <Badge
                                        variant='outline'
                                        className='border-green-300 text-green-700'
                                    >
                                        {selection.product.type}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Navigation Buttons */}
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
                    type='button'
                    onClick={handleContinue}
                    disabled={selectedProducts.length === 0 || updateProductSelectionsMutation.isPending}
                    className='min-w-32'
                >
                    {updateProductSelectionsMutation.isPending ? (
                        'Saving...'
                    ) : (
                        <>
                            Continue
                            <ArrowRight className='ml-2 h-4 w-4' />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};
