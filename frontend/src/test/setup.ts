import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll } from 'vitest';
import { server } from './mocks/server';

// Fix React.act compatibility issue with React 19
Object.defineProperty(global, 'React', {
    value: {
        act: (fn: any) => fn()
    },
    writable: true
});

// Establish API mocking before all tests
beforeAll(() => {
    server.listen({ onUnhandledRequest: 'warn' });
});

// Clean up after each test
afterEach(() => {
    cleanup();
    server.resetHandlers();
});

// Clean up after all tests are done
afterAll(() => {
    server.close();
});
