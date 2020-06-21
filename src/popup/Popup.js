import React, { useEffect, useState } from 'react';
import './Popup.css';
import Login from './auth/Login';
import Signup from './auth/Signup';
import { connect } from 'react-redux';
import { setToken } from '../store/auth/actions';


const AuthFlows = {
  LOGIN: 'LOGIN',
  SIGNUP: 'SIGNUP'
};

const Popup = ({
  token,
  receiveToken,
}) => {
  const [products, setProducts] = useState([]);
  const [authFlow, setAuthFlow] = useState(AuthFlows.LOGIN);
  const [userToken, setUserToken] = useState(token);

  useEffect(() => {
    window.chrome.runtime.onMessage.addListener((message) => {
      console.log('lisenter useEffect');
      if (message.type === 'CHECKOUT_INITIATED') {
        setProducts(message.data);
      }
    });
  }, []);

  const onReceiveToken = t => {
    setUserToken(t);
    receiveToken(t);
  };

  if (!userToken) {
    const Comp = authFlow === AuthFlows.LOGIN ? Login : Signup;
    return <Comp onReceiveToken={onReceiveToken} onToggleFlow={() => authFlow === AuthFlows.LOGIN ? setAuthFlow(AuthFlows.SIGNUP) : setAuthFlow(AuthFlows.LOGIN)}/>;
  }

  return (
    <div>
      {products.length > 0 ? <span>{products.data[0].product}</span>  : 'no checkout detected'}
    </div>
  );
};

const mapStateToProps = state => ({
  token: state.auth.token,
});

const mapDispatchToProps = dispatch => ({
  receiveToken: t => dispatch(setToken(t)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Popup);
