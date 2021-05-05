import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import DashBoard from './DashBoard';
import StreamEdit from './streams/StreamEdit';
import StreamDelete from './streams/StreamDelete';
import StreamList from './streams/StreamList';
import StreamShow from './streams/StreamShow';
import OrderHistory from './OrderHistory';
import Header from './Header';

import { UserRoute } from './auth/PrivateRoute';
import SignIn from './auth/Signin';
import SignUp from './auth/Signup';

const App = () => {
  return (
    <div className="ui container">
      <BrowserRouter>
        <div>
          <Header />
          <Route path="/" exact component={StreamList} />
          <Route path="/signin" exact component={SignIn} />
          <Route path="/signup" exact component={SignUp} />
          <Route path="/dashboard" exact component={DashBoard} />
          <Route path="/history" exact component={OrderHistory} />
          <UserRoute path="/streams/edit" exact component={StreamEdit} />
          <Route path="/streams/delete" exact component={StreamDelete} />
          <Route path="/streams/show" exact component={StreamShow} />
        </div>
      </BrowserRouter>
    </div>
  );
};

export default App;
