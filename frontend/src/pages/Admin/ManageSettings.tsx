import React, { useState } from 'react';

const ManageSettings: React.FC = () => {
  // Placeholder state for enrollment period
  const [enrollmentOpen, setEnrollmentOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Placeholder handlers (replace with API calls for real backend integration)
  const handleToggleEnrollment = () => {
    setEnrollmentOpen((prev) => !prev);
  };

  const handleSaveDates = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would call your backend API to save the dates
    alert(`Enrollment period set from ${startDate} to ${endDate}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Course Enrollment Period</h2>
        <form onSubmit={handleSaveDates} className="mb-4">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-1">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded px-3 py-2" required />
            </div>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Save Enrollment Period</button>
        </form>
        <div className="flex items-center gap-4">
          <span className="font-medium">Enrollment is currently:</span>
          <span className={enrollmentOpen ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
            {enrollmentOpen ? 'OPEN' : 'CLOSED'}
          </span>
          <button
            onClick={handleToggleEnrollment}
            className={`px-4 py-2 rounded ${enrollmentOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white font-semibold transition`}
          >
            {enrollmentOpen ? 'Close Enrollment' : 'Open Enrollment'}
          </button>
        </div>
      </div>
      <p className="text-gray-600">Other settings options will be available here.</p>
    </div>
  );
};

export default ManageSettings; 