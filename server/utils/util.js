const _ = require('lodash');
const SMA = require('technicalindicators').SMA;
const actions = require('../actions');

exports.getOwnCoin = function getOwnCoin(market, accounts) {
  if (_.isEqual('*', market)) {
    const owncoins = _.reject(accounts, { currency: 'KRW' });
    return _.map(owncoins, (coin) => {
      return { market: `${coin.unit_currency}-${coin.currency}`, korean_name: '' };
    });
  }
  const currency = _.split(market, '-', 2)[1];
  const won = _.find(accounts, { currency: 'KRW' });
  const owncoin = _.find(accounts, { currency });
  return { owncoin, won };
};

exports.profitRate = function profitRate({ market, price }, accounts) {
  const currency = _.split(market, '-', 2)[1];
  const owncoin = _.find(accounts, { currency });
  if (_.isEmpty(owncoin))
    return 0;
  return (100 * (price - owncoin.avg_buy_price) / owncoin.avg_buy_price);
};

exports.isDayUptrend = async function isDayUptrend(market) {
  const oneDay = await actions.getDayCandles(market);
  // const time = oneDay[0].candle_date_time_kst;
  const inputs = {
    open: _.map(oneDay, 'opening_price'),
    high: _.map(oneDay, 'high_price'),
    low: _.map(oneDay, 'low_price'),
    close: _.map(oneDay, 'trade_price'),
    period: 20,
    reversedInput: true
  };
  const sma20 = await SMA.calculate({ period: 20, values: inputs.close, reversedInput: true });
  const sma60 = await SMA.calculate({ period: 60, values: inputs.close, reversedInput: true });

  // if (inputs.close[0] > sma20[0] && sma20[0] > sma60[0]) {
  //   console.log(`upTrend,true,${market},close,${inputs.close[0]},sma20,${sma20[0]},sma60,${sma60[0]}`);
  // } else {
  //   console.log(`upTrend,false,${market}`);
  // }
  return inputs.close[0] > sma20[0] && sma20[0] > sma60[0];
};

exports.bullishRate = function bullishRate(open, close) {
  return (100 * (close - open) / close);
};
