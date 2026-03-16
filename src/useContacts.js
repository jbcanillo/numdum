import { useState, useCallback } from 'react';

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock contacts data for web app
      const mockContacts: Contact[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1-555-0123'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '+1-555-0124'
        },
        {
          id: '3',
          name: 'Bob Johnson',
          email: 'bob.johnson@example.com',
          phone: '+1-555-0125'
        },
        {
          id: '4',
          name: 'Alice Brown',
          email: 'alice.brown@example.com',
          phone: '+1-555-0126'
        },
        {
          id: '5',
          name: 'Charlie Wilson',
          email: 'charlie.wilson@example.com',
          phone: '+1-555-0127'
        },
        {
          id: '6',
          name: 'Diana Martinez',
          email: 'diana.martinez@example.com',
          phone: '+1-555-0128'
        },
        {
          id: '7',
          name: 'Edward Davis',
          email: 'edward.davis@example.com',
          phone: '+1-555-0129'
        },
        {
          id: '8',
          name: 'Fiona Garcia',
          email: 'fiona.garcia@example.com',
          phone: '+1-555-0130'
        }
      ];

      setContacts(mockContacts);
      return mockContacts;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkContactAccess = useCallback(async () => {
    try {
      // For web apps, we'll always return true since we're using mock data
      return true;
    } catch (error) {
      return false;
    }
  }, []);

  // Load contacts on mount
  useEffect(() => {
    getContacts();
  }, [getContacts]);

  return {
    contacts,
    loading,
    error,
    getContacts,
    checkContactAccess
  };
};

// Define Contact interface
interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
}