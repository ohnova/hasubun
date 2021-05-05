import React, { Component } from 'react';
import { connect } from "react-redux";

// import { fetchOrders } from '../actions';

class OrderHistory extends Component {
  componentDidMount() {
    // this.props.currentUser && this.props.fetchOrders(this.props.currentUser._id);
  }

  render() {
    return (
      <div>
        미구현
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    currentUser: state.authentication.currentUser
  }
}

export default connect(mapStateToProps, null)(OrderHistory);
// export default connect(mapStateToProps, { fetchOrders })(OrderHistory);