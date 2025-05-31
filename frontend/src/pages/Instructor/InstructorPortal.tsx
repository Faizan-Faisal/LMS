import React from 'react';

const InstructorPortal: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Instructor Portal</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Instructor Dashboard Cards */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-800 mb-2">My Courses</h2>
              <p className="text-gray-600">Manage your teaching courses</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-green-800 mb-2">Assignments</h2>
              <p className="text-gray-600">Create and grade assignments</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-purple-800 mb-2">Student Progress</h2>
              <p className="text-gray-600">Monitor student performance and grades</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorPortal; 