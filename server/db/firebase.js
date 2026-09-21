import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';

let firestore = null;
let isFirebaseConnected = false;

// Memory Fallback Store if Firebase config is missing or invalid
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

export function initFirebaseDb() {
  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  };

  if (firebaseConfig.projectId && firebaseConfig.apiKey) {
    try {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      firestore = getFirestore(app);
      isFirebaseConnected = true;
      console.log(`[Firebase] Connected successfully to Cloud Firestore project "${firebaseConfig.projectId}".`);
    } catch (err) {
      console.warn('[Firebase] Connection failed, using in-memory store:', err.message);
      isFirebaseConnected = false;
    }
  } else {
    console.log('[Firebase] FIREBASE_PROJECT_ID or FIREBASE_API_KEY missing. Running with local memory DB fallback.');
    console.log('[Firebase] To connect live cloud database, set FIREBASE_* environment variables in Vercel / .env.');
    isFirebaseConnected = false;
  }
}

// ----------------------------------------------------
// USERS COLLECTION
// ----------------------------------------------------
export const dbUsers = {
  async getAll() {
    if (!isFirebaseConnected) {
      return [...memoryStore.users];
    }
    try {
      const snapshot = await getDocs(collection(firestore, 'users'));
      return snapshot.docs.map(d => d.data());
    } catch (err) {
      console.error('[Firebase Users.getAll]:', err.message);
      return [...memoryStore.users];
    }
  },

  async find(term) {
    const termUpper = (term || '').toUpperCase().trim();
    const termLower = (term || '').toLowerCase().trim();

    if (!isFirebaseConnected) {
      return memoryStore.users.find(u =>
        u.id === term ||
        (u.matricNumber && u.matricNumber.toUpperCase() === termUpper) ||
        (u.email && u.email.toLowerCase() === termLower)
      ) || null;
    }

    try {
      const all = await this.getAll();
      return all.find(u =>
        u.id === term ||
        (u.matricNumber && u.matricNumber.toUpperCase() === termUpper) ||
        (u.email && u.email.toLowerCase() === termLower)
      ) || null;
    } catch (err) {
      console.error('[Firebase Users.find]:', err.message);
      return null;
    }
  },

  async create(user) {
    if (!isFirebaseConnected) {
      memoryStore.users.push(user);
      return user;
    }
    try {
      await setDoc(doc(firestore, 'users', user.id), user);
      return user;
    } catch (err) {
      console.error('[Firebase Users.create]:', err.message);
      memoryStore.users.push(user);
      return user;
    }
  },

  async update(id, updates) {
    if (!isFirebaseConnected) {
      const u = memoryStore.users.find(x => x.id === id);
      if (u) Object.assign(u, updates);
      return u;
    }
    try {
      const ref = doc(firestore, 'users', id);
      await updateDoc(ref, updates);
      return true;
    } catch (err) {
      console.error('[Firebase Users.update]:', err.message);
      return false;
    }
  }
};

// ----------------------------------------------------
// ITEMS COLLECTION
// ----------------------------------------------------
export const dbItems = {
  async getAll() {
    if (!isFirebaseConnected) {
      return [...memoryStore.items].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    try {
      const snapshot = await getDocs(collection(firestore, 'items'));
      const items = snapshot.docs.map(d => d.data());
      return items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } catch (err) {
      console.error('[Firebase Items.getAll]:', err.message);
      return [...memoryStore.items];
    }
  },

  async create(item) {
    if (!isFirebaseConnected) {
      memoryStore.items.unshift(item);
      return item;
    }
    try {
      await setDoc(doc(firestore, 'items', item.id), item);
      return item;
    } catch (err) {
      console.error('[Firebase Items.create]:', err.message);
      memoryStore.items.unshift(item);
      return item;
    }
  },

  async update(id, updates) {
    if (!isFirebaseConnected) {
      const item = memoryStore.items.find(x => x.id === id);
      if (item) Object.assign(item, updates);
      return item;
    }
    try {
      const ref = doc(firestore, 'items', id);
      await updateDoc(ref, updates);
      return true;
    } catch (err) {
      console.error('[Firebase Items.update]:', err.message);
      return false;
    }
  },

  async delete(id) {
    if (!isFirebaseConnected) {
      memoryStore.items = memoryStore.items.filter(x => x.id !== id);
      return true;
    }
    try {
      await deleteDoc(doc(firestore, 'items', id));
      return true;
    } catch (err) {
      console.error('[Firebase Items.delete]:', err.message);
      return false;
    }
  }
};

// ----------------------------------------------------
// MATCHES COLLECTION
// ----------------------------------------------------
export const dbMatches = {
  async getAll() {
    if (!isFirebaseConnected) {
      return [...memoryStore.matches].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    try {
      const snapshot = await getDocs(collection(firestore, 'matches'));
      const matches = snapshot.docs.map(d => d.data());
      return matches.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } catch (err) {
      console.error('[Firebase Matches.getAll]:', err.message);
      return [...memoryStore.matches];
    }
  },

  async create(match) {
    if (!isFirebaseConnected) {
      memoryStore.matches.unshift(match);
      return match;
    }
    try {
      await setDoc(doc(firestore, 'matches', match.id), match);
      return match;
    } catch (err) {
      console.error('[Firebase Matches.create]:', err.message);
      memoryStore.matches.unshift(match);
      return match;
    }
  },

  async update(id, updates) {
    if (!isFirebaseConnected) {
      const m = memoryStore.matches.find(x => x.id === id);
      if (m) Object.assign(m, updates);
      return m;
    }
    try {
      const ref = doc(firestore, 'matches', id);
      await updateDoc(ref, updates);
      return true;
    } catch (err) {
      console.error('[Firebase Matches.update]:', err.message);
      return false;
    }
  }
};

// ----------------------------------------------------
// CONVERSATIONS & MESSAGES
// ----------------------------------------------------
export const dbConversations = {
  async getAll() {
    if (!isFirebaseConnected) {
      return [...memoryStore.conversations].map(c => ({
        ...c,
        messages: memoryStore.messages.filter(m => m.conversationId === c.id)
      })).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    try {
      const convSnap = await getDocs(collection(firestore, 'conversations'));
      const msgSnap = await getDocs(collection(firestore, 'messages'));

      const allMsgs = msgSnap.docs.map(d => d.data());
      const conversations = convSnap.docs.map(d => {
        const cData = d.data();
        const convMsgs = allMsgs
          .filter(m => m.conversationId === cData.id)
          .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        return {
          ...cData,
          messages: convMsgs
        };
      });

      return conversations.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } catch (err) {
      console.error('[Firebase Conversations.getAll]:', err.message);
      return [...memoryStore.conversations];
    }
  },

  async create(conv) {
    if (!isFirebaseConnected) {
      memoryStore.conversations.unshift(conv);
      return conv;
    }
    try {
      await setDoc(doc(firestore, 'conversations', conv.id), conv);
      return conv;
    } catch (err) {
      console.error('[Firebase Conversations.create]:', err.message);
      memoryStore.conversations.unshift(conv);
      return conv;
    }
  },

  async update(id, updates) {
    if (!isFirebaseConnected) {
      const c = memoryStore.conversations.find(x => x.id === id);
      if (c) Object.assign(c, updates);
      return c;
    }
    try {
      const ref = doc(firestore, 'conversations', id);
      await updateDoc(ref, updates);
      return true;
    } catch (err) {
      console.error('[Firebase Conversations.update]:', err.message);
      return false;
    }
  }
};

export const dbMessages = {
  async create(message) {
    if (!isFirebaseConnected) {
      memoryStore.messages.push(message);
      return message;
    }
    try {
      await setDoc(doc(firestore, 'messages', message.id), message);
      return message;
    } catch (err) {
      console.error('[Firebase Messages.create]:', err.message);
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
    if (!isFirebaseConnected) {
      return [...memoryStore.notifications].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    try {
      const snapshot = await getDocs(collection(firestore, 'notifications'));
      const notifs = snapshot.docs.map(d => d.data());
      return notifs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } catch (err) {
      console.error('[Firebase Notifications.getAll]:', err.message);
      return [...memoryStore.notifications];
    }
  },

  async create(notification) {
    if (!isFirebaseConnected) {
      memoryStore.notifications.unshift(notification);
      return notification;
    }
    try {
      await setDoc(doc(firestore, 'notifications', notification.id), notification);
      return notification;
    } catch (err) {
      console.error('[Firebase Notifications.create]:', err.message);
      memoryStore.notifications.unshift(notification);
      return notification;
    }
  },

  async markAllRead() {
    if (!isFirebaseConnected) {
      memoryStore.notifications.forEach(n => n.read = true);
      return true;
    }
    try {
      const snapshot = await getDocs(collection(firestore, 'notifications'));
      const promises = snapshot.docs.map(d => updateDoc(d.ref, { read: true }));
      await Promise.all(promises);
      return true;
    } catch (err) {
      console.error('[Firebase Notifications.markAllRead]:', err.message);
      return false;
    }
  }
};
