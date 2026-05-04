import express from 'express';
import { getOverdueSetting, updateOverdueSetting } from '../controller/ovedueSettingController.js';

const router = express.Router();
router.get('/', getOverdueSetting);
router.put('/', updateOverdueSetting);
export default router;