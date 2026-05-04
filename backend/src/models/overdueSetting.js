import mongoose from 'mongoose';

const overdueSettingSchema = new mongoose.Schema({
  overdueDays: { type: Number, default: 7 },
}, { timestamps: true });

const OverdueSetting = mongoose.model('OverdueSetting', overdueSettingSchema);
export default OverdueSetting;