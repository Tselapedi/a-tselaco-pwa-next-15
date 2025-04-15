'use client';

import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';

export default function ComingSoon() {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="mb-8">
        <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center mb-6 mx-auto">
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Coming Soon!</h1>
        <p className="text-lg text-gray-600 mb-8">
          We're working hard to bring you an amazing ride experience
        </p>
        <div className="space-y-4">
          <div className="p-4 bg-primary-50 rounded-lg border border-primary-100">
            <h3 className="font-medium text-primary-800 mb-2">What to expect:</h3>
            <ul className="text-primary-700 text-sm space-y-2">
              <li>• Easy ride booking</li>
              <li>• Real-time tracking</li>
              <li>• Secure payments</li>
              <li>• Professional drivers</li>
            </ul>
          </div>
          <div className="p-4 bg-secondary-50 rounded-lg border border-secondary-100">
            <p className="text-secondary-800">
              Get notified when we launch! Stay tuned for updates.
            </p>
          </div>
        </div>
      </div>
      
      <button
        onClick={handleLogout}
        className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
}