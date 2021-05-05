const _ = require('lodash');
const actions = require('../actions');
// const { NUM_MINUITES, EXCLUDE_ORDER_LISTS } = require('../constants');
const SMA = require('technicalindicators').SMA;
// const Highest = require('technicalindicators').Highest;
// const ATR = require('technicalindicators').ATR;
const RSI = require('technicalindicators').RSI;
const MACD = require('technicalindicators').MACD;
// const logger = require('../utils/logger');
const { isDayUptrend, bullishRate } = require('../utils/util.js');

function isExistPullbackMarket({ user, market }) {
  return _.includes(user.pullback, market);
}

// function getPullbackMarket(market) {
//   return _.find(global.pullbackMarkets, { market });
// }

async function addPullbackMarket({ user, market }) {
  user.pullback.push(market);
  await user.save();
}

async function removePullbackMarket({ user, market }) {
  user.pullback.pull(market);
  await user.save();
}

// function updatePullbackMarket(item) {
//   global.pullbackMarkets = _.reject(global.pullbackMarkets, { market: item.market });
//   global.pullbackMarkets.push(item);
// }

function isInExcludeLists({market, config}) {
  return _.includes(config.excludeMarkets, market);
}

async function inspectPullback({ market, user, config, accounts }, callback) {
  if ((config.dayUptrend && !isDayUptrend(market)) || !market) return callback();

  try {
    // 5분봉 고정.
    const candles = await actions.getCandles(market, 5, 121);
    const time = candles[0].candle_date_time_kst;
    const inputs = {
      open: _.map(candles, 'opening_price'),
      high: _.map(candles, 'high_price'),
      low: _.map(candles, 'low_price'),
      close: _.map(candles, 'trade_price'),
      period: 20,
      reversedInput: true
    };
    const macdInput = {
      values: inputs.close,
      fastPeriod: 14,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false,
      reversedInput: true
    };

    if (isInExcludeLists({market, config})) {
      console.log(`Exclude List in! : ${market}`);
      return callback();
    }

    // const sma5 = await SMA.calculate({ period: 5, values: inputs.close, reversedInput: true });
    // const sma10 = await SMA.calculate({ period: 10, values: inputs.close, reversedInput: true });
    const sma20 = await SMA.calculate({ period: 20, values: inputs.close, reversedInput: true });
    const sma50 = await SMA.calculate({ period: 50, values: inputs.close, reversedInput: true });
    // const sma60 = await SMA.calculate({ period: 60, values: inputs.close, reversedInput: true });
    const sma120 = await SMA.calculate({ period: 120, values: inputs.close, reversedInput: true });
    // 정배열 초입 종목!!
    // if (sma5[0] > sma10[0] && sma10[0] > sma20[0] &&
    //   sma20[0] > sma60[0] && sma60[0] > sma120[0] &&
    //   sma5[1] > sma10[1] && sma10[1] > sma20[1] &&
    //   sma20[1] < sma60[1] && sma60[1] > sma120[1] &&
    //   inputs.close[0] > inputs.open[0]) {
    //   console.log(`${time},정배열초입!!,Buy,${market},시장가,${inputs.close[0]}}`);
    // }

    // 세개 이평선이 모두 정배열이고 0봉 종가가 20에서 50사이에 있는게 모두 만족해야 하는 조건
    if (sma20[1] > sma50[1] && sma50[1] > sma120[1]) {
      // console.log(`${time},${market},${sma20[1]} > ${sma50[1]} && ${sma50[1]} > ${sma120[1]}`);
      // 조건에 부합했던 market이 있는 경우
      // console.log(`${time},${market},정배열,${user.pullback}`);
      if (isExistPullbackMarket({ user, market })) {
        // 전고점 저장 안하므로 불필요
        // const pullbackMarket = getPullbackMarket(market);

        // 전고점이 저장되어 있지 않은 경우
        // if (!pullbackMarket.highest) {
        // 양봉으로 20선 뚫는 지 확인
        // console.log(`${time},${market},close,${inputs.close[1]},sma20,${sma20[1]}`);
        // 시가는 20선과 50선 사이에 있고 종가가 20선 위에 있을때
        if (inputs.open[1] > sma50[1] && sma20[1] > inputs.open[1] &&
          inputs.close[1] > sma20[1]) {
          // 전고점 조사 및 저장
          // const highest = Highest.calculate({ values: inputs.high, period: 20, reversedInput: true });
          // console.log(`${time},${market},highest,${highest[0]}`);
          // updatePullbackMarket({ market, highest: highest[0] });
          // ** 전고점 필요없이 그냥 여기서 사!!!
          // const atr = await ATR.calculate(inputs);
          const macd = await MACD.calculate(macdInput);
          const rsi = await RSI.calculate({ values: inputs.close, period: 14, reversedInput: true });

          // const boughtMarket = { ...pullbackMarket, highest: highest[0], lose: inputs.close[0] - atr[0] };
          // updatePullbackMarket(boughtMarket);

          if (rsi[0] >= 50 && 
            macd[0].histogram > macd[1].histogram &&
            macd[0].histogram > 0 &&
            bullishRate(inputs.open[0], inputs.close[0]) < 3 ) {
            // 샀으면 삭제하자
            await removePullbackMarket({ user, market });
            // console.log(`${time},${market},Buy,시장가,${inputs.close[0]},rsi,${rsi[0]},macd[0],${macd[0].histogram},macd[1],${macd[1].histogram}`);
            actions.order({ market, side: 'bid', user, config, accounts });
          } else {
            // console.log(`${time},${market},조건불만족,시장가,${inputs.close[0]},rsi,${rsi[0]},macd,${macd[0].histogram},macd[1],${macd[1].histogram}`);
          }
        }
        // 50선 아래로 떨어질 경우 관심종목 삭제
        else if (sma50[1] > inputs.close[1]) {
          // console.log(`${time},50이탈,${market},1봉종가,${inputs.close[1]}`);
          await removePullbackMarket({ user, market });
        }
        // }
        /*
        // 전고점이 저장되어 있어서 종가가 전고점을 돌파했는지 조사
        else if (inputs.close[1] > pullbackMarket.highest) {
          // 돌파했다면 손절, 익절값 저장하고 매수
          const atr = ATR.calculate(inputs);
          const boughtMarket = { ...pullbackMarket, lose: inputs.close[0] - atr[0] };
          updatePullbackMarket(boughtMarket);
          console.log(`${time},Buy,전고점돌파,${JSON.stringify(boughtMarket)}`);
          actions.order({ market, side: 'bid' });
        }
        */
        // 어쨌거나 손절 조건에 있는 경우
        // if (pullbackMarket.lose && pullbackMarket.lose > inputs.close[0]) {
        //   actions.order({ market, side: 'ask' });
        //   console.log(`${time},Sell,손절,${JSON.stringify(pullbackMarket)},0봉종가,${inputs.close[0]}`);
        //   removePullbackMarket({ market });
        // }
      } else {
        // 시가는 20선 밖에 있고 종가가 20선과 50선 사이에 있을때
        if (inputs.open[1] > sma20[1] &&
          sma20[1] > inputs.close[1] && inputs.close[1] > sma50[1]) {
          // entry market으로 선정
          await addPullbackMarket({ user, market });
          // console.log(`${time},entry,${market},open,${inputs.open[1]},close,${inputs.close[1]},markets,${user.pullback}`);
        }
      }
    } else {
      // 조건에 부합했던 market이 있는 경우, 조건이 벗어났으므로 삭제
      if (isExistPullbackMarket({ user, market })) {
        // console.log(`${time},정배열깨짐,${market}`);
        await removePullbackMarket({ user, market });
      }
    }
    // owncoin이 아니면 triger로 팔아린 것이니 삭제해줄 것
  } catch (error) {
    console.log(error);
  }
  return callback();
}

exports.inspectPullback = inspectPullback;