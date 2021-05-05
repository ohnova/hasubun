const { updateData, readData } = require("../services/config");

exports.updateConfig = async function updateConfig(req, res, next) {
  try {
    const payload = req.body;
    console.log(payload);
    await updateData(payload);
    res.status(200).json({
      success: true,
      data: payload
    });
  } catch (error) {
    console.log(error);
  }
};
exports.readConfig = async function readConfig(req, res, next) {
  try {
    const payload = req.body;
    const data = await readData(payload);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.log(error);
  }
};

