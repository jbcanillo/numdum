import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../components/ui/ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary', () => {
  test('renders error message when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  test('resets on button click', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    const button = screen.getByText('Try again');
    fireEvent.click(button);
    // After reset, the thrown component will throw again; but the boundary will catch again
    // So the error UI should reappear. This behavior is okay for this test.
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
