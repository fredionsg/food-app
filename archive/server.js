const path = require('path');
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const PDFDocument = require('pdfkit');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'data.sqlite');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, err => {
  if (err) {
    console.error('Failed to connect to database', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      dob TEXT NOT NULL,
      country TEXT NOT NULL,
      medical_notes TEXT,
      quick_choices TEXT NOT NULL,
      allergies TEXT NOT NULL,
      avoid TEXT NOT NULL,
      preferred TEXT NOT NULL,
      spice_level TEXT NOT NULL,
      special_notes TEXT,
      password_hash TEXT,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`
  );
  db.run('ALTER TABLE profiles ADD COLUMN password_hash TEXT', err => {
    if (err && !String(err.message).includes('duplicate column name')) {
      console.warn('Could not add password_hash column:', err.message);
    }
  });
  db.run(
    `CREATE TABLE IF NOT EXISTS meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL,
      meal_name TEXT NOT NULL,
      meal_time TEXT NOT NULL,
      contexts TEXT,
      preparation_styles TEXT,
      triggers TEXT,
      supports TEXT,
      portion_size TEXT,
      reaction TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    )`
  );
  db.run('CREATE INDEX IF NOT EXISTS idx_meals_profile ON meals(profile_id)');
});

const mapArray = value => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return value.split(',').map(v => v.trim()).filter(Boolean);
    }
  }
  return [];
};

const normalizeArray = value => {
  if (Array.isArray(value)) {
    return value.map(item => String(item || '').trim()).filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) {
    return [value.trim()];
  }
  return [];
};

app.get('/api/profile', (req, res) => {
  const { email } = req.query || {};
  const sql = email
    ? 'SELECT * FROM profiles WHERE email = ? ORDER BY updated_at DESC LIMIT 1'
    : 'SELECT * FROM profiles ORDER BY updated_at DESC LIMIT 1';
  const params = email ? [email] : [];

  db.get(sql, params, (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to load profile' });
      return;
    }
    if (!row) {
      res.json(null);
      return;
    }

    res.json({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      dob: row.dob,
      country: row.country,
      medicalNotes: row.medical_notes || '',
      quickChoices: mapArray(row.quick_choices),
      allergies: mapArray(row.allergies),
      avoid: mapArray(row.avoid),
      preferred: mapArray(row.preferred),
      spiceLevel: row.spice_level,
      specialNotes: row.special_notes || ''
    });
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email?.trim() || !password?.trim()) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  db.get('SELECT * FROM profiles WHERE email = ? LIMIT 1', [email.trim()], (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to verify login.' });
      return;
    }
    const hash = crypto.createHash('sha256').update(password.trim()).digest('hex');
    if (!row || row.password_hash !== hash) {
      res.status(401).json({ error: 'Login failed. Check your email and password.' });
      return;
    }

    res.json({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      dob: row.dob,
      country: row.country,
      medicalNotes: row.medical_notes || '',
      quickChoices: mapArray(row.quick_choices),
      allergies: mapArray(row.allergies),
      avoid: mapArray(row.avoid),
      preferred: mapArray(row.preferred),
      spiceLevel: row.spice_level,
      specialNotes: row.special_notes || ''
    });
  });
});

app.post('/api/profile', (req, res) => {
  const {
    firstName,
    lastName,
    email,
    dob,
    country,
    medicalNotes = '',
    quickChoices = [],
    allergies = [],
    avoid = [],
    preferred = [],
    spiceLevel,
    specialNotes = '',
    password
  } = req.body || {};

  const errors = [];
  if (!firstName?.trim()) errors.push('First name is required.');
  if (!lastName?.trim()) errors.push('Last name is required.');
  if (!email?.trim()) errors.push('Email is required.');
  if (!dob?.trim()) errors.push('Date of birth is required.');
  if (!country?.trim()) errors.push('Country is required.');
  if (!Array.isArray(quickChoices) || quickChoices.length === 0) errors.push('Select at least one quick choice.');
  if (!Array.isArray(allergies) || allergies.length === 0) errors.push('Add at least one allergy.');
  if (!Array.isArray(avoid) || avoid.length === 0) errors.push('Add at least one food to avoid.');
  if (!Array.isArray(preferred) || preferred.length === 0) errors.push('Add at least one preferred food.');
  if (!spiceLevel?.trim()) errors.push('Select a spice level.');
  if (!password?.trim()) {
    errors.push('Password is required.');
  } else {
    const pass = password.trim();
    const hasNumber = /\d/.test(pass);
    const hasSymbol = /[^A-Za-z0-9]/.test(pass);
    if (pass.length < 10 || !hasNumber || !hasSymbol) {
      errors.push('Password must be at least 10 characters and include a number and a symbol.');
    }
  }

  if (errors.length) {
    res.status(400).json({ errors });
    return;
  }

  const payload = {
    $first: firstName.trim(),
    $last: lastName.trim(),
    $email: email.trim(),
    $dob: dob.trim(),
    $country: country.trim(),
    $medical: medicalNotes.trim(),
    $quick: JSON.stringify(quickChoices),
    $allergies: JSON.stringify(allergies),
    $avoid: JSON.stringify(avoid),
    $preferred: JSON.stringify(preferred),
    $spice: spiceLevel.trim(),
    $notes: specialNotes.trim(),
    $pass: crypto.createHash('sha256').update(password.trim()).digest('hex')
  };

  const upsert = `INSERT INTO profiles
    (first_name, last_name, email, dob, country, medical_notes, quick_choices, allergies, avoid, preferred, spice_level, special_notes, password_hash, updated_at)
    VALUES ($first, $last, $email, $dob, $country, $medical, $quick, $allergies, $avoid, $preferred, $spice, $notes, $pass, CURRENT_TIMESTAMP)
    ON CONFLICT(email) DO UPDATE SET
      first_name=excluded.first_name,
      last_name=excluded.last_name,
      dob=excluded.dob,
      country=excluded.country,
      medical_notes=excluded.medical_notes,
      quick_choices=excluded.quick_choices,
      allergies=excluded.allergies,
      avoid=excluded.avoid,
      preferred=excluded.preferred,
      spice_level=excluded.spice_level,
      special_notes=excluded.special_notes,
      password_hash=excluded.password_hash,
      updated_at=CURRENT_TIMESTAMP`;

  db.run(upsert, payload, function (err) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to save profile' });
      return;
    }

    const id = this.lastID || null;
    res.json({ success: true, id });
  });
});

app.post('/api/meals', (req, res) => {
  const {
    email,
    mealName,
    mealTime,
    contexts = [],
    preparationStyles = [],
    triggers = [],
    supports = [],
    portionSize = '',
    reaction = '',
    notes = ''
  } = req.body || {};

  const errors = [];
  if (!mealName?.trim()) errors.push('Meal name is required.');
  if (!mealTime?.trim()) errors.push('Meal time is required.');
  if (errors.length) {
    res.status(400).json({ errors });
    return;
  }

  const cleanEmail = email?.trim();
  const lookupSql = cleanEmail
    ? 'SELECT id FROM profiles WHERE email = ? LIMIT 1'
    : 'SELECT id FROM profiles ORDER BY updated_at DESC LIMIT 1';
  const lookupParams = cleanEmail ? [cleanEmail] : [];

  db.get(lookupSql, lookupParams, (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to look up user.' });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'No profile found for this email. Complete setup before logging meals.' });
      return;
    }

    const insert = `INSERT INTO meals
      (profile_id, meal_name, meal_time, contexts, preparation_styles, triggers, supports, portion_size, reaction, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`;

    const params = [
      row.id,
      mealName.trim(),
      mealTime.trim(),
      JSON.stringify(normalizeArray(contexts)),
      JSON.stringify(normalizeArray(preparationStyles)),
      JSON.stringify(normalizeArray(triggers)),
      JSON.stringify(normalizeArray(supports)),
      portionSize ? portionSize.trim() : '',
      reaction ? reaction.trim() : '',
      notes ? notes.trim() : ''
    ];

    db.run(insert, params, function (insertErr) {
      if (insertErr) {
        console.error(insertErr);
        res.status(500).json({ error: 'Failed to save meal.' });
        return;
      }
      res.json({ success: true, id: this.lastID });
    });
  });
});

app.get('/api/profile/export', (req, res) => {
  const { email } = req.query || {};
  const sql = email
    ? 'SELECT * FROM profiles WHERE email = ? ORDER BY updated_at DESC LIMIT 1'
    : 'SELECT * FROM profiles ORDER BY updated_at DESC LIMIT 1';
  const params = email ? [email] : [];

  db.get(sql, params, (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to load profile.' });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'No profile found.' });
      return;
    }

    const profile = {
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      dob: row.dob,
      country: row.country,
      medicalNotes: row.medical_notes || '',
      quickChoices: mapArray(row.quick_choices),
      allergies: mapArray(row.allergies),
      avoid: mapArray(row.avoid),
      preferred: mapArray(row.preferred),
      spiceLevel: row.spice_level,
      specialNotes: row.special_notes || '',
      updatedAt: row.updated_at
    };

    const errors = [];
    ['firstName', 'lastName', 'email', 'dob', 'country'].forEach(field => {
      if (!profile[field] || !String(profile[field]).trim()) {
        errors.push(`${field} is missing. Please complete setup.`);
      }
    });
    if (!profile.quickChoices.length) errors.push('Select at least one quick choice in setup.');
    if (!profile.allergies.length) errors.push('Add at least one allergy in setup.');
    if (!profile.avoid.length) errors.push('Add at least one food to avoid in setup.');
    if (!profile.preferred.length) errors.push('Add at least one preferred food in setup.');
    if (!profile.spiceLevel || !profile.spiceLevel.trim()) errors.push('Choose a spice level in setup.');

    if (errors.length) {
      res.status(400).json({ error: errors.join(' ') });
      return;
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="dietary-profile.pdf"');

    const doc = new PDFDocument({ margin: 48 });
    doc.pipe(res);

    doc.fontSize(20).text('Dietary Profile', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`);
    doc.moveDown();

    doc.text('Contact information', { underline: true });
    doc.moveDown(0.5);
    doc.text(`Name: ${profile.firstName} ${profile.lastName}`);
    doc.text(`Email: ${profile.email}`);
    doc.text(`Date of birth: ${profile.dob}`);
    doc.text(`Country/Region: ${profile.country}`);
    if (profile.medicalNotes) {
      doc.text(`Medical notes: ${profile.medicalNotes}`);
    }
    doc.moveDown();

    const bullet = '\u2022';
    const renderList = (title, items) => {
      doc.text(title, { underline: true });
      doc.moveDown(0.5);
      if (!items.length) {
        doc.text(`${bullet} None provided`);
      } else {
        items.forEach(item => doc.text(`${bullet} ${item}`));
      }
      doc.moveDown();
    };

    renderList('Quick choices', profile.quickChoices);
    renderList('Allergies', profile.allergies);
    renderList('Foods to avoid', profile.avoid);
    renderList('Preferred / safe foods', profile.preferred);

    doc.text('Spice level', { underline: true });
    doc.moveDown(0.5);
    doc.text(`${bullet} ${profile.spiceLevel}`);
    doc.moveDown();

    doc.text('Special notes', { underline: true });
    doc.moveDown(0.5);
    if (profile.specialNotes) {
      doc.text(profile.specialNotes);
    } else {
      doc.text(`${bullet} None provided`);
    }

    doc.end();
  });
});

process.on('SIGINT', () => {
  db.close();
  process.exit();
});

app.listen(PORT, () => {
  console.log(`Food app dev server listening on http://localhost:${PORT}`);
});
















