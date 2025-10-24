import { Link } from 'react-router-dom';
import { Building2, User, LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../ui/avatar';

import { useAuth } from '../../context/AuthContext';
import { useApplication } from '../../context/ApplicationContext';

export const Header = () => {
    const { user, logout } = useAuth();
    const { state, resetApplication } = useApplication();
    const { theme, setTheme } = useTheme();

    const handleLogout = () => {
        resetApplication();
        logout();
    };

    const getUserInitials = (name?: string) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className='border-b bg-white shadow-sm'>
            <div className='container mx-auto flex h-16 items-center justify-between px-4'>
                {/* Logo and Brand */}
                <Link
                    to='/'
                    className='flex items-center space-x-3'
                >
                    <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white'>
                        <Building2 className='h-5 w-5' />
                    </div>
                    <div className='hidden sm:block'>
                        <h1 className='text-lg font-semibold text-gray-900'>Digital Banking</h1>
                        <p className='text-sm text-gray-500'>Account Opening Portal</p>
                    </div>
                </Link>

                {/* Application ID Display */}
                {state.application && (
                    <div className='hidden md:flex items-center space-x-2 rounded-lg bg-gray-100 px-3 py-1'>
                        <span className='text-sm text-gray-600'>Application ID:</span>
                        <span className='font-mono text-sm font-medium text-gray-900'>{state.application.id}</span>
                    </div>
                )}

                {/* User Menu */}
                <div className='flex items-center space-x-4'>
                    {/* Theme Toggle */}
                    <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    >
                        <Sun className='h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
                        <Moon className='absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
                        <span className='sr-only'>Toggle theme</span>
                    </Button>

                    {/* User Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant='ghost'
                                className='relative h-9 w-9 rounded-full'
                            >
                                <Avatar className='h-9 w-9'>
                                    <AvatarFallback className='bg-blue-100 text-blue-600'>
                                        {getUserInitials(user?.name)}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className='w-56'
                            align='end'
                            forceMount
                        >
                            <div className='flex items-center justify-start gap-2 p-2'>
                                <div className='flex flex-col space-y-1 leading-none'>
                                    {user?.name && <p className='font-medium text-sm'>{user.name}</p>}
                                    {user?.email && <p className='text-xs text-muted-foreground'>{user.email}</p>}
                                </div>
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link
                                    to='/profile'
                                    className='flex items-center'
                                >
                                    <User className='mr-2 h-4 w-4' />
                                    Profile
                                </Link>
                            </DropdownMenuItem>
                            {user?.role === 'ADMIN' && (
                                <DropdownMenuItem asChild>
                                    <Link
                                        to='/admin'
                                        className='flex items-center'
                                    >
                                        <Building2 className='mr-2 h-4 w-4' />
                                        Admin Dashboard
                                    </Link>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className='flex items-center text-red-600 focus:text-red-600'
                            >
                                <LogOut className='mr-2 h-4 w-4' />
                                Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};
