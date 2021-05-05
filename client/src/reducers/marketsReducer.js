import _ from 'lodash';
import { FETCH_MARKET_ALL } from '../actions/types';

export default (state = {}, action) => {
  switch (action.type) {
    case FETCH_MARKET_ALL:
      const markets = _.filter(action.payload, (market) => {
        return (_.startsWith(market.market, 'KRW-'));
      })
      return { ...state, markets }
    default:
      return { ...state };
  }
}