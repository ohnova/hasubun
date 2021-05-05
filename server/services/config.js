const User = require('../model/user.js');
const Config = require('../model/config.js');

exports.updateData = function updateData(payload) {
  return Config.findOne({ userId: payload.user._id })
    .exec()
    .then((config) => {
      if (!config) {
        const newConfig = new Config({
          userId: payload.user._id,
          ...payload.configs
        });
        return newConfig.save();
      } else {
        Config.updateOne(
          { _id: config._id },
          { ...payload.configs }
        ).exec()
          .then((updateConfig) => {

            return updateConfig;
          });
      }
    });
};
exports.readData = function readData({ _id }) {
  return Config.find({ userId: _id })
    .exec()
    .then((config) => {
      if (!config) {
        return { configs: {} };
      } else {
        return { ...config };
      }
    });
};
