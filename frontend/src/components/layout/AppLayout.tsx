import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { useApplication } from '../../context/ApplicationContext';
import { ProgressStepper } from './ProgressStepper';

export const AppLayout = () => {
    const { state } = useApplication();

    return (
        <div className='min-h-screen bg-gray-50'>
            <Header />

            {/* Progress Stepper - only show during application flow */}
            {state.application && (
                <div className='border-b bg-white'>
                    <div className='container mx-auto py-4'>
                        <ProgressStepper />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className='flex-1'>
                <Outlet />
            </main>
        </div>
    );
};
