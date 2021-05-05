const express = require('express');

const { signUp, signIn } = require('../controller/user.js');
const { updateConfig, readConfig } = require("../controller/config");
//const { readOrders } = require("../controller/order");

const router = express.Router();

router.post("/signUp", signUp);
router.post("/signIn", signIn);
router.post("/updateConfig", updateConfig);
router.post("/readConfig", readConfig);
// router.post("/readOrders", readOrders);

module.exports = router;