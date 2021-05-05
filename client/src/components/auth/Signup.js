import React, { useState } from "react";
import { useHistory } from "react-router-dom";
// import { Link, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { signUp } from '../../actions';

const Signin = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { error } = useSelector((state) => state.authentication);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };
  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSignUpClick = (event) => {
    event.preventDefault();
    dispatch(signUp({ email, password }, history));
  };

  return (
    <div className="mycard">
      <div className="card auth-card input-field">
        <input
          type="text"
          placeholder="email"
          value={email}
          onChange={handleEmailChange}
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={handlePasswordChange}
        />
        {error !== null ? <div className="error">{error}</div> : null}
        <button
          className="btn waves-effect waves-light #42a5f5 blue lighten-1"
          onClick={handleSignUpClick}
        >
          SignUp
        </button>
      </div>
    </div>
  );
};

export default Signin;