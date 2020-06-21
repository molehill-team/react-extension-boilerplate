import React, { useEffect, useState } from 'react';
import './Popup.css';
import { login } from '../shared/api';
import { checkStatus } from '../shared/utils';
import { connect } from 'react-redux';
import { setToken } from '../store/auth/actions';


const Login = ({
  onReceiveToken=() => {},
}) => {

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    login({ email: emailInput, password: passwordInput })
      .then(checkStatus)
      .then(({ user: { token }}) => onReceiveToken(token));
  };

  return (
    <form onSubmit={onSubmit}>
      <label htmlFor="login-email--input">email</label>
      <input type="email" id="login-email--input" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} />
      <label htmlFor="login-password--input">password</label>
      <input type="password" id="login-password--input" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} />
      <button type="submit" onClick={onSubmit}>Login</button>
    </form>
  );
};

const Popup = ({
  token,
  receiveToken,
}) => {
  const [products, setProducts] = useState([]);
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
    return <Login onReceiveToken={onReceiveToken} />;
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
