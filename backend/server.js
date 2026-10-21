import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import multer from 'multer';
import { requireAuth } from './middleware/auth.js';
import { pool } from './db.js';
import { sendMail } from './mailer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Ensure uploads folder exists
await fs.mkdir(UPLOADS_DIR, { recursive: true });

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded images publicly
app.use('/uploads', express.static(UPLOADS_DIR));

// --- Multer config ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb) => {
    const allowed = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only JPG, PNG, WEBP, GIF images or MP4, WEBM, MOV videos are allowed'));
    }
    cb(null, true);
  },
});

// =====================================================================
// AUTH
// =====================================================================

app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password || password.length < 8) {
    return res.status(400).json({ error: 'Email and a password of at least 8 characters are required' });
  }

  try {
    const existing = await pool.query('SELECT 1 FROM admin_users WHERE email = $1', [email]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ error: 'An account with that email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO admin_users (email, password_hash, is_verified, verification_token, verification_expires)
       VALUES ($1, $2, false, $3, $4)`,
      [email, passwordHash, verificationToken, verificationExpires]
    );

    const verifyLink = `${FRONTEND_URL}/admin/verify-email?token=${verificationToken}`;
    await sendMail({
      to: email,
      subject: 'Verify your admin account',
      html: `<p>Click the link below to verify your admin account:</p>
             <p><a href="${verifyLink}">${verifyLink}</a></p>
             <p>This link expires in 1 hour.</p>`,
    });

    res.json({ success: true, message: 'Account created. Check your email to verify it before logging in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.get('/api/verify-email', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Missing token' });

  try {
    const { rows } = await pool.query(
      `SELECT id FROM admin_users
       WHERE verification_token = $1 AND verification_expires > now()`,
      [token]
    );
    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired verification link' });
    }

    await pool.query(
      `UPDATE admin_users
       SET is_verified = true, verification_token = NULL, verification_expires = NULL
       WHERE id = $1`,
      [rows[0].id]
    );

    res.json({ success: true, message: 'Email verified — you can now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const { rows } = await pool.query('SELECT * FROM admin_users WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = rows[0];
    if (!user.is_verified) {
      return res.status(403).json({ error: 'Please verify your email before logging in' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({ success: true, token, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/verify-password', requireAuth, async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password is required' });

  try {
    const { rows } = await pool.query('SELECT password_hash FROM admin_users WHERE id = $1', [req.user.id]);
    if (rows.length === 0) return res.status(401).json({ error: 'User not found' });

    const match = await bcrypt.compare(password, rows[0].password_hash);
    if (!match) return res.status(401).json({ error: 'Incorrect password' });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  const genericResponse = {
    success: true,
    message: 'If that email exists, a reset link has been sent.',
  };

  if (!email) return res.json(genericResponse);

  try {
    const { rows } = await pool.query('SELECT id FROM admin_users WHERE email = $1', [email]);
    if (rows.length === 0) return res.json(genericResponse);

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query(
      `UPDATE admin_users SET reset_token = $1, reset_expires = $2 WHERE id = $3`,
      [resetToken, resetExpires, rows[0].id]
    );

    const resetLink = `${FRONTEND_URL}/admin/reset-password?token=${resetToken}`;
    await sendMail({
      to: email,
      subject: 'Reset your admin password',
      html: `<p>Click the link below to reset your password:</p>
             <p><a href="${resetLink}">${resetLink}</a></p>
             <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>`,
    });

    res.json(genericResponse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.post('/api/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password || password.length < 8) {
    return res.status(400).json({ error: 'A valid token and a password of at least 8 characters are required' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT id FROM admin_users WHERE reset_token = $1 AND reset_expires > now()`,
      [token]
    );
    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query(
      `UPDATE admin_users
       SET password_hash = $1, reset_token = NULL, reset_expires = NULL
       WHERE id = $2`,
      [passwordHash, rows[0].id]
    );

    res.json({ success: true, message: 'Password updated — you can now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Reset failed' });
  }
});

// =====================================================================
// CONTENT + UPLOADS
// =====================================================================

app.post('/api/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/uploads/${req.file.filename}`;
  const type = ALLOWED_VIDEO_TYPES.includes(req.file.mimetype) ? 'video' : 'image';
  res.json({ url, type });
});

app.get('/api/content', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT page, data FROM content');
    const content = {};
    for (const row of rows) content[row.page] = row.data;
    // Hide the homepage announcement once it has expired (admin can still re-date it).
    const notice = content.home?.notice;
    if (notice && (!notice.expiresAt || new Date(notice.expiresAt).getTime() <= Date.now())) {
      content.home = { ...content.home, notice: {} };
    }
    res.json(content);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load content' });
  }
});

app.put('/api/content/:page', requireAuth, async (req, res) => {
  const { page } = req.params;
  try {
    const existing = await pool.query('SELECT 1 FROM content WHERE page = $1', [page]);
    if (existing.rowCount === 0) {
      return res.status(404).json({ error: `Unknown page: ${page}` });
    }

    const { rows } = await pool.query(
      `UPDATE content SET data = $2, updated_at = now()
       WHERE page = $1
       RETURNING data`,
      [page, req.body]
    );
    res.json({ success: true, page: rows[0].data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save content' });
  }
});

// =====================================================================
// MESSAGES (Connect form)
// =====================================================================

app.post('/api/messages', async (req, res) => {
  const { firstName, lastName, email, message } = req.body;

  if (!email || !message || !message.trim()) {
    return res.status(400).json({ error: 'Email and message are required' });
  }

  try {
    await pool.query(
      `INSERT INTO messages (first_name, last_name, email, message)
       VALUES ($1, $2, $3, $4)`,
      [firstName || '', lastName || '', email, message]
    );
    res.json({ success: true, message: 'Thank you — your message has been sent!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.get('/api/messages', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

app.patch('/api/messages/:id/read', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE messages SET is_read = true WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

app.delete('/api/messages/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM messages WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// =====================================================================
// EVENT REGISTRATIONS
// =====================================================================

app.post('/api/events/register', async (req, res) => {
  const { eventId, eventTitle, fullName, nationality, phone } = req.body;

  if (!eventTitle || !fullName?.trim() || !phone?.trim()) {
    return res.status(400).json({ error: 'Full name, phone number, and event are required' });
  }

  try {
    await pool.query(
      `INSERT INTO event_registrations (event_id, event_title, full_name, nationality, phone)
       VALUES ($1, $2, $3, $4, $5)`,
      [eventId || eventTitle, eventTitle, fullName.trim(), nationality || '', phone.trim()]
    );
    res.json({ success: true, message: "You're registered! We look forward to seeing you there." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register for this event' });
  }
});

app.get('/api/events/registrations', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM event_registrations ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load event registrations' });
  }
});

app.delete('/api/events/registrations/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM event_registrations WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete registration' });
  }
});

// =====================================================================
// ERROR HANDLER + START
// =====================================================================

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File is too large (50MB max).' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message || 'Upload failed' });
  }
  next();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));