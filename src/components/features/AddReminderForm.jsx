import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useReminders } from '../hooks/useReminders';

const reminderSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.date().min(new Date(), 'Due date must be in the future'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  repeat: z.enum(['never', 'daily', 'weekly', 'monthly', 'yearly']).default('never'),
  details: z.string().optional()
});

type ReminderForm = z.infer<typeof reminderSchema>;

const AddReminderForm = ({ onDismiss, onSubmit }) => {
  const { createReminder, loading } = useReminders();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ReminderForm>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Default to tomorrow
      priority: 'medium',
      repeat: 'never'
    }
  });

  const onSubmitForm = async (data: ReminderForm) => {
    try {
      await createReminder(data);
      onSubmit(data);
      reset();
    } catch (error) {
      console.error('Error creating reminder:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Add New Reminder</h2>
        <form onSubmit={handleSubmit(onSubmitForm)}>
          {/* Title */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title *
            </label>
            <input
              {...register('title')}
              id="title"
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Due Date */}
          <div className="mb-4">
            <label htmlFor="dueDate" className="block text-sm font-medium mb-1">
              Due Date *
            </label>
            <input
              {...register('dueDate')}
              id="dueDate"
              type="datetime-local"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.dueDate && (
              <p className="text-red-600 text-sm mt-1">{errors.dueDate.message}</p>
            )}
          </div>

          {/* Priority */}
          <div className="mb-4">
            <label htmlFor="priority" className="block text-sm font-medium mb-1">
              Priority
            </label>
            <select
              {...register('priority')}
              id="priority"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Repeat */}
          <div className="mb-4">
            <label htmlFor="repeat" className="block text-sm font-medium mb-1">
              Repeat
            </label>
            <select
              {...register('repeat')}
              id="repeat"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="never">Never</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {/* Details */}
          <div className="mb-4">
            <label htmlFor="details" className="block text-sm font-medium mb-1">
              Additional Details
            </label>
            <textarea
              {...register('details')}
              id="details"
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onDismiss}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReminderForm;