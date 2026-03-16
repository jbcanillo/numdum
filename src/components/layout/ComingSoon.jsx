import React from 'react';

const ComingSoon = () => {
  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
          <p className="text-gray-600 mb-6">
            This feature is under development and will be available in future updates.
          </p>
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">What's Coming:</h3>
            <ul className="text-gray-600 space-y-1">
              <li>• Camera integration for photo attachments</li>
              <li>• Contact selection for person-based reminders</li>
              <li>• Geolocation for location-based reminders</li>
              <li>• Push notifications and reminders</li>
              <li>• Advanced analytics dashboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;