import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { query, run, initDb } from './db/index.js';

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
      dbInitPromise = initDb().then(() => {
        dbInitialized = true;
      }).catch(err => {
        console.error('[Database Init Error]:', err);
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

    const existing = await query('SELECT * FROM users WHERE matric_number = ? OR email = ?', [matricUpper, emailLower]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Account with this Matric Number or Email already exists. Please Sign In.' });
    }

    const userId = 'user-' + Date.now();
    await run(
      'INSERT INTO users (id, name, matric_number, student_id, email, password, role, is_banned) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, name, matricUpper, matricUpper, emailLower, password || '', role || 'student', false]
    );

    const user = { id: userId, name, matricNumber: matricUpper, studentId: matricUpper, email: emailLower, role: role || 'student', isBanned: false };
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Auth: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { matricNumber, password } = req.body;
    const matricUpper = (matricNumber || '').toUpperCase().trim();

    const users = await query('SELECT * FROM users WHERE matric_number = ? OR email = ? OR id = ?', [matricUpper, matricUpper.toLowerCase(), matricNumber]);
    if (users.length > 0) {
      const u = users[0];
      if (u.is_banned) {
        return res.status(403).json({ error: 'Your account has been deactivated/banned by Campus Admin.' });
      }
      return res.json({
        id: u.id,
        name: u.name,
        matricNumber: u.matric_number,
        studentId: u.student_id,
        email: u.email,
        role: u.role,
        isBanned: Boolean(u.is_banned)
      });
    }

    // Auto register new student in DB
    const userId = 'user-' + Date.now();
    const demoEmail = `${matricUpper.toLowerCase().replace(/\//g, '')}@student.oauife.edu.ng`;
    const role = (matricUpper === 'ADMIN' || matricUpper === 'ADMIN/OAU/001') ? 'admin' : 'student';

    await run(
      'INSERT INTO users (id, name, matric_number, student_id, email, password, role, is_banned) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, matricUpper, matricUpper, matricUpper, demoEmail, password || '', role, false]
    );

    res.json({ id: userId, name: matricUpper, matricNumber: matricUpper, studentId: matricUpper, email: demoEmail, role, isBanned: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Get All Items
app.get('/api/items', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM items ORDER BY created_at DESC');
    const items = rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      title: r.title,
      type: r.type,
      status: r.status,
      category: r.category,
      description: r.description,
      location: r.location,
      specificLocation: r.specific_location,
      date: r.date,
      time: r.time,
      reward: r.reward,
      image: r.image,
      isFlagged: Boolean(r.is_flagged),
      flagReason: r.flag_reason
    }));
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Submit New Item & Run AI Match Calculation
app.post('/api/items', async (req, res) => {
  try {
    const { title, type, category, description, location, specificLocation, date, time, reward, image, userId } = req.body;
    const itemId = 'item-' + Date.now();

    await run(
      'INSERT INTO items (id, user_id, title, type, status, category, description, location, specific_location, date, time, reward, image, is_flagged) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [itemId, userId || 'guest', title, type, 'active', category, description, location, specificLocation || '', date, time || '', reward || '', image || null, false]
    );

    const newItem = { id: itemId, userId: userId || 'guest', title, type, status: 'active', category, description, location, specificLocation, date, time, reward, image, isFlagged: false };

    // Run Jaro-Winkler AI Matching Engine against stored opposite items
    const oppositeRows = await query('SELECT * FROM items WHERE type != ? AND status = ?', [type, 'active']);
    let bestMatch = null;
    let highestScore = 0;

    for (const r of oppositeRows) {
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

      await run(
        'INSERT INTO matches (id, user_item_id, matched_item_id, matched_item_title, matched_item_location, matched_item_type, match_percentage, status, finder_name, chat_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [mockMatchId, itemId, bestMatch.id, bestMatch.title, bestMatch.location, bestMatch.type, highestScore, 'pending', 'Student Peer', mockChatId]
      );

      await run(
        'INSERT INTO conversations (id, title, match_id, unread_count, last_message_text, last_message_time) VALUES (?, ?, ?, ?, ?, ?)',
        [mockChatId, `Re: ${title}`, mockMatchId, 1, `Hi there! I think I have your ${title} or spotted it!`, 'Just now']
      );

      await run(
        'INSERT INTO messages (id, conversation_id, sender_id, sender_name, text, timestamp, is_read) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['m-' + Date.now(), mockChatId, 'user-remote', 'Student Peer', `Hi there! I think I have your ${title} or spotted it! Let me know when we can meet up.`, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), false]
      );

      const notifId = 'notif-' + Date.now();
      await run(
        'INSERT INTO notifications (id, user_id, title, message, timestamp, type, read, link_tab) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [notifId, userId || 'guest', 'AI Similarity Match Detected!', `Your report "${title}" has a ${highestScore}% Jaro-Winkler match with "${bestMatch.title}".`, 'Just now', 'match', false, 'dashboard']
      );

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
    const rows = await query('SELECT * FROM matches ORDER BY created_at DESC');
    const matches = rows.map(r => ({
      id: r.id,
      userItemId: r.user_item_id,
      matchedItemId: r.matched_item_id,
      matchedItemTitle: r.matched_item_title,
      matchedItemLocation: r.matched_item_location,
      matchedItemType: r.matched_item_type,
      matchPercentage: r.match_percentage,
      status: r.status,
      finderName: r.finder_name,
      chatId: r.chat_id
    }));
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Update Match Status
app.put('/api/matches/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await run('UPDATE matches SET status = ? WHERE id = ?', [status, req.params.id]);

    const matches = await query('SELECT * FROM matches WHERE id = ?', [req.params.id]);
    if (matches.length > 0) {
      const match = matches[0];
      const sysMsgId = 'sys-' + Date.now();
      const sysText = `[System Update]: Match has been ${status === 'confirmed' ? 'CONFIRMED' : 'REJECTED'} by the user.`;
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      await run(
        'INSERT INTO messages (id, conversation_id, sender_id, sender_name, text, timestamp, is_read) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [sysMsgId, match.chat_id, 'system', 'System', sysText, timeStr, true]
      );
      await run('UPDATE conversations SET last_message_text = ? WHERE id = ?', [`Match ${status}.`, match.chat_id]);
    }

    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Get Conversations & Messages
app.get('/api/conversations', async (req, res) => {
  try {
    const convRows = await query('SELECT * FROM conversations ORDER BY created_at DESC');
    const conversations = [];

    for (const c of convRows) {
      const msgRows = await query('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC', [c.id]);
      const messages = msgRows.map(m => ({
        id: m.id,
        senderId: m.sender_id,
        senderName: m.sender_name,
        text: m.text,
        timestamp: m.timestamp,
        isRead: Boolean(m.is_read)
      }));

      conversations.push({
        id: c.id,
        title: c.title,
        unreadCount: c.unread_count,
        lastMessageText: c.last_message_text,
        lastMessageTime: c.last_message_time,
        matchId: c.match_id,
        participants: [
          { id: 'user-peer', name: 'Student Peer', online: true }
        ],
        messages
      });
    }

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Send Chat Message
app.post('/api/conversations/:id/messages', async (req, res) => {
  try {
    const conversationId = req.params.id;
    const { text, senderName } = req.body;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = 'msg-user-' + Date.now();

    await run(
      'INSERT INTO messages (id, conversation_id, sender_id, sender_name, text, timestamp, is_read) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userMsgId, conversationId, 'me', senderName || 'Student', text, timeStr, true]
    );

    await run(
      'UPDATE conversations SET last_message_text = ?, last_message_time = ? WHERE id = ?',
      [text, 'Just now', conversationId]
    );

    // Smart auto responder simulation saved to DB
    setTimeout(async () => {
      let replyText = "Sure! Let's meet at one of the recommended safe exchange zones. Does the Library foyer work for you?";
      const lower = text.toLowerCase();
      if (lower.includes('hi') || lower.includes('hello')) {
        replyText = "Hey! Let's arrange a time to meet up and swap the item. Does tomorrow at 2pm at the library foyer work?";
      } else if (lower.includes('tomorrow') || lower.includes('time') || lower.includes('meet') || lower.includes('place')) {
        replyText = "Sounds perfect! I will be wearing a red jacket. See you there!";
      } else if (lower.includes('thank') || lower.includes('thanks')) {
        replyText = "You're very welcome! Glad I could help reunite you with your item. Have a wonderful day!";
      }

      const replyMsgId = 'msg-reply-' + Date.now();
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      await run(
        'INSERT INTO messages (id, conversation_id, sender_id, sender_name, text, timestamp, is_read) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [replyMsgId, conversationId, 'reply', 'Student Finder', replyText, replyTime, false]
      );
      await run(
        'UPDATE conversations SET last_message_text = ?, last_message_time = ? WHERE id = ?',
        [replyText, 'Just now', conversationId]
      );
    }, 1200);

    res.json({ success: true, messageId: userMsgId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Get Notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM notifications ORDER BY created_at DESC');
    const notifs = rows.map(r => ({
      id: r.id,
      title: r.title,
      message: r.message,
      timestamp: r.timestamp,
      type: r.type,
      read: Boolean(r.read),
      linkTab: r.link_tab
    }));
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/notifications/read-all', async (req, res) => {
  try {
    await run('UPDATE notifications SET read = ?', [true]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Admin Routes
app.get('/api/admin/users', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM users ORDER BY created_at DESC');
    const users = rows.map(u => ({
      id: u.id,
      name: u.name,
      matricNumber: u.matric_number,
      studentId: u.student_id,
      email: u.email,
      role: u.role,
      isBanned: Boolean(u.is_banned)
    }));
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/users/:id/ban', async (req, res) => {
  try {
    const users = await query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (users.length > 0) {
      const newBannedState = !users[0].is_banned;
      await run('UPDATE users SET is_banned = ? WHERE id = ?', [newBannedState, req.params.id]);
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
    await run('UPDATE items SET is_flagged = ?, flag_reason = ? WHERE id = ?', [true, reason || 'Flagged by user', req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/items/:id/dismiss-flag', async (req, res) => {
  try {
    await run('UPDATE items SET is_flagged = ? WHERE id = ?', [false, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/items/:id', async (req, res) => {
  try {
    await run('DELETE FROM items WHERE id = ?', [req.params.id]);
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
initDb().then(() => {
  if (!process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`[Express Backend] Campus Lost & Found API running on http://localhost:${PORT}`);
    });
  }
}).catch(err => {
  console.error('[Express Backend] Failed to start database:', err);
});

export default app;
