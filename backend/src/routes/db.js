import { Router } from 'express';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const router     = Router();
const MONGO_URI  = process.env.MONGODB_URI;
const DB_NAME    = process.env.DB_NAME;
const BACKUP_DIR = path.join(__dirname, '../../backups');

if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);

const upload = multer({ dest: BACKUP_DIR });

// ── GET /api/db/backup ────────────────────────────────────────────────────────
router.get('/backup', (req, res) => {
    const timestamp = new Date().toISOString()
        .replace(/T/, '_')
        .replace(/:/g, '-')
        .split('.')[0];

    const filename   = `backup_${timestamp}.gz`;
    const outputPath = path.join(BACKUP_DIR, filename);

    const cmd = `mongodump --uri="${MONGO_URI}" --db=${DB_NAME} --archive="${outputPath}" --gzip`;

    console.log('Running backup cmd:', cmd);

    exec(cmd, (err, stdout, stderr) => {
        if (err) {
            console.error('Backup failed:', err.message);
            console.error('stderr:', stderr);
            return res.status(500).json({ message: 'Backup failed.', error: stderr });
        }

        if (!fs.existsSync(outputPath)) {
            return res.status(500).json({ message: 'Backup file not found after dump.' });
        }

        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/gzip');

        const stream = fs.createReadStream(outputPath);
        stream.pipe(res);

        res.on('finish', () => fs.unlink(outputPath, () => {}));
    });
});

// ── POST /api/db/restore ──────────────────────────────────────────────────────
router.post('/restore', upload.single('backup'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    const uploadedPath = req.file.path;

    // ✅ dry run with URI to detect DB name inside backup
    const dryRun = `mongorestore --uri="${MONGO_URI}" --archive="${uploadedPath}" --gzip --dryRun`;

    exec(dryRun, (dryErr, dryStdout, dryStderr) => {
        const output = dryStderr + dryStdout;

        console.log('=== DRY RUN FULL OUTPUT ===');
        console.log(output);
        console.log('=== END DRY RUN ===');

        // ✅ detect DB name from dry run output
        let nsFrom = null;
        const match = output.match(/preparing to restore index: { ns: "(\w+)\./);
        if (!match) {
            // try another pattern
            const match2 = output.match(/(\w+)\.\w+/g);
            if (match2) {
                // filter out known non-db words
                const ignore = ['preparing', 'restoring', 'finished', 'done', 'error'];
                for (const m of match2) {
                    const dbPart = m.split('.')[0];
                    if (!ignore.includes(dbPart)) {
                        nsFrom = dbPart;
                        break;
                    }
                }
            }
        } else {
            nsFrom = match[1];
        }

        console.log('Detected DB name in backup:', nsFrom);

        let cmd;
        if (nsFrom && nsFrom !== DB_NAME) {
            // ✅ remap old DB name to current DB name
            cmd = `mongorestore --uri="${MONGO_URI}" --nsFrom="${nsFrom}.*" --nsTo="${DB_NAME}.*" --archive="${uploadedPath}" --gzip --drop`;
        } else {
            // ✅ same DB name or couldn't detect, restore directly
            cmd = `mongorestore --uri="${MONGO_URI}" --db=${DB_NAME} --archive="${uploadedPath}" --gzip --drop`;
        }

        console.log('Running restore cmd:', cmd);

        exec(cmd, (err, stdout, stderr) => {
            fs.unlink(uploadedPath, () => {});

            if (err) {
                console.error('Restore failed:', err.message);
                console.error('stderr:', stderr);
                return res.status(500).json({ message: 'Restore failed.', error: stderr });
            }

            res.json({ message: 'Database restored successfully.' });
        });
    });
});

export default router;