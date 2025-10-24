import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';

import { AuthProvider } from '../context/AuthContext';
import { ApplicationProvider } from '../context/ApplicationContext';
import { NotificationProvider } from '../context/NotificationContext';

// Custom render function that includes all providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    // Create a new QueryClient for each test to avoid test interference
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0
            },
            mutations: {
                retry: false
            }
        }
    });

    return (
        <ThemeProvider
            attribute='class'
            defaultTheme='light'
            enableSystem={false}
        >
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <ApplicationProvider>
                        <NotificationProvider>
                            <BrowserRouter>{children}</BrowserRouter>
                        </NotificationProvider>
                    </ApplicationProvider>
                </AuthProvider>
            </QueryClientProvider>
        </ThemeProvider>
    );
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
    render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
