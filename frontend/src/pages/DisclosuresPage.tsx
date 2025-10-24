import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export const DisclosuresPage = () => {
    return (
        <div className='container mx-auto px-4 py-8'>
            <Card>
                <CardHeader>
                    <CardTitle>Disclosures</CardTitle>
                    <CardDescription>Coming Soon</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>This page will display legal disclosures and agreements.</p>
                </CardContent>
            </Card>
        </div>
    );
};
