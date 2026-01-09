import React, { useState } from 'react';
import { motion } from 'framer-motion'; // Add this import
import { cn } from '@/lib/utils';
import GeneralSettings from './settings/GeneralSettings';
import PasswordSecurity from './settings/PasswordSecurity';
import PrivacySettings from './settings/PrivacySettings';
import ActivityLog from './settings/ActivityLog';

const settingsNavItems = [
  { id: 'general', label: 'General', icon: '⚙️', description: 'Basic account settings' },
  { id: 'password-security', label: 'Password & Security', icon: '🔒', description: 'Security and login settings' },
  { id: 'privacy', label: 'Privacy Settings', icon: '👁️', description: 'Privacy and data controls' },
  { id: 'activity', label: 'Activity Log', icon: '📋', description: 'View your account activity' },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState('general');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <nav className="space-y-1">
                {settingsNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 text-left",
                      activeSection === item.id
                        ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    <div>
                      <div>{item.label}</div>
                      <div className="text-xs text-gray-500 font-normal">{item.description}</div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Section Header */}
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {settingsNavItems.find(item => item.id === activeSection)?.label}
                </h2>
                <p className="text-gray-600 mt-1">
                  {settingsNavItems.find(item => item.id === activeSection)?.description}
                </p>
              </div>

              {/* Dynamic Content */}
              <div className="min-h-[500px]">
                {activeSection === 'general' && <GeneralSettings />}
                {activeSection === 'password-security' && <PasswordSecurity />}
                {activeSection === 'privacy' && <PrivacySettings />}
                {activeSection === 'activity' && <ActivityLog />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}