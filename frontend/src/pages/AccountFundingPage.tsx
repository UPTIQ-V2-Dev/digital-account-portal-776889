import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export const AccountFundingPage = () => {
    return (
        <div className='container mx-auto px-4 py-8'>
            <Card>
                <CardHeader>
                    <CardTitle>Account Funding</CardTitle>
                    <CardDescription>Coming Soon</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>This page will setup initial account funding.</p>
                </CardContent>
            </Card>
        </div>
    );
};
