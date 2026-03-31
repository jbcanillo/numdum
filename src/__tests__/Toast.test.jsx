import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToastProvider, useToast } from '../components/ui/Toast';

const TestComponent = () => {
  const toast = useToast();
  return (
    <div>
      <button onClick={() => toast.addToast('Hello', 'success')}>Trigger</button>
    </div>
  );
};

describe('Toast', () => {
  test('renders success toast', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText('Trigger'));
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  test('dismisses toast on click', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText('Trigger'));
    const dismissBtn = screen.getByLabelText('Dismiss');
    fireEvent.click(dismissBtn);
    expect(screen.queryByText('Hello')).not.toBeInTheDocument();
  });
});
