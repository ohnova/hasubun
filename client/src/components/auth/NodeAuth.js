import React from "react";
import { Link, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { signOut } from '../../actions';

const NodeAuth = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { currentUser } = useSelector((state) => state.authentication);

  const handleSignOut = () => {
    dispatch(signOut(history));
  };

  return (
    <div>
      {currentUser !== null ? (
        <li onClick={handleSignOut}>
          <Link to="/">Sign out</Link>
        </li>
      ) : (
        <div>
          <li>
            <Link to="/signin">SignIn</Link>
          </li>      
          {/* <li>
            <Link to="/signup">SignUp</Link>
          </li> */}
        </div>
      )}
    </div>
  );
};

export default NodeAuth;