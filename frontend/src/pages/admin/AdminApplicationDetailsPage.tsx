import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

export const AdminApplicationDetailsPage = () => {
    return (
        <div className='container mx-auto px-4 py-8'>
            <Card>
                <CardHeader>
                    <CardTitle>Application Details</CardTitle>
                    <CardDescription>Coming Soon</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>This page will show detailed view of a specific application for admin review.</p>
                </CardContent>
            </Card>
        </div>
    );
};
