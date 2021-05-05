import axios from "axios";
import Swal from 'sweetalert2';

import {
  SIGN_IN_FAILURE,
  SIGN_IN_REQUEST,
  SIGN_IN_SUCCESS,
  SIGN_UP_FAILURE,
  SIGN_UP_REQUEST,
  SIGN_UP_SUCCESS,
  SIGN_OUT_FAILURE,
  SIGN_OUT_REQUEST,
  SIGN_OUT_SUCCESS,
  FETCH_CONFIG,
  FETCH_MARKET_ALL
} from "./types";

// const API = axios.create({
//   baseURL: process.env.REACT_APP_API_URL,
// })

//Sign up action creators
const signUpRequest = () => {
  return {
    type: SIGN_UP_REQUEST,
  };
};
const signUpSuccess = (user) => {
  return {
    type: SIGN_UP_SUCCESS,
    payload: {
      user,
    },
  };
};
const signUpFailure = (error) => {
  return {
    type: SIGN_UP_FAILURE,
    payload: error,
  };
};

export const signUp = (user, history) => {
  return function (dispatch) {
    dispatch(signUpRequest());
    axios({
      method: "post",
      url: "/api/signUp",
      data: user,
    })
      .then((response) => {
        const { data } = response.data;
        dispatch(signUpSuccess(data));
        history.push("/dashboard");
      })
      .catch((error) => {
        console.log(error);
        dispatch(signUpFailure(error));
      });
  };
};

//Sign in action creators
const signInRequest = () => {
  return {
    type: SIGN_IN_REQUEST,
  };
};
const signInSuccess = (user) => {
  return {
    type: SIGN_IN_SUCCESS,
    payload: {
      token: user.token,
      user
    },
  };
};
const signInFailure = (error) => {
  return {
    type: SIGN_IN_FAILURE,
    payload: error,
  };
};

export const signIn = (payload, history) => {
  return function (dispatch) {
    dispatch(signInRequest);
    axios({
      method: "post",
      url: "/api/signIn",
      data: payload,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("USER-TOKEN")}`,
      },
    })
      .then((response) => {
        const user = response.data;
        localStorage.setItem("USER-TOKEN", user.token);
        dispatch(signInSuccess(user));
        history.push("/dashboard");
      })
      .catch((error) => {
        console.log(error);
        dispatch(signInFailure(error));
      });
  };
};

//sign out action creators
export const signOutRequest = function () {
  return {
    type: SIGN_OUT_REQUEST,
  };
};

export const signOutSuccess = function () {
  return {
    type: SIGN_OUT_SUCCESS,
  };
};

export const signOutFailure = function () {
  return {
    type: SIGN_OUT_FAILURE,
  };
};

export const signOut = function (history) {
  return function (dispatch) {
    dispatch(signOutRequest());
    localStorage.clear();
    history.push("/signin");
    if (localStorage.getItem("USER_TOKEN")) {
      dispatch(signOutFailure());
    } else {
      dispatch(signOutSuccess());
    }
  };
};

export const updateConfig = function (payload) {
  return function (dispatch) {
    // dispatch(updateConfigRequest());
    axios({
      method: "post",
      url: "/api/updateConfig",
      data: payload,
    })
      .then((response) => {
        const { data } = response.data;
        Swal.fire('저장 성공!', '설정이 변경되었습니다.', 'success');
        // dispatch(signUpSuccess(data));
        // history.push("/");
      })
      .catch((error) => {
        console.log(error);
        Swal.fire('오류발생', '뭔가 잘못됨.... 연락바람..', error);
      });
  }
}

export const readConfig = id => dispatch => {
  axios({
    method: "post",
    url: "/api/readConfig",
    data: { _id: id },
  })
    .then((response) => {
      const { data } = response.data;
      dispatch({ type: FETCH_CONFIG, payload: data[0] });
    })
    .catch((error) => {
      console.log(error);
    });
}

export const fetchMarketsAll = function () {
  return function (dispatch) {
    axios({
      method: 'get',
      url: 'https://api.upbit.com/v1/market/all?isDetails=false'
    })
    .then((response) => {
      const { data } = response;
      dispatch({ type: FETCH_MARKET_ALL, payload: data });
    })
    .catch((error) => {
      console.log(error);
    });
  }
}
// export const fetchOrders = id => dispatch => {
//   axios({
//     method: "post",
//     url: "/api/readOrders",
//     data: { _id: id },
//   })
//     .then((response) => {
//       const { data } = response.data;
//       console.log(data);
//       // dispatch({ type: FETCH_CONFIG, payload: data[0] });
//     })
//     .catch((error) => {
//       console.log(error);
//     });
// }