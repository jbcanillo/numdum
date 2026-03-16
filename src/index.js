export interface File {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export interface MediaDeviceInfo {
  deviceId: string;
  kind: string;
  label: string;
  groupId: string;
}

export interface Reminder {
  id: string;
  title: string;
  description: string;
  dateTime: Date;
  priority: 'low' | 'medium' | 'high';
  repeat: 'never' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  photo?: File;
  contact?: string;
  location?: {
    lat: number;
    lng: number;
    name: string;
  };
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReminderFormData {
  title: string;
  description: string;
  dateTime: Date;
  priority: 'low' | 'medium' | 'high';
  repeat: 'never' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  photo?: File;
  contact?: string;
  location?: {
    lat: number;
    lng: number;
    name: string;
  };
}