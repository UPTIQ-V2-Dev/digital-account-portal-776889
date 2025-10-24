import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export const PersonalInfoPage = () => {
    return (
        <div className='container mx-auto px-4 py-8'>
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Coming Soon</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>This page will collect personal information for consumer applications.</p>
                </CardContent>
            </Card>
        </div>
    );
};
