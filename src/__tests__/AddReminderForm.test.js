import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddReminderForm from '../components/features/AddReminderForm';

describe('AddReminderForm', () => {
  const onDismiss = jest.fn();
  const onSubmit = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all form fields', () => {
    render(<AddReminderForm onDismiss={onDismiss} onSubmit={onSubmit} />);

    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Due Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Repeat/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Additional Details/i)).toBeInTheDocument();
  });

  test('submits the form with valid data', async () => {
    render(<AddReminderForm onDismiss={onDismiss} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'New Reminder' } });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().slice(0, 16);
    fireEvent.change(screen.getByLabelText(/Due Date/i), { target: { value: tomorrowString } });

    fireEvent.click(screen.getByRole('button', { name: /Create Reminder/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
      const data = onSubmit.mock.calls[0][0];
      expect(data.title).toBe('New Reminder');
      expect(data.dueDate).toBeDefined();
    });
  });

  test('clicking cancel calls onDismiss', () => {
    render(<AddReminderForm onDismiss={onDismiss} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});