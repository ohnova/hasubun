const _ = require('lodash');
const axios = require('axios');
const fetch = require('node-fetch');
const request = require('request');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const queryEncode = require('querystring').encode;
// const logger = require('../utils/logger');

// const { EXCLUDE_INSPECT_LIST, FAKE_SELL, FAKE_BUY, ORDER_PRICE } = require( '../config/constants.js')
const constants = require('../constants');
const { getOwnCoin } = require('../utils/util.js');
// const Order = require('../model/order');
const keys = require('../keys');

const server_url = keys.UPBIT_OPEN_API_SERVER_URL;

exports.getAccounts = function getAccounts({ user, config }, callback) {
  if (constants.FAKE_ACCOUNTS) return callback(null, [{ "currency": "KRW", "balance": "1812339.68881619", "locked": "0.0", "avg_buy_price": "0", "avg_buy_price_modified": true, "unit_currency": "KRW" }, { "currency": "MVL", "balance": "2974.62333825", "locked": "0.0", "avg_buy_price": "12.6", "avg_buy_price_modified": false, "unit_currency": "KRW" }, { "currency": "ORBS", "balance": "23974.62333825", "locked": "0.0", "avg_buy_price": "143", "avg_buy_price_modified": false, "unit_currency": "KRW" }]);

  const payload = {
    access_key: config.accessKey,
    nonce: uuidv4(),
  };

  const token = jwt.sign(payload, config.secretKey);

  const options = {
    method: "GET",
    url: server_url + "/v1/accounts",
    headers: { Authorization: `Bearer ${token}` },
  };

  request(options, (error, response, body) => {
    if (error) throw new Error(error);
    const bodyJson = JSON.parse(body);
    /**
     * [{"currency":"KRW","balance":"1812339.68881619","locked":"0.0","avg_buy_price":"0","avg_buy_price_modified":true,"unit_currency":"KRW"},{"currency":"MVL","balance":"2974.62333825","locked":"0.0","avg_buy_price":"67.7","avg_buy_price_modified":false,"unit_currency":"KRW"}]
     */
    return callback(error, bodyJson);
  });
};

function sell({ market, user, config }, volume, percent) {
  // if (volume > 10000) volume = volume * percent / 100;
  const body = {
    market,
    side: 'ask',
    volume: volume * percent / 100,
    ord_type: 'market',
  };

  // logger.info(`sell,percent,${percent},volume,${volume}`);
  console.log(`sell,percent,${percent},volume,${volume}`);
  const query = queryEncode(body);

  const hash = crypto.createHash('sha512');
  const queryHash = hash.update(query, 'utf-8').digest('hex');

  const payload = {
    access_key: config.accessKey,
    nonce: uuidv4(),
    query_hash: queryHash,
    query_hash_alg: 'SHA512',
  };

  const token = jwt.sign(payload, config.secretKey);

  const options = {
    method: "POST",
    url: server_url + "/v1/orders",
    headers: { Authorization: `Bearer ${token}` },
    json: body
  };

  request(options, (error, response, body) => {
    if (error) throw new Error(error);
    if (body.uuid) {
      // const order = new Order({
      //   uuid: body.uuid,
      //   userId: user._id
      // });
      // order.save();
    }
    console.log(body);
  });
}

function buy({ market, user, config }, price) {

  const body = {
    market,
    side: 'bid',
    price,
    ord_type: 'price',
  };

  const query = queryEncode(body);

  const hash = crypto.createHash('sha512');
  const queryHash = hash.update(query, 'utf-8').digest('hex');

  const payload = {
    access_key: config.accessKey,
    nonce: uuidv4(),
    query_hash: queryHash,
    query_hash_alg: 'SHA512',
  };

  const token = jwt.sign(payload, config.secretKey);

  const options = {
    method: "POST",
    url: server_url + "/v1/orders",
    headers: { Authorization: `Bearer ${token}` },
    json: body
  };

  request(options, (error, response, body) => {
    if (error) throw new Error(error);
    if (body.uuid) {
      // const order = new Order({
      //   uuid: body.uuid,
      //   userId: user._id
      // });
      // order.save();
    }
    console.log(body);
  });
}

exports.getCandles = async function getCandles(market, mins, count = 40) {
  const url = `${server_url}/v1/candles/minutes/${mins}?`;
  const options = { method: 'GET' };
  const params = new URLSearchParams({
    market,
    count: String(count)
  });
  const response = await fetch(url + params, options);
  const candles = await response.json();
  return candles;
};

exports.getMarkets = async function getMarkets(isExperiment, callback) {
  if (isExperiment) {
    callback(null, [{ market: 'KRW-MVL', korean_name: '엠블' }]);
  } else {
    const url = `${server_url}/v1/market/all?`;
    const params = new URLSearchParams({ isDetails: 'false' });
    const options = { method: 'GET' };
    try {
      const response = await fetch(url + params, options);
      const markets = await response.json();

      return _.filter(markets, (market) => {
        // return (_.startsWith(market.market, 'KRW-') && !_.includes(config.excludeMarkets, market.market));
        return (_.startsWith(market.market, 'KRW-'));
      });
    } catch (err) {
      return callback(err);
    }
  }
};

const getAccounts = this.getAccounts;

exports.order = function order({ market, side, user, config, force }, percent = 100) {
  if (constants.FAKE_SELL && _.isEqual(side, 'ask')) return;
  if (constants.FAKE_BUY && _.isEqual(side, 'bid')) return;

  getAccounts({ user, config }, (error, bodyJson) => {
    if (error) throw new Error(error);
    console.log(config.maxMarket, bodyJson.length);
    /**
     * [{"currency":"KRW","balance":"1812339.68881619","locked":"0.0","avg_buy_price":"0","avg_buy_price_modified":true,"unit_currency":"KRW"},{"currency":"MVL","balance":"2974.62333825","locked":"0.0","avg_buy_price":"67.7","avg_buy_price_modified":false,"unit_currency":"KRW"}]
     */
    const { owncoin, won } = getOwnCoin(market, bodyJson);
    console.log(owncoin);
    if (_.isEmpty(owncoin)) {
      // 없으니 살것
      if (config.maxMarket < bodyJson.length) return;
      if (side === 'bid' && won.balance > config.firstBuyMoney) {
        buy({ market, user, config }, String(config.firstBuyMoney));
      }
    } else {
      // 있으니 팔것
      if (side === 'ask') {
        // 전체 다 매도
        sell({ market, user, config }, owncoin.balance, percent);
      } else if (side === 'bid' && force && won.balance > config.secondBuyMoney) {
        // 물타기 용도
        buy({ market, user, config }, String(config.secondBuyMoney));
      }
    }
  });
};

exports.getDayCandles = async function getDayCandles(market, count = 60) {
  const url = `${server_url}/v1/candles/days?`;
  const options = { method: 'GET' };
  const params = new URLSearchParams({
    market,
    count: String(count)
  });
  const response = await fetch(url + params, options);
  const candles = await response.json();
  return candles;
};

exports.fetchOrders = function fetchOrders({ userId, config }) {
  // Order.find({ userId })
  //   .exec()
  //   .then((orders) => {
  //     const state = 'done';
  //     const uuids = _.map(orders, order => order.uuid);

  //     const non_array_body = {
  //       state: state,
  //     };
  //     const array_body = {
  //       uuids: uuids,
  //     };
  //     const body = {
  //       ...non_array_body,
  //       ...array_body
  //     };

  //     const uuid_query = uuids.map(uuid => `uuids[]=${uuid}`).join('&');
  //     const query = queryEncode(non_array_body) + '&' + uuid_query;

  //     const hash = crypto.createHash('sha512');
  //     const queryHash = hash.update(query, 'utf-8').digest('hex');

  //     const payload = {
  //       access_key: config.accessKey,
  //       nonce: uuidv4(),
  //       query_hash: queryHash,
  //       query_hash_alg: 'SHA512',
  //     };

  //     const token = jwt.sign(payload, config.secretKey);

  //     const options = {
  //       method: "GET",
  //       url: server_url + "/v1/orders?" + query,
  //       headers: { Authorization: `Bearer ${token}` },
  //       json: body
  //     };

  //     request(options, (error, response, body) => {
  //       if (error) throw new Error(error);
  //       console.log(body);
  //       return body;
  //     });
  //   });
};
