import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import AddReminderForm from '../components/features/AddReminderForm';

describe('AddReminderForm - Checklist', () => {
  const onDismiss = jest.fn();
  const onSubmit = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders checklist section with Add Item button', () => {
    render(<AddReminderForm onDismiss={onDismiss} onSubmit={onSubmit} />);
    expect(screen.getByText('Checklist')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Item/i })).toBeInTheDocument();
  });

  test('adds new checklist item when Add Item clicked', () => {
    render(<AddReminderForm onDismiss={onDismiss} onSubmit={onSubmit} />);
    const addButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addButton);
    // Should have at least two text inputs for checklist items (initial + added)
    const inputs = screen.getAllByPlaceholderText('Checklist item...');
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  test('allows removing checklist items', () => {
    render(<AddReminderForm onDismiss={onDismiss} onSubmit={onSubmit} />);
    // Initial state has one item; add two more to have total of 3
    const addButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addButton);
    fireEvent.click(addButton);
    // Each checklist item row can be selected by its container class pattern
    const containers = document.querySelectorAll('.flex.items-center.gap-2.p-2');
    expect(containers.length).toBe(3);
    // Remove the first container's delete button
    const firstContainer = containers[0];
    const deleteBtn = within(firstContainer).getByRole('button');
    fireEvent.click(deleteBtn);
    const remainingContainers = document.querySelectorAll('.flex.items-center.gap-2.p-2');
    expect(remainingContainers.length).toBe(2);
  });

  test('toggle checklist item completion', () => {
    render(<AddReminderForm onDismiss={onDismiss} onSubmit={onSubmit} />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
    const initialChecked = checkboxes[0].checked;
    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0].checked).toBe(!initialChecked);
  });

  test('clears empty checklist items on submit', async () => {
    render(<AddReminderForm onDismiss={onDismiss} onSubmit={onSubmit} />);
    // Fill required fields: Title and Due Date
    const titleInput = screen.getByLabelText(/Title/i);
    const dueDateInput = screen.getByLabelText(/Due Date/i);
    fireEvent.change(titleInput, { target: { value: 'Test Reminder' } });
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    fireEvent.change(dueDateInput, { target: { value: tomorrow.toISOString().slice(0, 16) } });
    // There is an initial empty checklist; we keep it empty
    // Submit form
    const submitButton = screen.getByRole('button', { name: /Create Reminder/i });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    const submittedData = onSubmit.mock.calls[0][0];
    // Checklist should be an empty array (since empty items filtered)
    expect(submittedData.checklist).toEqual([]);
  });
});
