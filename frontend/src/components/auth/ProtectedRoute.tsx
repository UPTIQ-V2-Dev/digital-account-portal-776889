import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../ui/loading-spinner';

export const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <LoadingSpinner size='lg' />
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login page with return url
        return (
            <Navigate
                to='/login'
                state={{ from: location }}
                replace
            />
        );
    }

    return <Outlet />;
};
