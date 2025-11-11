'use client';

import React, { useState, useEffect } from 'react';
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
  const [displayName, setDisplayName] = useState(userName || userEmail.split('@')[0]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [chatMode, setChatMode] = useState<'assistant' | 'creative' | 'technical' | 'casual'>('assistant');
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'pro' | 'enterprise'>('free');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [stats, setStats] = useState({ conversations: 0, messages: 0, lastActive: '' });
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient();
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      loadUserSettings();
    }
  }, [isOpen]);

  const loadUserSettings = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load preferences
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (prefs) {
        setTheme(prefs.theme || 'dark');
        setDisplayName(prefs.display_name || userEmail.split('@')[0]);
        setNotifications(prefs.notifications_enabled ?? true);
        setChatMode(prefs.chat_mode || 'assistant');
        setSubscriptionTier(prefs.subscription_tier || 'free');
      }

      // Load stats
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id);

      const { data: messages } = await supabase
        .from('messages')
        .select('id, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(1);

      setStats({
        conversations: conversations?.length || 0,
        messages: messages?.length || 0,
        lastActive: messages?.[0]?.created_at || new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('conversations').delete().eq('user_id', user.id);
        await supabase.auth.signOut();
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-mode', newTheme);
    localStorage.setItem('theme', newTheme);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('user_preferences').upsert({
        user_id: user.id,
        theme: newTheme,
      });
    }
  };

  const handleSaveName = async () => {
    if (!displayName.trim()) return;

    setIsSavingName(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_preferences').upsert({
          user_id: user.id,
          display_name: displayName.trim(),
        });
        setIsEditingName(false);
      }
    } catch (error) {
      console.error('Error saving name:', error);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleChatModeChange = async (newMode: typeof chatMode) => {
    setChatMode(newMode);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('user_preferences').upsert({
        user_id: user.id,
        chat_mode: newMode,
      });
    }
  };

  const chatModes = [
    { id: 'assistant', name: 'Assistant', description: 'Helpful and balanced responses' },
    { id: 'creative', name: 'Creative', description: 'Imaginative and expressive' },
    { id: 'technical', name: 'Technical', description: 'Precise and detailed' },
    { id: 'casual', name: 'Casual', description: 'Friendly and conversational' },
  ];

  const subscriptionTiers = [
    { id: 'free', name: 'Free', price: '$0/mo', features: ['Basic chat', 'Limited history'] },
    { id: 'pro', name: 'Pro', price: '$12/mo', features: ['Unlimited chat', 'Full history', 'Priority support'] },
    { id: 'enterprise', name: 'Enterprise', price: 'Custom', features: ['Custom integration', 'Dedicated support', 'SLA'] },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm fade-in">
      <div className="bg-bg-000 border border-border-100/10 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-100/10">
          <h2 className="text-xl font-semibold text-text-100">Settings</h2>
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
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-accent-main-100 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              {/* Profile Section */}
              <div>
                <h3 className="text-sm font-medium text-text-200 mb-3">Profile</h3>
                <div className="space-y-3">
                  <div className="bg-bg-200 border border-border-100/15 rounded-lg p-4">
                    <label className="text-xs text-text-300 mb-2 block">Display Name</label>
                    {isEditingName ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full px-3 py-2 bg-bg-300 border border-border-100/20 rounded-lg text-text-100 focus:outline-none focus:ring-2 focus:ring-accent-main-100"
                          placeholder="Enter your name"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveName}
                            disabled={isSavingName || !displayName.trim()}
                            className="flex-1 px-3 py-1.5 bg-accent-main-100 text-white rounded-lg hover:bg-accent-main-hover transition-colors disabled:opacity-50 text-sm"
                          >
                            {isSavingName ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => {
                              setIsEditingName(false);
                              setDisplayName(userName || userEmail.split('@')[0]);
                            }}
                            className="flex-1 px-3 py-1.5 bg-bg-300 border border-border-100/20 rounded-lg text-text-200 hover:bg-bg-400 transition-colors text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="text-text-100">{displayName}</div>
                        <button
                          onClick={() => setIsEditingName(true)}
                          className="text-xs text-accent-main-100 hover:text-accent-main-hover transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="bg-bg-200 border border-border-100/15 rounded-lg p-4">
                    <label className="text-xs text-text-300 mb-1 block">Email</label>
                    <div className="text-text-100">{userEmail}</div>
                  </div>
                </div>
              </div>

              {/* Admin Panel Section */}
              <div>
                <h3 className="text-sm font-medium text-text-200 mb-3">Activity Stats</h3>
                <div className="bg-bg-200 border border-border-100/15 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-text-300 mb-1">Total Conversations</div>
                      <div className="text-2xl font-semibold text-text-100">{stats.conversations}</div>
                    </div>
                    <div>
                      <div className="text-xs text-text-300 mb-1">Total Messages</div>
                      <div className="text-2xl font-semibold text-text-100">{stats.messages}</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border-100/15">
                    <div className="text-xs text-text-300">Last Active</div>
                    <div className="text-sm text-text-100 mt-1">
                      {new Date(stats.lastActive).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Modes Section */}
              <div>
                <h3 className="text-sm font-medium text-text-200 mb-3">Chat Modes</h3>
                <div className="bg-bg-200 border border-border-100/15 rounded-lg p-4">
                  <label className="text-xs text-text-300 mb-3 block">Conversation Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {chatModes.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => handleChatModeChange(mode.id as typeof chatMode)}
                        className={`p-3 rounded-lg border transition-all text-left ${
                          chatMode === mode.id
                            ? 'bg-accent-main-100 border-accent-main-100 text-white'
                            : 'bg-bg-300 border-border-100/20 text-text-200 hover:bg-bg-400'
                        }`}
                      >
                        <div className="text-sm font-medium">{mode.name}</div>
                        <div className={`text-xs mt-1 ${
                          chatMode === mode.id ? 'text-white/80' : 'text-text-300'
                        }`}>
                          {mode.description}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-border-100/15">
                    <div className="text-xs text-text-300">
                      💡 Tip: Click the eye icon next to any conversation to enable incognito mode - messages won't be saved.
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription Section */}
              <div>
                <h3 className="text-sm font-medium text-text-200 mb-3">Subscription</h3>
                <div className="space-y-2">
                  {subscriptionTiers.map((tier) => (
                    <div
                      key={tier.id}
                      className={`bg-bg-200 border rounded-lg p-4 transition-all ${
                        subscriptionTier === tier.id
                          ? 'border-accent-main-100 ring-2 ring-accent-main-100/20'
                          : 'border-border-100/15'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-text-100">{tier.name}</div>
                            {subscriptionTier === tier.id && (
                              <span className="px-2 py-0.5 bg-accent-main-100 text-white text-xs rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-lg font-semibold text-accent-main-100 mt-1">
                            {tier.price}
                          </div>
                          <ul className="mt-3 space-y-1">
                            {tier.features.map((feature, i) => (
                              <li key={i} className="text-xs text-text-300 flex items-center gap-2">
                                <svg className="w-3 h-3 text-accent-main-100" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                        {subscriptionTier !== tier.id && (
                          <button className="px-3 py-1.5 bg-accent-main-100 text-white text-sm rounded-lg hover:bg-accent-main-hover transition-colors">
                            Upgrade
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Appearance Section */}
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

              {/* Preferences Section */}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
