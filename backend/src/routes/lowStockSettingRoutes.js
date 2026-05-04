import { Router } from 'express';
import LowStockSetting from '../models/LowStockSetting.js';

const router = Router();

// ── GET /api/lowstocksetting ──────────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        let setting = await LowStockSetting.findOne();

        // If no setting exists yet, create a default one
        if (!setting) {
            setting = await LowStockSetting.create({ lowStockQty: 10 });
        }

        res.json(setting);
    } catch (err) {
        console.error('Failed to fetch low stock setting:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ── PUT /api/lowstocksetting ──────────────────────────────────────────────────
router.put('/', async (req, res) => {
    try {
        const { lowStockQty } = req.body;

        if (!lowStockQty || lowStockQty < 1) {
            return res.status(400).json({ message: 'Invalid quantity.' });
        }

        let setting = await LowStockSetting.findOne();

        if (!setting) {
            setting = await LowStockSetting.create({ lowStockQty });
        } else {
            setting.lowStockQty = lowStockQty;
            await setting.save();
        }

        res.json(setting);
    } catch (err) {
        console.error('Failed to update low stock setting:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;