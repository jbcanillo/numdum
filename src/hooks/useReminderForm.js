import { useState } from 'react';
import * as z from 'zod';

const reminderSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().optional(),
  due_date: z.date().min(new Date(), 'Due date must be in the future'),
});

export const useReminderForm = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleDateChange = (date) => {
    setValues((prev) => ({ ...prev, due_date: date }));
    setTouched((prev) => ({ ...prev, due_date: true }));
  };

  const validate = () => {
    try {
      reminderSchema.parse(values);
      setErrors({});
      return null;
    } catch (err) {
      const validationErrors = err.errors.reduce((acc, error) => {
        acc[error.path[0]] = error.message;
        return acc;
      }, {});
      setErrors(validationErrors);
      return validationErrors;
    }
  };

  const isValid = () => {
    try {
      reminderSchema.parse(values);
      return true;
    } catch {
      return false;
    }
  };

  const reset = (newValues = {}) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleDateChange,
    validate,
    isValid,
    reset,
  };
};

export { reminderSchema };