import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import NodeAuth from './auth/NodeAuth';
import { useSelector } from "react-redux";

const Header = () => {
  const { currentUser } = useSelector(
    (state) => {
      return state.authentication
    }
  );
  return (
    <div className="ui secondary pointing menu">
      <Link to="/" className="item">
        Streamy
      </Link>
      <div className="right menu">
        {
          currentUser &&
          <Menu>
            <MenuItem>
              <Link to="/dashboard" className="item">
                {currentUser.email}
              </Link>
            </MenuItem>
            <MenuItem>
              <Link to="/dashboard" className="item">
                Dashboard
                </Link>
            </MenuItem>
            <MenuItem>
              <Link to="/history" className="item">
                Order History
              </Link>
            </MenuItem>
          </Menu>
        }
        <NodeAuth />
      </div>
    </div>
  );
};

const Menu = styled.ul`
  list-style:none;
  margin:0;
  padding:0;
`;

const MenuItem = styled.li`
  margin: 0 0 0 0;
  padding: 0 0 0 0;
  border : 0;
  float: left;
`;

export default Header;
