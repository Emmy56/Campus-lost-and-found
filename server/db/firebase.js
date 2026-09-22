// Zero-Dependency Cloud Firestore REST API Client with Memory Fallback

const memoryStore = {
  users: [
    {
      id: 'user-admin',
      name: 'OAU Admin Moderation',
      matricNumber: 'ADMIN/OAU/001',
      studentId: 'ADMIN/OAU/001',
      email: 'admin@student.oauife.edu.ng',
      password: '',
      role: 'admin',
      isBanned: false,
      createdAt: new Date().toISOString()
    }
  ],
  items: [],
  matches: [],
  conversations: [],
  messages: [],
  notifications: []
};

let projectId = process.env.FIREBASE_PROJECT_ID || '';
let apiKey = process.env.FIREBASE_API_KEY || '';

export function initFirebaseDb() {
  projectId = process.env.FIREBASE_PROJECT_ID || '';
  apiKey = process.env.FIREBASE_API_KEY || '';

  if (projectId) {
    console.log(`[Firebase REST API] Configured for Cloud Firestore project "${projectId}".`);
  } else {
    console.log('[Firebase] FIREBASE_PROJECT_ID missing. Operating with local memory DB fallback.');
    console.log('[Firebase] To connect live cloud database on Vercel, set FIREBASE_PROJECT_ID in Vercel settings.');
  }
}

function getBaseUrl() {
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
}

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') return Number.isInteger(val) ? { integerValue: val } : { doubleValue: val };
  if (typeof val === 'string') return { stringValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function fromFirestoreValue(fieldObj) {
  if (!fieldObj) return null;
  if ('stringValue' in fieldObj) return fieldObj.stringValue;
  if ('booleanValue' in fieldObj) return fieldObj.booleanValue;
  if ('integerValue' in fieldObj) return parseInt(fieldObj.integerValue, 10);
  if ('doubleValue' in fieldObj) return parseFloat(fieldObj.doubleValue);
  if ('nullValue' in fieldObj) return null;
  if ('arrayValue' in fieldObj) return (fieldObj.arrayValue.values || []).map(fromFirestoreValue);
  if ('mapValue' in fieldObj) {
    const res = {};
    const fields = fieldObj.mapValue.fields || {};
    for (const [k, v] of Object.entries(fields)) {
      res[k] = fromFirestoreValue(v);
    }
    return res;
  }
  return null;
}

function toFirestoreDocument(obj) {
  const fields = {};
  for (const [key, val] of Object.entries(obj)) {
    fields[key] = toFirestoreValue(val);
  }
  return { fields };
}

function fromFirestoreDocument(docObj) {
  if (!docObj || !docObj.fields) return null;
  const res = {};
  for (const [key, fieldVal] of Object.entries(docObj.fields)) {
    res[key] = fromFirestoreValue(fieldVal);
  }
  return res;
}

// ----------------------------------------------------
// USERS COLLECTION
// ----------------------------------------------------
export const dbUsers = {
  async getAll() {
    if (!projectId) return [...memoryStore.users];
    try {
      const url = `${getBaseUrl()}/users${apiKey ? `?key=${apiKey}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) return [...memoryStore.users];
      const data = await res.json();
      if (!data.documents) return [...memoryStore.users];
      return data.documents.map(fromFirestoreDocument).filter(Boolean);
    } catch (err) {
      console.error('[Firebase REST Users.getAll]:', err.message);
      return [...memoryStore.users];
    }
  },

  async find(term) {
    const termUpper = (term || '').toUpperCase().trim();
    const termLower = (term || '').toLowerCase().trim();
    const all = await this.getAll();
    return all.find(u =>
      u.id === term ||
      (u.matricNumber && u.matricNumber.toUpperCase() === termUpper) ||
      (u.email && u.email.toLowerCase() === termLower)
    ) || null;
  },

  async create(user) {
    if (!projectId) {
      memoryStore.users.push(user);
      return user;
    }
    try {
      const url = `${getBaseUrl()}/users?documentId=${user.id}${apiKey ? `&key=${apiKey}` : ''}`;
      const body = toFirestoreDocument(user);
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      return user;
    } catch (err) {
      console.error('[Firebase REST Users.create]:', err.message);
      memoryStore.users.push(user);
      return user;
    }
  },

  async update(id, updates) {
    if (!projectId) {
      const u = memoryStore.users.find(x => x.id === id);
      if (u) Object.assign(u, updates);
      return u;
    }
    try {
      const existing = await this.find(id) || {};
      const merged = { ...existing, ...updates };
      const url = `${getBaseUrl()}/users/${id}${apiKey ? `?key=${apiKey}` : ''}`;
      await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toFirestoreDocument(merged))
      });
      return true;
    } catch (err) {
      console.error('[Firebase REST Users.update]:', err.message);
      return false;
    }
  }
};

// ----------------------------------------------------
// ITEMS COLLECTION
// ----------------------------------------------------
export const dbItems = {
  async getAll() {
    if (!projectId) return [...memoryStore.items].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    try {
      const url = `${getBaseUrl()}/items${apiKey ? `?key=${apiKey}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) return [...memoryStore.items];
      const data = await res.json();
      if (!data.documents) return [...memoryStore.items];
      const items = data.documents.map(fromFirestoreDocument).filter(Boolean);
      return items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } catch (err) {
      console.error('[Firebase REST Items.getAll]:', err.message);
      return [...memoryStore.items];
    }
  },

  async create(item) {
    if (!projectId) {
      memoryStore.items.unshift(item);
      return item;
    }
    try {
      const url = `${getBaseUrl()}/items?documentId=${item.id}${apiKey ? `&key=${apiKey}` : ''}`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toFirestoreDocument(item))
      });
      return item;
    } catch (err) {
      console.error('[Firebase REST Items.create]:', err.message);
      memoryStore.items.unshift(item);
      return item;
    }
  },

  async update(id, updates) {
    if (!projectId) {
      const item = memoryStore.items.find(x => x.id === id);
      if (item) Object.assign(item, updates);
      return item;
    }
    try {
      const all = await this.getAll();
      const existing = all.find(x => x.id === id) || {};
      const merged = { ...existing, ...updates };
      const url = `${getBaseUrl()}/items/${id}${apiKey ? `?key=${apiKey}` : ''}`;
      await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toFirestoreDocument(merged))
      });
      return true;
    } catch (err) {
      console.error('[Firebase REST Items.update]:', err.message);
      return false;
    }
  },

  async delete(id) {
    if (!projectId) {
      memoryStore.items = memoryStore.items.filter(x => x.id !== id);
      return true;
    }
    try {
      const url = `${getBaseUrl()}/items/${id}${apiKey ? `?key=${apiKey}` : ''}`;
      await fetch(url, { method: 'DELETE' });
      return true;
    } catch (err) {
      console.error('[Firebase REST Items.delete]:', err.message);
      return false;
    }
  }
};

// ----------------------------------------------------
// MATCHES COLLECTION
// ----------------------------------------------------
export const dbMatches = {
  async getAll() {
    if (!projectId) return [...memoryStore.matches].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    try {
      const url = `${getBaseUrl()}/matches${apiKey ? `?key=${apiKey}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) return [...memoryStore.matches];
      const data = await res.json();
      if (!data.documents) return [...memoryStore.matches];
      const matches = data.documents.map(fromFirestoreDocument).filter(Boolean);
      return matches.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } catch (err) {
      console.error('[Firebase REST Matches.getAll]:', err.message);
      return [...memoryStore.matches];
    }
  },

  async create(match) {
    if (!projectId) {
      memoryStore.matches.unshift(match);
      return match;
    }
    try {
      const url = `${getBaseUrl()}/matches?documentId=${match.id}${apiKey ? `&key=${apiKey}` : ''}`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toFirestoreDocument(match))
      });
      return match;
    } catch (err) {
      console.error('[Firebase REST Matches.create]:', err.message);
      memoryStore.matches.unshift(match);
      return match;
    }
  },

  async update(id, updates) {
    if (!projectId) {
      const m = memoryStore.matches.find(x => x.id === id);
      if (m) Object.assign(m, updates);
      return m;
    }
    try {
      const all = await this.getAll();
      const existing = all.find(x => x.id === id) || {};
      const merged = { ...existing, ...updates };
      const url = `${getBaseUrl()}/matches/${id}${apiKey ? `?key=${apiKey}` : ''}`;
      await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toFirestoreDocument(merged))
      });
      return true;
    } catch (err) {
      console.error('[Firebase REST Matches.update]:', err.message);
      return false;
    }
  }
};

// ----------------------------------------------------
// CONVERSATIONS & MESSAGES
// ----------------------------------------------------
export const dbConversations = {
  async getAll() {
    if (!projectId) {
      return [...memoryStore.conversations].map(c => ({
        ...c,
        messages: memoryStore.messages.filter(m => m.conversationId === c.id)
      })).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    try {
      const convUrl = `${getBaseUrl()}/conversations${apiKey ? `?key=${apiKey}` : ''}`;
      const msgUrl = `${getBaseUrl()}/messages${apiKey ? `?key=${apiKey}` : ''}`;

      const [convRes, msgRes] = await Promise.all([fetch(convUrl), fetch(msgUrl)]);
      const convData = convRes.ok ? await convRes.json() : {};
      const msgData = msgRes.ok ? await msgRes.json() : {};

      const allMsgs = (msgData.documents || []).map(fromFirestoreDocument).filter(Boolean);
      const conversations = (convData.documents || []).map(fromFirestoreDocument).filter(Boolean);

      return conversations.map(c => ({
        ...c,
        messages: allMsgs
          .filter(m => m.conversationId === c.id)
          .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
      })).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } catch (err) {
      console.error('[Firebase REST Conversations.getAll]:', err.message);
      return [...memoryStore.conversations];
    }
  },

  async create(conv) {
    if (!projectId) {
      memoryStore.conversations.unshift(conv);
      return conv;
    }
    try {
      const url = `${getBaseUrl()}/conversations?documentId=${conv.id}${apiKey ? `&key=${apiKey}` : ''}`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toFirestoreDocument(conv))
      });
      return conv;
    } catch (err) {
      console.error('[Firebase REST Conversations.create]:', err.message);
      memoryStore.conversations.unshift(conv);
      return conv;
    }
  },

  async update(id, updates) {
    if (!projectId) {
      const c = memoryStore.conversations.find(x => x.id === id);
      if (c) Object.assign(c, updates);
      return c;
    }
    try {
      const all = await this.getAll();
      const existing = all.find(x => x.id === id) || {};
      const merged = { ...existing, ...updates };
      const url = `${getBaseUrl()}/conversations/${id}${apiKey ? `?key=${apiKey}` : ''}`;
      await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toFirestoreDocument(merged))
      });
      return true;
    } catch (err) {
      console.error('[Firebase REST Conversations.update]:', err.message);
      return false;
    }
  }
};

export const dbMessages = {
  async create(message) {
    if (!projectId) {
      memoryStore.messages.push(message);
      return message;
    }
    try {
      const url = `${getBaseUrl()}/messages?documentId=${message.id}${apiKey ? `&key=${apiKey}` : ''}`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toFirestoreDocument(message))
      });
      return message;
    } catch (err) {
      console.error('[Firebase REST Messages.create]:', err.message);
      memoryStore.messages.push(message);
      return message;
    }
  }
};

// ----------------------------------------------------
// NOTIFICATIONS COLLECTION
// ----------------------------------------------------
export const dbNotifications = {
  async getAll() {
    if (!projectId) return [...memoryStore.notifications].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    try {
      const url = `${getBaseUrl()}/notifications${apiKey ? `?key=${apiKey}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) return [...memoryStore.notifications];
      const data = await res.json();
      if (!data.documents) return [...memoryStore.notifications];
      const notifs = data.documents.map(fromFirestoreDocument).filter(Boolean);
      return notifs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } catch (err) {
      console.error('[Firebase REST Notifications.getAll]:', err.message);
      return [...memoryStore.notifications];
    }
  },

  async create(notification) {
    if (!projectId) {
      memoryStore.notifications.unshift(notification);
      return notification;
    }
    try {
      const url = `${getBaseUrl()}/notifications?documentId=${notification.id}${apiKey ? `&key=${apiKey}` : ''}`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toFirestoreDocument(notification))
      });
      return notification;
    } catch (err) {
      console.error('[Firebase REST Notifications.create]:', err.message);
      memoryStore.notifications.unshift(notification);
      return notification;
    }
  },

  async markAllRead() {
    if (!projectId) {
      memoryStore.notifications.forEach(n => n.read = true);
      return true;
    }
    try {
      const notifs = await this.getAll();
      const promises = notifs.map(n => {
        const url = `${getBaseUrl()}/notifications/${n.id}${apiKey ? `?key=${apiKey}` : ''}`;
        return fetch(url, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toFirestoreDocument({ ...n, read: true }))
        });
      });
      await Promise.all(promises);
      return true;
    } catch (err) {
      console.error('[Firebase REST Notifications.markAllRead]:', err.message);
      return false;
    }
  }
};
