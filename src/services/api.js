const API_BASE = '/api';

export const api = {
  // Auth
  async register(data) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  // Items
  async getItems() {
    const res = await fetch(`${API_BASE}/items`);
    if (!res.ok) throw new Error('Failed to fetch items');
    return res.json();
  },

  async createItem(itemData) {
    const res = await fetch(`${API_BASE}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    });
    if (!res.ok) throw new Error('Failed to save report');
    return res.json();
  },

  async updateItem(id, itemData) {
    const res = await fetch(`${API_BASE}/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    });
    if (!res.ok) throw new Error('Failed to update item details');
    return res.json();
  },

  async flagItem(id, reason) {
    await fetch(`${API_BASE}/items/${id}/flag`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
  },

  async dismissFlag(id) {
    await fetch(`${API_BASE}/items/${id}/dismiss-flag`, { method: 'PUT' });
  },

  async deleteItem(id) {
    await fetch(`${API_BASE}/items/${id}`, { method: 'DELETE' });
  },

  // Matches
  async getMatches() {
    const res = await fetch(`${API_BASE}/matches`);
    if (!res.ok) throw new Error('Failed to fetch matches');
    return res.json();
  },

  async updateMatchStatus(id, status) {
    await fetch(`${API_BASE}/matches/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  },

  // Conversations & Messages
  async getConversations() {
    const res = await fetch(`${API_BASE}/conversations`);
    if (!res.ok) throw new Error('Failed to fetch conversations');
    return res.json();
  },

  async sendMessage(conversationId, text, senderName, senderId, image = null) {
    await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, senderName, senderId, image })
    });
  },

  // Notifications
  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async markAllNotificationsRead() {
    await fetch(`${API_BASE}/notifications/read-all`, { method: 'PUT' });
  },

  // Admin
  async getAdminUsers() {
    const res = await fetch(`${API_BASE}/admin/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async toggleBanUser(id) {
    await fetch(`${API_BASE}/admin/users/${id}/ban`, { method: 'PUT' });
  }
};
