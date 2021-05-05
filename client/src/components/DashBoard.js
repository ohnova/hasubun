import _ from 'lodash';
import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { connect } from "react-redux";
import Multiselect from 'react-widgets/Multiselect'
import "react-widgets/styles.css";

import { updateConfig, readConfig, fetchMarketsAll } from '../actions';

const minutes = [60];
class DashBoard extends Component {
  componentDidMount() {
    // const { currentUser } = useSelector((state) => state.authentication);
    this.props.currentUser && this.props.readConfig(this.props.currentUser._id);
    this.props.fetchMarketsAll();
  }

  renderTextField = ({
    label,
    input,
    meta: { touched, invalid, error },
    ...custom
  }) => (
    <TextField
      label={label}
      placeholder={label}
      error={touched && invalid}
      helperText={touched && error}
      {...input}
      {...custom}
    />
  )

  renderCheckbox = ({ input, label }) => (
    <div>
      <FormControlLabel
        control={
          <Checkbox
            checked={input.value ? true : false}
            onChange={input.onChange}
          />
        }
        label={label}
      />
    </div>
  )

  renderMultiselect = ({ input, data, dataKey, textField }) => (
    <Multiselect {...input}
      onBlur={() => input.onBlur()}
      value={input.value || []} // requires value to be an array
      data={data}
      dataKey={dataKey}
      textField={textField}
      renderListItem={
        ({item}) =>
          <span>
            <strong>{item}</strong>
            {" " + _.find(this.props.markets, { market: item }).korean_name }
          </span>
      }
    />
  );

  render() {
    const { pristine, reset, submitting, classes, configs, currentUser } = this.props;
    const handleSubmit = (event) => {
      event.preventDefault();
      this.props.updateConfig({ user: currentUser, configs })
    }
    return (
      <form onSubmit={handleSubmit}>
        <div>
          <Field name="serverRun" component={this.renderCheckbox} label="Server running" />
        </div>
        {/* <div>
          <label>분봉 기준</label>
          <Field name="baseCandle" component="select">
            <option value="">몇분봉 기준으로 할지...</option>
            {minutes.map(minOption => (
              <option value={minOption} key={minOption}>
                {minOption}
              </option>
            ))}
          </Field>
        </div> */}
        <br />
        <div>
          <label>한종목당 처음 사는 금액</label>
          <Field name="firstBuyMoney" component="input" type="number" placeholder="처음 매수 금액" />
        </div>
        <br />
        <div>
          <label>매수타이밍</label>
          <div>
            <label>
              <Field name="bidTime" component="input" type="radio" value="pullback" />{' '}
            5분봉 20선,50선위에서 눌림목 발생 + rsi 50이상 + macd 상승돌파시
          </label>
            {/* <label>
              <Field name="bidTime" component="input" type="radio" value="habb" disabled />{' '}
            하이킨 아시 캔들에서 볼린저밴드 돌파
          </label>
            <label>
              <Field name="bidTime" component="input" type="radio" value="minusMacd" disabled />{' '}
            MACD 0 이하에서 시그널 상향돌파시
          </label>
            <label>
              <Field name="bidTime" component="input" type="radio" value="allMacd" disabled />{' '}
            MACD 전구간에서 시그널 상향돌파시
          </label> */}
          </div>
          <div>
            <Field name="dayUptrend" component={this.renderCheckbox} label="일봉이 20선,60선 위에 있는 종목만 적용" />
          </div>
        </div>
        <br />
        <div>
          <label>*매도감시* 평단가에서 </label>
          <Field name="plusTrigger" component="input" type="number" placeholder="" step="0.1" />
          <label>% 상승 트리거 된 후,</label>
          {/* <Field name="plusProfit" component="input" type="number" placeholder="" disabled />
          <label>% 익절</label> */}
          <Field name="downProfit" component="input" type="number" placeholder="" step="0.1" />
          <label>% 하락시 </label>
          <Field name="getProfit" component="input" type="number" placeholder="" />
          <label>% 이익실현</label>
        </div>
        <div>
        <br />
          <Field name="firstMinusProfit" component="input" type="number" placeholder="" step="0.1" />
          <label>% 손실시 (음수값이어야 함 '-'추가 필요!!!) </label>
          <Field name="secondBuyMoney" component="input" type="number" placeholder="" />
          <label>원 물탐 </label>
          {/* <Field name="secondMinusProfit" component="input" type="number" placeholder="" disabled />
          <label>% 손실시 손절</label> */}
        </div>
        {/* <div>
          <Field name="plusProfit" component="input" type="number" placeholder="" disabled />
          <label>% 수익시 익절</label>
        </div> */}
        <br />
        <div>
          <label>최대 종목 수</label>
          <Field name="maxMarket" component="input" type="number" placeholder="최대종목수" />
        </div>
        <br />
          <label>자동매매 제외 종목 선택</label>
          <Field
            name="excludeMarkets"
            component={this.renderMultiselect}
            data={_.map(this.props.markets, market => market.market)}
            // data={this.props.markets}
            textField="market"
            dataKey="market"
          />
          {/* <Field
            name="excludeMarkets"
            component={Multiselect}
            defaultValue={this.props.configs ? this.props.configs.excludeMarkets : []}
            onBlur={() => this.props.onBlur()}
            data={this.props.markets}
            onChange={() => console.log('onChange')}
            onSelect={() => console.log('onSelect')}
            dataKey="market"
            textField="market"
            renderListItem={
            ({item}) => 
              <span>
                <strong>{item.market}</strong>
                {" " + item.korean_name}
              </span>
          }
          /> */}
        <br />
        <div>
          <label>ACCESS KEY</label>
          <Field
            name="accessKey"
            component="input"
            type="text"
            placeholder="Access Key"
          />
        </div>
        <div>
          <label>SECRET KEY</label>
          <Field
            name="secretKey"
            component="input"
            type="text"
            placeholder="Secret Key"
          />
        </div>
        <div>
          <button type="submit" disabled={pristine || submitting}>
            Submit
      </button>
        </div>
      </form>
    );
  }
}


// const mapStateToProps = (state, ownProps) => {
//   return { stream: state.streams[ownProps.match.params.id] };
// };

function mapStateToProps(state) {
  return {
    currentUser: state.authentication.currentUser,
    configs: state.form.ConfigForm && state.form.ConfigForm.values,
    markets: state.fetched.markets,
    initialValues: state.config
  }
}

export default connect(mapStateToProps, { updateConfig, readConfig, fetchMarketsAll })(reduxForm({
  form: 'ConfigForm',
  enableReinitialize: true
})(DashBoard));
