import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  initFirebaseDb,
  dbUsers,
  dbItems,
  dbMatches,
  dbConversations,
  dbMessages,
  dbNotifications
} from './db/firebase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

let dbInitialized = false;
let dbInitPromise = null;

async function ensureDbInit(req, res, next) {
  if (!dbInitialized) {
    if (!dbInitPromise) {
      dbInitPromise = Promise.resolve().then(() => {
        initFirebaseDb();
        dbInitialized = true;
      }).catch(err => {
        console.error('[Firebase Init Error]:', err);
      });
    }
    await dbInitPromise;
  }
  next();
}

app.use('/api', ensureDbInit);

// Jaro-Winkler Distance Algorithm in Node backend
function jaroDistance(s1, s2) {
  if (s1 === s2) return 1.0;
  const len1 = s1.length;
  const len2 = s2.length;
  if (len1 === 0 || len2 === 0) return 0.0;
  const matchDistance = Math.floor(Math.max(len1, len2) / 2) - 1;
  const s1Matches = new Array(len1).fill(false);
  const s2Matches = new Array(len2).fill(false);
  let matches = 0;
  let transpositions = 0;

  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, len2);
    for (let j = start; j < end; j++) {
      if (s2Matches[j]) continue;
      if (s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0.0;
  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }
  return (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3.0;
}

function jaroWinklerSimilarity(str1, str2) {
  const s1 = (str1 || '').toLowerCase().trim();
  const s2 = (str2 || '').toLowerCase().trim();
  const jaroScore = jaroDistance(s1, s2);
  if (jaroScore < 0.7) return jaroScore;
  let prefix = 0;
  for (let i = 0; i < Math.min(s1.length, s2.length, 4); i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }
  return jaroScore + prefix * 0.1 * (1 - jaroScore);
}

function computeMatchScore(item1, item2) {
  if (item1.category !== item2.category && item1.category !== 'Others' && item2.category !== 'Others') {
    return 0;
  }
  const text1 = `${item1.title} ${item1.description} ${item1.location}`.toLowerCase();
  const text2 = `${item2.title} ${item2.description} ${item2.location}`.toLowerCase();
  const jwScore = jaroWinklerSimilarity(text1, text2);
  const locationBonus = item1.location.toLowerCase() === item2.location.toLowerCase() ? 0.1 : 0;
  return Math.round(Math.min(1.0, jwScore + locationBonus) * 100);
}

// REST API ROUTES

// 1. Auth: Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, matricNumber, email, password, role } = req.body;
    
    // Validate OAU Student email
    if (!email || !email.toLowerCase().endsWith('@student.oauife.edu.ng')) {
      return res.status(400).json({ error: 'Registration is restricted to valid @student.oauife.edu.ng emails.' });
    }

    const matricUpper = (matricNumber || '').toUpperCase().trim();
    const emailLower = email.toLowerCase().trim();

    const existingMatric = await dbUsers.find(matricUpper);
    const existingEmail = await dbUsers.find(emailLower);

    if (existingMatric || existingEmail) {
      return res.status(400).json({ error: 'Account with this Matric Number or Email already exists. Please Sign In.' });
    }

    const userId = 'user-' + Date.now();
    const newUser = {
      id: userId,
      name,
      matricNumber: matricUpper,
      studentId: matricUpper,
      email: emailLower,
      password: password || '',
      role: role || 'student',
      isBanned: false,
      createdAt: new Date().toISOString()
    };

    await dbUsers.create(newUser);
    res.json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Auth: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, matricNumber, password } = req.body;
    const term = (email || matricNumber || '').trim();

    const user = await dbUsers.find(term);
    if (user) {
      if (user.isBanned) {
        return res.status(403).json({ error: 'Your account has been deactivated/banned by Campus Admin.' });
      }
      if (user.password && password && user.password !== password) {
        return res.status(400).json({ error: 'Incorrect password. Please check your credentials.' });
      }
      return res.json({
        id: user.id,
        name: user.name,
        matricNumber: user.matricNumber,
        studentId: user.studentId || user.matricNumber,
        email: user.email,
        password: user.password,
        role: user.role,
        isBanned: Boolean(user.isBanned)
      });
    }

    return res.status(404).json({ error: 'No registered account found with this email. Please click "Register Now" to create an account.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Get All Items
app.get('/api/items', async (req, res) => {
  try {
    const items = await dbItems.getAll();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Submit New Item & Run AI Match Calculation
app.post('/api/items', async (req, res) => {
  try {
    const { title, type, category, description, location, specificLocation, date, time, reward, image, userId, loggedBy } = req.body;
    const itemId = 'item-' + Date.now();

    let authorName = loggedBy;
    if (!authorName && userId && userId !== 'guest') {
      const user = await dbUsers.find(userId);
      if (user) {
        authorName = `${user.name} (${user.matricNumber || user.email})`;
      }
    }
    if (!authorName) {
      authorName = 'OAU Student';
    }

    const newItem = {
      title: title,
      description: description,
      itemType: type === 'lost' ? 'Lost Item' : 'Found Item',
      type: type,
      loggedBy: authorName,
      category: category,
      location: location,
      specificLocation: specificLocation || '',
      date: date,
      time: time || '',
      status: 'active',
      id: itemId,
      userId: userId || 'guest',
      reward: reward || '',
      image: image || null,
      isFlagged: false,
      flagReason: '',
      createdAt: new Date().toISOString()
    };

    await dbItems.create(newItem);

    // Run Jaro-Winkler AI Matching Engine against stored opposite items
    const allItems = await dbItems.getAll();
    const oppositeItems = allItems.filter(i => i.id !== itemId && i.type !== type && i.status === 'active');

    let bestMatch = null;
    let highestScore = 0;

    for (const r of oppositeItems) {
      const targetItem = { title: r.title, description: r.description, location: r.location, category: r.category };
      const score = computeMatchScore(newItem, targetItem);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = r;
      }
    }

    let createdMatchId = null;

    // Only generate a match if an actual opposite item matches with similarity >= 60%
    if (bestMatch && highestScore >= 60) {
      const mockMatchId = 'match-' + Date.now();
      const mockChatId = 'chat-new-' + Date.now();

      const newMatch = {
        matchedItemTitle: bestMatch.title,
        matchedItemType: bestMatch.type === 'lost' ? 'Lost Item' : 'Found Item',
        matchedItemLocation: bestMatch.location,
        matchPercentage: highestScore,
        status: 'pending',
        finderName: 'Student Peer',
        userItemId: itemId,
        matchedItemId: bestMatch.id,
        chatId: mockChatId,
        id: mockMatchId,
        createdAt: new Date().toISOString()
      };
      await dbMatches.create(newMatch);

      const newConv = {
        title: `Re: ${title}`,
        lastMessageText: '',
        lastMessageTime: 'Just now',
        matchId: mockMatchId,
        unreadCount: 0,
        id: mockChatId,
        createdAt: new Date().toISOString()
      };
      await dbConversations.create(newConv);

      const notifId = 'notif-' + Date.now();
      const newNotif = {
        title: 'AI Similarity Match Detected!',
        message: `Your report "${title}" has a ${highestScore}% Jaro-Winkler match with "${bestMatch.title}".`,
        userId: userId || 'guest',
        type: 'match',
        timestamp: 'Just now',
        read: false,
        linkTab: 'dashboard',
        id: notifId,
        createdAt: new Date().toISOString()
      };
      await dbNotifications.create(newNotif);

      createdMatchId = mockMatchId;
    }

    res.json({ item: newItem, matchScore: highestScore, matchId: createdMatchId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Get Matches
app.get('/api/matches', async (req, res) => {
  try {
    const matches = await dbMatches.getAll();
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Update Match Status
app.put('/api/matches/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const matchId = req.params.id;
    await dbMatches.update(matchId, { status });

    const matches = await dbMatches.getAll();
    const match = matches.find(m => m.id === matchId);

    if (match) {
      const sysMsgId = 'sys-' + Date.now();
      const sysText = `[System Update]: Match has been ${status === 'confirmed' ? 'CONFIRMED' : 'REJECTED'} by the user.`;
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      await dbMessages.create({
        id: sysMsgId,
        conversationId: match.chatId,
        senderId: 'system',
        senderName: 'System',
        text: sysText,
        timestamp: timeStr,
        isRead: true,
        createdAt: new Date().toISOString()
      });

      await dbConversations.update(match.chatId, {
        lastMessageText: `Match ${status}.`,
        lastMessageTime: 'Just now'
      });
    }

    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Get Conversations & Messages
app.get('/api/conversations', async (req, res) => {
  try {
    const conversations = await dbConversations.getAll();
    const formatted = conversations.map(c => ({
      id: c.id,
      title: c.title,
      unreadCount: c.unreadCount || 0,
      lastMessageText: c.lastMessageText || '',
      lastMessageTime: c.lastMessageTime || '',
      matchId: c.matchId,
      participants: [
        { id: 'user-peer', name: 'Student Peer', online: true }
      ],
      messages: (c.messages || []).map(m => ({
        id: m.id,
        senderId: m.senderId,
        senderName: m.senderName,
        text: m.text,
        timestamp: m.timestamp,
        isRead: Boolean(m.isRead)
      }))
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Send Chat Message
app.post('/api/conversations/:id/messages', async (req, res) => {
  try {
    const conversationId = req.params.id;
    const { text, senderName, senderId } = req.body;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = 'msg-' + Date.now();

    const newMsg = {
      id: userMsgId,
      conversationId,
      senderId: senderId || 'me',
      senderName: senderName || 'Student',
      text,
      timestamp: timeStr,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    await dbMessages.create(newMsg);

    await dbConversations.update(conversationId, {
      lastMessageText: text,
      lastMessageTime: 'Just now'
    });

    res.json({ success: true, messageId: userMsgId, message: newMsg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Get Notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const notifs = await dbNotifications.getAll();
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/notifications/read-all', async (req, res) => {
  try {
    await dbNotifications.markAllRead();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Admin Routes
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await dbUsers.getAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/users/:id/ban', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await dbUsers.find(userId);
    if (user) {
      const newBannedState = !user.isBanned;
      await dbUsers.update(userId, { isBanned: newBannedState });
      res.json({ success: true, isBanned: newBannedState });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/items/:id/flag', async (req, res) => {
  try {
    const { reason } = req.body;
    await dbItems.update(req.params.id, { isFlagged: true, flagReason: reason || 'Flagged by user' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/items/:id/dismiss-flag', async (req, res) => {
  try {
    await dbItems.update(req.params.id, { isFlagged: false });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/items/:id', async (req, res) => {
  try {
    await dbItems.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PRODUCTION STATIC FILE SERVING & SPA ROUTING FALLBACK
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
  console.log('[Express Backend] Static client production bundle serving enabled from dist/');
}

// Start Server & Initialize Database
initFirebaseDb();
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[Express Backend] Campus Lost & Found API running on http://localhost:${PORT}`);
  });
}

export default app;
