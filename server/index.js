const _ = require('lodash');
const cron = require('node-cron');
const async = require('async');
const mongoose = require('mongoose');

// Express App Setup
const express = require("express");
const cors = require("cors");

const constants = require('./constants');
const keys = require("./keys");
const authRouter = require('./router/auth.js');
const User = require('./model/user.js');
const Config = require('./model/config.js');
const trailing = require('./strategy/trailing.js');
const { getAccounts, getMarkets } = require('./actions');
const { getOwnCoin } = require('./utils/util.js');
const { inspectPullback } = require('./strategy/inspect_pullback.js');

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(keys.mongoURI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected MongoDB");
  })
  .catch((err) => console.log("Error", err));

app.use("/", authRouter);

app.listen(5000, (err) => {
  console.log("Listening");
});

async function startTask() {
  async.mapSeries(User.find({}), function iteratee(user, callback) {
    Config.findOne({ userId: user._id }, (err, cf) => {
      if (cf !== null && cf.serverRun) {
        getAccounts({ user, config: cf }, (err, accounts) => {
          if (err) return console.log(err);
          getMarkets(constants.JUST_ONE_MARKET, (err, markets) => {
            if (err) return console.log(err);
            async.mapSeries(markets, function iteratee(market, cb) {
              setTimeout(() => {
                // console.log(market);
                inspectPullback(market, { user, config: cf, accounts }, cb);
                // inpectHeikinBB(market, { user, config: cf, accounts }, cb);
              }, constants.INSPECT_INTERVAL);
            }, function (err, results) {
              if (err) {
                console.log(err);
              }
              callback && callback();
            });
          });
        });
      } else {
        callback && callback();
      }
    });
  }, function (err, results) {
    if (err) {
      console.log(err);
    }
    // if (!constant.JUST_ONE_TIME) startTask();
  });
}

if (constants.JUST_ONE_TIME) {
  startTask();
} else {
  cron.schedule('*/5 * * * *', () => {
    startTask();
  });
}

async function startTrailingTask() {
  async.mapSeries(User.find({}), function iteratee(user, callback) {
    Config.findOne({ userId: user._id }, (err, cf) => {
      if (cf !== null && cf.serverRun) {
        getAccounts({ user, config: cf }, (err, accounts) => {
          if (_.has(accounts, 'error')) {
            console.log(accounts);
            return callback();
          }
          const markets = getOwnCoin('*', accounts);
          async.mapSeries(markets, function iteratee(market, cb) {
            setTimeout(() => {
              !_.isEmpty(market) && trailing(market, { user, config: cf, accounts }, cb);
            }, constants.TRIGGERING_INTERVAL);
          }, function (err, results) {
            if (err) {
              console.log(err);
            }
            callback && callback();
          });

        });
      } else {
        callback && callback();
      }
    });
  }, function (err, results) {
    if (err) {
      console.log(err);
    }
    startTrailingTask();
  });
}

startTrailingTask();
