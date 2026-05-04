import mongoose from 'mongoose';

const LowStockSettingSchema = new mongoose.Schema({
    lowStockQty: {
        type: Number,
        default: 10,
    },
});

export default mongoose.model('LowStockSetting', LowStockSettingSchema);