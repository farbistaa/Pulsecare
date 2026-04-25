// client/src/api/index.ts
const API_BASE = '/api';

export const settingsApi = {
  // Get current user data
  getProfile: async () => {
    const res = await fetch(`${API_BASE}/settings/profile`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  // Update Profile
  updateProfile: async (data: any) => {
    const res = await fetch(`${API_BASE}/settings/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to update profile');
    }
    return res.json();
  },

  // 2FA
  generate2FA: async () => {
    const res = await fetch(`${API_BASE}/settings/2fa/generate`, {
      method: 'POST',
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to generate 2FA');
    return res.json();
  },

  enable2FA: async (code: string) => {
    const res = await fetch(`${API_BASE}/settings/2fa/enable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Invalid verification code');
    return res.json();
  },

  disable2FA: async () => {
    const res = await fetch(`${API_BASE}/settings/2fa/disable`, {
      method: 'POST',
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to disable 2FA');
    return res.json();
  },

  // Activity
  getActivityLogs: async () => {
    const res = await fetch(`${API_BASE}/settings/activity`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch logs');
    return res.json();
  },

  // Deletion
  scheduleDeletion: async () => {
    const res = await fetch(`${API_BASE}/settings/account/delete`, {
      method: 'POST',
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to delete account');
    return res.json();
  }
};