const _ = require('lodash');
const actions = require('../actions');
const { profitRate } = require("../utils/util.js");
const keys = require("../keys");

// Redis Client Setup
const redis = require("redis");

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});

async function setTriggerMarket({ user, market, profit }) {
  console.log(`SET trigger ${user.email}, ${market}, ${profit}`);
  await redisClient.hmset(user._id.toString(), {
    market,
    profit
  });
}

function getTriggerMarket({ user }) { 
  return new Promise((resolve, reject) => {
    redisClient.hgetall(user._id.toString(), (err, object) => {
      if (err) {
        reject(err);
      } else {
        resolve(object);
      }
    });
  });
}

async function delTriggerMarket({ user }) {
  await redisClient.del(user._id.toString());
}

async function trigger({ user, config, accounts, orderInfo }) {
  const { market, price } = orderInfo;
  if (config.plusTrigger <= 0 || !config.plusTrigger) return null;

  const newProfit = profitRate({ market, price }, accounts);
  // 해당 유저에게 이미 트리거된 종목이 있는가?
  // const triggerMarket = _.find(user.trigger, { market });
  const triggerMarket = await getTriggerMarket({ user }).then((result) => result);
  const highestProfit = triggerMarket ? parseFloat(triggerMarket.profit) : 0;
  console.log(`${market},triggering check, highest profit ${highestProfit}`);
  if (highestProfit) {
    // 이미 트리거된 종목이 있다면
    console.log(`${market},triggerMarket.cur - newProfit > config.downProfit,${highestProfit} - ${newProfit} > ${config.downProfit}`);
    if (highestProfit > newProfit) {
      if (highestProfit - newProfit >= config.downProfit) {
        await delTriggerMarket({ user, market });
        console.log(`Triggering sell,${market}`);
        actions.order({ market, side: 'ask', user, config, accounts }, config.getProfit);
      }
    } else {
      await setTriggerMarket({ user, market, profit: newProfit });
    }
  } else if (newProfit > config.plusTrigger) {
    await setTriggerMarket({ user, market, profit: newProfit });
    console.log(`Triggering,newProfit,${newProfit}`);
  }
  // 손실이면 물탐
  console.log(`${market},${user.email},firstMinusProfit,${config.firstMinusProfit},newProfit,${newProfit}`);
  if (0 > config.firstMinusProfit && newProfit <= config.firstMinusProfit) {
    console.log(`Add water,${market},${user.email},firstMinusProfit,${config.firstMinusProfit},newProfit,${newProfit}`);
    actions.order({ market, side: 'bid', user, config, force: true });
  }
}

module.exports = trigger;

