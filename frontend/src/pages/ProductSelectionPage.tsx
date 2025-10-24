import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export const ProductSelectionPage = () => {
    return (
        <div className='container mx-auto px-4 py-8'>
            <Card>
                <CardHeader>
                    <CardTitle>Product Selection</CardTitle>
                    <CardDescription>Coming Soon</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>This page will allow users to select banking products.</p>
                </CardContent>
            </Card>
        </div>
    );
};
