import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const app = express();
const PORT = 3002;
const DB_FILE = path.resolve('profiles.json');

app.use(express.json({ limit: '10mb' }));

// CORS configuration to intercept cross-origin calls from Vite (port 3001)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type, apikey, authorization, prefer');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Helper functions for reading/writing JSON db
function readDatabase() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading profiles database:', e);
    return [];
  }
}

function writeDatabase(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing to profiles database:', e);
  }
}

// Log status on root
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Supabase local mock server is running.',
    port: PORT,
    recordsCount: readDatabase().length
  });
});

// GET profiles (supports filters like id=eq.UUID)
app.get('/rest/v1/profiles', (req, res) => {
  const db = readDatabase();
  const filterId = req.query.id as string;

  if (filterId && filterId.startsWith('eq.')) {
    const targetId = filterId.substring(3);
    const matched = db.find((item: any) => item.id === targetId);
    return res.json(matched ? [matched] : []);
  }

  res.json(db);
});

// POST profiles (inserts new profile)
app.post('/rest/v1/profiles', (req, res) => {
  const db = readDatabase();
  const payload = Array.isArray(req.body) ? req.body[0] : req.body;

  if (!payload) {
    return res.status(400).json({ error: 'Payload body missing' });
  }

  const newRecord = {
    id: crypto.randomUUID(),
    ...payload,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.push(newRecord);
  writeDatabase(db);

  console.log(`[Mock Server] Created record with ID: ${newRecord.id}`);

  // Return the representation if preferred
  const prefer = req.headers['prefer'] || '';
  if (prefer.includes('return=representation')) {
    return res.json([newRecord]);
  }

  // Fallback return for single selection or general requests
  res.json(newRecord);
});

// PATCH profiles (updates profile by id filter)
app.patch('/rest/v1/profiles', (req, res) => {
  const db = readDatabase();
  const filterId = req.query.id as string;

  if (!filterId || !filterId.startsWith('eq.')) {
    return res.status(400).json({ error: 'Filtering by specific ID (id=eq.UUID) is required for update' });
  }

  const targetId = filterId.substring(3);
  const index = db.findIndex((item: any) => item.id === targetId);

  if (index === -1) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  const payload = req.body;
  const updatedRecord = {
    ...db[index],
    ...payload,
    updated_at: new Date().toISOString()
  };

  db[index] = updatedRecord;
  writeDatabase(db);

  console.log(`[Mock Server] Updated record with ID: ${targetId}`);

  res.json(updatedRecord);
});

// DELETE profiles (deletes profile by id filter)
app.delete('/rest/v1/profiles', (req, res) => {
  const db = readDatabase();
  const filterId = req.query.id as string;

  if (!filterId || !filterId.startsWith('eq.')) {
    return res.status(400).json({ error: 'Filtering by specific ID (id=eq.UUID) is required for delete' });
  }

  const targetId = filterId.substring(3);
  const filtered = db.filter((item: any) => item.id !== targetId);

  if (db.length === filtered.length) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  writeDatabase(filtered);
  console.log(`[Mock Server] Deleted record with ID: ${targetId}`);

  res.json({ message: 'Deleted successfully', id: targetId });
});

app.listen(PORT, () => {
  console.log(`\x1b[32m➜  Local Mock Supabase Server running at http://localhost:${PORT}/\x1b[0m`);
});
