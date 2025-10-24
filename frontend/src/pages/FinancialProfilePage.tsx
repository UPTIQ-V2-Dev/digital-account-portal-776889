import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export const FinancialProfilePage = () => {
    return (
        <div className='container mx-auto px-4 py-8'>
            <Card>
                <CardHeader>
                    <CardTitle>Financial Profile</CardTitle>
                    <CardDescription>Coming Soon</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>This page will collect financial information for the application.</p>
                </CardContent>
            </Card>
        </div>
    );
};
