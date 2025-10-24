import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export const BusinessProfilePage = () => {
    return (
        <div className='container mx-auto px-4 py-8'>
            <Card>
                <CardHeader>
                    <CardTitle>Business Profile</CardTitle>
                    <CardDescription>Coming Soon</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>This page will collect business information for commercial applications.</p>
                </CardContent>
            </Card>
        </div>
    );
};
