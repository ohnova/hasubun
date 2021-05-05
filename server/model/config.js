const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  serverRun: {
    type: Boolean,
    required: false,
    default: false
  },
  dayUptrend: {
    type: Boolean,
    required: false
  },
  baseCandle: {
    type: Number,
    required: false,
    default: 60
  },
  firstBuyMoney: {
    type: Number,
    required: false,
    default: 10000
  },
  bidTime: {
    type: String,
    required: false,
    default: 'pullback'
  },
  firstMinusProfit: {
    type: Number,
    required: false,
    default: -30
  },
  secondBuyMoney: {
    type: Number,
    required: false,
    default: 10000
  },
  secondMinusProfit: {
    type: Number,
    required: false
  },
  plusTrigger: {
    type: Number,
    default: 6
  },
  plusProfit: {
    type: Number,
    required: false
  },
  downProfit: {
    type: Number,
    default: 2
  },
  getProfit: {
    type: Number,
    default: 100
  },
  maxMarket: {
    type: Number,
    required: false,
    default: 8
  },
  accessKey: {
    type: String,
    required: false
  },
  secretKey: {
    type: String,
    required: false
  },
  excludeMarkets: {
    type: [String]
  }
});

module.exports = mongoose.model("Config", configSchema);