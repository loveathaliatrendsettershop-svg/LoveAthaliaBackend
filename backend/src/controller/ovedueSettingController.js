import OverdueSetting from '../models/overdueSetting.js';

export const getOverdueSetting = async (req, res) => {
  try {
    let setting = await OverdueSetting.findOne();
    if (!setting) setting = await OverdueSetting.create({ overdueDays: 7 });
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOverdueSetting = async (req, res) => {
  try {
    const { overdueDays } = req.body;
    if (!overdueDays || overdueDays < 1)
      return res.status(400).json({ message: 'overdueDays must be at least 1' });

    let setting = await OverdueSetting.findOne();
    if (!setting) setting = await OverdueSetting.create({ overdueDays });
    else { setting.overdueDays = overdueDays; await setting.save(); }

    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};