import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CalendarView from '../components/ui/CalendarView';

// Mock the CSS import to avoid Jest parse errors
jest.mock('react-calendar/dist/Calendar.css', () => ({}));

describe('CalendarView - Month/Year Navigation', () => {
  const mockReminders = [
    {
      id: '1',
      title: 'Test Reminder',
      description: '',
      dueDate: new Date().toISOString(),
      priority: 'medium',
      completed: false
    }
  ];

  const mockJournal = [
    {
      id: 'j1',
      text: 'Journal entry',
      date: new Date().toISOString(),
      mood: '😊'
    }
  ];

  const onDateChange = jest.fn();
  const onComplete = jest.fn();
  const onToggleChecklist = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders month and year dropdowns', () => {
    render(
      <CalendarView 
        reminders={mockReminders}
        journalEntries={mockJournal}
        activeDate={new Date()}
        onDateChange={onDateChange}
        onComplete={onComplete}
        onToggleChecklist={onToggleChecklist}
      />
    );
    // There should be two comboboxes: month and year
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBe(2);
  });

  test('changing month dropdown updates the selected value', () => {
    const today = new Date();
    render(
      <CalendarView 
        reminders={mockReminders}
        journalEntries={mockJournal}
        activeDate={today}
        onDateChange={onDateChange}
        onComplete={onComplete}
        onToggleChecklist={onToggleChecklist}
      />
    );
    const [monthSelect, yearSelect] = screen.getAllByRole('combobox');
    // Change to March (value "2")
    fireEvent.change(monthSelect, { target: { value: '2' } });
    expect(monthSelect.value).toBe('2');
  });

  test('changing year dropdown updates the selected value', () => {
    const today = new Date();
    render(
      <CalendarView 
        reminders={mockReminders}
        journalEntries={mockJournal}
        activeDate={today}
        onDateChange={onDateChange}
        onComplete={onComplete}
        onToggleChecklist={onToggleChecklist}
      />
    );
    const [monthSelect, yearSelect] = screen.getAllByRole('combobox');
    const nextYear = today.getFullYear() + 1;
    fireEvent.change(yearSelect, { target: { value: nextYear.toString() } });
    expect(yearSelect.value).toBe(nextYear.toString());
  });
});
