import React from 'react';
import { useAuth } from '../context/AuthContext';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white shadow rounded-lg overflow-hidden">
      <div className="bg-indigo-600 h-32"></div>
      <div className="px-6 pb-6">
        <div className="flex flex-col sm:flex-row items-center">
          <div className="-mt-16">
            <img 
              src={user.user_metadata?.avatar_url || ''}
              alt={user?.name || 'User Avatar'} 
              className="h-24 w-24 rounded-full border-4 border-white object-cover" 
            />
          </div>
          <div className="sm:ml-6 mt-4 sm:mt-0 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="mt-8 border-t pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900">Account Information</h3>
              <div className="mt-4 space-y-3">
                <InfoRow label="User ID" value={user?.id} />
                <InfoRow label="Name" value={user?.name} />
                <InfoRow label="Email" value={user?.email} />
              </div>
            </div>

            {/* Credits Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900">Credits</h3>
              <div className="mt-4">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-indigo-600">{user?.credits ?? 0}</span>
                  <span className="ml-2 text-gray-500">available credits</span>
                </div>
                <button className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Add More Credits
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-gray-500">{label}</span>
    <span className="text-gray-900">{value || '-'}</span>
  </div>
);

export default ProfilePage;
