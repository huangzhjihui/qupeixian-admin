const { Config } = require('../models');
const { success, error } = require('../utils/response');

const getSettings = async (req, res) => {
  try {
    const settings = await Config.findAll();
    
    const result = {};
    settings.forEach(setting => {
      try {
        result[setting.key] = JSON.parse(setting.value);
      } catch {
        result[setting.key] = setting.value;
      }
    });

    success(res, result);
  } catch (err) {
    console.error('Get settings error:', err);
    error(res, '获取设置失败', 500);
  }
};

const saveSettings = async (req, res) => {
  try {
    const data = req.body;

    for (const [key, value] of Object.entries(data)) {
      const setting = await Config.findOne({ where: { key } });
      const valueStr = typeof value === 'object' ? JSON.stringify(value) : value;
      
      if (setting) {
        await setting.update({ value: valueStr });
      } else {
        await Config.create({ key, value: valueStr });
      }
    }

    success(res, null, '设置保存成功');
  } catch (err) {
    console.error('Save settings error:', err);
    error(res, '保存设置失败', 500);
  }
};

module.exports = {
  getSettings,
  saveSettings
};
