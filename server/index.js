import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import PDFDocument from 'pdfkit'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = 3001
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'

// ── Database ──
// In Vercel serverless, use /tmp for writable storage
const dbPath = process.env.VERCEL
  ? '/tmp/data.sqlite'
  : join(__dirname, '..', 'data.sqlite')
const db = new Database(dbPath)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    dob TEXT,
    country TEXT,
    medical_notes TEXT DEFAULT '',
    quick_choices TEXT DEFAULT '[]',
    allergies TEXT DEFAULT '[]',
    avoid TEXT DEFAULT '[]',
    preferred TEXT DEFAULT '[]',
    spice_level TEXT DEFAULT '',
    special_notes TEXT DEFAULT '',
    password_hash TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS meals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER NOT NULL,
    meal_name TEXT NOT NULL,
    meal_time DATETIME NOT NULL,
    contexts TEXT DEFAULT '[]',
    preparation_styles TEXT DEFAULT '[]',
    triggers TEXT DEFAULT '[]',
    supports TEXT DEFAULT '[]',
    portion_size TEXT DEFAULT '',
    reaction TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profiles(id)
  );
`)

// ── Middleware ──
app.use(cors())
app.use(express.json())

// ── Helpers ──
function parseJsonField(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  try { return JSON.parse(value) } catch { return [] }
}

function profileToResponse(row) {
  if (!row) return null
  return {
    id: row.id,
    first_name: row.first_name,
    last_name: row.last_name,
    email: row.email,
    dob: row.dob,
    country: row.country,
    medical_notes: row.medical_notes || '',
    quick_choices: parseJsonField(row.quick_choices),
    allergies: parseJsonField(row.allergies),
    avoid: parseJsonField(row.avoid),
    preferred: parseJsonField(row.preferred),
    spice_level: row.spice_level || '',
    special_notes: row.special_notes || '',
  }
}

function authenticate(req, res, next) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET)
    req.userId = payload.id
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// ── Auth Routes ──
app.post('/api/login', (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const row = db.prepare('SELECT * FROM profiles WHERE email = ?').get(email)
  if (!row) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  if (!bcrypt.compareSync(password, row.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  const token = jwt.sign({ id: row.id }, JWT_SECRET, { expiresIn: '30d' })
  res.json({ token, user: profileToResponse(row) })
})

// ── Profile Routes ──
app.post('/api/profile', (req, res) => {
  const {
    first_name, last_name, email, password, dob, country, medical_notes,
    quick_choices, allergies, avoid, preferred, spice_level, special_notes,
  } = req.body

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' })
  }
  if (password.length < 10 || !/\d/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
    return res.status(400).json({ error: 'Password must be 10+ characters with a number and symbol' })
  }

  const existing = db.prepare('SELECT id FROM profiles WHERE email = ?').get(email)
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' })
  }

  const password_hash = bcrypt.hashSync(password, 10)

  const stmt = db.prepare(`
    INSERT INTO profiles (first_name, last_name, email, password_hash, dob, country, medical_notes,
      quick_choices, allergies, avoid, preferred, spice_level, special_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const result = stmt.run(
    first_name, last_name, email, password_hash, dob || '', country || '', medical_notes || '',
    JSON.stringify(quick_choices || []),
    JSON.stringify(allergies || []),
    JSON.stringify(avoid || []),
    JSON.stringify(preferred || []),
    spice_level || '',
    special_notes || '',
  )

  const row = db.prepare('SELECT * FROM profiles WHERE id = ?').get(result.lastInsertRowid)
  const token = jwt.sign({ id: row.id }, JWT_SECRET, { expiresIn: '30d' })
  res.json({ token, user: profileToResponse(row) })
})

app.get('/api/profile', authenticate, (req, res) => {
  const row = db.prepare('SELECT * FROM profiles WHERE id = ?').get(req.userId)
  if (!row) return res.status(404).json({ error: 'Profile not found' })
  res.json(profileToResponse(row))
})

app.put('/api/profile', authenticate, (req, res) => {
  const { quick_choices, allergies, avoid, preferred, spice_level, special_notes } = req.body

  db.prepare(`
    UPDATE profiles SET
      quick_choices = ?, allergies = ?, avoid = ?, preferred = ?,
      spice_level = ?, special_notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    JSON.stringify(quick_choices || []),
    JSON.stringify(allergies || []),
    JSON.stringify(avoid || []),
    JSON.stringify(preferred || []),
    spice_level || '',
    special_notes || '',
    req.userId,
  )

  const row = db.prepare('SELECT * FROM profiles WHERE id = ?').get(req.userId)
  res.json(profileToResponse(row))
})

// ── Meals Routes ──
app.post('/api/meals', authenticate, (req, res) => {
  const {
    meal_name, meal_time, contexts, preparation_styles,
    triggers, supports, portion_size, reaction, notes,
  } = req.body

  if (!meal_name || !meal_time) {
    return res.status(400).json({ error: 'Meal name and time are required' })
  }

  const result = db.prepare(`
    INSERT INTO meals (profile_id, meal_name, meal_time, contexts, preparation_styles,
      triggers, supports, portion_size, reaction, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.userId, meal_name, meal_time,
    JSON.stringify(contexts || []),
    JSON.stringify(preparation_styles || []),
    JSON.stringify(triggers || []),
    JSON.stringify(supports || []),
    portion_size || '',
    reaction || '',
    notes || '',
  )

  res.json({ success: true, id: result.lastInsertRowid })
})

// ── PDF Export ──
app.get('/api/profile/export', authenticate, (req, res) => {
  const row = db.prepare('SELECT * FROM profiles WHERE id = ?').get(req.userId)
  if (!row) return res.status(404).json({ error: 'Profile not found' })

  const profile = profileToResponse(row)

  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="dietary-profile.pdf"`)
  doc.pipe(res)

  // Title
  doc.fontSize(24).font('Helvetica-Bold').text('Dietary Profile', { align: 'center' })
  doc.moveDown(0.5)
  doc.fontSize(12).font('Helvetica').fillColor('#666')
    .text(`Generated ${new Date().toLocaleDateString('en-GB')}`, { align: 'center' })
  doc.moveDown(1.5)

  // Contact
  doc.fillColor('#333')
  const addSection = (title, content) => {
    doc.fontSize(14).font('Helvetica-Bold').text(title)
    doc.moveDown(0.3)
    doc.fontSize(11).font('Helvetica').text(content)
    doc.moveDown(1)
  }

  addSection('Name', `${profile.first_name} ${profile.last_name}`)
  addSection('Email', profile.email)
  if (profile.dob) addSection('Date of Birth', profile.dob)
  if (profile.country) addSection('Country', profile.country)

  if (profile.quick_choices.length > 0) {
    addSection('Dietary Labels', profile.quick_choices.join(', '))
  }
  if (profile.allergies.length > 0) {
    addSection('Allergies', profile.allergies.join(', '))
  }
  if (profile.avoid.length > 0) {
    addSection('Foods to Avoid', profile.avoid.join(', '))
  }
  if (profile.preferred.length > 0) {
    addSection('Preferred / Safe Foods', profile.preferred.join(', '))
  }
  if (profile.spice_level) {
    addSection('Spice Level', profile.spice_level)
  }
  if (profile.special_notes) {
    addSection('Special Notes', profile.special_notes)
  }
  if (profile.medical_notes) {
    addSection('Medical Notes', profile.medical_notes)
  }

  doc.end()
})

// ── Start (local dev only) ──
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

export default app
