import { Router } from 'express';
import multer from 'multer';
import mongoose from 'mongoose';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// ── GET /api/db/backup ────────────────────────────────────────────────────────
router.get('/backup', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    const backup = {};
    for (const col of collections) {
      const name = col.name;
      backup[name] = await db.collection(name).find({}).toArray();
    }

    const timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
    const filename  = `backup_${timestamp}.json`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(backup, null, 2));

  } catch (err) {
    console.error('Backup failed:', err);
    res.status(500).json({ message: 'Backup failed.', error: err.message });
  }
});

// ── POST /api/db/restore ──────────────────────────────────────────────────────
router.post('/restore', upload.single('backup'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

  try {
    const data = JSON.parse(req.file.buffer.toString('utf8'));
    const db   = mongoose.connection.db;

    for (const [collectionName, documents] of Object.entries(data)) {
      if (!Array.isArray(documents) || documents.length === 0) continue;
      const col = db.collection(collectionName);
      await col.deleteMany({});
      await col.insertMany(documents);
    }

    res.json({ message: 'Database restored successfully.' });
  } catch (err) {
    console.error('Restore failed:', err);
    res.status(500).json({ message: 'Restore failed.', error: err.message });
  }
});

export default router;
