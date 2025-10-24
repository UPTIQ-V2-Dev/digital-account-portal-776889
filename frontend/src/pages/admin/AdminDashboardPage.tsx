import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

export const AdminDashboardPage = () => {
    return (
        <div className='container mx-auto px-4 py-8'>
            <Card>
                <CardHeader>
                    <CardTitle>Admin Dashboard</CardTitle>
                    <CardDescription>Coming Soon</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>This page will show the admin dashboard for managing applications.</p>
                </CardContent>
            </Card>
        </div>
    );
};
