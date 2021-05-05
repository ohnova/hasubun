const _ = require('lodash');
const actions = require('../actions');
const trigger = require('./trigger');

async function trailing({ market, korean_name }, { user, config, accounts }, callback) {
  function isInExcludeLists(market) {
    return _.includes(config.excludeMarkets, market);
  }

  if (isInExcludeLists(market)) {
    return callback();
  }

  try {
    const oneHour = await actions.getCandles(market, 60, 1);
    if (_.has(oneHour, 'error')) {
      console.log('skip trailing for error', market);
      return callback();
    }
    const hour0 = oneHour[0];
    const orderInfo = {
      candle_date_time_kst: hour0.candle_date_time_kst,
      market,
      korean_name,
      price: hour0.trade_price
    };
    trigger({ user, config, accounts, orderInfo });
  } catch (error) {
    console.log(error);
  }

  return callback();
}

module.exports = trailing;