import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { render } from './test-utils';
import { App } from '../App';

describe('App', () => {
    it('should render without crashing', () => {
        render(<App />);
        // The app should render the login page initially since user is not authenticated
        expect(screen.getByText(/Coming Soon/i)).toBeInTheDocument();
    });
});
