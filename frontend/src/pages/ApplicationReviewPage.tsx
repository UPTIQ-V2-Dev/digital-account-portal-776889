import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export const ApplicationReviewPage = () => {
    return (
        <div className='container mx-auto px-4 py-8'>
            <Card>
                <CardHeader>
                    <CardTitle>Application Review</CardTitle>
                    <CardDescription>Coming Soon</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>This page will allow users to review their complete application.</p>
                </CardContent>
            </Card>
        </div>
    );
};
