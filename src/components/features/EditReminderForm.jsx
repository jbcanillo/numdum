import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const editReminderSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.date().min(new Date(), 'Due date must be in the future'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  repeat: z.enum(['never', 'daily', 'weekly', 'monthly', 'yearly']).default('never'),
  details: z.string().optional(),
});

const EditReminderForm = ({ reminder, onDismiss, onSubmit }) => {
  const formatDateTimeLocal = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(editReminderSchema),
    defaultValues: {
      title: reminder.title,
      description: reminder.description || '',
      dueDate: formatDateTimeLocal(reminder.dueDate),
      priority: reminder.priority || 'medium',
      repeat: reminder.repeat || 'never',
      details: reminder.details || '',
    },
  });

  const onSubmitForm = async (data) => {
    setIsSubmitting(true);
    try {
      const updatedReminder = { ...reminder, ...data };
      await onSubmit(updatedReminder);
    } catch (error) {
      console.error('Error updating reminder:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)}>
      {/* Title */}
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium mb-1">Title *</label>
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
        <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
        <textarea
          {...register('description')}
          id="description"
          rows={3}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Due Date */}
      <div className="mb-4">
        <label htmlFor="dueDate" className="block text-sm font-medium mb-1">Due Date *</label>
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
        <label htmlFor="priority" className="block text-sm font-medium mb-1">Priority</label>
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
        <label htmlFor="repeat" className="block text-sm font-medium mb-1">Repeat</label>
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
        <label htmlFor="details" className="block text-sm font-medium mb-1">Additional Details</label>
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
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Updating...' : 'Update Reminder'}
        </button>
      </div>
    </form>
  );
};

export default EditReminderForm;