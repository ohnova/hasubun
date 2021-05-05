const { createUser, signInUser } = require('../services/user.js');

exports.signUp = async function signUp(req, res, next) {
  try {
    const newUser = req.body;
    const savedUser = await createUser(newUser);

    res.status(200).json({
      success: true,
      data: savedUser,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.signIn = async function signIn(req, res, next) {
  try {
    const payload = req.body;
    const user = await signInUser(payload);
    res.status(200).json({
      success: true,
      ...user
    });
  } catch (error) {
    console.log(error);
  }
};


