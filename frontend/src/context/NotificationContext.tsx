import { createContext, useContext, ReactNode } from 'react';
import { toast } from 'sonner';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationOptions {
    duration?: number;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
    dismissible?: boolean;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface NotificationContextType {
    showNotification: (type: NotificationType, message: string, options?: NotificationOptions) => void;
    showSuccess: (message: string, options?: NotificationOptions) => void;
    showError: (message: string, options?: NotificationOptions) => void;
    showWarning: (message: string, options?: NotificationOptions) => void;
    showInfo: (message: string, options?: NotificationOptions) => void;
    dismiss: (id?: string) => void;
    dismissAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
    const showNotification = (type: NotificationType, message: string, options?: NotificationOptions) => {
        const toastOptions = {
            duration: options?.duration,
            position: options?.position,
            dismissible: options?.dismissible,
            action: options?.action
        };

        switch (type) {
            case 'success':
                toast.success(message, toastOptions);
                break;
            case 'error':
                toast.error(message, toastOptions);
                break;
            case 'warning':
                toast.warning(message, toastOptions);
                break;
            case 'info':
                toast.info(message, toastOptions);
                break;
            default:
                toast(message, toastOptions);
        }
    };

    const showSuccess = (message: string, options?: NotificationOptions) => {
        showNotification('success', message, options);
    };

    const showError = (message: string, options?: NotificationOptions) => {
        showNotification('error', message, { duration: 5000, ...options });
    };

    const showWarning = (message: string, options?: NotificationOptions) => {
        showNotification('warning', message, options);
    };

    const showInfo = (message: string, options?: NotificationOptions) => {
        showNotification('info', message, options);
    };

    const dismiss = (id?: string) => {
        toast.dismiss(id);
    };

    const dismissAll = () => {
        toast.dismiss();
    };

    const contextValue: NotificationContextType = {
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        dismiss,
        dismissAll
    };

    return <NotificationContext.Provider value={contextValue}>{children}</NotificationContext.Provider>;
};

export const useNotification = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
