import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export const ConfirmationPage = () => {
    return (
        <div className='container mx-auto px-4 py-8'>
            <Card>
                <CardHeader>
                    <CardTitle>Confirmation</CardTitle>
                    <CardDescription>Coming Soon</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>This page will show application submission confirmation.</p>
                </CardContent>
            </Card>
        </div>
    );
};
