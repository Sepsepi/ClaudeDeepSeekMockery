'use client';

import React, { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AccountSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userName?: string;
}

export default function AccountSettings({
  isOpen,
  onClose,
  userEmail,
  userName,
}: AccountSettingsProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [notifications, setNotifications] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const supabase = createBrowserClient();
  const router = useRouter();

  if (!isOpen) return null;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // Delete user data from database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Delete conversations and messages (cascade will handle messages)
        await supabase.from('conversations').delete().eq('user_id', user.id);

        // Delete user account
        // Note: This requires service role key in production
        // For now, just sign out
        await supabase.auth.signOut();
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    // TODO: Implement theme persistence in user_preferences table
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm fade-in">
      <div className="bg-bg-000 border border-border-100/10 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-100/10">
          <h2 className="text-xl font-semibold text-text-100">Account Settings</h2>
          <button
            onClick={onClose}
            className="btn-icon w-9 h-9"
            title="Close settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Profile Section */}
          <div>
            <h3 className="text-sm font-medium text-text-200 mb-3">Profile</h3>
            <div className="space-y-3">
              <div className="bg-bg-200 border border-border-100/15 rounded-lg p-4">
                <label className="text-xs text-text-300 mb-1 block">Name</label>
                <div className="text-text-100">
                  {userName || userEmail.split('@')[0]}
                </div>
              </div>
              <div className="bg-bg-200 border border-border-100/15 rounded-lg p-4">
                <label className="text-xs text-text-300 mb-1 block">Email</label>
                <div className="text-text-100">{userEmail}</div>
              </div>
            </div>
          </div>

          {/* Theme Section */}
          <div>
            <h3 className="text-sm font-medium text-text-200 mb-3">Appearance</h3>
            <div className="bg-bg-200 border border-border-100/15 rounded-lg p-4">
              <label className="text-xs text-text-300 mb-2 block">Theme</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                    theme === 'light'
                      ? 'bg-accent-main-100 border-accent-main-100 text-white'
                      : 'bg-bg-300 border-border-100/20 text-text-200 hover:bg-bg-400'
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                    theme === 'dark'
                      ? 'bg-accent-main-100 border-accent-main-100 text-white'
                      : 'bg-bg-300 border-border-100/20 text-text-200 hover:bg-bg-400'
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div>
            <h3 className="text-sm font-medium text-text-200 mb-3">Preferences</h3>
            <div className="bg-bg-200 border border-border-100/15 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-text-100 mb-1">Notifications</div>
                  <div className="text-xs text-text-300">
                    Receive updates about new features
                  </div>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    notifications ? 'bg-accent-main-100' : 'bg-bg-400'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      notifications ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div>
            <h3 className="text-sm font-medium text-text-200 mb-3">Actions</h3>
            <div className="space-y-2">
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-3 bg-bg-200 border border-border-100/15 rounded-lg text-text-100 hover:bg-bg-300 transition-colors text-left"
              >
                Sign Out
              </button>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full px-4 py-3 bg-bg-200 border border-red-500/30 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors text-left"
                >
                  Delete Account
                </button>
              ) : (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 space-y-3">
                  <div className="text-sm text-red-400">
                    Are you sure? This action cannot be undone.
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 px-4 py-2 bg-bg-300 border border-border-100/20 rounded-lg text-text-200 hover:bg-bg-400 transition-colors"
                      disabled={isDeleting}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="flex-1 px-4 py-2 bg-red-500 border border-red-600 rounded-lg text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
